import { DefaultColors, BasicConsole, ControlSequences } from "../Engine/ConsoleHelp.js";
import { AlgoFactory, AlgorithmModels } from "../Algorthims/AlgoFactory.js";
import { logger } from "../Engine/Logger.js";
import { TaskStates, Task } from "./Tasks.js";
const CH = new BasicConsole();

class SoftAffinityController {
    constructor() {
        this.softAffinity = {}; // Map to store soft core affinities
    }
    #getKey(task) {
        const instance = task.instance ? task.instance : 0; // Use instance number if available, otherwise default to 0
        return `${task.id}#${instance}`; // Unique key for the task based on ID and instance
    }
    setAffinity(task, coreId) {
        if (task instanceof Task === false) {
            logger.error("Task is not an instance of Task class");
        }
        if (coreId < 0 || coreId >= this.numProcessors) {
            logger.error(`Invalid core ID: ${coreId}. Must be between 0 and ${this.numProcessors - 1}.`);
            return;
        }
        logger.log(`Setting affinity for task ${this.#getKey(task)} to core ${coreId}`);
        this.softAffinity[this.#getKey(task)] = coreId; // Set the core affinity for the task
    }
    getAffinity(task) {
        if (!(task instanceof Task)) {
            logger.error("Task is not an instance of Task class");
            return undefined;
        }
        const key = this.#getKey(task);
        logger.log(`Getting affinity for task ${key}: ${this.softAffinity[key]}`);
        logger.log(`Soft Affinity Map: ${JSON.stringify(this.softAffinity)}`);
        return this.softAffinity[this.#getKey(task)]; // Return the core affinity for the task or undefined if not set
    }
}


/**
 * Represents a snapshot of the scheduler's state at a specific point in time.
 */
class SchedulerSnapshot {
    /**
     * Creates an instance of SchedulerSnapshot.
     * 
     * @param {number} t - The current time in time units.
     * @param {string} model - The name of the scheduling algorithm used.
     * @param {number} numProcessors - The number of processors available.
     * @param {Array} currentTasks - An array of tasks currently running on each processor.
     * @param {Array} tasks - An array of all tasks in the system.
     * @param {Array} validTasks - An array of tasks that are valid for scheduling.
     * @param {number} contextSwitches - The number of context switches that occurred up to this time.
     * @param {number} tasksMigrations - The number of task migrations that occurred up to this time.
    */
    constructor(props) {
        for (const key in props) {
            this[key] = props[key];
        }
    }
}


class Scheduler {
    #taskIDs = 0;
    constructor() {
        this.numProcessors = 1;
        this.startingTasks = [];
        this.tasks = [];
        this.currentTasks = Array(1);
        this.lastValidTasks = [];
        this.model = AlgoFactory.createAlgorithm(AlgorithmModels.SJF, { timeQuantum: 1 }); // Default algorithm
        this.t = 0; // initial time in time units
        this.softAffinity = new SoftAffinityController(); // controller for soft core affinities
        this.contextSwitches = 0; // number of total context switches
        this.tasksMigrations = 0; // number of task migrations
        this.tasksFailed = 0; // number of tasks that failed (missed their deadline)
        this.reduceTaskMigration = false; // flag to reduce task migrations
        this.newTaskConfig = {
            enablePinToCore: true, // Enable pinning tasks to cores
            enableDeadTasks: false, // Enable tasks with deadlines greater than burst time
            maxBurstTime: 10, // Maximum burst time for random tasks
        };
    }
    // Configures the scheduler with the provided configuration object.
    // if config is null or undefined, it throws an error.
    configure(config) {
        if (!config) {
            console.log("config: ", config);
            throw new Error("Invalid configuration object");
            process.exit(1);
        }
        const getValue = (name, defaultValue) => {
            const value = config.find(item => item.name === name)?.value;
            return value !== undefined ? value : defaultValue;
        }
        this.newTaskConfig.enablePinToCore = getValue("Enable core pinning", true); // Enable pinning tasks to cores
        this.newTaskConfig.enableDeadTasks = getValue("Allow dead tasks", false); // Enable tasks with deadlines greater than burst time
        this.newTaskConfig.maxBurstTime = getValue("Max Burst Time", 10); // Maximum burst time for random tasks
        this.numProcessors = getValue("Processors", 1); // number of processors
        this.reduceTaskMigration = getValue("Reduce task migration", false); // flag to reduce task migrations
        this.lastValidTasks = [];
        this.model = AlgoFactory.createAlgorithm(getValue("Scheduler Algorithm", AlgorithmModels.FCFS), { timeQuantum: getValue("Time Quantum", 1) }); // Default algorithm
        this.t = 0;
        this.#taskIDs = 0; // reset task IDs
        //Reset all the tasks
        this.tasks = [];
        this.currentTasks = Array(this.numProcessors).fill(null);
        this.lastValidTasks = [];
        //Resets The switches and migrations
        this.contextSwitches = 0;
        this.tasksMigrations = 0;
        this.tasksFailed = 0; // reset the number of tasks that failed
        this.softAffinity = new SoftAffinityController(); // reset the soft affinity controller
    }
    addTask(task) {
        if (task instanceof Task === false) {
            throw new Error("Task is not an instance of Task class");
        }
        if (task.id === null) {
            task.assignId(this.#taskIDs);
            this.#taskIDs += 1;
        }
        else {
            Task.resetTimers(task); // reset the task timers if it already exists
            // Meaning that the task is being added again and it is probably a periodic task
        }
        task.arrivalTime = this.t;
        task.status = TaskStates.ready;
        this.tasks.push(task);
    }
    addRandomTask(numTasks = 1) {
        for (let i = 0; i < numTasks; i++) {
            let deadline = Math.random() > 0.2 ? Math.round(Math.random() * 10 + 1) : null; // Random deadline between 1 and 10 or null
            const burstTime = Math.round(Math.random() * this.newTaskConfig.maxBurstTime); // Random burst time between 1 and maxBurstTime
            const priority = Math.round(Math.random() * 10 + 1); // Random priority between 1 and 10
            if (!this.newTaskConfig.enableDeadTasks && deadline !== null) {
                deadline += burstTime; // Ensure deadline is greater than burst time if enabled
            }
            const task = new Task(burstTime, priority, deadline);
            if (Math.random() > 0.5 && this.newTaskConfig.enablePinToCore) {
                task.pinToCore = Math.floor(Math.random() * this.numProcessors); // Random core to pin to
            }
            task.color = Math.round(Math.random() * 255);
            this.addTask(task);
        }
    }
    getSnapshot() {
        // Create a deep copy of the tasks arrays
        const cpy_tasks = JSON.parse(JSON.stringify(this.tasks));
        const cpy_currentTasks = JSON.parse(JSON.stringify(this.currentTasks))
        const cpy_valid_tasks = JSON.parse(JSON.stringify(this.lastValidTasks));

        return new SchedulerSnapshot({
            t: this.t - 1, // time -1 since we do t+=1 at the end of the tick
            model: this.model.shortName, // name of the algorithm used
            numProcessors: this.numProcessors, // number of processors (Shouldnt change between snapshots)
            currentTasks: cpy_currentTasks,// copy of the currentTasks
            tasks: cpy_tasks,// copy of the tasks
            validTasks: cpy_valid_tasks,// copy of the valid tasks. this should be sorted as seen by the scheduler
            contextSwitches: this.contextSwitches, // number of context switches that occurred in this tick
            tasksMigrations: this.tasksMigrations, // number of task migrations that occurred in this tick
            tasksFailed: this.tasksFailed // number of tasks that failed (missed their deadline)
        });
    }
    // Minimize task migrations on the taskArray
    // The index of the taskArray has to be the core number
    // This function will try to minimize the number of task migrations
    // And return the taskArray with the tasks that are running on the cores
    minimizeTaskMigrations(taskArray) {

        const availableCores = new Set();
        const tasksThatAreNotOnPreferredCores = new Set();
        // Iterate through the taskArray to find tasks that are not on their preferred cores
        for (let i = 0; i < taskArray.length; i++) {
            if (taskArray[i] !== null) {
                // If a task is pinned to a core, it IS running on that core
                if (taskArray[i].pinToCore !== null) continue;
                // If the task is not pinned to a core, we check if it is running on its preferred core
                // I.E. the last core it was running on
                if (this.softAffinity.getAffinity(taskArray[i]) !== undefined) {
                    // Check if the task is running on its preferred core
                    // If it is not running on its preferred core, 
                    // we add it to the available cores set
                    if (this.softAffinity.getAffinity(taskArray[i]) !== i) {
                        availableCores.add(i);
                        tasksThatAreNotOnPreferredCores.add(taskArray[i]);
                    }
                }
                else {
                    // If the task has no affinity, it is its first time running
                    // therefore we add it to the available cores set
                    availableCores.add(i);
                    tasksThatAreNotOnPreferredCores.add(taskArray[i]);
                }
            }
            else {
                availableCores.add(i); // If the core is not occupied, we add it to the available cores set
            }
        }
        logger.log(`Current Tasks: ${Array.from(tasksThatAreNotOnPreferredCores).map(task => task ? `${task.id}:{${task.pinToCore}}` : 'null').join(', ')}`);
        logger.log(`Available Cores: ${Array.from(availableCores).join(', ')}`);
        // Now we have a set of available cores and tasks that are not on their preferred cores
        // We will try to assign the tasks that are not on their preferred cores to the available cores

        for (const task of tasksThatAreNotOnPreferredCores) {
            const preferredCore = this.softAffinity.getAffinity(task);
            logger.log(`Task ${task.id} preferred core: ${preferredCore} available cores: ${Array.from(availableCores).join(', ')}`);
            if (preferredCore === undefined) {
                // If the task has no preferred core, we skip it
                continue;
            }
            if (availableCores.has(preferredCore)) {
                // If the preferred core is available:
                // Swap this task with the task that is currently running on the preferred core

                const oldTaskAtTargetCore = taskArray[preferredCore];
                const oldCoreIndex = taskArray.indexOf(task);
                taskArray[oldCoreIndex] = oldTaskAtTargetCore;
                taskArray[preferredCore] = task;

                // The preferred core is no longer available.
                // So if two tasks want to run on the same core,
                // the first will be assigned to the core
                // and the second will remain in its current core
                availableCores.delete(preferredCore);
            }
        }
        logger.log(`Current Tasks: ${taskArray.map(task => task ? `${task.id}:{${task.pinToCore}}` : 'null').join(', ')}`);

        return taskArray;
    }
    rearm(task) {
        logger.log(`Rearming task ${task.id}`);
        if (task instanceof Task === false) {
            logger.error("Task is not an instance of Task class");
        }
        task.rearmed = true; // mark the task as rearmed
        const _task = Task.fromTask(task);
        _task.assignId(task.id); // reassign the ID to the new task
        _task.instance = task.instance ? task.instance + 1 : 1; // increment the instance number
        this.addTask(_task); // add the new task to the scheduler
    }
    tick() {
        // pop tasks that are done
        logger.log(`Tick: ${this.t} ${'#'.repeat(60)}` );
        this.tasks.forEach(task => {
            if (task.period > 0 && this.t >= task.arrivalTime + task.period && !task.rearmed) {
                this.rearm(task); // rearm the task if it is periodic
            }

            if (!task.completedTime) {
                    const missedDeadline = !task.checkTask(this.t); // check if the task is done or failed in the last tick
                    if (missedDeadline)
                        this.tasksFailed += 1; // increment the number of tasks that failed 
                }
            
            if (task.remainingTime > 0 && task.status === TaskStates.running)
                    task.status = TaskStates.ready;
        }
        );

        // Add new tasks to the system
        for (const task of this.startingTasks) {
            if (task.arrivalTime >= this.t) {
                const newTask = Task.fromTask(task)
                if (newTask)
                    this.addTask(newTask);
            };
        }
        // Sort the tasks based on the algorithm's criteria
        const validtasks = this.model.sortTasks(this.tasks.filter(task => task.status === TaskStates.ready));
        this.lastValidTasks = validtasks;
        // Generate the tasks for the current tick on the processors
        let nextTasks = Array(this.numProcessors).fill(null);
        let assigned = 0;
        let validTaskIndex = 0;
        let currentCore = 0;
        // now we assign the tasks to the processors
        // we use the tasks sorted by the algorithm
        // and assign them to each core (Assuming each core has the same)
        while (assigned < this.numProcessors) {
            const currentValidTask = validtasks[validTaskIndex];

            //Check if core is already assigned
            if (nextTasks[currentCore] !== null) {
                currentCore++;
                continue; // skip if the core is already occupied

            }
            // get the next valid task
            if (currentValidTask) {
                const taskHardCoreAffinity = currentValidTask.pinToCore;
                // If its pinned to a core, assign it to that core
                if (taskHardCoreAffinity !== null) {
                    // Handle the case where the task is pinned to a core
                    if (nextTasks[taskHardCoreAffinity] !== null) {
                        const targetCoreIsNotPinned = nextTasks[taskHardCoreAffinity].pinToCore === null;
                        // Check if the task in the target core is also pinned to a core
                        if (targetCoreIsNotPinned) {
                            //if target core is already assigned but the assigned task is not pinned to a core, swap the tasks
                            nextTasks[currentCore] = nextTasks[taskHardCoreAffinity];
                            nextTasks[taskHardCoreAffinity] = validtasks[validTaskIndex];
                            assigned++;
                            currentCore++;
                        }
                        // If we cannot swap the tasks, we cannot execute this task since the previous task 
                        // was pinned to a core before this and thus has priority over this task
                        else {
                            // If the target core is already assigned and the assigned task is also pinned to a core, skip the task
                            //do nothing
                        }

                    }
                    else // If the core is not occupied, assign the task to that core
                    {
                        nextTasks[validtasks[validTaskIndex].pinToCore] = validtasks[validTaskIndex];
                        assigned++;

                    }

                }
                else {
                    // If the task is not pinned to a core, assign it to the next available core
                    nextTasks[currentCore] = validtasks[validTaskIndex];
                    assigned++;
                    currentCore++;
                }
                // Move to the next valid task
                validTaskIndex++;
            }
            else {
                // If no valid tasks are available, break the loop
                //break;
                assigned++;
            }
        }

        // Now that we have assigned the tasks to the processors, Minimize the number of task migrations
        // by checking if the tasks are already running on the cores
        
        if (this.reduceTaskMigration) {
            nextTasks = this.minimizeTaskMigrations(nextTasks);
        }
        // Check if there are context switches and task migrations
        logger.log(nextTasks.map(task => task ? `${task.id}:{${task.pinToCore}}` : 'null').join(', '));
        for (let i = 0; i < nextTasks.length; i++) {
            // If we changed the task on the core, we increment the context switches    
            if (this.currentTasks[i] !== nextTasks[i]) {
                this.contextSwitches += 1; // increment context switches if the task is not the same as the previous one
            }
            if (!nextTasks[i]) {
                continue; // skip if the core is not occupied
            }
            // If the core is diferent from the previous core, we increment the task migrations
            if (this.softAffinity.getAffinity(nextTasks[i]) !== i) {
                // If the task was running on a different core, we increment the task migrations
                if (this.softAffinity.getAffinity(nextTasks[i]) !== undefined) {
                    this.tasksMigrations += 1; // increment task migrations
                    logger.log(`Task ${nextTasks[i].id} migrated to core ${i}`);
                }
                this.softAffinity.setAffinity(nextTasks[i], i); // set the thread affinity for the task
                logger.log(`Task ${nextTasks[i].id} set affinity to core ${i}`);
            }

        }
        // Assign the next tasks to the Cores
        this.currentTasks = nextTasks; // assign the next tasks to the current tasks
        // tick the tasks
        for (let i = 0; i < this.currentTasks.length; i++) {
            if (this.currentTasks[i] !== null) {
                this.currentTasks[i].status = TaskStates.running;
                this.currentTasks[i].tick(this.t);
            }
        }
        if (this.model.consumeTasks) {
            this.model.consumeTasks(this.currentTasks);
        }
        this.t += 1; // increment time
    }

}

export { Scheduler, Task, TaskStates, SchedulerSnapshot };
import { DefaultColors, BasicConsole, ControlSequences } from "../Engine/ConsoleHelp.js";
import { AlgoFactory, AlgorithmModels } from "../Algorthims/AlgoFactory.js";
import { logger } from "../Engine/Logger.js";

const CH = new BasicConsole();

/**
 * Represents the various states a task can be in during its lifecycle.
 * Each state is associated with a specific color for visual representation.
 */
class TaskStates {
    static ready = CH.insert_color(DefaultColors.GREEN, 'READY');
    static running = CH.insert_color(DefaultColors.YELLOW, 'RUNNING');
    static failed = CH.insert_color(DefaultColors.RED, 'FAILED');
    static completed = CH.insert_color(DefaultColors.BLUE, 'COMPLETED');
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
    constructor(t, model, numProcessors, currentTasks, tasks, validTasks, contextSwitches, tasksMigrations) {
        this.t = t; // current time in time units
        this.model = model; // name of the scheduling algorithm used
        this.numProcessors = numProcessors; // number of processors
        this.currentTasks = currentTasks; // array of tasks currently running on each processor
        this.tasks = tasks; // array of all tasks
        this.validTasks = validTasks; // array of valid tasks
        this.contextSwitches = contextSwitches; // number of context switches that occurred in this tick
        this.tasksMigrations = tasksMigrations; // number of task migrations that occurred in this tick
    }
}

/**
 * Represents a Task in a scheduling simulation.
 */
class Task {
    /**
     * Creates a new Task instance.
     * @param {number} burstTime - The burst time of the task in time units.
     * @param {number} [priority=0] - The priority of the task (0 is the highest priority).
     * @param {number|null} [deadline=null] - The deadline of the task in time units, or null if no deadline.
     * @param {number|null} [pinToCore=null] - The core to which the task is pinned, or null if no pinning.
     */
    constructor(burstTime, priority = 0, deadline = null, pinToCore = null) {
        this.id = null;
        this.burstTime = burstTime; // in time units
        this.remainingTime = burstTime;
        this.arrivalTime = null;
        this.completedTime = null;
        this.turnAround = null; // in time units, null if not completed
        this.responseTime = null; // in time units, null if not yet started
        this.waitingTime = null; // in time units, null if not yet started
        this.priority = priority; // 0 is the highest priority
        this.deadline = deadline; // in time units, null if no deadline
        this.pinToCore = pinToCore; // null if no pinning
        this.status = "CREATED"; // ready, running, completed
        this.color = 0;// 8bit number for ANSI color using COLOR.custom_colors()
        this.period = null; // 0 or null if no periodicity
    }

    /**
     * Assigns an ID to the task.
     * @param {number} id - The unique identifier for the task.
     */
    assignId(id) {
        this.id = id;
    }

    /**
     * Checks the task's status and updates it if completed.
     * @param {number} t - The current time in the simulation.
     */
    checkTask(t) {
        if (this.remainingTime <= 0 && this.status !== TaskStates.completed) {
            this.status = TaskStates.completed;
            this.completedTime = t;
            this.turnAround = t - this.arrivalTime; // set turn around time to the time it completed
            this.waitingTime = this.turnAround - this.burstTime; // set waiting time to the time it completed - burst time

        }
        this.checkDeadline(t);

    }
    /**
     * Checks if the task has missed its deadline.
     * @param {number} t - The current time in the simulation.
     * @returns {boolean} - Returns true if the deadline is not missed, false otherwise.
     */
    checkDeadline(t) {
        if (this.deadline && this.remainingTime > 0 && t >= this.arrivalTime + this.deadline && this.status !== TaskStates.failed) {
            this.status = TaskStates.failed;
            this.completedTime = t; // set remaining time to 0 to mark it as completed
            return false; // deadline missed
        }
        return true; // deadline not missed
    }
    /**
     * Simulates the passage of one time unit for the task.
     * Updates response time and decrements remaining time if applicable.
     * @param {number} t - The current time in the simulation.
     */
    tick(t) {
        if (this.responseTime === null) {
            this.responseTime = t - this.arrivalTime; // set response time to the time it started running
        }
        if (this.remainingTime > 0) {
            this.remainingTime -= 1;
        }
    }
    /**
    * Sets the display format for the task.
    * @param {Object} format - The format object containing color, background, and character properties.
    */
    setFormat(format) {
        this.format = format;
    }
    /**
     * Resets the task's timers and status to their initial state.
     * @static
     * @param {Task} task - The task instance to reset.
     */
    static resetTimers(task) {
        task.remainingTime = task.burstTime;
        task.completedTime = null;
        task.turnAround = null; // in time units, null if not completed
        task.responseTime = null; // in time units, null if not yet started
        task.arrivalTime = null;
        task.waitingTime = null;
    }
    /**
     * Generates a visual representation of the task as a line.
     * @static
     * @param {Task} task - The task instance to generate the line for.
     * @param {number} [size=1] - The size of the line to generate.
     * @returns {string} - The generated line representation of the task.
     */
    static getLine(task, size = 1) {
        let line = "";//task.format.char.repeat(size);
        line = " ".repeat(size);
        line = CH.insert_color(DefaultColors.custom_colors(task.color ? task.color : 255, true), line);

        // console.log(line)
        // console.log(task.format.color.replace("38","48"), line.replace(" ", "+").replace(ControlSequences.CSI, "ESC"));
        // throw new Error("Debugging");
        // if (task.format.background) {
        //     line = CH.insert_color(task.format.background, line);
        // }
        return line;

    }

    /**
     * Creates a new Task instance based on the provided task.
     *
     * @param {Task} task - The task to clone. Must be an instance of the Task class.
     * @returns {Task|null} A new Task instance with the same properties as the input task,
     *                      or null if the input is not an instance of Task.
     */
    static fromTask(task) {
        if (!(task instanceof Task))
            return null;

        let newTask = new Task(task.burstTime, task.priority, task.deadline, task.pinToCore);
        newTask.color = task.color;
        return newTask;
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
        this.softAffinity = {}; // Map to store soft core affinities
        this.contextSwitches = 0; // number of total context switches
        this.tasksMigrations = 0; // number of task migrations
        this.reduceTaskMigration = false; // flag to reduce task migrations
    }
    // Configures the scheduler with the provided configuration object.
    // if config is null or undefined, it throws an error.
    configure(config) {
        if (!config) {
            console.log("config: ", config);
            throw new Error("Invalid configuration object");
        }
        const getValue = (name, defaultValue) => {
            const value = config.find(item => item.name === name)?.value;
            return value !== undefined ? value : defaultValue;
        }
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
        this.softAffinity = {};
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
    addRandomTask() {
        const task = new Task(Math.round(Math.random() * 10 + 1), Math.round(Math.random() * 10 + 1), Math.random() > 0.5 ? null : Math.round(Math.random() * 10 + 1)); // Random burstTime between 1 and 10
        if (Math.random() > 0.5) {
            task.pinToCore = Math.floor(Math.random() * this.numProcessors); // Random core to pin to
        }
        task.color = Math.round(Math.random() * 255);
        this.addTask(task);
    }
    getSnapshot() {
        // Create a deep copy of the tasks arrays
        const cpy_tasks = JSON.parse(JSON.stringify(this.tasks));
        const cpy_currentTasks = JSON.parse(JSON.stringify(this.currentTasks))
        const cpy_valid_tasks = JSON.parse(JSON.stringify(this.lastValidTasks));

        return new SchedulerSnapshot(
            this.t - 1, // time -1 since we do t+=1 at the end of the tick
            this.model.shortName, // name of the algorithm used
            this.numProcessors, // number of processors (Shouldnt change between snapshots)
            cpy_currentTasks,// copy of the currentTasks
            cpy_tasks,// copy of the tasks
            cpy_valid_tasks,// copy of the valid tasks. this should be sorted as seen by the scheduler
            this.contextSwitches, // number of context switches that occurred in this tick
            this.tasksMigrations // number of task migrations that occurred in this tick
        );
    }
    // Minimize task migrations on the taskArray
    // The index of the taskArray has to be the core number
    // This function will try to minimize the number of task migrations
    // And return the taskArray with the tasks that are running on the cores
    minimizeTaskMigrations(taskArray) {

        const availableCores = new Set();
        const tasksThatAreNotOnPreferredCores = new Set();
        logger.log(`Minimizing task migrations for ${taskArray.length} tasks on ${this.numProcessors} cores.`);
        logger.log(`Current Tasks: ${taskArray.map(task => task ? `${task.id}:{${task.pinToCore}}` : 'null').join(', ')}`);
        logger.log(`Soft Affinity: ${JSON.stringify(this.softAffinity)}`);
        // Iterate through the taskArray to find tasks that are not on their preferred cores
        for (let i = 0; i < taskArray.length; i++) {
            if (taskArray[i] !== null) {
                // If a task is pinned to a core, it IS running on that core
                if (taskArray[i].pinToCore !== null) continue;
                // If the task is not pinned to a core, we check if it is running on its preferred core
                // I.E. the last core it was running on
                if (this.softAffinity[taskArray[i].id] !== undefined) {
                    // Check if the task is running on its preferred core
                    // If it is not running on its preferred core, 
                    // we add it to the available cores set
                    if (this.softAffinity[taskArray[i].id] !== i) {
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
            else{
                availableCores.add(i); // If the core is not occupied, we add it to the available cores set
            }
        }
        
        // Now we have a set of available cores and tasks that are not on their preferred cores
        // We will try to assign the tasks that are not on their preferred cores to the available cores

        for (const task of tasksThatAreNotOnPreferredCores) {
            const preferredCore = this.softAffinity[task.id];
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

    tick() {
        // pop tasks that are done

        this.tasks.forEach(task => {
            task.checkTask(this.t); //check if the task is done or failed in the last tick 
            if (task.remainingTime > 0 && task.status === TaskStates.running)
                task.status = TaskStates.ready;
            if (task.period && task.arrivalTime + task.period >= this.t) {
                this.addTask(task);
            }
        }
        );

        // Add new tasks to the system
        for (const task of this.startingTasks) {
            if (task.arrivalTime === this.t) {
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
        /*
        */
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
            if (this.softAffinity[nextTasks[i].id] !== i) {
                // If the task was running on a different core, we increment the task migrations
                if (this.softAffinity[nextTasks[i].id] !== undefined) {
                    this.tasksMigrations += 1; // increment task migrations
                    logger.log(`Task ${nextTasks[i].id} migrated to core ${i}`);
                }
                this.softAffinity[nextTasks[i].id] = i; // set the thread affinity for the task
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
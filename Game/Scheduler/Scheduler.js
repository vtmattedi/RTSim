import { DefaultColors, BasicConsole, ControlSequences } from "../Base/ConsoleHelp.js";
import {AlgoFactory, AlgorithmModels} from "../Algorthims/AlgoFactory.js";

const CH = new BasicConsole();

class TaskStates {
    static ready = CH.insert_color(DefaultColors.GREEN, 'READY');
    static running = CH.insert_color(DefaultColors.YELLOW, 'RUNNING');
    static failed = CH.insert_color(DefaultColors.RED, 'FAILED');
    static completed = CH.insert_color(DefaultColors.BLUE, 'COMPLETED');
}

// All times are in time units.
class Task {
    constructor(burstTime, priority = 0, deadline = null, pinToCore = null) {
        this.id = null;
        this.burstTime = burstTime; // in time units
        this.remainingTime = burstTime;
        this.arrivalTime = null;
        this.completedTime = null;
        this.priority = priority; // 0 is the highest priority
        this.deadline = deadline; // in time units, null if no deadline
        this.pinToCore = pinToCore; // null if no pinning
        this.status = "CREATED"; // ready, running, completed
        this.format = {
            color: DefaultColors.RED,
            background: null,
            char: '*',
        }
    }

    assignId(id) {
        this.id = id;
    }
    checkTask(t) {
        if (this.remainingTime <= 0 && this.status !== TaskStates.completed) {
            this.status = TaskStates.completed;
            this.completedTime = t; 
        }
        this.checkDeadline(t);
        
    }
    checkDeadline(t) {
        if (this.deadline && this.remainingTime > 0 && t >= this.arrivalTime + this.deadline && this.status !== TaskStates.failed) {
            this.status = TaskStates.failed;
            this.completedTime = t; // set remaining time to 0 to mark it as completed
            return false; // deadline missed
        }
        return true; // deadline not missed
    }

    tick(t) {
        if (this.remainingTime > 0) {
            this.remainingTime -= 1;
        }
    }

    setFormat(format) {
        this.format = format;
    }
    static getLine(task, size = 1) {
        let line = task.format.char.repeat(size);
        line = " ".repeat(size) ;
        if (task.format.color) {
            line = CH.insert_color(task.format.color.replace("38","48"), line);
        }
        // console.log(line)
        // console.log(task.format.color.replace("38","48"), line.replace(" ", "+").replace(ControlSequences.CSI, "ESC"));
        // throw new Error("Debugging");
        // if (task.format.background) {
        //     line = CH.insert_color(task.format.background, line);
        // }
        return line;

    }
}

class Scheduler {
    #taskIDs = 0;
    constructor(numProcessors = 1) {
        this.numProcessors = numProcessors;
        this.tasks = [];
        this.currentTasks = Array(numProcessors);
        this.lastValidTasks = [];
        this.model = AlgoFactory.createAlgorithm(AlgorithmModels.SJF,{timeQuantum: 1}); // Default algorithm
        this.t = 0; // initial time in time units
    }

    addTask(task) {
        task.assignId(this.#taskIDs);
        this.#taskIDs += 1;
        task.arrivalTime = this.t;
        task.status = TaskStates.ready;
        this.tasks.push(task);
    }
    addRandomTask() {
        const task = new Task(Math.round(Math.random() * 10 + 1), Math.round(Math.random() * 10 + 1), Math.random() > 0.5 ? null : Math.round(Math.random() * 10 + 1)); // Random burstTime between 1 and 10
        if (Math.random() > 0.5) {
            task.pinToCore = Math.floor(Math.random() * this.numProcessors); // Random core to pin to
        }
        task.setFormat({
            color: DefaultColors.custom_colors(Math.round(Math.random() * 255)),
            background: DefaultColors.custom_colors(Math.round(Math.random() * 255, true)),
            char: Math.random() > 0.5 ? '*' : '#',
        });
        this.addTask(task);
    }
    getSnapshot() {

        const cpy_tasks = JSON.parse(JSON.stringify(this.tasks));
        const cpy_currentTasks = JSON.parse(JSON.stringify(this.currentTasks))
        const cpy_valid_tasks = JSON.parse(JSON.stringify(this.lastValidTasks));
        // Create a deep copy of the tasks array
        return {
            t: this.t -1, // return the last tick
            numProcessors: this.numProcessors,
            currentTasks: cpy_currentTasks,
            tasks: cpy_tasks,
            validTasks: cpy_valid_tasks
        }
    }
    tick() {
        // pop tasks that are done

        this.tasks.forEach(task => {
            task.checkTask(this.t - 1);
            if (task.remainingTime > 0 && task.status === TaskStates.running)
                task.status = TaskStates.ready;
        }
        );
        const validtasks = this.model.sortTasks(this.tasks.filter(task => task.status === TaskStates.ready));
        this.lastValidTasks = validtasks;
        this.currentTasks = Array(this.numProcessors).fill(null);
        let assigned = 0;
        let validTaskIndex = 0;
        let currentCore = 0;
        while (assigned < this.numProcessors) {
            //Check if core is already assigned
            if (this.currentTasks[currentCore] !== null) {
                currentCore++;
                continue; // skip if the core is already occupied

            }
            // get the next valid task
            if (validtasks[validTaskIndex]) {

                // If its pinned to a core, assign it to that core
                if (validtasks[validTaskIndex].pinToCore !== null) {
                    if (this.currentTasks[validtasks[validTaskIndex].pinToCore] !== null) {
                        if (this.currentTasks[validtasks[validTaskIndex].pinToCore].pinToCore === null) {
                            //if target core is already assigned but the assigned task is not pinned to a core, swap the tasks
                            this.currentTasks[currentCore] = this.currentTasks[validtasks[validTaskIndex].pinToCore];
                            this.currentTasks[validtasks[validTaskIndex].pinToCore] = validtasks[validTaskIndex];
                            assigned++;
                        }
                        else {
                            // If the target core is already assigned and the assigned task is also pinned to a core, skip the task
                            //do nothing
                        }

                    }
                    else // If the core is not occupied, assign the task to that core
                    {
                        this.currentTasks[validtasks[validTaskIndex].pinToCore] = validtasks[validTaskIndex];
                        assigned++;

                    }

                }
                else {
                    // If the task is not pinned to a core, assign it to the next available core
                    this.currentTasks[currentCore] = validtasks[validTaskIndex];
                    assigned++;
                    currentCore++;
                }
                validTaskIndex++;
            }
            else {
                // If no valid tasks are available, break the loop
                //break;
                assigned++;
            }
        }

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

    run() {
        const interval = setInterval(() => {
            const now = new Date();
            for (const task of [...this.tasks]) {
                if (task.remainingTime <= 0) {
                    this.tasks = this.tasks.filter(t => t !== task);
                    task.func();
                }
            }
            if (this.tasks.length === 0) {
                clearInterval(interval);
            }
        }, 100); // Check every 100ms
    }
    Log(){
        console.log("Scheduler Log: ");
        console.log("Time: ", this.t);
        console.log("Tasks: ", this.tasks.map(task => task.id));
        console.log("Current Tasks: ", this.currentTasks.map(task => task ? task.id : null));
        console.log("Last Valid Tasks: ", this.lastValidTasks.map(task => task.id));
    }
}

export { Scheduler, Task, TaskStates };
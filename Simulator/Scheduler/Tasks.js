import { DefaultColors, BasicConsole, ControlSequences } from "../Engine/ConsoleHelp.js";
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
        this.rearmed = false; // if the task is rearmed, used for periodic tasks
        this.instance = null; // instance of the task, used for periodic tasks (number of times the task has been executed)
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
        return this.checkDeadline(t);

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
        newTask.period = task.period;
        return newTask;
    }


    /*
        * Creates a new Task instance from an object representation.
        * @param {Object} obj - The object containing task properties.
        * @returns {Task} A new Task instance with properties set from the object.
    */
    static fromObject(obj) {
        const newTask = new Task(obj.burstTime, obj.priority, obj.period);
        newTask.pinToCore = obj.pinToCore;
        newTask.arrivalTime = obj.arrivalTime || 0;
        newTask.deadline = obj.deadline || null;
        newTask.period = obj.period || null;
        newTask.color = obj.color || Math.random() * 255; // random color if not specified
        return newTask;

    }
}

export { Task, TaskStates };
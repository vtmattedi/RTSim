import { logger } from "../Engine/Logger.js";
import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class PriorityRR extends SchedulerAlgorithms {
    constructor(quantum) {
        super();
        this.name = "Priority Round Robin";
        this.shortName = "PriorityRR";
        this.description = "Tasks are scheduled based on their priority. Higher priority tasks are executed first. If two tasks have the same priority, they take turns executing.";
        this.map = {};
        this.canConsume = true;
        this.lastTasks = [];

    }
    #key = (task) => { return `${task.id}#${task.instance}`; };
    consumeTasks(tasks) {
        this.lastTasks = tasks;
        tasks.forEach(task => {
            if (task) {
                const key = this.#key(task);
                if (!this.map[key]) {
                    this.map[key] = 0;
                }
                this.map[key]++;
            }
        });
    }

    sortTasks(tasks) {

        return tasks.sort((a, b) => {
            if (a.priority === b.priority) {
                const a_on_last = this.lastTasks.find(t => t === a) ? 1 : 0;
                const b_on_last = this.lastTasks.find(t => t === b) ? 1 : 0;
                if (a_on_last === b_on_last) {
                    return 0;
                }
                if (a_on_last) {
                    return 1; // a is on the last queue, so it should be first
                }
                if (b_on_last) {
                    return -1; // b is on the last queue, so it should be first
                }
            }
            return b.priority - a.priority; // Higher priority first
        });

    }

}

export { PriorityRR };
import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class PriorityFirst  extends SchedulerAlgorithms {
    constructor() {
        super();
        this.name = "Priority First";
        this.shortName = "Priority";
        this.description = "Tasks are scheduled based on their priority. Higher priority tasks are executed first. If two tasks have the same priority, the one that arrived first is executed first.";
    }

    sortTasks(tasks, t) {
        // Sort the tasks based on their priority (highest priority first)
        return tasks.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.arrivalTime - b.arrivalTime; // If priorities are equal, sort by arrival time
            }
            return b.priority - a.priority; // Sort by priority (highest first)
        });
    }

}

export { PriorityFirst };
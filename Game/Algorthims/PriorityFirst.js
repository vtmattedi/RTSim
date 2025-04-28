import { SchedulerAlgorithm } from "./SchedulerAlgorithm.js";

class PrioritySchedulerAlgorithm  extends SchedulerAlgorithm {
    constructor() {
        super();
        this.tasks = [];
        this.name = "Priority First";
    }

    sortTasks(tasks) {
        // Sort the tasks based on their priority (highest priority first)
        return tasks.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.arrivalTime - b.arrivalTime; // If priorities are equal, sort by arrival time
            }
            return b.priority - a.priority; // Sort by priority (highest first)
        });
    }

}

export { PrioritySchedulerAlgorithm };
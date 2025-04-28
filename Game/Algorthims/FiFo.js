import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class FiFoAlgorithm  extends SchedulerAlgorithms {
    constructor() {
        super();
        this.tasks = [];
        this.name = "Priority First";
    }

    sortTasks(tasks) {
        // Sort the tasks based on their arrival time (earliest first)
        return tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }
}


export { FiFoAlgorithm };
import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class FCFSAlgorithm  extends SchedulerAlgorithms {
    constructor() {
        super();
        this.tasks = [];
        this.name = "First Come First Served (FCFS)";
    }

    sortTasks(tasks, t) {
        // Sort the tasks based on their arrival time (earliest first)
        return tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }
}


export { FCFSAlgorithm };
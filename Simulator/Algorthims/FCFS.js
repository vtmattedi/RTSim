import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class FCFSAlgorithm  extends SchedulerAlgorithms {
    constructor() {
        super();
        this.name = "First Come First Served";
        this.shortName = "FCFS";
        this.description = "Tasks are sorted based on their arrival time (earliest first).";
    }

    sortTasks(tasks, t) {
        // Sort the tasks based on their arrival time (earliest first)
        return tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }
}


export { FCFSAlgorithm };
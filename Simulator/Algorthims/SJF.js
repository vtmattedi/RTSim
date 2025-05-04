import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";


class SJFAlgorithm extends SchedulerAlgorithms {
    constructor() {
        super();
        this.name = "Shortest Job First";
        this.shortName = "SJF";
        this.description = "Tasks are sorted based on their burst time in ascending order.";
    }

    sortTasks(tasks, t) {
        // Sort the tasks based on their Remaining time (ascending order)
        // and then by arrival time (earliest first) if burst times are equal
        return tasks.sort((a, b) => {
            if (a.remainingTime === b.remainingTime) {
                return a.arrivalTime - b.arrivalTime; // Sort by arrival time if Remaining times are equal
            }
            return a.remainingTime - b.remainingTime; // Sort by Remaining time (shortest first)
        });
    }
}

export { SJFAlgorithm };
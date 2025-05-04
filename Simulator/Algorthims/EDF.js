import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class EDFAlgorithm  extends SchedulerAlgorithms {
    constructor() {
        super();
        this.name = "Earlier Deadline First";
        this.shortName = "EDF";
        this.description = "Tasks are sorted based on their deadlines (earliest first).";
    }
    sortTasks(tasks, t) {
        // Sort the tasks based on their deadlines (earliest first)
        return tasks.sort((a, b) => 
        {
            if (a.deadline === null && b.deadline === null) {
                return a.arrivalTime - b.arrivalTime; // Both tasks have no deadline, earliest arrival time first
            }
            if (a.deadline === null) {
                return 1; // Task a has no deadline, move it to the end
            }
            if (b.deadline === null) {
                return -1; // Task b has no deadline, move it to the end
            }
            return (a.arrivalTime + a.deadline) - (b.arrivalTime + b.deadline); // Sort by deadline (earliest first)
        });
    }

    

}

export { EDFAlgorithm };
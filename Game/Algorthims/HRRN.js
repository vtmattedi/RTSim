import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class HRRNAlgorithm  extends SchedulerAlgorithms {
    constructor() {
        super();
        this.tasks = [];
        this.name = "Highest Response Ratio Next (HRRN)";
    }

    calculateResponseRatio(task, currentTime) {
        const waitTime = currentTime - task.arrivalTime;
        const serviceTime = task.burstTime - task.remainingTime;
        if (serviceTime === 0) {
            return Infinity; // Avoid division by zero, return a high response ratio
        }
        return (waitTime + serviceTime) / serviceTime; // Response ratio formula
    }

    sortTasks(tasks, t) {
        return tasks.sort((a, b) =>{
            if (this.calculateResponseRatio(a, t) === this.calculateResponseRatio(b, t)) {
                return a.priority - b.priority; // If response ratios are equal, sort by priority
            }
            return this.calculateResponseRatio(b, t) - this.calculateResponseRatio(a, t); // Sort by response ratio (highest first)
        });
    }
}


export { HRRNAlgorithm };
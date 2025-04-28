class SchedulerAlgorithms {
    constructor() {
        this.name = "No Algorithm";
    }
    sortTasks(tasks) {
        // Sort the tasks based on the algorithm's criteria
        // This method should be overridden by subclasses
        throw new Error("sortTasks() must be implemented in subclasses");
    }
}




export { SchedulerAlgorithms };
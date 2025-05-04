import { SchedulerAlgorithms } from "./SchedulerAlgorithm.js";

class RoundRobin extends SchedulerAlgorithms {
    constructor(timeQuantum) {
        super();
        this.queue = [];
        this.name = "Round Robin";
        this.shortName = "RR";
        this.description = "Tasks are processed in a circular manner, each getting a fixed time quantum.";
        this.timeQuantum = timeQuantum; // Time quantum for round-robin scheduling
    }
    sortTasks(tasks, t) {
        if (this.queue.length === 0) {

            const orderedTasks =  tasks.sort( 
                (a, b) => {
                    if (a.arrivalTime === b.arrivalTime) {
                        return a.priority - b.priority; // Sort by priority if arrival times are equal
                    }
                    return a.arrivalTime - b.arrivalTime; // Sort by arrival time (earliest first)
                }
            ).slice(); // Copy the tasks to the queue

            for (let i = 0; i < orderedTasks.length; i++) {
                this.queue.push({task: orderedTasks[i], timeRemaining: this.timeQuantum});
            }
        }
        //check if all tasks are in the queue
        for (let i = 0; i < tasks.length; i++) {
            const exist = this.queue.find(task => task.task.id === tasks[i].id);
            if (!exist) {
                this.queue.push({task: tasks[i], timeRemaining: this.timeQuantum});
            }
        }
        // take tasks from the queue that are not in tasks
        for (let i = 0; i < this.queue.length; i++) {
            const exist = tasks.find(task => task.id === this.queue[i].task.id);
            if (!exist) {
                this.queue.splice(i, 1);
                i--;
            }
        }
        return this.queue.map(item => item.task); // Return the sorted tasks based on arrival time and priority

    }

    consumeTasks(tasks) {   
        for (const task of tasks) {
            if (!task)
                continue; // Skip if task is null or undefined
            const taskInQueue = this.queue.find(t => t.task.id === task.id);
            if (taskInQueue) {
                taskInQueue.timeRemaining -= 1; // Decrease the time remaining for the task in the queue
                if (taskInQueue.timeRemaining <= 0) {
                    this.queue.splice(this.queue.indexOf(taskInQueue), 1); // Remove the task from the queue if its time quantum is exhausted
                    this.queue.push({task: task, timeRemaining: this.timeQuantum}); // Add the task back to the end of the queue with a new time quantum
                }
            } else {
                throw new Error(`Task with ID ${task.id} not found in the queue. This should not happen.`);
            }
        }
    }


}

export { RoundRobin };
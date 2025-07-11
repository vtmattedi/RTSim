import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';
import { formatText, genProcessorsFrame, genTaskTable } from '../Scheduler/FramesHelper.js';
import Assets from '../Engine/Assets/Assets.js';
import { Arrows } from '../Engine/Symbols.js';
import { Task } from '../Scheduler/Scheduler.js';
import SceneAlias from './Alias.js';
const Colors = DefaultColors;
const CH = new BasicConsole();

const slots = [
    { name: "TASKS", width: 9, getValue: (task, index) => { return "ID: " + CH.insert_color(Colors.custom_colors(task.color), "TBD"); } },
    { name: "ARRI", width: 6, getValue: (task, index) => { return "" + task.arrivalTime; } },
    { name: "BURST", width: 5, getValue: (task, index) => { return "" + task.burstTime; } },
    { name: "DEAD", width: 6, getValue: (task, index) => { return task.deadline ? "" + (task.arrivalTime + task.deadline) : "---"; } },
    { name: "PRIO", width: 6, getValue: (task, index) => { return "" + task.priority; } },
    { name: "PIN", width: 5, getValue: (task, index) => { return task.pinToCore !== null ? "" + task.pinToCore : "---"; } },
    { name: "CLR", width: 5, getValue: (task, index) => { return CH.insert_color(Colors.custom_colors(task.color), "" + task.color); } },
    { name: "PERI", width: 6, getValue: (task, index) => { return task.period > 0 ? "YES" : "NO"; } },
]

const desc = [
    "Arrival Time: The time the task arrives in the system.",
    "Burst Time: The time (in time units) it takes to complete the task.",
    "Deadline: The time (in time units) at which the task is expected to be completed.",
    "Priority: The priority of the task. Higher values indicate higher priority.",
    "Pinned Core: The core to which the task is pinned.",
    "Color: The color of the task.",
    "Whether the task is periodic or not. (only for tasks with a deadline) Same task will be created after comletion ",
]

const bold = (text) => {
    return CH.insert_format({ decoration: Decorations.Bold }, text);
}

class TaskScreen extends Scene {
    constructor(scheduler, config) {
        super();
        this.scheduler = scheduler;
        this.colIndex = 0;
        this.rowIndex = -2;
        this.editingTask = false;
        this.optionsIndex = 0;
        this.config = config;

    }
    onEnter() {
        this.colIndex = 0;
        this.rowIndex = -2;
        this.editingTask = false;
        this.optionsIndex = 0;
    }

    draw() {
        let text = CH.getFigLet(`Task${CH.getWidth() < 70 ? "\n" : " "}Manager`);
        text += "\n\n";
        text += CH.hcenter("System-Config", CH.getWidth(), "-") + "\n";
        const _showed_configs_id = [0, 1, 2, 6];
        const configs = this.config.filter((config) => {
            return _showed_configs_id.includes(config.id);
        }).map((config) => {
            return `${config.name}: ${config.transformValue ? config.transformValue(config.value) : config.value}`;
        });

        text += "|" + CH.hcenter(configs.map((config) => {
            return CH.hcenter(config, Math.floor(CH.getWidth() / config.length) - 1, " ");
        }).join(" "), CH.getWidth() - 2) + "|\n";

        let nav = ["Back", "System Config", "Start Simulation"];
        text += "|" + CH.hcenter(nav.map((nav, index) => {
            return CH.hcenter(formatText(nav, this.rowIndex === -2 && this.optionsIndex === index, true), Math.floor(CH.getWidth() / nav.length) - 1, " ");
        }).join(" "), CH.getWidth() - 2) + "|\n";

        text += "-".repeat(CH.getWidth()) + "\n";

        const inputs = [
            {
                value: `(${Arrows.up})A`,
                text: "Add new Task (x10)"
            },
            {
                value: `D`,
                text: "Delete Task"
            },
            {
                value: `E`,
                text: "Edit Task"
            },
        ];
        const size = Math.floor((CH.getWidth() - 2) / inputs.length);
        for (let i = 0; i < inputs.length; i++) {
            text += CH.hcenter(`${bold(inputs[i].value)}: ${inputs[i].text}`, size, " ", 1)
            if (i < inputs.length - 1) {
                text += " "
            }
        }
        text += "\n";
        text += CH.hcenter(genTaskTable(this.scheduler.startingTasks, slots, CH.getHeight() - 19, {
            col: this.editingTask ? this.colIndex + 1 : -1,
            row: this.rowIndex,
        }, "Task List Editor"));
        text += "\n";
        if (this.colIndex >= 0 && this.rowIndex >= 0 && this.editingTask)
            text += desc[this.colIndex] + "\n";
        return text;

    }

    editTask(val) {
        const task = this.scheduler.startingTasks[this.rowIndex];
        const col = this.colIndex + 1;

        const columns =
        {
            taskId: 0,
            arrivalTime: 1,
            burstTime: 2,
            deadline: 3,
            priority: 4,
            pinToCore: 5,
            color: 6,
            periodic: 7,

        }
        if (!task) {
            return;
        }
        if (col === columns.arrivalTime) {
            // Arrival Time
            task.arrivalTime = Math.max(task.arrivalTime + val, 0);
        } else if (col === columns.burstTime) {
            // Burst Time
            task.burstTime = Math.max(task.burstTime + val, 1);
        } else if (col === columns.deadline) {
            // Deadline
            if (task.deadline === null) {
                task.deadline = 0; // If no deadline, set it to 0
            }
            task.deadline = Math.max(task.deadline + val, 0);
            if (task.deadline === 0) {
                task.deadline = null; // If deadline is 0, set it to null
            }
        } else if (col === columns.priority) {
            // Priority
            task.priority = Math.max(task.priority + val, 0); // Ensure priority does not go below 0
        } else if (col === columns.pinToCore) {
            // Pin to Core
            if (task.pinToCore === null)
                task.pinToCore = 0; // If not pinned, pin to core 0
            else if (task.pinToCore == 0 && val < 0) {
                task.pinToCore = null; // If pinned to core 0 and decrement, unpin
            }
            else {
                const maxCores = this.config.find(config => config.name === "Processors")?.value - 1|| 0;
                task.pinToCore += val;
                if (task.pinToCore > maxCores) {
                    task.pinToCore = null; // If exceeds max cores, unpin
                }
            }

        } else if (col === columns.color) {
            // Color
            task.color = (task.color + val) % 256;
        } else if (col === columns.periodic) {

            if (task.deadline === null) {
                return;
            }
            if (!task.period) {
                task.period = 1; // If no period, set it to 1
            }
            else if (task.period) {
                task.period = 0;
            }
        }
    }

    handleInput(input, modifiers) {
        if (input === "esc") {
            if (this.editingTask) {
                this.editingTask = false;
                return;
            }
            return "-1"
        }
        if (input === "enter" || input === "space") {
            if (!this.editingTask && this.rowIndex >= 0) {
                this.editingTask = !this.editingTask;
            }
            if (this.rowIndex === -2) {
                if (this.optionsIndex === 0) {
                    return -1;
                }
                if (this.optionsIndex === 1) {
                    return SceneAlias.systemMenu;
                }
                if (this.optionsIndex === 2) {
                    return SceneAlias.simulationScreen;
                }
            }
        }
        if (input === "a") {
            for (let i = 0; i < 1 + 9 * modifiers.shift; i++) {
                const task = new Task(Math.round(Math.random() * 10 + 1), Math.round(Math.random() * 10 + 1), Math.random() > 0.5 ? null : Math.round(Math.random() * 10 + 1)); // Random burstTime between 1 and 10
                if (Math.random() > 0.5) {
                    task.pinToCore = Math.floor(Math.random() * this.scheduler.numProcessors); // Random core to pin to
                }
                task.setFormat({
                    color: DefaultColors.custom_colors(Math.round(Math.random() * 255)),
                    background: DefaultColors.custom_colors(Math.round(Math.random() * 255, true)),
                    char: Math.random() > 0.5 ? '*' : '#',
                });
                task.color = Math.round(Math.random() * 255);
                task.arrivalTime = 0;
                this.scheduler.startingTasks.push(task);
            }
        }
        if (input === "e") {
            if (!this.editingTask && this.rowIndex >= 0) {
                this.editingTask = !this.editingTask;
            }
            else if (this.editingTask) {
                this.editingTask = false;
            }
        }
        if (input === "arrowup") {
            if (this.editingTask && !modifiers.shift) {
                this.editTask(1);
                return;
            }
            this.rowIndex--;
            if (this.rowIndex < -2) {
                this.rowIndex = -2;
            }
            if (this.rowIndex === -1) {
                this.rowIndex = -2;
            }
        }
        if (input === "arrowdown") {
            if (this.editingTask && !modifiers.shift) {
                this.editTask(-1);
                return;
            }

            this.rowIndex++;
            if (this.rowIndex >= this.scheduler.startingTasks.length) {
                this.rowIndex = this.scheduler.startingTasks.length - 1;
            }
            if (this.rowIndex === -1) {
                this.rowIndex = 0;
            }
        }
        if (input === "arrowleft") {
            if (this.editingTask) {
                this.colIndex--;
                if (this.colIndex < 0) {
                    this.colIndex = slots.length - 2;
                }
            }

            // Handle options navigation
            if (this.rowIndex === -2) {
                this.optionsIndex--;
                if (this.optionsIndex < 0) {
                    this.optionsIndex = 2;
                }
            }

        }
        if (input === "arrowright") {
            if (this.editingTask) {
                this.colIndex++;
                if (this.colIndex >= slots.length - 1) {
                    this.colIndex = 0;
                }
            }
            // Handle options navigation
            if (this.rowIndex === -2) {
                this.optionsIndex++;
                if (this.optionsIndex > 2) {
                    this.optionsIndex = 0;
                }
            }

        }
    }
}

export { TaskScreen };
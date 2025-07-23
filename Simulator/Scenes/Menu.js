import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';
import { genProcessorsFrame, genTaskTable } from '../Scheduler/FramesHelper.js';
import Assets from '../Engine/Assets/Assets.js';
import { Arrows } from '../Engine/Symbols.js';
import { MsgBoxHandler } from '../Engine/messageBox.js';
import SceneAlias from './Alias.js';
import { formatText } from '../Scheduler/FramesHelper.js';
import { Task } from '../Scheduler/Scheduler.js';
import { logger } from '../Engine/Logger.js';

const CH = new BasicConsole();

class MainMenu extends Scene {
    constructor(io, systemConfig, startingTasks) {
        super();
        this.currentIndex = 0;
        this.firstTime = true;
        this.io = io;
        this.systemConfig = systemConfig;
        this.startingTasks = startingTasks;
        this.options = [
            { text: "Start", response: SceneAlias.simulationScreen },
            { text: "Task Manager", response: SceneAlias.taskManager },
            { text: "Settings", response: SceneAlias.systemMenu },
            { text: "Help", response: -1 },
            { text: "Info", response: SceneAlias.infoScreen },
            { text: "Exit", response: "Exit" }
        ]
    }
    onEnter() {
        if (this.firstTime) {
            this.firstTime = false;

            if (!this.io.configured) {
                return;
            }

            if (this.io.exists('systemconfig.json')) {
                const config = this.io.read('systemconfig.json');
                if (config) {
                    const parsedConfig = JSON.parse(config);

                    if (parsedConfig && Array.isArray(parsedConfig.Data)) {
                        parsedConfig.Data.forEach(item => {
                            logger.log(`Loading system config: ${item.name} = ${item.value}`);
                            this.systemConfig.filter(o => o.name === item.name).forEach(o => {
                                if (item.value > o.max) {
                                    item.value = o.max;
                                }
                                if (item.value < o.min) {
                                    item.value = o.min;
                                }
                                o.value = item.value;
                            });
                        });
                    }
                    logger.log(this.systemConfig);
                }
            }

            if (this.io.exists('tasks.json')) {
                const tasks = this.io.read('tasks.json');
                MsgBoxHandler.getInstance().raise(
                    "Do you want to load the tasks configured from the tasks.json file?",
                    "Tasks Detected",
                    ["Yes", "No"],
                    (confirmed) => {
                        if (confirmed === 0) {
                            try {
                                const parsedTasks = JSON.parse(tasks);
                                if (Array.isArray(parsedTasks)) {
                                    this.startingTasks.push(...parsedTasks.map(task => {
                                        const newTask = new Task(task.burstTime, task.priority, task.period);
                                        newTask.pinToCore = task.pinToCore;
                                        newTask.setFormat({
                                            color: task.color,
                                            background: task.background,
                                            char: task.char
                                        });
                                        newTask.arrivalTime = task.arrivalTime || 0;
                                        return newTask;
                                    }));
                                    MsgBoxHandler.getInstance().raise("Success", "Tasks loaded successfully from tasks.json file.", ["OK"]);
                                } else {
                                    MsgBoxHandler.getInstance().raise("Error", "Invalid tasks format in tasks.json file.", ["OK"]);
                                }
                            }
                            catch (e) {
                                MsgBoxHandler.getInstance().raise("Error", "Failed to load tasks from tasks.json file.", ["OK"]);
                            }
                        }
                    }
                )
            }

        }
    }

    draw() {

        let text = CH.getFigLet("Main Menu");
        text += "\n";
        text += "-".repeat(CH.getWidth()) + "\n";
        text += CH.hcenter("Select an option", CH.getWidth(), " ", 1) + "\n";
        text += CH.hcenter("Use arrow keys to navigate", CH.getWidth(), " ", 1) + "\n";
        for (let i = 0; i < this.options.length; i++) {
            let line = this.options[i].text;
            line = formatText(line, i === this.currentIndex, i === this.options.length - 1 || i === 0);
            text += CH.hcenter(line, CH.getWidth(), " ", this.alignment) + "\n";
        }
        return text;

    }
    handleInput(input, modifiers) {
        if (input === "esc") {
            return SceneAlias.wecome
        }

        if (input === "arrowup") {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = 0;
            }
        }
        if (input === "arrowdown") {
            this.currentIndex++;
            if (this.currentIndex >= this.options.length) {
                this.currentIndex = this.options.length - 1;
            }
        }
        if (input === "enter" || input === "space") {
            console.log("Selected option: " + this.options[this.currentIndex].text);
            return this.options[this.currentIndex].response;
        }
    }
}

export { MainMenu };
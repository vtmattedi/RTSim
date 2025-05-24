import { Scheduler, Task } from './Scheduler/Scheduler.js';
import { BasicConsole, DefaultColors } from './Engine/ConsoleHelp.js';
import { ConsoleEngine } from './Engine/Engine.js';
import { welcomeScreen } from './Scenes/WelcomeScreen.js';
import { SimulationScreen } from './Scenes/SimulationScreen.js';
import { OpeningAnimation } from './Scenes/OpeningAnimation.js';
import { SystemMenu } from './Scenes/SystemMenu.js';
import { TaskScreen } from './Scenes/TaskManager.js';
import { MainMenu } from './Scenes/Menu.js';
import SceneAlias from './Scenes/Alias.js';
import { AlgorithmModels, AlgoFactory } from './Algorthims/AlgoFactory.js';
import { delta } from './Engine/Symbols.js';
import { InfoScreen } from './Scenes/InfoScreen.js';

class Simulator {
    #Version = "0.1.0";
    get Version() {
        return this.#Version;
    }
    constructor() {
        this.states = [];
        this.timer = null;
        this.scheduler = new Scheduler(6);
        this.snapshots = [];
        this.currentSnapshot = 0;
        this.systemConfig = [
            { id: 0, name: "Processors", value: 4, min: 1, max: 50, step: 1, desc: "Number of processors (cores) to be simulated." },
            {
                id: 1, name: "Scheduler Algorithm", value: 0, min: 0, max: AlgorithmModels.length - 1, step: 1, transformValue: (value) => { return `${AlgorithmModels.getName(value)}` },
                desc: (algo) => { return AlgoFactory.getDescription(algo); }
            },
            { id: 2, name: "Time Quantum", value: 1, min: 1, max: 100, step: 1, unit: delta + "t's", desc: `How many ${delta}t's are allowed per task.` },
            { id: 3, name: "Chance of new task", value: 1, min: 0, max: 100, step: 1, unit: "%", desc: "Chance of a new task being added to the system each time step." },
            { id: 4, name: "Tasks to be added", value: 1, min: 1, max: 100, step: 1, desc: "Number of tasks to be added to the system per time that a new task is added." },
            { id: 5, name: "Enable core pinning", value: false, min: 0, max: 1, step: 1, transformValue: (value) => { return value ? "YES" : "NO" }, desc: "Enable random tasks to be born pinned to a core." },
            { id: 6, name: "Enable deadlines", value: false, min: 0, max: 1, step: 1, transformValue: (value) => { return value ? "YES" : "NO" }, desc: "Enable random tasks to be born with a deadline." },
            { id: 7, name: "Auto Time Step", value: 50, min: 10, max: Infinity, step: 10, unit: "ms", desc: "Real time in between each automatic time step. You can play/pause the auto stepper also manually time step and check the state in the previous time at any time." },
            { id: 8, name: "Allow dead tasks", value: false, min: 0, max: 1, step: 1, transformValue: (value) => { return value ? "YES" : "NO" }, desc: "Allow tasks to be born with a deadline greater than their burst time." },
            { id: 9, name: "Preemptive System", value: 0, min: 0, max: 1, step: 1, transformValue: (value) => { return value === 1 ? "YES" : "NO" }, desc: "Allows the schuduler to choose another task to run in the next time step." },

        ]
        this.index = 0;
        this.maxIndex = 0;
        this.firstChar = true;
        for (let i = 0; i < 10; i++) {
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
        this.snapshots.push(this.scheduler.getSnapshot());
        this.Engine = new ConsoleEngine();
        this.Engine.setMinSize(60, 21);
        this.Engine.addScene(new OpeningAnimation(15, () => {
            setTimeout(() => {
                const res = this.Engine.goToScene(SceneAlias.wecome, "finishOpeningAnimation");
            }, 500);

        }), SceneAlias.openingAnimation);
        this.Engine.targetFPS(60);
        this.Engine.addScene(new welcomeScreen(), SceneAlias.wecome);
        this.Engine.addScene(new MainMenu(), SceneAlias.mainMenu);
        this.Engine.addScene(new SimulationScreen(this.scheduler, this.systemConfig), SceneAlias.simulationScreen);
        this.Engine.addScene(new TaskScreen(this.scheduler), SceneAlias.taskManager);
        this.Engine.addScene(new SystemMenu(this.systemConfig), SceneAlias.systemMenu);
        this.Engine.addScene(new InfoScreen(), SceneAlias.infoScreen);
        this.Engine.goToScene(SceneAlias.openingAnimation);

    }

    start() {
    }
    //This should be called when an input is received
    handleInput(input, modifiers) {
        this.Engine.handleInput(input, modifiers);

    }
    //This should be called when the window is resized
    resize() {
        const res = this.Engine.resize();
        if (!res) {
            //Stop the simulation if the window is resized to small
            //Maybe
        }
    }

    setupExit(fn) {
        if (typeof fn !== "function") {
            return;
        }
        this.Engine.onExit = fn;
    }
}

export { Simulator };


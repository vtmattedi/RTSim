import {Scheduler} from './Scheduler/Scheduler.js';
import { BasicConsole } from './Engine/ConsoleHelp.js';
import { ConsoleEngine } from './Engine/Engine.js';
import { welcomeScreen } from './Scenes/WelcomeScreen.js';
import { SimulationScreen } from './Scenes/SimulationScreen.js';
import { OpeningAnimation } from './Scenes/OpeningAnimation.js';
import {SystemMenu} from './Scenes/SystemMenu.js';
import { TaskScreen } from './Scenes/TaskManager.js';
import { MainMenu } from './Scenes/Menu.js';
import  SceneAlias  from './Scenes/Alias.js';
import { AlgorithmModels } from './Algorthims/AlgoFactory.js';
import { delta } from './Engine/Symbols.js';


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
            { name: "Processors", value: 1, min: 1, max: 10, step: 1 },
            { name: "Scheduler Algorithm", value: 0, min: 0, max: AlgorithmModels.length - 1, step: 1, transformValue: (value) => { return `${AlgorithmModels.getName(value)}`} },
            { name: "Time Quantum", value: 1, min: 1, max: 10, step: 1, unit: delta + "t's" },
            { name: "Chance of new task", value: 1, min: 0, max: 10, step: 1,transformValue: (value) => { return value*10 + `%`}},
            { name: "Auto Time Step", value: 20, min: 0, max: Infinity, step: 20, unit: "ms" },
  
        ]
        this.index = 0;
        this.maxIndex = 0;
        this.firstChar = true;
        for (let i = 0; i < 10; i++) {
            this.scheduler.addRandomTask();
        }
        this.snapshots.push(this.scheduler.getSnapshot());
        this.Engine = new ConsoleEngine();
        this.Engine.msgBox.raise("Simulator", "Welcome to the Simulator",[]);
        this.Engine.setMinSize(60, 21);      
        this.Engine.addScene(new OpeningAnimation(15, ()=>{
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
        this.Engine.goToScene(SceneAlias.openingAnimation);

    }

    start(){
    }
    //This should be called when an input is received
    handleInput(input, modifiers) {
        this.Engine.handleInput(input, modifiers);

    }
    //This should be called when the window is resized
    resize () {
        const res = this.Engine.resize();
        if (!res)
        {
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


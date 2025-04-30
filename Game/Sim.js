// Purpose: Game class to handle the game logic.
import * as ConsoleImpl from './Base/ConsoleHelp.js';
import { State } from './State.js';
import { Scheduler } from './Scheduler/Scheduler.js';
import { arrowRight, arrowLeft } from './Scheduler/Arrows.js';
import { AlgorithmModels } from './Algorthims/AlgoFactory.js';
import MsgBoxHandler from './messageBox.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;

class Simulator {
    constructor() {
        this.states = [];
        this.timer = null;
        this.Scheduler = new Scheduler();
        this.snapshots = [];
        this.currentSnapshot = 0;
        this.msgBox = new MsgBoxHandler();
        this.index = 0;
        this.maxIndex = 0;
        this.firstChar = true;
        for (let i = 0; i < 10; i++) {
            this.Scheduler.addRandomTask();
        }
        CH.setSelectFormat({
            color: Colors.BLACK,
            background: Colors.BG_WHITE
        },
            (text, selected) => {
                if (!selected)
                    return text;
                else
                    return ` ${arrowLeft} ${text} ${arrowRight} `;
                });

    }
    goToState(state) {
        this.states.unshift(state);
        this.firstChar = true;
        state.onCreate();
        state.render();
    }
    goBack() {
        if (this.states.length > 1) {
            this.states.shift();
            this.states[0].render();
        }
    }
    getCurrentState() {
        if (this.states.length > 0) {
            return this.states[0];
        }
        return null;
    }

    handleInput(input) {
        if (input == "enter" || input == "space") {
            this.getCurrentState()?.onSelect(input);
            if (this.msgBox.open) {
                this.msgBox.handleInput(0);
            }
        }
        else if (input == "arrowleft" || input == "arrowright") {
            const left = input == "arrowleft";
            if (this.msgBox.open) {
                this.msgBox.handleInput(left ? -1 : 1);
            }

        }
        else {
            this.getCurrentState()?.changeState(input);
            this.getCurrentState()?.render();
        }

    }


}

export { Simulator };
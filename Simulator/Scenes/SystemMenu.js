import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';
import { MsgBoxHandler } from '../Engine/messageBox.js';
import SceneAlias from './Alias.js';
import { AlgorithmModels } from '../Algorthims/AlgoFactory.js';
import { formatText } from '../Scheduler/FramesHelper.js';
import { Arrows, enter } from '../Engine/Symbols.js';

const CH = new BasicConsole();


const navOptions = ["Back", "Set Tasks", "Start Simulation"];

class SystemMenu extends Scene {
    constructor(options) {
        super();
        this.currentIndex = 0;
        this.navIndex = 0;
        this.options = options;
        this.showTimeQuantum = options.find(o => o.name == "Scheduler Algorithm")?.value === AlgorithmModels.RR;
        this.timeQuantumIndex = options.findIndex(o => o.name == "Time Quantum");

    }

    onEnter() {
        this.currentIndex = 0;
        this.navIndex = 0;
        this.showTimeQuantum = this.options.find(o => o.name == "Scheduler Algorithm")?.value === AlgorithmModels.RR;
        this.timeQuantumIndex = this.options.findIndex(o => o.name == "Time Quantum");

    }
    draw() {

        let text = CH.getFigLet("Configure System");
        text += "\n";
        text += "-".repeat(CH.getWidth()) + "\n\n";
        text += CH.hcenter(navOptions.map((option, index) => {
            return CH.hcenter(formatText(option, (this.navIndex == index) && this.currentIndex == -1, true), Math.floor(CH.getWidth() / option.length) - 4, " ");
        }).join(" ")) + "\n";
        
        const cmds = [
            { key: Arrows.upDown, desc: "Navigate." },
            { key: `(${Arrows.up}) ${Arrows.leftRight}`, desc: "Change value. (x10)" },
            { key: enter, desc: "Select." },
          ]
    
          let cmdline =  CH.hcenter(cmds.map((obj) => {
            return `\x1b[1m${obj.key}\x1b[0m: ${CH.insert_color(DefaultColors.LIGHTBLACK_EX, obj.desc)}`
          }).join(" "));
          text += "\n"+cmdline + "\n\n";

        for (let i = 0; i < this.options.length; i++) {
            if (i === this.timeQuantumIndex && !this.showTimeQuantum) {
                continue;
            }
            let val = this.options[i].value;
            if (this.options[i].transformValue) {
                val = this.options[i].transformValue(val);
            }
            let line = `${this.options[i].name}: ${val}`;

            line = formatText(line, i === this.currentIndex, false);
            if (this.options[i].unit)
                line += ` (${this.options[i].unit})`;
            text += CH.hcenter(line, CH.getWidth(), " ", this.alignment) + "\n";
        }
        text += "\n"
        //Add description of the current option
        // if we ha
        if (this.currentIndex >= 0) {
            let desc = "";
            if (typeof this.options[this.currentIndex]?.desc === "function") {
                desc = this.options[this.currentIndex]?.desc(this.options[this.currentIndex].value) + "\n";
            }
            else
                desc = this.options[this.currentIndex]?.desc + "\n";

            desc = CH.breakLine(desc, CH.getWidth() - 2);
            text += CH.hcenter(desc) + "\n";
        }

        return text;

    }
    handleInput(input, modifiers) {
        if (input == "arrowleft") {
            if (this.currentIndex < 0) {
                this.navIndex--;
                if (this.navIndex < 0) {
                    this.navIndex = 0;
                }
                return;
            }


            const option = this.options[this.currentIndex];
            option.value -= option.step * (1 + modifiers.shift * 9);
            if (option.value < option.min) {
                option.value = option.max;
            }
            if (option.name == "Scheduler Algorithm") {
                this.showTimeQuantum = option.value === AlgorithmModels.RR;
            }


        }
        if (input == "arrowright") {
            if (this.currentIndex < 0) {
                this.navIndex++;
                if (this.navIndex >= navOptions.length) {
                    this.navIndex = navOptions.length - 1;
                }
                return;
            }
            const option = this.options[this.currentIndex];
            option.value += option.step * (1 + modifiers.shift * 9);;
            if (option.name == "Chance of a new task") {
                option.value = Math.round(option.value * 10) / 10;
            }
            if (option.value > option.max) {
                option.value = option.min;
            }
            if (option.name == "Scheduler Algorithm") {
                this.showTimeQuantum = option.value === AlgorithmModels.RR;
            }

        }
        if (input == "arrowup") {
            this.currentIndex--;
            if (!this.showTimeQuantum && this.currentIndex === this.timeQuantumIndex)
                this.currentIndex--;
            if (this.currentIndex < -1) {
                this.currentIndex = -1;
            }
        }
        if (input == "arrowdown") {
            this.currentIndex++;
            if (!this.showTimeQuantum && this.currentIndex === this.timeQuantumIndex)
                this.currentIndex++;
            if (this.currentIndex >= this.options.length) {
                this.currentIndex = this.options.length - 1;
            }
        }
        if (input == "enter" || input == "space") {
            if (this.currentIndex == -1) {
                if (this.navIndex == 0) {
                    return "back";
                }
                if (this.navIndex == 1) {
                    return SceneAlias.taskManager;
                }
                if (this.navIndex == 2) {
                    return SceneAlias.simulationScreen;
                }
            }


        }
    }
}

export { SystemMenu };
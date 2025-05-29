import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';
import { genProcessorsFrame, genTaskTable } from '../Scheduler/FramesHelper.js';
import Assets from '../Engine/Assets/Assets.js';
import { Arrows } from '../Engine/Symbols.js';
import { MsgBoxHandler } from '../Engine/messageBox.js';
import SceneAlias from './Alias.js';
import {formatText} from '../Scheduler/FramesHelper.js';
const CH = new BasicConsole();



class MainMenu extends Scene {
    constructor(object) {
        super();
        this.currentIndex = 0;
        this.options = [
            { text: "Start", response: SceneAlias.simulationScreen},
            { text: "Task Manager", response: SceneAlias.taskManager },
            { text: "Settings",response: SceneAlias.systemMenu },
            { text: "Help", response: "-1" },
            { text: "Info", response:  SceneAlias.infoScreen },
            { text: "Exit", response: "Exit" }
        ]
    }
 
    start() {
        this.currentIndex = 0;
        this.timer = setInterval(() => {
            this.currentIndex++;
            if (this.currentIndex > 75) {
                clearInterval(this.timer);
                this.timer = null;
                this.finshed = true;
                return 1;
            }
            this.changed = true;
        }, this.animation_ms);
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
            return this.options[this.currentIndex].response;

        }
    }
}

export { MainMenu };
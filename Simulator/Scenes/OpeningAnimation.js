import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, DefaultColors } from '../Engine/ConsoleHelp.js';
import  Assets  from '../Engine/Assets/Assets.js';
import SceneAlias from './Alias.js';
const CH = new BasicConsole();

class OpeningAnimation extends Scene {
    constructor(animation_ms, onFinish) {
        super();
        this.currentIndex = 0;
        this.timer = null;
        //this has a minimum value of the Engine's tick time
        this.animation_ms = animation_ms;
        this.onFinish = onFinish;
        

    }
    onEnter() {
        this.start();
    }
    onExit() {
        clearInterval(this.timer);
        this.timer = null;
    }
    start() {
        this.currentIndex = 0;
        this.timer =  setInterval(() => {
            this.currentIndex++;
            if (this.currentIndex > 75) {
                clearInterval(this.timer);
                this.timer = null;
                this.onFinish?.();
                
                }
            this.changed = true;
        }, this.animation_ms);
    }
    draw() {

        const perfectpaintedMw = CH.getWidth() > 75 ? CH.merge(
            CH.paint(Assets.Logos.Mattedi, DefaultColors.custom_colors(39)),
            CH.paint(Assets.Logos.Works, DefaultColors.custom_colors(208)),
            { padding: 0 }) : CH.paint(Assets.Logos.Mattedi, DefaultColors.custom_colors(39)) + CH.paint(Assets.Logos.Works, DefaultColors.custom_colors(208));
        const maxIndex = perfectpaintedMw.split('\n').map((line) => {
            return CH.getLineWidth(line);
        }).reduce((a, b) => Math.max(a, b), 0);
        if (this.currentIndex > maxIndex) {
            return CH.hcenter(perfectpaintedMw, CH.getWidth(), " ", this.alignment);
        }
        else {
            const text = perfectpaintedMw.split('\n').map((line) => {
                return CH.getSafeSubstring(line, 0, this.currentIndex);
            }).join("\n");
            return CH.hcenter(text);
        }

    }
    handleInput(input, modifiers) {
        if (input == "enter" || input == "space") {
            return SceneAlias.wecome;
        }
    }
}

export { OpeningAnimation };
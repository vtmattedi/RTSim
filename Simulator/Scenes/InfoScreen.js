import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';

const Colors = DefaultColors;
const CH = new BasicConsole();


class InfoScreen extends Scene {
    constructor(ms = 160) {
        super();

        this.timer = null;
        this.animation_ms = ms;

    }
    onEnter() {
        this.animIndex = 0;
        this.timer = setInterval(() => {
            this.animIndex++;
        }, this.animation_ms);

    };
    onExit() {
        clearInterval(this.timer);
        this.timer = null;

    }
    play(play) {
        //start automatic simulation
        if (play) {
            if (this.timer)
                return;
            this.currentIndex = this.snapHistory.length - 1;
            this.timer = setInterval(() => {
                this.advanceTime();
                if (Math.random() < this.chanceOfNewTask) {
                    this.scheduler.addRandomTask();
                }
            }, 100);
        }
        //stop automatic simulation
        else {
            clearInterval(this.timer);
            this.timer = null;
            this.changed = true;
        }
    }
    keepTrackId() {
        if (this.trackedTaskId !== null) {
            const task = this.getTasks(this.currentTaskIndex).find(task => task.id === this.trackedTaskId);
            if (task) {
                this.selTaskIndex = this.getTasks(this.currentTaskIndex).indexOf(task);
            }
            else {
                this.selTaskIndex = this.trackedTaskId === null ? -2 : 0;
            }
        }
    }
    getTasks = (index) => {
        if (index === 0)
            return this.snapHistory[this.currentIndex].validTasks
        if (index === 1)
            return this.snapHistory[this.currentIndex].tasks
        if (index === 2)
            return this.snapHistory[this.currentIndex].tasks.filter(task => task.completedTime !== null)
        if (index === 3)
            return this.snapHistory[this.currentIndex].tasks.filter(task => task.completedTime !== null && task.completedTime >= this.snapHistory[this.currentIndex].t - 20)
    }
    draw() {
        let sw = `\n\n\n\n\n\n\n\nA long time ago,
in a galaxy far, far away...
It is a period of civil war.
Rebel spaceships, striking
from a hidden base, have won
their first victory against
the evil Galactic Empire.

During the battle, Rebel
spies managed to steal secret
plans to the Empire's
ultimate weapon, the DEATH
STAR, an armored space
station with enough power to
destroy an entire planet.
                        
Pursued by the Empire's
sinister agents, Princess
Leia races home aboard her
starship, custodian of the
stolen plans that can save
her people and restore
freedom to the galaxy....\n\n\n\n`;

        let text = CH.getFigLet(CH.breakLine(sw, 16));
        text = CH.hcenter(text, CH.getWidth());
        text = text.split("\n").slice(this.animIndex, this.animIndex + 30);
        text = text.map((line, index) => {
            let dist = 0;
            let color = 0;
            if (Math.abs(index - 15) < 5) {
                dist = 0;
                color = 226
            }
            else if (Math.abs(index - 15) < 10) {
                dist = 3;
                color = 142
            }
            else {
                dist = 6;
                color = 58;
            }

            return CH.insert_color(Colors.custom_colors(color), line);
        }).join("\n");

        text = CH.vcenter(text, CH.getHeight() - 1, CH.getWidth(), " ", 0);
        text += "\n" + CH.hcenter(CH.insert_color(Colors.custom_colors(Math.abs(Math.floor(Date.now() / 150) % 10 + 1 - 5) + 244), "Press Space to go back."));
        return text

    }


    handleInput(input, modifiers) {
        //Enter or Space to enter the task selection mode
        if (input == "enter" || input == "space" || input == "esc") {
            return "back";
        }
    }
}

export { InfoScreen };
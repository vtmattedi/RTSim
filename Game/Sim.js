// Purpose: Game class to handle the game logic.
import * as ConsoleImpl from './Base/ConsoleHelp.js';
import { State } from './State.js';
import { Scheduler } from './Scheduler/Scheduler.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;

const getTasksString = (tasks, selectedTask) => {
    const slots = [
        {
            Name: "Task ID",
            size: 10,
        },
        {
            Name: "Arrival Time",
            size: 12,
        },
        {
            Name: "Duration",
            size: 10,
        },
        {
            Name: "Priority",
            size: 10,
        },
        {
            Name: "Deadline",
            size: 10,
        },
        {
            Name: "Status",
            size: 10,
        },
        {
            Name: "Visual",
            size: 6
        }

    ]
    let str = "#";
    for (let i = 0; i < slots.length; i++) {
        let slot = CH.hcenter(slots[i].Name, slots[i].size);
        
        str += "|";
        str += slot;
    }
    str += "|#\n";
    const str_len = str.length - 1;
    str += "-".repeat(str.length) + "\n";
    for (let i = 0; i < tasks.length + 1; i++) {

        let taskStr = "";
        if (i == tasks.length) {
            taskStr = CH.hcenter("NEW TASK", str_len - 2);
        }
        else {
            taskStr += "|";
            let task = tasks[i];
            for (let j = 0; j < slots.length; j++) {
                let slot = slots[j];
                let value = "";
                if (slot.Name == "Visual") {
                    value = task.getLine(slot.size);
                }
                else if (slot.Name == "Task ID") {
                    value += CH.insert_color(task.format.color, task.id);
                }
                else if (slot.Name == "Arrival Time") {
                    value += task.arrivalTime;
                }
                else if (slot.Name == "Duration") {
                    value += task.duration;
                }
                else if (slot.Name == "Priority") {
                    value += task.priority;
                }
                else if (slot.Name == "Deadline") {
                    value += task.deadline ? task.deadline : "---";
                }
                let slotStr = CH.hcenter(value, slot.size);
                if (j != slots.length - 1) {
                    slotStr += "|";
                }
                taskStr += slotStr;
            }
            taskStr += "|";
        }

        if (i == selectedTask) {
            taskStr = CH.force_insert_format(taskStr,
                {
                    color: Colors.BLACK,
                    background: Colors.BG_WHITE,
                });
        }
        str += "#" + taskStr + "#\n";
    }
    return str;

}


const SchedulerTypes = {
    ROUND_ROBIN: 0,
    PRIORITY: 1,
    ESF: 2,
    FIFO: 3,
    LIFO: 4
};

class Simulator {
    constructor() {
        this.states = [];
        this.timer = null;
        this.Scheduler = new Scheduler();
        this.index = 0;
        this.maxIndex = 0;
        this.firstChar = true;
        for (let i = 0; i < 10; i++) {
            this.Scheduler.addRandomTask();
        }
        CH.setSelectFormat({
            color: Colors.BLACK,
            background: Colors.BG_WHITE,
            // decoration: [ConsoleImpl.Decorations.Bold]
        });
        this.config = [
            {
                name: "Scheduler Type",
                value: 0,
                min: 0,
                max: 4,
            },
            {
                name: "Time Quantum",
                value: 0,
                min: 1,
                max: Math.pow(2, 32) - 1
            },
            {
                name: "Number of Processors",
                value: 1,
                min: 1,
                max: 32
            },
            {
                name: "Auto Step Time",
                value: 1,
                min: 0,
                max: 1
            }
        ]

        //States:
        this.WelcomeScreen = new State(
            () => {
                CH.printFigLet("Scheduler Simulator");
                CH.print("\n\n");
                let key = CH.insert_format({
                    color: Colors.YELLOW,
                    decoration: [ConsoleImpl.Decorations.Bold,
                    ConsoleImpl.Decorations.Blink]
                }, "key");
                CH.hprint(`Press any ${key} to start.`);
            },
            () => { },
            (input) => {
                this.goToState(this.MainMenu);

            },
            (key) => { })


        this.MainMenu = new State(
            () => {
                CH.clear_screen();
                console.log("c: " + process.stdout.columns, "r: " + process.stdout.rows);
                CH.printFigLet("Main Menu");
                CH.print("\n".repeat(this.config.length + 2));
                this.maxIndex = this.config.length + 2; // + 2 for the exit and start option s
            },
            () => {
                CH.clear_last_line(this.maxIndex) + 1;
                CH.selectHPrint("Back", this.index === 0);
                for (let i = 0; i < this.config.length; i++) {
                    let config = this.config[i];
                    let str = `${config.name}: ${config.value}`;
                    if (config.name == "Scheduler Type") {
                        str += ` (${Object.keys(SchedulerTypes)[config.value]})`;
                    }
                    if (config.name == "Auto Step Time") {
                        str += ` (${config.value == 0 ? "Manual" : "On (1s)"})`;
                    }
                    CH.selectHPrint(str, this.index === i + 1);
                }
                CH.selectHPrint("Start", this.index === this.maxIndex - 1);

            },
            (input) => {
                if (input == "arrowup") {
                    this.index--;
                    if (this.index < 0) {
                        this.index = 0;
                    }
                } else if (input == "arrowdown") {
                    this.index++;
                    if (this.index >= this.maxIndex) {
                        this.index = 0; j
                    }
                }
                if (this.index > 0 && this.index < this.config.length + 1) {
                    let config = this.config[this.index - 1];
                    if (input == "arrowleft") {
                        config.value--;
                        if (config.value < config.min) {
                            config.value = config.max;
                        }
                    } else if (input == "arrowright") {
                        if (this.index == 0) {
                            return;
                        }
                        config.value++;
                        if (config.value > config.max) {
                            config.value = config.min;
                        }
                    }
                    else if (input == "backspace") {
                        let val_str = config.value.toString();
                        if (val_str.length > 1) {
                            val_str = val_str.slice(0, -1);
                        } else {
                            val_str = "0";
                        }
                        config.value = parseInt(val_str);
                    }
                    else if (input[0] >= "0" && input[0] <= "9") {
                        let val = parseInt(input[0]);
                        if (config.max > 9) {
                            val += config.value * 10;
                        }
                        if (val > config.max) {
                            val = config.max;
                        }
                        else if (val < config.min) {
                            val = config.min;
                        }
                        config.value = val;
                    }
                }
            },
            (key) => {
                if (this.index == 0) {
                    this.goBack();
                }
                else if (this.index == this.maxIndex - 1) {
                    this.goToState(this.TaskManager);
                }
            }
        );

        this.TaskManager = new State(
            () => {
                CH.clear_screen();
                CH.printFigLet("Configure Tasks");
                CH.print("\n\n");
                this.maxIndex = this.Scheduler.tasks.length + 2;
                CH.print("\n".repeat(this.maxIndex + 4));

            },
            () => {
                CH.clear_last_line(this.maxIndex + 4);
                CH.print("#".repeat(CH.getWidth()));
                CH.hprint(getTasksString(this.Scheduler.tasks, this.index - 1));
                CH.print("#".repeat(CH.getWidth()));
            },
            (input) => {
                if (input == "arrowup") {
                    this.index--;
                    if (this.index < 0) {
                        this.index = this.maxIndex;
                    }
                } else if (input == "arrowdown") {
                    this.index++;
                    if (this.index >= this.maxIndex) {
                        this.index = 0;
                    }
                }

            },
            (key) => { }
        );
        this.states.push(this.WelcomeScreen);
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

    end() {
        CH.clear_last_line(1);
        CH.print("Game Over");
        process.exit(0);
    }
    handleInput(input) {
        if (input == "enter" || input == "space") {
            this.getCurrentState()?.onSelect(input);
        }
        else {
            this.getCurrentState()?.changeState(input);
            this.getCurrentState()?.render();
        }

    }


}

export { Simulator };
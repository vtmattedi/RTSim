import Assets from './Game/Assets/Assets.js';
import * as ConsoleImpl from './Game/Base/ConsoleHelp.js';
import process from 'process';
import readline from 'readline';
import { Simulator } from './Game/Sim.js';
import { on } from 'events';
import { getFiGlet } from './Game/Assets/Fonts.js';
import { Scheduler, TaskStates } from './Game/Scheduler/Scheduler.js';
import { Task } from './Game/Scheduler/Scheduler.js';
import { genTaskTable } from './Game/Scheduler/FramesHelper.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
process.stdin.setRawMode(true);
readline.emitKeypressEvents(process.stdin);

CH.setTitle('Scheduler Simulator');
CH.show_cursor(false);
CH.clear_screen();
CH.clear_screen = () => {
    process.stdout.write('\x1B[0f');
};

const getTasksString = (tasks, selIndex, attrIndex) => {
    attrIndex = attrIndex + 1 || -1;
    // sch.tasks = sch.tasks.filter(task => task.status === TaskStates.running || task.status === TaskStates.ready || sch.t - task.completedTime <= 20);
    // sch.tasks.sort((a, b) => {
    //     if (a.priority === b.priority) {
    //         return a.arrivalTime - b.arrivalTime; // If priorities are equal, sort by arrival time
    //     }
    //     return b.priority - a.priority; // Sort by priority (highest first)
    // });

    const _maxRows = Math.round(CH.getHeight() - 19);
    const genTasks = (taskArray, maxRows) => {
     

        const rowLength = slots.reduce((acc, slot) => acc + slot.width, 0) + slots.length + 1;
        const title = CH.hcenter(CH.insert_format({
            decoration: [
                ConsoleImpl.Decorations.Bold, ConsoleImpl.Decorations.Underlined]
        }, "Processor Task List Editor"), rowLength);
        let str = title + "\n+";
        for (let i = 0; i < slots.length; i++) {
            str += CH.hcenter(slots[i].name, slots[i].width, "-") + "+";
        }
        str += "\n";

        const getIndexRange = (index, length, maxRows) => {
            // maxRows = 18
            const half = Math.floor(maxRows / 2);
            const even = maxRows % 2 == 0 ? 1 : 0;
            //console.log("Index: " + index, index + half, index - half, "Length: " + length, "H:" +half, index - half, length - index);
            //case 1: if the length is less than maxRows, return the whole array
            if (length <= maxRows) {
                return { start: 0, end: length, _case: 1 };
            }
            //case 2: if there is less than half elements before the index, return the first half elements -1 for the header
            if ((index + 1) - half <= 0) {
                // if ((index + 1) - half  == 0)
                //     return { start: 1, end: maxRows -1, _case: 2};
                // else 
                return { start: 0, end: maxRows - 1, _case: 2 };
            }
            //case 3: if there is less than half elements after the index, return the first half elements -1 for the header
            if (length - index < half) {
                return { start: length - (maxRows - 1), end: length, _case: 3 };
            }
            //case 4: if the index is in the middle, return the elements around the index minus one on each end for the header and footer
            const special = index - half + even === 1;//if the start is 1 then it is better to print a proper row then to print the ehader saying there is another row above
            return { start: special ? 0 : index - half + even, end: index + half - 1, _case: 4 };

        };

        const { start, end, _case } = getIndexRange(selIndex, taskArray.length, maxRows);
        const useSafeTerminal = false; // Change this to true to use ASCII characters only
        const arrowUp = (useSafeTerminal ? "^" : "↑").repeat(3);
        const arrowDown = (useSafeTerminal ? "v" : "↓").repeat(3);
        if (start > 0) {
            str += "+" + CH.hcenter(arrowUp + " +" + (start) + /*" total: " + taskArray.length + */" " + arrowUp, rowLength - 2) + "+\n";
        }

        for (let i = start; i < end; i++) {
            let line = "";

            if (!taskArray[i]) {
                console.log("Task not found: " + i, taskArray.length);
                console.log("Start Index: " + start, "Max Rows: " + maxRows, "End: " + end, "Length: " + taskArray.length);
                console.log(str);
                throw new Error("Task not found: " + i);

            }
            for (let j = 0; j < slots.length; j++) {
                let val = ""
                if (slots[j].name == "TASKS") {
                    val += "ID: " + CH.insert_color(
                        Colors.custom_colors(taskArray[i].color), "" + taskArray[i].id);
                }
                else if (slots[j].name == "BURST") {
                    val += "" + taskArray[i].burstTime;
                }
                else if (slots[j].name == "DEAD") {
                    val += taskArray[i].deadline ? "" + (taskArray[i].arrivalTime + taskArray[i].deadline) : "---";
                }
                else if (slots[j].name == "PRIO") {
                    val += "" + taskArray[i].priority;
                }
                else if (slots[j].name == "PIN") {
                    val += taskArray[i].pinToCore !== null ? "" + taskArray[i].pinToCore : "---";
                }
                else if (slots[j].name == "CLR") {
                    val += CH.insert_color(
                        Colors.custom_colors(taskArray[i].color), "" + taskArray[i].color);
                }
                else if (slots[j].name == "PERI") {
                    val += taskArray[i].deadline ? "YES" : "NO";
                }
                if (j == attrIndex && selIndex == i) {
                    const arrowUpDown = "↕" 
                    val = CH.hcenter(val, slots[j].width -1) + arrowUpDown; 
                    val = CH.insert_format({
                        color: Colors.WHITE,
                        background: Colors.custom_colors(237, true),
                        decoration: [ConsoleImpl.Decorations.Bold],
                    }, val);
                }
                line += CH.hcenter(val, slots[j].width);
                if (j < slots.length - 1) {
                    line += "|";
                }
            }

            if (i === selIndex) {
                line = CH.insert_format({
                    color: Colors.BLACK,
                    background: Colors.BG_WHITE,
                    decoration: [ConsoleImpl.Decorations.Bold],
                }, line);


            }
            str += "|" + line + "|\n";
        }
        if (end < taskArray.length)
            str += "+" + CH.hcenter(arrowDown + " +" + (taskArray.length - end) + /*" total: " + taskArray.length + */ " " + arrowDown, rowLength - 2) + "+\n";

        let bottomstr = "+";
        for (let i = 0; i < slots.length; i++) {
            bottomstr += CH.hcenter("", slots[i].width, "-") + "+";
        }


        return str + bottomstr + "\n";
    }


    const spr = genTasks(tasks, _maxRows )
    return {text: spr, size: _maxRows - tasks.length - 1};
}


const sch = new Scheduler(4);
for (let i = 0; i < 25; i++) {
    sch.addRandomTask();
}


let edit = false
const TaskFrame = (task, index, index2) => {
    CH.clear_screen();
    console.log(index, index2);
 

    const slots = [
        { name: "TASKS", width: 9, getValue: (task, index) => { return "ID: " + CH.insert_color(Colors.custom_colors(task.color), "" + task.id); } },
        { name: "BURST", width: 5, getValue: (task, index) => { return "" + task.burstTime; } },
        { name: "DEAD", width: 6, getValue: (task, index) => { return task.deadline ? "" + (task.arrivalTime + task.deadline) : "---"; } },
        { name: "PRIO", width: 6, getValue: (task, index) => { return "" + task.priority; } },
        { name: "PIN", width: 5, getValue: (task, index) => { return task.pinToCore !== null ? "" + task.pinToCore : "---"; } },
        { name: "CLR", width: 5, getValue: (task, index) => { return CH.insert_color(Colors.custom_colors(task.color), "" + task.color); } },
        { name: "PERI", width: 6, getValue: (task, index) => { return task.deadline ? "YES" : "NO"; } },
    ]
    const text = genTaskTable(task, slots, CH.getHeight() - 19, {
        col: edit? index2 + 1 : -1,
        row: index,
    }, "Task List Editor");
    CH.print(text);
    console.log(CH.getHeight() - 19)
    
};



const changeAttr = (task, attrindex, isLeft) => {
    if (!task)
        return;
    if (attrindex < 0 || attrindex > 5) {
    };

    if (attrindex == 0) {
        task.burstTime = isLeft ? task.burstTime - 1 : task.burstTime + 1;
        if (task.burstTime <= 0) {
            task.burstTime = 1;
        }
    }
    else if (attrindex == 1) {
        if (task.deadline === null) {
            task.deadline = 0;
        }
        task.deadline = isLeft ? task.deadline - 1 : task.deadline + 1;
        if (task.deadline <= 0) {
            task.deadline = null;
        }
    }
    else if (attrindex == 2) {
        task.priority = isLeft ? task.priority - 1 : task.priority + 1;
        if (task.priority <= 0) {
            task.priority = 1;
        }
    }
    else if (attrindex == 3) {
        task.pinToCore = isLeft ? task.pinToCore - 1 : task.pinToCore + 1;
        if (task.pinToCore < 0) {
            task.pinToCore = null;
        }
        if (task.pinToCore >= sch.numProcessors) {
            task.pinToCore = sch.numProcessors - 1;
        }
    }
    else if (attrindex == 4) {
        task.color = isLeft ? task.color - 1 : task.color + 1;
        if (task.color < 0) {
            task.color = 0;
        }
    }
    else if (attrindex == 5) {

    }
}

process.stdout.on('resize', () => {


});
let delCount = 0;
let selIndex = 0;
let arrIndex = 0;
// t = 0
TaskFrame(sch.tasks, selIndex, 0);
process.stdin.on('keypress', (key, data) => {

    // console.log(key, data);

    if (delCount > 0) {
        CH.clear_last_line(delCount);
        delCount = 0;
    }
    let input = "";

    if (typeof data.name === "undefined") {
        input = data.sequence;
    }
    else if (data.name === "up") input = "arrowup";
    else if (data.name === "down") input = "arrowdown";
    else if (data.name === "left") input = "arrowleft";
    else if (data.name === "right") input = "arrowright";
    else if (data.name === "space") input = "space";
    else if (data.name === "return") input = "enter";
    else if (data.name === "escape") input = "esc";
    else if (data.name === "backspace") input = "backspace";
    else input = data.name;


    if (input == "p") {


    }
    if (input == "l") {
        console.log(CH.getWidth(), CH.getHeight());
    }
    if (input == "e") {
        edit = !edit;
        TaskFrame(sch.tasks, selIndex, arrIndex);

    }
    if (input == "a") {
        sch.addRandomTask();
        TaskFrame(sch.tasks, selIndex = sch.tasks.length - 1, arrIndex);
    }

    if (input == "arrowleft") {
        if (edit) {
            arrIndex--;
            if (arrIndex < 0) {
                arrIndex = 5;
            }
            TaskFrame(sch.tasks, selIndex, arrIndex);
        }
    }
    else if (input == "arrowright") {
        if (edit) {
            arrIndex++;
            if (arrIndex >= 6) {
                arrIndex = 0;
            }
            TaskFrame(sch.tasks, selIndex, arrIndex);
        }
    }

    else if (input == "arrowup") {
        if (edit && !data.shift) {
            changeAttr(sch.tasks[selIndex], arrIndex, false);
        }
        else {
            selIndex--;
            if (selIndex < 0) {
                selIndex = 0;
            }
        }
        TaskFrame(sch.tasks, selIndex, arrIndex);
    }
    else if (input == "arrowdown") {
        if (edit && !data.shift) {
            changeAttr(sch.tasks[selIndex], arrIndex, true);

        }
        else {
            selIndex++;
            if (selIndex >= sch.tasks.length) {
                selIndex = sch.tasks.length - 1;
            }
        }
        TaskFrame(sch.tasks, selIndex, arrIndex);

    }
    else if (input == "enter") {
        edit = !edit;
        TaskFrame(sch.tasks, selIndex, arrIndex);
    }
    else if (input === "pagedown") {
        selIndex += 5;
        if (selIndex >= sch.tasks.length) {
            selIndex = sch.tasks.length - 1;
        }
        TaskFrame(sch.tasks, selIndex, arrIndex);
    }
    else if (input === "pageup") {
        selIndex -= 5;
        if (selIndex < 0) {
            selIndex = 0;
        }
        TaskFrame(sch.tasks, selIndex, arrIndex);
    }

    if (input === "home") {
        selIndex = 0;
        TaskFrame(sch.tasks, selIndex, arrIndex);
    }
    if (input === "end") {
        selIndex = sch.tasks.length - 1;
        TaskFrame(sch.tasks, selIndex, arrIndex);
    }
    if (data.ctrl && data.name === 'd') {
        delCount += CH.controlPrint("Width: " + CH.getWidth());
        console.log("del: " + delCount++);
    }

    console.log("Key: " + key, "Data: " + data.name, "Input: " + input, "Shift: " + data.shift, "Ctrl: " + data.ctrl, "Meta: " + data.meta, "Alt: " + data.alt);

    if (data && data.ctrl && data.name === 'c') {
        console.clear();
        CH.write("\x1b[3J");
        CH.show_cursor(true);
        process.exit();

    }
});



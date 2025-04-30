import * as ConsoleImpl from './Game/Base/ConsoleHelp.js';
import process from 'process';
import readline from 'readline';
import { Scheduler, TaskStates } from './Game/Scheduler/Scheduler.js';
import MessageBoxHandler from './Game/messageBox.js';
import { genTaskTable, genProcessorGraph, genProcessorsFrame } from './Game/Scheduler/FramesHelper.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
process.stdin.setRawMode(true);
readline.emitKeypressEvents(process.stdin);
CH.clear_screen();
CH.clear_screen = () => {
    process.stdout.write('\x1B[0f');
}

CH.setTitle('Scheduler Simulator');
CH.show_cursor(false);

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

const history = [];

const printHistory = (hist, config = { processors: 2 }) => {
    let str = "";
    for (let i = 0; i < config.processors; i++) {
    };
}

const printCurrentState = (sch) => {
    let str = "";
    for (let i = 0; i < sch.numProcessors; i++) {
        str += "Processor " + i + ": ";
        if (sch.currentTasks[i]) {
            str += sch.currentTasks[i].getLine(10);
        }
        else {
            str += "IDLE";
        }
        str += "\n";
    }
    return str;
}




const processSpr = (sch) => {
    let str = "+-Processor-(#N)-+--TASK--+";
    str += "\n";
    for (let i = 0; i < sch.numProcessors; i++) {
        str += "|";
        str += CH.hcenter("Core " + i, 16);
        str += "|";
        let task = sch.currentTasks[i] ? "ID: " + CH.insert_color(sch.currentTasks[i].format.color, "" + sch.currentTasks[i].id) : "IDLE";
        if (!sch.currentTasks[i]) {
            task = CH.insert_color(Colors.LIGHTBLACK_EX, task);
        }
        str += CH.hcenter(task, 8, " ", sch.currentTasks[i] ? 1 : 0);
        str += "|";
        str += "\n";
    }
    str += "+----------------+--------+\n";

    const slots = [
        { name: "Processor-(#N)", width: 16, getValue: (task, i) => "Core #" + i },
        {
            name: "TASK", width: 8, getValue: (task) => {
                let txt = task ? "ID: " + CH.insert_color(task.format.color, "" + task.id) : CH.insert_color(Colors.LIGHTBLACK_EX, "IDLE");
                return CH.hcenter(txt, 8, " ", task ? 1 : 0);

            }
        },
    ]
    const maxRows = sch.numProcessors;



    return genTasksList(sch.currentTasks, slots, maxRows);
}

const taskSpr = (sch, select = {
    row: -1,
    col: -1
}) => {

    // sch.tasks = sch.tasks.filter(task => task.status === TaskStates.running || task.status === TaskStates.ready || sch.t - task.completedTime <= 20);
    // sch.tasks.sort((a, b) => {
    //     if (a.priority === b.priority) {
    //         return a.arrivalTime - b.arrivalTime; // If priorities are equal, sort by arrival time
    //     }
    //     return b.priority - a.priority; // Sort by priority (highest first)
    // });

    const _maxRows = Math.round(CH.getHeight() - 19);
    const genTasks = (taskArray, maxRows) => {
        const useSafeTerminal = false; // Change this to true to use ASCII characters onl
        const arrowDown = (useSafeTerminal ? "v" : "↓").repeat(3);
        const slots = [
            { Name: "TASKS", size: 9 },
            { Name: "REM", size: 5 },
            { Name: "ARR", size: 5 },
            { Name: "DEAD", size: 6 },
            { Name: "PRIO", size: 6 },
            { Name: "PIN", size: 5 },
            { Name: "END", size: 5 },
            { Name: "STATUS", size: 10 }
        ]

        let str = "+--TASKS--+-REM-+-ARR-+-DEAD-+-PRIO-+-PIN-+-END-+--STATUS--+\n";
        const procMaxRows = maxRows < taskArray.length
        for (let i = 0; i < Math.min(taskArray.length, maxRows); i++) {
            let line = "";
            //line += "|";
            line += CH.hcenter("ID: " + CH.insert_color(taskArray[i].format.color, "" + taskArray[i].id), 9);
            line += "|";
            line += CH.hcenter("" + taskArray[i].remainingTime, 5);
            line += "|";
            line += CH.hcenter("" + taskArray[i].arrivalTime, 5);
            line += "|";
            line += CH.hcenter(taskArray[i].deadline ? "" + (taskArray[i].arrivalTime + taskArray[i].deadline) : "---", 6);
            line += "|";
            line += CH.hcenter("" + taskArray[i].priority, 6);
            line += "|";
            line += CH.hcenter(taskArray[i].pinToCore !== null ? "" + taskArray[i].pinToCore : "---", 5);
            line += "|";
            line += CH.hcenter(taskArray[i].completedTime !== null ? "" + taskArray[i].completedTime : "---", 5);
            line += "|";
            line += CH.hcenter(taskArray[i].status, 10);
            // line += "|";
            if (taskArray[i].status == TaskStates.running) {
                line = CH.force_insert_format(line,
                    {
                        decoration: [ConsoleImpl.Decorations.Bold, ConsoleImpl.Decorations.Underlined],
                    });
            }
            str += "|" + line + "|\n";
        }
        if (procMaxRows)
            str += "+" + CH.hcenter(arrowDown + "+" + (taskArray.length - maxRows) + " total: " + taskArray.length, 58) + "+\n";
        let bottomstr = "+";
        for (let i = 0; i < slots.length; i++) {
            bottomstr += CH.hcenter("", slots[i].width, "-") + "+";
        }
        return str;
    }
    const titles =
        ["Processor Task List", "Recently Fininshed Tasks"]
    const valid = titles[0] + "\n" + genTasks(sch.validTasks, _maxRows);
    const finished = titles[1] + "\n" + genTasks(sch.tasks.filter(task => task.completedTime !== null && sch.t - task.completedTime < 20).sort((a, b) => {
        if (a.completedTime === b.completedTime) {
            return a.arrivalTime - b.arrivalTime; // If completed times are equal, sort by arrival time
        }
        return a.completedTime - b.completedTime;
    }), _maxRows);

    const slots = [
        { name: "TASKS", width: 9, getValue: (task) => CH.hcenter("ID: " + CH.insert_color(task.format.color, "" + task.id), 9, " ", 1) },
        { name: "REM", width: 5, getValue: (task) => "" + task.remainingTime },
        { name: "ARR", width: 5, getValue: (task) => "" + task.arrivalTime },
        { name: "DEAD", width: 6, getValue: (task) => task.deadline ? "" + (task.arrivalTime + task.deadline) : "---" },
        { name: "PRIO", width: 6, getValue: (task) => "" + task.priority },
        { name: "PIN", width: 5, getValue: (task) => task.pinToCore !== null ? "" + task.pinToCore : "---" },
        { name: "END", width: 5, getValue: (task) => task.completedTime !== null ? "" + task.completedTime : "---" },
        { name: "STATUS", width: 10, getValue: (task) => task.status }
    ]
    const valid2 = genTasksList(sch.validTasks, slots, _maxRows,
        {
            row: select.col == 0 ? select.row : -1,
            col: -1
        },
        titles[0]
    );
    const finished2 = genTasksList(sch.tasks, slots, _maxRows,
        {
            row: select.col == 1 ? select.row : -1,
            col: -1
        },
        titles[1]
    );
   //c onsole.log(_maxRows, sch.validTasks.length - _maxRows, valid2.split("\n").length, finished2.split("\n").length);
    return { text: CH.merge(valid2, finished2, { padding: 2 }), diff: _maxRows - sch.validTasks.length };
}

const sch = new Scheduler(4);
for (let i = 0; i < 15; i++) {
    sch.addRandomTask();
}

sch.tick();
const snap2 = sch.getSnapshot();
history.push(snap2);
const proc = genProcessorGraph(history, history.length-1,30);

const slots = [
    { name: "Processor-(#N)", width: 16, getValue: (task, i) => "Core #" + i },
    {
        name: "TASK", width: 8, getValue: (task) => {
            let txt = task ? "ID: " + CH.insert_color(task.format.color, "" + task.id) : CH.insert_color(Colors.LIGHTBLACK_EX, "IDLE");
            return CH.hcenter(txt, 8, " ", task ? 1 : 0);

        }
    },
]
const maxRows = sch.numProcessors;
const list = genTaskTable(sch.currentTasks, slots, maxRows);

console.log (CH.getWidth(), CH.getHeight())
const width = proc.split("\n").reduce((max, line) => Math.max(max,CH.getLineWidth(line)), 0);
const height = proc.split("\n").length;

console.log(proc);
console.log(height,width)

const width2 = list.split("\n").reduce((max, line) => Math.max(max,CH.getLineWidth(line)), 0);
const height2 = list.split("\n").length;
console.log(list);
console.log(height2,width2)
console.log(genProcessorsFrame(history, history.length-1))
process.exit(0);


let inspectmode = { enable: false, task: -1, index: -1, maxIndex:0, id: -1 };

const schedulerFrame = (snap) => {
    //Min size = 60x22
    CH.clear_screen();
    CH.printFigLet("Simulation");
    CH.hprint(`\nProcessors: ${snap.numProcessors} Type: ${sch.model.name} Time: ${snap.t} \n`);
    const spr1 = processSpr(snap);
    const rowIndex = snap.validTasks.findIndex(task => task.id === inspectmode.id) | inspectmode.index;
    const { text, diff } = taskSpr(snap, {
        row: inspectmode.enable ? rowIndex : -1,
        col: inspectmode.enable ? inspectmode.task : -1
    });
    const spr3 = processGraphSpr(history, currentSnap);
    const final = CH.merge(spr1, spr3, { padding: 4 });

    CH.print(final);

    const valid = text.split("\n").map(line => {
        return CH.getSafeSubstring(line, 0, 59);
    }).filter(line => line != " ".repeat(60)).join("\n");

    CH.hwrite(valid);
    //console.log(diff, sch.validTasks.length, sch.tasks.length);
    for (let i = 0; i < diff; i++) {
        CH.hprint(" ".repeat(CH.getLineWidth()));
    }
    return;

    if (CH.getWidth() < 122) {
        const valid = spr2.split("\n").map(line => {
            return CH.getSafeSubstring(line, 0, 59);
        }).filter(line => line != " ".repeat(60)).join("\n");
        const finished = spr2.split("\n").map(line => {
            return CH.getSafeSubstring(line, 61, 122);
        }).filter(line => line != " ".repeat(60)).join("\n");
        CH.hprint(valid);
        CH.hprint(finished);
    }
    else
        CH.write(CH.hcenter(spr2, CH.getWidth()));
    return;
    if (CH.getWidth() > 93) {
        const final = CH.merge(spr1, spr2);
        CH.hprint(final);
    }
    else {
        CH.hprint(spr1);
        CH.hprint(spr2);
    }
    //const width = final.split("\n").reduce((max, line) => Math.max(max, CH.getLineWidth(line)), 0);
    //console.log(CH.getWidth(), width);
    CH.set_cursor_pos(0, -1 * (sch.numProcessors + 10));
    const spr = processGraphSpr(history, currentSnap);
    CH.print(CH.hcenter(spr, -1, " ", 1));
}

const tickScheduler = () => {
    sch.tick();
    const snap = sch.getSnapshot();
    history.push(snap);
    //schedulerFrame(snap);
}

let p = null;

const myTick = () => {
    p = setTimeout(() => {
        tickScheduler();
        currentSnap = history.length - 1;
        if (Math.random() > 0.75) {
            sch.addRandomTask();
        }
        schedulerFrame(history[history.length - 1]);
        myTick();
    }, 50);
}


process.stdout.on('resize', () => {
    schedulerFrame(history[history.length - 1]);
    if (mbox.open) {
        mbox.print();
    }

});
let delCount = 0;
let currentSnap = 0;
// t = 0
const snap = sch.getSnapshot();
history.push(snap);
schedulerFrame(snap);
const mbox = new MessageBoxHandler();
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
    if (data && data.ctrl && data.name === 'c') {
        console.clear();
        CH.write("\x1b[3J");
        CH.show_cursor(true);
        process.exit();

    }
    if (mbox.open) {
        if (input == "enter") {
            const res = mbox.handleInput(0);
            schedulerFrame(history[currentSnap]);
            if (mbox.open) {
                mbox.print();
            }

        }
        else if (input == "arrowleft") {
            mbox.handleInput(-1);
            mbox.print();
        }
        else if (input == "arrowright") {
            mbox.handleInput(1);
            mbox.print();
        }
        return;
    }

    if (input === "a") {
        sch.addRandomTask();
        currentSnap = history.length - 1;
        schedulerFrame(history[currentSnap]);
    }
    if (input == "p") {
       
        if (p === null) {
            myTick();
        }
        else {
            clearTimeout(p);
            p = null;
        }

    }
    if (input == "i") {
        inspectmode.enable = !inspectmode.enable;
        if (inspectmode.enable) {
            clearTimeout(p);
            p = null;
        }
    }
    if (input == "l") {
        console.log(CH.getWidth(), CH.getHeight());
    }

    if (input == "arrowright") {
        if (inspectmode.enable && !data.shift) {
            inspectmode.task++;
            inspectmode.index = 0;
            if (inspectmode.task === 0)
                inspectmode.maxIndex = history[currentSnap].validTasks.length - 1;
    
            if (inspectmode.task > 1) {
                inspectmode.task = -1;
            }
            schedulerFrame(history[currentSnap]);
            return;
        }

        const oldIndexID = history[currentSnap]?.validTasks[inspectmode.index]?.id


        currentSnap++;
        if (currentSnap >= history.length) {
            tickScheduler();

        }
        if (inspectmode.enable) {
            inspectmode.index = history[currentSnap].validTasks.findIndex(task => task.id == oldIndexID);

        }
        if (inspectmode.index === null)
            inspectmode.index = -1;

        schedulerFrame(history[currentSnap]);
    }
    if (input == "arrowleft") {
        if (inspectmode.enable && !data.shift) {
            inspectmode.task--;
            inspectmode.index = 0;
            if (inspectmode.task < -1) {
                inspectmode.task = 1;
            }

            if (inspectmode.task === 0)
                inspectmode.maxIndex = history[currentSnap].validTasks.length - 1;
            else if (inspectmode.task === 1) {
                inspectmode.maxIndex = history[currentSnap].tasks.length - 1;
            }

            schedulerFrame(history[currentSnap]);
            return;
        }

        const oldIndexID = history[currentSnap]?.validTasks[inspectmode.index]?.id


        currentSnap--;
        if (currentSnap < 0) {
            currentSnap = 0;
        }

        if (inspectmode.enable) {
            inspectmode.index = history[currentSnap].validTasks.findIndex(task => task.id == oldIndexID);

        }
        if (inspectmode.index === null)
            inspectmode.index = -1;

        schedulerFrame(history[currentSnap]);
    }
    if (input == "arrowup") {
        if (inspectmode.enable) {
            inspectmode.index--;
            if (inspectmode.index < 0) {
                inspectmode.index = 0;
            }
            inspectmode.id = history[currentSnap].validTasks[inspectmode.index].id;
            schedulerFrame(history[currentSnap]);
            return;
        }
    }
    if (input == "arrowdown") {
        if (inspectmode.enable) {
            inspectmode.index++;
            if (inspectmode.index > inspectmode.maxIndex) {
                inspectmode.index = inspectmode.maxIndex;
            }
            inspectmode.id = history[currentSnap].validTasks[inspectmode.index].id;
            schedulerFrame(history[currentSnap]);
            return;
        }
    }
    else if (input == "m") {
        mbox.raise("Test Message", "Test Title", ["YES", "NO"],
            (res) => {
                mbox.raise("Result: " + res, "Test Title");
            }
        );
        mbox.print();
    }
    if (data.ctrl && data.name === 'd') {
        delCount += CH.controlPrint("Width: " + CH.getWidth());
        console.log("del: " + delCount++);
    }





});



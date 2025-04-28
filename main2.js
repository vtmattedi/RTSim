import Assets from './Game/Assets/Assets.js';
import * as ConsoleImpl from './Game/Base/ConsoleHelp.js';
import process from 'process';
import readline from 'readline';
import { Simulator } from './Game/Sim.js';
import { on } from 'events';
import { getFiGlet } from './Game/Assets/Fonts.js';
import { Scheduler, TaskStates } from './Game/Scheduler/Scheduler.js';
import { Task } from './Game/Scheduler/Scheduler.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
process.stdin.setRawMode(true);
readline.emitKeypressEvents(process.stdin);

CH.setTitle('Scheduler Simulator');
CH.show_cursor(false);
CH.clear_screen();
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

const processGraphSpr = (history, currentIndex) => {
    let cores = "t:\n";
    for (let i = 0; i < history[currentIndex].numProcessors; i++) {
        cores += "Core " + i + ":\n";
    }
    const cores_len = cores.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
    cores = CH.hcenter(cores, cores_len, " ", 2);
    const len_per_t = 3;
    const num_of_t = Math.floor(CH.getWidth() / (len_per_t + 1)) - cores_len - 4;

    let res = "";
    for (let i = 0; i < num_of_t; i++) {
        const index = currentIndex - i;
        if (index >= 0) {
            let currentSlice = CH.hcenter("" + history[index].t, len_per_t);
            if (history[index].t > 999) {
                currentSlice = currentSlice[0] + "." + currentSlice[currentSlice.length - 1];
            }
            currentSlice += "|\n";

            for (let j = 0; j < history[index].numProcessors; j++) {
                currentSlice += history[index].currentTasks[j] ? Task.getLine(history[index].currentTasks[j], len_per_t + 1) : "----";
                currentSlice += "\n";
            }
            res = CH.merge(currentSlice, res, { padding: 0 });
        }

    }
    return CH.merge(cores, res, { padding: 0 });
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
    return str;
}

const taskSpr = (sch) => {

    // sch.tasks = sch.tasks.filter(task => task.status === TaskStates.running || task.status === TaskStates.ready || sch.t - task.completedTime <= 20);
    // sch.tasks.sort((a, b) => {
    //     if (a.priority === b.priority) {
    //         return a.arrivalTime - b.arrivalTime; // If priorities are equal, sort by arrival time
    //     }
    //     return b.priority - a.priority; // Sort by priority (highest first)
    // });

    const _maxRows = Math.round(CH.getHeight() / 2 - 10);
    const genTasks = (taskArray, maxRows) => {
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
            str += "+" + CH.hcenter("+" + (taskArray.length - maxRows) + " total: " + taskArray.length, 58) + "+\n";
        str += "+---------+-----+-----+------+------+-----+-----+----------+\n";
        return str;
    }
    const titles =
        [
            CH.hcenter(CH.insert_format({
                decoration: [
                    ConsoleImpl.Decorations.Bold, ConsoleImpl.Decorations.Underlined]
            }
                , "Processor Task List"), 60),
            CH.hcenter(CH.insert_format({
                decoration: [
                    ConsoleImpl.Decorations.Bold, ConsoleImpl.Decorations.Underlined]
            }
                , "Recently Fininshed Tasks"), 60)
        ]
    const valid = titles[0] + "\n" + genTasks(sch.validTasks, _maxRows);
    const finished = titles[1] + "\n" + genTasks(sch.tasks.filter(task => task.completedTime !== null && sch.t - task.completedTime < 20).sort((a, b) => {
        if (a.completedTime === b.completedTime) {
            return a.arrivalTime - b.arrivalTime; // If completed times are equal, sort by arrival time
        }
        return a.completedTime - b.completedTime;
    }), _maxRows);

    return CH.merge(valid, finished, { padding: 2 });
}

const sch = new Scheduler(4);
for (let i = 0; i < 15; i++) {
    sch.addRandomTask();
}

const schedulerFrame = (snap) => {
    CH.clear_screen();
    CH.printFigLet("Simulation");
    //console.log(CH.getWidth());
    CH.hprint(`\nProcessors: ${snap.numProcessors} Type: ${sch.model.name} Time: ${snap.t} \n`);
    const spr1 = processSpr(snap);
    const spr2 = taskSpr(snap);
    const spr3 = processGraphSpr(history, currentSnap);
    const final = CH.merge(spr1, spr3, { padding: 4 });
    CH.print(final);
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
        CH.hprint(spr2);
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
    schedulerFrame(snap);
}

let p = null;

const myTick = () => {
    p = setTimeout(() => {
        tickScheduler();
        currentSnap = history.length - 1;
        if (Math.random() > 0.75) {
            sch.addRandomTask();
            schedulerFrame(history[history.length - 1]);
        }
        myTick();
    }, 1);
}


process.stdout.on('resize', () => {
    schedulerFrame(history[history.length - 1]);

});
let delCount = 0;

let currentSnap = 0;
// t = 0
const snap = sch.getSnapshot();
history.push(snap);
schedulerFrame(snap);
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
    if (input == "l") {
       console.log(CH.getWidth(), CH.getHeight());
    }

    if (input == "arrowright") {
        currentSnap++;
        if (currentSnap >= history.length) {
            tickScheduler();
        }
        else
            schedulerFrame(history[currentSnap]);
    }
    if (input == "arrowleft") {
        currentSnap--;
        if (currentSnap < 0) {
            currentSnap = 0;
        }
        else
            schedulerFrame(history[currentSnap]);
    }

    if (data.ctrl && data.name === 'd') {
        delCount += CH.controlPrint("Width: " + CH.getWidth());
        console.log("del: " + delCount++);
    }




    if (data && data.ctrl && data.name === 'c') {
        console.clear();
        CH.write("\x1b[3J");
        CH.show_cursor(true);
        process.exit();

    }
});



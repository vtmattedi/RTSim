import * as ConsoleImpl from '../Engine/ConsoleHelp.js';
import { Task } from './Scheduler.js';
import {Arrows, delta } from '../Engine/Symbols.js';

const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;


/**
 * Generates a formatted task table for display in the console.
 * Its height will always be 3 + (maxRows - 1) width will vary with slots size.
 * @param {Array<Task>} taskArray - Array of task objects to display in the table.
 * @param {Array<Object>} slots - Array of slot definitions, each containing:
 *   - `name` {string}: The name of the slot.
 *   - `width` {number}: The width of the slot.
 *   - `getValue` {function}: A function to extract the value for the slot from a task object.
 * @param {number} slots.width - The width of each slot column.
 * @param {number} maxRows - The maximum number of rows to display in the table.
 * @param {Object} [select={ row: -1, col: -1 }] - The selected cell in the table:
 *   - `row` {number}: The selected row index.
 *   - `col` {number}: The selected column index.
 * @param {string} [title=""] - The title of the table.
 * @returns {string} - The formatted task table as a string.
 */
const genTaskTable = (taskArray, slots, maxRows, select = { row: -1, col: -1 }, title = "") => {
    const selIndex = select.row;
    const attrIndex = select.col;
    const rowLength = slots.reduce((acc, slot) => acc + slot.width, 0) + slots.length + 1;
    let str = ""

    if (title !== "") {
        let fmt = {
            decoration: [
                ConsoleImpl.Decorations.Bold, ConsoleImpl.Decorations.Underlined]
        };
        if (selIndex === -1) {
            title = " " + Arrows.left + " " + title + " " + Arrows.right + " ";
            fmt.background = Colors.BG_WHITE;
            fmt.color = Colors.custom_colors(17);
        }
        str += CH.hcenter(CH.insert_format(fmt, title), rowLength) + "\n";
    }
    str += "+"
    for (let i = 0; i < slots.length; i++) {
        str += CH.hcenter(slots[i].name, slots[i].width, "-") + "+";
    }
    str += "\n";

    const getIndexRange = (index, length, maxRows) => {
        // maxRows = 15
        const half = Math.floor(maxRows / 2);
        //const even = maxRows % 2 === 0 ? 1 : 0;
        const odd = maxRows % 2 === 0 ? 0 : 1;
       // console.log("I:", index, "L:", length, "M:", maxRows, "H:", half, "E:", even);
        //case 1: if the length is less than maxRows, return the whole array
        if (length <= maxRows) {
            return { start: 0, end: length, _case: 1 };
        }
        //case 2: if there is less than half elements before the index, return the first half elements -1 for the header
        if (index - half <= 0) {
            // if ((index + 1) - half  === 0)
            //     return { start: 1, end: maxRows -1, _case: 2};
            // else 
            return { start: 0, end: maxRows - 1, _case: 2 };
        }
        //case 3: if there is less than half elements after the index, return the first half elements -1 for the header
        if (length - index -odd < half) {
            return { start: length - (maxRows - 1), end: length, _case: 3 };
        }
        //case 4: if the index is in the middle, return the elements around the index minus one on each end for the header and footer
        const start = index - half + 1;//if the start is 1 then it is better to print a proper row then to print the ehader saying there is another row above
        const end = index + half - 1 + odd;//same way as above, if the end is the last element then it is better to print a proper row then to print the ehader saying there is another row below
        return { start: start === 1 ? 0 : start, end: end === length - 1? length: end, _case: 4 };

    };

    const { start, end, _case } = getIndexRange(selIndex, taskArray?.length | 0, maxRows);
    //console.log("Start: " + start, "End: " + end, "Case: " + _case);
    if (start > 0) {
        str += "+" + CH.hcenter(Arrows.up + " +" + (start) + /*" total: " + taskArray.length + */" " + Arrows.up, rowLength - 2) + "+\n";
    }

    for (let i = start; i < end; i++) {

        let line = "";

        for (let j = 0; j < slots.length; j++) {
            let val = slots[j].getValue(taskArray[i], i);
            if (j === attrIndex && selIndex === i) {

                val = CH.hcenter(val, slots[j].width - 1) + Arrows.upDown;
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
                color: Colors.custom_colors(17),
                background: Colors.BG_WHITE,
                decoration: [ConsoleImpl.Decorations.Bold],
            }, line);


        }
        str += "|" + line + "|\n";
    }
    if (end < taskArray.length)
        str += "+" + CH.hcenter(Arrows.down + " +" + (taskArray.length - end) + /*" total: " + taskArray.length + */ " " + Arrows.down, rowLength - 2) + "+\n";

   
    let bottomstr = "+";
    for (let i = 0; i < slots.length; i++) {
        bottomstr += CH.hcenter("", slots[i].width, "-") + "+";
    }
    
    str +=  bottomstr + "\n";
    return str;
    // const len = CH.getSize(str).height;
    // let i = 0;	
    // return str.split("\n").map((line, index) => 
    //     {
    //         if (index=== 0 || index>= len - 1) {
    //             return " ".repeat(3) + line;
    //         }
    //         else 
    //             return CH.hcenter((i++)+":",3," ",2) + line;
    //     }
    
    // ).join("\n");
}

/**
 * Generates a graphical representation of a history of snapshots of the processor.
 *
 * @param {Array<Object>} history - Array of history objects, each containing:
 *   - `t` {number}: The time step.
 *   - `numProcessors` {number}: The number of processors.
 *   - `currentTasks` {Array<Object|null>}: The tasks currently running on each processor.
 * @param {number} currentIndex - The current index in the history array.
 * @param {number} [reservedWidth=0] - The width reserved for other elements.
 * @returns {string} - The formatted processor graph as a string.
 */
const genProcessorGraph = (history, currentIndex, reservedWidth = 0) => {
    let cores = delta + "t:\n";
    for (let i = 0; i < history[currentIndex].numProcessors; i++) {
        cores += "Core " + i + ":\n";
    }
    const cores_len = cores.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
    const availableWidth = CH.getWidth() - reservedWidth - cores_len - 2;// 2 for a buffer
    cores = CH.hcenter(cores, cores_len, " ", 2);
    const len_per_t = 3;
    const num_of_t = Math.floor(availableWidth / (len_per_t + 1));

    let res = "";
    let lastT = -1;
    for (let i = 0; i < num_of_t; i++) {
        const index = currentIndex - i;
        if (index >= 0 && history[index].t >= 0) {
            lastT = Math.max(history[index].t, lastT);
            let currentSlice = CH.hcenter("" + history[index].t, len_per_t);
            if (history[index].t > 999) {
                currentSlice = currentSlice[0] + "." + currentSlice[currentSlice.length - 1];
            }
            if (history[index].t === history[history.length - 1].t) {
                currentSlice = CH.insert_color(Colors.GREEN, currentSlice);
            }
            else if (history[index].t === history[currentIndex].t) {
                currentSlice = CH.insert_color(Colors.YELLOW, currentSlice);
            }
            currentSlice += "|\n";

            for (let j = 0; j < history[index].numProcessors; j++) {
                currentSlice += history[index].currentTasks[j] ? Task.getLine(history[index].currentTasks[j], len_per_t + 1) : 
                CH.insert_color(Colors.LIGHTBLACK_EX,"----");
                currentSlice += "\n";
            }
            res = CH.merge(currentSlice, res, { padding: 0 });
        }
        else {
            lastT++
            let currentSlice = CH.hcenter("" + lastT, len_per_t);
            if (lastT > 999) {
                currentSlice = currentSlice[0] + "." + currentSlice[currentSlice.length - 1];
            
            }
            currentSlice += "|\n";
            for (let j = 0; j < history[currentIndex].numProcessors; j++) {
                currentSlice += "    ";
                currentSlice += "\n";
            }
            res = CH.merge(res, currentSlice, { padding: 0 });
        }
    }
    return CH.merge(cores, res, { padding: 0, align: "top" });
}

/**
 * Generates a combined frame of processor tasks and history graph.
 *
 * @param {Array<Object>} history - Array of history objects, each containing:
 *   - `t` {number}: The time step.
 *   - `numProcessors` {number}: The number of processors.
 *   - `currentTasks` {Array<Object|null>}: The tasks currently running on each processor.
 * @param {number} currentIndex - The current index in the history array.
 * @returns {string} - The formatted processors frame as a string.
 */
const genProcessorsFrame = (history, currentIndex) => {

    const table_slots = [
        { name: "Processor-(#N)", width: 16, getValue: (task, i) => "Core #" + i },
        {
            name: "TASK", width: 8, getValue: (task) => {
                let txt = task ? "ID: " + CH.insert_color(Colors.custom_colors(task.color), "" + task.id) : CH.insert_color(Colors.LIGHTBLACK_EX, "IDLE");
                return CH.hcenter(txt, 8, " ", task ? 1 : 0);

            }
        },
    ];

    const table = genTaskTable(history[currentIndex].currentTasks, table_slots, history[currentIndex].currentTasks?.length | history[currentIndex].numProcessors);
    const table_len = CH.getSize(table).width;
    const cores = genProcessorGraph(history, currentIndex, table_len + 2);

    return CH.merge(table, cores, { padding: 2 });
}

const selectedFormat =  {
    color: Colors.custom_colors(39),
    decoration: ConsoleImpl.Decorations.Bold
};

const  formatText = (text, selected, arrowsOut) => {
    if (arrowsOut)
        text = ` ${selected ? Arrows.right : " "} ${text} ${selected ? Arrows.left : " "} `;
    else
        text = ` ${selected ? Arrows.left : " "} ${text} ${selected ? Arrows.right : " "} `;
    if (!selected)
        return text;

    return CH.insert_format(selectedFormat,text);
};

export { genTaskTable, genProcessorGraph, genProcessorsFrame, formatText };
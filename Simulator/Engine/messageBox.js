/*@file: MessageBox.js
*This file contains the implementation of a message box handler for a console application.
* Get the instance of the MsgBoxHandler singleton class and raise a message box with the specified text, title, and options.
* This will be shown by the Engine over the current scene.
*/

import * as ConsoleImpl from "./ConsoleHelp.js";
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
const Decorations = ConsoleImpl.Decorations;

/**
 * Creates a formatted message box with a title, text content, and optional selectable options.
 *
 * @param {string} text - The main content of the message box, supports multiple lines separated by '\n'.
 * @param {string} [title=""] - The title of the message box, displayed at the top. Defaults to an empty string.
 * @param {string[]} [options=[]] - An array of selectable options displayed at the bottom of the message box. Defaults to an empty array.
 * @param {number} [select=-1] - The index of the currently selected option. Defaults to -1 (no selection).
 * @returns {{ text: string, pos: { x: number, y: number } }} - An object containing the formatted message box text and its position.
 * 
 * @property {string} text - The formatted message box content, including borders, title, text, and options.
 * @property {{ x: number, y: number }} pos - The position of the message box on the screen, with `x` and `y` coordinates.
 */
const msgbox = (text, title = "", options = [], select = -1) => {

    const w = Math.round(CH.getWidth() / 2);
    const h = Math.round(CH.getHeight() / 4);
    const lines = text.split('\n');
    const start_w = Math.round(w / 2)
    const start_h = Math.round((CH.getHeight() - h) / 2)

    let restricted_lines = options.length > 0 ? 1 : 0;
    //top and bottom lines
    const hLine = CH.insert_format({ color: Colors.LIGHTBLACK_EX, decoration: Decorations.Bold }, "+" + "-".repeat(w - 2) + "+");
    //char limiting the box to the sides
    const sidePiece = CH.insert_format({ color: Colors.LIGHTBLACK_EX, decoration: Decorations.Bold }, "|");
    let str = hLine + "\n";
    // const info = "w: " + w + " h: " + h + " sw:" + start_w + " sh: " + start_h;
    // str += sidePiece  + CH.hcenter(info, w - 2) + sidePiece + "\n";
    // ADD TITLE
    if (title != "") {
        restricted_lines++;
        title = CH.insert_format({
            decoration: Decorations.Bold,
        }, title);
        title = CH.hcenter(title, w - 2, " ");
    };
    // ADD TEXT
    let textLines = "";
    for (let i = 0; i < h - (2 + restricted_lines); i++) {
        if (lines[i]) {
            CH.breakLine(lines[i], w - 2).split("\n").forEach((line) => {
                textLines += CH.hcenter(line, w - 2) + "\n";
            });
        }
    }
    textLines = textLines.slice(0, -1); // remove last \n

    const hLen = textLines.split("\n").reduce((acc, line) => {
        return Math.max(acc, CH.getLineWidth(line));
    }, 0);
    textLines = CH.vcenter(textLines, h - (2 + restricted_lines) - 1, hLen, " ", 2);
    textLines = " ".repeat(w - 2) + "\n" + textLines;

    // ADD OPTIONS
    const optSize = Math.floor((w - 2) / options.length);
    let opts = "";
    for (let i = 0; i < options.length; i++) {
        let line = `${i === select ? "> " : "  "}${options[i]}${i === select ? " <" : "  "}`;
        if (i === select) {
            line = CH.insert_format({
                decoration: Decorations.Bold,
                color: Colors.RED,

            }, line);
        }

        line = CH.hcenter(line, optSize, " ");
        opts += line;
    }

    if (title != "")
        textLines = title + "\n" + textLines;
    if (options.length > 0)
        textLines += "\n" +  CH.hcenter(opts, w-2) + "\n";
    const side = (sidePiece + "\n").repeat(h - 2) + sidePiece;
    textLines = CH.merge(side, textLines, { padding: 0 });
    textLines = CH.merge(textLines, side, { padding: 0 });
    str += textLines;
    str += "\n" + hLine;
    
    const box = str.split("\n");
    let final = box.slice(0, 1) + "\n";// top line
 
    final += box.slice(1, -1).map((line) => {
        const start = CH.getSafeSubstring(line, 0, 0);
        const middle = CH.getSafeSubstring(line, 1, -2);
        const end = CH.getSafeSubstring(line, -1);
        return start + CH.insert_format({
            background: Colors.custom_colors(0, true),
        }, middle) + end;
    }).join("\n");
    final += "\n" + box.slice(-1);
    str = final





    return { text: str, pos: { x: start_w, y: start_h } }
}

/**
 * MsgBoxHandler is a singleton class responsible for managing and displaying a message box
 * with customizable text, title, and options. It provides functionality for user interaction
 * through navigation and selection of options.
 * 
 * Methods:
 * - `getInstance()`: Retrieves the singleton instance of the MsgBoxHandler.
 * - `handleInput(input)`: Handles user input for navigating and selecting options.
 * - `raise(text, title, options, onSelect)`: Displays a message box with specified parameters.
 * - `print()`: Renders the message box on the screen.
 *
 * Properties:
 * - `text` (string): The message displayed in the message box.
 * - `title` (string): The title of the message box.
 * - `options` (string[]): An array of options for user selection.
 * - `select` (number): The index of the currently selected option.
 * - `open` (boolean): Indicates whether the message box is currently open.
 * - `onSelect` (function): A callback function invoked when an option is selected.
 */
class MsgBoxHandler {
    static #instance = null;
    static getInstance() {
        if (!MsgBoxHandler.#instance) {
            MsgBoxHandler.#instance = new MsgBoxHandler();
        }
        return MsgBoxHandler.#instance;
    }
    constructor() {
        if (MsgBoxHandler.#instance) {
            return MsgBoxHandler.#instance;
        }
        MsgBoxHandler.#instance = this;
        this.text = "";
        this.title = "";
        this.options = [];
        this.select = -1;
        this.open = false;
        this.onSelect = null;
        this.queue = [];
        this.useAnimation = true;
        this.animation = null;
        this.animation_ms = 20;
        this.animIndex = 0;
        this.state = 0;// 0 - closed, 1 - opening, 2 - open, 3 - closing
        this.setAnimation(true);
    }

    setAnimation(val)
    {
        if (val && !this.animation) {
            this.animation = setInterval(() => {
                if (this.state == 0)
                    return;
                if (this.state == 1) {
                    this.animIndex += 1;
                    if (this.animIndex >= 30) {
                        this.state = 2;
                        this.animIndex = 0;
                    }
                }
                else if (this.state == 2) {
                }
                else if (this.state == 3) {
                    this.animIndex -= 1;
                    if (this.animIndex <= 0) {
                        this.state = 0;
                        this.animIndex = 0;
                        this.open = false;
                        if (typeof this.onSelect === "function") {
                            this.onSelect(this.select);
                        }
                    }
                }
            }, 5);
        }
        else if (!val && this.animation) {
            clearInterval(this.animation);
            this.animation = null;
        }
    }
    /**
     * Handles user input for navigating and selecting options in a message box.
     *
     * @param {number} input - The input value representing the user's action:
     *   - `-1` to move the selection to the left.
     *   - `1` to move the selection to the right.
     *   - `0` to confirm the current selection.
     *
     * Updates the `select` property to reflect the current selection index.
     * Wraps around the selection index if it goes out of bounds.
     * If the input is `0` and a valid selection is made, it closes the message box
     * and invokes the `onSelect` callback with the selected index.
     */
    handleInput(input) {
        //input = -1 to go left and +1 to go right
        // 0 to select
        if (input === -1) {
            this.select--;
            if (this.select < 0) {
                this.select = this.options.length - 1;
            }
        } else if (input === 1) {
            this.select++;
            if (this.select >= this.options.length) {
                this.select = 0;
            }
        } else if (input === 0 && this.select >= 0 ) {
            if (this.useAnimation){
                if (this.state == 2) {
                    this.state = 3;
                    this.animIndex = 15;
                }
                return;
            }
            if (typeof this.onSelect === "function") {    
                this.onSelect(this.select);
            }
            this.open = false;
        }

    }
    /**
     * Displays a message box with the specified text, title, and options.
     *
     * @param {string} text - The message to display in the message box.
     * @param {string} [title=""] - The title of the message box (optional).
     * @param {string[]} [options=[]] - An array of options for the user to select from. Defaults to ["OK"] if no options are provided.
     * @param {function(number):void} onSelect - A callback function that is invoked when the user selects an option. 
     *                                           The selected option's index is passed as an argument.
     */
    raise(text, title = "", options = [], onSelect) {
        this.text = text;
        this.title = title;
        this.select = 0;
        if (options.length == 0) {
            options = ["OK"];
        }
        this.options = options;
        this.onSelect = onSelect;
        this.open = true;
        this.state = 1;
        this.animIndex = 0;

    }
    /**
     * Retrieves the text and position from the message box.
     *
     * @returns {{text: string, pos: {x:number, y:number}}} An object containing the selected text and its position.
     */
    getText() {
        let { text, pos } = msgbox(this.text, this.title, this.options, this.select);

        if (this.useAnimation) {

            text = text.split("\n");
            const len = text.length - 1;
            const mid = Math.round(len / 2);
            const dist = Math.floor(len * this.animIndex / 30);
            
            text = text.map((line, index) => {
                const pos = Math.abs(index - mid); // pos relative to the middle of the box
                if (index === 0 || index === len || this.state == 2) {
                    return line;
                }
                if (this.state== 1 && pos <= dist) {
                    return line;
                }
                else if (this.state == 3 && dist >= pos) {
                    return line;
                }
                else 
                    return ""
            }).filter(a => a!="").join("\n");

            let new_pos = CH.getSize(text);
            new_pos = {
                x: pos.x,
                y: Math.round(pos.y + (len - new_pos.height) / 2)
            }
            pos = new_pos; 
        }
       

        return { text, pos};
    }
}

export { MsgBoxHandler };
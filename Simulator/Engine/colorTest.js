/*
Prints all 8bit colors in the console.
if -bg flag is set, it will print the background colors.
*/

import * as ConsoleImpl from "./ConsoleHelp.js";

const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
const Decorations = ConsoleImpl.Decorations;

const args = process.argv;
const bg = args[2] === "-bg" || false

const colors = (bg) => {
    for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 8; j++) {
            CH.write(
                CH.insert_color(Colors.custom_colors(i * 8 + j, bg),
                    CH.hcenter("color: " + (i * 8 + j) , Math.floor(CH.getWidth() / 8) - 1, " ", 1)
                ) + " "
            );
        }
        CH.write("\n");
    }

}

console.clear();
colors(bg);

import Assets from './Game/Assets/Assets.js';
import * as ConsoleImpl from './Game/Base/ConsoleHelp.js';
import process from 'process';
import readline from 'readline';
import { Simulator } from './Game/Sim.js';
import { on } from 'events';
import { getFiGlet } from './Game/Assets/Fonts.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
process.stdin.setRawMode(true);
readline.emitKeypressEvents(process.stdin);

CH.setTitle('Scheduler Simulator');
const sim = new Simulator();
CH.show_cursor(false);
console.clear();
CH.clear_screen = () => {
    process.stdout.write('\x1B[0f');
}
let lock = true;

CH.merge(Assets.Logos.Mattedi, Assets.Logos.Works, { padding: 0 }).split('\n').forEach((line) => {
    console.log(CH.getLineWidth(line, CH.getWidth()));
});

const perfectpaintedMw =CH.merge(
    CH.paint(Assets.Logos.Mattedi, Colors.custom_colors(39)),
    CH.paint(Assets.Logos.Works, Colors.custom_colors(208)),
    { padding: 0 });


CH.animate(
    perfectpaintedMw,
    10,
    () => {
        lock = false;
        setTimeout(() => {
            sim.goToState(sim.WelcomeScreen);
        }, 1000);
        
            
    },
    true
)
process.stdout.on('resize', () => {
    //console.clear();
    //Scroll down
    //CH.write("\x1b[3J");
    //GameStates.rerender();
    //console.log(CH.getWidth());
    //console.log(CH.getHeight

});
let delCount = 0;

process.stdin.on('keypress', (key, data) => {

    // console.log(key, data);
    if (lock) 
        return;

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

    if (data.ctrl && data.name === 'd') {
        delCount += CH.controlPrint("Width: " + CH.getWidth());
        console.log("del: " + delCount ++);
    }

    else {
        sim.handleInput(input);
    }


    if (data && data.ctrl && data.name === 'c') {
        console.clear();
        CH.write("\x1b[3J");
        CH.show_cursor(true);
        process.exit();

    }
});



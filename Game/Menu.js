import * as ConsoleImpl from  './Base/ConsoleHelp.js';
import { GameVersion, BuildDate } from './GameVersion.js';
import Assets from "./Assets/Assets.js";
import { DevMode } from "./Base/DevMode.js";
import { Genie } from "./Genie.js";


const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
const Decorations = ConsoleImpl.Decorations;

/*
   static Menu class for handling game menus
*/

class Menu {
    static gameMenuOptions = ["Continue", "Go to Main Menu", "Save Game", "Info", "Help", "Exit"];
    static startMenuOptions = ["New Game", "Load Game!", "Info", "Exit"];
    static gameEndOptions = ["Play Again", "Exit"];
    static battleMenuOptions = ['Attack', 'Flee', 'Items', 'Menu'];
    static gameModeOptions = ['Story Mode', 'Gauntlet', 'Back'];
    static confirmOptions = ['Yes', 'No'];
    static printInfo() {
        CH.clear_screen();
        CH.print(Assets.Logos.paintedMattediWorks());
        const devInfo =
            `
    Designed and Developed by: ${CH.insert_format({
                decoration: [Decorations.Bold, Decorations.Italic]
            }, "Vitor Mattedi")} - MattediWorks
    `;
        const info = [
            "Welcome to Console Adventure!",
            "This is a console game",
            "where you can explore a world",
            "filled with magic and mystery.",
            "You can interact with characters,",
            "solve puzzles, and fight monsters.",
            "Good luck and have fun!",
        ];

        Genie.getInstance().speak(info.join("\n"), [
            {
                text: "Console",
                color: Colors.YELLOW
            },
            {
                text: "Adventure",
                color: Colors.GREEN
            }
        ], undefined, { hcenter: true });


        CH.print(devInfo.split("\n").map((line) => CH.hcenter(line, CH.getWidth())).join("\n"));
        if (DevMode.getInstance().value) {
            CH.print();
            CH.print(CH.hcenter(`Game Version: ${CH.insert_format(
                { decoration: [Decorations.Bold],
                    color: Colors.GREEN
                 },
                GameVersion 
            )} - Build Date: ${CH.insert_format(
                { decoration: [Decorations.Bold],
                    color: Colors.GREEN
                 },
                BuildDate 
            )}`, CH.getWidth()));
            CH.print();
        }
        CH.pressSpace("to go back");
    }
}
// static gameMenuOptions = ["Continue", "New Game", "Info", "Help", "Exit"];
// static startMenuOptions = ["New Game", "Load Game!", "Info", "Exit"];
// static gameEndOptions = ["Play Again", "Exit"];

// Enumerations for menu options
class GameMenuOptions {
    static get Continue() { return 0; }
    static get MainMenu() { return 1; }
    static get SaveGame() { return 2; }
    static get Info() { return 3; }
    static get Help() { return 4; }
    static get Exit() { return 5; }
}

class StartMenuOptions {
    static get NewGame() { return 0; }
    static get LoadGame() { return 1; }
    static get Info() { return 2; }
    static get Exit() { return 3; }
}

class GameEndOptions {
    static get PlayAgain() { return 0; }
    static get Exit() { return 1; }
}

class BattleMenuOptions {
    static get Attack() { return 0; }
    static get Flee() { return 1; }
    static get Items() { return 2; }
    static get Menu() { return 3; }
    static get DevButton() { return 4; }
}

class ConfirmOptions {
    static get Yes() { return 0; }
    static get No() { return 1; }
}

export{ Menu, GameMenuOptions, StartMenuOptions, GameEndOptions, BattleMenuOptions, ConfirmOptions };    
// Purpose: Game class to handle the game logic.
import * as ConsoleImpl from './Base/ConsoleHelp.js';
import { GameColors } from './Base/GameColors.js';
import { PlayerFactory } from './Classes/GameClasses.js';
import * as Enemy from './Enemies/Enemies.js';
import { Menu, BattleMenuOptions, GameMenuOptions, StartMenuOptions, ConfirmOptions } from './Menu.js';
import { DamageType } from './Base/DamageTypes.js';
import { Weapon, WeaponUtils } from './Base/Weapons.js';
import { DevMode } from './Base/DevMode.js';
import { Genie } from './Genie.js';
import { HealthPotion } from './Base/Consumables.js';
import { EquipamentUtils, Equipament } from './Base/Equipament.js';
import { GameState } from './GameState.js';
import Assets from './Assets/Assets.js';

//The Game is controlled by GameStates (Singleton)
//A GameState representes a state of the game and it has
//Basically four methods: onCreate, onRender, onInput, onSelect
// - onCreate: Called when the state is created or rerender usually 
//should clear the screen and print the basic state.
// - onRender: Is called each time the state needs to be rendered,
//usually it deletes the options and re-prints them, reflecting the changes
//of the current state. Usually it renders the options.
// - onInput: Is called when the input is received, if the game state needs to
// do something with the input, it should be done here. If it returns true, the
// the input is consumed and is not processed by the general input handler.
// - onSelect: Is called when the user selects an option, it should change the state
// or do something with the selected option. It is usually called when either 'enter' or 'space'
// is pressed.
// Static Classes can be used for better readability and to avoid magic numbers
// Static variables can be used to agglomerate multiple states in a single object,
// this is useful to avoid creating multiple states for similar states.

const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
const Decorations = ConsoleImpl.Decorations;
const genie = new Genie();
const MaxNameLength = 25;


//Static Classes for improved Readability
class GameStates {
    static #instance = null;
    #currentState;
    #lastState = [];
    //Slow Running Mode, avoid flickering on slow terminals
    static #slowRunning = false;
    static #slowTime = 0;
    static #lastTime = 0;
    static #locked = false;
    constructor() {
        if (!GameStates.#instance) {
            this.states = [];
            this.#currentState = null;
            GameStates.#instance = this;
        }
        else {
            return this
        }
    }
    set currentState(state) {
        if (state instanceof GameState) {
            this.#lastState.push(this.#currentState);
            this.#currentState = state;
        }
    }
    get currentState() {
        return this.#currentState;
    }
    
    static getInstance() {
        if (!GameStates.#instance)
            GameStates.#instance = new GameStates();
        return GameStates.#instance;
    }
    static rerender() {
        if (GameStates.#locked)
            return false;
        if (GameStates.#slowRunning) {
            const now = Date.now();
            if (now - GameStates.#lastTime < GameStates.#slowTime) {
                return false;
            }
            GameStates.#lastTime = now;
        }
        GameStates.#instance?.currentState?.rerender();
        return true;

    }
    static render() {
        //Slows down the rendering process to avoid flickering
        //useful for slow terminals
        if (GameStates.#locked)
            return false;
        if (GameStates.#slowRunning) {
            const now = Date.now();
            if (now - GameStates.#lastTime < GameStates.#slowTime) {
                return false;
            }
            GameStates.#lastTime = now;
        }
        GameStates.#instance?.currentState?.render();
        return true;
    }
    static setLock(value) {
        if (typeof value === "boolean") {
            GameStates.#locked = value;
            if (!value) {
               GameStates.render();
            }
        }
    }
    addState() {

    }
    goBack() {
        if (this.#lastState.length > 0) {
            this.#currentState = this.#lastState.pop();
        }
    }
    //Set the slow running mode
    //time: time in milliseconds
    //if time is less than or equal to 0, slow running is disabled
    static setSlowRunning(time) {
        if (time <= 0) {
            GameStates.#slowRunning = false;
        }
        GameStates.#slowRunning = true;
        GameStates.#slowTime = time;
    }
    static isLocked() {
        return GameStates.#locked;
    }

}

class BattleStage {
    static Encounter = 0;
    static SelectAction = 1;
    static Attack = 2;
    static Flee = 3;
    static Items = 4;
    static Menu = 5;
    static GameOver = 6;
    static Slain = 7;
    static PreSlain = 8;
    static GetLoot = 9;
}

class MainMenuStage {
    static PreMenu = 0;
    static MainMenu = 1;
    static NewGame = 2;
    static Continue = 3;
    static Exit = 4;
    static Info = 5;
    static Help = 6;
    static LoadGame = 7;
    static GameModeSelection = 8;
    static GameModeInvalid = 9;
}

class GameMenuStage {
    static MainMenu = 0;
    static LoadGame = 1;
    static Info = 2;
    static SaveGame = 3;
    static Help = 4;
    static Help_2 = 5;
    static Help_3 = 6;
    static ConfirmQuit = 7;
}

class Game {
    #feedback = ""; // strictly private
    #fleeAttempt = 0; //strictly private
    #score = 0; //strictly private
    #genieSpeech = ""; //strictly private
    #genieSpeechHandle = null; //strictly private
    #enemySeed = {
        enemy_seed: new Enemy.Minion("Bob", 10, 1),
        loc_seed: 0,
        adverb_seed: 0,
        phrase_seed: 0
    }
    static inputState = {
        string: "",
        index: 0,
        maxIndex: 0,
        vertical: false,
        reset: () => {
            this.string = "";
            this.index = 0;
        }
    }
    static battleState = 0;
    static introState = {
        stage: 0,
        pname: "",
        pclass: "",
        init: true
    }
    static mainMenuState = 0
    static gameMenuState = 0;
    static geniephrase = "";
    currentEnemy = new Enemy.Minion("Bob", 10, 1, {
        strength: 5,
        intelligence: 2,
        dexterity: 3,
    });
    isRunning = false;
    exitGame = false;
    constructor() {
        genie.setLockState(GameStates.setLock);
        this.currentEnemy = new Enemy.Minion("Bob", 10, 1, {
            strength: 5,
            intelligence: 2,
            dexterity: 3,
        });
        this.player = new PlayerFactory().createPlayer("Cheater", "Warrior"); // {get; private set}
        this.isRunning = false;
        this.exitGame = false;
        new DevMode().gameInstance = this;
    }
    get inputState() {
        return Game.inputState;
    }

    //Handle Input and makes the game function
    //Call this on keypress or gamepad input
    //treat the input to ' ' -> space
    //'return' -> enter and Arrow Keys -> arrowup, arrowdown, arrowleft, arrowright
    handleInput = (input) => {
        if (typeof input === "undefined")
            return;
        if (GameStates.getInstance().currentState?.changeState(input))
            return;

        if (input.length === 1) {
            if (Game.inputState.string === "")
                input = input.toUpperCase();
            if (Game.inputState.string.length < MaxNameLength) {
                Game.inputState.string += input;
                this.cancelgenieTempSpeech();
            }
            else
                this.genieTempSpeech("That is a long name that you have there!");
            input = input.toLowerCase();
        }
        else if (input === "backspace") {
            if (Game.inputState.string.length > 0) {
                Game.inputState.string = Game.inputState.string.slice(0, -1);
            }
        }
        else if (input === "enter" || input === "space") {
            // CH.clear_screen();
            // CH.print(Game.inputState.string);
            GameStates.getInstance().currentState?.onSelect(input);

        }

        if (input === "arrowup") input = "w";
        else if (input === "arrowdown") input = "s";
        else if (input === "arrowleft") input = "a";
        else if (input === "arrowright") input = "d";

        if ((input === "w" && Game.inputState.vertical) || (input === "a" && !Game.inputState.vertical)) {

            if (Game.inputState.index <= 0) {
                Game.inputState.index = Game.inputState.maxIndex;
            }
            else
                Game.inputState.index--;
        }
        else if ((input === "s" && Game.inputState.vertical) || (input === "d" && !Game.inputState.vertical)) {

            if (Game.inputState.index >= Game.inputState.maxIndex) {
                Game.inputState.index = 0;
            }
            else
                Game.inputState.index++;
        }

    }

    exitTheGame() {
        this.isRunning = false;// Stop game loop
        //goodbye message
        CH.show_cursor(true);
        CH.clear_screen();
        genie.goodbye(this.player.name);

    }
    generateEnemy(level) {
        if (typeof level !== "number") {
            throw new Error("level must be a number");
        }
        level = Math.round(level);
        const seed = Math.random();
        let new_enemy = new Enemy.Minion('Goblin', 18 * level, Math.max(level - 1, 1));
        if (seed < 0.3) {
            //Minion
        }
        else if (seed < 0.6) {
            new_enemy = new Enemy.CommonEnemy('Orc', 20 * level, level);
        }
        else if (seed < 0.8) {
            new_enemy = new Enemy.Elite('Troll', 22 * level, level);
        }
        else {
            new_enemy = new Enemy.Boss('Dragon', 25 * level, level + 1);
        }
        //generate loot

        const genLoot = (loot_level) => {
            let new_loot = [];
            //Loot chances
            const armor_chance = 0.2 + loot_level * 0.01;
            const weapon_chance = 0.1
            const potion_chance = 0.2 + loot_level * 0.01;
            //weapon + armor seed
            const seed = Math.random();
            if (seed < armor_chance) {
                const EquipmentLoot = EquipamentUtils.genEquipament(50);
                const equip_seed = Math.floor(Math.random() * (EquipmentLoot.length - 1));
                const equip = EquipamentUtils.getEquipament(equip_seed);
                new_loot.push(...equip);
            }
            else if (seed > 1 - weapon_chance) {
                new_loot.push(WeaponUtils.genRandomWeapon(loot_level));
            }
            //poiton seed
            const potion_seed = Math.random();
            if (potion_seed < potion_chance) {
                const hp_seed = Math.random();
                //Potion Chances
                const small_pot_chance = 0.5;
                const medium_pot_chance = 0.3;
                //const large_pot_chance = 1 - medium_pot_chance - small_pot_chance;
                let hp_pot = new HealthPotion('Large Hp Pot', 30);
                if (hp_seed < small_pot_chance) {
                    hp_pot = new HealthPotion('Small Hp Pot', 10);
                }
                else if (hp_seed < medium_pot_chance + small_pot_chance) {
                    hp_pot = new HealthPotion('Medium Hp Pot', 20);
                }
                new_loot.push(hp_pot);
            }

            return new_loot;
        }
        const loot = genLoot(level);
        if (loot.length > 0) {
            new_enemy.loot = loot;
        }
        new_enemy.generateEnemyInfo();

        this.currentEnemy = new_enemy;
        return this.currentEnemy
    }
    encounterNewEnemy() {

        CH.clear_screen();
        const locations = ['Dark Forest', 'Misty Mountains', 'Forgotten Ruins', 'Enchanted Lake', 'Cursed Swamp', 'Haunted Castle', 'Ancient Temple', 'Mystic Caverns', 'Shadowy Vale', 'Eerie Graveyard'];
        const phrases = [
            `You find yourself in the #loc, out of nowhere, a #enemy appears!`,
            `While attempting to cross the #loc, a #enemy emerges from the shadows!`,
            `As you explore the #loc, a #enemy suddenly attacks you!`,
            `You stumble upon the #enemy while wandering through the #loc!`,
            `A #enemy jumps out at you as you traverse the #loc!`,
            `You are ambushed by a #enemy in the #loc!`,
            `A #enemy blocks your path in the #loc!`,
            `You are confronted by a #enemy in the #loc!`,
            `A #enemy emerges from the darkness in the #loc!`,
            `You are attacked by a #enemy while exploring the #loc!`,
            `A #enemy suddenly appears in the #loc!`,
            `You are surprised by a #enemy in the #loc!`,
            `A #enemy jumps out at you in the #loc!`,
            `You are ambushed by a #enemy in the #loc!`,
        ]
        const adverbs = ["Fighsty", "Fierce", "Savage", "Vicious", "Brutal", "Ferocious", "Deadly", "Savage", "Ruthless", "Merciless", "Savage", "Vicious", "Brutal", "Ferocious", "Deadly", "Savage", "Ruthless", "Merciless", "Savage"];
        if (this.currentEnemy.isDead()) {
            this.currentEnemy = this.generateEnemy(this.player.level);
            this.#enemySeed.enemy_seed = this.currentEnemy;
            this.#enemySeed.loc_seed = Math.floor(Math.random() * (locations.length - 1));
            this.#enemySeed.adverb_seed = Math.floor(Math.random() * (adverbs.length - 1));
            this.#enemySeed.phrase_seed = Math.floor(Math.random() * (phrases.length - 1));
        }

        let phrase = phrases[this.#enemySeed.phrase_seed]
        const loc = locations[this.#enemySeed.loc_seed];


        phrase = phrase.replace("#loc", loc)
        phrase = phrase.replace("#enemy", `${adverbs[this.#enemySeed.adverb_seed]} ${CH.insert_color(Colors.RED, this.currentEnemy.name)}`);
        genie.speak(CH.breakLine(phrase, CH.getWidth() / 2));
        CH.print();
        this.#feedback = "";
        this.cancelgenieTempSpeech();


    }

    printBasicFrame() {
        //Clear Screen
        CH.clear_screen();
        //Print Genie + enemy info
        const rightSprite = `${CH.insert_format(
            {
                color: Colors.YELLOW,
                decoration: [Decorations.Bold]
            }, "Score")}: ${CH.hcenter(this.#score.toString(), 6, " ", 1)}`;
        const enemy = this.currentEnemy.generateEnemyInfo();
        const enemy_width = Math.max(...enemy.split("\n").map(item => CH.getLineWidth(item)))
        const finalSprite = CH.hcenter(rightSprite, enemy_width) + "\n".repeat(3) + enemy;
        const genieSentece = this.#genieSpeech === "" ? "What will you do?" : [
            `You are facing the ${this.currentEnemy.name}! `,
            `What will you do?`].join("");
        genie.speak(this.#genieSpeech === "" ? genieSentece : this.#genieSpeech,
            {
                text: this.currentEnemy.name,
                color: Colors.RED
            }, finalSprite, { hcenter: true },false);
        CH.print();
        //Print feedback (min 2 lines) from last action)
        const feedback_lines = this.#feedback.split("\n");
        feedback_lines.forEach(line => {
            CH.print(CH.hcenter(line, CH.getWidth()));
        });
        if (feedback_lines.length < 2) {
            CH.print();//ln
        }
        CH.print();//ln
        //Print Player Info
        CH.print(this.player.playerInfo());
        //Let player choose action
        CH.print();//ln
        CH.print();
    }

    checkForDeaths() {

        if (this.player.isDead()) {

            Game.battleState = BattleStage.GameOver;

        }
        else if (this.currentEnemy.isDead()) {
            this.player.recoverHealth(20 * this.player.level % 5);
            this.player.gainXp(this.currentEnemy.xp_drop);
            let scoreMulti = 1;
            if (this.currentEnemy instanceof Enemy.Boss) {
                scoreMulti = 5;
            }
            else if (this.currentEnemy instanceof Enemy.Elite) {
                scoreMulti = 3;
            }
            else if (this.currentEnemy instanceof Enemy.CommonEnemy) {
                scoreMulti = 2;
            }
            this.#score += this.currentEnemy.level * 10 * scoreMulti;
            Game.battleState = BattleStage.PreSlain;


        }
    }

    printInitalStage() {

    }

    genCondencedItemsArray() {
        let itemOptions = [];
        for (const item of this.player.consumables) {
            let multiple = false;
            for (const option of itemOptions) {
                if (option.name === item.name) {
                    multiple = true;
                }
            }
            if (!multiple) {
                itemOptions.push(item);
            }
        }
        return itemOptions;
    }
    //Genie will speak and then timeout to the default speech
    genieTempSpeech(phrase, time = 5000) {
        this.#genieSpeech = phrase;
        if (this.#genieSpeechHandle !== null) {
            clearTimeout(this.#genieSpeechHandle);
        }
        this.#genieSpeechHandle = setTimeout(() => {
            this.#genieSpeech = "";
            GameStates.rerender();
        }, time);

    }
    ///Cancel the current Speech of the Genie
    cancelgenieTempSpeech() {
        this.#genieSpeech = "";
        if (this.#genieSpeechHandle !== null) {
            clearTimeout(this.#genieSpeechHandle);
            this.#genieSpeechHandle = null;
        }
    }

    ///Handle Player Cration
    playerCreation = new GameState(
        //on create
        () => {

            Game.inputState.index = 0;
            if (!Game.introState.init) {
                Game.introState.init = true;
                Game.introState.pname = "";
                Game.introState.pclass = "";
                Game.introState.stage = 0;
            }
            const stage = Game.introState.stage;
            if (stage === 0) {
                /// Xterm Rendering issues -> rendering last line with the rest of the screen
                CH.show_cursor(false);
                CH.print();
                CH.clear_last_line(1);
                /// Normal Rendering
                CH.clear_screen();
                genie.speak(
                    this.#genieSpeech === "" ?
                        'You look like an Adventurer!\nI didn\'t catch your name. What was it?' :
                        this.#genieSpeech);
                CH.show_cursor(true);
                Game.inputState.vertical = false;
            }
            else if (stage === 1) {
                Game.inputState.reset();
                CH.show_cursor(false);
                CH.clear_screen();
                if (Game.introState.pname === "") {
                    const name_seed = Math.random();
                    let newName = Game.inputState.string.trim();
                    if (genie.missBehaviour > name_seed || newName === "" || typeof newName === "undefined") {

                        let phrase = `I do not like the name: ${CH.insert_format(
                            {
                                decoration: [Decorations.Bold, Decorations.Underlined]
                            }
                            , newName)}!`;
                        if (newName === "" || typeof newName === "undefined")
                            phrase = "Funny you are, but smart are not!"
                        newName = genie.generateName();
                        genie.speak(`${phrase}
I shall call you ${CH.insert_format(
                            {
                                decoration: [Decorations.Bold, Decorations.Underlined]
                            }
                            , newName)}.`);
                    }
                    else {
                        genie.speak(`Nice to meet you ${CH.insert_format(
                            {
                                decoration: [Decorations.Bold, Decorations.Underlined]
                            }
                            , newName)}!`);
                    }
                    Game.introState.pname = newName;
                }
                else {
                    genie.speak(`Nice to meet you ${CH.insert_format(
                        {
                            decoration: [Decorations.Bold, Decorations.Underlined]
                        }
                        , Game.introState.pname)}!`);
                }
                CH.pressSpace();
            }
            else if (stage === 2) {
                CH.clear_screen();
                Game.inputState.reset();
                Game.inputState.maxIndex = 2;
                genie.speak(`And... What Are You?`);
            }
            else if (stage === 3) {
                CH.clear_screen();
                genie.smirk(
                    this.player.getClass(),
                );
                CH.print();
                CH.pressSpace();

            }
            else if (stage === 4) {
                CH.clear_screen();
                const intro = `Welcome to the Magical Lands, ${this.player.name}. In this vast world of enchanted forests, towering mountains, and forgotten ruins, you stand on the edge of an epic journey. In an age when magic flows through the veins of the earth, and ancient beasts roam untamed, the realm is on the brink of collapse. The shadow of a long-forgotten evil stirs once more, threatening to shroud the land in darkness. The fate of the Magical Lands rests on your shoulders. Will you rise to the challenge, forging alliances, battling dark forces, and uncovering the secrets of a forgotten age? Your adventure begins now... But be aware of that sneaky grey gen... ... ... Wait who wrote this?.`;
                genie.speak(CH.breakLine(intro, CH.getWidth() / 2),
                    [
                        {
                            text: 'Magical Lands',
                            color: Colors.GREEN
                        },
                        {
                            text: 'grey gen',
                            color: Colors.LIGHTBLACK_EX
                        },
                        {
                            text: this.player.name,
                            color: GameColors.class_colors[Game.inputState.index].color

                        }
                    ]
                );
                CH.pressSpace();
            }
            else if (stage === 5) {
                CH.clear_screen();
                genie.introduce();
                CH.pressSpace();
            }
        },
        //on render
        () => {
            // process.stdout.write('\x1b[2K');
            // CH.print(CH.insert_color(Colors.YELLOW, '\tMy name is: ') + Game.inputState.string);
            if (Game.introState.stage === 0) {
                if (this.#genieSpeech !== "") {
                    GameStates.getInstance().currentState.onCreate();
                }
                CH.show_cursor(false);
                CH.print();
                CH.clear_last_line(1);
                CH.write(CH.insert_color(Colors.YELLOW, '\tMy name is: ') + Game.inputState.string);
                CH.show_cursor(true);
            }
            else if (Game.introState.stage === 2) {
                CH.clear_last_line();
                CH.printOptions(['Warrior', 'Mage', 'Rogue'].map(item => "I'm a " + item), Game.inputState.index, {
                    colors: GameColors.class_colors
                }, false);
            }

        },
        (key) => {
            const stage = Game.introState.stage;
            if (stage === 0 && key === "space") {
                // Name Input
                if (Game.inputState.string.length < MaxNameLength) // Max Name Length
                    Game.inputState.string += " ";
                return true;
            }

        },
        //On Select
        () => {
            const stage = Game.introState.stage;
            if (stage === 0) {
                CH.print();
                CH.show_cursor(false);
            }
            if (stage === 2) {
                const classes = ['Warrior', 'Mage', 'Rogue']
                this.player = new PlayerFactory().createPlayer(Game.introState.pname, classes[Game.inputState.index]);
            }
            if (stage === 4) {
                Game.introState.init = false;
                Game.inputState.string = String(" ");
                Game.inputState.index = 0;
                Game.battleState = BattleStage.Encounter;
                GameStates.getInstance().currentState = this.gauntletGame;
            }
            else if (stage === 5) {
                Game.introState.stage = 0;
                Game.inputState.string = "";
            }
            else {
                Game.introState.stage++;
            }
            GameStates.rerender();

        }
    )

    //Controls the game on the Gauntlet Mode
    gauntletGame = new GameState(
        () => {
            Game.inputState.vertical = false;
            Game.inputState.index = 0;

            if (Game.battleState === BattleStage.Encounter) {
                this.encounterNewEnemy();
                CH.pressSpace();
            }
            else if (Game.battleState === BattleStage.SelectAction) {
                Game.inputState.maxIndex = Menu.battleMenuOptions.length - 1;
                if (Game.inputState.index > Game.inputState.maxIndex)
                    Game.inputState.index = 0;
                this.printBasicFrame();
            }
            else if (Game.battleState === BattleStage.Attack) {
                Game.inputState.maxIndex = this.player.attacks.length;
                if (Game.inputState.index > Game.inputState.maxIndex)
                    Game.inputState.index = 0;
                this.printBasicFrame();
            }
            else if (Game.battleState === BattleStage.Items) {
                Game.inputState.index = 0;
                let itemOptions = this.genCondencedItemsArray();
                Game.inputState.maxIndex = Math.max(itemOptions.length, 1);
                this.printBasicFrame();
            }
            else if (Game.battleState === BattleStage.GameOver) {
                CH.clear_screen();
                this.printBasicFrame();
                CH.clear_last_line();
                CH.pressSpace();
            }
            else if (Game.battleState === BattleStage.Slain) {
                CH.clear_screen();
                let phrase = `You have slain ${CH.insert_color(Colors.RED, this.currentEnemy.name)}!`;
                phrase += `\nYou gain ${CH.insert_color(Colors.YELLOW, this.currentEnemy.xp_drop)} XP!`;
                if (this.currentEnemy.loot.length > 0) {
                    phrase += `\nYou Have found: `;
                    for (const item of this.currentEnemy.loot) {
                        phrase += `\n`;
                        phrase += CH.insert_color(item.getColor(), item.name);

                    }
                }
                genie.speak(phrase);
                if (this.currentEnemy.loot.length > 0) {
                    for (const item of this.currentEnemy.loot) {
                        if (item instanceof HealthPotion) {
                            this.player.findConsumable(item);
                            this.currentEnemy.loot.splice(this.currentEnemy.loot.indexOf(item), 1);
                        }
                    }
                }
                CH.pressSpace();

            }
            else if (Game.battleState === BattleStage.PreSlain) {
                CH.clear_screen();
                this.printBasicFrame();
                CH.pressSpace();
            }
            else if (Game.battleState === BattleStage.Flee) {
                CH.clear_screen();
                this.printBasicFrame();
                CH.pressSpace();
            }
        },
        () => {
            if (Game.battleState === BattleStage.SelectAction) {
                CH.clear_last_line();
                CH.printOptions(Menu.battleMenuOptions, Game.inputState.index, {
                    colors: [{
                        text: Menu.battleMenuOptions[Menu.battleMenuOptions.length - 1],
                        color: Colors.YELLOW
                    }]
                }, false)
            }
            else if (Game.battleState === BattleStage.Attack) {
                CH.clear_last_line();
                let opts = this.player.attacks.map(item => item.name).concat('Back');
                CH.printOptions(opts, Game.inputState.index, {
                    colors: this.player.attacks.map(item => {
                        return {
                            text: item.name,
                            color: GameColors.weapon_colors.find(weapon => weapon.text === item.attackType).color
                        }
                    }
                    )
                }, false)
            }
            else if (Game.battleState === BattleStage.Items) {
                CH.clear_last_line();
                let itemOptions = this.genCondencedItemsArray();

                CH.printOptions([...itemOptions.map(item => item.name), "Back"], Game.inputState.index, {
                    colors: itemOptions.map(item => {
                        return {
                            text: item.name,
                            color: item.color
                        }
                    }
                    )
                }, false)
            }
        },
        () => {

        },
        () => {
            if (Game.battleState === BattleStage.Encounter) {
                Game.battleState = BattleStage.SelectAction;

            }
            else if (Game.battleState === BattleStage.SelectAction) {
                if (Game.inputState.index === BattleMenuOptions.Flee) {
                    if (this.#fleeAttempt === 0) {
                        this.#fleeAttempt = Math.random() + 1;
                    }

                    if (this.#fleeAttempt > 1.5) {
                        this.#feedback = "You managed to escape!";
                    }
                    else {
                        this.#feedback = "You failed to escape!";

                        const seed = Math.round(Math.random() * 2);
                        if (seed === 0)
                            this.genieTempSpeech("You can't escape! You must fight!");
                        else if (seed === 1)
                            this.genieTempSpeech("Escape you tried,\nsucceed you did not!");
                        else if (seed === 2)
                            this.#genieSpeech = "Sometimes you can't flight, the only option is to fight!";
                    }
                }
                if (Game.inputState.index === BattleMenuOptions.Menu)
                    GameStates.getInstance().currentState = this.gameMenu;
                else
                    Game.battleState = 2 + Game.inputState.index;
                Game.inputState.index = 0;


            }
            else if (Game.battleState === BattleStage.Attack) {
                Game.battleState = 1;

                if (Game.inputState.index !== this.player.attacks.length) {
                    this.#fleeAttempt = 0;
                    const attack_index = Game.inputState.index;
                    //Player Attack
                    const attack_res = this.player.attackTarget(attack_index, this.currentEnemy);
                    const player_atk = this.player.attacks[attack_index];
                    this.#feedback = CH.insert_color(this.player.getClassColor(), this.player.name);
                    if (player_atk.attackType === DamageType.Magic)
                        this.#feedback += " casts" + CH.insert_color(player_atk.getColor(), ` ${player_atk.name} `);
                    else
                        this.#feedback += CH.insert_color(player_atk.getColor(), ` ${Game.getThirdPerson(player_atk.name)} `);
                    this.#feedback += "it for " + CH.insert_color(Colors.RED, attack_res.damageTaken) + " damage! ";
                    if (attack_res.damageResisted > 0)
                        this.#feedback += CH.insert_color(Colors.LIGHTBLACK_EX, `(${attack_res.damageResisted} resisted) `);
                    if (attack_res.crit) {
                        {
                            this.#feedback += CH.insert_color(Colors.YELLOW, "(Critical Hit!) ");
                            this.genieTempSpeech("Critical Hit! Nice Shot!");
                        }
                    }
                    if (attack_res.isDead) {
                        this.#feedback += CH.insert_color(Colors.LIGHTRED_EX, `Killing it.`);
                    }
                    if (DevMode.getInstance().value) {
                        this.#feedback += `(a: ${attack_res.attackRoll}, d: ${attack_res.defenseRoll})`;
                    }
                    this.#feedback += "\n";

                    if (!attack_res.isDead) {
                        //Enemy Attack
                        const enemy_atk = this.currentEnemy.randomAttack();
                        const enemy_res = this.player.takeDamage(enemy_atk.calculateDamage(this.currentEnemy.getStats()));
                        this.#feedback += "The " + CH.insert_color(Colors.RED, `${this.currentEnemy.name}`);
                        this.#feedback += " strikes back, it";
                        if (enemy_atk.attackType === DamageType.Magic)
                            this.#feedback += " casts" + CH.insert_color(enemy_atk.getColor(), ` ${enemy_atk.name} `);
                        else
                            this.#feedback += CH.insert_color(enemy_atk.getColor(), ` ${Game.getThirdPerson(enemy_atk.name)} `);

                        this.#feedback += `you dealing ${CH.insert_color(Colors.RED, enemy_res.damageTaken)} damage! `;
                        if (enemy_res.damageResisted > 0)
                            this.#feedback += CH.insert_color(Colors.LIGHTBLACK_EX, `(${attack_res.damageResisted} resisted) `);
                        if (enemy_res.crit) {
                            this.#feedback += CH.insert_color(Colors.YELLOW, "(Critical Hit!) ");
                            this.genieTempSpeech("Critical Hit! Ouch that hurst!");
                        }
                        if (enemy_res.isDead) {
                            this.#feedback += CH.insert_color(Colors.LIGHTRED_EX, `Killing you!`);
                        }
                        if (DevMode.getInstance().value) {
                            this.#feedback += `(a: ${enemy_res.attackRoll}, d: ${enemy_res.defenseRoll})`;
                        }
                    }
                    this.checkForDeaths();
                }

            }
            else if (Game.battleState === BattleStage.Flee) {
                if (this.#fleeAttempt > 1.5) {
                    Game.battleState = BattleStage.Encounter;
                    this.#fleeAttempt = 0;
                }
                else {
                    Game.battleState = BattleStage.SelectAction
                }
            }
            else if (Game.battleState === BattleStage.Items) {
                let itemOptions = this.genCondencedItemsArray();
                if (Game.inputState.index === itemOptions.length || itemOptions.length === 0) {
                    Game.battleState = BattleStage.SelectAction;
                }
                else {
                    const get_index = (name, array) => {
                        for (let i = 0; i < array.length; i++) {
                            if (array[i].name === name) {
                                return i;
                            }
                        }

                    }
                    const index = get_index(itemOptions[Game.inputState.index].name, this.player.consumables)
                    const item = this.player.useConsumable(index);

                    this.#feedback = `${CH.insert_color(this.player.getClassColor(), this.player.name)} uses ${CH.insert_color(item.getColor(), item.name)}!`;
                    if (item instanceof HealthPotion && Math.random() > 0.3) {
                        this.genieTempSpeech("A potion you used, Hum...\n Smart you are!")
                        this.#feedback += `\n Recovering ${CH.insert_color(item.getColor(), item.value)} HP!`;
                    }

                }
                Game.battleState = BattleStage.SelectAction;
            }
            else if (Game.battleState === BattleStage.PreSlain) {
                Game.battleState = BattleStage.Slain;

            }
            else if (Game.battleState === BattleStage.Slain) {
                if (this.currentEnemy.loot.length > 0) {
                    GameStates.getInstance().currentState = this.getLoot;
                }
                else
                    Game.battleState = BattleStage.Encounter;
            }
            else if (Game.battleState === BattleStage.GameOver) {
                GameStates.getInstance().currentState = this.playerDead;
            }

            GameStates.rerender();
        });


    /// Controls the inital menu
    mainMenu = new GameState(
        () => {
            Game.inputState.index = 0
            if (Game.mainMenuState === MainMenuStage.PreMenu) {
                CH.clear_screen();
                CH.print(Assets.Logos.paintedConsoleAdventure())
                CH.pressSpace("to Start");
            }
            else if (Game.mainMenuState === MainMenuStage.MainMenu) {
                CH.clear_screen();
                Game.inputState.maxIndex = Menu.startMenuOptions.length - 1;
                Game.inputState.vertical = true;
                CH.print(Assets.Logos.paintedConsoleAdventure())
                CH.print();
                CH.printOptions(Menu.startMenuOptions, Game.inputState.index, {
                    colors: [{
                        text: Menu.startMenuOptions[Menu.startMenuOptions.length - 1],
                        color: Colors.RED
                    },
                    {
                        text: "Load Game!",
                        color: Colors.LIGHTBLACK_EX
                    }]
                }, true)


            }
            else if (Game.mainMenuState === MainMenuStage.LoadGame) {
                CH.clear_screen();
                genie.speak("Loading Game... Has not been implemented yet.\nMuahahahaha!");
                CH.pressSpace();
            }
            else if (Game.mainMenuState === MainMenuStage.NewGame) {
                CH.clear_screen();
                Game.inputState.maxIndex = Menu.startMenuOptions.length - 1;
                Game.inputState.vertical = true;
                CH.print(Assets.Logos.paintedConsoleAdventure())

                CH.printOptions(Menu.startMenuOptions, Game.inputState.index, {
                    colors: [{
                        text: Menu.startMenuOptions[Menu.startMenuOptions.length - 1],
                        color: Colors.RED
                    },
                    {
                        text: "Load Game!",
                        color: Colors.LIGHTBLACK_EX
                    }]
                }, true)

            }
            else if (Game.mainMenuState === MainMenuStage.Info) {
                Menu.printInfo();
            }
            else if (Game.mainMenuState === MainMenuStage.GameModeSelection) {
                CH.clear_screen();
                Game.inputState.maxIndex = Menu.gameModeOptions.length - 1;
                Game.inputState.vertical = true;
                CH.print(Assets.Logos.paintedConsoleAdventure())
                CH.print();
                CH.printOptions(Menu.gameModeOptions, Game.inputState.index, {
                    colors: [
                        {
                            text: "Story Mode",
                            color: Colors.LIGHTBLACK_EX
                        }]
                }, true)
            }
            else if (Game.mainMenuState === MainMenuStage.GameModeInvalid) {
                CH.clear_screen();
                CH.print(Assets.Logos.paintedConsoleAdventure())
                CH.print();
                genie.speak("Story mode is not available yet. Please select another mode.");
                CH.print();
                CH.pressSpace();

            }

        },
        () => {
            if (Game.mainMenuState === MainMenuStage.MainMenu) {
                CH.clear_last_line(Menu.startMenuOptions.length + 1);
                CH.printOptions(Menu.startMenuOptions, Game.inputState.index, {
                    colors: [{
                        text: Menu.startMenuOptions[Menu.startMenuOptions.length - 1],
                        color: Colors.RED
                    },
                    {
                        text: "Load Game!",
                        color: Colors.LIGHTBLACK_EX
                    }]
                }, true)
                ///console.log(Game.mainMenuState)
            }
            if (Game.mainMenuState === MainMenuStage.GameModeSelection) {
                CH.clear_last_line(Menu.gameModeOptions.length + 1);
                CH.printOptions(Menu.gameModeOptions, Game.inputState.index, {
                    colors: [
                        {
                            text: "Story Mode",
                            color: Colors.LIGHTBLACK_EX
                        }]
                }, true)
            }
            //  console.log(Game.mainMenuState)

        },
        () => {
        },
        () => {
            const menu = Game.mainMenuState;
            const sel = Game.inputState.index;
            if (menu === MainMenuStage.PreMenu) {
                Game.mainMenuState = MainMenuStage.MainMenu;
                GameStates.rerender();

            }
            else if (menu === MainMenuStage.MainMenu) {
                if (sel === StartMenuOptions.NewGame) {
                    Game.mainMenuState = MainMenuStage.GameModeSelection;
                }
                else if (sel === StartMenuOptions.LoadGame) {
                    Game.mainMenuState = MainMenuStage.LoadGame;
                }
                else if (sel === StartMenuOptions.Info) {
                    Game.mainMenuState = MainMenuStage.Info;
                }
                else if (sel === StartMenuOptions.Exit) {
                    this.exitTheGame();
                }
                GameStates.rerender();
            }
            else if (menu === MainMenuStage.Info) {
                Game.mainMenuState = MainMenuStage.MainMenu;
                GameStates.rerender();
            }
            else if (menu === MainMenuStage.LoadGame) {
                Game.mainMenuState = MainMenuStage.MainMenu;
                GameStates.rerender();
            }
            else if (menu === MainMenuStage.GameModeSelection) {
                if (sel === 0) {
                    Game.mainMenuState = MainMenuStage.GameModeInvalid;
                }
                else if (sel === 1) {
                    Game.inputState.string = "";
                    GameStates.getInstance().currentState = this.playerCreation
                    Game.inputState.index = 0;
                }
                else if (sel === 2) {
                    Game.mainMenuState = MainMenuStage.MainMenu;
                }
                GameStates.rerender();
            }
            else if (menu === MainMenuStage.GameModeInvalid) {
                Game.mainMenuState = MainMenuStage.GameModeSelection;
                GameStates.rerender();
            }
        }
    );

    getLoot = new GameState(
        () => {
            Game.inputState.vertical = false;
            Game.inputState.index = 0;
            CH.clear_screen();
            let s = Math.random() > 0 ? `Oh look you have found:\nThe ` : "Wow is that a";
            if (this.currentEnemy.loot.length === 0) {
                GameStates.getInstance().goBack();
                return;
            }
            /// this.currentEnemy.loot[0] > 0 strictly
            const loot = this.currentEnemy.loot[0];
            const genStats = (item) => {
                let statsStr = "";
                if (item instanceof Weapon) {
                    const stats = item.stats;
                    statsStr += CH.insert_color(item.getColor(), `(x${item.damage})`);
                    statsStr += " [";
                    statsStr += CH.insert_color(GameColors.stats_colors[0].color, `+${stats.strength}`);
                    statsStr += ", "
                    statsStr += CH.insert_color(GameColors.stats_colors[1].color, `+${stats.intelligence}`);
                    statsStr += ", "
                    statsStr += CH.insert_color(GameColors.stats_colors[2].color, `+${stats.dexterity}`);
                    statsStr += "]";
                    Game.inputState.maxIndex = 1;
                }
                else if (item instanceof Equipament) {
                    const stats = item.getDefense();
                    statsStr += " [";
                    if (stats.armor > 0)
                        statsStr += CH.insert_color(GameColors.equip_colors[0].color, `${stats.armor}`);
                    if (stats.magic_resist > 0) {
                        if (stats.armor > 0)
                            statsStr += ", ";
                        statsStr += CH.insert_color(GameColors.equip_colors[1].color, `${stats.magic_resist}`);
                    }
                    statsStr += "]";
                }
                return statsStr;
            }
            s += CH.insert_color(loot.getColor(), loot.name);
            if (loot instanceof Weapon) {
                const loot = this.currentEnemy.loot[0];
                s += genStats(loot);
                s += "\n How ever you can only carry one weapon!";

            }
            else if (loot instanceof Equipament) {
                s += genStats(loot);
                s += "\n";
                if (this.player.equipaments.length >= this.player.MAX_EQUIPAMENT) {
                    Game.inputState.maxIndex = 2;
                    s += "but you already have enough equipament!";
                }
                else {
                    s += "do you want to equip it?";
                    Game.inputState.maxIndex = 1;
                }
            }
            genie.speak(s);
            CH.print("\n".repeat(3));

        },
        () => {
            const loot = this.currentEnemy.loot[0];
            let opts = [];
            CH.clear_last_line();
            if (loot instanceof Weapon) {

                opts.push(`Equip: ${CH.insert_color(loot.getColor(), loot.name)}`);
                opts.push("Toss it away.");


            }
            else if (loot instanceof Equipament) {
                if (this.player.equipaments.length < this.player.MAX_EQUIPAMENT) {
                    opts.push(`Equip: ${CH.insert_color(loot.getColor(), loot.name)}`);
                    opts.push("Toss it away.");
                }
                else {
                    for (const item of this.player.equipaments) {
                        opts.push(`Drop: ${CH.insert_color(item.getColor(), item.name)}`);
                    }
                    opts.push(`Leave ${CH.insert_color(loot.getColor(), loot.name)} behind.`);
                }

            }
            if (opts.length === 0) {
                throw new Error("Empty Loot");
            }
            CH.printOptions(opts, Game.inputState.index)

        },
        () => {
        },
        () => {
            const sel = Game.inputState.index;
            const cancelIndex = this.player.equipaments.length >= this.player.MAX_EQUIPAMENT ? this.player.equipaments.length : 1;
            if (sel === cancelIndex);
            else if (this.currentEnemy.loot[0] instanceof Weapon) {
                this.player.weapon = this.currentEnemy.loot[0];
            }
            else if (this.currentEnemy.loot[0] instanceof Equipament) {
                if (this.player.equipaments.length < this.player.MAX_EQUIPAMENT) {
                    this.player.equipaments.push(this.currentEnemy.loot[0]);
                }
                else {
                    this.player.equipaments.splice(sel, 1);
                    this.player.equipaments.push(this.currentEnemy.loot[0]);
                }
            }
            this.currentEnemy.loot.splice(0, 1);
            if (this.currentEnemy.loot.length === 0) {
                Game.battleState = BattleStage.Encounter;
                GameStates.getInstance().goBack();
            }

            GameStates.rerender();
        }
    );


    //Controls end of the game
    playerDead = new GameState(
        () => {
            Game.inputState.maxIndex = 1;
            Game.inputState.vertical = false;
            if (Game.inputState.index > 1)
                Game.inputState.index = 0;
            CH.clear_screen();
            this.printBasicFrame();
            CH.print();
        },
        () => {
            CH.clear_last_line();
            CH.printOptions(Menu.gameEndOptions, Game.inputState.index, {
                colors: [{
                    text: "Exit",
                    color: Colors.RED
                },
                {
                    text: "Load Game!",
                    color: Colors.LIGHTBLACK_EX
                }]
            }, false)
        },
        () => {
        },
        () => {
            const sel = Game.inputState.index
            if (sel === StartMenuOptions.NewGame) {
                Game.inputState.string = "";
                this.currentEnemy.suicide();
                Game.mainMenuState = MainMenuStage.PreMenu
                GameStates.getInstance().currentState = this.mainMenu
            }

            else {
                this.exitTheGame();
            }


        }
    );

    //Controls the game Menu
    gameMenu = new GameState(
        () => {
            Game.inputState.index = 0;
            //Main Menu
            if (Game.gameMenuState === GameMenuStage.MainMenu) {
                Game.inputState.vertical = true;
                Game.inputState.maxIndex = Menu.gameMenuOptions.length - 1;
                if (Game.inputState.index > Game.inputState.maxIndex - 1)
                    Game.inputState.index = 0;
                CH.clear_screen();
                CH.print(Assets.Logos.paintedConsoleAdventure())
                CH.print();
                for (let i = 0; i < Menu.gameMenuOptions.length; i++) {
                    CH.print();
                }

            }

            else if (Game.gameMenuState === GameMenuStage.SaveGame) {
                CH.clear_screen();
                genie.speak("Saving Game... Has not been implemented yet.\nMuahahahaha!");
                CH.pressSpace();
            }

            else if (Game.gameMenuState === GameMenuStage.Info) {
                Menu.printInfo();
            }

            else if (Game.gameMenuState === GameMenuStage.ConfirmQuit) {
                Game.inputState.maxIndex = 1;
                Game.inputState.vertical = false;
                CH.clear_screen();
                genie.speak("Are you sure you want to quit?\nYou will lose all your progress!",
                    {},
                    undefined,
                    {
                        hcenter: true
                    }
                );
                CH.print();
            }

            else if (Game.gameMenuState === GameMenuStage.Help) {
                CH.clear_screen();
                const speech = CH.breakLine(
                    `You can use A and D or the arrow keys to navigate the menus and select options.
Press the Spacebar or Enter to confirm your selection.`,
                    CH.getWidth() / 2, true);
                genie.speak(speech,
                    [{
                        text: [" A ", " D ", " arrow keys "],
                        color: Colors.GREEN,
                        decoration: Decorations.Bold
                    },
                    {
                        text: ["Spacebar", "Enter"],
                        color: Colors.YELLOW,
                        decoration: [Decorations.Bold, Decorations.Underlined]

                    }],
                    false,
                    {
                        hcenter: true
                    });
                CH.pressSpace();
            }
            else if (Game.gameMenuState === GameMenuStage.Help_2) {
                CH.clear_screen();
                const speech = CH.breakLine(`When you encounter an enemy,
you can attack, use items, or flee.
However, fleeing is not always successful and when 
You attack, the enemy strikes back!`, CH.getWidth() / 2, true);
                genie.speak(speech,
                    [{
                        text: [" A ", " D ", " arrow keys "],
                        color: Colors.GREEN,
                        decoration: Decorations.Bold

                    },
                    {
                        text: ["Spacebar", "Enter"],
                        color: Colors.YELLOW,
                        decoration: Decorations.Bold

                    }],
                    false,
                    {
                        hcenter: true
                    });
                CH.pressSpace();
            }
            else if (Game.gameMenuState === GameMenuStage.Help_3) {
                CH.clear_screen();
                genie.speak(CH.breakLine(`When you defeat an enemy, you gain experience points and loot.
And after a kill you rest for a little bit and restore health,
If you fled you won't restore as much Health`, CH.getWidth() / 2, true),
                    {},
                    false,
                    {
                        hcenter: true
                    });
                CH.pressSpace();
            }
        },
        () => {
            if (Game.gameMenuState === GameMenuStage.MainMenu) {
                CH.clear_last_line(Menu.gameMenuOptions.length + 1);
                CH.printOptions(Menu.gameMenuOptions, Game.inputState.index, {
                    colors: [{
                        text: Menu.gameMenuOptions[Menu.gameMenuOptions.length - 1],
                        color: Colors.RED
                    },
                    {
                        text: "Load Game!",
                        color: Colors.LIGHTBLACK_EX
                    },
                    {
                        text: "Green",
                        color: Colors.GREEN
                    }]
                }, true)
            }
            else if (Game.gameMenuState === GameMenuStage.ConfirmQuit) {
                CH.clear_last_line();
                CH.printOptions(["Yes", "No"], Game.inputState.index, {
                    colors: [{
                        text: "Yes",
                        color: Colors.RED
                    }]
                }, false)
            }

        },
        () => { },
        () => {
            const menu = Game.gameMenuState;
            if (menu === GameMenuStage.MainMenu) {
                const sel = Game.inputState.index;
                if (sel === GameMenuOptions.Continue) {
                    GameStates.getInstance().goBack();
                }
                else if (sel === GameMenuOptions.MainMenu) {
                    Game.gameMenuState = GameMenuStage.ConfirmQuit;

                }
                else if (sel === GameMenuOptions.SaveGame) {
                    Game.gameMenuState = GameMenuStage.SaveGame;
                }
                else if (sel === GameMenuOptions.Help) {
                    Game.gameMenuState = GameMenuStage.Help;
                }
                else if (sel === GameMenuOptions.Info) {
                    Game.gameMenuState = GameMenuStage.Info;
                }
                else if (sel === GameMenuOptions.Exit) {
                    this.exitTheGame();
                }
            }
            else if (menu === GameMenuStage.Info || menu === GameMenuStage.SaveGame) {
                Game.gameMenuState = GameMenuStage.MainMenu;
            }
            else if (menu === GameMenuStage.ConfirmQuit) {
                const sel = Game.inputState.index;
                if (sel === ConfirmOptions.Yes) {
                    this.currentEnemy.suicide();
                    this.player.health = 0;
                    GameStates.getInstance().currentState = this.mainMenu;
                }
                else if (sel === ConfirmOptions.No) {
                    Game.gameMenuState = GameMenuStage.MainMenu;
                }
            }
            else if (menu === GameMenuStage.Help) {
                Game.gameMenuState = GameMenuStage.Help_2;
            }
            else if (menu === GameMenuStage.Help_2) {
                Game.gameMenuState = GameMenuStage.Help_3
            }
            else if (menu === GameMenuStage.Help_3) {
                Game.gameMenuState = GameMenuStage.MainMenu
            }
            GameStates.rerender();
        }
    );
    //Makes an attack name into a third person verb
    static getThirdPerson = (name) => {
        if (typeof name !== "string") {
            throw new Error("name must be a string");
        }

        if (name.endsWith('s')) {
            return name + "'";
        }
        else if (name.endsWith('y')) {
            return name.substring(0, name.length - 1) + 'ies';
        }
        else if (name.endsWith('x') || name.endsWith('z') || name.endsWith('ch') || name.endsWith('sh')) {
            return name + 'es';
        }
        else
            return name + 's';
    }
}

export { Game, GameStates, MainMenuStage, genie, GameState };
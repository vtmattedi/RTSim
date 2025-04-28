import * as ConsoleImpl from './Base/ConsoleHelp.js';
import Assets from "./Assets/Assets.js";
import { GameColors } from './Base/GameColors.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
const Decorations = ConsoleImpl.Decorations;


/*
* Once create the Genie instance, it will be the same instance for the whole session.
*/

class Genie {
    static #LockState = ()=>{};
    static #instance = null; //private
    // strictly private
    static #genie_pool = [
        {
            name: 'Zephiroth the Red Genie!',
            colorName: 'Red',
        },
        {
            name: 'Calidra the Blue Genie!',
            colorName: 'Blue',
        },
        {
            name: 'Azarmis the Green Genie!',
            colorName: 'Green',
        },
        {
            name: 'Faerithan the Yellow Genie!',
            colorName: 'Yellow',
        },
        {
            name: 'Jinnira the Magenta Genie!',
            colorName: 'Magenta',
        }
    ];
    static createBubble(text, minHeigth = 0, minWidth = 0) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }

        let lines = text.split('\n');

        while (lines.length < minHeigth) {
            lines.push(' '.repeat(3));
        }

        let maxLength = Math.max(...lines.map(line => {
            return CH.getLineWidth(line)
        }),minWidth);

        if (maxLength > CH.getWidth() * 0.6 && minWidth === 0) {
            lines = CH.breakLine(text, Math.round(CH.getWidth() * 0.6));
            return Genie.createBubble(lines, minHeigth, minWidth);
        }
        const border = ' '.repeat(maxLength + 4);//top/bottom empity line
        const bubbleTop = ` ${'_'.repeat(maxLength + 4)} `;
        const bubbleBottom = `\\${'-'.repeat(maxLength + 4)}/ `;

        const bubbleMiddle = lines.map(line => {
            ;
            return `| ${CH.hcenter(line, maxLength + 2)} |`;
        }).join('\n');

        return `${bubbleTop}\n/${border}\\\n${bubbleMiddle}\n|${border}|\n${bubbleBottom}`;
    }
    #colorName;//{get; private set}
    #name;//{public with type check on assignment}
    #genieSeed
    constructor() {
        if (Genie.#instance) {
            return Genie.#instance;
        }
        else {
            const genieSeed = Math.floor(Math.random() * (Genie.#genie_pool.length - 1))
            this.missBehaviour = Number(Math.random().toFixed(2));
            this.#name = Genie.#genie_pool[genieSeed].name;
            this.#colorName = Genie.#genie_pool[genieSeed].colorName;
            this.#genieSeed = genieSeed;
            Genie.#instance = this;
        }
    }
    static getInstance() {
        if (!Genie.#instance) {
            Genie.#instance = new Genie();
        }
        return Genie.#instance;
    }
    setSeed(seed) {
        if (typeof seed !== 'number')
            throw new TypeError("Seed must be a number");
        this.#genieSeed = Math.floor(seed);
        this.missBehaviour = Number((seed % 1).toFixed(2));
        this.#name = Genie.#genie_pool[this.#genieSeed].name;
        this.#colorName = Genie.#genie_pool[this.#genieSeed].colorName;
    }
    getSeed() {
        return this.#genieSeed + this.missBehaviour;
    }
    shortName() {
        return this.#name.substring(0, this.#name.indexOf(' '));
    }
    setLockState(lockState)
    {
        Genie.#LockState = lockState;
    }
    introduce() {
        this.speak(`
Greetings, I am ${this.#name}
Welcome to the Great ${CH.insert_color(Colors.YELLOW, "Console")} ${CH.insert_color(Colors.GREEN, "Adventure")}!`,
            [{
                text: this.#name.substring(0, this.#name.indexOf(' ')),
                color: this.color
            }]
        );
    }
    generateName() {
        const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'];
        return consonants[Math.floor(Math.random() * consonants.length)].toUpperCase() + 'andy';
    }
    goodbye(player) {
        let Color = Colors.WHITE;
        if (!player)
            player = { name: "You" };
        let name;
        try {
            Color = player.getClassColor();
            name = player.name;

        } catch (error) {
            Color = Colors.WHITE;
            name = "You";
        }
        name = CH.insert_color(Color, name);
        const goodbye = ["Goodbye! I will miss you!", "Hasta la vista, baby!", `${name}, shall be missed!`, `Farewell, ${this.shortName()} shall miss you!`, `Oh, never thought ${name} would quit so easily!`, `Ha, I knew ${name} could not make it!`];
        const seed = Math.floor(Math.random() * goodbye.length);
        const width = CH.getWidth();
        this.speak(CH.hcenter(goodbye[seed], width / 3),
            {
                text: this.shortName(),
                color: this.color
            },undefined,undefined,false
        );
    }
    smirk(_class) {
        if (typeof (_class) !== 'string')
            this.speak(`Ha, That may be a class but may also be a structure!`);
        else {
            // this.speak(`Oh, a ${_class}! How original!`,
            //     GameColors.class_colors);
            let phrase = "";
            if (_class === "Mage") {
                phrase = (`Oh, a ${_class}! pew pew Fireball, pew pew Alter Time.`)
            }
            else if (_class === "Warrior") {
                phrase = (`Oh, a ${_class}! I shall speak as you: Zug, zug zug? zug zug zug zug.`)
            }
            else if (_class === "Rogue") {
                phrase = (`A ${_class}? Where? now I see you, now I don't.`)

            }
            this.speak(CH.breakLine(phrase, CH.getWidth()), GameColors.class_colors)
        }
    }
    explainGame() {
        CH.clear_screen();
        const move = `
You can choose options with A and D keys
(and sometimes with W and S keys),
and use Spacebar to select the option.`;
        this.speak(move,
            [
                {
                    text: [' A ', ' D ', ' W ', ' S '],
                    color: Colors.GREEN,
                    decoration: Decorations.Bold
                },
                {
                    text: 'Spacebar',
                    color: Colors.YELLOW
                }

            ]
        );
        let choice = -1;
        while (choice !== 0 && choice !== 1) {
            choice = CH.SelectValue(['Continue', 'Go on', `I don't like you`, 'Exit'], {
                start: Math.max(0, choice),
                colors: [{
                    text: 'Exit',
                    color: Colors.RED
                }]
            }, true);
            if (choice === 0 || choice === 1) {
                CH.clear_screen();
                this.speak('Great! Let\'s embark on this jurney!');
            }
            else if (choice === 2) {
                const responses = [
                    `Oh, you don’t like me? How unfortunate... for you. I’m ${this.#name} Like it or not, I’m all you’ve got!`,
                    `Tsk tsk, feelings aren’t mutual. I am ${this.#name.substring(0, this.#name.length - 1)} after all. Shall we get on with it?`,
                    `Dislike me? Too bad! I’m ${this.#name} and YOU summoned me!`,
                    `Ah, the cold shoulder. Classic! Well, you’re stuck with ${this.#name}`,
                    `Not a fan? Lucky for me, I’m not here for approval! I’m ${this.#name}`,
                    `How DARE you puny mortal! I’m ${this.#name.substring(0, this.#name.indexOf(' '))} the Great Gre.. ... I mean I'm ${this.#name} and I am here to serve you!`
                ];
                const genieSeed = Math.floor(Math.random() * 6)
                CH.clear_screen();
                const width = CH.getWidth();
                this.speak(CH.breakLine(responses[genieSeed], width / 2),
                    [{
                        text: this.#name.substring(0, this.#name.indexOf(' ')),
                        color: this.color
                    },
                    {
                        text: 'Gre..',
                        color: Colors.LIGHTBLACK_EX
                    },
                    {
                        text: 'Exit',
                        color: Colors.RED
                    }]
                );
            }
            else if (choice === 3) {
                CH.clear_screen();
                this.goodbye();
                process.exit();
            }
        }

        CH.clear_screen();
        this.speak("You can Attack enemies, use items or flee from them. Once you attempt to flee, you can't flee again until you attack again. If you attack an enemy and it lives, it will attack back.");
        CH.pressSpace();

    }
    speak(sentence, colors = {}, rightSprite, options, animate = true, animEndCb) {
        
        //Makes sure only 1 sprite is printed
        var genieLines = Assets.GenieSprite.getSprite();
        const printSpeach = (step = -1, layer = 0) => {
            const width = Math.max(...genieLines.split('\n').map(line => line.length));
            let final_sentence = sentence;
            if (rightSprite) {
                final_sentence = CH.breakLine(sentence, CH.getWidth() / 4);
            }
            let delayedSentence = final_sentence.split('\n');
            const delayedSentenceLength = delayedSentence.length;
            if (step >= 0) {
                delayedSentence = delayedSentence.slice(0, step + 1);
                const colornum = layer<10? 245 + layer : 7;
                const color = Colors.custom_colors(colornum);
                if (delayedSentence[step])
                    delayedSentence[step] = CH.insert_color(color, delayedSentence[step]);
            }
            const maxWidthLength = Math.max(...delayedSentence.map(line => CH.getLineWidth(line)));
            let final_sprite = CH.merge(genieLines, Genie.createBubble(delayedSentence.join('\n'), delayedSentenceLength, maxWidthLength));
            final_sprite = CH.paintSprite(final_sprite, width, this.color);
            if (rightSprite)
                final_sprite = CH.merge(final_sprite, rightSprite,
                    {
                        right: {
                            align: "vcenter"
                        }
                    });
            else
                final_sprite = CH.hcenter(final_sprite, CH.getWidth());
            //console.log(this.color);
           

            if (colors) {
                if (!Array.isArray(colors))
                    colors = [colors];
                    colors.forEach(item => {
                        let format = {
                            color: item.color,
                            decoration: item.decoration,
                            background: item.background
                        }
                        let textArray = [];
                        if (!Array.isArray(item.text))
                            textArray = [item.text];
                        else
                            textArray = item.text;
                        textArray.forEach(text => final_sprite = final_sprite.replaceAll(text, CH.insert_format(format, text)));
    
                    });                
            }
            
            // if (options) {
            //     if (options.hcenter)
            //         final_sprite = final_sprite.split('\n').map(line => CH.hcenter(line, CH.getWidth())).join('\n');
            // }
            CH.print(final_sprite);
        }
        
     
        if (!animate || typeof Genie.#LockState !== 'function')
                printSpeach();
      
        else {

            const maxStep =  CH.breakLine(sentence, CH.getWidth() / 4).split('\n').length +1;
            
            let _step = 0;
            let _layer = 0;

            Genie.#LockState(true);
            const interval = setInterval(() => {
                CH.clear_screen();
                printSpeach(_step, _layer);
                _layer++;
                if (_layer > 10)
                {
                    _layer = 0;
                    _step++;
                }
                if (_step >= maxStep) {
                    clearInterval(interval);
                    Genie.#LockState(false);
                    if (animEndCb)
                        animEndCb();
                }
            }, 50);

        }
    }
    get name() {
        return this.#name;
    }

    set name(value) {
        if (!(typeof value === "string"))
            throw new TypeError("name must be a string");
        this.#name = value
    }

    get color() {
        if (this.#colorName === "Red")
            return Colors.RED;
        else if (this.#colorName === "Blue")
            return Colors.BLUE;
        else if (this.#colorName === "Green")
            return Colors.GREEN;
        else if (this.#colorName === "Yellow")
            return Colors.YELLOW;
        else if (this.#colorName === "Magenta")
            return Colors.MAGENTA
    }
}

export { Genie };
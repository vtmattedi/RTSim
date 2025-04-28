import { Unit } from '../Base/Unit.js';
import * as ConsoleImpl from '../Base/ConsoleHelp.js';
import { DevMode } from '../Base/DevMode.js';
import { EnemyUtils } from './EnemyUtils.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;


class Enemy extends Unit {
    // Should not be  created without a type
    #name; //{get; private set}
    #level; //{get; private set}
    #loot = []; // {fake public with type check}
    #xp_drop = 0; // {fake public with type check}
    constructor(name, maxHealth, level, stats) {
        const armor = EnemyUtils.genArmor(level);
        super(maxHealth, armor.armor, armor.magic_resist);
        this.#name = name;
        this.#level = level;
        this.#loot = [];
        this.#xp_drop = level * 10;
        if (stats) {
            this.setStats(stats.strength, stats.intelligence, stats.dexterity);
        }
    }
    suicide() {
        this.health = 0;
    }
    randomAttack() {
        if (this.attacks.length === 0)
            throw new Error("No attacks available");
        let seed = Math.floor(Math.random() * (this.attacks.length - 1));
        return this.attacks[seed];
    }

    getDifficulty() {
        throw new Error("Method 'getDifficulty()' must be implemented.");
    }

    generateEnemyInfo() {
        /*
            ------------- [ ] Name lv 5 -------------
            |
            [=====================================]|                       
            |str:                    Armor:         |                     
            |dex                     MR             |
            |int                                    |
            |                                       |
            |                                       |
            |                                       |
            -----------------------------------------
            
            */
        const width = Math.round(CH.getWidth() / 4);
        let lines = [];
        let line = ` [${this.getDifficulty()}] ${this.name} lv ${this.level} `;

        line = CH.hcenter(line, width + 2, "-");
        lines.push(line);
        line = this.isDead() ? `Dead` : `HP: ${this.health}/${this.maxHealth}`;
        line = CH.hcenter(line, width, " ");
        lines.push(line);


        line = `${CH.fillBar(1 - this.health / this.maxHealth, width , " ",
            Colors.BG_RED, Colors.BG_GREEN)}`;
        lines.push(line);

        line = `Str: ${this.strength} Int: ${this.intelligence} Dex: ${this.dexterity}`;
        line = CH.hcenter(line, width, " ");
        lines.push(line);
        line = `Armor: ${this.armor} MR: ${this.magic_resist}`;
        line = CH.hcenter(line, width, " ");
        lines.push(line);
        if (DevMode.getInstance().value) {
            line = `[${CH.insert_color(ConsoleImpl.DefaultColors.custom_colors(53), "Loot")}]`;
            line = CH.hcenter(line, width, " ");
            lines.push(line);
            if (this.loot.length > 0) {
                for (const loot of this.loot) {
                    line = CH.insert_color(loot.getColor(), loot.name);
                    line = CH.hcenter(line, width, " ");
                    lines.push(line);
                }
            }
            else {
                line = "<No loot>";
                line = CH.hcenter(line, width, " ");
                lines.push(line);
            }
            line = CH.insert_color(Colors.LIGHTMAGENTA_EX, "Xp Drop: ") + this.xp_drop
            line = CH.hcenter(line, width, " ");
            lines.push(line);

        }
        lines.push("-".repeat(width + 2))


        return lines.map((item, index) => {
            if (index !== 0 && index !== lines.length - 1)
                return `|${item}|`;
            else
                return item;
        }).join('\n');
    }

    get name() { return this.#name }
    get level() { return this.#level }
    get xp_drop() { return this.#xp_drop }
    set xp_drop(value) {
        if (!(typeof value === "number"))
            throw new TypeError("xp must be a number!")
        this.#xp_drop = value;
    }
    get loot() { return this.#loot }
    set loot(value) {
        if (!Array.isArray(value))
            throw new TypeError("loot must be an Array, even empty.")
        this.#loot = value
    }
}

class CommonEnemy extends Enemy {
    constructor(name, maxHealth, level, stats) {
        super(name, maxHealth, level, stats);
        this.attacks = EnemyUtils.genAtkPool([3, 0, 0], level);
    }
    getDifficulty() {
        return "C";
    }
}

class Boss extends Enemy {
    constructor(name, maxHealth, level, stats) {
        super(name, maxHealth, level, stats);
        this.armor = Math.round(this.armor * 1.5);
        this.magic_resist = Math.round(this.magic_resist * 1.5);
        this.attacks = EnemyUtils.genAtkPool([2, 2, 1], level);
        this.xp_drop = this.xp_drop * 2;

    }
    getDifficulty() {
        return "B";
    }
}

class Elite extends Enemy {
    constructor(name, maxHealth, level, stats) {
        super(name, maxHealth, level, stats);
        this.armor = Math.round(this.armor * 1.2);
        this.magic_resist = Math.round(this.magic_resist * 1.2);
        this.attacks = EnemyUtils.genAtkPool([3, 2, 0], level);
        this.xp_drop = Math.round(this.xp_drop * 1.5);
    }
    getDifficulty() {
        return "E";
    }
}

class Minion extends Enemy {
    constructor(name, maxHealth, level, stats) {
        super(name, maxHealth, level, stats);
        this.armor = Math.round(this.armor * 0.75);
        this.magic_resist = Math.round(this.magic_resist * 0.75);
        this.attacks = EnemyUtils.genAtkPool([2, 0, 0], level);
    }
    getDifficulty() {
        return "M";
    }
}

export {
    Enemy,
    CommonEnemy,
    Boss,
    Elite,
    Minion,
}
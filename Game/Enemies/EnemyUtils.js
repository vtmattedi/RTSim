// Objective: Provide utility functions for generating enemies
import * as Attacks from '../Base/Attack.js';


class EnemyUtils {
    static magicAttackNames = [
        "Mystic Blast", "Arcane Surge", "Flame Wave", "Frostbolt", "Shadow Strike",
        "Lightning Bolt", "Void Pulse", "Spirit Lash", "Eldritch Burst", "Mana Storm"
    ];

    static physicalAttackNames = [
        "Sword Slash", "Axe Chop", "Spear Thrust", "Mace Smash", "Orcish Cleave",
        "Hammer Blow", "Frenzied Bite", "Skull Crusher", "Shield Bash", "Brutal Kick"
    ];

    static hybridAttackNames = [
        "Enchanted Blade", "Cursed Arrow", "Stormstrike", "Inferno Fist", "Arcane Slash"
    ];

    // Function to generate attacks
    static generateAttacks() {
        const common_attacks = [];
        const special_abilities = [];
        const super_spell = [];

        const default_attack_value = 1;

        // 20 common atks
        for (let i = 0; i < 10; i++) {
            const magicAttack = new Attacks.MagicAttack(EnemyUtils.magicAttackNames[i], 1);
            const physicalAttack = new Attacks.PhysicalAttack(EnemyUtils.physicalAttackNames[i], 1);
            common_attacks.push(magicAttack, physicalAttack);
        }

        // 10 special atks
        const hybrid1 = new Attacks.HybridAttack(EnemyUtils.hybridAttackNames[0], 1, 1);
        special_abilities.push(hybrid1);

        for (let i = 0; i < 5; i++) {
            const magicAttack = new Attacks.MagicAttack(EnemyUtils.magicAttackNames[i], 1);
            special_abilities.push(magicAttack);
        }

        for (let i = 5; i < 9; i++) {
            const physicalAttack = new Attacks.PhysicalAttack(EnemyUtils.physicalAttackNames[i], 1);
            special_abilities.push(physicalAttack);
        }

        // 10 super spells
        for (let i = 0; i < 3; i++) {
            const hybridAttack = new Attacks.HybridAttack(EnemyUtils.hybridAttackNames[i], 1, 1);
            super_spell.push(hybridAttack);
        }

        for (let i = 0; i < 4; i++) {
            const magicAttack = new Attacks.MagicAttack(EnemyUtils.magicAttackNames[i], 1);
            super_spell.push(magicAttack);
        }

        for (let i = 0; i < 3; i++) {
            const physicalAttack = new Attacks.PhysicalAttack(EnemyUtils.physicalAttackNames[i], 1);
            super_spell.push(physicalAttack);
        }

        return { common_attacks, special_abilities, super_spell };
    }
    static atk_pool = EnemyUtils.generateAttacks();
    static genAtkPool(types, level) {
        let res = [];
        if (!Array.isArray(types) || types.length !== 3)
            throw new Error("Types must be an array of 3 elements");
        if (types[0] < 0 || types[1] < 0 || types[2] < 0)
            throw new Error("Types must be positive integers");
        if (types[0] + types[1] + types[2] < 1)
            throw new Error("At least one attack must be generated");
        if (types[0] > EnemyUtils.atk_pool["common_attacks"].length || types[1] > EnemyUtils.atk_pool["special_abilities"].length || types[2] > EnemyUtils.atk_pool["super_spell"].length)
            throw new Error("Not enough attacks to generate");

        for (let i = 0; i < types[0]; i++) {
            const atk = EnemyUtils.atk_pool["common_attacks"];
            let seed = Math.floor(Math.random() * atk.length);
            while (res.includes(atk[seed])) {
                seed += 1
                if (seed >= atk.length) {
                    seed = 0;
                }
            }
            // Generate Attack damage based on level, can't be hybrid here
            atk[seed].damage = level + Math.floor(level / 10 * Math.random() - 0.5);
            res.push(atk[seed]);
        }
        for (let i = 0; i < types[1]; i++) {
            const atk = EnemyUtils.atk_pool["special_abilities"];
            let seed = Math.floor(Math.random() * atk.length);
            while (res.includes(atk[seed])) {
                seed += 1
                if (seed >= atk.length) {
                    seed = 0;
                }
            }
            // Generate Attack damage based on level
            // Hybrid attacks have both magic and physical damage
            if (atk[seed] instanceof Attacks.HybridAttack) {
                atk[seed].magic_damage = level + Math.floor(level / 4 * Math.random() - 0.5);
                atk[seed].physical_damage = level + Math.floor(level / 4 * Math.random() - 0.5);
            } else {
                atk[seed].damage = level + Math.floor(level / 4 * Math.random() - 0.5);
            }
            res.push(atk[seed]);
        }
        for (let i = 0; i < types[2]; i++) {
            const atk = EnemyUtils.atk_pool["super_spell"];
            let seed = Math.floor(Math.random() * atk.length);
            while (res.includes(atk[seed])) {
                seed += 1
                if (seed >= atk.length) {
                    seed = 0;
                }
            }
            if (atk[seed] instanceof Attacks.HybridAttack) {
                atk[seed].magic_damage = level + Math.floor(level / 2 * Math.random() - 0.5);
                atk[seed].physical_damage = level + Math.floor(level / 2 * Math.random() - 0.5);
            } else {
                atk[seed].damage = level + Math.floor(level / 2 * Math.random() - 0.5);
            }
            res.push(atk[seed]);
        }
        return res;
    }

    static genArmor(level) {
        let res = {
            armor: level + Math.floor(level / 2 * Math.random() - 0.5),
            magic_resist: level + Math.floor(level / 2 * Math.random() - 0.5),
        };
        res.armor = res.armor < 0 ? 0 : res.armor;
        res.magic_resist = res.magic_resist < 0 ? 0 : res.magic_resist;
        res.armor = Math.round(res.armor);
        res.magic_resist = Math.round(res.magic_resist);
        return res;
    }
}

export{ EnemyUtils };
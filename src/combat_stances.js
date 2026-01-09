"use strict";
import { skills } from "./skills.js";
const stances = {};

class Stance {
    constructor(
            {
                name,
                id,
                max_bonus = 2,
                related_skill,
                target_count = 1,
                randomize_target_count = false,
                is_unlocked = false,
                stat_multipliers = {},
                description = ""
            }
        ) {
            
        if(related_skill && !skills[related_skill]) {
            throw(`Tried to attach skill "${related_skill}" to stance "${name}", but such a skill doesnt exist!`);
        }

        this.name = name;
        this.max_bonus = max_bonus;
        this.id = id;
        this.related_skill = related_skill;
        this.description = description;
        if(this.target_count < 1) {
            throw("Combat stance cannot target less than 1 enemy!");
        }  
        this.target_count = target_count;
        this.randomize_target_count = randomize_target_count; //if true, the actual target count is a random number in range [1, target_count]
        this.is_unlocked = is_unlocked;
        this.stat_multipliers = stat_multipliers;
    }

    getDescription = function(){
        if(this.description) {
            return this.description;
        } else if(this.related_skill) {
            return skills[this.related_skill].description;
        }
    }

    getStats = function() {
        if(!this.related_skill) {
            //no skill, nothing to scale stats with
            return this.stat_multipliers;
        } else {
            const multipliers = {};
            Object.keys(this.stat_multipliers).forEach(stat => {
                if(this.stat_multipliers[stat] < 1) {
                    multipliers[stat] = this.stat_multipliers[stat] + (1 - this.stat_multipliers[stat]) * skills[this.related_skill].current_level/(skills[this.related_skill].max_level);
                    //div by 2 because penalties don't get fully nullified, only cut in half (e.g. x0.8 -> x0.9)
                    //什么鬼？满级了惩罚归零简直天经地义...
                }
                else {
                    multipliers[stat] =  this.stat_multipliers[stat] + (this.stat_multipliers[stat]-1) * skills[this.related_skill].current_level/skills[this.related_skill].max_level * (this.max_bonus - 1);
                }
            });
            return multipliers;
        }
    }
}

stances["normal"] = new Stance({
    name: "[无]",
    id: "normal",
    is_unlocked: true,
    description: "不使用任何秘法，仅仅利用蛮力来战斗。",
    stat_multipliers: {}
})

stances["quick"] = new Stance({
    name: "Quick Steps",
    id: "quick",
    related_skill: "Quick steps",
    description: "A swift and precise technique that abandons strength in favor of greater speed",
    stat_multipliers: {
        attack_power: 0.8,
        attack_speed: 1.2
    },
});

stances["heavy"] = new Stance({
    name: "Crushing Force",
    id: "heavy",
    related_skill: "Heavy strike",
    stat_multipliers: {
        //attack multis are stronger than they appear since enemies have defense stat
        attack_power: 1.2,
        attack_speed: 0.8
    },
});

stances["defensive"] = new Stance({
    name: "Defensive Measures",
    id: "defensive",
    related_skill: "Defensive measures",
    stat_multipliers: {
        attack_power: 0.8,
        agility: 1.2,
        block_strength: 1.1,
    },
    target_count: 1,
});

stances["wide"] = new Stance({
    name: "Broad Arc",
    id: "wide",
    related_skill: "Wide swing",
    stat_multipliers: {
        attack_power: 0.4,
    },
    target_count: 4,
});

stances["berserk"] = new Stance({
    name: "Berserker's Stride",
    id: "berserk",
    related_skill: "Berserker's stride",
    stat_multipliers: {
        attack_power: 1.2,
        hit_chance: 1.2,
        agility: 0.4,
        block_strength: 0.4,
    },
    target_count: 3,
    randomize_target_count: true,
});

stances["flowing water"] = new Stance({
    name: "Flowing Water",
    id: "flowing water",
    related_skill: "Flowing water",
    stat_multipliers: {
        attack_power: 1.2,
        agility: 1.2,
        attack_speed: 1.2,
    },
    target_count: 2,
});
//血洛大陆秘法↓
stances["MB_Speed"] = new Stance({
    name: "融血·疾",
    id: "MB_Speed",
    description: "可以稍微加快攻击速度。",
    related_skill: "MergeBlood",
    stat_multipliers: {
        attack_speed: 1.1,
        max_health: 0.75,
    },
    target_count: 1,
    max_bonus: 2,
});

stances["MB_Power"] = new Stance({
    name: "融血·锐",
    id: "MB_Power",
    related_skill: "MergeBlood",
    description: "可以略微增强攻击力。",
    stat_multipliers: {
        attack_power: 1.1,
        max_health: 0.75,
    },
    target_count: 1,
});

export {stances};
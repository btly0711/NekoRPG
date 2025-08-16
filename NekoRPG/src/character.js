"use strict";

import { InventoryHaver } from "./inventory.js";
import { skills, weapon_type_to_skill } from "./skills.js";
import { update_displayed_character_inventory, update_displayed_equipment, 
         update_displayed_stats,
         update_displayed_health, 
         update_displayed_skill_xp_gain, update_all_displayed_skills_xp_gain,
         update_displayed_xp_bonuses } from "./display.js";
import { active_effects, current_location, current_stance } from "./main.js";
import { current_game_time } from "./game_time.js";
import { stances } from "./combat_stances.js";

class Hero extends InventoryHaver {
        constructor() {
                super();
        }
}

const base_block_chance = 0.75; //+20 from the skill

const character = new Hero();
character.name = "Neko";
character.titles = {};
character.base_stats = {
        max_health: 50, 
        health: 50,
        health_regeneration_flat: 0, //in combat
       // health_regeneration_percent: 0, //too op
       
        attack_power: 1, 
        defense: 0,
        agility: 1, 
        attack_speed: 1, 
        crit_rate: 0.01, 
        crit_multiplier: 1.5,


        block_strength: 0,
        block_chance: 0,
        evasion_points: 0, //EP
        attack_points: 0, //AP
        strength: 10, 
        dexterity: 10, 
        intuition: 10,
};


character.stats = {};
character.stats.full = {...character.base_stats};
character.stats.total_flat = {};
character.stats.total_multiplier = {};
/*
max_health: 0, 
health_regeneration_flat: 0, //in combat
agility: 0, 
attack_speed: 0, 
crit_rate: 0, 
crit_multiplier: 0,
attack_power: 0, 
defense: 0,

characters.stats.flat为加算加成，multiplier为乘算加成。
其中有细分加成的来源。
*/
character.stats.flat = {
        level: {},
        skills: {},
        equipment: {},
        skill_milestones: {},
        books: {},
        light_level: {},
        environment: {},
        gems: {},
};

character.stats.multiplier = {
        skills: {},
        skill_milestones: {},
        equipment: {},
        books: {},
        stance: {},
        light_level: {},
        environment: {},
};

character.xp_bonuses = {};
character.xp_bonuses.total_multiplier = {
        hero: 1,
        all: 1,
        all_skill: 1,
};

character.xp_bonuses.multiplier = {
        levels: {},
        skills: {},
        skill_milestones: {},
        equipment: {},
        books: {}
};

character.equipment = {
        head: null, torso: null, 
        arms: null, ring: null, 
        weapon: null, "off-hand": null,
        legs: null, feet: null, 
        amulet: null, artifact: null,

        axe: null, 
        pickaxe: null,
        sickle: null,
};
character.money = 0;

const base_xp_cost = 10;
character.xp = {
        current_level: 0, total_xp: 0, current_xp: 0, xp_to_next_lvl: base_xp_cost, 
        total_xp_to_next_lvl: base_xp_cost, base_xp_cost: base_xp_cost, xp_scaling: 1.8
};
character.starting_xp = character.xp;

character.add_xp = function ({xp_to_add, use_bonus = true}) {
        if(use_bonus) {
                xp_to_add *= (character.xp_bonuses.total_multiplier.hero || 1) * (character.xp_bonuses.total_multiplier.all || 1);
        }
        character.xp.total_xp += xp_to_add;

        character.xp.current_xp += xp_to_add;//获取经验值
        //levelup
        let levelupresult = "";
        while(character.xp.current_xp >= window.REALMS[character.xp.current_level+1][4])
        {
                character.xp.current_level += 1;

                let this_realm = window.REALMS[character.xp.current_level];
                let realm_spd_gain = 0;
                if(this_realm[0]==3) realm_spd_gain = 0.1;
                if(this_realm[0]==6) realm_spd_gain = 0.15;//两个分境界的攻速提升
                //console.log(realm_spd_gain);

                character.xp.current_xp -= this_realm[4];
                //真实-提高属性
                
                character.stats.flat.level.max_health = (character.stats.flat.level.max_health || 0) + this_realm[3];
                character.stats.flat.level.health = character.stats.flat.level.max_health;
                character.stats.flat.level.agility = (character.stats.flat.level.agility || 0) + this_realm[2];
                character.stats.flat.level.defense = (character.stats.flat.level.defense || 0) + this_realm[2];
                character.stats.flat.level.attack_power = ( character.stats.flat.level.attack_power || 0) + this_realm[2]; 
                character.stats.flat.level.attack_speed = ( character.stats.flat.level.attack_speed || 0) + realm_spd_gain;
                
                let total_skill_xp_multiplier = 1.1;
                if(this_realm[0]>=3) total_skill_xp_multiplier += 0.05;
                if(this_realm[0]>=6) total_skill_xp_multiplier += 0.05;
                //升级之后技能领悟力变强，境界越高越明显
                //if(this_realm[0]>=9) total_skill_xp_multiplier += 0.05;
                character.xp_bonuses.multiplier.levels.all_skill = (character.xp_bonuses.multiplier.levels.all_skill || 1) * total_skill_xp_multiplier;

                //显示-提高属性
                let gains = "";
                gains += `攻击,防御,敏捷提高了${this_realm[2]}<br>`;
                gains += `生命上限提高了${this_realm[3]}<br>`;
                if(realm_spd_gain != 0) gains += `小阶段突破，攻击速度额外增加${realm_spd_gain}<br>`;
                
                gains += `技能经验倍率提高了${Math.round(total_skill_xp_multiplier*100-100)}%<br>`;
                gains += `生命值完全恢复了<br>`;
                
                levelupresult += `${character.name} 境界突破，达到 <b>${this_realm[1]}</b> <br>${gains}`;
        }
        //console.log(levelupresult);
        if(levelupresult != ""){
                //console.log("分支达到")
                //console.log(levelupresult);
                return levelupresult;
        }
        
                /*
                
                while(character.xp.total_xp >= character.xp.total_xp_to_next_lvl) {
                        level_after_xp += 1;
                        
                        character.xp.total_xp_to_next_lvl = Math.round(character.xp.base_xp_cost * (1 - character.xp.xp_scaling ** (level_after_xp + 1))/(1 - character.xp.xp_scaling));
                } //calculates lvl reached after adding xp

                let total_xp_to_previous_lvl = Math.round(character.xp.base_xp_cost * (1 - character.xp.xp_scaling ** level_after_xp)/(1 - character.xp.xp_scaling));
                //xp needed for current lvl, same formula but for n-1

                const gains = character.get_level_bonus(level_after_xp);

                character.xp.xp_to_next_lvl = character.xp.total_xp_to_next_lvl - total_xp_to_previous_lvl;
                character.xp.current_level = level_after_xp;
                character.xp.current_xp = character.xp.total_xp - total_xp_to_previous_lvl;		
                
                return `${character.name} is getting stronger. Reached level ${character.xp.current_level} ${gains}`;
                下面是旧的升级代码
                character.get_level_bonus = function (level) {

        let gained_hp = 0;
        let gained_atk = 0;
        let gained_def = 0;
        let gained_agi = 0;

        const gained_skill_xp_multiplier = 1.03;
        let total_skill_xp_multiplier = 1;

        for(let i = character.xp.current_level + 1; i <= level; i++) {
                gained_atk += Math.ceil(i/2);
                gained_def += Math.ceil(i/5);
                gained_agi += Math.ceil(i/3);

                gained_hp += 10 * Math.ceil(i/4);
                total_skill_xp_multiplier = total_skill_xp_multiplier * gained_skill_xp_multiplier;
        }

        character.stats.flat.level.max_health = (character.stats.flat.level.max_health || 0) + gained_hp;
        character.stats.flat.level.health = character.stats.flat.level.max_health;//full recovery
        character.stats.flat.level.agility = (character.stats.flat.level.agility || 0) + gained_agi;
        character.stats.flat.level.defense = (character.stats.flat.level.defense || 0) + gained_def;
        character.stats.flat.level.attack_power = ( character.stats.flat.level.attack_power || 0) + gained_atk; 

        character.xp_bonuses.multiplier.levels.all_skill = (character.xp_bonuses.multiplier.levels.all_skill || 1) * total_skill_xp_multiplier;

        let gains = `<br>生命上限提高了${gained_hp}`;
        if(gained_atk > 0) {
                gains += `<br>攻击提高了${gained_atk}`;
        }
        if(gained_def > 0) {
                gains += `<br>防御提高了${gained_def}`;
        }
        if(gained_agi > 0) {
                gains += `<br>敏捷提高了${gained_agi}`;
        }

        gains += `<br>技能经验倍率提高了${Math.round((gained_skill_xp_multiplier-1)*100)}%`;
        
        return gains;
}
                */
}

/**
 * gets bonuses to stats based on current level and level passed as param
 * @param {Number} level 
 * @returns stats bonuses from leveling
 */

/**
 * adds skill milestone bonuses to character stats
 * called when a new milestone is reached
 * @param {{flats, multipliers}} bonuses 
 */
character.stats.add_skill_milestone_bonus = function ({stats = {}, xp_multipliers = {}}) {
        Object.keys(stats).forEach(stat => {
                if(stats[stat].flat) {
                        character.stats.flat.skill_milestones[stat] = (character.stats.flat.skill_milestones[stat] || 0) + stats[stat].flat;
                }
                if(stats[stat].multiplier) {
                        character.stats.multiplier.skill_milestones[stat] = (character.stats.multiplier.skill_milestones[stat] || 1) * stats[stat].multiplier;
                }
        });

        if(xp_multipliers?.hero) {
                character.xp_bonuses.multiplier.skills.hero = (character.xp_bonuses.multiplier.skills.hero || 1) * xp_multipliers.hero;
        }
        if(xp_multipliers?.all) {
                character.xp_bonuses.multiplier.skills.all = (character.xp_bonuses.multiplier.skills.all || 1) * xp_multipliers.all;
        }
        if(xp_multipliers?.all_skill) {
                character.xp_bonuses.multiplier.skills.all_skill = (character.xp_bonuses.multiplier.skills.all_skill || 1) * xp_multipliers.all_skill;
        }

        Object.keys(skills).forEach(skill => {
                if(xp_multipliers[skill]) {
                        character.xp_bonuses.multiplier.skills[skill] = (character.xp_bonuses.multiplier.skills[skill] || 1) * xp_multipliers[skill];
                }
        });
}

/**
 * adds skill milestone bonuses to character stats
 * called when a new milestone is reached
 * @param {{flats, multipliers}} bonuses 
 */
character.stats.add_book_bonus = function ({multipliers = {}, xp_multipliers = {}}) {
        Object.keys(character.base_stats).forEach(stat => {
                if(multipliers[stat]) {
                        character.stats.multiplier.books[stat] = (character.stats.multiplier.books[stat] || 1) * multipliers[stat];
                }
        });
       
        if(xp_multipliers?.hero) {
                character.xp_bonuses.multiplier.skills.hero = (character.xp_bonuses.multiplier.skills.hero || 1) * xp_multipliers.hero;
        }
        if(xp_multipliers?.all) {
                character.xp_bonuses.multiplier.skills.all = (character.xp_bonuses.multiplier.skills.all || 1) * xp_multipliers.all;
        }
        if(xp_multipliers?.all_skill) {
                character.xp_bonuses.multiplier.skills.all_skill = (character.xp_bonuses.multiplier.skills.all_skill || 1) * xp_multipliers.all_skill;
        }

        Object.keys(skills).forEach(skill => {
                if(xp_multipliers[skill]) {
                        character.xp_bonuses.multiplier.skills[skill] = (character.xp_bonuses.multiplier.skills[skill] || 1) * xp_multipliers[skill];
                }
        });
}

character.stats.add_active_effect_bonus = function() {
        character.stats.flat.active_effect = {};
        character.stats.multiplier.active_effect = {};
        Object.values(active_effects).forEach(effect => {
                for(const [key, value] of Object.entries(effect.effects.stats)) {
                        if(value.flat) {
                                character.stats.flat.active_effect[key] = (character.stats.flat.active_effect[key] || 0) + value.flat;
                        }

                        if(value.multiplier) {
                                character.stats.multiplier.active_effect[key] = (character.stats.multiplier.active_effect[key] || 1) * value.multiplier;
                        }
                }
        });
}

/**
 * add all stat bonuses from equipment, including def/atk
 * called on equipment changes
 */
character.stats.add_all_equipment_bonus = function() {
        
        //reset as they will be recalculated
        character.stats.flat.equipment = {};
        character.stats.multiplier.equipment = {};

        //iterate over slots
        Object.keys(character.equipment).forEach(slot => {
                if(!character.equipment[slot]) {
                        return;
                }
                
                if(character.equipment[slot].getDefense) {
                        character.stats.flat.equipment.defense = (character.stats.flat.equipment.defense || 0) + character.equipment[slot].getDefense();
                }
                let stats = character.equipment[slot].getStats()

                //iterate over stats in slotted item
                Object.keys(stats).forEach(stat => {
                        if(stats[stat].flat) {
                                character.stats.flat.equipment[stat] = (character.stats.flat.equipment[stat] || 0) + stats[stat].flat;
                        }

                        if(stats[stat].multiplier) {
                                character.stats.multiplier.equipment[stat] = (character.stats.multiplier.equipment[stat] || 1) * stats[stat].multiplier;
                        }
                });
        });

        character.stats.add_weapon_type_bonuses();
        //add weapon speed bonus (technically a bonus related to equipment, so its in this function)
}

character.stats.add_weapon_type_bonuses = function() {
        if(character.equipment.weapon == null) {
                //没有武器 = 加成很少 Unarmed可以去死了！
                character.stats.multiplier.skills.attack_power = 1;
                character.stats.multiplier.skills.attack_speed = 1;
                character.stats.multiplier.skills.crit_rate = (skills["Unarmed"].get_coefficient());
        } else {
                character.stats.multiplier.skills.attack_speed = 1;
                character.stats.multiplier.skills.attack_power = 1;
                character.stats.multiplier.skills.crit_rate = skills[weapon_type_to_skill[character.equipment.weapon.weapon_type]].get_coefficient();
                //character.stats.multiplier.skills.attack_points = skills[weapon_type_to_skill[character.equipment.weapon.weapon_type]].get_coefficient()**0.3333;
        }
}

/**
 * add all non-milestone stat bonuses from skills
 * called in update_stats()
 * only a few skills really matter here
 */
character.stats.add_all_skill_level_bonus = function() {
        character.stats.flat.skills.defense = 2**skills["Iron skin"].get_level_bonus();
        character.stats.multiplier.skills.strength = skills["Weightlifting"].get_coefficient("multiplicative");
        character.stats.multiplier.skills.block_strength = 1 + 5*skills["Shield blocking"].get_level_bonus();
        character.stats.multiplier.skills.agility = skills["Combat"].get_coefficient("multiplicative")/*skills["Equilibrium"].get_coefficient("multiplicative")*/;
        
        character.stats.add_weapon_type_bonuses();
}

/**
 * add all stat bonuses/penalties from stances
 * called in update_stats()
 * multipliers only 
 */
character.stats.add_all_stance_bonus = function() {
        const multipliers = stances[current_stance].getStats();
        Object.keys(character.base_stats).forEach(stat => {
                if(multipliers[stat]) {
                        character.stats.multiplier.stance[stat] = multipliers[stat] || 1;
                        //replacing instead of multiplying, since these come from singular source
                } else {
                        character.stats.multiplier.stance[stat] = 1;
                }
        });
}
/**
 * only supports multiplicative penalties for now
 */
character.stats.add_location_penalties = function() {
        let effects = {};
        let light_modifier = 1;
        
        if(current_location) {
                if(!("connected_locations" in current_location)) {
                        effects = current_location.get_total_effect().hero_penalty.multipliers;
                }

                if(current_location.light_level === "dark" || current_location.light_level === "normal" && (current_game_time.hour >= 150 || current_game_time.hour <= 30)) {
                        light_modifier = 0.8 + 0.2*skills["Night vision"].current_level/skills["Night vision"].max_level;
                        character.stats.multiplier.light_level.agility = light_modifier;
                        character.stats.multiplier.light_level.attack_speed = light_modifier**0.5;
                        
                } else {
                        character.stats.multiplier.light_level.agility = 1;
                        character.stats.multiplier.light_level.attack_speed = 1;
                }
        }

        character.stats.multiplier.environment = {};
        Object.keys(effects).forEach(effect => {
                character.stats.multiplier.environment[effect] = effects[effect];
        });
}

/**
 * full stat recalculation, call whenever something changes
 */
character.update_stats = function () {
    const missing_health = Math.max((character.stats.full["max_health"] - character.stats.full["health"]), 0) || 0;   
    //to avoid fully restoring all whenever this function is called

    character.stats.add_all_skill_level_bonus();
    character.stats.add_all_stance_bonus();
    //adding weapons and armors
    //character.stats.flat.equipment.attack_power = character.stats.flat.equipment.attack_power + character.equipment.weapon.getAttack();
    //console.log(character.equipment.weapon.getAttack());
    Object.keys(character.stats.full).forEach(function(stat){
        let stat_sum = 0;
        let stat_mult = 1;
        //console.log(stat);
        if(stat === "block_chance") {
                stat_sum = base_block_chance + Math.round(skills["Shield blocking"].get_level_bonus() * 10000)/10000;
        }else {
                //just sum all flats
                Object.values(character.stats.flat).forEach(piece => {
                        stat_sum += (piece[stat] || 0);
                });
        }

        Object.values(character.stats.multiplier).forEach(piece => {
                stat_mult *= (piece[stat] || 1);
        });
        character.stats.full[stat] = (character.base_stats[stat] + stat_sum) * stat_mult;
        
        character.stats.total_flat[stat] =  character.base_stats[stat] + stat_sum;
        character.stats.total_multiplier[stat] = stat_mult || 1;

        if(stat === "health") {
                character.stats.full["health"] = Math.max(1, character.stats.full["max_health"] - missing_health);
        }
    });

     
    if(character.equipment.weapon != null) { 
        character.stats.full.attack_power += character.equipment.weapon.getAttack() * character.stats.total_multiplier.attack_power;
    } 


    
    character.stats.total_flat.attack_power = character.stats.full.attack_power/character.stats.total_multiplier.attack_power;
    Object.keys(character.xp_bonuses.total_multiplier).forEach(bonus_target => {
        character.xp_bonuses.total_multiplier[bonus_target] = (character.xp_bonuses.multiplier.levels[bonus_target] || 1) * (character.xp_bonuses.multiplier.skills[bonus_target] || 1) * (character.xp_bonuses.multiplier.books[bonus_target] || 1); 
        //only this two sources as of now

        const bonus = character.xp_bonuses.total_multiplier[bonus_target];

        if(bonus != 1){
                if (bonus_target !== "hero") {
                        if(bonus_target === "all" || bonus_target === "all_skill") {
                                update_all_displayed_skills_xp_gain();
                        } else {
                                update_displayed_skill_xp_gain(skills[bonus_target]);
                        }
                }
                if(bonus_target === "hero" || bonus_target === "all") {
                        update_displayed_xp_bonuses();
                }
        }
    });
}


character.get_attack_speed = function () {
        let spd = character.stats.full.attack_speed;
        return spd;
}

character.get_attack_power = function () {
        return character.stats.full.attack_power;
}

character.wears_armor = function () {
        if(
                (!character.equipment.head || character.equipment.head.getDefense() == 0) &&
                (!character.equipment.torso || character.equipment.torso.getDefense() == 0) &&
                (!character.equipment.arms || character.equipment.arms.getDefense() == 0) &&
                (!character.equipment.legs || character.equipment.legs.getDefense() == 0) &&
                (!character.equipment.feet || character.equipment.feet.getDefense() == 0)
        )
        {
                return false;
        } else {
                return true;
        }
}

/**
 * 
 * @param {*}
 * @returns [actual damage taken; Boolean if character should faint] 
 */
character.take_damage = function (enemy_spec = [0],{damage_value, can_faint = true, give_skill_xp = true}) {
        /*
        TODO:
                - damage types: "physical", "elemental", "ma.gic"
                - each with it's own defense on equipment (and potentially spells)
                - damage elements (for elemental damage type)
                - resistance skills
        */
        let fainted;

        let damage_taken;

        if(enemy_spec.includes(0)){
                damage_taken = Math.ceil(10*Math.max(damage_value,0))/10;//魔攻，无视防御
        }
        else{
                damage_taken = Math.ceil(10*Math.max(damage_value - character.stats.full.defense,0))/10;
                
        }

        character.stats.full.health -= damage_taken;

        if(character.stats.full.health <= 0 && can_faint) {
                fainted = true;
                character.stats.full.health = 0;
        } else {
                fainted = false;
        }

        if(give_skill_xp) {
                //TODO give xp to resistance skills when taking damge
        }

        return {damage_taken, fainted};
}

character.get_character_money = function () {
        return character.money;
}

/**
 * @param {Array} items [{item, count},...] 
 */
function add_to_character_inventory(items) {
        const was_anything_new_added = character.add_to_inventory(items);
        for(let i = 0; i < items.length; i++) {
                if(items[i].item.tags.tool && character.equipment[items[i].item.equip_slot] === null) {
                        equip_item_from_inventory(items[i].item.getInventoryKey());
                }
        }
        update_displayed_character_inventory({was_anything_new_added});
}

/**
 * Removes items from character's inventory
 * Takes an array in form of [{item_key, item_count}]
 */
function remove_from_character_inventory(items) {
        character.remove_from_inventory(items);
        update_displayed_character_inventory();
}

/**
 * @description equips passed item, doesn't do anything more with it;
 * don't call this one directly (except for when loading save data), but via equip_item_from_inventory()
 * @param: game item object
 */
function equip_item(item) {
        if(item) {
                unequip_item(item.equip_slot);
                character.equipment[item.equip_slot] = item;
        }
        update_displayed_equipment();
        update_displayed_character_inventory();
        character.stats.add_all_equipment_bonus();
        
        update_character_stats();
}

/**
 * equips item and removes it from inventory
 * @param item_key
 **/
 function equip_item_from_inventory(item_key) {
        if(item_key in character.inventory) { //check if its in inventory, just in case
            //add specific item to equipment slot
            // -> id and name tell which exactly item it is, then also check slot in item object and thats all whats needed
            equip_item(character.inventory[item_key].item);
            remove_from_character_inventory([{item_key}]);
            
            update_character_stats();
        }
}
    
function unequip_item(item_slot) {
        if(character.equipment[item_slot] != null) {
                add_to_character_inventory([{item: character.equipment[item_slot]}]);
                character.equipment[item_slot] = null;
                update_displayed_equipment();
                update_displayed_character_inventory();
                character.stats.add_all_equipment_bonus();

                update_character_stats();
        }
}

function add_location_penalties() {
        character.stats.add_location_penalties();
}

/**
 * updates character stats + their display 
 */
function update_character_stats() {
        character.stats.add_location_penalties();
        character.update_stats();

        update_displayed_stats();
        update_displayed_health();
        
}

/**
 * updates character stats related to combat, things that are more situational and/or based on other stats, kept separately from them
 */

function get_skill_xp_gain(skill_name) {
        return (character.xp_bonuses.total_multiplier.all_skill || 1) * (character.xp_bonuses.total_multiplier.all || 1) * (character.xp_bonuses.total_multiplier[skill_name] || 1);
}

function get_skills_overall_xp_gain() {
        return (character.xp_bonuses.total_multiplier.all_skill || 1) * (character.xp_bonuses.total_multiplier.all || 1)
}

function get_hero_xp_gain() {
        return (character.xp_bonuses.total_multiplier.hero || 1) * (character.xp_bonuses.total_multiplier.all || 1)
}

export {character, add_to_character_inventory, remove_from_character_inventory, equip_item_from_inventory, equip_item, 
        unequip_item, update_character_stats, get_skill_xp_gain, get_hero_xp_gain, get_skills_overall_xp_gain, add_location_penalties};

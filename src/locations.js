"use strict";

import { enemy_templates, Enemy } from "./enemies.js";
import { dialogues as dialoguesList} from "./dialogues.js";
import { skills } from "./skills.js";
import { current_game_time } from "./game_time.js";
import { activities } from "./activities.js";
import { inf_combat } from "./main.js";

import { book_stats, item_templates, Weapon, Armor, Shield } from "./items.js";
import { get_total_skill_level,add_to_character_inventory, remove_from_character_inventory } from "./character.js";
import { character } from "./character.js";
import { log_message , format_number} from "./display.js";
import { enemy_killcount } from "./enemies.js";
const locations = {};
const location_types = {};
//contains all the created locations

class Location {
    constructor({
                name, 
                id,
                description, 
                connected_locations, 
                is_unlocked = true, 
                is_finished = false,
                dialogues = [], 
                traders = [],
                types = [], //{type, xp per tick}
                sleeping = null, //{text to start, xp per tick},
                light_level = "normal",
                getDescription,
                background_noises = [],
                getBackgroundNoises,
                crafting = null,
                tags = {},
                bgm = "",
            }) {
        // always a safe zone
        this.bgm = bgm;
        this.name = name; //needs to be the same as key in locations
        this.id = id || name;
        this.description = description;
        this.getDescription = getDescription || function(){return description;}
        this.background_noises = background_noises;
        this.getBackgroundNoises = getBackgroundNoises || function(){return background_noises;}
        this.connected_locations = connected_locations; //a list
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished; //for when it's in any way or form "completed" and player shouldn't be allowed back
        this.dialogues = dialogues;
        this.traders = traders;
        this.activities = {};
        this.types = types;
        this.sleeping = sleeping;
        for (let i = 0; i < this.dialogues.length; i++) {
            if (!dialoguesList[this.dialogues[i]]) {
                throw new Error(`No such dialogue as "${this.dialogues[i]}"!`);
            }
        }
        this.light_level = light_level; //not really used for this type
        this.crafting = crafting;
        this.tags = tags;
        this.tags["Safe zone"] = true;
        /* 
        crafting: {
            is_unlocked: Boolean, 
            use_text: String, 
            tiers: {
                crafting: Number,
                forging: Number,
                smelting: Number,
                cooking: Number,
                alchemy: Number,
            }
        },
         */
    }
}

class Combat_zone {
    constructor({name, 
                id,
                 description, 
                 getDescription,
                 rank = 0,
                 is_unlocked = true, 
                 is_finished = false,
                 types = [], //{type, xp_gain}
                 enemy_groups_list = [],
                 enemies_list = [], 
                 enemy_group_size = [1,1],
                 enemy_count = 30,
                 enemy_stat_variation = 0,
                 enemy_stat_halo = 0,
                 parent_location, 
                 leave_text,
                 first_reward = {},
                 repeatable_reward = {},
                 otherUnlocks,
                 unlock_text,
                 spec_hint,
                 is_challenge = false,
                 tags = {},
                 bgm = "",
                }) {

        this.name = name;
        this.bgm = bgm,
        this.id = id || name;
        this.unlock_text = unlock_text;
        this.spec_hint = spec_hint;
        this.description = description;
        this.getDescription = getDescription || function(){return description;}
        this.otherUnlocks = otherUnlocks || function() {return;}
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished;
        this.rank = rank;
        this.types = types; //special properties of the location, e.g. "narrow" or "dark"
        this.enemy_groups_list = enemy_groups_list; //predefined enemy teams, names only
        this.enemies_list = enemies_list; //possible enemies (to be used if there's no enemy_groups_list), names only
        this.enemy_group_size = enemy_group_size; // [min, max], used only if enemy_groups_list is not provided
        if(!this.enemy_groups_list){
            if(this.enemy_group_size[0] < 1) {
                this.enemy_group_size[0] = 1;
                console.error(`Minimum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[0]} and was corrected to lowest value possible of 1`);
            }
            if(this.enemy_group_size[0] > 8) {
                this.enemy_group_size[0] = 8;
                console.error(`Minimum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[0]} and was corrected to highest value possible of 8`);
            }
            if(this.enemy_group_size[1] < 1) {
                this.enemy_group_size[1] = 1;
                console.error(`Maximum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[1]} and was corrected to lowest value possible of 1`);
            }
            if(this.enemy_group_size[1] > 8) {
                this.enemy_group_size[1] = 8;
                console.error(`Maximum enemy group size in zone "${this.name}" is set to unallowed value of ${this.enemy_group_size[1]} and was corrected to highest value possible of 8`);
            }
        }
        this.enemy_count = enemy_count; //how many enemy groups need to be killed for the clearing reward

        if(this.enemy_groups_list.length == 0 && this.enemies_list.length == 0 ) {
            throw new Error(`No enemies provided for zone "${this.name}"`);
        }

        this.enemy_groups_killed = 0; //killcount for clearing

        this.enemy_stat_variation = enemy_stat_variation; // e.g. 0.1 means each stat can go 10% up/down from base value; random for each enemy in group
        if(this.enemy_stat_variation < 0) {
            this.enemy_stat_variation = 0;
            console.error(`Stat variation for enemies in zone "${this.name}" is set to unallowed value and was corrected to a default 0`);
        }

        this.enemy_stat_halo = enemy_stat_halo;//improving

        this.parent_location = parent_location;
        if(!locations[this.parent_location.name]) {
            throw new Error(`Couldn't add parent location "${this.parent_location.name}" to zone "${this.name}"`)
        }

        this.leave_text = leave_text; //text on option to leave
        this.first_reward = first_reward; //reward for first clear
        this.repeatable_reward = repeatable_reward; //reward for each clear, including first; all unlocks should be in this, just in case

        this.is_challenge = is_challenge;
        //challenges can be completed only once 

        //skills and their xp gain on every tick, based on location types;
        this.gained_skills = this.types
            ?.map(type => {return {skill: skills[location_types[type.type].stages[type.stage || 1].related_skill], xp: type.xp_gain}})
            .filter(skill => skill.skill);
       
        const temp_types = this.types.map(type => type.type);
        if(temp_types.includes("bright")) {
            this.light_level = "bright";
        }
        else if(temp_types.includes("dark")) {
            this.light_level = "dark";
        } else {
            this.light_level = "normal";
        }

        this.tags = tags;
        this.tags["Combat zone"] = true;
    }
    get_enemy(f_halo,f_enemy){
        
            let newEnemy;
                newEnemy = new Enemy({name: f_enemy.name, 
                    description: f_enemy.description, 
                    xp_value: f_enemy.xp_value * Math.pow(f_halo,1.5),
                    spec: f_enemy.spec,
                    spec_value:f_enemy.spec_value,
                    realm: f_enemy.realm,
                    stats: {
                        health: f_enemy.stats.health * f_halo,
                        attack: f_enemy.stats.attack * f_halo,
                        agility: f_enemy.stats.agility * f_halo,
                        dexterity: f_enemy.stats.dexterity,
                        intuition: f_enemy.stats.intuition,
                        attack_speed: f_enemy.stats.attack_speed,
                        defense: f_enemy.stats.defense * f_halo
                    },
                    loot_list: f_enemy.loot_list,
                    image: f_enemy.image,
                    loot_multi: f_halo,
                    add_to_bestiary: f_enemy.add_to_bestiary,
                    size: f_enemy.size
                });
            //}
            if(newEnemy.spec.includes(19))
            {
                newEnemy.stats.attack += character.stats.full.attack_power * 0.1;
                newEnemy.stats.defense += character.stats.full.defense * 0.1;
                log_message(`${f_enemy.name} 吸取了 ${format_number(character.stats.full.attack_power * 0.1)} 攻击，${format_number(character.stats.full.defense * 0.1)}防御 [同调]`,"enemy_enhanced");
            }//同调
            if(newEnemy.spec.includes(24)){
                log_message(`${f_enemy.name} 吸取了 ${format_number(character.stats.full.attack_power * 0.5)} 生命 [饮剑]`,"enemy_enhanced");
                newEnemy.stats.health += character.stats.full.attack_power * 0.5;//饮剑
            }
            if(newEnemy.spec.includes(25)){ 
                log_message(`${f_enemy.name} 吸取了 ${format_number(character.stats.full.defense * 0.5)} 生命 [饮盾]`,"enemy_enhanced");
                newEnemy.stats.health += character.stats.full.defense * 0.5;//饮盾
            }
            if(newEnemy.spec.includes(30)){ 
                log_message(`${f_enemy.name} 吸取了 ${format_number(character.stats.full.agility * newEnemy.spec_value[30])} 攻击 [净化]`,"enemy_enhanced");
                newEnemy.stats.attack += character.stats.full.agility * newEnemy.spec_value[30];//净化
            }
            if(newEnemy.name == "地宫养殖者[BOSS]")//特判地宫养殖者
            {
                if(enemy_killcount["地宫养殖者[BOSS]"]) console.log("试图再次击杀");
                else{
                    if(character.equipment.special?.name == "纳娜米")//姐姐在！
                    {
                        log_message(`[地宫养殖者]嚯，有人闯到这里来了？`,"hero_attacked_critically");
                        log_message(`[纳娜米]我不会和你废话。说，你为什么要害我纳家！`,"enemy_defeated");
                        log_message(`[纱雪]此处省略22句关于血杀殿，地宫养殖者的广为人知的剧情。`,"sayuki");
                        log_message(`[纳娜米]既然如此，时间也差不多了……可可！`,"enemy_defeated");
                        log_message(`少女手上突然出现了一把奇异的武器。武器一米见长，前端有着深黑色的空洞。通体的质感，带来的威慑力令人窒息。`,"enemy_enhanced");
                        log_message(`几乎零点一秒之内，纳娜米手中的武器，绽放出耀眼的银白色光芒。只听轰隆一声巨响，整座地宫都似乎为之震颤！`,"enemy_enhanced");
                        log_message(`遭到反震力冲击的纳娜米吐出鲜血。反应过来的纳可，第一时间抱住了姐姐，一同抵挡着这武器带来的惊人的后坐力。`,"enemy_enhanced");
                        log_message(`[纳可]没事吧，姐姐——`,"enemy_defeated");
                        log_message(`[纳娜米]咳……还没有结束，可可。接下来，就交给你了！`,"enemy_defeated");
                        log_message(`正面被武器击中的地宫养殖者，几乎瞬间失去了半边身体，发出了怨毒的咆哮声。`,"enemy_enhanced");
                        log_message(`[地宫养殖者]啊，什么东西，不可能！！该死，中计了，我要杀了你，杀了你们，杀光你们燕岗领的人——`,"hero_attacked_critically");
                        log_message(`[纳娜米]可可，不要大意！这是天空级强者的回光返照，只要撑过这一会就足够了！`,"enemy_enhanced");
                        log_message(`[纳可]明白！`,"enemy_defeated");
                        //sleep(1000);
                        newEnemy.stats.attack *= 0.01;
                        newEnemy.stats.defense *= 0.01;
                        newEnemy.stats.agility *= 0.01;
                        newEnemy.stats.health *= 0.01;
                        log_message(`地宫养殖者已经奄奄一息！攻防敏血削弱为之前的百分之一！`,"enemy_enhanced");
                    }
                    else
                    {
                        log_message(`[地宫养殖者]嚯，有人闯到这里来了？`,"hero_attacked_critically");
                        log_message(`[???]...`,"enemy_defeated");
                        log_message(`[纱雪]高能反应！检测到纳娜米未在队伍中！`,"sayuki");
                        log_message(`地宫养殖者现在活力满满！攻防敏血都保持着之前的状态！`,"enemy_enhanced");
                    
                    }
                }
            }
            newEnemy.is_alive = true;
        return newEnemy;
    }

    get_next_enemies() {

        const enemies = [];
        let enemy_group = [];

        if(this.enemy_groups_list.length > 0) { // PREDEFINED GROUPS EXIST

            const index = Math.floor(Math.random() * this.enemy_groups_list.length);
            enemy_group = this.enemy_groups_list[index]; //names

        } else {  // PREDEFINED GROUPS DON'T EXIST

            const group_size =  + Math.floor(this.enemy_group_size[0] + Math.random() * (this.enemy_group_size[1] - this.enemy_group_size[0]));
            for(let i = 0; i < group_size; i++) {
                enemy_group.push(this.enemies_list[Math.floor(Math.random() * this.enemies_list.length)]);
            }
        }
 
        for(let i = 0; i < enemy_group.length; i++) {
            const enemy = enemy_templates[enemy_group[i]];
            if(enemy.name == undefined){
                console.error("试图在 " + this.name + " 中生成未定义的敌人 [" + enemy_group[i].name + "]");
            }
            // if(this.enemy_stat_variation != 0) {

            //     const variation = Math.random() * this.enemy_stat_variation;
            //     const halo = this.enemy_stat_halo;
            //     const base = 1 + variation + halo;
            //     const vary = 2 * variation;
            //     newEnemy = new Enemy({
            //                             name: enemy.name, 
            //                             description: enemy.description, 
            //                             xp_value: enemy.xp_value,
            //                             spec: enemy.spec,
            //                             stats: {
            //                                 health: Math.round(enemy.stats.health * (base - Math.random() * vary)),
            //                                 attack: Math.round(enemy.stats.attack * (base - Math.random() * vary)),
            //                                 agility: Math.round(enemy.stats.agility * (base - Math.random() * vary)),
            //                                 dexterity: Math.round(enemy.stats.dexterity * (base - Math.random() * vary)),
            //                                 intuition: Math.round(enemy.stats.intuition * (base - Math.random() * vary)),
            //                                 attack_speed: Math.round(enemy.stats.attack_speed * (base - Math.random() * vary) * 100) / 100,
            //                                 defense: Math.round(enemy.stats.defense * (base - Math.random() * vary))
            //                             },
            //                             loot_list: enemy.loot_list,
            //                             image: enemy.image,
            //                             add_to_bestiary: enemy.add_to_bestiary,
            //                             size: enemy.size,
            //                         });

            // } else {
            let halo_fix = 0;
            if(enemy.name == "秘境心火精灵[BOSS]")//特判秘境心火
            {
                const key_id = item_templates["微花残片"].getInventoryKey();
                let key_cnt = character.inventory[key_id]?character.inventory[key_id].count:0;
                key_cnt = Math.min(key_cnt,5);
                if(key_cnt != 0)
                {
                    log_message(`由于持有 ${key_cnt} 个微花残片，光环削弱：140% -> ${140-key_cnt*8}%！`,"enemy_enhanced");
                    halo_fix -= 0.08*key_cnt;
                }
            }
            else if(this.name == "结界湖 - X"){
                const key_id = item_templates["微花残片"].getInventoryKey();
                let key_cnt = character.inventory[key_id]?character.inventory[key_id].count:0;
                key_cnt = Math.min(key_cnt,4);
                if(key_cnt != 0)
                {
                    log_message(`由于持有 ${key_cnt} 个微花残片，光环削弱：132% -> ${132-key_cnt*8}%！`,"enemy_enhanced");
                    halo_fix -= 0.08*key_cnt;
                }
            }
            else if(this.name == "纳家秘境 - ∞"){
                halo_fix = (inf_combat.A6.cur - 6) * 0.08;
            }
                
            const halo = this.enemy_stat_halo + 1 + halo_fix;

            enemies.push(this.get_enemy(halo,enemy)); 
            if(enemy.spec.includes(41)) {
                log_message(`召唤了 3x 紫锈胎人`,"enemy_enhanced");
                enemies.push(this.get_enemy(halo,enemy_templates["紫锈胎人"])); 
                enemies.push(this.get_enemy(halo,enemy_templates["紫锈胎人"])); 
                enemies.push(this.get_enemy(halo,enemy_templates["紫锈胎人"])); 
            }//召唤
        }
        return enemies;
    }

    //calculates total penalty with and without hero skills
    //launches on every combat action
    get_total_effect() {
        const effects = {multipliers: {}};
        const hero_effects = {multipliers: {}};
        
        //iterate over types of location
        for(let i = 0; i < this.types.length; i++) {
            const type = location_types[this.types[i].type].stages[this.types[i].stage];

            if(!type.related_skill || !type.effects) { 
                continue; 
            }

            //iterate over effects each type has 
            //(ok there's really just only 3 that make sense: attack points, evasion points, strength, though maybe also attack speed? mainly the first 2 anyway)
            Object.keys(type.effects.multipliers).forEach((effect) => { 

                effects.multipliers[effect] = (effects.multipliers[effect] || 1) * type.effects.multipliers[effect];
                
                hero_effects.multipliers[effect] = (hero_effects.multipliers[effect] || 1) * get_location_type_penalty(this.types[i].type, this.types[i].stage, effect);
            })
        }

        

        return {base_penalty: effects, hero_penalty: hero_effects};
    }
}

class Challenge_zone extends Combat_zone {
    constructor({name, 
        description, 
        getDescription,
        is_unlocked = true, 
        types = [], //{type, xp_gain}
        enemy_groups_list = [],
        enemies_list = [], 
        enemy_group_size = [1,1],
        enemy_count = 30,
        parent_location, 
        leave_text,
        first_reward = {},
        repeatable_reward = {},
        otherUnlocks,
        is_finished,
        enemy_stat_halo,
        unlock_text,
        spec_hint,
       }) 
    {
        super(
            {   
                name, 
                description, 
                getDescription, 
                is_unlocked, 
                types, 
                enemy_groups_list, 
                enemies_list, 
                enemy_group_size, 
                enemy_count, 
                enemy_stat_variation: 0, 
                enemy_stat_halo,
                parent_location,
                leave_text,
                first_reward,
                repeatable_reward,
                is_challenge: true,
                otherUnlocks,
                is_finished,
                unlock_text,
                spec_hint,
            }
        )
    }
}

class LocationActivity{
    constructor({activity_name, 
                 starting_text, 
                 get_payment = ()=>{return 1},
                 is_unlocked = true, 
                 working_period = 60,
                 infinite = false,
                 availability_time,
                 spec = "",
                 skill_xp_per_tick = 1,
                 unlock_text,
                 gained_resources,
                 require_tool = true,
                 exp_scaling = false,
                 scaling_id = "",
                 done_actions = 0,
                 exp_o = 1.6,
                 }) 
    {
        this.activity_name = activity_name; //name of activity from activities.js
        this.starting_text = starting_text; //text displayed on button to start action

        this.get_payment = get_payment;
        this.is_unlocked = is_unlocked;
        this.spec = spec;
        this.unlock_text = unlock_text;
        this.exp_scaling = exp_scaling;
        this.scaling_id = scaling_id;
        this.done_actions = done_actions;
        this.exp_o = exp_o;
        this.working_period = working_period; //if exists -> time that needs to be worked to earn anything; only for jobs
        this.infinite = infinite; //if true -> can be done 24/7, otherwise requires availability time
        if(this.infinite && availability_time) {
            console.error("Activity is set to be available all the time, so availability_time value will be ignored!");
        }
        if(!this.infinite && !availability_time) {
            throw new Error("LocationActivities that are not infinitely available, require a specified time of availability!");
        }
        this.availability_time = availability_time; //if not infinite -> hours between which it's available
        
        this.skill_xp_per_tick = skill_xp_per_tick; //skill xp gained per game tick (default -> 1 in-game minute)

        this.require_tool = require_tool; //if false, can be started without tool equipped

        this.gained_resources = gained_resources; 
        //{scales_with_skill: boolean, resource: [{name, ammount: [[min,max], [min,max]], chance: [min,max]}], time_period: [min,max], skill_required: [min_efficiency, max_efficiency]}
        //every 2-value array is oriented [starting_value, value_with_required_skill_level], except for subarrays of ammount (which are for randomizing gained item count) and for skill_required
        //                                                                                   (ammount array itself follows the mentioned orientation)
        //value start scaling after reaching min_efficiency skill lvl, before that they are just all at min
        //skill required refers to level of every skill
        //if scales_with_skill is false, scalings will be ignored and first value will be used
        }

    getActivityEfficiency = function() {
        let skill_modifier = 1;
        if(this.gained_resources.scales_with_skill){
            let skill_level_sum = 0;
            for(let i = 0; i < activities[this.activity_name].base_skills_names?.length; i++) {
                let S_max = this.gained_resources.skill_required[1];
                let S_min = this.gained_resources.skill_required[0];
                let S_id = activities[this.activity_name].base_skills_names[i];
                skill_level_sum += Math.min(
                    S_max-S_min, Math.max(0,get_total_skill_level(S_id)-S_min)
                )/(S_max-S_min);
                
            }
            skill_modifier = (skill_level_sum/activities[this.activity_name].base_skills_names?.length) ?? 1;
        }let fixed_timemul = 1.0;
        if(this.exp_scaling)
        {
            fixed_timemul = Math.pow(this.exp_o,this.done_actions);
        }
        const gathering_time_needed = Math.floor(fixed_timemul * this.gained_resources.time_period[0]*(this.gained_resources.time_period[1]/this.gained_resources.time_period[0])**skill_modifier);
        
        const gained_resources = [];

        for(let i = 0; i < this.gained_resources.resources.length; i++) {

            const chance = this.gained_resources.resources[i].chance[0]*(this.gained_resources.resources[i].chance[1]/this.gained_resources.resources[i].chance[0])**skill_modifier;
            const min = Math.round(this.gained_resources.resources[i].ammount[0][0]*(this.gained_resources.resources[i].ammount[1][0]/this.gained_resources.resources[i].ammount[0][0])**skill_modifier);
            const max = Math.round(this.gained_resources.resources[i].ammount[0][1]*(this.gained_resources.resources[i].ammount[1][1]/this.gained_resources.resources[i].ammount[0][1])**skill_modifier);
            gained_resources.push({name: this.gained_resources.resources[i].name, count: [min,max], chance: chance});
        }

        return {gathering_time_needed, gained_resources};
    }
}

class LocationAction {
    constructor({
        action_text,
        success_text,
        failure_text,
        requirements = {},
        rewards = {},
        attempt_duration = 0,
        attempt_text = "",
        success_chance = 1,
        is_unlocked = true,
    }) {
        this.action_text = action_text;
        this.failure_text = failure_text; //text displayed on failure
        this.success_text = success_text; //text displayed on success
                                          //if action is supposed to be "impossible" for narrative purposes, just make it finish without unlocks and with text that says it failed
        this.requirements = requirements; //things needed to succeed {stats, items, money} 
        this.rewards = rewards; //mostly unlocks: {} but could be some other things
        this.completed = false;
        this.attempt_duration = attempt_duration; //0 means instantaneous, otherwise there's a progress bar
        this.attempt_text = attempt_text; //action text while attempting, useless if duration is 0
        this.success_chance = success_chance; //chance to succeed; to guarantee that multiple attempts will be needed, just make a few consecutive actions with same text
        this.is_unlocked = is_unlocked;
        this.is_finished = false;
    }

    /**
     * @returns {Boolean}
     */
    are_conditions_met() {

    }
}

class LocationType{
    constructor({name, related_skill, stages = {}}) {
        this.name = name;

        if(related_skill) {
            if(!skills[related_skill]) {
                throw new Error(`No such skill as "${related_skill}"`);
            }
            else { 
                this.related_skill = related_skill; //one per each; skill xp defined in location/combat_zone
            }
        }
        this.stages = stages; //up to 3
        /* 
        >number<: {
            description,
            related_skill,
            effects
        }

        */
    }
}

function get_location_type_penalty(type, stage, stat) {
    
    const skill = skills[location_types[type].stages[stage].related_skill];

    const base = location_types[type].stages[stage].effects.multipliers[stat];

    return base**(1- skill.current_level/skill.max_level);
}

//create location types
(function(){
    
    location_types["bright"] = new LocationType({
        name: "bright",
        stages: {
            1: {
                description: "A place that's always lit, no matter the time of the day",
            },
            2: {
                description: "An extremely bright place, excessive light makes it hard to keep eyes open",
                related_skill: "Dazzle resistance",
                effects: {
                    multipliers: {
                    }
                }
            },
            3: {
                description: "A place with so much light that an average person would go blind in an instant",
                related_skill: "Dazzle resistance",
                effects: {
                    multipliers: {
                    }
                }
            }
        }
    });
    location_types["dark"] = new LocationType({
        name: "dark",
        stages: {
            1: {
                description: "一个永远和清朗夜晚一般昏暗的地方",
                related_skill: "Night vision",
                //no effects here, since in this case they are provided via the overall "night" penalty
            },
            2: {
                description: "一个十分黑暗的地方，比大多暗夜更暗",
                related_skill: "Night vision",
                effects: {
                    multipliers: {
                        agility: 0.5,
                        attack_speed : 0.8
                        //they dont need to be drastic since they apply on top of 'night' penalty
                    }
                }
            },
            3: {
                description: "纯粹的黑暗，连一丝闪光都没有",
                related_skill: "Presence sensing",
                effects: {
                    multipliers: {
                        agility: 0.1,
                        attack_speed : 0.5
                    }
                }
            }
        }
    });
    
    location_types["stress"] = new LocationType({
        name: "stress",
        stages: {
            1: {
                description: "四周弥漫着稀薄的威压，对攻击的效力和速度产生些许影响",
                related_skill: "Resistance",
                effects: {
                    multipliers: {
                        attack_speed: 0.9,
                        attack_mul : 0.8
                    }
                }
            },
            2: {
                description: "四周弥漫着浓厚的威压，对攻击的效力和速度产生较大影响",
                related_skill: "Resistance",
                effects: {
                    multipliers: {
                        attack_speed: 0.75,
                        attack_mul : 0.5,
                    }
                }
            },
        }
    });
    location_types["narrow"] = new LocationType({
        name: "narrow",
        stages: {
            1: {
                description: "A very narrow and tight area where there's not much place for maneuvering",
                related_skill: "Tight maneuvers",
                effects: {
                    multipliers: {
                                }
                        }
                }
            }
    });
    location_types["open"] = new LocationType({
        name: "open",
        stages: {
            1: {
                description: "A completely open area where attacks can come from any direction",
                related_skill: "Spatial awareness",
                effects: {
                    multipliers: {
                    }
                }
            },
            2: {
                description: "An area that's completely open and simultanously obstructs your view, making it hard to predict where an attack will come from",
                related_skill: "Spatial awareness",
                effects: {
                    multipliers: {
                    }
                }
            }
        }
    });
    location_types["hot"] = new LocationType({
        name: "hot",
        stages: {
            1: {
                description: "High temperature makes it hard to breath",
                related_skill: "Heat resistance",
                effects: {
                    multipliers: {
                    }
                }
            },
            2: {
                description: "It's so hot that just being here is painful",
                related_skill: "Heat resistance",
                effects: {
                    multipliers: {
                    }
                }
            },
            3: {
                description: "Temperature so high that wood ignites by itself",
                related_skill: "Heat resistance",
                //TODO: environmental damage if resistance is too low
                effects: {
                    multipliers: {
                    }
                }
            }
        }
    });
    location_types["cold"] = new LocationType({
        name: "cold",
        stages: {
            1: {
                description: "Cold makes your energy seep out...",
                related_skill: "Cold resistance",
                effects: {
                    multipliers: {
                    }
                }
            },
            2: {
                description: "So cold...",
                related_skill: "Cold resistance",
                effects: {
                    multipliers: {
                    }
                }
            },
            3: {
                description: "This place is so cold, lesser beings would freeze in less than a minute...",
                related_skill: "Cold resistance",
                //TODO: environmental damage if resistance is too low (to both hp and s.t.a.m.i.n.a?)
                effects: {
                    multipliers: {
                    }
                }
            }
        }
    });
})();

//create locations and zones
(function(){ 
    locations["Village"] = new Location({ 
        connected_locations: [], 
        getDescription: function() {
            if(locations["Infested field"].enemy_groups_killed >= 5 * locations["Infested field"].enemy_count) { 
                return "Medium-sized village, built next to a small river at the foot of the mountains. It's surrounded by many fields, a few of them infested by huge rats, which, while an annoyance, don't seem possible to fully eradicate. Other than that, there's nothing interesting around";
            }
            else if(locations["Infested field"].enemy_groups_killed >= 2 * locations["Infested field"].enemy_count) {
                return "Medium-sized village, built next to a small river at the foot of the mountains. It's surrounded by many fields, many of them infested by huge rats. Other than that, there's nothing interesting around";
            } else {
                return "Medium-sized village, built next to a small river at the foot of the mountains. It's surrounded by many fields, most of them infested by huge rats. Other than that, there's nothing interesting around"; 
            }
        },
        getBackgroundNoises: function() {
            let noises = ["*You hear some rustling*"];
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push("Anyone seen my cow?", "Mooooo!", "Tomorrow I'm gonna fix the roof", "Look, a bird!");

                if(locations["Infested field"].enemy_groups_killed <= 3) {
                    noises.push("These nasty rats almost ate my cat!");
                }
            }

            if(current_game_time.hour > 3 && current_game_time.hour < 10) {
                noises.push("♫♫ Heigh ho, heigh ho, it's off to work I go~ ♫♫", "Cock-a-doodle-doo!");
            } else if(current_game_time.hour > 18 && current_game_time.hour < 22) {
                noises.push("♫♫ Heigh ho, heigh ho, it's home from work I go~ ♫♫");
            } 

            return noises;
        },
        dialogues: ["village elder", "village guard", "old craftsman"],
        traders: ["village trader"],
        name: "Village", 
        crafting: {
            is_unlocked: true, 
            use_text: "Try to craft something", 
            tiers: {
                crafting: 1,
                forging: 1,
                smelting: 1,
                cooking: 1,
                alchemy: 1,
            }
        },
    });

    locations["Shack"] = new Location({
        connected_locations: [{location: locations["Village"], custom_text: "Go outside"}],
        description: "This small shack was the only spare building in the village. It's surprisingly tidy.",
        name: "Shack",
        is_unlocked: false,
        sleeping: {
            text: "Take a nap",
            xp: 1},
    })

    locations["Village"].connected_locations.push({location: locations["Shack"]});
    //remember to always add it like that, otherwise travel will be possible only in one direction and location might not even be reachable

    //NekoRPG noncombat locations below
    locations["纳家大厅"] = new Location({ 
        bgm: 1,
        connected_locations:[],
        
        description: "一处明亮整洁的大厅，纳可平时活动的地方。",
        traders: ["自动售货机"],
        dialogues: ["猫妖"],
        name: "纳家大厅", 
    });//1-1
    locations["练兵场深处"] = new Location({ 
        connected_locations: [{location: locations["纳家大厅"], custom_text: "返回大厅"}], 
        description: "练兵场深处的一间小木屋",
        
        bgm: 1,
        
        is_unlocked: false,
        unlock_text: "前面的路似乎无人值守...会不会这里就是前往外界的通道呢？",
        name: "练兵场深处", 
    });



    locations["Village"].connected_locations.push({location: locations["纳家大厅"]});

    locations["纳可的房间"] = new Location({
        connected_locations: [{location: locations["纳家大厅"], custom_text: "前往大厅"}],
        description: "温馨的小房间，里面摆着一张粉色小床和一张练习用的工作台。",
        name: "纳可的房间",
        is_unlocked: true,
        bgm: 1,
        sleeping: {
            text: "睡一会",
            xp: 1},
            crafting: {
                is_unlocked: true, 
                use_text: "前往工作台", 
                tiers: {
                    crafting: 0,
                    forging: 0,
                    smelting: 0,
                    cooking: 0,
                    alchemy: 0,
                }
            },
        
    })
    
    locations["纳家大厅"].connected_locations.push({location: locations["纳可的房间"]});

    locations["Infested field"] = new Combat_zone({
        description: "Field infested with wolf rats. You can see the grain stalks move as these creatures scurry around.", 
        enemy_count: 15, 
        enemies_list: ["Starving wolf rat", "Wolf rat"],
        types: [{type: "open", stage: 1, xp_gain: 1}],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "Infested field", 
        parent_location: locations["Village"],
        first_reward: {
            xp: 10,
        },
        repeatable_reward: {
            textlines: [
                {dialogue: "village elder", lines: ["cleared field"]},
            ],
            xp: 5,
        }
    });

    
    locations["Village"].connected_locations.push({location: locations["Infested field"]});

    //NekoRPG conbat locations below

    locations["纳家练兵场 - 1"] = new Combat_zone({
        description: "纳家给小辈练武的场所。有幼小的魔物用于对战",  //MT1
        enemy_count: 20, 
        enemies_list: ["毛茸茸","武装毛茸茸","红毛茸茸"],
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "纳家练兵场 - 1", 
        parent_location: locations["纳家大厅"],
        first_reward: {
            xp: 8,
        },
        repeatable_reward: {
            xp: 4,
            
            locations: [{location: "纳家练兵场 - 2"}],
            //解锁地点必须在可重复奖励
        },
        rank:1,
        bgm:1,
        
        unlock_text: "要救姐姐，必须先提升自己的实力！先去练兵场与魔物对战吧。",
    });

    locations["纳家练兵场 - 2"] = new Combat_zone({
        description: "练兵场的稍深处。有幼小的魔物用于对战", //MT2
        enemy_count: 20, 
        enemies_list: ["红毛茸茸","小飞蛾","骸骨","武装红毛茸茸","少年法师"],
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "纳家练兵场 - 2", 
        parent_location: locations["纳家大厅"],
        first_reward: {
            xp: 12,
        },
        repeatable_reward: {
            xp: 6,
            
            locations: [{location: "纳家练兵场 - 3"}],
        },
        
        rank:2,
        bgm:1,
        unlock_text: "还不够...不要为了击败最弱的魔物沾沾自喜啊，路还很长！",
    });

    locations["纳家练兵场 - 3"] = new Combat_zone({
        description: "练兵场的深处。有成长期魔物用于对战", //MT3
        enemy_count: 20, 
        enemies_list: ["骸骨","微尘级野兽","废弃傀儡","黑毛茸茸"],
        
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "纳家练兵场 - 3", 
        parent_location: locations["纳家大厅"],
        first_reward: {
            xp: 16,
        },
        repeatable_reward: {
            xp: 2,
            
            locations: [{location: "练兵场深处"}],
        },
        rank:3,
        bgm:1,
    });

    locations["纳家练兵场 - 4"] = new Combat_zone({
        description: "练兵场中的黑暗小道。成长期魔物的实力上了一个台阶", //MT4
        enemy_count: 20, 
        enemies_list: ["黑毛茸茸","荧光飞蛾","橙毛茸茸","大飞蛾","聚灵骸骨"],
        types: [{type: "dark", stage: 1, xp_gain: 1}],
        enemy_stat_variation: 0.1,
        is_unlocked: true, 
        name: "纳家练兵场 - 4", 
        
        rank:4,
        bgm:1,
        parent_location: locations["练兵场深处"],
        first_reward: {
            xp: 20,
        },
        repeatable_reward: {
            xp: 3,
            
            locations: [{location: "纳家练兵场 - 5"}],
        }
    });

    locations["纳家练兵场 - 5"] = new Combat_zone({
        description: "练兵场中黑暗的通道，亮度已经影响到了战斗", //MT5~6
        enemy_count: 20, 
        enemies_list: ["聚灵骸骨","血洛游卒","石精","弱小意念","聚魂骸骨"],
        types: [{type: "dark", stage: 1, xp_gain: 2}],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "纳家练兵场 - 5", 
        
        rank:5,
        bgm:1,
        parent_location: locations["练兵场深处"],
        first_reward: {
            xp: 30,
        },
        repeatable_reward: {
            xp: 5,
            
            locations: [{location: "纳家练兵场 - 6"}],
        },
        unlock_text: "好黑..好可怕..或许应该打造一些盔甲，防护自己了。",
    });
    locations["纳家练兵场 - 6"] = new Combat_zone({
        description: "黑暗的通道，尽头处似乎传来点点光亮？", //MT7~8
        enemy_count: 20, 
        enemies_list: ["弱小意念","聚魂骸骨","青年法师","武装橙毛茸茸","万物级凶兽","习武孩童"],
        types: [{type: "dark", stage: 1, xp_gain: 2}],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "纳家练兵场 - 6", 
        
        rank:6,
        bgm:1,
        parent_location: locations["练兵场深处"],
        first_reward: {
            xp: 40,
        },
        repeatable_reward: {
            xp: 7,
            
            locations: [{location: "纳家练兵场 - 7"}],
        },
        unlock_text: "小孩都能混进来了，说明这里肯定是正确的道路哇！好耶！",
    });
    locations["纳家练兵场 - 7"] = new Combat_zone({
        description: "尽管不再黑暗，却遍布魔物的侧门附近", //MT9~10
        enemy_count: 20, 
        enemies_list: ["试炼木偶","聚魂骸骨","荧光飞蛾","出芽茸茸","万物级凶兽","习武孩童"],
        enemy_group_size: [2,2],
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        
        rank:7,
        bgm:1,
        name: "纳家练兵场 - 7", 
        parent_location: locations["练兵场深处"],
        first_reward: {
            xp: 50,
        },
        repeatable_reward: {
            xp: 10,
            locations: [{location: "纳家练兵场 - X"}],
        },
        unlock_text: "附近有许多可疑的门！不过想要检查它们的话，必须先击败眼前成群结对的敌人..",
    });
    
    locations["纳家练兵场 - X"] = new Challenge_zone({
        description: "一扇厚重的门前。看起来想出去必须把待从打晕过去...",
        enemy_count: 1, 
        bgm:1,
        enemies_list: ["纳家待从[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "纳家练兵场 - X", 
        leave_text: "听话离去",
        parent_location: locations["练兵场深处"],
        repeatable_reward: {
            //textlines: [{dialogue: "猫妖", lines: ["MT10_clear"]}],
            locations: [{location: "燕岗城"}],
        },
        unlock_text: "请留步，小姐。<br>这里禁止大地级之下的子弟随意出入。"
    });

    
    
    locations["纳家大厅"].connected_locations.push({location: locations["练兵场深处"]}); 

    locations["纳家大厅"].connected_locations.push({location: locations["纳家练兵场 - 1"]});
    locations["纳家大厅"].connected_locations.push({location: locations["纳家练兵场 - 2"]});
    locations["纳家大厅"].connected_locations.push({location: locations["纳家练兵场 - 3"]});
    locations["练兵场深处"].connected_locations.push({location: locations["纳家练兵场 - 4"]});
    locations["练兵场深处"].connected_locations.push({location: locations["纳家练兵场 - 5"]});
    locations["练兵场深处"].connected_locations.push({location: locations["纳家练兵场 - 6"]});
    locations["练兵场深处"].connected_locations.push({location: locations["纳家练兵场 - 7"]});
    locations["练兵场深处"].connected_locations.push({location: locations["纳家练兵场 - X"], custom_text: "前往挑战门边的待从"});



    
    locations["燕岗城"] = new Location({ 
        connected_locations: [{location: locations["练兵场深处"], custom_text: "回到纳家"}], 
        description: "熙熙攘攘的燕岗城外城。尽管是崇尚力量的世界，市民间仍然有讲不完的话题。",
        
        bgm: 2,
        dialogues: ["秘法石碑 - 1","路人甲"],
        traders: ["燕岗杂货铺"],
        is_unlocked: false,
        unlock_text: "无论见到多少次，城市的繁华仍然令人侧目。但现在，尽快出城才是最重要的！",
        name: "燕岗城", 
    });//1-2
    locations["练兵场深处"].connected_locations.push({location: locations["燕岗城"]});

    locations["燕岗城 - 1"] = new Combat_zone({
        description: "燕岗城14环的普通街道。", //MT11-12
        enemy_count: 20, 
        enemies_list: ["试炼木偶","纳家待从","出芽红茸茸","轻型傀儡","万物级异兽"],
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: true, 
        name: "燕岗城 - 1",
        
        rank:11, 
        bgm:2,
        parent_location: locations["燕岗城"],
        first_reward: {
            xp: 75,
        },
        repeatable_reward: {
            xp: 18,
            locations: [{location: "燕岗城 - 2"}],
        },
    });

    locations["燕岗城 - 2"] = new Combat_zone({
        description: "燕岗城15环的普通街道。", //MT13-14
        enemy_count: 20, 
        enemies_list: ["出芽红茸茸","轻型傀儡","万物级异兽","高速傀儡","黄毛茸茸","纳家塑像"],
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_variation: 0.1,
        
        rank:12,
        bgm:2,
        is_unlocked: false, 
        name: "燕岗城 - 2", 
        parent_location: locations["燕岗城"],
        first_reward: {
            xp: 90,
        },
        repeatable_reward: {
            xp: 24,
            locations: [{location: "燕岗城 - 3"},{location: "燕岗城 - 秘法石碑"}],
        },
    });

    locations["燕岗城 - 秘法石碑"] = new Challenge_zone({
        description: "燕岗城主“石风雄”刻录的石碑，记载了基础的血洛秘法。",
        enemy_count: 1, 
        enemies_list: ["百家小卒[BOSS]"],
        enemy_group_size: [2,2],
        bgm:2,
        is_unlocked: false, 
        is_challenge: true,
        name: "燕岗城 - 秘法石碑", 
        leave_text: "暂时退避",
        parent_location: locations["燕岗城"],
        repeatable_reward: {
            //此处应有战斗姿态
            textlines: [{dialogue: "秘法石碑 - 1", lines: ["Power", "Speed"]}],
        },
        unlock_text: "哪来的小丫头？想参悟这里的秘法，先过了我们这关！"
    });

    locations["燕岗城 - 3"] = new Combat_zone({
        description: "燕岗城16环的普通街道。", //MT15-16
        enemy_count: 20, 
        enemies_list: ["高速傀儡","黄毛茸茸","纳家塑像","出芽橙茸茸","森林野蝠","血洛喽啰"],
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_variation: 0.1,
        
        rank: 13,
        bgm:2,
        is_unlocked: false, 
        name: "燕岗城 - 3", 
        parent_location: locations["燕岗城"],
        first_reward: {
            xp: 110,
        },
        repeatable_reward: {
            xp: 28,
            textlines: [{dialogue: "路人甲", lines: ["shop"]}],
            locations: [{location: "燕岗城 - 4"}],
        },
    });

    locations["燕岗城 - 4"] = new Combat_zone({
        description: "燕岗城17环的普通街道。", //MT17-18
        enemy_count: 20, 
        enemies_list: ["森林野蝠","血洛喽啰","百家小卒","下位佣兵","地龙荒兽","毒虫"],
        enemy_group_size: [1,2],
        types: [],
        enemy_stat_variation: 0.1,
        
        rank: 14,
        bgm:2,
        is_unlocked: false, 
        name: "燕岗城 - 4", 
        parent_location: locations["燕岗城"],
        first_reward: {
            xp: 130,
        },
        repeatable_reward: {
            xp: 32,
            locations: [{location: "燕岗城 - 5"}],
        },
        unlock_text: "从这里已经可以隐隐约约看见城门了..燕岗城共有18环，再往外就是城郊。"
    });
    
    locations["燕岗城 - 5"] = new Combat_zone({
        description: "燕岗城最外环的环城街道。", //MT17-18
        enemy_count: 20, 
        enemies_list: ["下位佣兵","地龙荒兽","毒虫","精壮青年","法师学徒","生灵骸骨"],
        enemy_group_size: [2,3],
        types: [],
        enemy_stat_variation: 0.1,
        
        rank: 15,
        bgm:2,
        is_unlocked: false, 
        name: "燕岗城 - 5", 
        parent_location: locations["燕岗城"],
        first_reward: {
            xp: 150,
        },
        repeatable_reward: {
            xp: 40,
            locations: [{location: "燕岗城 - X"}],
        },
    });

    
    locations["燕岗城 - X"] = new Challenge_zone({
        description: "燕岗城的城门，只要击败拦路的石精即可出门！",
        enemy_count: 1, 
        bgm:2,
        enemies_list: ["腐蚀质石精[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "燕岗城 - X", 
        leave_text: "暂时返回",
        parent_location: locations["燕岗城"],
        repeatable_reward: {
            locations: [{location: "燕岗近郊"}],
        },
        unlock_text: "终于到城门脚下了...<br>这成精的花岗岩是什么啊！只能先击败它了。"
    });

    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - 1"]});
    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - 2"]});
    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - 秘法石碑"]});
    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - 3"]});
    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - 4"]});
    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - 5"]});
    locations["燕岗城"].connected_locations.push({location: locations["燕岗城 - X"], custom_text: "与城门下的石精战斗"});


    
    locations["燕岗近郊"] = new Location({ 
        connected_locations: [{location: locations["燕岗城"], custom_text: "回城"}], 
        description: "燕岗城外的区域。鸟语花香，绿树成荫，却潜藏着大量潮汐级魔物。",
        
        bgm: 3,
        is_unlocked: false,
        dialogues: ["百兰"],
        unlock_text: "终于出城了！现在，找个人问问一些情报吧。",//先触发百兰剧情再解锁1-3-1！
        name: "燕岗近郊", 
    });//1-3
    
    locations["燕岗城"].connected_locations.push({location: locations["燕岗近郊"]});


    locations["燕岗近郊 - 0"] = new Challenge_zone({
        description: "城门外不远处。看起来是时候给看不起人的大叔一点教训了！",//MT22
        enemy_count: 1, 
        enemies_list: ["百兰[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "燕岗近郊 - 0", 
        leave_text: "暂时返回",
        parent_location: locations["燕岗近郊"],
        repeatable_reward: {
            textlines: [{dialogue: "百兰", lines: ["defeat"]}],
        },
        bgm:3,
        unlock_text: "我说大叔，这么大年纪了欺负一个女孩子，不太好吧。看来需要一点教训呢。"
    });
    locations["燕岗近郊 - 1"] = new Combat_zone({
        description: "沿着藏宝图向前，必经之路上的魔物区域", //MT23-24
        enemy_count: 20, 
        enemies_list: ["生灵骸骨","腐蚀质石精","绿毛茸茸","切叶虫茧","荒野蜂","花灵液"],
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "燕岗近郊 - 1",
        
        rank:21, 
        bgm:3,
        parent_location: locations["燕岗近郊"],
        first_reward: {
            xp: 200,
        },
        repeatable_reward: {
            xp: 50,
            locations: [{location: "燕岗近郊 - 2"},{location:"郊区河流"}],
        },
    });
    locations["燕岗近郊 - 2"] = new Combat_zone({
        description: "沿着藏宝图向前，埋伏着不怀好意修士的区域", //MT25-26
        enemy_count: 20, 
        enemies_list: ["荒野蜂","花灵液","燕岗领从者","野生幽灵","司雍世界修士"],//荒兽尼尔在原作中就不存在
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_variation: 0.1,
        is_unlocked: false, 
        name: "燕岗近郊 - 2",
        
        rank:22, 
        bgm:3,
        parent_location: locations["燕岗近郊"],
        first_reward: {
            xp: 220,
        },
        repeatable_reward: {
            xp: 54,
            locations: [{location: "燕岗近郊 - 3"},{location:"燕岗矿井"}],
            //activities: [{location:"燕岗矿井", activity:"miningP_copper"}],
        },
    });
    locations["燕岗近郊 - 3"] = new Combat_zone({
        description: "沿着藏宝图向前，存在大量荒兽的区域", //MT27-28
        enemy_count: 20, 
        enemies_list: ["荒兽尼尔","司雍世界修士","潮汐级荒兽","掠原蝠","黑夜傀儡"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "燕岗近郊 - 3",
        
        rank:23, 
        bgm:3,
        parent_location: locations["燕岗近郊"],
        first_reward: {
            xp: 240,
        },
        repeatable_reward: {
            xp: 60,
            locations: [{location: "燕岗近郊 - 4"}],
        },
    });
    locations["燕岗近郊 - 4"] = new Combat_zone({
        description: "存在光环荒兽的区域，荒兽的整体实力被影响着上了一个台阶", //MT29-30
        enemy_count: 20, 
        enemies_list: ["掠原蝠","黑夜傀儡","来一口","绿原行者","初生鬼","灵蔓茸茸"],//16-18三只怪放在-5
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_halo: 0.1,
        is_unlocked: false, 
        name: "燕岗近郊 - 4",
        
        rank:24, 
        bgm:3,
        parent_location: locations["燕岗近郊"],
        first_reward: {
            xp: 300,
        },
        repeatable_reward: {
            xp: 80,
            locations: [{location: "燕岗近郊 - 5"}],
        },
    });
    locations["燕岗近郊 - 5"] = new Combat_zone({
        description: "更接近光环来源的区域，吸引来了大地级强者", //MT31-32
        enemy_count: 20, 
        enemies_list: ["绿原行者","初生鬼","燕岗领佣兵","冷冻火","缠绕骸骨","灵蔓茸茸"],//16-18三只怪放在-5
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_halo: 0.1,
        is_unlocked: false, 
        name: "燕岗近郊 - 5",
        
        rank:25, 
        bgm:3,
        parent_location: locations["燕岗近郊"],
        first_reward: {
            xp: 360,
        },
        repeatable_reward: {
            xp: 100,
            locations: [{location: "燕岗近郊 - 6"}],
        },
    });

    locations["燕岗近郊 - 6"] = new Combat_zone({
        description: "地宫浮现在地平线上，触手可及。不过，附近的怪物已经愈加狂暴了。", //MT33-34
        enemy_count: 20, 
        enemies_list: ["绿原行者","初生鬼","燕岗领佣兵","冷冻火","缠绕骸骨","灵蔓茸茸"],
        enemy_group_size: [1,1],
        types: [],
        enemy_stat_halo: 0.2,
        is_unlocked: false, 
        name: "燕岗近郊 - 6",
        
        rank:26, 
        bgm:3,
        parent_location: locations["燕岗近郊"],
        first_reward: {
            xp: 420,
        },
        repeatable_reward: {
            xp: 120,
            locations: [{location: "燕岗近郊 - X"}],
        },
        unlock_text: "眼前的建筑物，应该就是藏宝地了吧。前面有人，这身装束是燕岗领的佣兵？"
        
    });

    
    locations["燕岗近郊 - X"] = new Challenge_zone({
        description: "地宫的门口，狂暴气息的来源。部分着魔的佣兵滞留在此处。",
        enemy_count: 1, 
        enemies_list: ["燕岗领佣兵[BOSS]"],
        enemy_group_size: [2,2],
        is_unlocked: false, 
        is_challenge: true,
        name: "燕岗近郊 - X", 
        bgm:3,
        leave_text: "暂时返回",
        parent_location: locations["燕岗近郊"],
        repeatable_reward: {
            locations: [{location: "地宫入口"}],
        },
        unlock_text: "不对劲，这些人看向我的时候，眼神怎么这么疯狂？难道是中了邪术吗？"
    });

    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 0"], custom_text: "与百兰战斗"});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 1"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 2"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 3"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 4"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 5"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - 6"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗近郊 - X"], custom_text: "强行进入地宫"});
    
    
    
    locations["郊区河流"] = new Location({ 
        connected_locations: [{location: locations["燕岗近郊"], custom_text: "回到藏宝图的路线上"}], 
        description: "敞亮的小河，可以用于练习游泳技术！",
        
        bgm: 3,
        is_unlocked: false,
        name: "郊区河流", 
    });
    locations["燕岗矿井"] = new Location({ 
        connected_locations: [{location: locations["燕岗近郊"], custom_text: "回到藏宝图的路线上"}], 
        description: "围绕着矿井的修者聚集地，内有比练习用工作台略好的工作台，简单的休息室，地下还有部分残余的A1级金属！",
        traders: ["矿井集市"],
        
        bgm: 3,
        is_unlocked: false,
        sleeping: {
            text: "闭好门窗，睡一会",
            xp: 2
        },
        crafting: {
           is_unlocked: true, 
            use_text: "使用共享工作台[Tier+2]", 
            tiers: {
                   crafting: 2,
                forging: 2,
                smelting: 2,
                cooking: 2,
                alchemy: 2,
            }
            },
        name: "燕岗矿井", 
    });
    locations["燕岗近郊"].connected_locations.push({location: locations["郊区河流"]});
    locations["燕岗近郊"].connected_locations.push({location: locations["燕岗矿井"]});
    

    
    locations["地宫入口"] = new Location({ 
        connected_locations: [{location: locations["燕岗近郊"], custom_text: "离开地宫"}], 
        description: "地宫的入口处。宝石的气息浓郁，但有大地级三阶的敌人把守。",
        
        dialogues: ["地宫老人"],
        is_unlocked: false,
        //此处应有一个boss战和一个偷宝石的法子(10颗高级蓝宝石)
        name: "地宫入口", 
        bgm: 4,
        unlock_text: "好可怕的气息，刚进门就是这么可怕的怪物！"
    });//1-4pre
    locations["地宫 - 看门人"] = new Challenge_zone({
        description: "你确定要和它战斗吗..挨打变强现在可是削弱了哦！",
        enemy_count: 4, 
        enemies_list: ["地宫看门人[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: true, 
        is_challenge: true,
        name: "地宫 - 看门人", 
        bgm:4,
        leave_text: "离开这个是非之地",
        parent_location: locations["地宫入口"],
        repeatable_reward: {},

        //unlock_text: "不对劲，这些人看向我的时候，眼神怎么这么疯狂？难道是中了邪术吗？"
    });
    locations["地宫浅层"] = new Location({ 
        connected_locations: [{location: locations["地宫入口"], custom_text: "回到入口处"}], 
        description: "地宫的浅层。盘踞着大量荒兽，也潜藏着许多宝藏。",
        traders: ["金属批发商"],
        
        is_unlocked: true,
        name: "地宫浅层", 
        bgm: 4,
    });//1-4
    
    locations["燕岗近郊"].connected_locations.push({location: locations["地宫入口"]});
    locations["地宫入口"].connected_locations.push({location: locations["地宫浅层"]});
    locations["地宫入口"].connected_locations.push({location: locations["地宫 - 看门人"], custom_text: "与大地级三阶敌人抢夺宝石"});
    locations["地宫 - 1"] = new Combat_zone({
        description: "遍地都是大地级强者的空旷“藏宝地”。", 
        enemy_count: 20, 
        enemies_list: ["夜行幽灵","石风家族剑士","能量络合球","地宫妖偶","金衣除草者"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: true, 
        name: "地宫 - 1",
        
        rank:31, 
        bgm:4,
        parent_location: locations["地宫浅层"],
        first_reward: {
            xp: 480,
        },
        repeatable_reward: {
            xp: 160,
            locations: [{location: "地宫 - 2"}],
        },
    });
    locations["地宫 - 2"] = new Combat_zone({
        description: "充满荒兽与狂暴的人类的地宫区域，其中的人类似乎已经变成了杀戮机器。", 
        enemy_count: 20, 
        enemies_list: ["短视蝠","金衣除草者","阴暗茸茸","地宫妖偶","地宫虫卒"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "地宫 - 2",
        
        rank:32, 
        bgm:4,
        parent_location: locations["地宫浅层"],
        first_reward: {
            xp: 540,
        },
        repeatable_reward: {
            xp: 180,
            locations: [{location: "地宫 - 3"}],
            traders: [{traders:"金属批发商"}],
        },
        unlock_text: "回去呼叫家族的人吗？恐怕要耽误太多的时间，姐姐也会有危险。不，现在不是想这些的时候。"
    });
    locations["地宫 - 3"] = new Combat_zone({
        description: "危机四伏的地宫区域。对了，地宫金属正在打折出售！", 
        enemy_count: 20, 
        enemies_list: ["地宫虫卒","短视蝠","地刺","布菇妖","腾风塑像"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "地宫 - 3",
        
        rank:33, 
        bgm:4,
        parent_location: locations["地宫浅层"],
        first_reward: {
            xp: 600,
        },
        repeatable_reward: {
            xp: 200,
            locations: [{location: "地宫 - 4"},{location: "地宫 - 石壁"}],
        },
        unlock_text: "有强者说过……机缘永远是自己争取到的。想要静坐着，等着它砸到头上并不现实。"
    });
    locations["地宫 - 4"] = new Combat_zone({
        description: "荒兽组成的海洋，在石壁上可以发现找到修炼用的功法。", 
        enemy_count: 20, 
        enemies_list: ["地刺","探险者亡魂","布菇妖","腾风塑像","出芽黄茸茸","大地级卫戍"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "地宫 - 4",
        
        rank:34, 
        bgm:4,
        parent_location: locations["地宫浅层"],
        first_reward: {
            xp: 720,
        },
        repeatable_reward: {
            xp: 240,
            locations: [{location: "地宫 - X"}],
        },
        
        unlock_text: "石壁上镌刻着一些字样。看起来好像是一种修炼的功法。"
    });
    
    locations["地宫 - X"] = new Challenge_zone({
        description: "地宫的15层，荒兽海的终点。继续往下的路被深邃之影堵住了。",
        enemy_count: 1, 
        enemies_list: ["深邃之影[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "地宫 - X", 
        bgm:4,
        leave_text: "暂时返回",
        parent_location: locations["地宫浅层"],
        repeatable_reward: {
            locations: [{location: "地宫深层"}],
        },
        unlock_text: "大地级二阶，而且很明显，不是刚突破的那一种。是这些荒兽的头目吗？"
    });
    
    locations["地宫 - 石壁"] = new Challenge_zone({
        description: "地宫13层刻录着修炼功法的石壁。不过，只有清理荒兽才有时间参悟它们。",
        enemy_count: 1, 
        enemies_list: ["行走树妖[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "地宫 - 石壁", 
        bgm:4,
        leave_text: "暂时返回",
        parent_location: locations["地宫浅层"],
        repeatable_reward: {
        },
    });

    locations["地宫浅层"].connected_locations.push({location: locations["地宫 - 1"]});
    locations["地宫浅层"].connected_locations.push({location: locations["地宫 - 2"]});
    locations["地宫浅层"].connected_locations.push({location: locations["地宫 - 3"]});
    locations["地宫浅层"].connected_locations.push({location: locations["地宫 - 4"]});
    locations["地宫浅层"].connected_locations.push({location: locations["地宫 - 石壁"], custom_text: "清理石壁周围的二阶荒兽"});
    locations["地宫浅层"].connected_locations.push({location: locations["地宫 - X"], custom_text: "与荒兽头目交战"});
    
    
    
    locations["地宫深层"] = new Location({ 
        connected_locations: [{location: locations["地宫浅层"], custom_text: "回到浅层处"}], 
        description: "荒兽海之后的区域。纳娜米被困在此处。",
        
        is_unlocked: false,
        name: "地宫深层", 
        dialogues: ["纳娜米"],
        bgm: 5,
        unlock_text: "好阴森的气息。这里不像是一个强者留下的遗迹，因为强者在创造遗迹时，一般都会留下引导。"
    });//1-5
    locations["地宫核心 - 1"] = new Combat_zone({
        description: "杂乱不堪的廊道，刺鼻的腥味。环境比地宫浅层更恶劣一层。", 
        enemy_count: 20, 
        enemies_list: ["行走树妖","深邃之影","抽丝鬼","燕岗堕落狩士","二极蝠"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: true, 
        name: "地宫核心 - 1",
        
        rank:41, 
        bgm:5,
        parent_location: locations["地宫深层"],
        first_reward: {
            xp: 1200,
        },
        repeatable_reward: {
            xp: 400,
            locations: [{location: "地宫核心 - 2"},{location:"地宫核心 - 悬空平台"}],
        }, 
    });
    locations["地宫核心 - 2"] = new Combat_zone({
        description: "地宫的更深处，远处似乎有青紫二色的光幕浮现。", 
        enemy_count: 20, 
        enemies_list: ["二极蝠","武装绿毛茸茸","二阶荒兽","地下岩火","初级魔法师","颂歌符文"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "地宫核心 - 2",
        
        rank:42, 
        bgm:5,
        parent_location: locations["地宫深层"],
        first_reward: {
            xp: 1500,
        },
        repeatable_reward: {
            xp: 500,
            locations: [{location: "地宫核心 - 3"}],
        },
    });
    locations["地宫核心 - 3"] = new Combat_zone({
        description: "靠近青紫二色光幕的区域，前方存在一些悬空平台。", 
        enemy_count: 20, 
        enemies_list: ["二阶荒兽","地下岩火","初级魔法师","地宫执法者","地宫看门人","凶戾骨将"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "地宫核心 - 3",
        
        rank:43, 
        bgm:5,
        parent_location: locations["地宫深层"],
        first_reward: {
            xp: 1800,
        },
        repeatable_reward: {
            xp: 600,
            locations: [{location: "地宫核心 - 4"},{location:"地宫核心 - 光幕"}],
        },
    });
    locations["地宫核心 - 4"] = new Combat_zone({
        description: "悬空平台之后的深处区域。这里的荒兽已经普遍达到大地级三阶。", 
        enemy_count: 20, 
        enemies_list: ["地宫执法者","地宫看门人","凶戾骨将","巨型蜘蛛","出芽绿茸茸","地穴飞鸟"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "地宫核心 - 4",
        
        rank:44, 
        bgm:5,
        parent_location: locations["地宫深层"],
        first_reward: {
            xp: 2100,
        },
        repeatable_reward: {
            xp: 700,
            locations: [{location: "地宫核心 - 5"}],
        },
    });
    locations["地宫核心 - 5"] = new Combat_zone({
        description: "荒兽已经拥挤到成双成对的深处区域。暴戾气息的源头已经不远了...", 
        enemy_count: 20, 
        enemies_list: ["出芽绿茸茸","地穴飞鸟","小势力探险者","踏地荒兽","扭曲菇菇","喵咕哩"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "地宫核心 - 5",
        
        rank:45, 
        bgm:5,
        parent_location: locations["地宫深层"],
        first_reward: {
            xp: 2400,
        },
        repeatable_reward: {
            xp: 800,
            locations: [{location: "地宫核心 - 6"}],
        },
    });
    locations["地宫核心 - 6"] = new Combat_zone({
        description: "就是它！三阶荒兽海的彼岸，一切的罪魁祸首...", 
        enemy_count: 20, 
        enemies_list: ["踏地荒兽","扭曲菇菇","喵咕哩","温热飞蛾","苍白之触","燕岗城守卫"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "地宫核心 - 6",
        
        rank:46, 
        bgm:5,
        parent_location: locations["地宫深层"],
        first_reward: {
            xp: 3000,
        },
        repeatable_reward: {
            xp: 1000,
            locations: [{location: "地宫核心 - X"}],
        },
    });
    
    locations["地宫核心 - 悬空平台"] = new Challenge_zone({
        description: "熊熊岩火的背后藏着一颗极品黄宝石。它虽然极其凶猛，但生命力如风中残烛，一触即灭。",
        enemy_count: 2, 
        enemies_list: ["地下岩火[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "地宫核心 - 悬空平台", 
        bgm:5,
        leave_text: "退避三舍",
        parent_location: locations["地宫深层"],
        repeatable_reward: {        },
        unlock_text: "[纳可]一定要拿到它。诶嘿，肯定很值钱的，不知道能卖到多少钱呢……[纳娜米]明明一个红色刀币都卖不到吧！",
    });
    locations["地宫核心 - 光幕"] = new Challenge_zone({
        description: "绿紫二色光幕近在眼前。直觉告诉纳可，这样的地方后面一定藏着好东西。",
        enemy_count: 2, 
        enemies_list: ["喵咕哩[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "地宫核心 - 光幕", 
        bgm:5,
        leave_text: "回去练练再来挑战",
        parent_location: locations["地宫深层"],
        repeatable_reward: {locations: [{location: "光幕空间"}]},
        //unlock_text: "[纳可]一定要拿到它。诶嘿，肯定很值钱的，不知道能卖到多少钱呢……[纳娜米]明明一个红色刀币都卖不到吧！",
    });
    
    locations["光幕空间"] = new Location({ 
        connected_locations: [{location: locations["地宫深层"], custom_text: "回到地宫的荒兽海中"}], 
        description: "青紫光幕背后的安全区域。光幕本身有“炼化”能力，也可以用作工作台来使用。",
        //traders: ["矿井集市"],
        
        bgm: 5,
        is_unlocked: false,
        sleeping: {
            text: "就地休整",
            xp: 4
        },
        crafting: {
           is_unlocked: true, 
            use_text: "使用光幕加工物品[Tier+4]", 
            tiers: {
                   crafting: 4,
                forging: 4,
                smelting: 4,
                cooking: 4,
                alchemy: 4,
            }
            },
        name: "光幕空间", 
    });


    locations["地宫核心 - X"] = new Challenge_zone({
        description: "地宫的最深处。【地宫养殖者】就在这间地下35层石室的正中央。",
        enemy_count: 1, 
        enemies_list: ["地宫养殖者[BOSS]"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        is_challenge: true,
        name: "地宫核心 - X", 
        enemy_stat_halo: 0.2,
        bgm:5,
        leave_text: "迅速逃离",
        parent_location: locations["地宫深层"],
        repeatable_reward: {
            locations: [{location: "荒兽森林营地"}],
        },
        unlock_text: "[纳娜米] 还有可怕强者的气息。可可，待会我们可能需要面对无法战胜的对手。在我拿出底牌之前，一定不要轻举妄动。"
    });

    locations["地宫浅层"].connected_locations.push({location: locations["地宫深层"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 1"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 2"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 3"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 4"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 5"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 6"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 悬空平台"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - 光幕"]});
    locations["地宫深层"].connected_locations.push({location: locations["光幕空间"]});
    locations["地宫深层"].connected_locations.push({location: locations["地宫核心 - X"], custom_text: "向地宫养殖者发起挑战"});

    
    
    locations["荒兽森林营地"] = new Location({ 
        connected_locations: [{location: locations["地宫深层"], custom_text: "回到地宫"},{location: locations["纳可的房间"], custom_text: "快速旅行 - 第一幕"}], 
        description: "从地宫离开之后，纳可下一个历练地点的安全区。",
        
        is_unlocked: false,
        name: "荒兽森林营地", 
        dialogues: ["纳布"],
        traders: ["营地商铺"],
        bgm: 6,
        //unlock_text: "好阴森的气息。这里不像是一个强者留下的遗迹，因为强者在创造遗迹时，一般都会留下引导。"
    });//2-1安全区
    locations["地宫深层"].connected_locations.push({location: locations["荒兽森林营地"]});
    locations["纳可的房间"].connected_locations.push({location: locations["荒兽森林营地"],custom_text:"快速旅行 - 第二幕"});

    locations["荒兽森林"] = new Location({ 
        connected_locations: [{location: locations["荒兽森林营地"], custom_text: "回到营地"}], 
        description: "荒兽森林的内部。茂密的树木挡住了大部分阳光，黑暗中潜伏着许多荒兽。",
        
        name: "荒兽森林", 
        is_unlocked: false,
        bgm: 6,
        //unlock_text: "好阴森的气息。这里不像是一个强者留下的遗迹，因为强者在创造遗迹时，一般都会留下引导。"
    });//2-1
    locations["荒兽森林营地"].connected_locations.push({location: locations["荒兽森林"]});


    locations["荒兽森林 - 1"] = new Combat_zone({
        description: "荒兽横行的森林区域，也有许多前来历练的大地级修者。", 
        enemy_count: 20, 
        enemies_list: ["灵能菇菇","妖灵飞蛾","飞叶级魔法师","血洛箭手"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: true, 
        name: "荒兽森林 - 1",
        
        rank:101, 
        bgm:6,
        parent_location: locations["荒兽森林"],
        first_reward: {
            xp: 3600,
        },
        repeatable_reward: {
            xp: 1200,
            locations: [{location: "荒兽森林 - 2"}],
        },
    });
    locations["荒兽森林 - 2"] = new Combat_zone({
        description: "荒兽横行的森林区域，出现了一些从宝物尽失的地宫迁徙来的荒兽。", 
        enemy_count: 20, 
        enemies_list: ["血洛箭手","有角一族","噬血术傀儡","司雍世界行者","密林大鸟","地龙幼崽"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "荒兽森林 - 2",
        
        rank:102, 
        bgm:6,
        parent_location: locations["荒兽森林"],
        first_reward: {
            xp: 4200,
        },
        repeatable_reward: {
            xp: 1400,
            locations: [{location: "荒兽森林 - 3"}],
            activities: [{location:"荒兽森林营地", activity: "woodcutting100"}],
        },
    });
    locations["荒兽森林 - 3"] = new Combat_zone({
        description: "荒兽横行的森林区域，出现了一些拥有强大恢复能力的荒兽。", 
        enemy_count: 20, 
        enemies_list: ["地龙幼崽","人立茸茸","草木蜘蛛","持盾荒兽","芊叶蝠","深林妖偶"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "荒兽森林 - 3",
        
        rank:103, 
        bgm:6,
        parent_location: locations["荒兽森林"],
        first_reward: {
            xp: 4800,
        },
        repeatable_reward: {
            xp: 1600,
            locations: [{location: "荒兽森林 - 4"}],
        },
        unlock_text: "解锁了 荒兽森林 - 3.除此之外，营地的柳树砍伐也已解锁。",
    });
    locations["荒兽森林 - 4"] = new Combat_zone({
        description: "荒兽横行的森林区域，出现了一些抵达大地级五阶的荒兽和人类。", 
        enemy_count: 20, 
        enemies_list: ["深林妖偶","银杖茸茸","小门派执事","哥布林战士","刺猬精","毒枭蝎"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "荒兽森林 - 4",
        
        rank:104, 
        bgm:6,
        parent_location: locations["荒兽森林"],
        first_reward: {
            xp: 6000,
        },
        repeatable_reward: {
            xp: 2000,
            locations: [{location: "荒兽森林 - X"}],
        },
    });
    locations["荒兽森林 - X"] = new Challenge_zone({
        description: "与百家近卫的战斗。击败他们后即可逃遁。", 
        enemy_count: 2, 
        enemies_list: ["百家近卫[BOSS]"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "荒兽森林 - X",
        bgm:6,
        parent_location: locations["荒兽森林"],
        repeatable_reward: {
            locations: [{location: "荒兽森林 - XL"},{location: "清野江畔"}],
        },
        unlock_text: "[纳可]你说得对，但是你哥哥连大地级都没到，你是怎么修炼到大地级七阶的呀？",
    });
    locations["荒兽森林 - XL"] = new Challenge_zone({
        description: "与百方的战斗。可以稍后再回来击败他！。", 
        enemy_count: 1, 
        enemies_list: ["百方[荒兽森林 ver.][BOSS]"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "荒兽森林 - XL",
        bgm:6,
        parent_location: locations["荒兽森林"],
        repeatable_reward: {
        },
        unlock_text: "[百方]跑了？这下不好办了。再想下手，可没有那么好的机会了啊。",
    });

    
    locations["荒兽森林"].connected_locations.push({location: locations["荒兽森林 - 1"]});
    locations["荒兽森林"].connected_locations.push({location: locations["荒兽森林 - 2"]});
    locations["荒兽森林"].connected_locations.push({location: locations["荒兽森林 - 3"]});
    locations["荒兽森林"].connected_locations.push({location: locations["荒兽森林 - 4"]});
    locations["荒兽森林"].connected_locations.push({location: locations["荒兽森林 - X"], custom_text: "与百家近卫战斗"});
    locations["荒兽森林"].connected_locations.push({location: locations["荒兽森林 - XL"], custom_text: "与百方战斗"});

    locations["清野江畔"] = new Location({ 
        connected_locations: [{location: locations["荒兽森林营地"], custom_text: "走小路，回到营地"}], 
        description: "顺着这条江往回走就可以回到家族..快点和父亲大人汇报此事！",
        
        traders: ["行脚商人"],
        dialogues: ["清野瀑布","纳布(江畔)"],
        name: "清野江畔", 
        is_unlocked: false,
        bgm: 7,
        //unlock_text: "好阴森的气息。这里不像是一个强者留下的遗迹，因为强者在创造遗迹时，一般都会留下引导。"
    });//2-2
    locations["清野江畔 - 1"] = new Combat_zone({
        description: "沿着清野江，回家的路。百方仍然在此区域有所布置。", 
        enemy_count: 20, 
        enemies_list: ["小门派执事","毒枭蝎","百家近卫","怨灵船夫","旱魃龟","复苏骸骨"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: true, 
        name: "清野江畔 - 1",
        
        rank:111, 
        bgm:7,
        parent_location: locations["清野江畔"],
        first_reward: {
            xp: 9600,
        },
        repeatable_reward: {
            xp: 3200,
            locations: [{location: "清野江畔 - 2"},{location: "清野江畔 - 歧路"}],
        },
    });
    locations["清野江畔 - 2"] = new Combat_zone({
        description: "沿着清野江，回家的路。荒兽成群——为了避开百方，这种程度的危险区域是必要的。", 
        enemy_count: 20, 
        enemies_list: ["旱魃龟","复苏骸骨","旅行魔术师","水溶茸茸","飞龙幼崽","鲜红八爪鱼"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        name: "清野江畔 - 2",
        
        rank:112, 
        enemy_stat_halo: 0.05,
        bgm:7,
        parent_location: locations["清野江畔"],
        first_reward: {
            xp: 14400,
        },
        repeatable_reward: {
            xp: 4800,
            locations: [{location: "清野江畔 - 3"},{location: "清野江畔 - 瀑布"}],
        },
    });
    locations["清野江畔 - 3"] = new Combat_zone({
        description: "沿着清野江，回家的路。不仅荒兽成群，还有微妙的狂暴气息的区域。", 
        enemy_count: 20, 
        enemies_list: ["水溶茸茸","飞龙幼崽","鲜红八爪鱼","商船水手","深水恐怖","清野江盗匪"],
        enemy_group_size: [1.5,2.5],
        types: [],
        is_unlocked: false, 
        name: "清野江畔 - 3",
        
        rank:113, 
        bgm:7,
        enemy_stat_halo: 0.1,
        parent_location: locations["清野江畔"],
        first_reward: {
            xp: 19200,
        },
        repeatable_reward: {
            xp: 6400,
            locations: [{location: "清野江畔 - 4"}],
            traders: [{traders:"行脚商人"}],
        },
    });
    locations["清野江畔 - 4"] = new Combat_zone({
        description: "沿着清野江，回家的路。荒兽实力有了巨大的跃升，但家族已经不再遥远，无需恋战。", 
        enemy_count: 20, 
        enemies_list: ["马里奥菇菇","极冰火","清野江窃贼","礁石灵","火烧云","行脚商人"],
        enemy_group_size: [1.5,2.5],
        types: [],
        is_unlocked: false, 
        name: "清野江畔 - 4",
        
        rank:114, 
        bgm:7,
        parent_location: locations["清野江畔"],
        first_reward: {
            xp: 24000,
        },
        repeatable_reward: {
            xp: 8000,
            locations: [{location: "清野江畔 - X"}],
        },
    });
    
    locations["清野江畔 - 歧路"] = new Challenge_zone({
        description: "偶遇七阶武士，拼尽全力无法战胜...以后不要忘了这个飞啊(x", 
        enemy_count: 1, 
        enemies_list: ["威武武士[BOSS]"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "清野江畔 - 歧路",
        bgm:7,
        parent_location: locations["清野江畔"],
        repeatable_reward: {
        },
    });
    locations["清野江畔 - 瀑布"] = new Challenge_zone({
        description: "纳可小时候曾经来过的瀑布附近。其中似乎蕴含着某种领悟。", 
        enemy_count: 1, 
        enemies_list: ["礁石灵[BOSS]"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "清野江畔 - 瀑布",
        bgm:7,
        parent_location: locations["清野江畔"],
        repeatable_reward: {
            textlines: [{dialogue: "清野瀑布", lines: ["wf1"]}],
        },
    });
    locations["清野江畔 - X"] = new Challenge_zone({
        description: "父亲大人就在不远处。只要击败了这只杂役，就安全了！", 
        enemy_count: 1, 
        enemies_list: ["大门派杂役[BOSS]"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "清野江畔 - X",
        bgm:7,
        parent_location: locations["清野江畔"],
        repeatable_reward: {
            textlines: [{dialogue: "纳布(江畔)", lines: ["jp1"]}],
        },
    });
    locations["荒兽森林"].connected_locations.push({location: locations["清野江畔"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - 1"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - 2"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - 3"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - 4"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - 歧路"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - 瀑布"]});
    locations["清野江畔"].connected_locations.push({location: locations["清野江畔 - X"], custom_text: "与挡路的大门派杂役战斗"});


    
    locations["纳家秘境"] = new Location({ 
        connected_locations: [{location: locations["清野江畔"], custom_text: "回到江畔区域历练"}], 
        description: "纳家打造的历练秘境。包含进阶工作台，休息区，和一处储存室。",
        
        traders: ["物品存储箱"],
        sleeping: {
            text: "调息，冥想[+100XP/s]",
            xp: 10
        },
        crafting: {
           is_unlocked: true, 
            use_text: "使用进阶工作台[Tier+6]", 
            tiers: {
                crafting: 6,
                forging: 6,
                smelting: 6,
                cooking: 6,
                alchemy: 6,
            }
            },
        name: "纳家秘境", 
        is_unlocked: false,
        bgm: 8,
        //unlock_text: "好阴森的气息。这里不像是一个强者留下的遗迹，因为强者在创造遗迹时，一般都会留下引导。"
    });//2-3
    
    locations["纳家秘境 - 战斗区"] = new Location({ 
        connected_locations: [{location: locations["纳家秘境"], custom_text: "回到休息区修整"}], 
        description: "纳家打造的历练秘境。共有五层，每层都有更多更强的荒兽与魔物，同时光环效果更强。",
        
        dialogues: ["秘境心火精灵"],
        name: "纳家秘境 - 战斗区", 
        types: [],
        is_unlocked: true,
        bgm: 8,
        
    });
    
    locations["纳家秘境 - 1"] = new Combat_zone({
        description: "纳家打造的历练秘境。这是最外围的区域。", 
        enemy_count: 20, 
        enemies_list: ["极冰火","清野江窃贼","火烧云","马里奥菇菇","大门派杂役"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: true, 
        is_challenge: false,
        name: "纳家秘境 - 1",
        enemy_stat_halo: 0.08,
        rank:121, 
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        first_reward: {
            xp: 3e4,
        },
        repeatable_reward: {
            xp: 1e4,
            locations: [{location: "纳家秘境 - 2"}],
        },
    });
    locations["纳家秘境 - 2"] = new Combat_zone({
        description: "纳家打造的历练秘境。这是较外围的区域。", 
        enemy_count: 20, 
        enemies_list: ["火烧云","行脚商人","大门派杂役","高歌骸骨","燕岗高等散修"],
        enemy_group_size: [1.5,2.5],
        types: [],
        is_unlocked: false, 
        name: "纳家秘境 - 2",
        enemy_stat_halo: 0.16,
        rank:122, 
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        first_reward: {
            xp: 6e4,
        },
        repeatable_reward: {
            xp: 2e4,
            locations: [{location: "纳家秘境 - 3"}],
        },
    });
    locations["纳家秘境 - 3"] = new Combat_zone({
        description: "纳家打造的历练秘境。这是介于内外之间的区域。", 
        enemy_count: 20, 
        enemies_list: ["大门派杂役","高歌骸骨","燕岗高等散修","微花灵阵","灵慧石人"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "纳家秘境 - 3",
        enemy_stat_halo: 0.24,
        rank:123, 
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        first_reward: {
            xp: 9e4,
        },
        repeatable_reward: {
            xp: 3e4,
            locations: [{location: "纳家秘境 - 4"}],
        },
    });
    locations["纳家秘境 - 4"] = new Combat_zone({
        description: "纳家打造的历练秘境。这是较为靠近核心的区域。", 
        enemy_count: 20, 
        enemies_list: ["燕岗高等散修","微花灵阵","灵慧石人","纳家探宝者","秘境蝎龙"],
        enemy_group_size: [2.5,3.5],
        types: [],
        is_unlocked: false, 
        name: "纳家秘境 - 4",
        enemy_stat_halo: 0.32,
        rank:124, 
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        first_reward: {
            xp: 12e4,
        },
        repeatable_reward: {
            xp: 4e4,
            locations: [{location: "纳家秘境 - 5"}],
        },
    });
    locations["纳家秘境 - 5"] = new Combat_zone({
        description: "纳家打造的历练秘境。这是核心区域。", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","灵慧石人","纳家探宝者","秘境蝎龙","荒兽法兵","巨人先锋"],
        enemy_group_size: [3,3],
        types: [],
        is_unlocked: false, 
        name: "纳家秘境 - 5",
        enemy_stat_halo: 0.40,
        rank:125, 
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        first_reward: {
            xp: 15e4,
        },
        repeatable_reward: {
            xp: 5e4,
            locations: [{location: "纳家秘境 - X"}],
            activities: [{location:"纳家秘境", activity:"microflower"}],
        },
    });
    
    locations["纳家秘境 - ∞"] = new Combat_zone({
        description: "纳家打造的历练秘境最核心的区域。灵阵强度可以自由调节。(楼层手册更新可能不及时,属性请以心火精灵为准)", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","灵慧石人","纳家探宝者","秘境蝎龙","荒兽法兵","巨人先锋"],
        enemy_group_size: [6,6],
        types: [],
        is_unlocked: false, 
        name: "纳家秘境 - ∞",
        enemy_stat_halo: 0.48,
        rank:126, 
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        first_reward: {
        },
        repeatable_reward: {
        },
    });
    
    locations["纳家秘境 - X"] = new Challenge_zone({
        description: "秘境最核心的精灵就在此处。击败它就可以控制整个秘境！", 
        enemy_count: 1, 
        enemies_list: ["秘境心火精灵[BOSS]"],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "纳家秘境 - X",
        enemy_stat_halo: 0.40,
        bgm:8,
        parent_location: locations["纳家秘境 - 战斗区"],
        repeatable_reward: {
            textlines: [{dialogue: "秘境心火精灵", lines: ["xh1"]}],
            locations: [{location: "结界湖" }],
        },
    });
    locations["清野江畔"].connected_locations.push({location: locations["纳家秘境"]});
    locations["纳家秘境"].connected_locations.push({location: locations["纳家秘境 - 战斗区"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - 1"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - 2"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - 3"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - 4"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - 5"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - ∞"]});
    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["纳家秘境 - X"], custom_text:"挑战秘境的守护灵"});

    
    
    locations["结界湖"] = new Location({ 
        connected_locations: [{location: locations["纳家秘境"], custom_text: "回到家族秘境里"}], 
        description: "被老祖纳鹰指引而来，封印着“灵”的结界湖。",
        
        dialogues: ["纳鹰"],
        name: "结界湖", 
        is_unlocked: false,
        bgm: 9,
    });//2-4
    locations["结界湖 - 1"] = new Combat_zone({
        description: "秘境核心的湖泊。新生的“灵”与荒兽在此徘徊。", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","威武武士","七阶卫戍","秘境帕芙之灵","秘境猬精","秘境心火精灵"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "结界湖 - 1",
        enemy_stat_halo: 0.08,
        rank:131, 
        bgm:9,
        parent_location: locations["结界湖"],
        first_reward: {
            xp: 30e4,
        },
        repeatable_reward: {
            xp: 10e4,
            locations: [{location: "结界湖 - 2"}],
            //钓鱼区域！
        },
    });
    locations["结界湖 - 2"] = new Combat_zone({
        description: "秘境核心的湖泊。新生的“灵”，人类和秘境守护者同时存在。", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","秘境猬精","秘境心火精灵","纳家冰雪亲卫","有甲有角族","水晶傀儡"],
        enemy_group_size: [2.25,3.25],
        types: [],
        is_unlocked: false, 
        name: "结界湖 - 2",
        enemy_stat_halo: 0.08,
        rank:132, 
        bgm:9,
        parent_location: locations["结界湖"],
        first_reward: {
            xp: 45e4,
        },
        repeatable_reward: {
            xp: 15e4,
            locations: [{location: "结界湖 - 3"}],
        },
    });
    locations["结界湖 - 3"] = new Combat_zone({
        description: "秘境核心的湖泊。出现了颇具危险性，不慎落入就难以摆脱的地缚“灵”。", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","水晶傀儡","原力刀客","秘境胖胖鸟","人立金茸茸","喵咕咕哩"],
        enemy_group_size: [2.5,3.5],
        types: [],
        is_unlocked: false, 
        name: "结界湖 - 3",
        enemy_stat_halo: 0.08,
        rank:133, 
        bgm:9,
        parent_location: locations["结界湖"],
        first_reward: {
            xp: 60e4,
        },
        repeatable_reward: {
            xp: 20e4,
            locations: [{location: "结界湖 - 4"}],
        },
    });
    locations["结界湖 - 4"] = new Combat_zone({
        description: "秘境核心的湖泊。出现了更多被“灵”占据的人类身体。", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","喵咕咕哩","秘境滋生魔","蓝帽行者","流云级魔法师","威武异衣士"],
        enemy_group_size: [2.75,3.75],
        types: [],
        is_unlocked: false, 
        name: "结界湖 - 4",
        enemy_stat_halo: 0.08,
        rank:134, 
        bgm:9,
        parent_location: locations["结界湖"],
        first_reward: {
            xp: 75e4,
        },
        repeatable_reward: {
            xp: 25e4,
            locations: [{location: "结界湖 - 5"}],
        },
    });
    locations["结界湖 - 5"] = new Combat_zone({
        description: "秘境核心的湖泊。出现了更多被“灵”占据的人类身体。", 
        enemy_count: 20, 
        enemies_list: ["微花灵阵","喵咕咕哩","流云级魔法师","威武异衣士","雪魅蝠","大眼八爪鱼"],
        enemy_group_size: [3,3],
        types: [],
        is_unlocked: false, 
        name: "结界湖 - 5",
        enemy_stat_halo: 0.08,
        rank:135, 
        bgm:9,
        parent_location: locations["结界湖"],
        first_reward: {
            xp: 90e4,
        },
        repeatable_reward: {
            xp: 30e4,
            locations: [{location: "结界湖 - X"}],
        },
    });
    locations["结界湖 - X"] = new Challenge_zone({
        description: "呜呜...好强！希望你没把微花残片丢了。", 
        enemy_count: 1, 
        enemy_groups_list : [["流云级魔法师[BOSS]","流云级魔法师[BOSS]","威武异衣士[BOSS]","威武异衣士[BOSS]","蓝帽行者[BOSS]","蓝帽行者[BOSS]","蓝帽行者[BOSS]"]],
        enemy_group_size: [7,7],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "结界湖 - X",
        enemy_stat_halo: 0.32,
        bgm:9,
        parent_location: locations["结界湖"],
        repeatable_reward: {
            activities: [{location:"结界湖", activity:"Running"}]
            //locations: [{location: "结界湖" }],
        },
        unlock_text: "不知不觉……居然走到了核心区域。生活在这里的“灵”也是一等一的强大。",
    });
    
    //1-5 4-8 8-12 11-15 14-18.

    locations["纳家秘境 - 战斗区"].connected_locations.push({location: locations["结界湖"]});
    locations["结界湖"].connected_locations.push({location: locations["结界湖 - 1"]});
    locations["结界湖"].connected_locations.push({location: locations["结界湖 - 2"]});
    locations["结界湖"].connected_locations.push({location: locations["结界湖 - 3"]});
    locations["结界湖"].connected_locations.push({location: locations["结界湖 - 4"]});
    locations["结界湖"].connected_locations.push({location: locations["结界湖 - 5"]});
    locations["结界湖"].connected_locations.push({location: locations["结界湖 - X"], custom_text:"挑战结界湖最深处的“灵”"});



    locations["声律城废墟"] = new Location({ 
        connected_locations: [{location: locations["纳家秘境"], custom_text: "赶路回到家族秘境"}], 
        description: "被D9级飞船炸为废墟的声律领主城。在混乱中蕴藏着许多有用的财宝。",
        
        traders: ["废墟商人"],
        dialogues: ["纳娜米(废墟)","声律城难民"],
        name: "声律城废墟", 
        is_unlocked: false,
        bgm: 10,
    });//2-5

    locations["声律城废墟 - 1"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城。其中鱼龙混杂，适合浑水摸鱼。", 
        enemy_count: 20, 
        enemies_list: ["威武异衣士","大眼八爪鱼","原力刀客","废墟猎兵","废墟菇灵"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "声律城废墟 - 1",
        rank:141, 
        bgm:10,
        parent_location: locations["声律城废墟"],
        first_reward: {
            xp: 120e4,
        },
        repeatable_reward: {
            xp: 40e4,
            money: 200e3,
            locations: [{location: "声律城废墟 - 2"}],
        },
    });
    locations["声律城废墟 - 2"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城。其中鱼龙混杂，适合浑水摸鱼。", 
        enemy_count: 20, 
        enemies_list: ["废墟猎兵","废墟菇灵","燕岗城探险者","声律城难民","声律城骸骨"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "声律城废墟 - 2",
        rank:142, 
        bgm:10,
        parent_location: locations["声律城废墟"],
        first_reward: {
            xp: 150e4,
        },
        repeatable_reward: {
            xp: 50e4,
            money: 400e3,
            locations: [{location: "声律城废墟 - 3"}],
        },
    }); 
    locations["声律城废墟 - 3"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城。其中鱼龙混杂，适合浑水摸鱼。", 
        enemy_count: 20, 
        enemies_list: ["声律城难民","声律城骸骨","锈胎人","双棱晶体","废墟恐怖"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "声律城废墟 - 3",
        rank:143, 
        bgm:10,
        parent_location: locations["声律城废墟"],
        first_reward: {
            xp: 180e4,
        },
        repeatable_reward: {
            xp: 60e4,
            money: 600e3,
            locations: [{location: "声律城废墟 - 4"}],
        },
    });
    locations["声律城废墟 - 4"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城。其中鱼龙混杂，适合浑水摸鱼。", 
        enemy_count: 20, 
        enemies_list: ["双棱晶体","废墟恐怖","猫茸茸","兰陵城探险者","远古傀儡","血洛幽灵"],//兰陵城小队长，伏地精
        enemy_group_size: [3,3],
        types: [],
        is_unlocked: false, 
        name: "声律城废墟 - 4",
        rank:144, 
        bgm:10,
        parent_location: locations["声律城废墟"],
        first_reward: {
            xp: 180e4,
        },
        repeatable_reward: {
            xp: 60e4,
            money: 800e3,
            locations: [{location: "声律城废墟 - 5"}],
        },
    });
    locations["声律城废墟 - 5"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城。其中鱼龙混杂，适合浑水摸鱼。", 
        enemy_count: 20, 
        enemies_list: ["远古傀儡","血洛幽灵","废墟飞鸟","兰陵城小队长","伏地精"],
        enemy_group_size: [3,3],
        types: [],
        is_unlocked: false, 
        name: "声律城废墟 - 5",
        rank:145, 
        bgm:10,
        parent_location: locations["声律城废墟"],
        first_reward: {
            xp: 210e4,
        },
        repeatable_reward: {
            xp: 70e4,
            money: 1e6,
            locations: [{location: "声律城废墟 - X"}],
        },
    });
    locations["声律城废墟 - X"] = new Challenge_zone({
        description: "...露头就秒？！如果可以看到这段话，相信你已经找到破解的办法了。", 
        enemy_count: 1, 
        enemies_list : [["废墟追光者[BOSS]"]],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "声律城废墟 - X",
        bgm:10,
        parent_location: locations["声律城废墟"],
        repeatable_reward: {
            money: 1e9,
            locations: [{location: "声律城战场" }],
        },
        unlock_text: "竟然有一只大地级巅峰的影子荒兽拦路……<br>那就用它，来检验我这段时间的进步吧。",
    });
    locations["纳家秘境"].connected_locations.push({location: locations["声律城废墟"]});
    locations["声律城废墟"].connected_locations.push({location: locations["声律城废墟 - 1"]});
    locations["声律城废墟"].connected_locations.push({location: locations["声律城废墟 - 2"]});
    locations["声律城废墟"].connected_locations.push({location: locations["声律城废墟 - 3"]});
    locations["声律城废墟"].connected_locations.push({location: locations["声律城废墟 - 4"]});
    locations["声律城废墟"].connected_locations.push({location: locations["声律城废墟 - 5"]});
    locations["声律城废墟"].connected_locations.push({location: locations["声律城废墟 - X"], custom_text:"挑战拦路的[追光]影子荒兽"});
    
    locations["声律城战场"] = new Location({ 
        connected_locations: [{location: locations["声律城废墟"], custom_text: "返回声律城中"}], 
        description: "声律城郊外的混战战场。无需恋战，目标是B9飞船！",
        dialogues: ["心魔(战场)","御兰","皎月神像"],
        name: "声律城战场", 
        is_unlocked: false,
        bgm: 11,
    });//2-6
    locations["声律城废墟"].connected_locations.push({location: locations["声律城战场"]});

    
    locations["符文之屋"] = new Location({
        connected_locations: [{location: locations["声律城废墟"], custom_text: "回到废墟中战斗"}],
        description: "符文工作台套件居然还赠送箱子,床,聚能阵！真是物超所值...",
        name: "符文之屋",
        is_unlocked: false,
        bgm: 10,
        traders: ["物品存储箱"],
        sleeping: {
            text: "在符文之屋修炼[+1000XP/s]",
            xp: 100
        },
            crafting: {
                is_unlocked: true, 
                use_text: "使用符文工作台[Tier+8]", 
                tiers: {
                    crafting: 8,
                    forging: 8,
                    smelting: 8,
                    cooking: 8,
                    alchemy: 8,
                }
            },
        
    })
    
    locations["声律城废墟"].connected_locations.push({location: locations["符文之屋"]});


    locations["声律城战场 - 1"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城外战场，杀戮与抢夺屡见不鲜。", 
        enemy_count: 20, 
        enemies_list: ["废墟飞鸟","兰陵城小队长","伏地精","废墟虫卒","战场亡魂"],
        enemy_group_size: [2,2],
        types: [],
        is_unlocked: false, 
        name: "声律城战场 - 1",
        rank:151, 
        bgm:11,
        parent_location: locations["声律城战场"],
        first_reward: {
            xp: 240e4,
        },
        repeatable_reward: {
            xp: 80e4,
            locations: [{location: "声律城战场 - 2"}],
        },
    });
    
    locations["声律城战场 - 2"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城外战场，杀戮与抢夺屡见不鲜。", 
        enemy_count: 20, 
        enemies_list: ["废墟虫卒","战场亡魂","废墟追风者","古寒铁石精","暗茸茸战士"],
        enemy_group_size: [2.25,3.25],
        types: [],
        is_unlocked: false, 
        name: "声律城战场 - 2",
        rank:152, 
        bgm:11,
        parent_location: locations["声律城战场"],
        first_reward: {
            xp: 270e4,
        },
        repeatable_reward: {
            xp: 90e4,
            locations: [{location: "声律城战场 - 3"}],
            textlines: [{dialogue: "御兰", lines: ["yl1"]}],
        },
    });
    locations["声律城战场 - 3"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城外战场，杀戮与抢夺屡见不鲜。", 
        enemy_count: 20, 
        enemies_list: ["古寒铁石精","暗茸茸战士","魔族潜行者","魔族潜行者","圣荒城骑士","战场凶残暴徒"],
        enemy_group_size: [2.5,3.5],
        types: [],
        is_unlocked: false, 
        name: "声律城战场 - 3",
        rank:153, 
        bgm:11,
        parent_location: locations["声律城战场"],
        first_reward: {
            xp: 300e4,
        },
        repeatable_reward: {
            xp: 100e4,
            locations: [{location: "声律城战场 - 4"}],
            textlines: [{dialogue: "皎月神像", lines: ["jy1"]}],
        },
    });
    locations["声律城战场 - 4"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城外战场，杀戮与抢夺屡见不鲜。", 
        enemy_count: 20, 
        enemies_list: ["圣荒城骑士","战场凶残暴徒","探险者队长","废墟荒兽","哥布林盾兵"],
        enemy_group_size: [2.75,3.75],
        types: [],
        is_unlocked: false, 
        name: "声律城战场 - 4",
        rank:154, 
        bgm:11,
        parent_location: locations["声律城战场"],
        first_reward: {
            xp: 360e4,
        },
        repeatable_reward: {
            xp: 120e4,
            activities: [{location:"声律城战场", activity:"mining50kGem"}],
            locations: [{location: "声律城战场 - 5"}],
        },
    });
    locations["声律城战场 - 5"] = new Combat_zone({
        description: "被D9飞船摧毁的声律城外战场，杀戮与抢夺屡见不鲜。", 
        enemy_count: 20, 
        enemies_list: ["战场复苏骸骨","探险者队长","哥布林盾兵","鎏银幽灵","血洛老年修士"],
        enemy_group_size: [3,3],
        types: [],
        is_unlocked: false, 
        name: "声律城战场 - 5",
        rank:155, 
        enemy_stat_halo:0.2,
        bgm:11,
        parent_location: locations["声律城战场"],
        first_reward: {
            xp: 450e4,
        },
        repeatable_reward: {
            xp: 150e4,
            locations: [{location: "声律城战场 - X"}],
        },
    });

    
    locations["声律城战场 - X"] = new Challenge_zone({
        description: "前面就是此行的目标——[B9飞船].不过，还有个蓝色大型机器人挡路的说。", 
        enemy_count: 1, 
        enemies_list : [["初级卫兵A9[BOSS]"]],
        enemy_group_size: [1,1],
        types: [],
        is_unlocked: false, 
        is_challenge: true,
        name: "声律城战场 - X",
        bgm:11,
        parent_location: locations["声律城战场"],
        repeatable_reward: {
            locations: [{location: "天外飞船" }],
        },
        spec_hint: "[纱雪][散华]领悟的核心是根据生命之比削弱攻击。想要破解，无非提高生命上限，或者造成强制伤害。",
        unlock_text: "这个蓝色的家伙，具备的力量和速度……已经堪比当日的地宫养殖者。一定要做好充分的准备，再过去。",
    });

    locations["声律城战场"].connected_locations.push({location: locations["声律城战场 - 1"]});
    locations["声律城战场"].connected_locations.push({location: locations["声律城战场 - 2"]});
    locations["声律城战场"].connected_locations.push({location: locations["声律城战场 - 3"]});
    locations["声律城战场"].connected_locations.push({location: locations["声律城战场 - 4"]});
    locations["声律城战场"].connected_locations.push({location: locations["声律城战场 - 5"]});
    locations["声律城战场"].connected_locations.push({location: locations["声律城战场 - X"],custom_text:"挑战蓝色的庞然大物"});
    locations["天外飞船"] = new Location({ 
        connected_locations: [{location: locations["声律城战场"], custom_text: "暂且离开这艘飞船"}], 
        description: "声律城之行的最终目标。可能蕴含着在血洛大陆堪称罕见的宝物，却处处透露出对外来着的不友善与肃杀。",
        name: "天外飞船", 
        is_unlocked: false,
        bgm: 12,
    });//2-7
    locations["声律城战场"].connected_locations.push({location: locations["天外飞船"]});


    locations["天外飞船 - 1"] = new Combat_zone({
        description: "B9级飞船的内部。某种压制力场让外来者感到相当不适。", 
        enemy_count: 20, 
        types: [{type: "stress", stage: 1, xp_gain: 1}],
        enemies_list: ["鎏银幽灵","探险者队长","初级卫兵A9","领域之械A9","荒兽电法兵"],
        enemy_group_size: [2,2],
        is_unlocked: true, 
        name: "天外飞船 - 1",
        rank:161, 
        bgm:12,
        parent_location: locations["天外飞船"],
        first_reward: {
            xp: 600e4,
        },
        repeatable_reward: {
            xp: 200e4,
            locations: [{location: "天外飞船 - 2"}],
            //百方
        },
    });
    locations["天外飞船 - 2"] = new Combat_zone({
        description: "B9级飞船的内部。出现了一些似乎同出一源的重工机械。", 
        enemy_count: 20, 
        types: [{type: "stress", stage: 1, xp_gain: 1}],
        enemies_list: ["荒兽电法兵","黑桃重工A9","夹击之械A9","神权十字A9","梅花重工A9"],
        enemy_group_size: [2.25,3.25],
        is_unlocked: false, 
        name: "天外飞船 - 2",
        rank:162, 
        bgm:12,
        parent_location: locations["天外飞船"],
        first_reward: {
            xp: 900e4,
        },
        repeatable_reward: {
            xp: 300e4,
            locations: [{location: "天外飞船 - 3"}],
        },
    });
    locations["天外飞船 - 3"] = new Combat_zone({
        description: "B9级飞船的内部。似乎有内鬼混在里面！", 
        enemy_count: 20, 
        types: [{type: "stress", stage: 1, xp_gain: 1}],
        enemies_list: ["梅花重工A9","古老符文","生命熔炉A9","血洛游侠","白银之锋A9"],
        enemy_group_size: [2.5,3.5],
        enemy_stat_halo: -0.1,
        is_unlocked: false,
        name: "天外飞船 - 3",
        rank:163, 
        bgm:12,
        parent_location: locations["天外飞船"],
        first_reward: {
            xp: 1200e4,
        },
        repeatable_reward: {
            xp: 400e4,
            locations: [{location: "天外飞船 - 4"}],
            //空间三角B1
        },
    });
    locations["天外飞船 - 4"] = new Combat_zone({
        description: "B9级飞船的内部。那些最大只的敌人都在-5...", 
        enemy_count: 20, 
        types: [{type: "stress", stage: 1, xp_gain: 1}],
        enemies_list: ["白银之锋A9","持盾战士A9","红桃重工B1","燕岗狂战傀儡","激光炮塔A9"],
        enemy_group_size: [2.75,3.75],
        is_unlocked: false,
        name: "天外飞船 - 4",
        rank:164, 
        bgm:12,
        parent_location: locations["天外飞船"],
        first_reward: {
            xp: 1500e4,
        },
        repeatable_reward: {
            xp: 500e4,
            locations: [{location: "天外飞船 - 5"}],
            //姐姐区域
        },
    });
    locations["天外飞船 - 5"] = new Combat_zone({
        description: "B9级飞船的内部。小心416 416 416的黑铁战士！", 
        enemy_count: 20, 
        types: [{type: "stress", stage: 1, xp_gain: 1}],
        enemies_list: ["方片重工A9","血洛游侠","舰船护卫A9","高级卫兵B1","黑铁战士B1"],
        enemy_group_size: [3,3],
        is_unlocked: false,
        name: "天外飞船 - 5",
        rank:165, 
        bgm:12,
        parent_location: locations["天外飞船"],
        first_reward: {
            xp: 1800e4,
        },
        repeatable_reward: {
            xp: 600e4,
            //locations: [{location: "天外飞船 - X"}],
        },
    });
    locations["天外飞船"].connected_locations.push({location: locations["天外飞船 - 1"]});
    locations["天外飞船"].connected_locations.push({location: locations["天外飞船 - 2"]});
    locations["天外飞船"].connected_locations.push({location: locations["天外飞船 - 3"]});
    locations["天外飞船"].connected_locations.push({location: locations["天外飞船 - 4"]});
    locations["天外飞船"].connected_locations.push({location: locations["天外飞船 - 5"]});


    locations["Nearby cave"] = new Location({ 
        connected_locations: [{location: locations["Village"], custom_text: "Go outside and to the village"}], 
        getDescription: function() {
            if(locations["Pitch black tunnel"].enemy_groups_killed >= locations["Pitch black tunnel"].enemy_count) { 
                return "A big cave near the village, once used as a storeroom. Groups of fluorescent mushrooms cover the walls, providing a dim light. Your efforts have secured a decent space and many of the tunnels. It seems like you almost reached the deepest part.";
            }
            else if(locations["Hidden tunnel"].enemy_groups_killed >= locations["Hidden tunnel"].enemy_count) { 
                return "A big cave near the village, once used as a storeroom. Groups of fluorescent mushrooms cover the walls, providing a dim light. Your efforts have secured a major space and some tunnels, but there are still more places left to clear out.";
            }
            else if(locations["Cave depths"].enemy_groups_killed >= locations["Cave depths"].enemy_count) { 
                return "A big cave near the village, once used as a storeroom. Groups of fluorescent mushrooms cover the walls, providing a dim light. Your efforts have secured a decent space and even a few tunnels, yet somehow you can still hear the sounds of the wolf rats.";
            }
            else if(locations["Cave room"].enemy_groups_killed >= locations["Cave room"].enemy_count) {
                return "A big cave near the village, once used as a storeroom. Groups of fluorescent mushrooms cover the walls, providing a dim light. Your efforts have secured some space, but you can hear more wolf rats in some deeper tunnels.";
            } else {
                return "A big cave near the village, once used as a storeroom. Groups of fluorescent mushrooms cover the walls, providing a dim light. You can hear sounds of wolf rats from the nearby room.";
            }
        },
        getBackgroundNoises: function() {
            let noises = ["*You hear rocks rumbling somewhere*", "Squeak!", ];
            return noises;
        },
        name: "Nearby cave",
        is_unlocked: false,
    });
    locations["Village"].connected_locations.push({location: locations["Nearby cave"]});
    //remember to always add it like that, otherwise travel will be possible only in one direction and location might not even be reachable

    locations["Cave room"] = new Combat_zone({
        description: "It's full of rats. At least the glowing mushrooms provide some light.", 
        enemy_count: 25, 
        types: [{type: "narrow", stage: 1,  xp_gain: 3}, {type: "bright", stage:1}],
        enemies_list: ["Wolf rat"],
        enemy_group_size: [2,3],
        enemy_stat_variation: 0.2,
        is_unlocked: true, 
        name: "Cave room", 
        leave_text: "Go back to entrance",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 20,
        },
        repeatable_reward: {
            locations: [{location: "Cave depths"}],
            xp: 10,
            activities: [{location:"Nearby cave", activity:"weightlifting"}, {location:"Nearby cave", activity:"mining"}, {location:"Village", activity:"balancing"}],
        }
    });
    locations["Nearby cave"].connected_locations.push({location: locations["Cave room"]});

    locations["Cave depths"] = new Combat_zone({
        description: "It's dark. And full of rats.", 
        enemy_count: 50, 
        types: [{type: "narrow", stage: 1,  xp_gain: 3}, {type: "dark", stage: 2, xp_gain: 3}],
        enemies_list: ["Wolf rat"],
        enemy_group_size: [5,8],
        enemy_stat_variation: 0.2,
        is_unlocked: false, 
        name: "Cave depths", 
        leave_text: "Climb out",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 30,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village elder", lines: ["cleared cave"]}],
            locations: [{location: "Suspicious wall", required_clears: 4}],
            xp: 15,
        }
    });
    
    locations["Hidden tunnel"] = new Combat_zone({
        description: "There is, in fact, even more rats here.", 
        enemy_count: 50, 
        types: [{type: "narrow", stage: 1,  xp_gain: 3}, {type: "dark", stage: 3, xp_gain: 1}],
        enemies_list: ["Elite wolf rat"],
        enemy_group_size: [2,2],
        enemy_stat_variation: 0.2,
        is_unlocked: false, 
        name: "Hidden tunnel", 
        leave_text: "Retreat for now",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 100,
        },
        repeatable_reward: {
            locations: [{location: "Pitch black tunnel"}],
            xp: 50,
            activities: [{location:"Nearby cave", activity:"mining2"}],
        },
        unlock_text: "As the wall falls apart, you find yourself in front of a new tunnel, leading even deeper. And of course, it's full of wolf rats."
    });
    locations["Pitch black tunnel"] = new Combat_zone({
        description: "There is no light here. Only rats.", 
        enemy_count: 50, 
        types: [{type: "narrow", stage: 1,  xp_gain: 6}, {type: "dark", stage: 3, xp_gain: 3}],
        enemies_list: ["Elite wolf rat"],
        enemy_group_size: [6,8],
        enemy_stat_variation: 0.2,
        is_unlocked: false, 
        name: "Pitch black tunnel", 
        leave_text: "Retreat for now",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 200,
        },
        repeatable_reward: {
            xp: 100,
            locations: [{location: "Mysterious gate", required_clears: 4}],
        },
        unlock_text: "As you keep going deeper, you barely notice a pitch black hole. Not even a tiniest speck of light reaches it."
    });

    locations["Mysterious gate"] = new Combat_zone({
        description: "It's dark. And full of rats.", 
        enemy_count: 50, 
        types: [{type: "dark", stage: 3, xp_gain: 5}],
        enemies_list: ["Elite wolf rat guardian"],
        enemy_group_size: [6,8],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Mysterious gate", 
        leave_text: "Get away",
        parent_location: locations["Nearby cave"],
        first_reward: {
            xp: 500,
        },
        repeatable_reward: {
            xp: 250,
        },
        unlock_text: "After a long and ardous fight, you reach a chamber that ends with a massive stone gate. You can see it's guarded by some kind of wolf rats, but much bigger than the ones you fought until now."
    });


    locations["Nearby cave"].connected_locations.push(
        {location: locations["Cave depths"]}, 
        {location: locations["Hidden tunnel"], custom_text: "Enter the hidden tunnel"}, 
        {location: locations["Pitch black tunnel"], custom_text: "Go into the pitch black tunnel"},
        {location: locations["Mysterious gate"], custom_text: "Go to the mysterious gate"}),

    locations["Forest road"] = new Location({ 
        connected_locations: [{location: locations["Village"]}],
        description: "Old trodden road leading through a dark forest, the only path connecting village to the town. You can hear some animals from the surrounding woods.",
        name: "Forest road",
        getBackgroundNoises: function() {
            let noises = ["*You hear some rustling*", "Roar!", "*You almost tripped on some roots*", "*You hear some animal running away*"];

            return noises;
        },
        is_unlocked: false,
    });
    locations["Village"].connected_locations.push({location: locations["Forest road"], custom_text: "Leave the village"});

    locations["Forest"] = new Combat_zone({
        description: "Forest surrounding the village, a dangerous place", 
        enemies_list: ["Starving wolf", "Young wolf"],
        enemy_count: 30, 
        enemy_stat_variation: 0.2,
        name: "Forest", 
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 40,
        },
        repeatable_reward: {
            xp: 20,
            locations: [{location:"Deep forest"}],
            activities: [{location:"Forest road", activity: "herbalism"}],
        },
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest"], custom_text: "Leave the safe path"});

    locations["Deep forest"] = new Combat_zone({
        description: "Deeper part of the forest, a dangerous place", 
        enemies_list: ["Wolf", "Starving wolf", "Young wolf"],
        enemy_count: 50, 
        enemy_group_size: [2,3],
        enemy_stat_variation: 0.2,
        is_unlocked: false,
        name: "Deep forest", 
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 70,
        },
        repeatable_reward: {
            xp: 35,
            flags: ["is_deep_forest_beaten"],
            activities: [{location:"Forest road", activity: "woodcutting"}],
        }
    });
    locations["Forest road"].connected_locations.push({location: locations["Deep forest"], custom_text: "Venture deeper into the woods"});

    locations["Forest clearing"] = new Combat_zone({
        description: "A surprisingly big clearing hidden in the northern part of the forest, covered with very tall grass and filled with a mass of wild boars",
        enemies_list: ["Boar"],
        enemy_count: 50, 
        enemy_group_size: [4,7],
        is_unlocked: false,
        enemy_stat_variation: 0.2,
        name: "Forest clearing", 
        types: [{type: "open", stage: 2, xp_gain: 3}],
        parent_location: locations["Forest road"],
        first_reward: {
            xp: 200,
        },
        repeatable_reward: {
            xp: 100,
            textlines: [{dialogue: "farm supervisor", lines: ["defeated boars"]}],
        }
    });
    locations["Forest road"].connected_locations.push({location: locations["Forest clearing"], custom_text: "Go towards the clearing in the north"});

    locations["Town outskirts"] = new Location({ 
        connected_locations: [{location: locations["Forest road"], custom_text: "Return to the forest"}],
        description: "The town is surrounded by a tall stone wall. The only gate seems to be closed, with a lone guard outside. You can see farms to the north and slums to the south.",
        name: "Town outskirts",
        is_unlocked: true,
        dialogues: ["gate guard"],
    });
    locations["Forest road"].connected_locations.push({location: locations["Town outskirts"], custom_text: "Go towards the town"});

    locations["Slums"] = new Location({ 
        connected_locations: [{location: locations["Town outskirts"]}],
        description: "A wild settlement next to city walls, filled with decaying buildings and criminals",
        name: "Slums",
        is_unlocked: true,
        dialogues: ["suspicious man"],
        traders: ["suspicious trader"],
        getBackgroundNoises: function() {
            let noises = ["Cough cough", "*You hear a scream*", "*You hear someone sobbing*"];

            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push("Please, do you have a coin to spare?");
            } else {
                noises.push("*Sounds of someone getting repeatedly stabbed*", "Scammed some fools for money today, time to get drunk");
            }
            return noises;
        },
    });
    locations["Town farms"] = new Location({ 
        connected_locations: [{location: locations["Town outskirts"]}],
        description: "Semi-private farms under jurisdiction of the city council. Full of life and sounds of heavy work.",
        name: "Town farms",
        is_unlocked: true,
        dialogues: ["farm supervisor"],
        getBackgroundNoises: function() {
            let noises = [];
            if(current_game_time.hour > 4 && current_game_time.hour <= 20) {
                noises.push("Mooooo!", "Look, a bird!", "Bark bark!", "*You notice a goat staring at you menacingly*", "Neigh!", "Oink oink");
            } else {
                noises.push("*You can hear some rustling*", "*You can hear snoring workers*");
            }

            if(current_game_time.hour > 3 && current_game_time.hour < 10) {
                noises.push("♫♫ Heigh ho, heigh ho, it's off to work I go~ ♫♫", "Cock-a-doodle-doo!");
            } else if(current_game_time.hour > 18 && current_game_time.hour < 22) {
                noises.push("♫♫ Heigh ho, heigh ho, it's home from work I go~ ♫♫");
            } 

            return noises;
        },
    });

    locations["Town outskirts"].connected_locations.push({location: locations["Town farms"]}, {location: locations["Slums"]});
})();

//challenge zones
(function(){
    locations["Sparring with the village guard (heavy)"] = new Challenge_zone({
        description: "He's showing you a technique that makes his attacks slow but deadly",
        enemy_count: 1, 
        enemies_list: ["Village guard (heavy)"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        name: "Sparring with the village guard (heavy)", 
        leave_text: "Give up",
        parent_location: locations["Village"],
        first_reward: {
            xp: 30,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village guard", lines: ["heavy"]}],
        },
        unlock_text: "You can now spar with the guard (heavy stance) in the Village"
    });
    locations["Sparring with the village guard (quick)"] = new Challenge_zone({
        description: "He's showing you a technique that makes his attacks slow but deadly",
        enemy_count: 1, 
        enemies_list: ["Village guard (quick)"],
        enemy_group_size: [1,1],
        is_unlocked: false, 
        name: "Sparring with the village guard (quick)", 
        leave_text: "Give up",
        parent_location: locations["Village"],
        first_reward: {
            xp: 30,
        },
        repeatable_reward: {
            textlines: [{dialogue: "village guard", lines: ["quick"]}],
        },
        unlock_text: "You can now spar with the guard (quick stance) in the Village"
    });
    locations["Village"].connected_locations.push(
        {location: locations["Sparring with the village guard (heavy)"], custom_text: "Spar with the guard [heavy]"},
        {location: locations["Sparring with the village guard (quick)"], custom_text: "Spar with the guard [quick]"}
    );

    locations["Suspicious wall"] = new Challenge_zone({
        description: "It can be broken with enough force, you can feel it", 
        enemy_count: 1, 
        types: [],
        enemies_list: ["Suspicious wall"],
        enemy_group_size: [1,1],
        enemy_stat_variation: 0,
        is_unlocked: false, 
        name: "Suspicious wall", 
        leave_text: "Leave it for now",
        parent_location: locations["Nearby cave"],
        repeatable_reward: {
            locations: [{location: "Hidden tunnel"}],
            textlines: [{dialogue: "village elder", lines: ["new tunnel"]}],
            xp: 20,
        },
        unlock_text: "At some point, one of wolf rats tries to escape through a previously unnoticed hole in a nearby wall. There might be another tunnel behind it!"
    });
    locations["Nearby cave"].connected_locations.push({location: locations["Suspicious wall"], custom_text: "Try to break the suspicious wall"});

    locations["Fight off the assailant"] = new Challenge_zone({
        description: "He attacked you out of nowhere", 
        enemy_count: 1, 
        types: [],
        enemies_list: ["Suspicious man"],
        enemy_group_size: [1,1],
        enemy_stat_variation: 0,
        is_unlocked: false, 
        name: "Fight off the assailant", 
        leave_text: "Run away for now",
        parent_location: locations["Slums"],
        repeatable_reward: {
            textlines: [{dialogue: "suspicious man", lines: ["defeated"]}],
            xp: 40,
        },
        unlock_text: "Defend yourself!"
    });
    locations["Slums"].connected_locations.push({location: locations["Fight off the assailant"], custom_text: "Fight off the suspicious man"});
})();

//add activities
(function(){
    locations["Village"].activities = {
        "fieldwork": new LocationActivity({
            activity_name: "fieldwork",
            starting_text: "Work on the fields",
            get_payment: () => {
                return 10 + Math.round(15 * skills["Farming"].current_level/skills["Farming"].max_level);
            },
            is_unlocked: false,
            working_period: 60*2,
            availability_time: {start: 6, end: 20},
            skill_xp_per_tick: 1, 
        }),
        "weightlifting": new LocationActivity({
            activity_name: "weightlifting",
            infinite: true,
            starting_text: "Try to carry some bags of grain",
            skill_xp_per_tick: 1,
            is_unlocked: false,
        }),
        "balancing": new LocationActivity({
            activity_name: "balancing",
            infinite: true,
            starting_text: "Try to keep your balance on rocks in the river",
            unlock_text: "All this fighting while surrounded by stone and rocks gives you a new idea",
            skill_xp_per_tick: 1,
            is_unlocked: false,
        }),
        "meditating": new LocationActivity({
            activity_name: "meditating",
            infinite: true,
            starting_text: "Sit down and meditate",
            skill_xp_per_tick: 1,
            is_unlocked: true,
        }),
        "patrolling": new LocationActivity({
            activity_name: "patrolling",
            starting_text: "Go on a patrol around the village.",
            get_payment: () => {return 30},
            is_unlocked: false,
            infinite: true,
            working_period: 60*2,
            skill_xp_per_tick: 1
        }),
        "woodcutting": new LocationActivity({
            activity_name: "woodcutting",
            infinite: true,
            starting_text: "Gather some wood on the outskirts",
            skill_xp_per_tick: 1,
            is_unlocked: true,
            gained_resources: {
                resources: [{name: "Piece of rough wood", ammount: [[1,1], [1,3]], chance: [0.3, 1]}], 
                time_period: [20, 10],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
            require_tool: false,
        }),
    };
    locations["Nearby cave"].activities = {
        "weightlifting": new LocationActivity({
            activity_name: "weightlifting",
            infinite: true,
            starting_text: "Try lifting some of the rocks",
            skill_xp_per_tick: 3,
            is_unlocked: false,
            unlock_text: "After the fight, you realize there's quite a lot of rocks of different sizes that could be used for exercises",
        }),
        "mining": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "Mine the strange looking iron vein",
            skill_xp_per_tick: 1,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Low quality iron ore", ammount: [[1,1], [1,3]], chance: [0.3, 0.7]}], 
                time_period: [60, 30],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
            unlock_text: "As you clear the area of wolf rats, you notice a vein of an iron ore",
        }),
        "mining2": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "Mine some of the deeper iron vein",
            skill_xp_per_tick: 5,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Iron ore", ammount: [[1,1], [1,3]], chance: [0.1, 0.6]}], 
                time_period: [90, 40],
                skill_required: [7, 17],
                scales_with_skill: true,
            },
            unlock_text: "Going deeper, you find a vein of an iron ore that seems to be of much higher quality",
        }),
    };
    locations["Forest road"].activities = {
        "woodcutting": new LocationActivity({
            activity_name: "woodcutting",
            infinite: true,
            starting_text: "Gather some wood from nearby trees",
            skill_xp_per_tick: 5,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "Piece of wood", ammount: [[1,1], [1,3]], chance: [0.1, 1]}],
                time_period: [90, 40],
                skill_required: [10, 20],
                scales_with_skill: true,
            },
        }),
        "herbalism": new LocationActivity({
            activity_name: "herbalism",
            infinite: true,
            starting_text: "Gather useful herbs throughout the forest",
            skill_xp_per_tick: 2,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Oneberry", ammount: [[1,1], [1,1]], chance: [0.1, 0.5]},
                    {name: "Golmoon leaf", ammount: [[1,1], [1,1]], chance: [0.1, 0.7]},
                    {name: "Belmart leaf", ammount: [[1,1], [1,1]], chance: [0.1, 0.7]}
                ], 
                time_period: [120, 45],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
            require_tool: false,
        }),
    };
    locations["Town farms"].activities = {
        "fieldwork": new LocationActivity({
            activity_name: "fieldwork",
            starting_text: "Work on the fields",
            get_payment: () => {
                return 20 + Math.round(20 * skills["Farming"].current_level/skills["Farming"].max_level);
            },
            is_unlocked: false,
            working_period: 60*2,
            availability_time: {start: 6, end: 20},
            skill_xp_per_tick: 2,
        }),
        "animal care": new LocationActivity({
            activity_name: "animal care",
            infinite: true,
            starting_text: "Take care of local sheep in exchange for some wool",
            skill_xp_per_tick: 3,
            is_unlocked: false,
            gained_resources: {
                resources: [
                    {name: "Wool", ammount: [[1,1], [1,3]], chance: [0.1, 1]},
                ], 
                time_period: [120, 60],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
            require_tool: false,
        }),
    };
    locations["郊区河流"].activities = {
        
        "Running": new LocationActivity({
            activity_name: "Running",
            infinite: true,
            starting_text: "在郊区尽情地跑步",
            skill_xp_per_tick: 1,
            is_unlocked: true,
        }),
        "Swimming": new LocationActivity({
            activity_name: "Swimming",
            infinite: true,
            starting_text: "在河中练习游泳",
            skill_xp_per_tick: 1,
            is_unlocked: true,
        }),
    }
    locations["清野江畔"].activities = {
        
        "Swimming": new LocationActivity({
            activity_name: "Swimming",
            infinite: true,
            starting_text: "在清野瀑布中抗衡急流[EXPx32]",
            skill_xp_per_tick: 32,
            is_unlocked: true,
        }),
    }
    
    locations["燕岗矿井"].activities = {
        
        "miningP_Copper": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "挖掘部分紫铜矿石",
            skill_xp_per_tick: 1,
            is_unlocked: true,
            gained_resources: {
                resources: [{name: "紫铜矿", ammount: [[1,1], [1,1]], chance: [0.4, 1.0]}], 
                time_period: [20, 8],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
        }),

        "miningCoal": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "挖掘煤矿石",
            skill_xp_per_tick: 2,
            is_unlocked: true,
            gained_resources: {
                resources: [{name: "煤炭", ammount: [[1,1], [1,1]], chance: [0.4, 1.0]}], 
                time_period: [24, 10],
                skill_required: [3, 13],
                scales_with_skill: true,
            },
        }),
    };
    locations["地宫入口"].activities = {
        "mining40Gem": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "偷偷用镐子挖出宝石",
            skill_xp_per_tick: 10,
            is_unlocked: true,
            exp_scaling: true,
            scaling_id: "40G",
            exp_o:1.5,//每完成一次需要的时间指数提升
            gained_resources: {
                resources: [{name: "高级蓝宝石", ammount: [[1,1], [1,1]], chance: [1.0, 1.0]}], 
                time_period: [10, 2],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
        }),
    }
    locations["荒兽森林营地"].activities = {
        "woodcutting100": new LocationActivity({
            activity_name: "woodcutting",
            infinite: true,
            starting_text: "在荒兽森林中砍伐柳木",
            skill_xp_per_tick: 20,
            is_unlocked: false,
            gained_resources: {
                resources: [{name: "百年柳木", ammount: [[1,1], [1,3]], chance: [1, 1]}],
                time_period: [30, 6],
                skill_required: [8, 30],
                scales_with_skill: true,
            },
        }),
    }
    
    locations["纳家秘境"].activities = {
        "Running": new LocationActivity({
            activity_name: "Running",
            infinite: true,
            starting_text: "在秘境中绕圈跑[EXPx32]",
            skill_xp_per_tick: 32,
            is_unlocked: true,
        }),
        "microflower": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "用镐子破坏光环",
            skill_xp_per_tick: 50,
            is_unlocked: false,
            exp_scaling: true,
            scaling_id: "microflower",
            exp_o:2,//每完成一次需要的时间指数提升
            gained_resources: {
                resources: [{name: "微花残片", ammount: [[1,1], [1,1]], chance: [1.0, 1.0]}], 
                time_period: [30, 10],
                skill_required: [0, 10],
                scales_with_skill: true,
            },
        }),
    }

    locations["结界湖"].activities = {
        "fishing": new LocationActivity({
            activity_name: "fishing",
            infinite: true,
            starting_text: "在结界湖中垂钓",
            skill_xp_per_tick: 1,
            is_unlocked: true,
            gained_resources: {
                resources: [{name: "湖鲤鱼", ammount: [[1,1], [1,1]], chance: [0.00000001, 0.00000001]},{name: "青花鱼", ammount: [[1,1], [1,1]], chance: [0.00000001, 0.00000001]},{name: "冰柱鱼", ammount: [[1,1], [1,1]], chance: [0.00000001, 0.00000001]}],
                time_period: [15, 3],
                skill_required: [0, 20],
                scales_with_skill: true,
            },
        }),
        "Running": new LocationActivity({
            activity_name: "Running",
            infinite: true,
            starting_text: "赶往声律城[EXPx64]",
            skill_xp_per_tick: 64,
            spec: "goto2-5",
            is_unlocked: false,
        }),
    }
    
    locations["声律城战场"].activities = {
        "mining50kGem": new LocationActivity({
            activity_name: "mining",
            infinite: true,
            starting_text: "偷偷用镐子挖出更大颗的宝石",
            skill_xp_per_tick: 100,
            is_unlocked: true,
            exp_scaling: true,
            scaling_id: "50K",
            exp_o:1.33,//每完成一次需要的时间指数提升
            gained_resources: {
                resources: [{name: "殿堂红宝石", ammount: [[1,1], [1,1]], chance: [1.0, 1.0]},{name: "殿堂绿宝石", ammount: [[1,1], [1,1]], chance: [0.01, 0.25]}], 
                time_period: [12, 2],
                skill_required: [10, 20],
                scales_with_skill: true,
            },
        }),
    }
})();

//add actions

export {locations, location_types, get_location_type_penalty};

/*
TODO:
    some "quick travel" location that would connect all important ones? (e.g. some towns?)
*/
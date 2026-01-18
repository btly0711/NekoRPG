"use strict";

import { character } from "./character.js";
import { Armor, ArmorComponent, Shield, ShieldComponent, Weapon, WeaponComponent, item_templates } from "./items.js";
import { skills } from "./skills.js";

const crafting_recipes = {items: {}, items2: {}, components: {}, equipment: {}};
const cooking_recipes = {items: {}, items2: {}};
const smelting_recipes = {items: {}, items2: {}};
const forging_recipes = {items: {}, items2: {} , components: {}};
const alchemy_recipes = {items: {}, items2: {}};

/*
    recipes can be treated differently for display based on if they are in items/components/equipment category

    non-equipment recipes have a success rate (presented with min-max value, where max should be 1) that shall scale with skill level and with crafting station level
    for equipment recipes, there is no success rate in favor of equipment's "quality" property

    resulting quality of equipment is based on component quality; 100% (with slight variation) with 100% components and required skill, more at higher levels
    
    overal max quality achievable scales with related skills
*/

class Recipe {
    constructor({
        name,
        id,
        is_unlocked = true, //TODO: change to false when unlocking is implemented!
        recipe_type,
        result, //{name, count}
        getResult,
        recipe_level = [1,1],
        recipe_skill,
    }) {
        this.name = name;
        this.id = id || name;
        this.is_unlocked = is_unlocked;
        this.recipe_type = recipe_type;
        this.result = result;
        this.getResult = getResult || function(){return this.result};
        this.recipe_level = recipe_level;
        this.recipe_skill = recipe_skill;
    }
}

class ItemRecipe extends Recipe {
    constructor({
        name,
        id,
        materials = [], //{name, count}
        is_unlocked = true, //TODO: change to false when unlocking is implemented!
        recipe_type,
        result, //{name, count}
        getResult,
        recipe_level,
        recipe_skill,
        Q_able,
        success_chance = [1,1],
    }) {
        super({name, id, is_unlocked, recipe_type, result, getResult, recipe_level, recipe_skill});
        this.materials = materials;
        this.success_chance = success_chance;
        this.Q_able = Q_able;
        if(this.success_chance[0]==0){
            this.success_chance[0] = 0.1;
        }
    }

    get_success_chance(station_tier=0) {
        //console.log(station_tier)
        //const level = Math.min(this.recipe_level[1]-this.recipe_level[0]+1, Math.max(0,skills[this.recipe_skill].current_level-this.recipe_level[0]+1));
        //const skill_modifier = Math.min(1,(0||(level+(station_tier-1))/(this.recipe_level[1]-this.recipe_level[0]+1)));
        //return this.success_chance[0]*(this.success_chance[1]/this.success_chance[0])**skill_modifier;
        const level_d = Math.max(this.recipe_level[1]-skills[this.recipe_skill].current_level-station_tier,0);
        return 0.85**level_d;
        }

    get_availability() {
        for(let i = 0; i < this.materials.length; i++) {
            const key = item_templates[this.materials[i].material_id].getInventoryKey();
            if(!character.inventory[key] || character.inventory[key].count < this.materials[i].count) {
                return false;
            }
        }
        return true;
    }

    get_is_any_material_present() {
        for(let i = 0; i < this.materials.length; i++) {
            
            if(character.inventory[this.materials[i].material_id]) {
                return true;
            }
        }
        return false;
    }
}

class ComponentRecipe extends ItemRecipe{
    constructor({
        name,
        id,
        materials = [], 
        is_unlocked = true, //TODO: change to false when unlocking is implemented!
        result, //{item, count, result_name} where result_name is an item_templates key
        component_type,
        recipe_skill,
        item_type,
    }) {
        super({name, id, materials, is_unlocked, recipe_type: "component", result, recipe_level: [1,1], recipe_skill, getResult: null, success_rate: [1,1]})
        this.component_type = component_type;
        this.item_type = item_type;
        this.getResult = function(material, station_tier = 1){
            const result = item_templates[this.materials.filter(x => x.material_id===material.id)[0].result_id];
            //return based on material used
            let quality = this.get_quality((station_tier-result.component_tier) || 0);
            if(result.tags["clothing"]) {
                //means its a clothing (wearable internal part of armor)
                return new Armor({...item_templates[result.id], quality: quality});
            } else if(result.tags["armor component"]) {

                return new ArmorComponent({...item_templates[result.id], quality: quality});
            } else if(result.tags["weapon component"]) {

                return new WeaponComponent({...item_templates[result.id], quality: quality});
            } else if(result.tags["shield component"]) {

                return new ShieldComponent({...item_templates[result.id], quality: quality});
            } else {
                throw new Error(`Component recipe ${this.name} does not produce a valid result!`);
            }
        }
    }

    get_quality_range(tier = 0) {
        const skill = skills[this.recipe_skill];
        //const quality = (150+(5*skill.current_level-skill.max_level)+(20*tier))/100;
        const quality = (80+(2*skill.current_level)+(10*tier))/100;
        //tier=工作台tier-部件tier
        //console.log(skill.current_level)
        return [Math.max(10,Math.round(25*(quality-0.15))*4), Math.max(10,Math.round(25*(quality+0.15))*4)];
    }

    get_quality_cap() {
        const skill = skills[this.recipe_skill];
        return Math.min(Math.round(100*(1+0.05*skill.current_level)),999);
    }

    get_quality(tier = 0) {
        const quality_range = this.get_quality_range(tier);
        return Math.min(Math.round(((quality_range[1]-quality_range[0])*Math.random()+quality_range[0])/4)*4, this.get_quality_cap());
    }
}

class EquipmentRecipe extends Recipe {
    constructor({
        name,
        id,
        components = [], //pair of component types; first letter not capitalized; blade-handle or internal-external
        is_unlocked = true, //TODO: change to false when unlocking is implemented
        result = null,
        recipe_skill = "Crafting",
        item_type, //Weapon/Armor/Shield
        //no recipe level, difficulty based on selected components
    }) {
        super({name, id, is_unlocked, recipe_type: "equipment", result, getResult: null, recipe_level: [1,1], recipe_skill, success_rate: [1,1]})
        this.components = components;
        
        this.item_type = item_type;
        this.getResult = function(component_1, component_2, station_tier = 1){
            const comp_quality_weighted = this.get_component_quality_weighted(component_1, component_2);
            let quality = this.get_quality(comp_quality_weighted, (station_tier-Math.max(component_1.component_tier, component_2.component_tier)) || 0);
            //return based on components used
            if(this.item_type === "Weapon") {
                return new Weapon(
                    {
                        components: {
                            head: component_1.id,
                            handle: component_2.id,
                        },
                        quality: quality,
                    }
                );
            } else if(this.item_type === "Armor") {
                return new Armor(
                    {
                        components: {
                            internal: component_1.id,
                            external: component_2.id,
                        },
                        quality: quality,
                    }
                );
            } else if(this.item_type === "Shield") {
                return new Shield(
                    {
                        components: {
                            shield_base: component_1.id,
                            handle: component_2.id,
                        },
                        quality: quality,
                    }
                );
            } else {
                throw new Error(`Recipe "${this.name}" has an incorrect item_type provided ("${this.item_type}")`);
            }
        }
    }

    get_quality_range(component_quality, tier = 0) {
        //const skill = skills[this.recipe_skill];
        const quality = component_quality
        return [Math.max(10,Math.round(quality-15)), Math.max(10,Math.round(quality+15))];
    }

    get_quality_cap() {
        const skill = skills[this.recipe_skill];
        return Math.min(Math.round(100*(1+0.05*skill.current_level)),999);
    }

    get_quality(component_quality, tier = 0) {
        const quality_range = this.get_quality_range(component_quality, tier);
        return Math.min(((quality_range[1]-quality_range[0])*Math.random()+quality_range[0]), this.get_quality_cap());
    }

    get_component_quality_weighted(component_1, component_2) {
        return (component_1.quality*(component_1.component_tier + 1) + component_2.quality*(component_2.component_tier + 1))/(component_1.component_tier+component_2.component_tier+2);
    }
}

function get_recipe_xp_value({category, subcategory, recipe_id, material_count, result_tier, selected_components, rarity_multiplier}) {
    //
    //for components: multiplied by material count (so every component of same tier is equally profitable to craft)
    //for equipment: based on component tier average
    if(!category || !subcategory || !recipe_id) {
        //shouldn't be possible to reach this
        throw new Error(`Tried to use a recipe but either category, subcategory, or recipe id was not passed: ${category} - ${subcategory} - ${recipe_id}`);
    }
    let exp_value = 8;
    const selected_recipe = recipes[category][subcategory][recipe_id];
    const skill_level = skills[selected_recipe.recipe_skill].current_level;
    if(!selected_recipe) {
        throw new Error(`Tried to use a recipe that doesn't exist: ${category} -> ${subcategory} -> ${recipe_id}`);
    }
    if(subcategory === "items" || recipe_subcategory === "items2") {
        exp_value = Math.max(exp_value,1.4*selected_recipe.recipe_level[1] * 2);
        //maybe scale with materials needed?
        
        if(selected_recipe.recipe_level[1] < skill_level) {
            exp_value *= 0.8 ** (skill_level - selected_recipe.recipe_level[1]);
        }
    } else if (subcategory === "components" || selected_recipe.recipe_type === "component") {
        const result_level = 8*result_tier;

        exp_value = Math.max(exp_value,result_tier * 4 * material_count);
        exp_value = Math.max(1,exp_value*(rarity_multiplier**0.5 - (skill_level/result_level))*rarity_multiplier);
    } else {
        const result_level = 8*Math.max(selected_components[0].component_tier,selected_components[1].component_tier);
        exp_value = Math.max(exp_value,(selected_components[0].component_tier+selected_components[1].component_tier) * 4);
        exp_value = Math.max(1,exp_value*(rarity_multiplier**0.5 - (skill_level/result_level))*rarity_multiplier);
    }

    return exp_value;
}
//weapon components
(()=>{
    forging_recipes.components["剑刃"] = new ComponentRecipe({
        name: "剑刃",
        materials: [
            {material_id: "铁锭", count: 2, result_id: "铁剑刃"}, 
            {material_id: "精钢锭", count: 2, result_id: "精钢剑刃"}, 
            {material_id: "紫铜锭", count: 2, result_id: "紫铜剑刃"}, 
            {material_id: "地宫金属锭", count: 2, result_id: "地宫剑刃"}, 
            {material_id: "暗影钢锭", count: 2, result_id: "暗影剑刃"}, 
            {material_id: "充能合金锭", count: 2, result_id: "充能剑刃"}, 
            {material_id: "脉冲合金锭", count: 2, result_id: "脉冲剑刃"}, 
            //未完待续
        ],
        item_type: "Component",
        recipe_skill: "Forging"
    });
    forging_recipes.components["剑柄"] = new ComponentRecipe({
        name: "剑柄",
        materials: [
            {material_id: "骨头", count: 2, result_id: "骨剑柄"}, 
            {material_id: "铜骨", count: 2, result_id: "铜骨剑柄"}, 
            {material_id: "润灵铜骨", count: 2, result_id: "改良剑柄"}, 
            {material_id: "活化柳木", count: 2, result_id: "柳木剑柄"}, 
            //未完待续
        ],
        item_type: "Component",
        recipe_skill: "Forging"
    });
    forging_recipes.components["三叉戟头"] = new ComponentRecipe({
        name: "三叉戟头",
        materials: [
            {material_id: "充能合金锭", count: 6, result_id: "充能戟头"}, 
            {material_id: "脉冲合金锭", count: 6, result_id: "脉冲戟头"}, 
            //未完待续
        ],
        item_type: "Component",
        recipe_skill: "Forging"
    });
})();

/*
//shield components
(()=>{
    crafting_recipes.components["Shield base"] = new ComponentRecipe({
        name: "Shield base",
        materials: [
            {material_id: "Processed rough wood", count: 6, result_id: "Crude wooden shield base"}, 
            {material_id: "Processed wood", count: 6, result_id: "Wooden shield base"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "shield base",
    });

    crafting_recipes.components["Shield handle"] = new ComponentRecipe({
        name: "Shield handle",
        materials: [
            {material_id: "Processed rough wood", count: 4, result_id: "Basic shield handle"}, 
            {material_id: "Processed wood", count: 4, result_id: "Wooden shield handle"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "shield handle",
    });

    forging_recipes.components["Shield base"] = new ComponentRecipe({
        name: "Shield base",
        materials: [
            {material_id: "Low quality iron ingot", count: 5, result_id: "Crude iron shield base"},
            {material_id: "Iron ingot", count: 5, result_id: "Iron shield base"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "shield base",
    });

})();
*/
//armor components
(()=>{
    forging_recipes.components["头部外甲"] = new ComponentRecipe({
        name: "头部外甲",
        materials: [
            {material_id: "铁锭", count: 3, result_id: "铁制头盔"}, 
            {material_id: "紫铜锭", count: 3, result_id: "紫铜头盔"}, 
            {material_id: "地宫金属锭", count: 3, result_id: "地宫头盔"}, 
            {material_id: "充能合金锭", count: 3, result_id: "充能头盔"}, 
            {material_id: "脉冲合金锭", count: 3, result_id: "脉冲头盔"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "helmet exterior",
    });

    crafting_recipes.components["头部内甲"] = new ComponentRecipe({
        name: "头部内甲",
        materials: [
            {material_id: "粘合织料", count: 3, result_id: "粘合帽子"},
            {material_id: "异兽皮", count: 3, result_id: "异兽帽子"},
            {material_id: "活性织料", count: 3, result_id: "活性帽子"},
            {material_id: "湛蓝芦苇", count: 3, result_id: "苇编帽子"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "helmet exterior",
    });
    forging_recipes.components["胸部外甲"] = new ComponentRecipe({
        name: "胸部外甲",
        materials: [
            {material_id: "铁锭", count: 4, result_id: "铁制胸甲"}, 
            {material_id: "紫铜锭", count: 4, result_id: "紫铜胸甲"}, 
            {material_id: "地宫金属锭", count: 4, result_id: "地宫胸甲"}, 
            {material_id: "充能合金锭", count: 4, result_id: "充能胸甲"}, 
            {material_id: "脉冲合金锭", count: 4, result_id: "脉冲胸甲"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "chestplate exterior",
    });

    crafting_recipes.components["胸部内甲"] = new ComponentRecipe({
        name: "胸部内甲",
        materials: [
            {material_id: "粘合织料", count: 4, result_id: "粘合背心"},
            {material_id: "异兽皮", count: 4, result_id: "异兽背心"},
            {material_id: "活性织料", count: 4, result_id: "活性背心"},
            {material_id: "湛蓝芦苇", count: 4, result_id: "苇编背心"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "chestplate exterior",
    });
    forging_recipes.components["腿部外甲"] = new ComponentRecipe({
        name: "腿部外甲",
        materials: [
            {material_id: "铁锭", count: 4, result_id: "铁制腿甲"}, 
            {material_id: "紫铜锭", count: 4, result_id: "紫铜腿甲"}, 
            {material_id: "地宫金属锭", count: 4, result_id: "地宫腿甲"}, 
            {material_id: "充能合金锭", count: 4, result_id: "充能腿甲"}, 
            {material_id: "脉冲合金锭", count: 4, result_id: "脉冲腿甲"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "leg armor exterior",
    });

    crafting_recipes.components["腿部内甲"] = new ComponentRecipe({
        name: "腿部内甲",
        materials: [
            {material_id: "粘合织料", count: 4, result_id: "粘合裤子"},
            {material_id: "异兽皮", count: 4, result_id: "异兽裤子"},
            {material_id: "活性织料", count: 4, result_id: "活性裤子"},
            {material_id: "湛蓝芦苇", count: 4, result_id: "苇编裤子"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "leg armor exterior",
    });
    
    forging_recipes.components["脚部外甲"] = new ComponentRecipe({
        name: "脚部外甲",
        materials: [
            {material_id: "铁锭", count: 2, result_id: "铁制战靴"}, 
            {material_id: "紫铜锭", count: 2, result_id: "紫铜战靴"}, 
            {material_id: "地宫金属锭", count: 2, result_id: "地宫战靴"}, 
            {material_id: "充能合金锭", count: 2, result_id: "充能战靴"}, 
            {material_id: "脉冲合金锭", count: 2, result_id: "脉冲战靴"},
        ],
        item_type: "Component",
        recipe_skill: "Forging",
        component_type: "shoes exterior",
    });

    crafting_recipes.components["脚部内甲"] = new ComponentRecipe({
        name: "脚部内甲",
        materials: [
            {material_id: "粘合织料", count: 2, result_id: "粘合袜子"},
            {material_id: "异兽皮", count: 2, result_id: "异兽袜子"},
            {material_id: "活性织料", count: 2, result_id: "活性袜子"},
            {material_id: "湛蓝芦苇", count: 2, result_id: "苇编袜子"},
        ],
        item_type: "Component",
        recipe_skill: "Crafting",
        component_type: "shoes exterior",
    });

})();

//equipment
(()=>{
    //full weapons
    crafting_recipes.equipment["剑"] = new EquipmentRecipe({
        name: "剑",
        components: ["long blade", "short handle"],
        item_type: "Weapon",
    });
    crafting_recipes.equipment["三叉戟"] = new EquipmentRecipe({
        name: "三叉戟",
        components: ["triple blade", "short handle"],
        item_type: "Weapon",
    });

    //full armor
    crafting_recipes.equipment["头盔"] = new EquipmentRecipe({
        name: "头盔",
        components: ["helmet interior", "helmet exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["胸甲"] = new EquipmentRecipe({
        name: "胸甲",
        components: ["chestplate interior", "chestplate exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["腿甲"] = new EquipmentRecipe({
        name: "腿甲",
        components: ["leg armor interior", "leg armor exterior"],
        item_type: "Armor",
    });
    crafting_recipes.equipment["战靴"] = new EquipmentRecipe({
        name: "战靴",
        components: ["shoes interior", "shoes exterior"],
        item_type: "Armor",
    });
})();
/*
//clothes (which is also equipment, but shhhh)
(()=>{
    crafting_recipes.equipment["Hat"] = new ComponentRecipe({
        name: "Hat",
        materials: [
            {material_id: "Piece of wolf leather", count: 3, result_id: "Leather hat"},
            {material_id: "Wool cloth", count: 3, result_id: "Wool hat"}
        ],
        item_type: "Armor",
        component_type: "helmet interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Shirt"] = new ComponentRecipe({
        name: "Shirt",
        materials: [
            {material_id: "Piece of wolf rat leather", count: 5, result_id: "Cheap leather vest"},
            {material_id: "Piece of wolf leather", count: 5, result_id: "Leather vest"},
            {material_id: "Wool cloth", count: 5, result_id: "Wool shirt"}
        ],
        item_type: "Armor",
        component_type: "chestplate interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Pants"] = new ComponentRecipe({
        name: "Pants",
        materials: [
            {material_id: "Piece of wolf rat leather", count: 3, result_id: "Cheap leather pants"},
            {material_id: "Piece of wolf leather", count: 3, result_id: "Leather pants"},
            {material_id: "Wool cloth", count: 3, result_id: "Wool pants"}
        ],
        item_type: "Armor",
        component_type: "leg armor interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Gloves"] = new ComponentRecipe({
        name: "Gloves",
        materials: [
            {material_id: "Piece of wolf leather", count: 2, result_id: "Leather gloves"},
            {material_id: "Wool cloth", count: 2, result_id: "Wool gloves"}
        ],
        item_type: "Armor",
        component_type: "glove interior",
        recipe_skill: "Crafting",
    });

    crafting_recipes.equipment["Shoes"] = new ComponentRecipe({
        name: "Shoes",
        materials: [
            {material_id: "Piece of wolf rat leather", count: 2, result_id: "Cheap leather shoes"},
            {material_id: "Piece of wolf leather", count: 2, result_id: "Leather shoes"}
        ],
        item_type: "Armor",
        component_type: "shoes interior",
        recipe_skill: "Crafting",
    });
    
})();

//materials
(function(){
    crafting_recipes.items["Piece of wolf rat leather"] = new ItemRecipe({
        name: "Piece of wolf rat leather",
        recipe_type: "material",
        materials: [{material_id: "Rat pelt", count: 8}], 
        result: {result_id: "Piece of wolf rat leather", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["Piece of wolf leather"] = new ItemRecipe({
        name: "Piece of wolf leather",
        recipe_type: "material",
        materials: [{material_id: "Wolf pelt", count: 8}], 
        result: {result_id: "Piece of wolf leather", count: 1},
        success_chance: [0.2,1],
        recipe_skill: "Crafting",
        recipe_level: [1,10],
    });
    crafting_recipes.items["Piece of boar leather"] = new ItemRecipe({
        name: "Piece of boar leather",
        recipe_type: "material",
        materials: [{material_id: "Boar hide", count: 8}],
        result: {result_id: "Piece of boar leather", count: 1},
        success_chance: [0.2,1],
        recipe_skill: "Crafting",
        recipe_level: [5,15],
    });
    crafting_recipes.items["Wool cloth"] = new ItemRecipe({
        name: "Wool cloth",
        recipe_type: "material",
        materials: [{material_id: "Wool", count: 5}], 
        result: {result_id: "Wool cloth", count: 1},
        success_chance: [0,1],
        recipe_skill: "Crafting",
        recipe_level: [5,15],
    });
    forging_recipes.items["Iron chainmail"] = new ItemRecipe({
        name: "Iron chainmail",
        recipe_type: "material",
        materials: [{material_id: "Iron ingot", count: 5}], 
        result: {result_id: "Iron chainmail", count: 1},
        success_chance: [0.1,1],
        recipe_skill: "Forging",
        recipe_level: [5,15],
    });

    crafting_recipes.items["Rat meat chunks"] = new ItemRecipe({
        name: "Rat meat chunks",
        recipe_type: "material",
        materials: [{material_id: "Rat tail", count: 8}], 
        result: {result_id: "Rat meat chunks", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Crafting",
    });

    smelting_recipes.items["Low quality iron ingot"] = new ItemRecipe({
        name: "Low quality iron ingot",
        recipe_type: "material",
        materials: [{material_id: "Low quality iron ore", count: 5}], 
        result: {result_id: "Low quality iron ingot", count: 1},
        success_chance: [0.4,1],
        recipe_level: [1,5],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items["Iron ingot"] = new ItemRecipe({
        name: "Iron ingot",
        recipe_type: "material",
        materials: [{material_id: "Iron ore", count: 5}], 
        result: {result_id: "Iron ingot", count: 1},
        success_chance: [0.1,1],
        recipe_level: [5,15],
        recipe_skill: "Smelting",
    });

    crafting_recipes.items["Processed rough wood"] = new ItemRecipe({
        name: "Processed rough wood",
        recipe_type: "material",
        materials: [{material_id: "Piece of rough wood", count: 5}], 
        result: {result_id: "Processed rough wood", count: 1},
        success_chance: [0.6,1],
        recipe_level: [1,5],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["Processed wood"] = new ItemRecipe({
        name: "Processed wood",
        recipe_type: "material",
        materials: [{material_id: "Piece of wood", count: 5}], 
        result: {result_id: "Processed wood", count: 1},
        success_chance: [0.2,1],
        recipe_level: [5,15],
        recipe_skill: "Crafting",
    });
})();

//consumables
(function(){
    alchemy_recipes.items["Weak healing powder"] = new ItemRecipe({
        name: "Weak healing powder",
        recipe_type: "usable",
        materials: [{material_id: "Golmoon leaf", count: 5}],
        result: {result_id: "Weak healing powder", count: 1},
        success_chance: [0.1,1],
        recipe_level: [1,10],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["Oneberry juice"] = new ItemRecipe({
        name: "Oneberry juice",
        recipe_type: "usable",
        materials: [{material_id: "Oneberry", count: 10},
                    {material_id: "Glass phial", count: 1},
        ],
        result: {result_id: "Oneberry juice", count: 1},
        success_chance: [0.1,1],
        recipe_level: [1,10],
        recipe_skill: "Alchemy",
    });
})();

*/
//NekoRPG 合成 ↓

//trinkets
(function(){
    crafting_recipes.items["宝石吊坠"] = new ItemRecipe({
        name: "宝石吊坠",
        id: "宝石吊坠",
        recipe_type: "items",
        materials: [{material_id: "宝石锭", count: 4},{material_id:"A1·能量核心",count:1}],
        result: {result_id: "宝石吊坠", count: 1},
        success_chance: [0.5,1],
        Q_able: true,
        recipe_level: [1,12],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["生命之眼"] = new ItemRecipe({
        name: "生命之眼",
        id: "生命之眼",
        recipe_type: "items",
        materials: [{material_id: "地宫金属锭", count: 20},{material_id:"A1·能量核心",count:10},{material_id:"巨型眼球",count:5}],
        result: {result_id: "生命之眼", count: 1},
        success_chance: [0.5,1],
        Q_able: true,
        recipe_level: [1,18],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["人造茸茸"] = new ItemRecipe({
        name: "人造茸茸",
        id: "人造茸茸",
        recipe_type: "items",
        materials: [{material_id: "流动凝胶", count: 20},{material_id:"大地级魂魄",count:10},{material_id:"A1·能量核心",count:5}],
        result: {result_id: "人造茸茸", count: 1},
        success_chance: [0.5,1],
        Q_able: true,
        recipe_level: [1,20],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["巨剑徽章"] = new ItemRecipe({
        name: "巨剑徽章",
        id: "巨剑徽章",
        recipe_type: "items",
        materials: [{material_id: "黑色刀币", count: 20},{material_id:"断剑",count:10},{material_id:"润灵铜骨",count:5}],
        result: {result_id: "巨剑徽章", count: 1},
        success_chance: [0.5,1],
        Q_able: true,
        recipe_level: [1,22],
        recipe_skill: "Crafting",
    });
    
    crafting_recipes.items["柳木注灵"] = new ItemRecipe({
        name: "柳木注灵",
        recipe_type: "material",
        materials: [{material_id: "百年柳木", count: 2},{material_id: "荒兽精华", count: 1},{material_id:"流动凝胶", count: 2}], 
        result: {result_id: "活化柳木", count: 2},
        success_chance: [0.5,1],
        recipe_level: [8,20],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["活性织料·改良(x15)"] = new ItemRecipe({
        name: "活性织料·改良(x15)",
        recipe_type: "material",
        materials: [{material_id: "霜炙皮草", count: 10},{material_id:"荒兽精华",count:1}],
        result: {result_id: "活性织料", count: 15},
        success_chance: [0.5,1],
        recipe_level: [20,21],
        recipe_skill: "Crafting",
    });
    crafting_recipes.items["水火徽章"] = new ItemRecipe({
        name: "水火徽章",
        id: "水火徽章",
        recipe_type: "items",
        materials: [{material_id: "水溶精华", count: 99},{material_id:"荒兽精华",count:99},{material_id:"充能合金锭",count:29}],
        result: {result_id: "水火徽章", count: 1},
        success_chance: [0.5,1],
        Q_able: true,
        recipe_level: [1,25],
        recipe_skill: "Crafting",
    });
})();
//熔炼配方

(function(){
    
    smelting_recipes.items["熔炼铁锭"] = new ItemRecipe({
        name: "熔炼铁锭",
        recipe_type: "material",
        materials: [{material_id: "金属残片", count: 3},{material_id: "魔力碎晶", count: 1}], 
        result: {result_id: "铁锭", count: 1},
        success_chance: [0.6,1],
        recipe_level: [0,5],
        recipe_skill: "Smelting",
    });
    //1-2
    
    smelting_recipes.items["熔炼精钢"] = new ItemRecipe({
        name: "熔炼精钢",
        recipe_type: "material",
        materials: [{material_id: "铁锭", count: 1},{material_id: "合金残片", count: 2},{material_id: "魔力碎晶", count: 3}], 
        result: {result_id: "精钢锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [2,7],
        recipe_skill: "Smelting",
    });

    smelting_recipes.items["熔炼紫铜"] = new ItemRecipe({
        name: "熔炼紫铜",
        recipe_type: "material",
        materials: [{material_id: "紫铜矿", count: 2},{material_id: "毒液", count: 1},{material_id:"煤炭", count: 1}], 
        result: {result_id: "紫铜锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [8,11],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items["地宫合金"] = new ItemRecipe({
        name: "地宫合金",
        recipe_type: "material",
        materials: [{material_id: "紫铜锭", count: 1},{material_id: "断剑", count: 3},{material_id:"A1·能量核心", count: 1}], 
        result: {result_id: "地宫金属锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [8,13],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items["锤炼宝石"] = new ItemRecipe({
        name: "锤炼宝石",
        recipe_type: "material",
        materials: [{material_id: "初始红宝石", count: 2},{material_id: "初始绿宝石", count: 4},{material_id: "高级黄宝石", count: 2}], 
        result: {result_id: "宝石锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [8,13],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items["暗影提炼"] = new ItemRecipe({
        name: "暗影提炼",
        recipe_type: "material",
        materials: [{material_id: "黑色刀币", count: 1},{material_id: "大地级魂魄", count: 1},{material_id:"A1·能量核心", count: 1}], 
        result: {result_id: "暗影钢锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [14,18],
        recipe_skill: "Smelting",
    });
    
    smelting_recipes.items2["充能合金·粗制"] = new ItemRecipe({
        name: "充能合金·粗制",
        recipe_type: "material",
        materials: [{material_id: "黑色刀币", count: 1},{material_id: "甲壳碎片", count: 4},{material_id:"A4·能量核心", count: 2}], 
        result: {result_id: "充能合金锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [14,20],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items2["充能合金·精制(x4)"] = new ItemRecipe({
        name: "充能合金·精制",
        recipe_type: "material",
        materials: [{material_id: "水溶精华", count: 1},{material_id: "甲壳碎片", count: 4},{material_id:"A4·能量核心", count: 1}], 
        result: {result_id: "充能合金锭", count: 4},
        success_chance: [0.5,1],
        recipe_level: [19,23],
        recipe_skill: "Smelting",
    });
    smelting_recipes.items2["脉冲合金"] = new ItemRecipe({
        name: "脉冲合金",
        recipe_type: "material",
        materials: [{material_id: "充能合金锭", count: 1},{material_id: "A4·能量核心", count: 2},{material_id:"浅蓝晶粉", count: 2}], 
        result: {result_id: "脉冲合金锭", count: 1},
        success_chance: [0.5,1],
        recipe_level: [19,27],
        recipe_skill: "Smelting",
    });
})();

(function(){
    
    cooking_recipes.items["微尘级·烤肉"] = new ItemRecipe({
        name: "微尘级·烤肉",
        recipe_type: "material",
        materials: [{material_id: "微尘·凶兽肉块", count: 1},{material_id: "魔力碎晶", count: 1}], 
        result: {result_id: "微尘·凶兽肉排", count: 1},
        success_chance: [0.5,1],
        recipe_level: [0,3],
        recipe_skill: "Cooking",
    });cooking_recipes.items["万物级·烤肉"] = new ItemRecipe({
        name: "万物级·烤肉",
        recipe_type: "material",
        materials: [{material_id: "万物·凶兽肉块", count: 1},{material_id: "魔力碎晶", count: 3}], 
        result: {result_id: "万物·凶兽肉排", count: 1},
        success_chance: [0.5,1],
        recipe_level: [2,5],
        recipe_skill: "Cooking",
    });
    cooking_recipes.items["潮汐级·烤肉"] = new ItemRecipe({
        name: "潮汐级·烤肉",
        recipe_type: "material",
        materials: [{material_id: "潮汐·凶兽肉块", count: 1},{material_id: "煤炭", count: 1}], 
        result: {result_id: "潮汐·凶兽肉排", count: 1},
        success_chance: [0.5,1],
        recipe_level: [5,8],
        recipe_skill: "Cooking",
    });
    cooking_recipes.items["大地级·烤肉"] = new ItemRecipe({
        name: "大地级·烤肉",
        recipe_type: "material",
        materials: [{material_id: "地宫·荒兽肉块", count: 1},{material_id: "A1·能量核心", count: 1}], 
        result: {result_id: "地宫·荒兽肉排", count: 1},
        success_chance: [0.5,1],
        recipe_level: [12,12],
        recipe_skill: "Cooking",
    });
    cooking_recipes.items["大地级·烤肉 II"] = new ItemRecipe({
        name: "大地级·烤肉 II",
        recipe_type: "material",
        materials: [{material_id: "森林·荒兽肉块", count: 1},{material_id: "A4·能量核心", count: 1}], 
        result: {result_id: "森林·荒兽肉排", count: 1},
        success_chance: [0.5,1],
        recipe_level: [17,17],
        recipe_skill: "Cooking",
    });
})();

//锻造[镐头]
(function(){
    
    forging_recipes.items["精钢镐"] = new ItemRecipe({
        name: "精钢镐",
        recipe_type: "material",
        materials: [{material_id: "精钢锭", count: 3},{material_id: "铜骨", count: 1}], 
        result: {result_id: "精钢镐", count: 1},
        success_chance: [0.5,1],
        recipe_level: [3,8],
        recipe_skill: "Forging",
    });
    forging_recipes.items["紫铜镐"] = new ItemRecipe({
        name: "紫铜镐",
        recipe_type: "material",
        materials: [{material_id: "紫铜锭", count: 3},{material_id: "润灵铜骨", count: 1}], 
        result: {result_id: "紫铜镐", count: 1},
        success_chance: [0.5,1],
        recipe_level: [6,11],
        recipe_skill: "Forging",
    });
    
    forging_recipes.items["暗影斧"] = new ItemRecipe({
        name: "暗影斧",
        recipe_type: "material",
        materials: [{material_id: "暗影钢锭", count: 3},{material_id: "地宫金属锭", count: 2}], 
        result: {result_id: "暗影斧", count: 1},
        success_chance: [0.5,1],
        recipe_level: [6,15],
        recipe_skill: "Forging",
    });
    forging_recipes.items["充能斧"] = new ItemRecipe({
        name: "充能斧",
        recipe_type: "material",
        materials: [{material_id: "充能合金锭", count: 3},{material_id: "活化柳木", count: 1}], 
        result: {result_id: "充能斧", count: 1},
        success_chance: [0.5,1],
        recipe_level: [6,19],
        recipe_skill: "Forging",
    });
})();


//炼金
(function(){
    alchemy_recipes.items["粘合织料"] = new ItemRecipe({
        name: "粘合织料",
        recipe_type: "material",
        materials: [{material_id: "凝胶", count: 1},{material_id: "飞蛾翅膀", count: 1}],
        result: {result_id: "粘合织料", count: 1},
        success_chance: [0.5,1],
        recipe_level: [1,2],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["润灵铜骨"] = new ItemRecipe({
        name: "铜骨注灵",
        recipe_type: "material",
        materials: [{material_id: "铜骨", count: 1},{material_id: "天蚕丝", count: 1},{material_id:"灵液",count:2}],
        result: {result_id: "润灵铜骨", count: 1},
        success_chance: [0.5,1],
        recipe_level: [8,12],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["提炼宝石"] = new ItemRecipe({
        name: "提炼宝石",
        recipe_type: "material",
        materials: [{material_id: "坚硬石块", count: 1},{material_id: "魔力碎晶", count: 1}], 
        result: {result_id: "初始黄宝石", count: 1},
        success_chance: [0.2,1],
        recipe_level: [0,6],
        recipe_skill: "Alchemy",
    });
    
    alchemy_recipes.items["精炼宝石 I"] = new ItemRecipe({
        name: "精炼宝石 I",
        recipe_type: "material",
        materials: [{material_id: "初始黄宝石", count: 5},{material_id: "魔力碎晶", count: 2}], 
        result: {result_id: "初始蓝宝石", count: 1},
        success_chance: [0.3,1],
        recipe_level: [4,8],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["精炼宝石 II"] = new ItemRecipe({
        name: "精炼宝石 II",
        recipe_type: "material",
        materials: [{material_id: "红色刀币", count: 3},{material_id: "魔力碎晶", count: 4}], 
        result: {result_id: "初始红宝石", count: 1},
        success_chance: [0.3,1],
        recipe_level: [6,10],
        recipe_skill: "Alchemy",
    });
    
    alchemy_recipes.items["地宫恢复药水"] = new ItemRecipe({
        name: "地宫恢复药水",
        recipe_type: "material",
        materials: [{material_id: "大地级魂魄", count: 1},{material_id: "巨型眼球", count: 1}], 
        result: {result_id: "地宫恢复药水", count: 1},
        success_chance: [0.3,1],
        recipe_level: [11,11],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["地宫狂暴药水"] = new ItemRecipe({
        name: "地宫狂暴药水",
        recipe_type: "material",
        materials: [{material_id: "大地级魂魄", count: 3},{material_id: "A1·能量核心", count: 1}], 
        result: {result_id: "地宫狂暴药水", count: 1},
        success_chance: [0.3,1],
        recipe_level: [12,12],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items["活性织料"] = new ItemRecipe({
        name: "活性织料",
        recipe_type: "material",
        materials: [{material_id: "流动凝胶", count: 1},{material_id: "霜炙皮草", count: 1},{material_id:"大地级魂魄",count:1}],
        result: {result_id: "活性织料", count: 1},
        success_chance: [0.5,1],
        recipe_level: [20,20],
        recipe_skill: "Alchemy",
    });

    
    alchemy_recipes.items2["炼金药剂-魔攻"] = new ItemRecipe({
        name: "炼金药剂-魔攻",
        recipe_type: "material",
        materials: [{material_id: "荒兽精华", count: 20},{material_id: "水溶精华", count: 20},{material_id: "A4·能量核心",count:40}], 
        result: {result_id: "A9·魔攻药剂", count: 1},
        success_chance: [0.3,1],
        recipe_level: [30,33],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items2["炼金药剂-回风"] = new ItemRecipe({
        name: "炼金药剂-回风",
        recipe_type: "material",
        materials: [{material_id: "荒兽精华", count: 20},{material_id: "水溶精华", count: 20},{material_id: "A4·能量核心",count:40}], 
        result: {result_id: "A9·回风药剂", count: 1},
        success_chance: [0.3,1],
        recipe_level: [30,33],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items2["炼金药剂-牵制"] = new ItemRecipe({
        name: "炼金药剂-牵制",
        recipe_type: "material",
        materials: [{material_id: "荒兽精华", count: 20},{material_id: "水溶精华", count: 20},{material_id: "A4·能量核心",count:40}], 
        result: {result_id: "A9·牵制药剂", count: 1},
        success_chance: [0.3,1],
        recipe_level: [30,33],
        recipe_skill: "Alchemy",
    });
    alchemy_recipes.items2["炼金药剂-坚固"] = new ItemRecipe({
        name: "炼金药剂-坚固",
        recipe_type: "material",
        materials: [{material_id: "荒兽精华", count: 20},{material_id: "水溶精华", count: 20},{material_id: "A4·能量核心",count:40}], 
        result: {result_id: "A9·坚固药剂", count: 1},
        success_chance: [0.3,1],
        recipe_level: [30,33],
        recipe_skill: "Alchemy",
    });
    
    alchemy_recipes.items2["湛蓝芦苇"] = new ItemRecipe({
        name: "湛蓝芦苇",
        recipe_type: "material",
        materials: [{material_id: "水溶精华", count: 1},{material_id: "秘境芦苇", count: 1}],
        result: {result_id: "湛蓝芦苇", count: 1},
        success_chance: [0.5,1],
        recipe_level: [26,29],
        recipe_skill: "Alchemy",
    });


    
})();

const recipes = {
    crafting: crafting_recipes, 
    cooking: cooking_recipes, 
    smelting: smelting_recipes, 
    forging: forging_recipes, 
    alchemy: alchemy_recipes
}

export {recipes, get_recipe_xp_value}

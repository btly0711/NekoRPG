"use strict";

/*
    item_templates contain some predefined equipment for easier access (instead of having to create them with proper components each time)

    equippable are unstackable, other items stack

    item quality translates into rarity, but also provides another multiplier on top of quality multiplier, starting at uncommon
            quality     rarity         color      additional_multiplier
            0-49%       trash          gray       x1
            50-99%      common         white      x1
            100-129%    uncommon       green      x1.1
            130-159%    rare           blue       x1.3
            160-199%    epic           purple     x1.6
            200-246%    legendary      orange     x2
            247-250%    mythical       ????       x2.5

            quality affects only attack/defense/max block, while additional multiplier affects all positive stats 
            (i.e flat bonuses over 0 and multiplicative bonuses over 1)

    basic idea for weapons:

        short blades (daggers/spears) are the fastest but also the weakest, +the most crit rate and crit damage
        blunt heads (blunt weapons) have highest damage, but also lower attack speed
        axe heads have a bit less damage, but a bit less attack speed penalty
        long blades (swords/spears?) have average damage and average attack speed

        long handles (spears) have higher attack multiplier and lower attack speed (so they counter the effects of the short blades)
        medium handles (axes/blunt weapons) have them average
        short handles have lowest attack multiplier
        
        so, as a result, attack damage goes blunt > axe > spear > sword > dagger
        and attack speed goes               dagger > sword > spear > axe > blunt
        which kinda makes spears very average, but they also get bonus crit so whatever
*/

import { character } from "./character.js";
import { round_item_price } from "./misc.js";

const rarity_multipliers = {
    trash: 1, //low quality alone makes these so bad that no additional nerf should be needed
    common: 1,
    uncommon: 1.1,
    rare: 1.25,
    epic: 1.4,
    legendary: 1.6,
    mythical: 2.0,
};

const item_templates = {};

let loot_sold_count = {};

function setLootSoldCount(data) {
    loot_sold_count = data;
}

function recoverItemPrices(count=1) {
    Object.keys(loot_sold_count).forEach(item_name => {

        if(!item_templates[item_name].price_recovers) {
            return;
        }

        loot_sold_count[item_name].recovered += count;
        
        if(loot_sold_count[item_name].recovered > loot_sold_count[item_name].sold) {
            loot_sold_count[item_name].recovered = loot_sold_count[item_name].sold;
        }
    })
}

function getLootPriceModifier(value, how_many_sold) {
    //let modifier = 1;
    // if(how_many_sold >= 999) {
    //     modifier = 0.1;
    // } else if(how_many_sold) {
    //     modifier = modifier * 111/(111+how_many_sold);
    // }
    // 哪个天才想出来卖东西导致降价的？
    // 是什么把你变成这样的 史莱姆牧场吗
    return value;
}

/**
 * 
 * @param {Number} value
 * @param {Number} start_count 
 * @param {Number} how_many_to_sell 
 * @returns 
 */
function getLootPriceModifierMultiple(value, start_count, how_many_to_sell) {
    let sum = 0;
    for(let i = start_count; i < start_count+how_many_to_sell; i++) {
        /*
        rounding is necessary to make it be a proper fraction of the value
        otherwise, there might be cases where trading too much of an item results in small deviation from what it should be
        */
        sum += value;
    }
    return sum;
}

function getArmorSlot(internal) {
    let equip_slot;
    if(item_templates[internal].component_type === "helmet interior") {
        equip_slot = "head";
    } else if(item_templates[internal].component_type === "chestplate interior") {
        equip_slot = "torso";
    } else if(item_templates[internal].component_type === "leg armor interior") {
        equip_slot = "legs";
    } else if(item_templates[internal].component_type === "glove interior") {
        equip_slot = "arms";
    } else if(item_templates[internal].component_type === "shoes interior") {
        equip_slot = "feet";
    } else {
        console.error(`Component type "${item_templates[internal].component_type}" doesn't correspond to any armor slot!`);
        return null;
    }
    return equip_slot;
}

function getItemRarity(quality) {
    let rarity;
    if(quality < 50) rarity =  "trash";
    else if(quality < 100) rarity = "common";
    else if(quality < 130) rarity = "uncommon";
    else if(quality < 160) rarity = "rare";
    else if(quality < 200) rarity = "epic";
    else if(quality < 246) rarity = "legendary";
    else rarity = "mythical";
    
    return rarity;
}

function getEquipmentValue(components, quality) {
    let value = 0;
    Object.values(components).forEach(component => {
        value += item_templates[component].value;
    });
    return round_item_price(value * (quality/100 ) * rarity_multipliers[getItemRarity(quality)]);
}

class Item {
    constructor({name,
                description,
                value = 0, 
                gem_value = 0,
                E_value = 0,
                C_value = 0,
                tags = {},
                id = null,
                image = "",
                })
    {
        this.name = name; 
        this.description = description;
        this.saturates_market = false;
        this.id = id;
        this.image = image;
        /**
         * Use .getValue() instead of this
         */
        this.value = value;
        this.gem_value = gem_value;
        this.E_value = E_value;//experience
        this.C_value = C_value;//cap ingoring
        this.tags = tags;
        this.tags["item"] = true;
    }

    getInventoryKey() {
        if(!this.inventory_key) {
            this.inventory_key = this.createInventoryKey();
        }
        return this.inventory_key;
    }

    createInventoryKey() {
        const key = {};

        if(!this.components) {
            key.id = this.id;
        } else {
            key.components = {};
            Object.keys(this.components).forEach(component => {
                key.components[component] = this.components[component];
            });
        }
        if(this.quality) {
            key.quality = this.quality;
        }
        return JSON.stringify(key);
    }

    getValue() {
        return round_item_price(this.value);
    }

    getBaseValue() {
        return this.value;
    }

    getValueOfMultiple({additional_count_of_sold = 0, count}) {
        return round_item_price(this.value) * count;
    }

    getName() {
        return this.name;
    }
    
    getImage() {
        return this.image;
    }

    getDescription() {
        return this.description;
    }
}

class OtherItem extends Item {
    constructor(item_data) {
        super(item_data);
        this.item_type = "OTHER";
        this.stackable = true;
        this.saturates_market = item_data.saturates_market;
        this.price_recovers = item_data.price_recovers;
    }
}

class Material extends OtherItem {
    constructor(item_data) {
        super(item_data);
        this.item_type = "MATERIAL";
        this.saturates_market = true;
        this.price_recovers = true;
        this.material_type = item_data.material_type;
        this.tags["material"] = true;
    }
}


class Loot extends OtherItem {
    constructor(item_data) {
        super(item_data);
        this.item_type = "LOOT";
        this.saturates_market = true;
        this.price_recovers = true;
        this.material_type = item_data.material_type;
        this.tags["loot"] = true;
    }
}


class ItemComponent extends Item {
    constructor(item_data) {
        super(item_data);
        this.item_type = "COMPONENT";
        this.stackable = false;
        this.component_tier = item_data.component_tier || 0;
        this.stats = item_data.stats || {};
        this.tags["equipment component"] = true;
        this.quality = Math.round(item_data.quality) || 100;
    }
    getRarity(quality){
        if(!quality) {
            if(!this.rarity) {
                this.rarity = getItemRarity(this.quality);
            }
            return this.rarity;
        } else {
            return getItemRarity(quality);
        }

    }

    calculateRarity(quality) {
        let rarity;
        if(quality < 50) rarity =  "trash";
        else if(quality < 100) rarity = "common";
        else if(quality < 130) rarity = "uncommon";
        else if(quality < 160) rarity = "rare";
        else if(quality < 200) rarity = "epic";
        else if(quality < 246) rarity = "legendary";
        else rarity = "mythical";
        
        return rarity;
    }

    getStats() {
        return this.stats;
    }

    getValue(quality) {
        return round_item_price(this.value * (quality/100 || this.quality/100));
    } 
}

class WeaponComponent extends ItemComponent {
    constructor(item_data) {
        super(item_data);
        if(item_data.component_type !== "axe head" && item_data.component_type !== "hammer head"
        && item_data.component_type !== "short blade" && item_data.component_type !== "long blade"
        && item_data.component_type !== "short handle" && item_data.component_type !== "long handle"
        && item_data.component_type !== "medium handle" && item_data.component_type !== "triple blade") {
            throw new Error(`No such weapon component type as ${item_data.component_type}`);
        }
        this.component_type = item_data.component_type;
        //"short blade", "long blade", "axe blade", "hammer blade" for heads; "short handle", "medium handle", "long handle" for handles

        this.attack_value = item_data.attack_value || 0; //can skip this for weapon handles
        if(item_data.component_type === "short handle"){
            this.attack_multiplier = 1;
        } else if(item_data.component_type === "medium handle"){
            this.attack_multiplier = 1;
        } else if(item_data.component_type === "long handle"){
            this.attack_multiplier = 1.5;
        } else {
            this.attack_multiplier = 1;
        }

        this.name_prefix = item_data.name_prefix; //to create a name of an item, e.g. "Sharp iron" used to create spear results in "Sharp iron spear"

        this.tags["weapon component"] = true;
        this.tags["component"] = true;
    }
}

class ShieldComponent extends ItemComponent {
    constructor(item_data) {
        super(item_data);
        if(item_data.component_type !== "shield base" && item_data.component_type !== "shield handle") {
            throw new Error(`No such shield component type as ${item_data.component_type}`);
        }
        this.component_type = item_data.component_type;

        //properties below only matter for shield type component
        this.shield_strength = item_data.shield_strength; 
        this.shield_name = item_data.shield_name || item_data.name;

        this.tags["shield component"] = true;
        this.tags["component"] = true;
    }
}

class ArmorComponent extends ItemComponent {
    constructor(item_data) {
        super(item_data);
        if(item_data.component_type !== "helmet interior" && item_data.component_type !== "helmet exterior"
        && item_data.component_type !== "chestplate interior" && item_data.component_type !== "chestplate exterior"
        && item_data.component_type !== "leg armor interior" && item_data.component_type !== "leg armor exterior"
        && item_data.component_type !== "glove interior" && item_data.component_type !== "glove exterior"
        && item_data.component_type !== "shoes interior" && item_data.component_type !== "shoes exterior") {

            throw new Error(`No such armor component type as ${item_data.component_type}`);
        }
        this.component_type = item_data.component_type;
        this.defense_value = item_data.defense_value;

        this.stats = item_data.stats || {};

        this.equip_slot = item_data.equip_slot;

        //only used with external elements
        this.full_armor_name = item_data.full_armor_name;

        //only used with internal elements
        this.armor_name = item_data.armor_name;

        //only used with external elements; name_prefix/name_suffix are used only if full_armor_name is not provided
        this.name_prefix = item_data.name_prefix;
        this.name_suffix = item_data.name_suffix;

        this.tags["armor component"] = true;
        this.tags["component"] = true;
    }
}

class UsableItem extends Item {
    constructor(item_data) {
        super(item_data);
        this.item_type = "USABLE";
        this.stackable = true;
        this.effects = item_data.effects || {};

        this.tags["usable"] = true;
    }
}

class Equippable extends Item {
    constructor(item_data) {
        super(item_data);
        this.item_type = "EQUIPPABLE";
        this.stackable = false;
        this.components = {};
        this.bonus_skill_levels = item_data.bonus_skill_levels || {};

        this.quality = Math.round(item_data.quality) || 100;

        this.tags["equippable"] = true;
    }

    getValue(quality) {
        return round_item_price(this.value * (quality || this.quality));
    } 

    getRarity(quality){
        if(!quality) {
            if(!this.rarity) {
                this.rarity = getItemRarity(this.quality);
            }
            return this.rarity;
        } else {
            return getItemRarity(quality);
        }

    }

    getStats(quality){
        if(!quality) {
            if(!this.stats) {
                this.stats = this.calculateStats(this.quality);
            }
            return this.stats;
        } else {
            return this.calculateStats(quality);
        }
    }

    calculateStats(quality){
        const stats = {};
        if(this.components) {

            //iterate over components
            const components = Object.values(this.components).map(comp => item_templates[comp]).filter(comp => comp);
            for(let i = 0; i < components.length; i++) {
                Object.keys(components[i].stats).forEach(stat => {
                    if(!stats[stat]) {
                        stats[stat] = {};
                    }

                    // if(stat === "defense" || stat === "attack_power") { //skip it, it's to be added to the basic defense/attack instead
                    //     return;
                    // }

                    if(components[i].stats[stat].multiplier) {
                        stats[stat].multiplier = (stats[stat].multiplier || 1) * components[i].stats[stat].multiplier;
                    }
                    if(components[i].stats[stat].flat) {
                        stats[stat].flat = (stats[stat].flat || 0) + components[i].stats[stat].flat;
                    }
                })
            }

            //iterate over stats and apply rarity bonus if possible
            Object.keys(stats).forEach(stat => {
                if(stats[stat].multiplier){
                    if(stats[stat].multiplier >= 1) {
                        stats[stat].multiplier = Math.round(100 * (1 + (stats[stat].multiplier - 1) * rarity_multipliers[this.getRarity(quality)]))/100;
                    } else {
                        stats[stat].multiplier = Math.round(100 * stats[stat].multiplier)/100;
                    }
                }

                if(stats[stat].flat){
                    if(stats[stat].flat > 0) {
                        stats[stat].flat = Math.round(100 * stats[stat].flat * rarity_multipliers[this.getRarity(quality)])/100;
                    } else {
                        stats[stat].flat = Math.round(100 * stats[stat].flat)/100;
                    }
                }
            });
        }

        return stats;
    }
    
    getBonusSkillLevels() {
        return this.bonus_skill_levels;
    }
}

class Artifact extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.components = undefined;
        this.equip_slot = "artifact";
        this.stats = item_data.stats;

        this.tags["artifact"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getValue() {
        return this.value;
    } 

    getStats(){
        return this.stats;
    }
}

class Props extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.components = undefined;
        this.equip_slot = "props";
        this.stats = item_data.stats;

        this.tags["props"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getValue() {
        return this.value;
    } 

    getStats(){
        return this.stats;
    }
}
class Method extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.components = undefined;
        this.equip_slot = "method";
        this.stats = item_data.stats;

        this.tags["method"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getValue() {
        return this.value;
    } 

    getStats(){
        return this.stats;
    }
}
class Special extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.components = undefined;
        this.equip_slot = "special";
        this.stats = item_data.stats;

        this.tags["special"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getValue() {
        return this.value;
    } 

    getStats(){
        return this.stats;
    }
}
class Realm extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.components = undefined;
        this.equip_slot = "realm";
        this.stats = item_data.stats;

        this.tags["realm"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getValue() {
        return this.value;
    } 

    getStats(){
        return this.stats;
    }
}

class Tool extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.equip_slot = item_data.equip_slot; //tool type is same as equip slot (axe/pickaxe/herb sickle)
        this.components = undefined;
        this.tags["tool"] = true;
        this.tags[this.equip_slot] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }
    getStats() {
        return {};
    }

    getValue() {
        return this.value;
    } 
}

class Shield extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.equip_slot = "off-hand";
        this.offhand_type = "shield"; //not like there's any other option

        if(!item_templates[item_data.components.shield_base]) {
            throw new Error(`No such shield base component as: ${item_data.components.shield_base}`);
        }
        this.components.shield_base = item_data.components.shield_base; //only the name

        if(item_data.components.handle && !item_templates[item_data.components.handle]) {
            throw new Error(`No such shield handle component as: ${item_data.components.handle}`);
        }
        this.components.handle = item_data.components.handle; //only the name
        this.tags["shield"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getShieldStrength(quality) {
        if(!quality) {
            if(!this.shield_strength) {
                this.shield_strength = this.calculateShieldStrength(this.quality);
            }
            return this.shield_strength;
        } else {
            return this.calculateShieldStrength(quality);
        }
    }

    calculateShieldStrength(quality) {
        return Math.round(10 * Math.ceil(item_templates[this.components.shield_base].shield_strength * (quality/100) * rarity_multipliers[this.getRarity(quality)]))/10;
    }

    getName() {
        return item_templates[this.components.shield_base].shield_name;
    }

    getValue(quality) {
        if(!this.value) {
            //value of shield base + value of handle, both multiplied by quality and rarity
            this.value = (item_templates[this.components.shield_base].value + item_templates[this.components.handle].value)
                                  * (quality/100 || this.quality/100) * rarity_multipliers[this.getRarity(quality)];
        }
        return round_item_price(this.value);
    } 
}

class Armor extends Equippable {
    /*
        can be componentless, effectively being an equippable internal part

        naming convention:
        if full_armor_name in external
            then full_armor_name
        else use prefix and suffix on internal element
    */
   /**
    * Takes either {components} or {stats}, with {components} having higher priority. Lack of {components} assumes item is a wearable internal part (clothing)
    * @param {*} item_data 
    */
    constructor(item_data) {
        super(item_data);
        
        if(item_data.components) {
            if(!item_templates[item_data.components.internal]) {
                throw new Error(`No such internal armor element as: ${item_data.components.internal}`);
            }

            this.components.internal = item_data.components.internal; //only the name
            this.components.external = item_data.components.external; //only the name
            if(item_templates[this.components.internal].component_type === "helmet interior") {
                this.equip_slot = "head";
            } else if(item_templates[this.components.internal].component_type === "chestplate interior") {
                this.equip_slot = "torso";
            } else if(item_templates[this.components.internal].component_type === "leg armor interior") {
                this.equip_slot = "legs";
            } else if(item_templates[this.components.internal].component_type === "glove interior") {
                this.equip_slot = "arms";
            } else if(item_templates[this.components.internal].component_type === "shoes interior") {
                this.equip_slot = "feet";
            } else {
                throw new Error(`Component type "${item_templates[this.components.internal].component_type}" doesn't correspond to any armor slot!`);
            }
            if(item_data.external && !item_templates[item_data.external]) {
                throw new Error(`No such external armor element as: ${item_data.components.external}`);
            }
            
        } else { 
            this.tags["armor component"] = true;
            this.tags["clothing"] = true;
            this.stats = item_data.stats || {};
            delete this.components;
            
            if(!item_data.name) {
                throw new Error(`Component-less item needs to be provided a name!`);
            }
            this.name = item_data.name;
            if(!item_data.value) {
                throw new Error(`Component-less item "${this.getName()}" needs to be provided a monetary value!`);
            }

            this.component_type = item_data.component_type;
            this.value = item_data.value;
            this.component_tier = item_data.component_tier || 0;
            this.base_defense = item_data.base_defense;

            //console.log(this);
            if(item_data.component_type === "helmet interior") {
                this.equip_slot = "head";
            } else if(item_data.component_type === "chestplate interior") {
                this.equip_slot = "torso";
            } else if(item_data.component_type === "leg armor interior") {
                this.equip_slot = "legs";
            } else if(item_data.component_type === "glove interior") {
                this.equip_slot = "arms";
            } else if(item_data.component_type === "shoes interior") {
                this.equip_slot = "feet";
            } else if(this.tags.method){
                this.equip_slot = "method";
            } else if(this.tags.realm){
                this.equip_slot = "realm";
            } else if(this.tags.special){
                this.equip_slot = "special";
            }
            else {
                this.equip_slot = "props";

                //throw new Error(`Component type "${item_data.component_type}" doesn't correspond to any armor slot!`);
            }
        }

        this.tags["armor"] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getDefense(quality) {
        if(!quality) {
            if(!this.defense_value) {
                this.defense_value = this.calculateDefense(this.quality);
            }
            return this.defense_value;
        } else {
            return this.calculateDefense(quality);
        }
    }
    calculateDefense(quality) {
        if(this.components) {
            return Math.ceil(((item_templates[this.components.internal].defense_value || item_templates[this.components.internal].base_defense ||0) + 
                                        (item_templates[this.components.external]?.defense_value || 0 )) 
                                        * (quality/100 || this.quality/100) * rarity_multipliers[this.getRarity(quality || this.quality)]
            )
        } else {
            return Math.ceil((this.base_defense || 0)  * (quality/100 || this.quality/100) * rarity_multipliers[this.getRarity(quality || this.quality)]);
        }
    }

    getValue(quality) {
        
        if(this.components) {
            //value of internal + value of external (if present), both multiplied by quality and rarity
            return round_item_price((item_templates[this.components.internal].value + (item_templates[this.components.external]?.value || 0))
                            * (quality/100 || this.quality/100) * rarity_multipliers[this.getRarity(quality)]);
        } else {
            return round_item_price(item_templates[this.id].value * (quality/100 || this.quality/100) * rarity_multipliers[this.getRarity(quality)]);
        }
    } 

    getName() {
        /*
        no external => name after internal.armor_name
        external with full_armor_name => use full_armor_name
        otherwise => prefix + internal + suffix
        */

        if(!this.name) {
            if(!this.components.external) {
                this.name = item_templates[this.components.internal].armor_name;
            } else {
                if(item_templates[this.components.external].full_armor_name) {
                    this.name = item_templates[this.components.external].full_armor_name;
                } else {
                    this.name = (item_templates[this.components.external].name_prefix || '') + " " + item_templates[this.components.internal].armor_name.toLowerCase() + " " + (item_templates[this.components.external].name_suffix || '');
                }
            }
        }

        return this.name;
    }
}

class Weapon extends Equippable {
    constructor(item_data) {
        super(item_data);
        this.equip_slot = "weapon";

        if(!item_templates[item_data.components.head]) {
            throw new Error(`No such weapon head as: ${item_data.components.head}`);
        }
        this.components.head = item_data.components.head; //only the name

        if(!item_templates[item_data.components.handle]) {
            throw new Error(`No such weapon handle as: ${item_data.components.handle}`);
        }
        this.components.handle = item_data.components.handle; //only the name

        if(item_templates[this.components.handle].component_type === "long handle" 
        && (item_templates[this.components.head].component_type === "short blade" || item_templates[this.components.head].component_type === "long blade")) {
            //long handle + short/long blade = spear
            this.weapon_type = "spear";
        } else if(item_templates[this.components.handle].component_type === "medium handle" 
        && item_templates[this.components.head].component_type === "axe head") {
            //medium handle + axe head = axe
            this.weapon_type = "axe";
        } else if(item_templates[this.components.handle].component_type === "medium handle" 
        && item_templates[this.components.head].component_type === "hammer head") {
            //medium handle + hammer head = hammer
            this.weapon_type = "hammer";
        } else if(item_templates[this.components.handle].component_type === "short handle" 
        && item_templates[this.components.head].component_type === "short blade") {
            //short handle + short blade = dagger
            this.weapon_type = "dagger";
        } else if(item_templates[this.components.handle].component_type === "short handle" 
        && item_templates[this.components.head].component_type === "long blade") {
            //short handle + long blade = sword
            this.weapon_type = "sword";
        } else if(item_templates[this.components.handle].component_type === "short handle" 
        && item_templates[this.components.head].component_type === "triple blade") {
            //short handle + triple blade = trident
            this.weapon_type = "trident";
        } else {
            throw new Error(`Combination of elements of types ${item_templates[this.components.handle].component_type} and ${item_templates[this.components.head].component_type} does not exist!`);
        }

        this.tags["weapon"] = true;
        this.tags[this.weapon_type] = true;
        if(!this.id) {
            this.id = this.getName();
        }
    }

    getAttack(quality){
        if(!quality) {
            if(!this.attack_power) {
                this.attack_power = this.calculateAttackPower(this.quality);
            }
            return this.attack_power;
        } else {
            return this.calculateAttackPower(quality);
        }
    }

    calculateAttackPower(quality) {
        return Math.ceil(
            (item_templates[this.components.head].attack_value + item_templates[this.components.handle].attack_value)
            * item_templates[this.components.head].attack_multiplier * item_templates[this.components.handle].attack_multiplier
            * (item_templates[this.components.head].stats?.attack_power?.multiplier || 1) * (item_templates[this.components.handle].stats?.attack_power?.multiplier || 1)
            * (quality/100) * rarity_multipliers[this.getRarity(quality)]
        );
    }

    getValue(quality) {
        if(!this.value) {
            //value of handle + value of head, both multiplied by quality and rarity
            this.value = (item_templates[this.components.handle].value + item_templates[this.components.head].value) * (quality/100 || this.quality/100) * rarity_multipliers[this.getRarity(quality)]
        }
        return round_item_price(this.value);
    } 

    getName() {
        let WTM = {"sword":"剑","trident":"三叉戟","21":"22","31":"32"}
        return `${item_templates[this.components.head].name_prefix} ${this.weapon_type === "hammer" ? "战锤" : WTM[this.weapon_type]}`;
    }
}

//////////////////////////////
//////////////////////////////
//////////////////////////////
class BookData{
    constructor({
        required_time = 1,
        required_skills = {literacy: 0},
        literacy_xp_rate = 1,
        finish_reward = {},
        rewards = {},
    }) {
        this.required_time = required_time;
        this.accumulated_time = 0;
        this.required_skills = required_skills;
        this.literacy_xp_rate = literacy_xp_rate;
        this.finish_reward = finish_reward;
        this.is_finished = false;
        this.rewards = rewards;
    }
}

const book_stats = {};

class Book extends Item {
    constructor(item_data) {
        super(item_data);
        this.stackable = true;
        this.item_type = "BOOK";
        this.name = item_data.name;

        this.tags["book"] = true;
    }

    /**
     * 
     * @returns {Number} total time needed to read the book
     */
    getReadingTime() {
        //maybe make it go faster with literacy skill level?
        let {required_time} = book_stats[this.name];
        return required_time;
    }

    /**
     * 
     * @returns {Number} remaining time needed to read the book (total time minus accumulated time)
     */
    getRemainingTime() {
        let remaining_time = Math.max(book_stats[this.name].required_time - book_stats[this.name].accumulated_time, 0);
        return remaining_time;
    }

    addProgress(time = 1) {
        book_stats[this.name].accumulated_time += time;
        if(book_stats[this.name].accumulated_time >= book_stats[this.name].required_time) {
            this.setAsFinished();
        }
    }

    setAsFinished() {
        book_stats[this.name].is_finished = true;
        book_stats[this.name].accumulated_time = book_stats[this.name].required_time;
        character.stats.add_book_bonus(book_stats[this.name].rewards);
    }
}

/**
 * @param {*} item_data 
 * @returns item of proper type, created with item_data
 */
function getItem(item_data) {
    switch(item_data.item_type) {
        case "EQUIPPABLE":
            switch(item_data.equip_slot) {
                case "weapon":
                    return new Weapon(item_data);
                case "off-hand":
                    return new Shield(item_data);
                case "artifact":
                    return new Artifact(item_data);
                case "axe":
                case "pickaxe":
                case "sickle":
                    return new Tool(item_data);
                default:
                    return new Armor(item_data);
            }
        case "USABLE":
            return new UsableItem(item_data);
        case "BOOK":
            return new Book(item_data);
        case "OTHER":
            return new OtherItem(item_data);
        case "COMPONENT":
            if(item_data.tags["weapon component"]) 
                return new WeaponComponent(item_data);
            else if(item_data.tags["armor component"]) 
                return new ArmorComponent(item_data);
            else if(item_data.tags["shield component"]) 
                return new ShieldComponent(item_data);
            else throw new Error(`Item ${item_data.name} has a wrong component type`);
        case "MATERIAL":
            return new Material(item_data);
        case "LOOT":
            return new Loot(item_data);
        default:
            return new OtherItem(item_data);
            //throw new Error(`Wrong item type: ${item_data.item_type} , item: ${item_data}`);
    }
}

//book stats
book_stats["ABC for kids"] = new BookData({
    required_time: 120,
    literacy_xp_rate: 1,
    rewards: {
        xp_multipliers: {
            all: 1.1,
        }
    },
});

book_stats["Old combat manual"] = new BookData({
    required_time: 320,
    literacy_xp_rate: 1,
    rewards: {
        xp_multipliers: {
            Combat: 1.2,
        }
    },
});

book_stats["Twist liek a snek"] = new BookData({
    required_time: 320,
    literacy_xp_rate: 1,
    rewards: {
        xp_multipliers: {
            Evasion: 1.2,
        }
    },
});

//books
item_templates["ABC for kids"] = new Book({
    name: "ABC for kids",
    description: "The simplest book on the market",
    value: 100,
});

item_templates["Old combat manual"] = new Book({
    name: "Old combat manual",
    description: "Old book about combat, worn and outdated, but might still contain something useful",
    value: 200,
});

item_templates["Twist liek a snek"] = new Book({
    name: "Twist liek a snek",
    description: "This book has a terrible grammar, seemingly written by some uneducated bandit, but despite that it quite well details how to properly evade attacks.",
    value: 200,
});


//miscellaneous and loot:
(function(){
    item_templates["Rat fang"] = new OtherItem({
        name: "Rat fang", 
        description: "Fang of a huge rat, not very sharp, but can still pierce a human skin if enough force is applied", 
        value: 8,
        saturates_market: true,
        price_recovers: true,
    });

    item_templates["Wolf fang"] = new OtherItem({
        name: "Wolf fang", 
        description: "Fang of a wild wolf. Somewhat sharp, still not very useful. Maybe if it had a bit better quality...", 
        value: 12,
        saturates_market: true,
        price_recovers: true,
    });

    item_templates["Rat meat chunks"] = new OtherItem({
        name: "Rat meat chunks", 
        description: "Eww", 
        value: 8,
        saturates_market: true,
        price_recovers: true,
    });

    item_templates["Glass phial"] = new OtherItem({
        name: "Glass phial", 
        description: "Small glass phial, a perfect container for a potion", 
        value: 10,
        saturates_market: false,
    });
})();

//lootable materials
(function(){
    item_templates["Rat tail"] = new Material({
        name: "Rat tail", 
        description: "Tail of a huge rat. Doesn't seem very useful, but maybe some meat could be recovered from it", 
        value: 4,
        price_recovers: true,
        material_type: "meat source",
    });
    item_templates["Rat pelt"] = new Material({
        name: "Rat pelt", 
        description: "Pelt of a huge rat. Fur has terrible quality, but maybe leather could be used for something if you gather more?", 
        value: 10,
        price_recovers: true,
        material_type: "pelt",
    });
    item_templates["High quality wolf fang"] = new Material({
        name: "High quality wolf fang", 
        description: "Fang of a wild wolf. Very sharp, undamaged and surprisingly clean.", 
        value: 15,
        price_recovers: true,
        material_type: "miscellaneous",
    });
    item_templates["Wolf pelt"] = new Material({
        name: "Wolf pelt", 
        description: "Pelt of a wild wolf. It's a bit damaged so it won't fetch a great price, but the leather itself could be useful.", 
        value: 20,
        price_recovers: true,
        material_type: "pelt",
    });

    item_templates["Boar hide"] = new Material({
        name: "Boar hide", 
        description: "Thick hide of a wild boar. Too stiff for clothing, but might be useful for an armor",
        value: 30,
        price_recovers: true,
        material_type: "pelt",
    });
    item_templates["Boar meat"] = new Material({
        name: "Boar meat",
        description: "Fatty meat of a wild boar, all it needs is to be cooked.",
        value: 20,
        price_recovers: true,
        material_type: "meat source",
    });
    item_templates["High quality boar tusk"] = new Material({
        name: "High quality boar tusk", 
        description: "Tusk of a wild boar. Sharp and long enough to easily kill an adult human", 
        value: 25,
        price_recovers: true,
        material_type: "miscellaneous",
    });

    item_templates["Weak monster bone"] = new Material({
        name: "Weak monster bone", 
        description: "Mutated and dark bone of a monster. While far on the weaker side, it's still very strong",
        value: 30,
        price_recovers: true,
        material_type: "bone",
    });

})();

//gatherable materials
(function(){
    item_templates["Low quality iron ore"] = new Material({
        name: "Low quality iron ore", 
        description: "Iron content is rather low and there are a lot of problematic components that can't be fully removed, which will affect created materials.", 
        value: 3,
        saturates_market: true,
        price_recovers: true,
        material_type: "raw metal",
    });
    item_templates["Iron ore"] = new Material({
        name: "Iron ore", 
        description: "It has a decent iron content and can be smelt into market-quality iron.", 
        value: 5,
        saturates_market: true,
        price_recovers: true,
        material_type: "raw metal",
    });
    item_templates["Piece of rough wood"] = new Material({
        name: "Piece of rough wood", 
        description: "Cheapest form of wood. There's a lot of bark and malformed pieces.", 
        value: 2,
        saturates_market: true,
        price_recovers: true,
        material_type: "raw wood",
    });
    item_templates["Piece of wood"] = new Material({
        name: "Piece of wood", 
        description: "Average quality wood. There's a lot of bark and malformed pieces.", 
        value: 4,
        saturates_market: true,
        price_recovers: true,
        material_type: "raw wood",
    });
    item_templates["Piece of ash wood"] = new Material({
        name: "Piece of ash wood", 
        description: "Strong yet elastic, it's best wood you can hope to find around. There's a lot of bark and malformed pieces.",
        value: 7,
        saturates_market: true,
        price_recovers: true,
        material_type: "raw wood",
    });

    item_templates["Belmart leaf"] = new Material({
        name: "Belmart leaf", 
        description: "Small, round, dark-green leaves with with very good disinfectant properties",
        value: 8,
        saturates_market: true,
        price_recovers: true,
        material_type: "disinfectant herb",
    });

    item_templates["Golmoon leaf"] = new Material({
        name: "Golmoon leaf", 
        description: "Big green-brown leaves that can be applied to wounds to speed up their healing",
        value: 8,
        saturates_market: true,
        price_recovers: true,
        material_type: "healing herb",
    });

    item_templates["Oneberry"] = new Material({
        name: "Oneberry", 
        description: "Small blue berries capable of stimulating body's natural healing",
        value: 8,
        saturates_market: true,
        price_recovers: true,
        material_type: "healing herb",
    });

    item_templates["Wool"] = new Material({
        name: "Wool", 
        description: "A handful of wool, raw and unprocessed",
        value: 8,
        saturates_market: true,
        price_recovers: true,
        material_type: "raw fabric",
    });
})();

//processed materials
(function(){
    item_templates["Low quality iron ingot"] = new Material({
        id: "Low quality iron ingot",
        name: "Low quality iron ingot", 
        description: "It has a lot of impurities, resulting in it being noticeably below the market standard", 
        value: 10,
        saturates_market: true,
        price_recovers: true,
        material_type: "metal",
    });
    item_templates["Iron ingot"] = new Material({
        id: "Iron ingot",
        name: "Iron ingot", 
        description: "It doesn't suffer from any excessive impurities and can be used without worries.", 
        value: 20,
        saturates_market: true,
        price_recovers: true,
        material_type: "metal",
    });
    item_templates["Piece of wolf rat leather"] = new Material({
        name: "Piece of wolf rat leather",
        description: "It's slightly damaged and seems useless for anything that requires precise work.",
        value: 10,
        saturates_market: true,
        price_recovers: true,
        material_type: "piece of leather",
    });
    item_templates["Piece of wolf leather"] = new Material({
        name: "Piece of wolf leather", 
        description: "Somewhat strong, should offer some protection when turned into armor",
        value: 20,
        saturates_market: true,
        price_recovers: true,
        material_type: "piece of leather",
    });
    item_templates["Piece of boar leather"] = new Material({
        name: "Piece of boar leather", 
        description: "Thick and resistant leather, too stiff for clothes but perfect for armor",
        value: 30,
        saturates_market: true,
        price_recovers: true,
        material_type: "piece of leather",
    });
    item_templates["Wool cloth"] = new Material({
        name: "Wool cloth", 
        description: "Thick and warm, might possibly absord some punches",
        value: 8,
        saturates_market: true,
        price_recovers: true,
        material_type: "fabric",
    });
    item_templates["Iron chainmail"] = new Material({
        name: "Iron chainmail", 
        description: "Dozens of tiny iron rings linked together. Nowhere near a wearable form, turning it into armor will still take a lot of effort and focus",
        value: 12,
        saturates_market: true,
        price_recovers: true,
        material_type: "chainmail",
    });
    item_templates["Scraps of wolf rat meat"] = new Material({
        name: "Scraps of wolf rat meat", 
        description: "Ignoring where they come from and all the attached diseases, they actually look edible. Just remember to cook it first.",
        value: 8,
        saturates_market: true,
        price_recovers: true,
        material_type: "meat",
    });
    item_templates["Processed rough wood"] = new Material({
        name: "Processed rough wood", 
        description: "Cheapest form of wood, ready to be used. Despite being rather weak, it still has a lot of uses.",
        value: 6,
        saturates_market: true,
        price_recovers: true,
        material_type: "wood",
    });

    item_templates["Processed wood"] = new Material({
        name: "Processed wood", 
        description: "Average quality wood, ready to be used.",
        value: 11,
        saturates_market: true,
        price_recovers: true,
        material_type: "wood",
    });

    item_templates["Processed ash wood"] = new Material({
        name: "Processed ash wood", 
        description: "High quality wood, just waiting to be turned into a piece of equipment.",
        value: 20,
        saturates_market: true,
        price_recovers: true,
        material_type: "wood",
    });

})();

//spare parts
(function(){
    item_templates["Basic spare parts"] = new OtherItem({
        name: "Basic spare parts", 
        description: "Some cheap and simple spare parts, like bindings and screws, necessary for crafting equipment",
        value: 30, 
        component_tier: 1,
    });
}());

//weapon components:
(function(){
    item_templates["Cheap short iron blade"] = new WeaponComponent({
        name: "Cheap short iron blade", description: "Crude blade made of iron. Perfect length for a dagger, but could be also used for a spear",
        component_type: "short blade",
        value: 90,
        component_tier: 1,
        name_prefix: "Cheap iron",
        attack_value: 5,
        stats: {
            crit_rate: {
                flat: 0.06,
            },
            attack_speed: {
                multiplier: 1.20,
            },
            agility: {
                flat: 1,
            }
        }
    });
    item_templates["Short iron blade"] = new WeaponComponent({
        name: "Short iron blade", description: "A good iron blade. Perfect length for a dagger, but could be also used for a spear",
        component_type: "short blade",
        value: 200,
        component_tier: 2,
        name_prefix: "Iron",
        attack_value: 8,
        stats: {
            crit_rate: {
                flat: 0.1,
            },
            attack_speed: {
                multiplier: 1.30,
            },
            agility: {
                flat: 2,
            }
        }
    });
    item_templates["Cheap long iron blade"] = new WeaponComponent({
        name: "Cheap long iron blade", description: "Crude blade made of iron, with a perfect length for a sword",
        component_type: "long blade",
        value: 120,
        name_prefix: "Cheap iron",
        component_tier: 1,
        attack_value: 8,
        stats: {
            attack_speed: {
                multiplier: 1.10,
            },
            crit_rate: {
                flat: 0.02,
            },
        }
    });
    item_templates["Long iron blade"] = new WeaponComponent({
        name: "Long iron blade", description: "Good blade made of iron, with a perfect length for a sword",
        component_type: "long blade",
        value: 260,
        name_prefix: "Iron",
        component_tier: 2,
        attack_value: 13,
        stats: {
            attack_speed: {
                multiplier: 1.15,
            },
            crit_rate: {
                flat: 0.04,
            },
        }
    });
    item_templates["Cheap iron axe head"] = new WeaponComponent({
        name: "Cheap iron axe head", description: "A heavy axe head made of low quality iron",
        component_type: "axe head",
        value: 120,
        name_prefix: "Cheap iron",
        component_tier: 1,
        attack_value: 10,
        stats: {
            attack_speed: {
                multiplier: 0.9,
            }
        }
    });
    item_templates["Iron axe head"] = new WeaponComponent({
        name: "Iron axe head", description: "A heavy axe head made of good iron",
        component_type: "axe head",
        value: 260,
        name_prefix: "Iron",
        component_tier: 2,
        attack_value: 16,
        stats: {
            attack_speed: {
                multiplier: 0.95,
            }
        }
    });
    item_templates["Cheap iron hammer head"] = new WeaponComponent({
        name: "Cheap iron hammer head", description: "A crude ball made of low quality iron, with a small hole for the handle",
        component_type: "hammer head",
        value: 120,
        name_prefix: "Cheap iron",
        component_tier: 1,
        attack_value: 12,
        stats: {
            attack_speed: {
                multiplier: 0.8,
            }
        }
    });

    item_templates["Iron hammer head"] = new WeaponComponent({
        name: "Iron hammer head", description: "A crude ball made of iron, with a small hole for the handle",
        component_type: "hammer head",
        value: 260,
        name_prefix: "Iron",
        component_tier: 2,
        attack_value: 19,
        stats: {
            attack_speed: {
                multiplier: 0.85,
            }
        }
    });

    item_templates["Simple short wooden hilt"] = new WeaponComponent({
        name: "Simple short wooden hilt", description: "A short handle for a sword or maybe a dagger",
        component_type: "short handle",
        value: 10,
        component_tier: 1,
    });

    item_templates["Short wooden hilt"] = new WeaponComponent({
        name: "Short wooden hilt", description: "A short handle for a sword or maybe a dagger",
        component_type: "short handle",
        value: 40,
        component_tier: 2,
        stats: {
            attack_speed: {
                multiplier: 1.05,
            }
        }
    });

    item_templates["Simple medium wooden handle"] = new WeaponComponent({
        name: "Simple medium wooden handle", description: "A medium handle for an axe or a hammer",
        component_type: "medium handle",
        value: 20,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.95,
            }
        }
    });

    item_templates["Medium wooden handle"] = new WeaponComponent({
        name: "Medium wooden handle", description: "A medium handle for an axe or a hammer",
        component_type: "medium handle",
        value: 80,
        component_tier: 2,
    });

    item_templates["Simple long wooden shaft"] = new WeaponComponent({
        name: "Simple long wooden shaft", description: "A long shaft for a spear, somewhat uneven",
        component_type: "long handle",
        value: 30,
        component_tier: 1,
        attack_multiplier: 1.5,
        stats: {
            attack_speed: {
                multiplier: 0.9,
            },
        }
    });

    item_templates["Long wooden shaft"] = new WeaponComponent({
        name: "Long wooden shaft", 
        description: "A long shaft for a spear, somewhat uneven",
        component_type: "long handle",
        value: 120,
        component_tier: 2,
        attack_multiplier: 1.5,
        stats: {
            attack_speed: {
                multiplier: 0.95,
            },
        }
    });

    item_templates["Cheap short iron hilt"] = new WeaponComponent({
        name: "Cheap short iron hilt", description: "A short handle for a sword or maybe a dagger, heavy",
        component_type: "short handle",
        value: 70,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.9,
            },
            attack_power: {
                multiplier: 1.05,
            }
        }
    });

    item_templates["Short iron hilt"] = new WeaponComponent({
        name: "Short iron hilt", description: "A short handle for a sword or maybe a dagger, heavy",
        component_type: "short handle",
        value: 100,
        component_tier: 2,
        stats: {
            attack_power: {
                multiplier: 1.05,
            }
        }
    });

    item_templates["Cheap medium iron handle"] = new WeaponComponent({
        name: "Cheap medium iron handle", description: "A medium handle for an axe or a hammer, very heavy",
        component_type: "medium handle",
        value: 80,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.7,
            },
            attack_power: {
                multiplier: 1.2,
            }
        }
    });

    item_templates["Medium iron handle"] = new WeaponComponent({
        name: "Medium iron handle", description: "A medium handle for an axe or a hammer, very heavy",
        component_type: "medium handle",
        value: 120,
        component_tier: 2,
        stats: {
            attack_speed: {
                multiplier: 0.8,
            },
            attack_power: {
                multiplier: 1.2,
            }
        }
    });

    item_templates["Cheap long iron shaft"] = new WeaponComponent({
        name: "Cheap long iron shaft", description: "A long shaft for a spear, extremely heavy",
        component_type: "long handle",
        value: 110,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.5,
            },
            attack_power: {
                multiplier: 1.6,
            }
        }
    });

    item_templates["Long iron shaft"] = new WeaponComponent({
        name: "Long iron shaft", 
        description: "A long shaft for a spear,  extremely heavy",
        component_type: "long handle",
        value: 160,
        component_tier: 2,
        stats: {
            attack_speed: {
                multiplier: 0.6,
            },
            attack_power: {
                multiplier: 1.6,
            }
        }
    });

})();

//weapons:
(function(){
    item_templates["Cheap iron spear"] = new Weapon({
        components: {
            head: "Cheap short iron blade",
            handle: "Simple long wooden shaft"
        }
    });
    item_templates["Iron spear"] = new Weapon({
        components: {
            head: "Short iron blade",
            handle: "Simple long wooden shaft"
        }
    });

    item_templates["Cheap iron dagger"] = new Weapon({
        components: {
            head: "Cheap short iron blade",
            handle: "Simple short wooden hilt",
        }
    });
    item_templates["Iron dagger"] = new Weapon({
        components: {
            head: "Short iron blade",
            handle: "Simple short wooden hilt",
        }
    });

    item_templates["Cheap iron sword"] = new Weapon({
        components: {
            head: "Cheap long iron blade",
            handle: "Simple short wooden hilt",
        }
    });
    item_templates["Iron sword"] = new Weapon({
        components: {
            head: "Long iron blade",
            handle: "Simple short wooden hilt",
        }
    });

    item_templates["Cheap iron axe"] = new Weapon({
        components: {
            head: "Cheap iron axe head",
            handle: "Simple medium wooden handle",
        }
    });
    item_templates["Iron axe"] = new Weapon({
        components: {
            head: "Iron axe head",
            handle: "Simple medium wooden handle",
        }
    });

    item_templates["Cheap iron battle hammer"] = new Weapon({
        components: {
            head: "Cheap iron hammer head",
            handle: "Simple medium wooden handle",
        }
    });
    item_templates["Iron battle hammer"] = new Weapon({
        components: {
            head: "Iron hammer head",
            handle: "Simple medium wooden handle",
        }
    });
})();

//armor components:
(function(){
    item_templates["Wolf leather helmet armor"] = new ArmorComponent({
        name: "Wolf leather helmet armor", 
        description: "Strenghtened wolf leather, ready to be used as a part of a helmet",
        component_type: "helmet exterior",
        value: 300,
        component_tier: 2,
        full_armor_name: "Wolf leather helmet",
        defense_value: 2,
        stats: {
            agility: {
                multiplier: 0.95,
            }
        }
    });

    item_templates["Boar leather helmet armor"] = new ArmorComponent({
        name: "Boar leather helmet armor", 
        description: "Strong boar leather, ready to be used as a part of a helmet",
        component_type: "helmet exterior",
        value: 500,
        component_tier: 3,
        full_armor_name: "Boar leather helmet",
        defense_value: 3,
        stats: {
            agility: {
                multiplier: 0.95,
            }
        }
    });

    item_templates["Wolf leather chestplate armor"] = new ArmorComponent({
        id: "Wolf leather chestplate armor",
        name: "Wolf leather cuirass",
        description: "Simple cuirass made of solid wolf leather, all it needs now is something softer to wear under it.",
        component_type: "chestplate exterior",
        value: 600,
        component_tier: 2,
        full_armor_name: "Wolf leather armor",
        defense_value: 4,
        stats: {
            agility: {
                multiplier: 0.95,
            }
        }
    });
    item_templates["Boar leather chestplate armor"] = new ArmorComponent({
        id: "Boar leather chestplate armor",
        name: "Boar leather cuirass",
        description: "String cuirass made of boar leather.",
        component_type: "chestplate exterior",
        value: 1000,
        component_tier: 3,
        full_armor_name: "Boar leather armor",
        defense_value: 6,
        stats: {
            agility: {
                multiplier: 0.95,
            }
        }
    });
    item_templates["Wolf leather greaves"] = new ArmorComponent({
        name: "Wolf leather greaves",
        description: "Greaves made of wolf leather. Just attach them onto some pants and you are ready to go.",
        component_type: "leg armor exterior",
        value: 300,
        component_tier: 2,
        full_armor_name: "Wolf leather armored pants",
        defense_value: 2,
        stats: {
            agility: {
                multiplier: 0.95,
            }
        }
    });

    item_templates["Boar leather greaves"] = new ArmorComponent({
        name: "Boar leather greaves",
        description: "Greaves made of thick boar leather. Just attach them onto some pants and you are ready to go.",
        component_type: "leg armor exterior",
        value: 500,
        component_tier: 3,
        full_armor_name: "Boar leather armored pants",
        defense_value: 3,
        stats: {
            agility: {
                multiplier: 0.95,
            }
        }
    });
    item_templates["Wolf leather glove armor"] = new ArmorComponent({
        name: "Wolf leather glove armor",
        description: "Pieces of wolf leather shaped for gloves.",
        component_type: "glove exterior",
        value: 300,
        component_tier: 2,
        full_armor_name: "Wolf leather gloves",
        defense_value: 2,
    });

    item_templates["Boar leather glove armor"] = new ArmorComponent({
        name: "Boar leather glove armor",
        description: "Pieces of boar leather shaped for gloves.",
        component_type: "glove exterior",
        value: 500,
        component_tier: 3,
        full_armor_name: "Boar leather gloves",
        defense_value: 3,
    });

    item_templates["Wolf leather shoe armor"] = new ArmorComponent({
        name: "Wolf leather shoe armor",
        description: "Pieces of wolf leather shaped for shoes.",
        component_type: "shoes exterior",
        value: 300,
        component_tier: 2,
        full_armor_name: "Wolf leather shoes",
        defense_value: 2,
    });

    item_templates["Boar leather shoe armor"] = new ArmorComponent({
        name: "Boar leather shoe armor",
        description: "Pieces of boar leather shaped for shoes.",
        component_type: "shoes exterior",
        value: 500,
        component_tier: 3,
        full_armor_name: "Boar leather shoes",
        defense_value: 3,
    });

    item_templates["Iron chainmail helmet armor"] = new ArmorComponent({
        name: "Iron chainmail helmet armor",
        description: "Best way to keep your head in one piece",
        component_type: "helmet exterior",
        value: 400,
        component_tier: 2,
        full_armor_name: "Iron chainmail helmet",
        defense_value: 4,
        stats: {
            attack_speed: {
                multiplier: 0.98,
            },
            agility: {
                multiplier: 0.9,
            }
        }
    });
    item_templates["Iron chainmail vest"] = new ArmorComponent({
        name: "Iron chainmail vest",
        description: "Basic iron chainmail. Nowhere near as strong as a plate armor",
        component_type: "chestplate exterior",
        value: 800,
        component_tier: 2,
        full_armor_name: "Iron chainmail armor",
        defense_value: 8,
        stats: {
            attack_speed: {
                multiplier: 0.98,
            },
            agility: {
                multiplier: 0.9,
            }
        }
    });
    item_templates["Iron chainmail greaves"] = new ArmorComponent({
        name: "Iron chainmail greaves",
        description: "Greaves made of iron chainmail. Just attach them onto some pants and you are ready to go.",
        component_type: "leg armor exterior",
        value: 400,
        component_tier: 2,
        full_armor_name: "Iron chainmail pants",
        defense_value: 4,
        stats: {
            attack_speed: {
                multiplier: 0.98,
            },
            agility: {
                multiplier: 0.9,
            }
        }
    });
    item_templates["Iron chainmail glove"] = new ArmorComponent({
        name: "Iron chainmail glove",
        description: "Iron chainmail in a form ready to be applied onto a glove.",
        component_type: "glove exterior",
        value: 400,
        component_tier: 2,
        full_armor_name: "Iron chainmail gloves",
        defense_value: 4,
        stats: {
            attack_speed: {
                multiplier: 0.98,
            },
            agility: {
                multiplier: 0.9,
            }
        }
    });

    item_templates["Iron chainmail shoes"] = new ArmorComponent({
        name: "Iron chainmail shoes",
        description: "Iron chainmail in a form ready to be applied onto a pair of shoes.",
        component_type: "shoes exterior",
        value: 400,
        component_tier: 2,
        full_armor_name: "Iron chainmail boots",
        defense_value: 4,
        stats: {
            agility: {
                multiplier: 0.9,
            }
        }
    });
})();

//clothing (functions both as weak armor and as an armor component):
(function(){
    item_templates["Cheap leather vest"] = new Armor({
        name: "Cheap leather vest", 
        description: "Vest providing very low protection. Better not to know what's it made from", 
        value: 100,
        component_type: "chestplate interior",
        base_defense: 2,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.99,
            },
        }
    });
    item_templates["Leather vest"] = new Armor({
        name: "Leather vest", 
        description: "Comfortable leather vest, offering a low protection.", 
        value: 300,
        component_type: "chestplate interior",
        base_defense: 2,
        component_tier: 2,
    });

    item_templates["Cheap leather pants"] = new Armor({
        name: "Cheap leather pants", 
        description: "Leather pants made from cheapest resources available.", 
        value: 100,
        component_type: "leg armor interior",
        base_defense: 1,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.99,
            },
        }
    });
    item_templates["Leather pants"] = new Armor({
        name: "Leather pants", 
        description: "Solid leather pants.", 
        value: 300,
        component_type: "leg armor interior",
        base_defense: 2,
        component_tier: 2,
    });

    item_templates["Cheap leather hat"] = new Armor({
        name: "Cheap leather hat", 
        description: "A cheap leather hat to protect your head.", 
        value: 100,
        component_type: "helmet interior",
        base_defense: 1,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 0.99,
            },
        }
    });

    item_templates["Leather hat"] = new Armor({
        name: "Leather hat", 
        description: "A nice leather hat to protect your head.", 
        value: 300,
        component_type: "helmet interior",
        base_defense: 2,
        component_tier: 2,
    });

    item_templates["Leather gloves"] = new Armor({
        name: "Leather gloves", 
        description: "Strong leather gloves, perfect for handling rough and sharp objects.", 
        value: 300,
        component_type: "glove interior",
        base_defense: 1,
        component_tier: 2,
    });

    item_templates["Cheap leather shoes"] = new Armor({
        name: "Cheap leather shoes",
        description: "Shoes made of thin and cheap leather. Even then, they are in every single aspect better than not having any.", 
        value: 100,
        component_type: "shoes interior",
        base_defense: 0,
        component_tier: 1,
        stats: {
            agility: {
                multiplier: 1.05,
            },
        }
    });
    item_templates["Leather shoes"] = new Armor({
        name: "Leather shoes", 
        description: "Solid shoes made of leather, a must have for any traveler", 
        value: 300,
        component_type: "shoes interior",
        base_defense: 1,
        component_tier: 2,
        stats: {
            attack_speed: {
                multiplier: 1.02,
            },
            agility: {
                multiplier: 1.1,
            },
        }
    });

    item_templates["Wool shirt"] = new Armor({
        name: "Wool shirt",
        description: "It's thick enough to weaken a blow, but you shouldn't hope for much. On the plus side, it's light and doesn't block your moves.", 
        value: 300,
        component_type: "chestplate interior",
        base_defense: 1,
        component_tier: 2,
        stats: {
            attack_speed: {
                multiplier: 1.01,
            },
            agility: {
                multiplier: 1.02,
            },
        }
    });

    item_templates["Wool pants"] = new Armor({
        name: "Wool pants", 
        description: "Nice woollen pants. Slightly itchy.",
        value: 100,
        component_type: "leg armor interior",
        base_defense: 1,
        component_tier: 2,
    });

    item_templates["Wool hat"] = new Armor({
        name: "Wool hat", 
        description: "Simple woollen hat to protect your head.",
        value: 300,
        component_type: "helmet interior",
        base_defense: 1,
        component_tier: 2,
        stats: {
            attack_speed: {
                multiplier: 1.01,
            },
            agility: {
                multiplier: 1.01,
            },
        }
    });

    item_templates["Wool gloves"] = new Armor({
        name: "Wool gloves",
        description: "Warm and comfy, but they don't provide much protection.",
        value: 300,
        component_type: "glove interior",
        base_defense: 1,
        component_tier: 2,
    });
})();

//armors:
(function(){
    //predefined full (int+ext) armors go here
    item_templates["Wolf leather armor"] = new Armor({
        components: {
            internal: "Leather vest",
            external: "Wolf leather chestplate armor",
        }
    });
    item_templates["Wolf leather helmet"] = new Armor({
        components: {
            internal: "Leather hat",
            external: "Wolf leather helmet armor",
        }
    });
    item_templates["Wolf leather armored pants"] = new Armor({
        components: {
            internal: "Leather pants",
            external: "Wolf leather greaves",
        }
    });

    item_templates["Iron chainmail armor"] = new Armor({
        components: {
            internal: "Leather vest",
            external: "Iron chainmail vest",
        }
    });
    item_templates["Iron chainmail helmet"] = new Armor({
        components: {
            internal: "Leather hat",
            external: "Iron chainmail helmet armor",
        }
    });
    item_templates["Iron chainmail pants"] = new Armor({
        components: {
            internal: "Leather pants",
            external: "Iron chainmail greaves",
        }
    });
})();

//shield components:
(function(){
    item_templates["Cheap wooden shield base"] = new ShieldComponent({
        name: "Cheap wooden shield base", description: "Cheap shield component made of wood, basically just a few planks barely holding together", 
        value: 20, 
        shield_strength: 1, 
        shield_name: "Cheap wooden shield",
        component_tier: 1,
        component_type: "shield base",
    });

    item_templates["Crude wooden shield base"] = new ShieldComponent({
        name: "Crude wooden shield base", description: "A shield base of rather bad quality, but at least it won't fall apart by itself", 
        value: 40,
        shield_strength: 3,
        shield_name: "Crude wooden shield",
        component_tier: 1,
        component_type: "shield base",
    });
    item_templates["Wooden shield base"] = new ShieldComponent({
        name: "Wooden shield base", description: "Proper wooden shield base, although it could use some additional reinforcement", 
        value: 100,
        shield_strength: 5,
        shield_name: "Wooden shield",
        component_tier: 2,
        component_type: "shield base",
    });
    item_templates["Crude iron shield base"] = new ShieldComponent({
        name: "Crude iron shield base", description: "Heavy shield base made of low quality iron.", 
        value: 160,
        shield_strength: 7,
        shield_name: "Crude iron shield",
        component_tier: 2,
        component_type: "shield base",
        stats: {
            attack_speed: {
                multiplier: 0.9,
            }
        }
    });
    item_templates["Iron shield base"] = new ShieldComponent({
        name: "Iron shield base", 
        description: "Solid and strong shield base, although it's quite heavy", 
        value: 260,
        shield_strength: 10,
        shield_name: "Iron shield",
        component_tier: 3,
        component_type: "shield base",
        stats: {
            attack_speed: {
                multiplier: 0.95,
            }
        }
    });
    item_templates["Basic shield handle"] = new ShieldComponent({
        id: "Basic shield handle",
        name: "Crude wooden shield handle", 
        description: "A simple handle for holding the shield", 
        value: 10,
        component_tier: 1,
        component_type: "shield handle",
    });

    item_templates["Wooden shield handle"] = new ShieldComponent({
        name: "Wooden shield handle", 
        description: "A decent wooden handle for holding the shield", 
        value: 40,
        component_tier: 2,
        component_type: "shield handle",
        stats: {
            block_strength: {
                multiplier: 1.1,
            }
        }
    });

})();

//shields:
(function(){
    item_templates["Cheap wooden shield"] = new Shield({
        components: {
            shield_base: "Cheap wooden shield base",
            handle: "Basic shield handle",
        }
    });

    item_templates["Crude wooden shield"] = new Shield({
        components: {
            shield_base: "Crude wooden shield base",
            handle: "Basic shield handle",
        }
    });

    item_templates["Wooden shield"] = new Shield({
        components: {
            shield_base: "Wooden shield base",
            handle: "Wooden shield handle",
        }
    });

    item_templates["Crude iron shield"] = new Shield({
        components: {
            shield_base: "Crude iron shield base",
            handle: "Basic shield handle",
        }
    });

    item_templates["Iron shield"] = new Shield({
        components: {
            shield_base: "Iron shield base",
            handle: "Wooden shield handle",
        }
    });
})();

//trinkets:
(function(){
    item_templates["Wolf trophy"] = new Artifact({
        name: "Wolf trophy",
        value: 50,
        stats: {
            attack_speed: {
                multiplier: 1.05,
            },
            crit_rate: {
                flat: 0.01,
            },
        }
    });

    item_templates["Boar trophy"] = new Artifact({
        name: "Boar trophy",
        value: 80,
        stats: {
            attack_power: {
                multiplier: 1.1,
            },
            crit_multiplier: {
                flat: 0.2,
            },
        }
    });
})();

//tools:
(function(){
    item_templates["Old pickaxe"] = new Tool({
        name: "Old pickaxe",
        description: "An old pickaxe that has seen better times, but is still usable",
        value: 10,
        equip_slot: "pickaxe",
    });

    item_templates["Old axe"] = new Tool({
        name: "Old axe",
        description: "An old axe that has seen better times, but is still usable",
        value: 10,
        equip_slot: "axe",
    });

    item_templates["Old sickle"] = new Tool({
        name: "Old sickle",
        description: "And old herb sickle that has seen better time, but is still usable",
        value: 10,
        equip_slot: "sickle",
    });

    
    item_templates["精钢镐"] = new Tool({
        name: "精钢镐",
        description: "一把普通的精钢镐头，可以用于开采紫铜",
        value: 1000,
        equip_slot: "pickaxe",
        bonus_skill_levels: {
            "Mining": 1,
        }
    });
    item_templates["紫铜镐"] = new Tool({
        name: "紫铜镐",
        description: "一把紫铜镐头，开采能力有了大幅度加强",
        value: 66666,
        equip_slot: "pickaxe",
        bonus_skill_levels: {
            "Mining": 4,
        }
    });
    item_templates["暗影斧"] = new Tool({
        name: "暗影斧",
        description: "相当锋利的斧头。不过面对百年柳木，依然需要较长的时间来砍伐。",
        value: 3.6e6,
        equip_slot: "axe",
        bonus_skill_levels: {
            "Woodcutting": 6,
        }
    });
    item_templates["充能斧"] = new Tool({
        name: "充能斧",
        description: "愈加锋利的斧头。砍伐百年柳木如吃饭一样简单了！",
        value: 2.0e7,
        equip_slot: "axe",
        bonus_skill_levels: {
            "Woodcutting": 10,
        }
    });

})();

(function(){
    item_templates["宝石吊坠"] = new Props({
        name: "宝石吊坠",
        id: "宝石吊坠",
        description: "蕴含着纯净的生命能量，增强对空气中游离能量的吸收速率。", 
        value: 545455,
        stats: {
            health_regeneration_flat: {
                flat: 150,
            },
        }
    });
    item_templates["生命之眼"] = new Props({
        name: "生命之眼",
        id: "生命之眼",
        description: "永远寻求着蓬勃生机的生命源泉。", 
        value: 4444444,
        stats: {
            max_health: {
                flat: 300000,
            },
        }
    });
    item_templates["人造茸茸"] = new Props({
        name: "人造茸茸",
        id: "人造茸茸",
        description: "使用尚存活性的凝胶，导入核心与魂魄复活的傀儡茸茸。可以预报危险，但带着难免束手束脚。", 
        value: 7777777,
        stats: {
            attack_power: {
                flat: -1000,
            },
            defense: {
                flat: -1000,
            },
            agility: {
                flat: 4000,
            }
        }
    });
    item_templates["巨剑徽章"] = new Props({
        name: "巨剑徽章",
        id: "巨剑徽章",
        description: "很少有人会发现，血洛大陆的刀币中蕴藏着不凡的力量。但是，其中的反噬之力不可小觑。", 
        value: 23456789,
        stats: {
            attack_power: {
                flat: 4000,
            },
            health_regeneration_percent: {
                flat: -1,
            }
        }
    });


})();


(function(){
    item_templates["三月断宵"] = new Method({
        name: "三月断宵",
        id: "三月断宵",
        description: "可供天空级强者修炼的功法，大幅提升技能熟练度积累的效率，同时小幅度增加对游离能量的吸收效率", 
        value: 909090,
        stats: {
            health_regeneration_flat: {
                flat: 100,
            },
        }
    });
})();


(function(){
    item_templates["微火"] = new Realm({
        name: "微火",
        id: "微火",
        description: "利用简单的精神念力点燃火焰的领悟。可以加深敌人受到的伤害！", 
        value: 90909090,
        stats: {
            attack_power: {
                flat: 1000,
            },
            defense: {
                flat: 1000,
            },
            attack_mul: {
                flat: 0.5,
            },
        }
    });
})();

(function(){
    item_templates["纳娜米"] = new Special({
        name: "纳娜米",
        id: "纳娜米",
        description: "别卖姐姐！你这个恶魔！<br>(Tips:没有姐姐的话地宫不会被削弱到1/100属性)", 
        value: 861082712,//B1镭射枪的预估价格约为数百B。
        stats: {
            attack_power: {
                multiplier: 1.3,
            },
            defense: {
                multiplier: 1.3,
            },
            agility: {
                multiplier: 1.3,
            },
            max_health: {
                multiplier: 1.3,
            }
        }
    });

})();
//usables:
(function(){

    item_templates["Weak healing powder"] = new UsableItem({
        name: "Weak healing powder", 
        description: "Not very potent, but can still make body heal noticeably faster for quite a while", 
        value: 40,
        effects: [{effect: "Weak healing powder", duration: 120}],
    });

    item_templates["Oneberry juice"] = new UsableItem({
        name: "Oneberry juice", 
        description: "Tastes kinda nice and provides a quick burst of healing", 
        value: 80,
        effects: [{effect: "Weak healing potion", duration: 10}],
    });
})();



//NekoRPG items below
//武器部件
(function(){
    item_templates["铁剑刃"] = new WeaponComponent({
        name: "铁剑刃", description: "由铁锭打造出的剑刃，是铁剑的核心部件",
        component_type: "long blade",
        value: 125,
        component_tier: 0,
        name_prefix: "铁",
        attack_value: 16,
        stats: {
            crit_rate: {
                flat: 0.05,
            },
            attack_speed: {
                multiplier: 1.02,
            }
        }
    });
    
    item_templates["精钢剑刃"] = new WeaponComponent({
        name: "精钢剑刃", description: "由精钢锭打造出的剑刃，远远比铁剑刃锋利",
        component_type: "long blade",
        value: 900,
        component_tier: 1,
        name_prefix: "精钢",
        attack_value: 48,
        stats: {
            crit_rate: {
                flat: 0.06,
            },
            attack_speed: {
                multiplier: 1.04,
            }
        }
    });
    
    item_templates["紫铜剑刃"] = new WeaponComponent({
        name: "紫铜剑刃", description: "由紫铜锭打造出的剑刃，锋利的同时兼具灵敏",
        component_type: "long blade",
        value: 40000,
        component_tier: 2,
        name_prefix: "紫铜",
        attack_value: 200,
        stats: {
            crit_rate: {
                flat: 0.07,
            },
            attack_speed: {
                multiplier: 1.06,
            }
        }
    });
    item_templates["宝石剑刃"] = new WeaponComponent({
        name: "宝石剑刃", description: "经过打造的宝石灌注剑刃。具有魔力，暴击率提升。",
        component_type: "long blade",
        value: 500e3,
        component_tier: 3,
        name_prefix: "宝石",
        attack_value: 640,
        stats: {
            crit_rate: {
                flat: 0.08,
            },
            attack_speed: {
                multiplier: 1.08,
            }
        }
    });
    item_templates["地宫剑刃"] = new WeaponComponent({
        name: "地宫剑刃", description: "地宫金属制造的剑刃。因为市场饱和根本卖不出去，但是自用还是好用的。",
        component_type: "long blade",
        value: 120e3,
        component_tier: 3,
        name_prefix: "地宫",
        attack_value: 640,
        stats: {
            crit_rate: {
                flat: 0.08,
            },
            attack_speed: {
                multiplier: 1.08,
            },
            agility: {
                flat:80,
            }
        }
    });
    item_templates["暗影剑刃"] = new WeaponComponent({
        name: "暗影剑刃", description: "暗影钢锭制造的剑刃。力大势沉，不过略显笨重。",
        component_type: "long blade",
        value: 2.8e6,
        component_tier: 4,
        name_prefix: "暗影",
        attack_value: 1440,
        stats: {
            crit_rate: {
                flat: 0.09,
            },
            attack_speed: {
                multiplier: 1.10,
            },
            agility: {
                flat:-320,
            }
        }
    });
    item_templates["充能剑刃"] = new WeaponComponent({
        name: "充能剑刃", description: "充能合金锭制造的剑刃。没有任何负面属性，只有纯粹的锋利。",
        component_type: "long blade",
        value: 1.8e7,
        component_tier: 5,
        name_prefix: "充能",
        attack_value: 3240,
        stats: {
            crit_rate: {
                flat: 0.10,
            },
            attack_speed: {
                multiplier: 1.11,
            },
        }
    });
    item_templates["充能戟头"] = new WeaponComponent({
        name: "充能戟头", description: "充能合金锭制造的三叉戟头。一次可以戳出三个洞，但有些难以拔出来...",
        component_type: "triple blade",
        value: 3.6e7,
        component_tier: 5,
        name_prefix: "充能",
        attack_value: 4320,
        stats: {
            crit_rate: {
                flat: 0.15,
            },
            attack_mul: {
                multiplier: 3.00,
            },
            attack_speed: {
                multiplier: 0.50,
            },
        }
    });
    item_templates["骨剑柄"] = new WeaponComponent({
        name: "骨剑柄", description: "由白骨制成的剑柄。易碎，所以使用时会影响自身",
        component_type: "short handle",
        value: 15,
        component_tier: 0,
        stats: {
            attack_speed: {
                multiplier: 0.95,
            },
            attack_power: {
                multiplier: 0.8,
            }
        }
    });
    item_templates["铜骨剑柄"] = new WeaponComponent({
        name: "铜骨剑柄", description: "由铜骨制成的剑柄。结实好用！",
        component_type: "short handle",
        value: 50,
        component_tier: 1,
        stats: {
            attack_speed: {
                multiplier: 1.00,
            },
        }
    });
    item_templates["改良剑柄"] = new WeaponComponent({
        name: "改良剑柄", description: "由多种材料组合的剑柄。能够提供复合提升！",
        component_type: "short handle",
        value: 25000,
        component_tier: 2,
        stats: {
            agility: {
                flat: 40.00,
            },
            crit_multiplier: {
                flat: 0.1,
            },
        }
    });
    item_templates["柳木剑柄"] = new WeaponComponent({
        name: "柳木剑柄", description: "活化柳木制造的剑柄。基因原能传导从未如此顺畅！",
        component_type: "short handle",
        value: 5.0e6,
        component_tier: 4,
        stats: {
            attack_mul: {
                flat: 0.1,
            },
            crit_multiplier: {
                flat: 0.2,
            },
        }
    });
})();
//武器
(function(){
    item_templates["铁剑"] = new Weapon({
        components: {
            head: "铁剑刃",
            handle: "骨剑柄",
        }
    });
    item_templates["铁剑·改"] = new Weapon({
        components: {
            head: "铁剑刃",
            handle: "铜骨剑柄",
        }
    });
    item_templates["精钢剑"] = new Weapon({
        components: {
            head: "精钢剑刃",
            handle: "铜骨剑柄",
        }
    });
})();
//盔甲部件
(function(){
    item_templates["粘合帽子"] = new Armor({
        name: "粘合帽子", 
        description: "由凝胶，飞蛾翅膀粘合成的头部内甲", 
        value: 45,
        component_type: "helmet interior",
        base_defense: 2,
        component_tier: 0,
    });
    item_templates["粘合背心"] = new Armor({
        name: "粘合背心", 
        description: "由凝胶，飞蛾翅膀粘合成的胸部内甲", 
        value: 60,
        component_type: "chestplate interior",
        base_defense: 4,
        component_tier: 0,
    });
    item_templates["粘合裤子"] = new Armor({
        name: "粘合裤子", 
        description: "由凝胶，飞蛾翅膀粘合成的腿部内甲", 
        value: 60,
        component_type: "leg armor interior",
        base_defense: 3,
        component_tier: 0,
    });
    item_templates["粘合袜子"] = new Armor({
        name: "粘合袜子", 
        description: "由凝胶，飞蛾翅膀粘合成的脚部内甲", 
        value: 30,
        component_type: "shoes interior",
        base_defense: 2,
        component_tier: 0,
    });
    item_templates["异兽帽子"] = new Armor({
        name: "异兽帽子", 
        description: "由异兽皮制成的头部内甲", 
        value: 1800,
        component_type: "helmet interior",
        base_defense: 10,
        component_tier: 1,
    });
    item_templates["异兽背心"] = new Armor({
        name: "异兽背心", 
        description: "由异兽皮制成的胸部内甲", 
        value: 2400,
        component_type: "chestplate interior",
        base_defense: 16,
        component_tier: 1,
    });
    item_templates["异兽裤子"] = new Armor({
        name: "异兽裤子", 
        description: "由异兽皮制成的腿部内甲", 
        value: 2400,
        component_type: "leg armor interior",
        base_defense: 14,
        component_tier: 1,
    });
    item_templates["异兽袜子"] = new Armor({
        name: "异兽袜子", 
        description: "由异兽皮制成的脚部内甲", 
        value: 1200,
        component_type: "shoes interior",
        base_defense: 8,
        component_tier: 1,
    });item_templates["活性帽子"] = new Armor({
        name: "活性帽子", 
        description: "由活性材料塑造成的头部内甲", 
        value: 3.3e6,
        component_type: "helmet interior",
        base_defense: 360,
        component_tier: 4,
        stats: {
            health_regeneration_flat: {
                flat: 30.00,
            },
        },
    });
    item_templates["活性背心"] = new Armor({
        name: "活性背心", 
        description: "由活性材料塑造成的胸部内甲", 
        value: 4.4e6,
        component_type: "chestplate interior",
        base_defense: 480,
        component_tier: 4,
        stats: {
            health_regeneration_flat: {
                flat: 40.00,
            },
        },
    });
    item_templates["活性裤子"] = new Armor({
        name: "活性裤子", 
        description: "由活性材料塑造成的腿部内甲", 
        value: 4.4e6,
        component_type: "leg armor interior",
        base_defense: 480,
        component_tier: 4,
        stats: {
            health_regeneration_flat: {
                flat: 40.00,
            },
        },
    });
    item_templates["活性袜子"] = new Armor({
        name: "活性袜子", 
        description: "由活性材料塑造成的脚部内甲", 
        value: 2.2e6,
        component_type: "shoes interior",
        base_defense: 240,
        component_tier: 4,
        stats: {
            health_regeneration_flat: {
                flat: 20.00,
            },
        },
    });
    item_templates["铁制头盔"] = new ArmorComponent({
        name: "铁制头盔",
        description: "制式的铁制头盔外壳，因阻挡视野会略微影响攻击速度",
        component_type: "helmet exterior",
        value: 187,
        component_tier: 0,
        full_armor_name: "铁制头盔",
        defense_value: 3,
    });
    item_templates["铁制胸甲"] = new ArmorComponent({
        name: "铁制胸甲",
        description: "制式的铁制胸甲外壳",
        component_type: "chestplate exterior",
        value: 250,
        component_tier: 0,
        full_armor_name: "铁制胸甲",
        defense_value: 5,
    });
    item_templates["铁制腿甲"] = new ArmorComponent({
        name: "铁制腿甲",
        description: "制式的铁制腿甲外壳",
        component_type: "leg armor exterior",
        value: 250,
        component_tier: 0,
        full_armor_name: "铁制腿甲",
        defense_value: 4,
    });
    item_templates["铁制战靴"] = new ArmorComponent({
        name: "铁制战靴",
        description: "制式的铁制战靴外壳，会略微影响行动",
        component_type: "shoes exterior",
        value: 125,
        component_tier: 0,
        full_armor_name: "铁制战靴",
        defense_value: 2,
    });
    item_templates["紫铜头盔"] = new ArmorComponent({
        name: "紫铜头盔",
        description: "A1级盔甲，轻便而坚硬",
        component_type: "helmet exterior",
        value: 60000,
        component_tier: 2,
        full_armor_name: "紫铜头盔",
        defense_value: 45,
        stats: {
            agility: {
                flat: 45.00,
            },
        }
    });
    item_templates["紫铜胸甲"] = new ArmorComponent({
        name: "紫铜胸甲",
        description: "A1级盔甲，轻便而坚硬",
        component_type: "chestplate exterior",
        value: 80000,
        component_tier: 2,
        full_armor_name: "紫铜胸甲",
        defense_value: 60,
        stats: {
            agility: {
                flat: 60.00,
            },
        }
    });
    item_templates["紫铜腿甲"] = new ArmorComponent({
        name: "紫铜腿甲",
        description: "A1级盔甲，轻便而坚硬",
        component_type: "leg armor exterior",
        value: 80000,
        component_tier: 2,
        full_armor_name: "紫铜腿甲",
        defense_value: 60,
        stats: {
            agility: {
                flat: 60.00,
            },
        }
    });
    item_templates["紫铜战靴"] = new ArmorComponent({
        name: "紫铜战靴",
        description: "A1级盔甲，轻便而坚硬",
        component_type: "shoes exterior",
        value: 40000,
        component_tier: 2,
        full_armor_name: "紫铜战靴",
        defense_value: 30,
        stats: {
            agility: {
                flat: 30.00,
            },
        }
    });
    item_templates["地宫头盔"] = new ArmorComponent({
        name: "地宫头盔",
        description: "有一定的毒性，但在荒兽海中显得无关紧要。",
        component_type: "helmet exterior",
        value: 270e3,
        component_tier: 3,
        full_armor_name: "地宫头盔",
        defense_value: 180,
        stats: {
            health_regeneration_flat: {
                flat: -60.00,
            },
        }
    });
    item_templates["地宫胸甲"] = new ArmorComponent({
        name: "地宫胸甲",
        description: "有一定的毒性，但在荒兽海中显得无关紧要。",
        component_type: "chestplate exterior",
        value: 360e3,
        component_tier: 3,
        full_armor_name: "地宫胸甲",
        defense_value: 240,
        stats: {
            health_regeneration_flat: {
                flat: -80.00,
            },
        }
    });
    item_templates["地宫腿甲"] = new ArmorComponent({
        name: "地宫腿甲",
        description: "有一定的毒性，但在荒兽海中显得无关紧要。",
        component_type: "leg armor exterior",
        value: 360e3,
        component_tier: 3,
        full_armor_name: "地宫腿甲",
        defense_value: 240,
        stats: {
            health_regeneration_flat: {
                flat: -80.00,
            },
        }
    });
    item_templates["地宫战靴"] = new ArmorComponent({
        name: "地宫战靴",
        description: "有一定的毒性，但在荒兽海中显得无关紧要。",
        component_type: "shoes exterior",
        value: 180e3,
        component_tier: 3,
        full_armor_name: "地宫战靴",
        defense_value: 120,
        stats: {
            health_regeneration_flat: {
                flat: -40.00,
            },
        }
    });
    item_templates["充能头盔"] = new ArmorComponent({
        name: "充能头盔",
        description: "A6级盔甲，和活性内甲一样可以完美贴合身体。",
        component_type: "helmet exterior",
        value: 2.1e7,
        component_tier: 5,
        full_armor_name: "充能头盔",
        defense_value: 450,
        stats: {
            agility: {
                flat: 225.00,
            },
        }
    });
    item_templates["充能胸甲"] = new ArmorComponent({
        name: "充能胸甲",
        description: "A6级盔甲，和活性内甲一样可以完美贴合身体。",
        component_type: "chestplate exterior",
        value: 2.8e7,
        component_tier: 5,
        full_armor_name: "充能胸甲",
        defense_value: 600,
        stats: {
            agility: {
                flat: 300.00,
            },
        }
    });
    item_templates["充能腿甲"] = new ArmorComponent({
        name: "充能腿甲",
        description: "A6级盔甲，和活性内甲一样可以完美贴合身体。",
        component_type: "leg armor exterior",
        value: 2.8e7,
        component_tier: 5,
        full_armor_name: "充能腿甲",
        defense_value: 600,
        stats: {
            agility: {
                flat: 300.00,
            },
        }
    });
    item_templates["充能战靴"] = new ArmorComponent({
        name: "充能战靴",
        description: "A6级盔甲，和活性内甲一样可以完美贴合身体。",
        component_type: "shoes exterior",
        value: 1.4e7,
        component_tier: 5,
        full_armor_name: "充能战靴",
        defense_value: 300,
        stats: {
            agility: {
                flat: 150.00,
            },
        }
    });
})();
//盔甲

//成品金属
(function(){
    item_templates["铁锭"] = new Material({
        id: "铁锭",
        name: "铁锭", 
        description: "金属残片熔炼而成的铁锭。可以用于制作作剑刃，盔甲", 
        value: 30,
        material_type: "metal",
        image: "image/item/iron_ingot.png",
    });
    item_templates["精钢锭"] = new Material({
        id: "精钢锭",
        name: "精钢锭", 
        description: "掺杂了其他金属的铁合金。硬而脆，只能用作剑刃。", 
        value: 400,
        material_type: "metal",
        image: "image/item/steel_ingot.png",
    });
    item_templates["紫铜锭"] = new Material({
        id: "紫铜锭",
        name: "紫铜锭", 
        description: "勉强入级的A1级金属，性能均匀", 
        value: 16666,
        material_type: "metal",
        image: "image/item/purplecopper_ingot.png",
    });
    
    item_templates["宝石锭"] = new Material({
        id: "宝石锭",
        name: "宝石锭", 
        description: "利用能力宝石打成的锭。这可不会被软上限..", 
        value: 120e3,
        material_type: "metal",
        image: "image/item/gem_ingot.png",
    });
    item_templates["地宫金属锭"] = new Material({
        id: "地宫金属锭",
        name: "地宫金属锭", 
        description: "强度在A2级别的合金。鱼龙混杂的地宫材料导致它制作的护甲有毒，销路糟糕。此外，因快速的市场饱和，它的市场价还没有它材料的一半贵。", 
        value: 200e3,
        material_type: "metal",
        image: "image/item/TPmetal_ingot.png",
    });
    item_templates["暗影钢锭"] = new Material({
        id: "暗影钢锭",
        name: "暗影钢锭", 
        description: "由黑色刀币与魂魄重铸而成的金属。强度高达A4级——在血洛大陆，无用的物品不可能成为货币。", 
        value: 1.3e6,
        material_type: "metal",
        image: "image/item/darksteel_ingot.png",
    });

    
    item_templates["活化柳木"] = new Material({
        id: "活化柳木",
        name: "活化柳木", 
        description: "注入了荒兽的活性成分之后，导能更加强大的柳木", 
        value: 2.333e6,
        material_type: "wood",
        image: "image/item/active_salix.png",
    });
    item_templates["充能合金锭"] = new Material({
        id: "充能合金锭",
        name: "充能合金锭", 
        description: "可以通过多种手段熔炼的A6级合金。在清野江畔一带也很难找到更好的金属了。", 
        value: 6.666e6,
        material_type: "metal",
        image: "image/item/chargealloy_ingot.png",
    });
})();

//矿石
(function(){
    item_templates["紫铜矿"] = new OtherItem({
        id: "紫铜矿",
        name: "紫铜矿", 
        description: "普通的A1级金属矿石，可以使用毒液彻底炼化", 
        value: 2222,
        image: "image/item/purplecopper_ore.png",
    });
    item_templates["煤炭"] = new OtherItem({
        id: "煤炭",
        name: "煤炭", 
        description: "真正的煤炭！吸收了部分能量的它，可以提供比魔力碎晶高得多的温度。", 
        value: 999,
        image: "image/item/coal.png",
    });
    item_templates["百年柳木"] = new OtherItem({
        id: "百年柳木",
        name: "百年柳木", 
        description: "荒兽森林中常见的大树木材。材质相当好，适合传导力量。", 
        value: 320000,
        image: "image/item/salix_wood.png",
    });
})();

//任务物品
(function(){
    item_templates["地图-藏宝地"] = new OtherItem({
        id: "地图-藏宝地",
        name: "地图-藏宝地", 
        description: "绘制着最近新发现的一处藏宝地。(纳可已经记住地点，可以放心售卖)", 
        value: 999,
        image: "image/item/MT15.png",
    });
    
    item_templates["牵制-从入门到入土"] = new OtherItem({
        id: "牵制-从入门到入土",
        name: "牵制-从入门到入土", 
        description: "被完全涂黑了，只留下一句血洛大陆通用语的血书：牵制毁一生,匙弱穷三代。", 
        value: 11037,
        image: "image/item/BurnBlood.png",
    });
})();

//消耗品
    (function(){
    item_templates["微尘·凶兽肉排"] = new UsableItem({
        name: "微尘·凶兽肉排", 
        description: "煮熟的年幼凶兽肉排。食用后每秒回复40点血量，持续60秒",//血药模版 
        value: 20,
        effects: [{effect: "饱食", duration: 60}],
        image: "image/item/O1_cooked_meat.png",
    });
    item_templates["万物·凶兽肉排"] = new UsableItem({
        name: "万物·凶兽肉排", 
        description: "虽然颜色很奇怪但是真的能吃！食用后每秒回复80点血量，持续60秒",
        value: 240,
        effects: [{effect: "饱食 II", duration: 60}],
        image: "image/item/O5_cooked_meat.png",
    });
    item_templates["潮汐·凶兽肉排"] = new UsableItem({
        name: "潮汐·凶兽肉排", 
        description: "潮汐级凶兽的肉。不仅可以回血，还可以增加少许领悟！", 
        value: 6000,
        effects: [{effect: "饱食 III", duration: 60}],
        image: "image/item/O8_cooked_meat.png",
    });
    item_templates["地宫恢复药水"] = new UsableItem({
        name: "地宫恢复药水", 
        description: "它并不十分好喝。悲哀的是，地宫怪物的肉口感更糟...", 
        value: 210e3,
        effects: [{effect: "恢复 A1", duration: 60}],
        image: "image/item/A1_medicine.png",
    });
    item_templates["地宫狂暴药水"] = new UsableItem({
        name: "地宫狂暴药水", 
        description: "可以短时间内大幅增强你的力量。嘛，就是有一点副作用...", 
        value: 420e3,
        effects: [{effect: "强化 A1", duration: 30},{effect: "虚弱", duration: 90}],
        image: "image/item/A1_booster.png",
    });
    item_templates["地宫·荒兽肉排"] = new UsableItem({
        name: "地宫·荒兽肉排", 
        description: "大地级荒兽的肉。谢天谢地，地宫深处终于有有能吃的东西了。", 
        value: 500e3,
        effects: [{effect: "饱食 IV", duration: 90}],
        image: "image/item/A2_cooked_meat.png",
    });
    item_templates["森林·荒兽肉排"] = new UsableItem({
        name: "森林·荒兽肉排", 
        description: "大地级中期荒兽的肉。出了地宫之后，外面的荒兽好吃了不少。", 
        value: 1.8e6,
        effects: [{effect: "饱食 V", duration: 90}],
        image: "image/item/A4_cooked_meat.png",
    });
})();
//炼金
(function(){
    item_templates["粘合织料"] = new OtherItem({
        name: "粘合织料", 
        description: "涂抹了凝胶的飞蛾翅膀结合体，适合与皮肤亲密接触",
        value: 12,
        image: "image/item/mixed_comp01.png",
    });
    item_templates["润灵铜骨"] = new OtherItem({
        name: "润灵铜骨", 
        description: "用灵液将铜骨和天蚕丝融合的产物", 
        value: 10000,
        image: "image/item/aura_bone.png",
    });
    item_templates["活性织料"] = new OtherItem({
        name: "活性织料", 
        description: "有一定生命活性的耐极端环境混合物。其类似物曾被用于制造【黑神】套装。",
        value: 1.10e6,
        image: "image/item/mixed_comp02.png",
    });
})();

//宝石
(function(){
    item_templates["初始黄宝石"] = new UsableItem({
        name: "初始黄宝石", 
        description: "可以强化力量的晶体，使用时随机增加攻击/防御/敏捷1点或生命50点", 
        value: 1,
        image: "image/item/gem11_1.png",
        effects: [],
        gem_value: 1,
    });
    item_templates["初始蓝宝石"] = new UsableItem({
        name: "初始蓝宝石", 
        description: "可以强化力量的晶体，使用时随机增加攻击/防御/敏捷2点或生命100点",
        value: 2,
        image: "image/item/gem12_2.png",
        effects: [],
        gem_value: 2,
    });
    item_templates["初始红宝石"] = new UsableItem({
        name: "初始红宝石", 
        description: "可以强化力量的晶体，使用时随机增加攻击/防御/敏捷5点或生命250点",
        value: 5,
        image: "image/item/gem13_5.png",
        effects: [],
        gem_value: 5,
    });
    item_templates["初始绿宝石"] = new UsableItem({
        name: "初始绿宝石", 
        description: "可以强化力量的晶体，使用时随机增加攻击/防御/敏捷10点或生命500点", 
        value: 10,
        image: "image/item/gem14_10.png",
        effects: [],
        gem_value: 10,
    });
    item_templates["高级黄宝石"] = new UsableItem({
        name: "高级黄宝石", 
        description: "高阶的晶体，使用时随机增加攻击/防御/敏捷20点或生命1000点", 
        value: 20,
        image: "image/item/gem21_20.png",
        effects: [],
        gem_value: 20,
    });
    item_templates["高级蓝宝石"] = new UsableItem({
        name: "高级蓝宝石", 
        description: "高阶的晶体，使用时随机增加攻击/防御/敏捷50点或生命2500点",
        value: 50,
        image: "image/item/gem22_50.png",
        effects: [],
        gem_value: 50,
    });
    item_templates["高级红宝石"] = new UsableItem({
        name: "高级红宝石", 
        description: "高阶的晶体，使用时随机增加攻击/防御/敏捷100点或生命5000点",
        value: 100,
        image: "image/item/gem23_100.png",
        effects: [],
        gem_value: 100,
    });
    item_templates["高级绿宝石"] = new UsableItem({
        name: "高级绿宝石", 
        description: "高阶的晶体，使用时随机增加攻击/防御/敏捷200点或生命1万点", 
        value: 200,
        image: "image/item/gem24_200.png",
        effects: [],
        gem_value: 200,
    });
    item_templates["极品黄宝石"] = new UsableItem({
        name: "极品黄宝石", 
        description: "极为珍贵的晶体，使用时随机增加攻击/防御/敏捷500点或生命2.5万点", 
        value: 500,
        image: "image/item/gem31_500.png",
        effects: [],
        gem_value: 500,
    });
    item_templates["极品蓝宝石"] = new UsableItem({
        name: "极品黄宝石", 
        description: "极为珍贵的晶体，使用时随机增加攻击/防御/敏捷1000点或生命5万点", 
        value: 1000,
        image: "image/item/gem32_1k.png",
        effects: [],
        gem_value: 1000,
    });
    item_templates["极品红宝石"] = new UsableItem({
        name: "极品黄宝石", 
        description: "极为珍贵的晶体，使用时随机增加攻击/防御/敏捷2000点或生命10万点", 
        value: 2000,
        image: "image/item/gem33_2k.png",
        effects: [],
        gem_value: 2000,
    });
    item_templates["极品绿宝石"] = new UsableItem({
        name: "极品黄宝石", 
        description: "极为珍贵的晶体，使用时随机增加攻击/防御/敏捷5000点或生命25万点", 
        value: 5000,
        image: "image/item/gem34_5k.png",
        effects: [],
        gem_value: 5000,
    });
})();



//怪物掉落
(function(){
    item_templates["凝胶"] = new Loot({
        name: "凝胶", 
        description: "从死去的史莱姆中发现的凝胶。可以用作缓冲垫，但并不耐用。", 
        value: 1,
        image: "image/item/rubber.png",
    });
    item_templates["金属残片"] = new Loot({
        name: "金属残片", 
        description: "损坏的普通金属片。已经无法用于制造剑盾，但或许还能重新熔炼？", 
        value: 4,
        image: "image/item/iron_fragment.png",
    });
    item_templates["魔力碎晶"] = new Loot({
        name: "魔力碎晶", 
        description: "一小块残留着魔力的水晶。内部的能量仍然足以烤肉或炼铁。",//烤肉 
        value: 6,
        image: "image/item/magic_fragment.png",
    });
    item_templates["飞蛾翅膀"] = new Loot({
        name: "飞蛾翅膀", 
        description: "飞蛾留下的完整翅膀。可以用作衣服的材料", 
        value: 8,
        image: "image/item/fly_wing.png",
    });
    item_templates["坚硬石块"] = new Loot({
        name: "坚硬石块", 
        description: "燕岗城郊山上的大块石头，废弃傀儡和石头人也是它们制造的。", 
        value: 5,
        image: "image/item/hard_rock.png",
    });
    item_templates["微尘·凶兽肉块"] = new Loot({
        name: "微尘·凶兽肉块", 
        description: "微尘级凶兽的肉。散发着腥味，或许需要烤一烤？", //加魔力碎晶
        value: 8,
        image: "image/item/O1_meat.png",
    });
    item_templates["骨头"] = new Loot({
        name: "骨头", 
        description: "一根粗大的骨头。光是拿着就感觉阴森森的..", 
        value: 6,
        image: "image/item/bone.png",
    });
    item_templates["铜骨"] = new Loot({
        name: "铜骨", 
        description: "万物级骷髅死后留下的青铜骨头。它的硬度和韧性都很不错！", 
        value: 20,
        image: "image/item/copper_bone.png",
    });
    item_templates["铜板"] = new Loot({
        name: "铜板", 
        description: "燕岗领铸造的通用钱币", 
        value: 1,
        image: "image/item/1C.png",
    });
    item_templates["大铜板"] = new Loot({
        name: "大铜板", 
        description: "燕岗领铸造的通用钱币，面值5C", 
        value: 5,
        image: "image/item/5C.png",
    });


    //1-2
    item_templates["万物·凶兽肉块"] = new Loot({
        name: "万物·凶兽肉块", 
        description: "万物级凶兽的肉。蕴含的气血充沛，价格略高。", //加魔力碎晶
        value: 200,
        image: "image/item/O5_meat.png",
    });
    item_templates["合金残片"] = new Loot({
        name: "合金残片", 
        description: "傀儡身上的特殊金属，掺杂在铁锭中可以增强硬度", 
        value: 150,
        image: "image/item/alloy_fragment.png",
    });
    item_templates["异兽皮"] = new Loot({
        name: "异兽皮", 
        description: "万物级异兽的皮毛，兼具硬度和韧性", 
        value: 500,
        image: "image/item/O5_leather.png",
    });

    //1-3
    item_templates["毒液"] = new Loot({
        name: "毒液", 
        description: "郊外常见的毒素集合体。A1级合金“紫铜”需要它作为原材料。", 
        value: 2000,
        image: "image/item/poison_drop.png",
    });
    item_templates["灵液"] = new Loot({
        name: "灵液", 
        description: "潮汐级魔物的精华，具有多种优异性能。", 
        value: 2500,
        image: "image/item/aura_drop.png",
    });
    item_templates["天蚕丝"] = new Loot({
        name: "天蚕丝", 
        description: "切叶虫茧的构建材料，蕴含有风元素。初步具有智慧的潮汐级凶兽也常常携带着它。", 
        value: 3000,
        image: "image/item/sky_silk.png",
    });
    item_templates["潮汐·凶兽肉块"] = new Loot({
        name: "潮汐·凶兽肉块", 
        description: "潮汐级凶兽的肉。蕴含有元素之力，没有煤炭火焰难以煮熟。", 
        value: 5000,
        image: "image/item/O8_meat.png",
    });

    //1-4
    item_templates["大地级魂魄"] = new Loot({
        name: "大地级魂魄", 
        description: "纯灵体荒兽体内的魂魄。经处理后可以成为纯净的能量。", 
        value: 80e3,
        image: "image/item/A1_soul.png",
    });
    item_templates["巨型眼球"] = new Loot({
        name: "巨型眼球", 
        description: "大地级荒兽的眼球，可以作为生命恢复药剂的素材", 
        value: 100e3,
        image: "image/item/A1_eye.png",
    });
    item_templates["A1·能量核心"] = new Loot({
        name: "A1·能量核心", 
        description: "部分“内丹”修炼体系荒兽体内的核心。可以在短时间内诱导出巨大的力量。", 
        value: 120e3,
        image: "image/item/A1_crystal.png",
    });
    item_templates["断剑"] = new Loot({
        name: "断剑", 
        description: "荒兽使用的土制低劣武器。虽然本身易于断裂，但是它的潜力不止于此", 
        value: 80e3,
        image: "image/item/A1_sword.png",
    });
    //1-5
    item_templates["地宫·荒兽肉块"] = new Loot({
        name: "地宫·荒兽肉块", 
        description: "地宫核心可以吃的荒兽肉！原来是能吃的荒兽都跑到核心去了嘛？", 
        value: 300e3,
        image: "image/item/A2_meat.png",
    });
    item_templates["霜炙皮草"] = new Loot({
        name: "霜炙皮草", 
        description: "可以耐受极寒与炙热的皮草，只能从大地级荒兽中获取", 
        value: 400e3,
        image: "image/item/temp_leather.png",
    });
    item_templates["流动凝胶"] = new Loot({
        name: "流动凝胶", 
        description: "大地级流动怪物死后留下的凝胶。比起潮汐级以下的死物，它们仍然保有一定的活性。", 
        value: 500e3,
        image: "image/item/living_rubber.png",
    });
    item_templates["黑色刀币"] = new Loot({
        name: "黑色刀币", 
        description: "血洛大陆的通用钱币。1Z=1000X=1'000'000C.", 
        value: 1e6,
        image: "image/item/1Z.png",
    });

    //1-5
    //2-1
    item_templates["一丝荒兽森林感悟"] = new Loot({
        name: "一丝荒兽森林感悟", 
        description: "在荒兽森林的战斗中，积累的战斗经验和突破感悟。(已弃用/现版本无法获取/请去找心之石像白嫖一颗突破)", 
        value: 0,
        image: "image/item/A1_break_trance.png",
    });
    item_templates["凝实荒兽森林感悟"] = new  UsableItem({
        name: "凝实荒兽森林感悟", 
        description: "对细碎战斗感悟整理而成的完整感悟，可以用于突破大地级或积累经验值。", 
        value: 0,
        E_value: 1000000,
        effects:[],
        C_value: 1,
        image: "image/item/A1_break_clump.png",
    });
    item_templates["A4·能量核心"] = new Loot({
        name: "A4·能量核心", 
        description: "部分“内丹”修炼体系荒兽体内的核心。可以在短时间内诱导出巨大的力量。", 
        value: 960e3,
        image: "image/item/A4_crystal.png",
    });
    item_templates["森林·荒兽肉块"] = new Loot({
        name: "森林·荒兽肉块", 
        description: "作为以荒兽闻名的森林，这里的肉比地宫多多了...", 
        value: 1.2e6,
        image: "image/item/A4_meat.png",
    });
    item_templates["甲壳碎片"] = new Loot({
        name: "甲壳碎片", 
        description: "有坚硬外骨骼荒兽的甲壳碎片。用于熔炼A6级充能合金。", 
        value: 1.35e6,
        image: "image/item/A4_fragment.png",
    });
    item_templates["荒兽精华"] = new Loot({
        name: "荒兽精华", 
        description: "虽然它既不好吃还没有壳，但是它的心头血还是能量充沛的。", 
        value: 1.5e6,
        image: "image/item/beast_essence.png",
    });


    //以下为打钱的东西
    item_templates["五彩凝胶"] = new Loot({
        name: "五彩凝胶", 
        description: "完整，色彩鲜艳的凝胶。能卖个好价钱！", 
        value: 75,
        image: "image/item/rubber_colorful.png",
    });
    item_templates["银钱"] = new Loot({
        name: "银钱", 
        description: "燕岗领铸造的通用钱币，面值100C", 
        value: 100,
        image: "image/item/100C.png",
    });
    item_templates["红色刀币"] = new Loot({
        name: "红色刀币", 
        description: "血洛大陆的通用钱币，面值1X=1000C", 
        value: 1e3,
        image: "image/item/1X.png",
    });
})();


Object.keys(item_templates).forEach(id => {
    item_templates[id].id = id;
})

export {
    item_templates, 
    Item, OtherItem, UsableItem, 
    Armor, Shield, Weapon, Artifact, Book, 
    WeaponComponent, ArmorComponent, ShieldComponent,
    getItem, setLootSoldCount, recoverItemPrices, round_item_price, getArmorSlot, getEquipmentValue,
    book_stats, loot_sold_count,
    rarity_multipliers
};
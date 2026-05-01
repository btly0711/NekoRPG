"use strict";

import { character } from "./character.js";
import {item_templates, getItem} from "./items.js";

let enemy_templates = {};
let enemy_killcount = {};
//enemy templates; locations create new enemies based on them

class Enemy {
    constructor({name, 
                 description, 
                 xp_value = 1, 
                 stats, 
                 rank,
                 loot_list = [], 
                 size = "small",
                 add_to_bestiary = true,
                 tags = [],
                 realm = 1,
                 spec = [],
                 loot_multi = 1,
                 spec_value = {},
                 image = "",
                }) {
                    
        this.name = name;
        this.rank = rank; //only for the bestiary order; higher rank => higher in display
        this.description = description; //try to keep it short
        this.xp_value = xp_value;
        this.stats = stats;
        this.loot_multi = loot_multi;
        this.spec = spec;
        this.spec_value = spec_value;
        this.image = image;//image
        //only ma.gic & defense can be 0 in stats, other things will cause issues
        this.stats.max_health = stats.health;
        this.loot_list = loot_list;
        this.tags = {};
        this.realm = realm;
        for(let i = 0; i <tags.length; i++) {
            this.tags[tags[i]] = true;
        }
        this.tags[size] = true;

        this.add_to_bestiary = add_to_bestiary; //generally set it false only for SOME of challenges and keep true for everything else

        if(size !== "small" && size !== "medium" && size !== "large") {
            this.size = "small";
            //throw new Error(`No such enemy size option as "size"!`);
        } else {
            this.size = size;
        }

    }
    get_loot() {
        // goes through items and calculates drops
        // result is in form [{item: Item, count: item_count}, {...}, {...}]
        let loot = [];
        let item;
        for (let i = 0; i < this.loot_list.length; i++) {
            item = this.loot_list[i];
            if(!item_templates[item.item_name]) {
                console.warn(`Tried to loot an item "${item.item_name}" from "${this.name}", but such an item doesn't exist!`);
                continue;
            }
            
            let raw_chance = item.chance * this.get_droprate_modifier() ;
            if(item.ignore_luck) raw_chance = item.chance;
            let item_count = 0;
            item_count = Math.floor(raw_chance);
            let final_chance = raw_chance - item_count;
            if (final_chance>= Math.random()) item_count ++;
            // if ("count" in item) {
            //     item_count = Math.round(Math.random() * (item["count"]["max"] - item["count"]["min"]) + item["count"]["min"]);
            //     // calculates how much drops (from range min-max, both inclusive
            //   getItem({...item_templates[result_id], quality: selected_recipe.Q_able}))
            // }
                
            if(item_count != 0){
                if(item.quality != undefined) loot.push({ "item": getItem({...item_templates[item.item_name],quality:item.quality}), "count": item_count });
                else loot.push({ "item": getItem(item_templates[item.item_name]), "count": item_count });
            }
        }

        return loot;
    }

    get_droprate_modifier() {
        let droprate_modifier = this.loot_multi;
        droprate_modifier *= character.stats.full.luck;
        //console.log(character.stats.full.luck);
        /*
        if(enemy_killcount[this.name] >= 999) {
            droprate_modifier = 0.1;
        } else if(enemy_killcount[this.name]) {
            droprate_modifier = 111/(111+enemy_killcount[this.name]);
        }
        */
        return droprate_modifier;
    }
}

//regular enemies
(function(){
    /*
    lore note:
    wolf rats are semi-ma.gical creatures that feed on natural ma.gical energy; cave near the village, where they live, is filled up with it on lower levels, 
    providing them with a perfect environment;
    rats on the surface are ones that were kicked out (because space is limited and they were weak), half starving and trying to quench their hunger by eating plants and stuff
    

    */
    enemy_templates["Starving wolf rat"] = new Enemy({
        name: "Starving wolf rat", 
        description: "Rat with size of a dog, starved and weakened", 
        xp_value: 1, 
        rank: 1,
        size: "small",
        tags: ["living", "beast", "wolf rat", "pest"],
        stats: {health: 2, attack: 5, agility: 6, attack_speed: 0.8, defense: 1}, 
        loot_list: [
            {item_name: "Rat tail", chance: 0.04},
            {item_name: "Rat fang", chance: 0.04},
            {item_name: "Rat pelt", chance: 0.01}
        ]
    });

    enemy_templates["Wolf rat"] = new Enemy({
        name: "Wolf rat", 
        description: "Rat with size of a dog",
        xp_value: 1, 
        rank: 1,
        size: "small",
        tags: ["living", "beast", "wolf rat", "pest"],
        stats: {health: 3, attack: 7, agility: 18, dexterity: 6, intuition: 7, attack_speed: 1, defense: 2}, 
        loot_list: [
            {item_name: "Rat tail", chance: 0.04},
            {item_name: "Rat fang", chance: 0.04},
            {item_name: "Rat pelt", chance: 0.01},
        ]
    });
    enemy_templates["Elite wolf rat"] = new Enemy({
        name: "Elite wolf rat",
        description: "Rat with size of a dog, much more ferocious than its relatives",
        xp_value: 4, 
        rank: 1,
        size: "small",
        tags: ["living", "beast", "wolf rat", "pest"],
        stats: {health: 80, attack: 32, agility: 30, dexterity: 24, intuition: 24, attack_speed: 1.5, defense: 8}, 
        loot_list: [
            {item_name: "Rat tail", chance: 0.04},
            {item_name: "Rat fang", chance: 0.04},
            {item_name: "Rat pelt", chance: 0.02},
        ]
    });
    enemy_templates["Elite wolf rat guardian"] = new Enemy({
        name: "Elite wolf rat guardian",
        description: "It's no longer dog-sized, but rather around the size of an average wolf, with thicker skin, longer claws and pure insanity in the eyes",
        xp_value: 10, 
        rank: 4,
        size: "medium",
        tags: ["living", "beast", "wolf rat", "monster"],
        stats: {health: 250, attack: 50, agility: 40, dexterity: 40, intuition: 50, attack_speed: 1.2, defense: 30},
        loot_list: [
            {item_name: "Rat tail", chance: 0.04},
            {item_name: "Rat fang", chance: 0.04},
            {item_name: "Rat pelt", chance: 0.02},
            {item_name: "Weak monster bone", chance: 0.005},
        ]
    });

    enemy_templates["Starving wolf"] = new Enemy({
        name: "Starving wolf", description: "A large, wild and hungry canine", 
        xp_value: 3, 
        rank: 2,
        tags: ["living", "beast"],
        stats: {health: 150, attack: 25, agility: 34, dexterity: 34, intuition: 32, attack_speed: 1, defense: 12}, 
        loot_list: [
            {item_name: "Wolf fang", chance: 0.03},
            {item_name: "Wolf pelt", chance: 0.01},
        ],
        size: "medium",
    });

    enemy_templates["Young wolf"] = new Enemy({
        name: "Young wolf", 
        description: "A small, wild canine", 
        xp_value: 3, 
        rank: 2,
        tags: ["living", "beast"],
        stats: {health: 120, attack: 25, agility: 34, dexterity: 30, intuition: 24, attack_speed: 1.4, defense: 6}, 
        loot_list: [
            {item_name: "Wolf fang", chance: 0.03},
            {item_name: "Wolf pelt", chance: 0.01},
        ],
        size: "small",
    });

    enemy_templates["Wolf"] = new Enemy({
        name: "Wolf", 
        description: "A large, wild canine", 
        xp_value: 4, 
        rank: 3,
        tags: ["living", "beast"],
        stats: {health: 200, attack: 35, agility: 42, dexterity: 42, intuition: 32, attack_speed: 1.3, defense: 20}, 
        loot_list: [
            {item_name: "Wolf fang", chance: 0.04},
            {item_name: "Wolf pelt", chance: 0.02},
            {item_name: "High quality wolf fang", chance: 0.0005}
        ],
        size: "medium"
    });

    enemy_templates["Boar"] = new Enemy({
        name: "Boar", 
        description: "A large wild creature, with thick skin and large tusks", 
        xp_value: 8,
        rank: 4,
        tags: ["living", "beast"],
        stats: {health: 300, attack: 40, agility: 30, dexterity: 40, intuition: 40, attack_speed: 1, defense: 25},
        loot_list: [
            {item_name: "Boar hide", chance: 0.04},
            {item_name: "Boar meat", chance: 0.02},
            {item_name: "High quality boar tusk", chance: 0.0005},
        ],
        size: "medium"
    });

    //from now on,it's NekoRPG enemies!
    //seems rank only affacts sorting
    //基本上，rank按照纳可的[X幕X区]划分，如前10层的rank统一为11.
    //realm = 纳可中的境界
    //名称和颜色都由realm决定

    //白色境界：
    //敏捷参考值:1/2/6/16/40/100/240/550/1.3k（+版+50%）
    //速度参考值:1.0/1.0/1.0/1.1/1.1/1.1/1.2/1.2/1.2
    //参考掉落概率4%,同种掉落更高级的提升
    //经验获取：1个境界1次斐波那契
    
    


    enemy_templates["毛茸茸"] = new Enemy({
        name: "毛茸茸", 
        description: "普通的浅色史莱姆", 
        xp_value: 1, 
        rank: 1101,
        image: "image/enemy/E1101.png",
        realm: "<span class=realm_basic><b>微尘级初级</b></span>",
        size: "small",
        tags: [],
        stats: {health: 3, attack: 3, agility: 1, attack_speed: 1, defense: 0}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.04},
            {item_name: "初始黄宝石", chance:0.015},
            //0.05C(=)
        ]
    });

    enemy_templates["武装毛茸茸"] = new Enemy({
        name: "武装毛茸茸", 
        description: "获得了剑盾的浅色史莱姆，但是它也被拖累了速度", 
        xp_value: 1, 
        rank: 1102,
        image: "image/enemy/E1102.png",
        realm: "<span class=realm_basic><b>微尘级初级</b></span>",
        size: "small",
        tags: [],
        stats: {health: 4, attack: 4, agility: 1, attack_speed: 0.8, defense: 0}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.01},
            {item_name: "金属残片", chance:0.01},
            {item_name: "初始黄宝石", chance:0.015},
            //0.06C(+0.01C)
        ],
    });

    enemy_templates["红毛茸茸"] = new Enemy({
        name: "红毛茸茸", 
        description: "变种史莱姆，综合实力比普通史莱姆更强", 
        xp_value: 1, 
        rank: 1103,
        image: "image/enemy/E1103.png",
        realm: "<span class=realm_basic><b>微尘级初级 +</b></span>",
        size: "small",
        tags: [],
        
        stats: {health: 5, attack: 6, agility: 1.5, attack_speed: 1.0, defense: 0}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.06},
            {item_name: "初始黄宝石", chance:0.015},
            //0.07C(-0.01C)
        ],
    });

    enemy_templates["小飞蛾"] = new Enemy({
        name: "小飞蛾", 
        description: "体型较小的飞蛾，飞行能力使它变得十分灵活", 
        xp_value: 1, 
        rank: 1104,
        image: "image/enemy/E1104.png",
        realm: "<span class=realm_basic><b>微尘级初级 +</b></span>",
        size: "small",
        tags: [],
        
        spec: [2],

        stats: {health: 3, attack: 10, agility: 4, attack_speed: 1.0, defense: 0}, 
        loot_list: [
            {item_name: "飞蛾翅膀", chance: 0.01},
            {item_name: "初始黄宝石", chance:0.015},
            
            //0.09C(+0.01C)
        ],
    });

    enemy_templates["骸骨"] = new Enemy({
        name: "骸骨", 
        description: "最弱小的亡灵生物", 
        xp_value: 2, 
        rank: 1105,
        image: "image/enemy/E1105.png",
        realm: "<span class=realm_basic><b>微尘级中级</b></span>",
        size: "small",
        tags: [],
        
        spec: [],

        stats: {health: 12, attack: 7, agility: 1.8, attack_speed: 1.0, defense: 1}, 
        loot_list: [
            {item_name: "骨头", chance: 0.02},
            {item_name: "初始黄宝石", chance:0.045},
            
            //0.15C(-0.02C)
        ],
    });

    enemy_templates["武装红毛茸茸"] = new Enemy({
        name: "武装红毛茸茸", 
        description: "获得了剑盾的变种史莱姆，它已经不会被拖累了！", 
        xp_value: 2, 
        rank: 1106,
        image: "image/enemy/E1106.png",
        realm: "<span class=realm_basic><b>微尘级中级</b></span>",
        size: "small",
        tags: [],
        stats: {health: 10, attack: 8, agility: 2.2, attack_speed: 1.0, defense: 2}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.06},
            {item_name: "金属残片", chance:0.02},
            {item_name: "初始黄宝石", chance:0.045},
            //0.17C(+0.01C)
        ],
    });

    enemy_templates["少年法师"] = new Enemy({
        name: "少年法师", 
        description: "幼小的法师。魔法攻击可以无视他人的防御，但他本身相当脆弱", 
        xp_value: 2, 
        rank: 1107,
        image: "image/enemy/E1107.png",
        realm: "<span class=realm_basic><b>微尘级中级 +</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 6, attack: 3, agility: 3, attack_speed: 1.0, defense: 3}, 
        loot_list: [
            {item_name: "魔力碎晶", chance: 0.03},
            {item_name: "初始黄宝石", chance:0.045},
            
            //0.27C(+0.01C)
        ],
    });

    enemy_templates["微尘级野兽"] = new Enemy({
        name: "微尘级野兽", 
        description: "血洛大陆的幼年野兽，肉质鲜美多汁", 
        xp_value: 2, 
        rank: 1108,
        image: "image/enemy/E1108.png",
        realm: "<span class=realm_basic><b>微尘级中级 +</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 14, attack: 12, agility: 3, attack_speed: 1.0, defense: 2}, 
        loot_list: [
            {item_name: "微尘·凶兽肉块", chance: 0.01},
            {item_name: "骨头", chance: 0.01},
            {item_name: "初始黄宝石", chance:0.045},

            //0.27C(+0.01C)
        ],
    });

    enemy_templates["废弃傀儡"] = new Enemy({
        name: "废弃傀儡", 
        description: "能量几乎耗竭的岩石傀儡，仅剩下微尘高级实力", 
        xp_value: 3, 
        rank: 1109,
        image: "image/enemy/E1109.png",
        realm: "<span class=realm_basic><b>微尘级高级</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 15, attack: 18, agility: 6, attack_speed: 1.0, defense: 6}, 
        loot_list: [
            {item_name: "坚硬石块", chance: 0.04},
            {item_name: "魔力碎晶", chance: 0.04},
            {item_name: "初始黄宝石", chance:0.075},
            
            //0.47C(-0.03C)
        ],
    });

    enemy_templates["黑毛茸茸"] = new Enemy({
        name: "黑毛茸茸", 
        description: "体型大了一圈的变异史莱姆，实力超过它的同类", 
        xp_value: 3, 
        rank: 1110,
        image: "image/enemy/E1110.png",
        realm: "<span class=realm_basic><b>微尘级高级</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 8, attack: 16, agility: 6, attack_speed: 1.0, defense: 3}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.10},
            {item_name: "魔力碎晶", chance: 0.04},
            {item_name: "初始黄宝石", chance:0.075},
            //0.39C(-0.11C)
        ],
    });

    enemy_templates["荧光飞蛾"] = new Enemy({
        name: "荧光飞蛾", 
        description: "发出闪亮荧光的变种飞蛾，继承了小飞蛾的灵活性", 
        xp_value: 3, 
        rank: 1111,
        image: "image/enemy/E1111.png",
        realm: "<span class=realm_basic><b>微尘级高级 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 42, attack: 21, agility: 16, attack_speed: 1.0, defense: 0}, 
        loot_list: [
            {item_name: "飞蛾翅膀", chance: 0.04},
            {item_name: "魔力碎晶", chance: 0.06},
            {item_name: "初始黄宝石", chance:0.075},
            //0.73C(-0.07C)
        ],
    });

    enemy_templates["橙毛茸茸"] = new Enemy({
        name: "橙毛茸茸", 
        description: "另一种高级变异史莱姆。全方位比黑色版本强大一些", 
        xp_value: 3, 
        rank: 1112,
        image: "image/enemy/E1112.png",
        realm: "<span class=realm_basic><b>微尘级高级 +</b></span>",
        size: "small",
        spec: [2],
        tags: [],
        stats: {health: 20, attack: 30, agility: 12, attack_speed: 1.0, defense: 5}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.1},
            {item_name: "五彩凝胶", chance: 0.01},
            {item_name: "初始黄宝石", chance:0.075},
            //0.90C(+0.01C)
        ],
    });

    enemy_templates["聚灵骸骨"] = new Enemy({
        name: "聚灵骸骨", 
        description: "它的剑盾是它靠自己的实力抢来的！切莫大意！", 
        xp_value: 3, 
        rank: 1113,
        image: "image/enemy/E1113.png",
        realm: "<span class=realm_basic><b>微尘级高级 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 40, attack: 21, agility: 10, attack_speed: 1.0, defense: 9}, 
        loot_list: [
            {item_name: "骨头", chance: 0.1},
            {item_name: "金属残片", chance: 0.08},
            {item_name: "魔力碎晶", chance: 0.05},
            {item_name: "初始黄宝石", chance:0.075},

            //1.27C(+0.47C)   
        ],
    });

    enemy_templates["大飞蛾"] = new Enemy({
        name: "大飞蛾", 
        description: "更大只的飞蛾，灵活性不佳，但它会2连击！", 
        xp_value: 3, 
        rank: 1114,
        image: "image/enemy/E1114.png",
        realm: "<span class=realm_basic><b>微尘级高级 +</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 33, attack: 18, agility: 8, attack_speed: 1.0, defense: 9}, 
        loot_list: [
            {item_name: "飞蛾翅膀", chance: 0.1},
            {item_name: "初始黄宝石", chance:0.075},
            //0.45C(-0.35C)
        ],

    });

    //以下是万物级怪物-NekoRPG-

    enemy_templates["血洛游卒"] = new Enemy({
        name: "血洛游卒", 
        description: "相传每一个经过心境1的人都对它有些阴影..", 
        xp_value: 5, 
        rank: 1115,
        image: "image/enemy/E1115.png",
        realm: "<span class=realm_basic><b>万物级初等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 32, attack: 45, agility: 16, attack_speed: 1.1, defense: 8}, 
        loot_list: [
            {item_name: "魔力碎晶", chance: 0.1},
            {item_name: "金属残片", chance: 0.1},
            {item_name: "初始黄宝石", chance:0.12},
            //1.08C(-0.52C)
        ],
    });

    enemy_templates["石精"] = new Enemy({
        name: "石精", 
        description: "每次打它，它最多只会掉1滴血~", 
        xp_value: 5, 
        rank: 1116,
        image: "image/enemy/E1116.png",
        realm: "<span class=realm_basic><b>万物级初等</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 4, attack: 36, agility: 12, attack_speed: 1.1, defense: 0}, 
        loot_list: [
            {item_name: "坚硬石块", chance: 0.2},
            {item_name: "魔力碎晶", chance: 0.04},
            {item_name: "初始黄宝石", chance:0.12},
            //1.32C(-0.28C)
        ],
    });

    enemy_templates["弱小意念"] = new Enemy({
        name: "弱小意念", 
        description: "噩梦的具象化，却拥有和梦境一般多彩的掉落。！", 
        xp_value: 5, 
        rank: 1117,
        image: "image/enemy/E1117.png",
        realm: "<span class=realm_basic><b>万物级初等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 48, attack: 49, agility: 20, attack_speed: 1.1, defense: 12}, 
        loot_list: [
            {item_name: "初始黄宝石", chance:0.12},
            {item_name: "五彩凝胶", chance: 0.04},
            //3.08C(+1.48C)
        ],
    });

    enemy_templates["聚魂骸骨"] = new Enemy({
        name: "聚魂骸骨", 
        description: "它已经将自身的骨头淬炼至青铜色，可见实力之不俗", 
        xp_value: 5, 
        rank: 1118,
        image: "image/enemy/E1118.png",
        realm: "<span class=realm_basic><b>万物级初等</b></span>",
        size: "small",
        spec: [4],
        tags: [],
        stats: {health: 40, attack: 63, agility: 24, attack_speed: 1.1, defense: 14}, 
        loot_list: [
            {item_name: "铜骨", chance: 0.1},
            {item_name: "初始黄宝石", chance:0.12},
            //2.08C(+0.48C)
        ],
    });
    enemy_templates["青年法师"] = new Enemy({
        name: "青年法师", 
        description: "稍微年长的法师。依然可以无视防御，而且实力强大了许多", 
        xp_value: 5, 
        rank: 1119,
        image: "image/enemy/E1119.png",
        realm: "<span class=realm_basic><b>万物级初等</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 70, attack: 17, agility: 24, attack_speed: 1.1, defense: 17}, 
        loot_list: [
            {item_name: "魔力碎晶", chance: 0.15},
            {item_name: "初始黄宝石", chance:0.12},
            //0.98C(-0.62C)
        ],
    });
    enemy_templates["武装橙毛茸茸"] = new Enemy({
        name: "武装橙毛茸茸", 
        description: "相传普通/武装史莱姆的颜色将会随实力呈彩虹递变...", 
        xp_value: 5, 
        rank: 1120,
        image: "image/enemy/E1120.png",
        realm: "<span class=realm_basic><b>万物级初等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 120, attack: 56, agility: 24, attack_speed: 1.1, defense: 16}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.1},
            {item_name: "五彩凝胶", chance: 0.02},
            {item_name: "金属残片", chance:0.15},
            {item_name: "初始黄宝石", chance:0.12},
            {item_name: "初始蓝宝石", chance:0.015},

            //2.30C(-0.26C)
        ],
    });
    enemy_templates["万物级凶兽"] = new Enemy({
        name: "万物级凶兽", 
        description: "进化阶段与微尘级凶兽类似，但更大的体型赋予了它更强的力量..和更多的肉。", 
        xp_value: 5, 
        rank: 1121,
        image: "image/enemy/E1121.png",
        realm: "<span class=realm_basic><b>万物级初等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 360, attack: 50, agility: 24, attack_speed: 1.1, defense: 24}, 
        loot_list: [
            {item_name: "微尘·凶兽肉块", chance: 0.2},
            {item_name: "金属残片", chance:0.15},
            {item_name: "初始黄宝石", chance:0.12},
            {item_name: "初始蓝宝石", chance:0.015},

            //2.40C(-0.16C)
        ],
    });
    enemy_templates["习武孩童"] = new Enemy({
        name: "习武孩童", 
        description: "偷偷跑到纳家学功法的别人家小孩——该罚！", 
        xp_value: 5, 
        rank: 1122,
        image: "image/enemy/E1122.png",
        realm: "<span class=realm_basic><b>万物级初等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 120, attack: 72, agility: 24, attack_speed: 1.1, defense: 15}, 
        loot_list: [
            {item_name: "铜板", chance:0.4},
            {item_name: "铜板", chance:0.4},
            {item_name: "铜板", chance:0.4},
            {item_name: "大铜板", chance:0.2},
            {item_name: "初始黄宝石", chance:0.12},
            {item_name: "初始蓝宝石", chance:0.015},

            //2.30C(-0.26C)
        ],
    });
    enemy_templates["出芽茸茸"] = new Enemy({
        name: "出芽茸茸", 
        description: "那颗芽是它修为的结晶！但万物级的一个铜板都卖不出去就是啦..", 
        xp_value: 8, 
        rank: 1123,
        image: "image/enemy/E1123.png",
        realm: "<span class=realm_basic><b>万物级高等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 180, attack: 84, agility: 40, attack_speed: 1.1, defense: 18}, 
        loot_list: [
            {item_name: "凝胶", chance: 0.1},
            {item_name: "魔力碎晶", chance: 0.1},
            {item_name: "五彩凝胶", chance: 0.05},
            {item_name: "初始黄宝石", chance:0.06},
            {item_name: "初始蓝宝石", chance:0.045},
            //4.55C(-0.55C)
        ],
    });
    enemy_templates["试炼木偶"] = new Enemy({
        name: "试炼木偶", 
        description: "Ave Musica 奇跡を日常に(Fortuna)...不是这种人偶！", 
        xp_value: 8, 
        rank: 1124,
        image: "image/enemy/E1124.png",
        realm: "<span class=realm_basic><b>万物级高等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 240, attack: 69, agility: 40, attack_speed: 1.1, defense: 35}, 
        loot_list: [
            {item_name: "魔力碎晶", chance: 1},
            {item_name: "初始黄宝石", chance:0.06},
            {item_name: "初始蓝宝石", chance:0.045},
            //4.10C(-0.90C)
        ],
    });
    //1-2 below  
    enemy_templates["纳家待从"] = new Enemy({
        name: "纳家待从", 
        description: "普通的纳家随从。因为在城内大街上，出手点到为止。", 
        xp_value: 13, 
        rank: 1201,
        image: "image/enemy/E1201.png",
        realm: "<span class=realm_basic><b>万物级巅峰</b></span>",
        size: "small",
        spec: [5],
        tags: [],
        stats: {health: 344, attack: 111, agility: 60, attack_speed: 1.1, defense: 44} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.008},
            {item_name: "银钱", chance: 0.1},
            {item_name: "金属残片", chance:0.4},
            //~16C
        ],
    });
    enemy_templates["轻型傀儡"] = new Enemy({
        name: "轻型傀儡", 
        description: "上漆铁皮做成的傀儡，比它那石头兄弟强大一些。", 
        xp_value: 8, 
        rank: 1202,
        image: "image/enemy/E1202.png",
        realm: "<span class=realm_basic><b>万物级高等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 150, attack: 103, agility: 80, attack_speed: 1.2, defense: 33} , //都说了是轻型的！
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.008},
            {item_name: "金属残片", chance:0.3},
            {item_name: "合金残片", chance:0.05},
            //~9C
        ],
    });
    enemy_templates["出芽红茸茸"] = new Enemy({
        name: "出芽红茸茸", 
        description: "茸茸家族的另一个成员——尽管它只比出牙茸茸强大了一丝。", 
        xp_value: 8, 
        rank: 1203,
        image: "image/enemy/E1203.png",
        realm: "<span class=realm_basic><b>万物级高等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 97, attack: 97, agility: 60, attack_speed: 1.1, defense: 42} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.008},
            {item_name: "凝胶", chance:0.3},
            {item_name: "五彩凝胶", chance:0.1},
            {item_name: "魔力碎晶", chance:0.1},
            //~9C
        ],
    });
    enemy_templates["万物级异兽"] = new Enemy({
        name: "万物级异兽", 
        description: "掌握着牵制力量的异兽。在能量加持下，它的肉营养十分丰富。", 
        xp_value: 8, 
        rank: 1204,
        image: "image/enemy/E1204.png",
        realm: "<span class=realm_basic><b>万物级高等 +</b></span>",
        size: "small",
        spec: [5],
        tags: [],
        stats: {health: 840, attack: 128, agility: 60, attack_speed: 1.2, defense: 16} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "万物·凶兽肉块", chance:0.03},
            {item_name: "异兽皮", chance:0.01},
            //~9C
        ],
    });
    enemy_templates["高速傀儡"] = new Enemy({
        name: "高速傀儡", 
        description: "轻便合金做成的傀儡，为了速度舍弃了防御", 
        xp_value: 13, 
        rank: 1205,
        image: "image/enemy/E1205.png",
        realm: "<span class=realm_basic><b>万物级巅峰</b></span>",
        size: "small",
        spec: [6],
        tags: [],
        stats: {health: 150, attack: 180, agility: 120, attack_speed: 1.1, defense: 0} , //不要忘记agi基准值是80，spd基准值还是1.1
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.015},
            {item_name: "金属残片", chance:0.2},
            {item_name: "合金残片", chance:0.1}
            //~16C
        ],
    });//需要3连击
    enemy_templates["黄毛茸茸"] = new Enemy({
        name: "黄毛茸茸", 
        description: "学会了魔攻的血牛茸茸！", 
        xp_value: 13, 
        rank: 1206,
        image: "image/enemy/E1206.png",
        realm: "<span class=realm_basic><b>万物级巅峰</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 600, attack: 20, agility: 80, attack_speed: 1.1, defense: 45} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.015},
            {item_name: "凝胶", chance:0.3},
            {item_name: "五彩凝胶", chance:0.2},
            {item_name: "魔力碎晶", chance:0.15},
            
            //~16C
        ],
    });
    enemy_templates["纳家塑像"] = new Enemy({
        name: "纳家塑像", 
        description: "纳家量产的傀儡塑像。战力不强，但胜在便宜。", 
        xp_value: 13, 
        rank: 1207,
        image: "image/enemy/E1207.png",
        realm: "<span class=realm_basic><b>万物级巅峰</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 4, attack: 140, agility: 60, attack_speed: 1.1, defense: 0} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.015},
            {item_name: "坚硬石块", chance: 0.3},
            {item_name: "银钱", chance: 0.12},
            //~16C
        ],
    });
    enemy_templates["出芽橙茸茸"] = new Enemy({
        name: "出芽橙茸茸", 
        description: "它的芽蕴含充足的魔力，足以转化出一份五彩凝胶。", 
        xp_value: 13, 
        rank: 1208,
        image: "image/enemy/E1208.png",
        realm: "<span class=realm_basic><b>万物级巅峰 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 300, attack: 175, agility: 90, attack_speed: 1.1, defense: 30} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.015},
            {item_name: "凝胶", chance: 0.4},
            {item_name: "五彩凝胶", chance:0.3},
            {item_name: "魔力碎晶", chance:0.15},
            //~26C
        ],
    });
    enemy_templates["森林野蝠"] = new Enemy({
        name: "森林野蝠", 
        description: "24层魔塔的红蝙蝠转生来了，携带伤害加深！", 
        xp_value: 13, 
        rank: 1209,
        image: "image/enemy/E1209.png",
        realm: "<span class=realm_basic><b>万物级巅峰 +</b></span>",
        size: "small",
        spec: [7],
        tags: [],
        stats: {health: 440, attack: 120, agility: 90, attack_speed: 1.1, defense: 50} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.015},
            {item_name: "异兽皮", chance: 0.05},
            {item_name: "魔力碎晶", chance:0.15},
            //~26C
        ],
    });
    enemy_templates["血洛喽啰"] = new Enemy({
        name: "血洛喽啰", 
        description: "和它的弟弟相比，因出场太晚惨遭忘却的存在", 
        xp_value: 21, 
        rank: 1210,
        image: "image/enemy/E1210.png",
        realm: "<span class=realm_basic><b>潮汐级初等</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 700, attack: 151, agility: 120, attack_speed: 1.2, defense: 70} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "合金残片", chance: 0.10},
            {item_name: "金属残片", chance: 0.40},
            {item_name: "红色刀币", chance: 0.02},
            //~50C
        ],
    });
    enemy_templates["百家小卒"] = new Enemy({
        name: "百家小卒", 
        description: "没那么拼命的百家小卒，受轻伤就会离去。", 
        xp_value: 13, 
        rank: 1211,
        image: "image/enemy/E1211.png",
        realm: "<span class=realm_basic><b>万物级巅峰</b></span>",
        size: "small",
        spec: [2],
        tags: [],
        stats: {health: 660, attack: 144, agility: 90, attack_speed: 1.1, defense: 60} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.045},
            {item_name: "初始红宝石", chance:0.015},
            {item_name: "银钱", chance: 0.15},
            {item_name: "金属残片", chance: 0.30},
            //~16C
        ],
    });
    enemy_templates["下位佣兵"] = new Enemy({
        name: "下位佣兵", 
        description: "底层的血洛佣兵，看守着平庸的宝物", 
        xp_value: 21, 
        rank: 1212,
        image: "image/enemy/E1212.png",
        realm: "<span class=realm_basic><b>潮汐级初等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 560, attack: 230, agility: 120, attack_speed: 1.2, defense: 48} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "合金残片", chance: 0.12},
            {item_name: "银钱", chance: 0.25},
            {item_name: "铁锭", chance: 0.25},
            //50C
        ],
    });
    enemy_templates["地龙荒兽"] = new Enemy({
        name: "地龙荒兽", 
        description: "因为种族优势，采取了先发制人战略的异兽", 
        xp_value: 21, 
        rank: 1213,
        image: "image/enemy/E1213.png",
        realm: "<span class=realm_basic><b>潮汐级初等</b></span>",
        size: "small",
        spec: [4],
        tags: [],
        stats: {health: 190, attack: 340, agility: 120, attack_speed: 1.2, defense: 60} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "异兽皮", chance: 0.08},
            {item_name: "万物·凶兽肉块", chance: 0.08},
            //~50C
        ],
    });
    enemy_templates["毒虫"] = new Enemy({
        name: "毒虫", 
        description: "构造诡异的软泥，与其战斗时候属性会反转！", 
        xp_value: 21, 
        rank: 1214,
        image: "image/enemy/E1214.png",
        realm: "<span class=realm_basic><b>潮汐级初等</b></span>",
        size: "small",
        spec: [9],
        tags: [],
        stats: {health: 560, attack: 230, agility: 120, attack_speed: 1.2, defense: 48} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "魔力碎晶", chance: 0.5},
            {item_name: "异兽皮", chance: 0.12},

            //~50C
        ],
    });
    enemy_templates["精壮青年"] = new Enemy({
        name: "精壮青年", 
        description: "燕岗城的精壮青年，实力在同龄人中算得上靠前", 
        xp_value: 21, 
        rank: 1215,
        image: "image/enemy/E1215.png",
        realm: "<span class=realm_basic><b>潮汐级初等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 900, attack: 181, agility: 140, attack_speed: 1.2, defense: 40} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "红色刀币", chance: 0.01},
            {item_name: "银钱", chance: 0.4},
            //~50C
            //{item_name: "铁剑·改", count: [1], quality: [81, 100], chance: 0.2},
        ],
    });enemy_templates["法师学徒"] = new Enemy({
        name: "法师学徒", 
        description: "比青年法师强大的法师，学会了全新的魔法", 
        xp_value: 21, 
        rank: 1216,
        image: "image/enemy/E1216.png",
        realm: "<span class=realm_basic><b>潮汐级初等 +</b></span>",
        size: "small",
        spec: [10],
        tags: [],
        stats: {health: 900, attack: 240, agility: 150, attack_speed: 1.2, defense: 80} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "魔力碎晶", chance: 0.5},
            {item_name: "红色刀币", chance: 0.08},
            //~90C
        ],
    });
    enemy_templates["生灵骸骨"] = new Enemy({
        name: "生灵骸骨", 
        description: "聚魂的基础上又凝聚了部分血肉的不死族，攻防兼备。", 
        xp_value: 21, 
        rank: 1217,
        image: "image/enemy/E1217.png",
        realm: "<span class=realm_basic><b>潮汐级初等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1120, attack: 236, agility: 160, attack_speed: 1.2, defense: 105} , 
        loot_list: [
            {item_name: "初始蓝宝石", chance:0.03},
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "铜骨", chance: 0.6},
            {item_name: "万物·凶兽肉块", chance: 0.15},
            {item_name: "异兽皮", chance: 0.1},
            //~90C
        ],
    });
    enemy_templates["腐蚀质石精"] = new Enemy({
        name: "腐蚀质石精", 
        description: "城外的大石头。敌意不重，轻伤就会离去。", 
        xp_value: 34, 
        rank: 1301,
        image: "image/enemy/E1301.png",
        realm: "<span class=realm_basic><b>潮汐级高等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1770, attack: 380, agility: 200, attack_speed: 1.2, defense: 160},
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "毒液", chance:0.08},
            //应为160C
        ],
    });
    enemy_templates["绿毛茸茸"] = new Enemy({
        name: "绿毛茸茸", 
        description: "毛茸茸家族-野生限定版", 
        xp_value: 21, 
        rank: 1302,
        image: "image/enemy/E1302.png",
        realm: "<span class=realm_basic><b>潮汐级初等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 375, attack: 438, agility: 160, attack_speed: 1.2, defense: 135},
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "五彩凝胶", chance:0.5},
            {item_name: "灵液", chance:0.01},
            //应为90C
        ],
    });
    enemy_templates["荒野蜂"] = new Enemy({
        name: "荒野蜂", 
        description: "变异的巨型黄蜂。它的毒液可以使人衰弱。", 
        xp_value: 21, 
        rank: 1303,
        image: "image/enemy/E1303.png",
        realm: "<span class=realm_basic><b>潮汐级初等 +</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 850, attack: 360, agility: 180, attack_speed: 1.2, defense: 90},
        loot_list: [
            {item_name: "初始绿宝石", chance:0.03},
            {item_name: "毒液", chance:0.04},
            //应为90C
        ],
    });
    enemy_templates["切叶虫茧"] = new Enemy({
        name: "切叶虫茧", 
        description: "破茧而出的蝴蝶。它的锋利前肢可以撕裂敌人。", 
        xp_value: 21, 
        rank: 1304,
        image: "image/enemy/E1304.png",
        realm: "<span class=realm_basic><b>潮汐级初等 +</b></span>",
        size: "small",
        spec: [7],
        tags: [],
        stats: {health: 520, attack: 380, agility: 140, attack_speed: 1.2, defense: 150}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "天蚕丝", chance:0.03},
            //应为90C
        ],
    });
    enemy_templates["花灵液"] = new Enemy({
        name: "花灵液", 
        description: "绿毛茸茸的变异种。不规则的外形使它兼具灵活和承伤。", 
        xp_value: 34, 
        rank: 1305,
        image: "image/enemy/E1305.png",
        realm: "<span class=realm_basic><b>潮汐级高等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1400, attack: 415, agility: 220, attack_speed: 1.2, defense: 50}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "灵液", chance:0.06},
            //应为160C
        ],
    });
    enemy_templates["燕岗领从者"] = new Enemy({
        name: "燕岗领从者", 
        description: "随处可见的普通修者。修为不高，财产不多。", 
        xp_value: 34, 
        rank: 1306,
        image: "image/enemy/E1306.png",
        realm: "<span class=realm_basic><b>潮汐级高等</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 1400, attack: 464, agility: 240, attack_speed: 1.2, defense: 190}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "银钱", chance:0.6},
            {item_name: "红色刀币", chance:0.1},
            //应为160C
        ],
    });
    enemy_templates["野生幽灵"] = new Enemy({
        name: "野生幽灵", 
        description: "在荒野中生存下来的幽灵。非常脆弱，但飘忽不定。", 
        xp_value: 34, 
        rank: 1307,
        image: "image/enemy/E1307.png",
        realm: "<span class=realm_basic><b>潮汐级高等</b></span>",
        size: "small",
        spec: [2],
        tags: [],
        stats: {health: 290, attack: 875, agility: 360, attack_speed: 1.2, defense: 125}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            //{item_name: "潮汐·凶兽肉排", chance:1.0},
            //应为160C
        ],
    });
    enemy_templates["荒兽尼尔"] = new Enemy({
        name: "荒兽尼尔", 
        description: "一种鸟类荒兽.肌肉发达，皮糙肉厚。", 
        xp_value: 34, 
        rank: 1308,
        image: "image/enemy/E1308.png",
        realm: "<span class=realm_basic><b>潮汐级高等 +</b></span>",
        size: "small",
        spec: [5],
        tags: [],
        stats: {health: 1080, attack: 910, agility: 320, attack_speed: 1.2, defense: 190}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "天蚕丝", chance:0.04},
            {item_name: "潮汐·凶兽肉块", chance:0.03},
            //应为260C
        ],
    });
    enemy_templates["司雍世界修士"] = new Enemy({
        name: "司雍世界修士", 
        description: "稍微罕见一些的普通修者，在潮汐级高等中算是强者。", 
        xp_value: 34, 
        rank: 1309,
        image: "image/enemy/E1309.png",
        realm: "<span class=realm_basic><b>潮汐级高等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1080, attack: 550, agility: 300, attack_speed: 1.2, defense: 230}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "精钢锭", chance:0.5},
            {item_name: "银钱", chance:0.5},
            //应为260C
        ],
    });
    enemy_templates["潮汐级荒兽"] = new Enemy({
        name: "潮汐级荒兽", 
        description: "一种地行性荒兽，肉比荒兽尼尔略多一些", 
        xp_value: 34, 
        rank: 1310,
        image: "image/enemy/E1310.png",
        realm: "<span class=realm_basic><b>潮汐级高等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 870, attack: 610, agility: 300, attack_speed: 1.2, defense: 190}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "潮汐·凶兽肉块", chance:0.05},
            //应为260C
        ],
    });
    enemy_templates["掠原蝠"] = new Enemy({
        name: "掠原蝠", 
        description: "一种以速度闻名的小型荒兽，什么都会叼一点", 
        xp_value: 34, 
        rank: 1311,
        image: "image/enemy/E1311.png",
        realm: "<span class=realm_basic><b>潮汐级高等 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 720, attack: 670, agility: 360, attack_speed: 1.2, defense: 210}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "灵液", chance:0.03},
            {item_name: "毒液", chance:0.03},
            {item_name: "异兽皮", chance:0.15},
            //应为260C
        ],
    });
    enemy_templates["黑夜傀儡"] = new Enemy({
        name: "黑夜傀儡", 
        description: "岩石中自发产生的傀儡，体内时常镶嵌着宝石", 
        xp_value: 55, 
        rank: 1312,
        image: "image/enemy/E1312.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1600, attack: 585, agility: 360, attack_speed: 1.2, defense: 320}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.2},
            {item_name: "初始绿宝石", chance:0.2},
            //应为500C
        ],
    });
    enemy_templates["来一口"] = new Enemy({
        name: "来一口", 
        description: "一种潜伏在地下的魔物，专门攻击冒险者防御不足的区域，极为难缠", 
        xp_value: 55, 
        rank: 1313,
        image: "image/enemy/E1313.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰</b></span>",
        size: "small",
        spec: [0,7],
        tags: [],
        stats: {health: 700, attack: 288, agility: 300, attack_speed: 1.2, defense: 288}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "毒液", chance:0.20},
            {item_name: "异兽皮", chance:0.20},
            //应为500C
        ],
    });
    enemy_templates["绿原行者"] = new Enemy({
        name: "绿原行者", 
        description: "潜力耗尽却堪堪达到潮汐级巅峰的老人，为了大地级的契机可以付出一切", 
        xp_value: 55, 
        rank: 1314,
        image: "image/enemy/E1314.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 2000, attack: 700, agility: 270, attack_speed: 1.2, defense: 350}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "煤炭", chance:0.15},
            {item_name: "异兽皮", chance:0.60},
            //应为500C
        ],
    });
    enemy_templates["初生鬼"] = new Enemy({
        name: "初生鬼", 
        description: "死去冒险者的怨念凝聚成的魔物。因贫困而死的它至死渴望着金钱。", 
        xp_value: 55, 
        rank: 1315,
        image: "image/enemy/E1315.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰</b></span>",
        size: "small",
        spec: [18],
        spec_value:{18:2000},
        tags: [],
        stats: {health: 3430, attack: 720, agility: 400, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.04},
            {item_name: "初始绿宝石", chance:0.02},
            {item_name: "煤炭", chance:0.15},
            //应为500C
        ],
    });
    enemy_templates["燕岗领佣兵"] = new Enemy({
        name: "燕岗领佣兵", 
        description: "第一只大地级敌人。温馨提醒：大地级以上经验增长速率会翻倍！", 
        xp_value: 144, 
        rank: 1316,
        image: "image/enemy/E1316.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 2990, attack: 1225, agility: 600, attack_speed: 1.2, defense: 400}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "毒液", chance:0.6},
            {item_name: "紫铜锭", chance:0.2},
            //应为5X
        ],
    });

    enemy_templates["冷冻火"] = new Enemy({
        name: "冷冻火", 
        description: "不要想着和它打消耗战...当然，除非你可以防杀它。", 
        xp_value: 55, 
        rank: 1317,
        image: "image/enemy/E1317.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰 +</b></span>",
        size: "small",
        spec: [12],//时封
        tags: [],
        stats: {health: 2100, attack: 750, agility: 360, attack_speed: 1.2, defense: 100}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.02},
            {item_name: "初始绿宝石", chance:0.04},
            {item_name: "灵液", chance:0.35},
            //应为900C
        ],
    });

    enemy_templates["缠绕骸骨"] = new Enemy({
        name: "缠绕骸骨", 
        description: "生灵骸骨的加强版。它身上的骨头是上好的材料！", 
        xp_value: 55, 
        rank: 1318,
        image: "image/enemy/E1318.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1350, attack: 960, agility: 400, attack_speed: 1.2, defense: 240}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.02},
            {item_name: "初始绿宝石", chance:0.04},
            {item_name: "天蚕丝", chance:0.2},
            {item_name: "润灵铜骨", chance:0.03},
            //应为900C
        ],
    });

    
    enemy_templates["灵蔓茸茸"] = new Enemy({
        name: "灵蔓茸茸", 
        description: "蕴含着狂暴力量的茸茸，周围的荒兽都会被其影响，变得暴戾", 
        xp_value: 55, 
        rank: 1319,
        image: "image/enemy/E1319.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰 +</b></span>",
        size: "small",
        spec: [11],
        tags: [],
        stats: {health: 3430, attack: 720, agility: 400, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "初始红宝石", chance:0.02},
            {item_name: "初始绿宝石", chance:0.04},
            {item_name: "毒液", chance:0.15},
            {item_name: "灵液", chance:0.10},
            {item_name: "天蚕丝", chance:0.15},
            //应为900C
        ],
    });
    enemy_templates["夜行幽灵"] = new Enemy({
        name: "夜行幽灵", 
        description: "地宫里唯一的潮汐级魔物。靠着灯光的方便存活了下来。", 
        xp_value: 55, 
        rank: 1401,
        image: "image/enemy/E1401.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰 +</b></span>",
        size: "small",
        spec: [13],
        tags: [],
        stats: {health: 1000, attack: 1800, agility: 700, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.02},
            {item_name: "灵液", chance:0.36},
            //{item_name: "宝石吊坠", chance:1}
            //应为900C
        ],
    });
    enemy_templates["石风家族剑士"] = new Enemy({
        name: "石风家族剑士", 
        description: "因为是家族旁系中的旁系，倒是不用担心打了他城主找上门", 
        xp_value: 144, 
        rank: 1402,
        image: "image/enemy/E1402.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 4000, attack: 1450, agility: 800, attack_speed: 1.2, defense: 500}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "断剑", chance:0.025},
            {item_name: "紫铜锭", chance:0.18},
            //应为5X
        ],
    });
    enemy_templates["能量络合球"] = new Enemy({
        name: "能量络合球", 
        description: "由纯粹的有组织能量产生的生物体。天生魔攻，但十分脆弱。", 
        xp_value: 144, 
        rank: 1403,
        image: "image/enemy/E1403.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 980, attack: 830, agility: 830, attack_speed: 1.2, defense: 830}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "大地级魂魄", chance:0.06},
            //应为5X
        ],
    });
    enemy_templates["短视蝠"] = new Enemy({
        name: "短视蝠", 
        description: "它巨大的眼球并没有使它的视力变好...它似乎忘了凸透镜成像的原理。", 
        xp_value: 144, 
        rank: 1404,
        image: "image/enemy/E1404.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 7500, attack: 1300, agility: 650, attack_speed: 1.2, defense: 800}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "巨型眼球", chance:0.05},
            //应为5X
        ],
    });
    enemy_templates["金衣除草者"] = new Enemy({
        name: "金衣除草者", 
        description: "它的阵法虽然布置慢了点，但是效果还是很强的。", 
        xp_value: 144, 
        rank: 1405,
        image: "image/enemy/E1405.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [14],
        tags: [],
        stats: {health: 1920, attack: 2580, agility: 880, attack_speed: 0.9, defense: 280}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "断剑", chance:0.03},
            {item_name: "润灵铜骨", chance:0.25},
            //应为5X
        ],
    });
    enemy_templates["阴暗茸茸"] = new Enemy({
        name: "阴暗茸茸", 
        description: "它的绝对黑暗逆转了攻防的规则。不过，谁说这一定是件坏事呢？", 
        xp_value: 144, 
        rank: 1406,
        image: "image/enemy/E1406.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [9],
        tags: [],
        stats: {health: 5800, attack: 1150, agility: 900, attack_speed: 1.2, defense: 300}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "大地级魂魄", chance:0.045},
            {item_name: "A1·能量核心", chance:0.02},
            //应为5X
        ],
    });
    enemy_templates["地宫妖偶"] = new Enemy({
        name: "地宫妖偶", 
        description: "在地宫里读书学到牵制技巧的妖偶。顺带一提，牵制已经登上了“坑魔特效榜”第二名！", 
        xp_value: 144, 
        rank: 1407,
        image: "image/enemy/E1407.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [5],
        tags: [],
        stats: {health: 3000, attack: 2500, agility: 900, attack_speed: 1.2, defense: 600}, 
        loot_list: [
            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.01},
            {item_name: "牵制-从入门到入土", chance:0.01},
            //应为5X
        ],
    });
     enemy_templates["地宫虫卒"] = new Enemy({
        name: "地宫虫卒", 
        description: "他看了更多的书，发现了牵制是大坑。可惜，它自己的属性不怎么样..", 
        xp_value: 233, 
        rank: 1408,
        image: "image/enemy/E1408.png",
        realm: "<span class=realm_terra><b>大地级一阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 6400, attack: 1700, agility: 1200, attack_speed: 1.2, defense: 750}, 
        loot_list: [

            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.02},
            {item_name: "牵制-从入门到入土", chance:0.001},
            {item_name: "断剑", chance:0.05},
            {item_name: "润灵铜骨", chance:0.5},
            //应为9X
        ],
    });
    enemy_templates["地刺"] = new Enemy({
        name: "地刺", 
        description: "埋伏在暗处的刺球茸茸。失去了捕捉技能——倒不如说这里所有魔物都有捕捉技能。", 
        xp_value: 233, 
        rank: 1409,
        image: "image/enemy/E1409.png",
        realm: "<span class=realm_terra><b>大地级一阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 6300, attack: 2400, agility: 1080, attack_speed: 1.2, defense: 1200}, 
        loot_list: [

            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.02},
            {item_name: "巨型眼球", chance:0.06},
            {item_name: "A1·能量核心", chance:0.02},
            //应为9X
        ],
    });
    enemy_templates["探险者亡魂"] = new Enemy({
        name: "探险者亡魂", 
        description: "黑化强十倍，洗白弱三分。这不就看到前者的表现了吗~", 
        xp_value: 233, 
        rank: 1410,
        image: "image/enemy/E1410.png",
        realm: "<span class=realm_terra><b>大地级一阶 +</b></span>",
        size: "small",
        spec: [15],
        tags: [],
        stats: {health: 3000, attack: 4000, agility: 1600, attack_speed: 1.2, defense: 1500}, 
        loot_list: [

            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.02},
            {item_name: "大地级魂魄", chance:0.225},
            {item_name: "A1·能量核心", chance:0.06},
            //应为9X
            //因为这玩意真的太强了所以翻了三倍
        ],
    });
    enemy_templates["布菇妖"] = new Enemy({
        name: "布菇妖", 
        description: "它的孢子中含有使人衰弱的毒素。在外界它的踪迹早已消失，但黑暗的地宫中它却四处蔓延。", 
        xp_value: 233, 
        rank: 1411,
        image: "image/enemy/E1411.png",
        realm: "<span class=realm_terra><b>大地级一阶 +</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 7000, attack: 2250, agility: 1400, attack_speed: 1.2, defense: 400}, 
        loot_list: [

            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.02},
            {item_name: "紫铜锭", chance:0.35},
            {item_name: "毒液", chance:1.0},
            //应为9X
        ],
    });
    enemy_templates["腾风塑像"] = new Enemy({
        name: "腾风塑像", 
        description: "如同一阵真正的风暴！疾风？不过对它拙劣的模仿罢了！", 
        xp_value: 233, 
        rank: 1412,
        image: "image/enemy/E1412.png",
        realm: "<span class=realm_terra><b>大地级一阶 +</b></span>",
        size: "small",
        spec: [16],
        tags: [],
        stats: {health: 2800, attack: 1800, agility: 1600, attack_speed: 1.2, defense: 1000}, 
        loot_list: [

            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.02},
            {item_name: "断剑", chance:0.06},
            {item_name: "A1·能量核心", chance:0.02},
            //应为9X
        ],
    });
    enemy_templates["出芽黄茸茸"] = new Enemy({
        name: "出芽黄茸茸", 
        description: "血脉高贵的黄色茸茸，一旦出芽就意味着进入大地级。当然，99.8%暴毙的黄茸茸不会对此有意见的。", 
        xp_value: 233, 
        rank: 1413,
        image: "image/enemy/E1413.png",
        realm: "<span class=realm_terra><b>大地级一阶 +</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 4200, attack: 800, agility: 1500, attack_speed: 1.2, defense: 800}, 
        loot_list: [

            {item_name: "高级黄宝石", chance:0.04},
            {item_name: "高级蓝宝石", chance:0.02},
            {item_name: "A1·能量核心", chance:0.06},
            //应为9X
        ],
    });
    enemy_templates["大地级卫戍"] = new Enemy({
        name: "大地级卫戍", 
        description: "我本是此地的叹息之墙，直到纱雪发现def里面多加了个0..", 
        xp_value: 377, 
        rank: 1414,
        image: "image/enemy/E1414.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 5500, attack: 3360, agility: 1800, attack_speed: 1.2, defense: 1280}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.04},
            {item_name: "高级红宝石", chance:0.005},
            {item_name: "地宫金属锭", chance:0.03},
            //应为16X
        ],
    });
    //1-5
    enemy_templates["地宫看门人"] = new Enemy({
        name: "地宫看门人", 
        description: "现在你逃不掉了..不过它也没那么强了！", 
        xp_value: 987, 
        rank: 1501,
        image: "image/enemy/E1501.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 27000, attack: 7500, agility: 6000, attack_speed: 1.2, defense: 3750}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.04},
            {item_name: "高级绿宝石", chance:0.005},
            {item_name: "A1·能量核心", chance:0.2},
            {item_name: "黑色刀币", chance:0.05},
            //应为50X
        ],
    });
    enemy_templates["行走树妖"] = new Enemy({
        name: "行走树妖", 
        description: "飓风的机制，使它并不比BOSS级的那只好对付多少...", 
        xp_value: 377, 
        rank: 1502,
        image: "image/enemy/E1502.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [16],
        tags: [],
        stats: {health: 13500, attack:2900, agility: 3000, attack_speed: 1.2, defense: 1800}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.04},
            {item_name: "高级红宝石", chance:0.005},
            {item_name: "A1·能量核心", chance:0.12},
            //应为16X
        ],
    });
    enemy_templates["深邃之影"] = new Enemy({
        name: "深邃之影", 
        description: "浅层的精英荒兽，在核心处已经多到泛滥", 
        xp_value: 377, 
        rank: 1503,
        image: "image/enemy/E1503.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [17],
        tags: [],
        stats: {health: 8100, attack:4800, agility: 3000, attack_speed: 1.2, defense: 2000}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.04},
            {item_name: "高级红宝石", chance:0.005},
            {item_name: "流动凝胶", chance:0.03},
            //应为16X
        ],
    });
    enemy_templates["抽丝鬼"] = new Enemy({
        name: "抽丝鬼", 
        description: "地宫的进化鬼魂。和所有鬼系魔物一样，它的身体脆弱，攻击强悍。", 
        xp_value: 377, 
        rank: 1504,
        image: "image/enemy/E1504.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [6,7],
        tags: [],
        stats: {health: 3750, attack:5000, agility: 3600, attack_speed: 1.2, defense: 900}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.04},
            {item_name: "高级红宝石", chance:0.005},
            {item_name: "大地级魂魄", chance:0.20},
            //应为16X
        ],
    });
    enemy_templates["燕岗堕落狩士"] = new Enemy({
        name: "燕岗堕落狩士", 
        description: "陷入癫狂的大地级狩士。他变强了，但代价呢？", 
        xp_value: 377, 
        rank: 1505,
        image: "image/enemy/E1505.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 3000, attack:5500, agility: 4200, attack_speed: 1.2, defense: 3000}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.04},
            {item_name: "高级红宝石", chance:0.005},
            {item_name: "断剑", chance:0.25},
            //应为16X
        ],
    });
    enemy_templates["二极蝠"] = new Enemy({
        name: "二极蝠", 
        description: "将冰与炎融于一身，拥有了同调的力量。至少它不会偷敏捷...", 
        xp_value: 610, 
        rank: 1506,
        image: "image/enemy/E1506.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [19],
        tags: [],
        stats: {health: 22200, attack:4800, agility: 4050, attack_speed: 1.2, defense: 1000}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.03},
            {item_name: "高级红宝石", chance:0.02},
            {item_name: "霜炙皮草", chance:0.05},
            {item_name: "大地级魂魄", chance:0.10},
            //应为28X
        ],
    });
    enemy_templates["凶戾骨将"] = new Enemy({
        name: "凶戾骨将", 
        description: "当当，攻击检测点！探险者亡魂的BUG绝不会再次上演~", 
        xp_value: 987, 
        rank: 1507,
        image: "image/enemy/E1507.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [12],
        tags: [],
        stats: {health: 8450, attack:8880, agility: 6000, attack_speed: 1.2, defense: 4440}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.04},
            {item_name: "高级绿宝石", chance:0.005},
            {item_name: "A1·能量核心", chance:0.2},
            {item_name: "大地级魂魄", chance:0.3},
            //应为50X
        ],
    });
    enemy_templates["武装绿毛茸茸"] = new Enemy({
        name: "武装绿毛茸茸", 
        description: "作为更高等的茸茸，它们需要到三阶才能凝聚芽。不过，它偷来的地宫金属不错！", 
        xp_value: 610, 
        rank: 1508,
        image: "image/enemy/E1508.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 8900, attack:6000, agility: 4800, attack_speed: 1.2, defense: 2400}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.03},
            {item_name: "高级红宝石", chance:0.02},
            {item_name: "流动凝胶", chance:0.04},
            {item_name: "地宫金属锭", chance:0.04},
            //应为28X
        ],
    });
    enemy_templates["二阶荒兽"] = new Enemy({
        name: "二阶荒兽", 
        description: "终于——地宫里出现可以吃的荒兽啦！天剑在它3400的孱弱攻击下不值一提。", 
        xp_value: 610, 
        rank: 1509,
        image: "image/enemy/E1509.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [20],
        tags: [],
        stats: {health: 10500, attack:3400, agility: 4800, attack_speed: 1.2, defense: 2600}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.03},
            {item_name: "高级红宝石", chance:0.02},
            {item_name: "地宫·荒兽肉块", chance:0.09},
            {item_name: "巨型眼球", chance:0.10},
            //应为28X
        ],
    });
    enemy_templates["地下岩火"] = new Enemy({
        name: "地下岩火", 
        description: "它怎么没有时封？被前面的三阶骷髅抢走了吗？", 
        xp_value: 610, 
        rank: 1510,
        image: "image/enemy/E1510.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1080, attack:16000, agility: 5400, attack_speed: 1.2, defense: 4000}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.03},
            {item_name: "高级红宝石", chance:0.02},
            {item_name: "大地级魂魄", chance:0.45},
            //应为28X
        ],
    });
    enemy_templates["初级魔法师"] = new Enemy({
        name: "初级魔法师", 
        description: "学什么不好，学牵制..你猜为什么它被卡在初级了呢？", 
        xp_value: 610, 
        rank: 1511,
        image: "image/enemy/E1511.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [0,5],
        tags: [],
        stats: {health: 7500, attack:3000, agility: 5500, attack_speed: 1.2, defense: 3000}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.03},
            {item_name: "高级红宝石", chance:0.02},
            {item_name: "霜炙皮草", chance:0.07},
            //应为28X
        ],
    });
    enemy_templates["喵咕哩"] = new Enemy({
        name: "喵咕哩", 
        description: "~真·神·降·临~ 数值与机制并存，灵体追你到RPG来喽！", 
        xp_value: 1587, 
        rank: 1512,
        image: "image/enemy/E1512.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [21],
        spec_value:{21:8000},
        tags: [],
        stats: {health: 36500, attack:10040, agility: 8000, attack_speed: 1.2, defense: 2333}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.02},
            {item_name: "流动凝胶", chance:0.18},
            //应为89X
        ],
    });
    enemy_templates["颂歌符文"] = new Enemy({
        name: "颂歌符文", 
        description: "它看起来明明那么像一只光环怪的说...居然没有嘛。", 
        xp_value: 610, 
        rank: 1513,
        image: "image/enemy/E1513.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [22],
        tags: [],
        stats: {health: 16900, attack:5750, agility: 5750, attack_speed: 1.2, defense: 1800}, 
        loot_list: [
            {item_name: "高级蓝宝石", chance:0.03},
            {item_name: "高级红宝石", chance:0.02},
            {item_name: "A1·能量核心", chance:0.25},
            //应为28X
        ],
    });
    enemy_templates["地宫执法者"] = new Enemy({
        name: "地宫执法者", 
        description: "似乎是地宫主人留下的造物，但狂暴的气息使它已经只懂得杀戮", 
        xp_value: 987, 
        rank: 1514,
        image: "image/enemy/E1514.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [0,23],
        tags: [],
        stats: {health: 9999, attack:6999, agility: 6000, attack_speed: 1.2, defense: 3499}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.04},
            {item_name: "高级绿宝石", chance:0.005},
            {item_name: "黑色刀币", chance:0.05},
            //应为50X
        ],
    });
    enemy_templates["出芽绿茸茸"] = new Enemy({
        name: "出芽绿茸茸", 
        description: "天赋秘法·三连击！不过，催动秘法似乎消耗了它的生命力..", 
        xp_value: 987, 
        rank: 1515,
        image: "image/enemy/E1515.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [6],
        tags: [],
        stats: {health: 5000, attack:7600, agility: 4800, attack_speed: 1.2, defense: 3800}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.04},
            {item_name: "高级绿宝石", chance:0.005},
            {item_name: "A1·能量核心", chance:0.1},
            {item_name: "流动凝胶", chance:0.08},
            //应为50X
        ],
    });
    enemy_templates["巨型蜘蛛"] = new Enemy({
        name: "巨型蜘蛛", 
        description: "只有两条腿的力量较大，因此只能进行二连击。掉落的凝胶是蜘蛛丝制成的。", 
        xp_value: 987, 
        rank: 1516,
        image: "image/enemy/E1516.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 8000, attack:9500, agility: 7800, attack_speed: 1.2, defense: 4000}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.04},
            {item_name: "高级绿宝石", chance:0.005},
            {item_name: "流动凝胶", chance:0.10},
            //应为50X
        ],
    });
    enemy_templates["地穴飞鸟"] = new Enemy({
        name: "地穴飞鸟", 
        description: "因为寻路系统坏掉了，在地宫不断飞来飞去的巨鸟。", 
        xp_value: 987, 
        rank: 1517,
        image: "image/enemy/E1517.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 17500, attack:8000, agility: 7200, attack_speed: 1.2, defense: 3500}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.04},
            {item_name: "高级绿宝石", chance:0.005},
            {item_name: "地宫·荒兽肉块", chance:0.075},
            {item_name: "巨型眼球", chance:0.15},
            {item_name: "霜炙皮草", chance:0.10},
            //应为50X
        ],
    });
    enemy_templates["小势力探险者"] = new Enemy({
        name: "小势力探险者", 
        description: "他穷得买不起恢复品。幸好有祖传秘法，可以吸取敌人的力量作为生命力。", 
        xp_value: 1597, 
        rank: 1518,
        image: "image/enemy/E1518.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [24,25],
        tags: [],
        stats: {health: 1, attack:15000, agility: 7800, attack_speed: 1.2, defense: 6500}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.01},
            {item_name: "大地级魂魄", chance:1.00},
            //应为89X
        ],
    });
    enemy_templates["踏地荒兽"] = new Enemy({
        name: "踏地荒兽", 
        description: "超大只！超好吃！喵可都馋哭了！", 
        xp_value: 1597, 
        rank: 1519,
        image: "image/enemy/E1519.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 25000, attack:9000, agility: 8400, attack_speed: 1.2, defense: 5000}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.01},
            {item_name: "地宫·荒兽肉块", chance:0.30},
            {item_name: "巨型眼球", chance:0.25},
            //应为89X
        ],
    });
    enemy_templates["扭曲菇菇"] = new Enemy({
        name: "扭曲菇菇", 
        description: "红伞伞~白杆杆~吃完一起躺板板~不对啊，它也不是红的..", 
        xp_value: 1597, 
        rank: 1520,
        image: "image/enemy/E1520.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [26],
        tags: [],
        stats: {health: 14000, attack:5500, agility: 8000, attack_speed: 1.2, defense: 6500}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.01},
            {item_name: "流动凝胶", chance:0.10},
            {item_name: "霜炙皮草", chance:0.10},
            //应为89X
        ],
    });
    enemy_templates["温热飞蛾"] = new Enemy({
        name: "温热飞蛾", 
        description: "似乎是荧光飞蛾的超进化形态。它已经热得冒出红光了！", 
        xp_value: 1597, 
        rank: 1521,
        image: "image/enemy/E1521.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [22,27],
        tags: [],
        stats: {health: 14000, attack:5500, agility: 8000, attack_speed: 1.2, defense: 6500}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.01},
            {item_name: "霜炙皮草", chance:0.22},
            //应为89X
        ],
    });
    enemy_templates["苍白之触"] = new Enemy({
        name: "苍白之触", 
        description: "它吸收了许多荒兽和冒险者的精华..结果所有的属性都冲突了，技能全没了。", 
        xp_value: 1597, 
        rank: 1522,
        image: "image/enemy/E1522.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 6000, attack:13000, agility: 9000, attack_speed: 1.2, defense: 7200}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.01},
            {item_name: "流动凝胶", chance:0.12},
            {item_name: "黑色刀币", chance:0.06},
            //应为89X
        ],
    });
    enemy_templates["燕岗城守卫"] = new Enemy({
        name: "燕岗城守卫", 
        description: "坚固，还血厚。看起来好像很强..但是坚固怕姐姐！", 
        xp_value: 2584, 
        rank: 1523,
        image: "image/enemy/E1523.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 32, attack:11111, agility: 10081, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "黑色刀币", chance:0.16},
            //应为160X
        ],
    });

    // 第二幕！！！
    enemy_templates["灵能菇菇"] = new Enemy({
        name: "灵能菇菇", 
        description: "惯用衰弱伎俩的蘑菇系荒兽。效果还不错！", 
        xp_value: 2584, 
        rank: 2101,
        image: "image/enemy/E2101.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 36000, attack:13600, agility: 8000, attack_speed: 1.0, defense: 6400}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "大地级魂魄", chance:0.5},
            {item_name: "流动凝胶", chance:0.24},
            //应为160X
        ],
    });
    enemy_templates["妖灵飞蛾"] = new Enemy({
        name: "妖灵飞蛾", 
        description: "荒兽森林的浅绿色飞蛾。与普遍的看法相反，绿色不代表有毒。", 
        xp_value: 2584, 
        rank: 2102,
        image: "image/enemy/E2102.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 16000, attack:14000, agility: 8400, attack_speed: 1.3, defense: 7000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "荒兽精华", chance:0.08},
            
            {item_name: "大地级魂魄", chance:0.5},
            //应为160X
        ],
    });
    enemy_templates["飞叶级魔法师"] = new Enemy({
        name: "飞叶级魔法师", 
        description: "挣脱了牵制的束缚，强大了一倍有余的初级魔法师。", 
        xp_value: 2584, 
        rank: 2103,
        image: "image/enemy/E2103.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 23000, attack:8000, agility: 8000, attack_speed: 1.3, defense: 8000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "黑色刀币", chance:0.08},
            {item_name: "A4·能量核心", chance:0.08},
            //应为160X
        ],
    });
    enemy_templates["血洛箭手"] = new Enemy({
        name: "血洛箭手", 
        description: "虽然箭的伤害有点不够看，但它的近战也太强了啦...", 
        xp_value: 2584, 
        rank: 2104,
        image: "image/enemy/E2104.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [29],
        spec_value:{29:1000},
        tags: [],
        stats: {health: 9900, attack:70000, agility: 9000, attack_speed: 1.0, defense: 7000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "黑色刀币", chance:0.03},
            {item_name: "甲壳碎片", chance:0.10},
            //应为160X
        ],
    });
    enemy_templates["有角一族"] = new Enemy({
        name: "有角一族", 
        description: "似乎比附近其他荒兽强大许多的荒兽。撞角让它可以打出两段伤害！", 
        xp_value: 4181, 
        rank: 2105,
        image: "image/enemy/E2105.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [10],
        tags: [],
        stats: {health: 105000, attack:25000, agility: 12800, attack_speed: 1.1, defense: 10000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "甲壳碎片", chance:0.10},
            {item_name: "荒兽精华", chance:0.10},
            //应为280X
        ],
    });
    enemy_templates["噬血术傀儡"] = new Enemy({
        name: "噬血术傀儡", 
        description: "还在蒸！地宫养殖者他还在蒸！(注:普攻倍率会对坚固敌人造成额外伤害)", 
        xp_value: 2584, 
        rank: 2106,
        image: "image/enemy/E2106.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 15, attack:16000, agility: 10000, attack_speed: 1.1, defense: 0}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "A4·能量核心", chance:0.18},
            //应为160X
        ],
    });
    enemy_templates["司雍世界行者"] = new Enemy({
        name: "司雍世界行者", 
        description: "出乎意料地，其他领的人都跑来荒兽森林历练了。真是受欢迎的地方呢。", 
        xp_value: 2584, 
        rank: 2107,
        image: "image/enemy/E2107.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 55000, attack:14000, agility: 10500, attack_speed: 1.2, defense: 9000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "黑色刀币", chance:0.04},
            {item_name: "甲壳碎片", chance:0.08},
            
            //应为160X
        ],
    });
    enemy_templates["密林大鸟"] = new Enemy({
        name: "密林大鸟", 
        description: "从地宫钻出来之后，又有进化的地穴飞鸟。寻路系统已经被修好了！", 
        xp_value: 2584, 
        rank: 2108,
        image: "image/enemy/E2108.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [6],
        tags: [],
        stats: {health: 72000, attack:17000, agility: 11000, attack_speed: 1.3, defense: 3000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "森林·荒兽肉块", chance:0.10},
            {item_name: "大地级魂魄", chance:0.5},
            
            //应为160X
        ],
    });
    enemy_templates["地龙幼崽"] = new Enemy({
        name: "地龙幼崽", 
        description: "血脉纯度较高的地龙幼崽。燕岗城里面那一只和它比最多算一条大蛇！", 
        xp_value: 2584, 
        rank: 2109,
        image: "image/enemy/E2109.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 45000, attack:19000, agility: 11000, attack_speed: 1.1, defense: 11000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.015},
            {item_name: "森林·荒兽肉块", chance:0.06},
            {item_name: "荒兽精华", chance:0.06},
            //应为160X
        ],
    });
    enemy_templates["人立茸茸"] = new Enemy({
        name: "人立茸茸", 
        description: "出芽绿茸茸的进化路线止步于大地级三阶。于是，它毅然决定长出手脚...", 
        xp_value: 4181, 
        rank: 2110,
        image: "image/enemy/E2110.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [26],
        tags: [],
        stats: {health: 37000, attack:9100, agility: 11500, attack_speed: 1.2, defense: 10900}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "流动凝胶", chance:0.20},
            {item_name: "A4·能量核心", chance:0.20},
            
            //应为280X
        ],
    });
    enemy_templates["草木蜘蛛"] = new Enemy({
        name: "草木蜘蛛", 
        description: "可以在战斗中恢复体力的蜘蛛。去除了回合数翻倍的限制之后，更加难缠。", 
        xp_value: 4181, 
        rank: 2111,
        image: "image/enemy/E2111.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [30,31],
        spec_value: {30:0.5},
        tags: [],
        stats: {health: 120000, attack:18500, agility: 12000, attack_speed: 0.9, defense: 3300}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "荒兽精华", chance:0.15},
            {item_name: "大地级魂魄", chance:0.50},
            
            //应为280X
        ],
    });
    enemy_templates["持盾荒兽"] = new Enemy({
        name: "持盾荒兽", 
        description: "血洛大陆的荒兽不比地球的怪兽，往往要到天空级才有完整的智慧。这只..或许是变异了？", 
        xp_value: 4181, 
        rank: 2112,
        image: "image/enemy/E2112.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 15000, attack:28000, agility: 12500, attack_speed: 1.2, defense: 14000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "甲壳碎片", chance:0.20},
            //应为280X
        ],
    });
    enemy_templates["芊叶蝠"] = new Enemy({
        name: "芊叶蝠", 
        description: "芊叶-夜芊-千夜...谐音梗已经退环境了！", 
        xp_value: 4181, 
        rank: 2113,
        image: "image/enemy/E2113.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 60000, attack:33000, agility: 13500, attack_speed: 1.2, defense: 11000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "荒兽精华", chance:0.10},
            {item_name: "A4·能量核心", chance:0.15},
            
            //应为280X
        ],
    });
    enemy_templates["深林妖偶"] = new Enemy({
        name: "深林妖偶", 
        description: "和地穴飞鸟，初级魔法师同批逃出地宫的妖偶。可悲的是，它仍然抱着牵制不放。", 
        xp_value: 4181, 
        rank: 2114,
        image: "image/enemy/E2114.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [5],
        tags: [],
        stats: {health: 80000, attack:30000, agility: 12500, attack_speed: 1.2, defense: 9000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "流动凝胶", chance:0.50},
            {item_name: "甲壳碎片", chance:0.20},
            //应为280X
        ],
    });
    enemy_templates["银杖茸茸"] = new Enemy({
        name: "银杖茸茸", 
        description: "面对四阶瓶颈，选择修习魔法的茸茸。不过魔法也太弱了！", 
        xp_value: 4181, 
        rank: 2115,
        image: "image/enemy/E2115.png",
        realm: "<span class=realm_terra><b>大地级四阶 +</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 25000, attack:4000, agility: 13500, attack_speed: 1.2, defense: 16000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.05},
            {item_name: "极品黄宝石", chance:0.02},
            {item_name: "A4·能量核心", chance:0.30},
            {item_name: "甲壳碎片", chance:0.05},
            //应为280X
        ],
    });
    enemy_templates["小门派执事"] = new Enemy({
        name: "小门派执事", 
        description: "血杀殿的余孽真的清光了吗...这个执事怎么看起来像一只荒兽啊。", 
        xp_value: 7575, 
        rank: 2116,
        image: "image/enemy/E2116.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [5,7],
        tags: [],
        stats: {health: 135000, attack:49000, agility: 14500, attack_speed: 1.2, defense: 7500}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.02},
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "黑色刀币", chance:0.40},
            {item_name: "大地级魂魄", chance:1.0},
            
            //应为500X
        ],
    });
    enemy_templates["哥布林战士"] = new Enemy({
        name: "哥布林战士", 
        description: "堪称皮糙肉厚的哥布林。如果它不那么容易被打中就更好了。", 
        xp_value: 7575, 
        rank: 2117,
        image: "image/enemy/E2117.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 180000, attack:32000, agility: 10500, attack_speed: 1.2, defense: 10000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.02},
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "森林·荒兽肉块", chance:0.40},
            {item_name: "甲壳碎片", chance:0.10},
            //应为500X
        ],
    });
    enemy_templates["刺猬精"] = new Enemy({
        name: "刺猬精", 
        description: "至少它没有反伤。光是看着都感觉扎手哇。", 
        xp_value: 7575, 
        rank: 2118,
        image: "image/enemy/E2118.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [20],
        tags: [],
        stats: {health: 72000, attack:20000, agility: 15000, attack_speed: 1.2, defense: 16000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.02},
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "甲壳碎片", chance:0.40},
            //应为500X
        ],
    });
    enemy_templates["毒枭蝎"] = new Enemy({
        name: "毒枭蝎", 
        description: "一般的玩法应该是用一个镐子绕过它啦...可惜，RPG里镐子不能破坏森林的地形。", 
        xp_value: 7575, 
        rank: 2119,
        image: "image/enemy/E2119.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [16,22],
        tags: [],
        stats: {health: 216000, attack:36000, agility: 15000, attack_speed: 1.2, defense: 15000}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.02},
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "甲壳碎片", chance:0.20},
            {item_name: "荒兽精华", chance:0.20},
            //应为500X
        ],
    });
//2-2
    enemy_templates["百家近卫"] = new Enemy({
        name: "百家近卫", 
        description: "不死心的百方在江畔留下了大量百家的探子。不过他们无心战斗，月入3000X拼什么命啊。", 
        xp_value: 7575, 
        rank: 2201,
        image: "image/enemy/E2201.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 200000, attack:44000, agility: 24000, attack_speed: 1.2, defense: 22000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "极品蓝宝石", chance:0.01},
            {item_name: "甲壳碎片", chance:0.40},
            //应为500X
        ],
    });
    enemy_templates["怨灵船夫"] = new Enemy({
        name: "怨灵船夫", 
        description: "别的先不提，你长这样，谁敢来坐你的船啊！", 
        xp_value: 7575, 
        rank: 2202,
        image: "image/enemy/E2202.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [19],
        tags: [],
        stats: {health: 250000, attack:40000, agility: 24000, attack_speed: 1.2, defense: 16000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "极品蓝宝石", chance:0.01},
            {item_name: "A4·能量核心", chance:0.50},
            //应为500X
        ],
    });
    enemy_templates["旱魃龟"] = new Enemy({
        name: "旱魃龟", 
        description: "某一条世界线中，它钻进了地宫浅层，和微花灵阵狼狈为奸，让喵可苦不堪言。幸好，在这里它只是老老实实地待在江边。", 
        xp_value: 7575, 
        rank: 2203,
        image: "image/enemy/E2203.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 10, attack:45000, agility: 20000, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.05},
            {item_name: "极品蓝宝石", chance:0.01},
            {item_name: "甲壳碎片", chance:0.20},
            {item_name: "水溶精华", chance:0.05},
            //应为500X
        ],
    });
    enemy_templates["复苏骸骨"] = new Enemy({
        name: "复苏骸骨", 
        description: "聚灵~聚魂~缠绕~复苏。血洛大陆的能量过于充沛，连骨头都能成为强者了！", 
        xp_value: 10496, 
        rank: 2204,
        image: "image/enemy/E2204.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [24,25],
        tags: [],
        stats: {health: 100000, attack:61000, agility: 32000, attack_speed: 1.2, defense: 19000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "水溶精华", chance:0.10},
            {item_name: "荒兽精华", chance:0.30},
            //应为900X
        ],
    });
    enemy_templates["旅行魔术师"] = new Enemy({
        name: "旅行魔术师", 
        description: "四处卖艺可比在地宫除草赚钱多了！有天剑用，谁还要斩阵这种屑技能啊。", 
        xp_value: 10496, 
        rank: 2205,
        image: "image/enemy/E2205.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [20],
        tags: [],
        stats: {health: 100000, attack:33000, agility: 32000, attack_speed: 1.0, defense: 12000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "A4·能量核心", chance:0.50},
            {item_name: "活化柳木", chance:0.20},
            //应为900X
        ],
    });
    enemy_templates["水溶茸茸"] = new Enemy({
        name: "水溶茸茸", 
        description: "似乎走错了路的光环系茸茸。增幅效果只有灵蔓茸茸的一半，唯一的特点在于可以潜伏在水中，难以抓到。", 
        xp_value: 10496, 
        rank: 2206,
        image: "image/enemy/E2206.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [11],
        tags: [],
        stats: {health: 150000, attack:45000, agility: 36000, attack_speed: 1.2, defense: 30000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "水溶精华", chance:0.20},
            //应为900X
        ],
    });
    enemy_templates["飞龙幼崽"] = new Enemy({
        name: "飞龙幼崽", 
        description: "和地龙幼崽相比多出了在空中吐火的能力。天空级之前，飞行就是绝对实力的象征！", 
        xp_value: 10496, 
        rank: 2207,
        image: "image/enemy/E2207.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [22],
        tags: [],
        stats: {health: 90000, attack:70000, agility: 36000, attack_speed: 1.2, defense: 25000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "森林·荒兽肉块", chance:0.50},
            {item_name: "A4·能量核心", chance:0.50},
            //应为900X
        ],
    });
    enemy_templates["鲜红八爪鱼"] = new Enemy({
        name: "鲜红八爪鱼", 
        description: "为什么陆地上会有八爪鱼...爬上来之后行动笨拙，无法连击，速度也不快。还是老老实实回江里叭。", 
        xp_value: 10496, 
        rank: 2208,
        image: "image/enemy/E2208.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 81000, attack:80000, agility: 24000, attack_speed: 0.9, defense: 22500}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "荒兽精华", chance:0.30},
            {item_name: "水溶精华", chance:0.10},
            //应为900X
        ],
    });
    enemy_templates["商船水手"] = new Enemy({
        name: "商船水手", 
        description: "江边的老水手都拥有一些底牌。诸葛连弩，出来...虽然只有三发就是了啦。", 
        xp_value: 10496, 
        rank: 2209,
        image: "image/enemy/E2209.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [4],
        tags: [],
        stats: {health: 120000, attack:81000, agility: 36000, attack_speed: 1.2, defense: 27000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "活化柳木", chance:0.20},
            {item_name: "一捆黑币", chance:0.04},
            //应为900X
        ],
    });
    enemy_templates["深水恐怖"] = new Enemy({
        name: "深水恐怖", 
        description: "不好！是大惑幻！快吃水心盾！...哦，不是那一只啊。区区10000领域~", 
        xp_value: 10496, 
        rank: 2210,
        image: "image/enemy/E2210.png",
        realm: "<span class=realm_terra><b>大地级五阶 +</b></span>",
        size: "small",
        spec: [35],
        spec_value:{35:10000},
        tags: [],
        stats: {health: 140000, attack:66500, agility: 40000, attack_speed: 1.2, defense: 33500}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:0.03},
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "A4·能量核心", chance:0.50},
            {item_name: "水溶精华", chance:0.10},
            //应为900X
        ],
    });
    enemy_templates["礁石灵"] = new Enemy({
        name: "礁石灵", 
        description: "太邪恶了，坚固敌人居然有基础防御...为此，0.1%魔攻被移除了！", 
        xp_value: 17711, 
        rank: 2211,
        image: "image/enemy/E2211.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 20, attack:88000, agility: 54000, attack_speed: 1.0, defense: 55000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "水溶精华", chance:0.15},
            {item_name: "甲壳碎片", chance:1.00},
            //应为1.6Z
        ],
    });
    enemy_templates["火烧云"] = new Enemy({
        name: "火烧云", 
        description: "不怀好意笑着的云朵魔物。它的攻击能力令人震惊。", 
        xp_value: 17711, 
        rank: 2212,
        image: "image/enemy/E2212.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [33],
        spec_value:{33:6},
        tags: [],
        stats: {health: 220000, attack:94000, agility: 50000, attack_speed: 0.8, defense: 45000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "荒兽精华", chance:0.50},
            {item_name: "A4·能量核心", chance:0.75},
            
            //应为1.6Z
        ],
    });
    enemy_templates["行脚商人"] = new Enemy({
        name: "行脚商人", 
        description: "似乎是之前那些水手的头头。他在这附近还开了一家店...可以去看看~", 
        xp_value: 17711, 
        rank: 2213,
        image: "image/enemy/E2213.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 440000, attack:110000, agility: 54000, attack_speed: 1.2, defense: 45000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "活化柳木", chance:0.30},
            {item_name: "一捆黑币", chance:0.09},
            //应为1.6Z
        ],
    });
    enemy_templates["马里奥菇菇"] = new Enemy({
        name: "马里奥菇菇", 
        description: "看起来没有前面几只强嘛...等会？夺少衰弱？", 
        xp_value: 17711, 
        rank: 2214,
        image: "image/enemy/E2214.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:50},
        tags: [],
        stats: {health: 240000, attack:135000, agility: 36000, attack_speed: 1.2, defense: 20000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "水溶精华", chance:0.32},
            //应为1.6Z
        ],
    });
    enemy_templates["清野江盗匪"] = new Enemy({
        name: "清野江盗匪", 
        description: "在长期的欺凌弱小之下，它的实力变得远不如同级的荒兽,魔物或人类。但是，欺负欺负五阶水手还是可以的。", 
        xp_value: 17711, 
        rank: 2215,
        image: "image/enemy/E2215.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [26],
        tags: [],
        stats: {health: 88000, attack:90000, agility: 48000, attack_speed: 1.2, defense: 30000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "甲壳碎片", chance:0.80},
            {item_name: "黑色刀币", chance:0.60},
            //应为1.6Z
        ],
    });
    enemy_templates["极冰火"] = new Enemy({
        name: "极冰火", 
        description: "似乎逆用了自爆魔法的魔物。如果血量交换比甚至超过4:1，自爆后留下的一滴血不失为搜刮战利品的方法。", 
        xp_value: 17711, 
        rank: 2216,
        image: "image/enemy/E2216.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [36],
        tags: [],
        stats: {health: 810000, attack:108000, agility: 48000, attack_speed: 1.2, defense: 36000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "水溶精华", chance:0.20},
            {item_name: "荒兽精华", chance:0.30},
            //应为1.6Z
        ],
    });
    enemy_templates["清野江窃贼"] = new Enemy({
        name: "清野江窃贼", 
        description: "他偷的船可比盗匪抢的船贵多了。在长期的努力下，他练就了一身敏捷的身法！", 
        xp_value: 17711, 
        rank: 2217,
        image: "image/enemy/E2217.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 250000, attack:105000, agility: 72000, attack_speed: 1.3, defense: 21000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "活化柳木", chance:0.30},
            {item_name: "A4·能量核心", chance:0.75},
            //应为1.6Z
        ],
    });

    //2-3
    
    enemy_templates["大门派杂役"] = new Enemy({
        name: "大门派杂役", 
        description: "纳家秘境怎么会对其他的门派开放啊...或许纳家子弟不够探索这么大的秘境？", 
        xp_value: 17711, 
        rank: 2301,
        image: "image/enemy/E2301.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [32,6],
        spec_value:{},
        tags: [],
        stats: {health: 390000, attack:125000, agility: 60000, attack_speed: 1.2, defense: 15000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "A4·能量核心", chance:0.40},
            {item_name: "秘境芦苇", chance:0.05},
            //1.6Z
        ],
    });
    enemy_templates["燕岗高等散修"] = new Enemy({
        name: "燕岗高等散修", 
        description: "连散修都来了！看来秘境开放是某种半年一遇的盛事...", 
        xp_value: 17711, 
        rank: 2302,
        image: "image/enemy/E2302.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 370000, attack:124000, agility: 64000, attack_speed: 1.2, defense: 54000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.05},
            {item_name: "极品红宝石", chance:0.02},
            {item_name: "秘境芦苇", chance:0.07},
            //1.6Z
        ],
    });
    enemy_templates["高歌骸骨"] = new Enemy({
        name: "高歌骸骨", 
        description: "复苏之后的下一个骸骨进化阶段。比起双持的莽夫行为，它选择了装备盾牌与盔甲。", 
        xp_value: 28657, 
        rank: 2303,
        image: "image/enemy/E2303.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 225000, attack:155000, agility: 72000, attack_speed: 1.2, defense: 60000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "甲壳碎片", chance:0.80},
            {item_name: "浅蓝晶粉", chance:0.04},
            //2.8Z
        ],
    });
    enemy_templates["微花灵阵"] = new Enemy({
        name: "微花灵阵", 
        description: "秘境内增强荒兽与魔物力量的机关。没有攻击能力，但只有力量达到一定的阈值才能击碎。(或者魔攻)", 
        xp_value: 28657, 
        rank: 2304,
        image: "image/enemy/E2304.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 1, attack:1, agility: 1, attack_speed: 0.1, defense: 100000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "浅蓝晶粉", chance:0.09},
            //2.8Z
        ],
    });
     enemy_templates["灵慧石人"] = new Enemy({
        name: "灵慧石人", 
        description: "红眼的魔物，拥有反转的能力。血量有点脆，但高防御又弥补了这一点。", 
        xp_value: 28657, 
        rank: 2305,
        image: "image/enemy/E2305.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [9],
        spec_value:{},
        tags: [],
        stats: {health: 75000, attack:150000, agility: 80000, attack_speed: 1.3, defense: 88000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "水溶精华", chance:0.3},
            {item_name: "秘境芦苇", chance:0.05},
            //2.8Z
        ],
    });
    enemy_templates["纳家探宝者"] = new Enemy({
        name: "纳家探宝者", 
        description: "可恶，是竞争对手！凭什么别人都是卡着等级的上沿进来的耶...", 
        xp_value: 28657, 
        rank: 2306,
        image: "image/enemy/E2306.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [3],
        spec_value:{},
        tags: [],
        stats: {health: 150000, attack:141000, agility: 88000, attack_speed: 1.2, defense: 66000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "秘境芦苇", chance:0.05},
            {item_name: "浅蓝晶粉", chance:0.05},
            //2.8Z
        ],
    });
    enemy_templates["秘境蝎龙"] = new Enemy({
        name: "秘境蝎龙", 
        description: "似乎是毒枭蝎和地龙的杂交产物。那一晚，它们没有喝醉，但等秘境半年开一次再出去实在太难熬了。", 
        xp_value: 28657, 
        rank: 2307,
        image: "image/enemy/E2307.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 64000, attack:480000, agility: 96000, attack_speed: 1.5, defense: 80000}, 
        loot_list: [
            {item_name: "极品蓝宝石", chance:0.03},
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "甲壳碎片", chance:0.5},
            {item_name: "A4·能量核心", chance:0.5},
            {item_name: "浅蓝晶粉", chance:0.05},
            //2.8Z
        ],
    });
    enemy_templates["荒兽法兵"] = new Enemy({
        name: "荒兽法兵", 
        description: "强大的魔法荒兽。源源不断的生命力搭配散华领悟，使它显得分外难缠。", 
        xp_value: 28657, 
        rank: 2308,
        image: "image/enemy/E2308.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [19,37],
        spec_value:{},
        tags: [],
        stats: {health: 1090000, attack:160000, agility: 102000, attack_speed: 1.2, defense: 50000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "水溶精华", chance:0.2},
            {item_name: "浅蓝晶粉", chance:0.09},
            //2.8Z
        ],
    });
    enemy_templates["巨人先锋"] = new Enemy({
        name: "巨人先锋", 
        description: "18.5w攻击，20段连击，40%光环...秘境深处注定将会困难重重。", 
        xp_value: 28657, 
        rank: 2309,
        image: "image/enemy/E2309.png",
        realm: "<span class=realm_terra><b>大地级六阶 +</b></span>",
        size: "small",
        spec: [16],
        spec_value:{},
        tags: [],
        stats: {health: 327000, attack:185000, agility: 108000, attack_speed: 0.8, defense: 77000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "秘境芦苇", chance:0.15},
            //2.8Z
        ],
    });
    //2-4
    
    enemy_templates["威武武士"] = new Enemy({
        name: "威武武士", 
        description: "吃了防御低的亏而被流放到2-2的悲惨敌人。记得回去拿飞...极品绿宝石！", 
        xp_value: 46368,  
        rank: 2401,
        image: "image/enemy/E2401.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 750000, attack:370000, agility: 150000, attack_speed: 1.2, defense: 30000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "蓝金碎片", chance:0.05},
            {item_name: "秘境芦苇", chance:0.05},
            //5.0Z
        ],
    });
    enemy_templates["七阶卫戍"] = new Enemy({
        name: "七阶卫戍", 
        description: "结界湖的守护者。然而，正如老祖所担心的，探险者们已经一拥而入了。", 
        xp_value: 46368, 
        rank: 2402,
        image: "image/enemy/E2402.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 390000, attack:260000, agility: 160000, attack_speed: 1.2, defense: 130000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "A7·能量核心", chance:0.08},
            //5.0Z
        ],
    });
    enemy_templates["秘境帕芙之灵"] = new Enemy({
        name: "秘境帕芙之灵", 
        description: "结界湖中自然滋生的“灵”。常年积累能量下已经抵达大地级七阶。", 
        xp_value: 46368, 
        rank: 2403,
        image: "image/enemy/E2403.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [0],
        spec_value:{},
        tags: [],
        stats: {health: 280000, attack:140000, agility: 168000, attack_speed: 1.2, defense: 140000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "A7·能量核心", chance:0.08},
            //5.0Z
        ],
    });
    enemy_templates["秘境猬精"] = new Enemy({
        name: "秘境猬精", 
        description: "捕食“灵”变得晶莹剔透的刺猬精。一路从荒兽森林跑过来真是辛苦它了。", 
        xp_value: 46368, 
        rank: 2404,
        image: "image/enemy/E2404.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [20],
        spec_value:{},
        tags: [],
        stats: {health: 600000, attack:200000, agility: 152000, attack_speed: 1.2, defense: 90000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "浅蓝晶粉", chance:0.07},
            {item_name: "透明水晶", chance:0.03},
            //5.0Z
        ],
    }); 
    enemy_templates["秘境心火精灵"] = new Enemy({
        name: "秘境心火精灵", 
        description: "其实之前那一只是这个族群的最强者。其他都被它丢到结界湖里面流放了...", 
        xp_value: 46368, 
        rank: 2405,
        image: "image/enemy/E2405.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [27,13],
        spec_value:{},
        tags: [],
        stats: {health: 320000, attack:280000, agility: 144000, attack_speed: 1.2, defense: 120000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "秘境芦苇", chance:0.10},
            {item_name: "透明水晶", chance:0.03},
            //5.0Z
        ],
    });
    enemy_templates["纳家冰雪亲卫"] = new Enemy({
        name: "纳家冰雪亲卫", 
        description: "获取[9]之力量的妖精亲卫。不快点解决的话会有大麻烦。", 
        xp_value: 46368, 
        rank: 2406,
        image: "image/enemy/E2406.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [38],
        spec_value:{},
        tags: [],
        stats: {health: 990000, attack:350000, agility: 180000, attack_speed: 1.6, defense: 75000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "蓝金碎片", chance:0.05},
            {item_name: "A7·能量核心", chance:0.03},
            //5.0Z
        ],
    });
    enemy_templates["有甲有角族"] = new Enemy({
        name: "有甲有角族", 
        description: "为什么有角一族和百家护卫也喝醉了...人不能，至少不应该！", 
        xp_value: 46368, 
        rank: 2407,
        image: "image/enemy/E2407.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [38],
        spec_value:{},
        tags: [],
        stats: {health: 520000, attack:280000, agility: 180000, attack_speed: 1.2, defense: 150000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "蓝金碎片", chance:0.07},
            //5.0Z
        ],
    });
    enemy_templates["水晶傀儡"] = new Enemy({
        name: "水晶傀儡", 
        description: "秘境的“灵”附身在岩石上的形态。比礁石更坚硬些许。", 
        xp_value: 46368, 
        rank: 2408,
        image: "image/enemy/E2408.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [1],
        spec_value:{},
        tags: [],
        stats: {health: 30, attack:250000, agility: 160000, attack_speed: 1.2, defense: 180000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "透明水晶", chance:0.06},
            //5.0Z
        ],
    });
    enemy_templates["原力刀客"] = new Enemy({
        name: "原力刀客", 
        description: "把普通武器当念力兵器耍绝活的刀客，江湖人称13斧的第14名预备成员。", 
        xp_value: 46368, 
        rank: 2409,
        image: "image/enemy/E2409.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [10],
        spec_value:{},
        tags: [],
        stats: {health: 270000, attack:1350000, agility: 200000, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "蓝金碎片", chance:0.07},
            //5.0Z
        ],
    });
     enemy_templates["秘境胖胖鸟"] = new Enemy({
        name: "秘境胖胖鸟", 
        description: "学会了牵制真的不能怪它。在附近都是爆攻人的时候，这简直太赚了...", 
        xp_value: 46368, 
        rank: 2410,
        image: "image/enemy/E2410.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [5],
        spec_value:{},
        tags: [],
        stats: {health: 720000, attack:360000, agility: 210000, attack_speed: 1.2, defense: 180000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "结界湖血肉", chance:0.05},
            //5.0Z
        ],
    });
    enemy_templates["人立金茸茸"] = new Enemy({
        name: "人立金茸茸", 
        description: "半途转换进化方向的茸茸。这条路的终点是天空级二阶，但秘境的能量已经捉襟见肘了。", 
        xp_value: 46368, 
        rank: 2411,
        image: "image/enemy/E2411.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [26],
        spec_value:{},
        tags: [],
        stats: {health: 700000, attack:220000, agility: 220000, attack_speed: 1.2, defense: 120000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.05},
            {item_name: "极品绿宝石", chance:0.02},
            {item_name: "A7·能量核心", chance:0.08},
            //5.0Z
        ],
    });
    enemy_templates["喵咕咕哩"] = new Enemy({
        name: "喵咕咕哩", 
        description: "缺乏基础属性，但可以依靠灵体造成成吨伤害的史莱姆变种(也没有那么多吨)", 
        xp_value: 75025, 
        rank: 2412,
        image: "image/enemy/E2412.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [21],
        spec_value:{21:360000},
        tags: [],
        stats: {health: 2400000, attack:1, agility: 240000, attack_speed: 1.2, defense: 1}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "A7·能量核心", chance:0.08},
            {item_name: "结界湖血肉", chance:0.04},
            //9.0Z
        ],
    });
    enemy_templates["秘境滋生魔"] = new Enemy({
        name: "秘境滋生魔", 
        description: "时封它来了...皮好脆！普攻倍率真是个好东西。", 
        xp_value: 75025, 
        rank: 2413,
        image: "image/enemy/E2413.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [12],
        spec_value:{},
        tags: [],
        stats: {health: 300000, attack:300000, agility: 240000, attack_speed: 1.2, defense: 200000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "A7·能量核心", chance:0.08},
            {item_name: "蓝金碎片", chance:0.06},
            //9.0Z
        ],
    });
    enemy_templates["蓝帽行者"] = new Enemy({
        name: "蓝帽行者", 
        description: "超级大血牛。即使有牵制也无法限制它逆天的战损。", 
        xp_value: 75025, 
        rank: 2414,
        image: "image/enemy/E2414.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [3,5],
        spec_value:{},
        tags: [],
        stats: {health: 15000000, attack:400000, agility: 250000, attack_speed: 1.2, defense: 40000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "A7·能量核心", chance:0.13},
            //9.0Z
        ],
    });
    enemy_templates["流云级魔法师"] = new Enemy({
        name: "流云级魔法师", 
        description: "秘境中的法师。不仅没有学牵制还学了连击，真是到点子上了...", 
        xp_value: 75025, 
        rank: 2415,
        image: "image/enemy/E2415.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [0,6],
        spec_value:{},
        tags: [],
        stats: {health: 256000, attack:80000, agility: 260000, attack_speed: 1.2, defense: 240000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "透明水晶", chance:0.12},
            //9.0Z
        ],
    });
    enemy_templates["威武异衣士"] = new Enemy({
        name: "威武异衣士", 
        description: "换了一件衣服就这么强了！之前的绿色衣服和黑红盾牌原来这么没用吗...", 
        xp_value: 75025, 
        rank: 2416,
        image: "image/enemy/E2416.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 2200000, attack:560000, agility: 270000, attack_speed: 1.2, defense: 90000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "蓝金碎片", chance:0.05},
            {item_name: "蓝金锭", chance:0.015},
            //9.0Z
        ],
    });
    enemy_templates["雪魅蝠"] = new Enemy({
        name: "雪魅蝠", 
        description: "虽然看起来像是毒属性荒兽，却反直觉地有治愈自己的功能。", 
        xp_value: 75025, 
        rank: 2417,
        image: "image/enemy/E2417.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [31],
        spec_value:{},
        tags: [],
        stats: {health: 650000, attack:420000, agility: 280000, attack_speed: 1.5, defense: 260000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "结界湖血肉", chance:0.02},
            {item_name: "A7·能量核心", chance:0.10},
            //9.0Z
        ],
    });
    enemy_templates["大眼八爪鱼"] = new Enemy({
        name: "大眼八爪鱼", 
        description: "防御极高的荒兽。至今为止似乎还没有一只八爪鱼是8连击...或许同时强化八条肢体需要的能量太多了。", 
        xp_value: 75025, 
        rank: 2418,
        image: "image/enemy/E2418.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [10],
        spec_value:{},
        tags: [],
        stats: {health: 950000, attack:480000, agility: 300000, attack_speed: 1.2, defense: 300000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "结界湖血肉", chance:0.06},
            {item_name: "A7·能量核心", chance:0.04},
            //9.0Z
        ],
    });
    enemy_templates["废墟猎兵"] = new Enemy({
        name: "废墟猎兵", 
        description: "平平无奇的废墟探险者。这里已经卷到非大地级后期不可入内的程度了。", 
        xp_value: 75025, 
        rank: 2501,
        image: "image/enemy/E2501.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [3],
        spec_value:{},
        tags: [],
        stats: {health: 1750000, attack:490000, agility: 330000, attack_speed: 1.4, defense: 290000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},{item_name: "废墟精华", chance:0.07},
            //9.0Z
        ],
    });
    enemy_templates["废墟菇灵"] = new Enemy({
        name: "废墟菇灵", 
        description: "似乎是从圣荒城来的蘑菇。继承了蘑菇一贯的毒魔法的同时居然十分贪财？", 
        xp_value: 75025, 
        rank: 2502,
        image: "image/enemy/E2502.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [8,18],
        spec_value:{8:10,18:2e9},
        tags: [],
        stats: {health: 900000, attack:600000, agility: 360000, attack_speed: 1.2, defense: 333333}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "废墟精华", chance:0.07},
            //9.0Z
        ],
    });
    enemy_templates["燕岗城探险者"] = new Enemy({
        name: "燕岗城探险者", 
        description: "呦，老乡啊~燕岗城人没有什么特别的弱点。不像圣荒城居民看到钱就走不动路，兰陵城居民痴迷于宝石。", 
        xp_value: 75025, 
        rank: 2503,
        image: "image/enemy/E2503.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 3000000, attack:700000, agility: 360000, attack_speed: 1.2, defense: 140000}, 
        loot_list: [
            {item_name: "极品红宝石", chance:0.03},
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "绿色刀币", chance:0.01},
            //9.0Z
        ],
    });
    enemy_templates["声律城骸骨"] = new Enemy({
        name: "声律城骸骨", 
        description: "它的骨头已经炼到[蓝玉]等级了。拿起来就能直接当缠绕水晶用！", 
        xp_value: 121393, 
        rank: 2504,
        image: "image/enemy/E2504.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 6000000, attack:610000, agility: 400000, attack_speed: 1.2, defense: 265000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "透明水晶", chance:0.1},
            {item_name: "A7·能量核心", chance:0.1},
            //16Z
        ],
    });
    enemy_templates["声律城难民"] = new Enemy({
        name: "声律城难民", 
        description: "虽然有不错的机制，但是饿了好几天了，血量已经几乎见底。异界之门也无力发挥。", 
        xp_value: 121393, 
        rank: 2505,
        image: "image/enemy/E2505.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [19,15],
        spec_value:{},
        tags: [],
        stats: {health: 1280000, attack:570000, agility: 440000, attack_speed: 1.6, defense: 34000}, 
        loot_list: [
            {item_name: "绿色刀币", chance:0.01},
            {item_name: "废墟符文", chance:0.04},
            //16Z
        ],
    });
    enemy_templates["锈胎人"] = new Enemy({
        name: "锈胎人", 
        description: "泪点解析：召唤物不会掉宝石和物品，只有经验。", 
        xp_value: 121393, 
        rank: 2506,
        image: "image/enemy/E2506.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [41,33],
        spec_value:{33:4},
        tags: [],
        stats: {health: 9000000, attack:540000, agility: 480000, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "废墟精华", chance:0.07},
            {item_name: "A7·能量核心", chance:0.06},
            //16Z
        ],
    });
    enemy_templates["紫锈胎人"] = new Enemy({
        name: "紫锈胎人", 
        description: "哎，召唤。怎么会有这种技能的啊...", 
        xp_value: 121393, 
        rank: 2506.5,
        image: "image/enemy/E2506a.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [33],
        spec_value:{33:4},
        tags: [],
        stats: {health: 9000000, attack:540000, agility: 480000, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            //16Z
        ],
    });
    enemy_templates["双棱晶体"] = new Enemy({
        name: "双棱晶体", 
        description: "怎么看都是二极蝠的翻版。红+绿比红+蓝要更加鲜明呢。", 
        xp_value: 121393, 
        rank: 2507,
        image: "image/enemy/E2507.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 750000, attack:2500000, agility: 520000, attack_speed: 1.2, defense: 480000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "绿色刀币", chance:0.016},
            //16Z
        ],
    });
    enemy_templates["废墟恐怖"] = new Enemy({
        name: "废墟恐怖", 
        description: "总算有个说得过去的领域了。如果攻击仅仅略微超过它的防御，会被反伤巨额伤害...", 
        xp_value: 121393, 
        rank: 2508,
        image: "image/enemy/E2508.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [35],
        spec_value:{35:1000000},
        tags: [],
        stats: {health: 2000000, attack:750000, agility: 560000, attack_speed: 1.2, defense: 500000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "废墟符文", chance:0.06},
            {item_name: "废墟精华", chance:0.07},
            //16Z
        ],
    });
    enemy_templates["兰陵城探险者"] = new Enemy({
        name: "兰陵城探险者", 
        description: "兰陵城，即蓝零城。鉴于喵可RPG没有蓝钥匙，这个属性被改为根据VP波动了！", 
        xp_value: 121393, 
        rank: 2509,
        image: "image/enemy/E2509.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [39],
        spec_value:{39:1500},
        tags: [],
        stats: {health: 3500000, attack:690000, agility: 520000, attack_speed: 1.2, defense: 410000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "废墟恢复药水", chance:0.01},
            //16Z
        ],
    });
    enemy_templates["猫茸茸"] = new Enemy({
        name: "猫茸茸", 
        description: "与普遍的看法不同，它并没有光环。肯定是灵蔓茸茸和水溶茸茸让人产生了“蓝色茸茸都是光环茸茸”的印象！", 
        xp_value: 121393, 
        rank: 2510,
        image: "image/enemy/E2510.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [37],
        spec_value:{},
        tags: [],
        stats: {health: 16000000, attack:720000, agility: 600000, attack_speed: 1.2, defense: 240000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "废墟精华", chance:0.04},
            {item_name: "A7·能量核心", chance:0.1},//16Z
        ],
    });
    enemy_templates["圣荒城探险者"] = new Enemy({
        name: "圣荒城探险者", 
        description: "圣荒城，即省黄城。传说中在那里，即使如昊荒那样的云霄级强者，面对足够的财富仍然毫无反抗之力。", 
        xp_value: 121393, 
        rank: 2511,
        image: "image/enemy/E2511.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [18],
        spec_value:{18:4e9},
        tags: [],
        stats: {health: 7200000, attack:880000, agility: 640000, attack_speed: 1.2, defense: 440000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "绿色刀币", chance:0.02},//16Z
        ],
    });
    enemy_templates["远古傀儡"] = new Enemy({
        name: "远古傀儡", 
        description: "D9飞船一砸，上个纪元的东西都跑出来了。它的巅峰远不止于此，但现在已经快没电了...只有防御力还较为强悍。", 
        xp_value: 121393, 
        rank: 2512,
        image: "image/enemy/E2512.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 2340000, attack:900000, agility: 680000, attack_speed: 1.2, defense: 600000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "A7·能量核心", chance:0.17},//16Z
        ],
    });
    enemy_templates["血洛幽灵"] = new Enemy({
        name: "血洛幽灵", 
        description: "似乎是废墟追光者的初形态。在学会【追光】之前，它还只是一只平平无奇的影子荒兽。", 
        xp_value: 121393, 
        rank: 2513,
        image: "image/enemy/E2513.png",
        realm: "<span class=realm_terra><b>大地级八阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 1690000, attack:1270000, agility: 720000, attack_speed: 1.2, defense: 390000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.05},
            {item_name: "殿堂黄宝石", chance:0.02},
            {item_name: "绿色刀币", chance:0.02},//16Z
        ],
    });
    enemy_templates["废墟飞鸟"] = new Enemy({
        name: "废墟飞鸟", 
        description: "认真的嘛...连飞鸟都学会飓风了！特殊属性的数值膨胀可见一斑。", 
        xp_value: 196418, 
        rank: 2514,
        image: "image/enemy/E2514.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [16],
        spec_value:{},
        tags: [],
        stats: {health: 6000000, attack:1000000, agility: 760000, attack_speed: 1.2, defense: 500000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.03},
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "废墟精华", chance:0.20},//28Z
        ],
    });
    enemy_templates["兰陵城小队长"] = new Enemy({
        name: "兰陵城小队长", 
        description: "它可能因VP过多无法对你造成伤害，但如果你也打不动它，这份减伤就显得有点没用了。", 
        xp_value: 196418, 
        rank: 2515,
        image: "image/enemy/E2515.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [39],
        spec_value:{39:5000},
        tags: [],
        stats: {health: 6500000, attack:990000, agility: 800000, attack_speed: 1.2, defense: 710000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.03},
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "废墟狂暴药水", chance:0.025},
            {item_name: "绿色刀币", chance:0.02},
            //28Z
        ],
    });
    enemy_templates["伏地精"] = new Enemy({
        name: "伏地精", 
        description: "玻璃大炮型的荒兽。幸好血门不在它的后面...", 
        xp_value: 196418, 
        rank: 2516,
        image: "image/enemy/E2516.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [7],
        spec_value:{},
        tags: [],
        stats: {health: 4800000, attack:1200000, agility: 840000, attack_speed: 1.2, defense: 300000}, 
        loot_list: [
            {item_name: "极品绿宝石", chance:0.03},
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "废墟符文", chance:0.08},
            {item_name: "绿色刀币", chance:0.02},
            //28Z
        ],
    });

    //2-6


    enemy_templates["废墟虫卒"] = new Enemy({
        name: "废墟虫卒", 
        description: "属(na)性(li)均(dou)衡(cai)的智慧荒兽，城郊战场的杂兵。", 
        xp_value: 196418, 
        rank: 2601,
        image: "image/enemy/E2601.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 2500000, attack:1080000, agility: 800000, attack_speed: 1.2, defense: 690000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "战场·荒兽肉块", chance:0.07},
            //28Z
        ],
    });
    enemy_templates["战场亡魂"] = new Enemy({
        name: "战场亡魂", 
        description: "似乎是13斧成员死后留下的亡魂。绝世已经退环境了...飓风和追光才是主流。", 
        xp_value: 196418, 
        rank: 2602,
        image: "image/enemy/E2602.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [22],
        spec_value:{},
        tags: [],
        stats: {health: 1100000, attack:2100000, agility: 880000, attack_speed: 1.8, defense: 0}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "高能凝胶", chance:0.17},
            //28Z
        ],
    });
    enemy_templates["废墟追风者"] = new Enemy({
        name: "废墟追风者", 
        description: "光元素在城外的黑暗战场相当稀少。虽然风元素领悟的效力稍逊一筹，但也只能将就了。", 
        xp_value: 196418, 
        rank: 2603,
        image: "image/enemy/E2603.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [16],
        spec_value:{},
        tags: [],
        stats: {health: 10200000, attack:1600000, agility: 960000, attack_speed: 1.2, defense: 520000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "废墟符文", chance:0.1},
            {item_name: "废墟精华", chance:0.1},
            //28Z
        ],
    });
    
    enemy_templates["古寒铁石精"] = new Enemy({
        name: "古寒铁石精", 
        description: "理论上带精的金属要高一个大等级...但考虑到铁本身不入流，铁精也不会超过A9级就是了。", 
        xp_value: 196418, 
        rank: 2604,
        image: "image/enemy/E2604.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [1],
        spec_value:{},
        tags: [],
        stats: {health: 10, attack:1500000, agility: 1040000, attack_speed: 1.2, defense: 1000000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "铁锭", chance:20},
            {item_name: "精钢锭", chance:10},
            //28Z
        ],
    });
    
    enemy_templates["暗茸茸战士"] = new Enemy({
        name: "暗茸茸战士", 
        description: "从血与火中杀出的阴暗茸茸。强大却后继乏力。", 
        xp_value: 196418, 
        rank: 2605,
        image: "image/enemy/E2605.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 600000, attack:1440000, agility: 1040000, attack_speed: 1.2, defense: 960000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "高能凝胶", chance:0.10},
            {item_name: "废墟精华", chance:0.08},
            //28Z
        ],
    });

    
    enemy_templates["魔族潜行者"] = new Enemy({
        name: "魔族潜行者", 
        description: "抓到你喽~它出现的概率是其他敌人的两倍。", 
        xp_value: 196418, 
        rank: 2606,
        image: "image/enemy/E2606.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 4480000, attack:1370000, agility: 1040000, attack_speed: 1.2, defense: 760000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "高能凝胶", chance:0.10},
            {item_name: "废墟精华", chance:0.20},
            //28Z
        ],
    });

    enemy_templates["圣荒城骑士"] = new Enemy({
        name: "圣荒城骑士", 
        description: "圣荒城人永不臣服！除非包吃包住！", 
        xp_value: 196418, 
        rank: 2607,
        image: "image/enemy/E2607.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [18],
        spec_value:{18:8e9},
        tags: [],
        stats: {health: 3300000, attack:1360000, agility: 1100000, attack_speed: 1.2, defense: 1040000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "绿色刀币", chance:0.03},
            //28Z
        ],
    });
    enemy_templates["战场凶残暴徒"] = new Enemy({
        name: "战场凶残暴徒", 
        description: "与其说它凶残，不如说它靠着绝对防御的战术，抢到宝物之后就一直抓着不放了。", 
        xp_value: 196418, 
        rank: 2608,
        image: "image/enemy/E2608.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 1450000, attack:1530000, agility: 1200000, attack_speed: 1.2, defense: 1080000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "高能织料", chance:0.14},
            //28Z
        ],
    });
    enemy_templates["战场复苏骸骨"] = new Enemy({
        name: "战场复苏骸骨", 
        description: "和之前的骸骨不同，它仅剩下一颗头颅。虽然靠着与蠕虫的共生恢复了行动能力，但外泄的大量气息会引起周围荒兽的狂暴。", 
        xp_value: 196418, 
        rank: 2609,
        image: "image/enemy/E2609.png",
        realm: "<span class=realm_terra><b>大地级八阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 1240000, attack:1700000, agility: 1200000, attack_speed: 1.2, defense: 800000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.05},
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "微花残片", chance:0.15},
            {item_name: "A7·能量核心", chance:0.2},
            //28Z
        ],
    });
    enemy_templates["探险者队长"] = new Enemy({
        name: "探险者队长", 
        description: "燕岗城的小队长。没有特殊弱点的同时，拥有强大的阵法领悟。", 
        xp_value: 317811, 
        rank: 2610,
        image: "image/enemy/E2610.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [42],
        spec_value:{},
        tags: [],
        stats: {health: 11250000, attack:1690000, agility: 1200000, attack_speed: 1.2, defense: 800000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.03},
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "海绿锭", chance:0.06},
            //50Z
        ],
    });
    enemy_templates["废墟荒兽"] = new Enemy({
        name: "废墟荒兽", 
        description: "大地级巅峰的强大荒兽。饿了几天的喵可终于有能吃的东西了——。", 
        xp_value: 317811, 
        rank: 2611,
        image: "image/enemy/E2611.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [3],
        spec_value:{},
        tags: [],
        stats: {health: 6250000, attack:1850000, agility: 1200000, attack_speed: 1.2, defense: 750000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.03},
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "战场·荒兽肉块", chance:0.10},
            //50Z
        ],
    });
    enemy_templates["哥布林盾兵"] = new Enemy({
        name: "哥布林盾兵", 
        description: "你怎么长得和2-1那只那么像啊。是亲兄弟嘛...盾兵死亡率低一些，所以境界也可以累积的高一些。", 
        xp_value: 317811, 
        rank: 2612,
        image: "image/enemy/E2612.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 3300000, attack:1750000, agility: 1280000, attack_speed: 1.2, defense: 1150000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.03},
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "战场·荒兽肉块", chance:0.07},
            {item_name: "废墟精华", chance:0.10},
            //50Z
        ],
    });
    enemy_templates["鎏银幽灵"] = new Enemy({
        name: "鎏银幽灵", 
        description: "流银护卫...是同种类型的存在呢。战至最后一刻——自刎归天！", 
        xp_value: 317811, 
        rank: 2613,
        image: "image/enemy/E2613.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [16,36],
        spec_value:{},
        tags: [],
        stats: {health: 4000000, attack:1900000, agility: 1360000, attack_speed: 1.2, defense: 1320000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.03},
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "高能凝胶", chance:0.2},
            {item_name: "废墟精华", chance:0.20},
            //50Z
        ],
    });
    enemy_templates["血洛老年修士"] = new Enemy({
        name: "血洛老年修士", 
        description: "词头是血洛耶。不会那么老的原因是花了几百年跑过了几个世界...", 
        xp_value: 317811, 
        rank: 2614,
        image: "image/enemy/E2614.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 5600000, attack:1400000, agility: 1200000, attack_speed: 1.2, defense: 880000}, 
        loot_list: [
            {item_name: "殿堂黄宝石", chance:0.03},
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "废墟精华", chance:0.30},
            {item_name: "A7·能量核心", chance:0.16},
            //50Z
        ],
    });
    enemy_templates["初级卫兵A9"] = new Enemy({
        name: "初级卫兵A9", 
        description: "或许境界更应该叫做行星级九阶?散华不满血，满血不可敌。", 
        xp_value: 317811, 
        rank: 2701,
        image: "image/enemy/E2701.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [37],
        spec_value:{},
        tags: [],
        stats: {health: 14400000, attack:3200000, agility: 1600000, attack_speed: 1.2, defense: 1250000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "殿堂红宝石", chance:0.005},
            {item_name: "重甲残骸", chance:0.09},
            //50Z
        ],
    });
    
    enemy_templates["领域之械A9"] = new Enemy({
        name: "领域之械A9", 
        description: "相当令人讨厌的领域。数值和废墟恐怖一个量级，唯一的好事在于殿堂级宝石升高了血限。", 
        xp_value: 317811, 
        rank: 2702,
        image: "image/enemy/E2702.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [35],
        spec_value:{35:5000000},
        tags: [],
        stats: {health: 1840000, attack:2900000, agility: 1800000, attack_speed: 1.2, defense: 2000000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "殿堂红宝石", chance:0.005},
            {item_name: "雷电加护", chance:0.07},
            //50Z
        ],
    });

    
    enemy_templates["荒兽电法兵"] = new Enemy({
        name: "荒兽电法兵", 
        description: "至少它失去了散华。秘境的残血·收割机已经一去不复返了.....", 
        xp_value: 317811, 
        rank: 2703,
        image: "image/enemy/E2703.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [0],
        spec_value:{},
        tags: [],
        stats: {health: 3750000, attack:1000000, agility: 2000000, attack_speed: 1.2, defense: 1000000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "殿堂红宝石", chance:0.005},
            {item_name: "雷电加护", chance:0.08},
            //50Z
        ],
    });
    
    enemy_templates["黑桃重工A9"] = new Enemy({
        name: "黑桃重工A9", 
        description: "重工系列(1/4).拥有不错的输出和免伤，但生命力有限脆弱。", 
        xp_value: 317811, 
        rank: 2704,
        image: "image/enemy/E2704.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [0,23],
        spec_value:{},
        tags: [],
        stats: {health: 5750000, attack:2250000, agility: 2200000, attack_speed: 1.2, defense: 1500000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.05},
            {item_name: "殿堂红宝石", chance:0.005},
            {item_name: "红黑印记", chance:0.06},
            //50Z
        ],
    });

    
    enemy_templates["夹击之械A9"] = new Enemy({
        name: "夹击之械A9", 
        description: "鉴于Neko RPG中的攻击是以线列步兵形式进行的...夹击一点用处都没有了！", 
        xp_value: 514229, 
        rank: 2705,
        image: "image/enemy/E2705.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 2250000, attack:2800000, agility: 2300000, attack_speed: 1.2, defense: 1600000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "雷电加护", chance:0.13},
            //90Z
        ],
    });

    
    enemy_templates["神权十字A9"] = new Enemy({
        name: "神权十字A9", 
        description: "普普通通的重甲步兵。是怎么分裂出两份盔甲的呢？", 
        xp_value: 514229, 
        rank: 2706,
        image: "image/enemy/E2706.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [26],
        spec_value:{},
        tags: [],
        stats: {health: 4100000, attack:1500000, agility: 2400000, attack_speed: 1.2, defense: 1500000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "重甲残骸", chance:0.18},
            //90Z
        ],
    });

    
    enemy_templates["梅花重工A9"] = new Enemy({
        name: "梅花重工A9", 
        description: "特长是反转和...牵制。这么点防御力，肯定会是累赘的吧...", 
        xp_value: 514229, 
        rank: 2707,
        image: "image/enemy/E2707.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [9,5],
        spec_value:{},
        tags: [],
        stats: {health: 28000000, attack:5400000, agility: 2500000, attack_speed: 1.2, defense: 1080000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "红黑印记", chance:0.14},
            //90Z
        ],
    });

    enemy_templates["古老符文"] = new Enemy({
        name: "古老符文", 
        description: "诶？地宫那个是你的亲戚吗？长得一模一样哇。", 
        xp_value: 514229, 
        rank: 2708,
        image: "image/enemy/E2708.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [9],
        spec_value:{},
        tags: [],
        stats: {health: 3600000, attack:3500000, agility: 2600000, attack_speed: 1.2, defense: 1100000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "摩羽币", chance:0.07},
            //90Z
        ],
    });

    enemy_templates["生命熔炉A9"] = new Enemy({
        name: "生命熔炉A9", 
        description: "内鬼来了。-20%区域光环改为-10%全局光环...毕竟区域太难搞了x", 
        xp_value: 514229, 
        rank: 2709,
        image: "image/enemy/E2709.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [29],
        spec_value:{29:4000000},
        tags: [],
        stats: {health: 8800000, attack: 4900000, agility: 2700000, attack_speed: 1.2, defense: 1440000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "重甲残骸", chance:0.15},
            //90Z
        ],
    });

    
    enemy_templates["高级卫兵B1"] = new Enemy({
        name: "高级卫兵B1", 
        description: "飞船内A9和B1级生物整体呈现交错杂居...不好意思走错片场了", 
        xp_value: 1346269, 
        rank: 2710,
        image: "image/enemy/E2710.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [37],
        spec_value:{},
        tags: [],
        stats: {health: 52800000, attack: 4700000, agility: 3600000, attack_speed: 1.2, defense: 2750000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "B1·能量核心", chance:0.15},
            {item_name: "重甲残骸", chance:0.25},
            //500Z
        ],
    });
    enemy_templates["白银之锋A9"] = new Enemy({
        name: "白银之锋A9", 
        description: "“普通”和“全点攻击”是什么呢？", 
        xp_value: 514229, 
        rank: 2711,
        image: "image/enemy/E2711.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 700000, attack: 7500000, agility: 3000000, attack_speed: 1.2, defense: 2000000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "摩羽币", chance:0.07},
            //90Z
        ],
    });
    enemy_templates["黑铁战士B1"] = new Enemy({
        name: "黑铁战士B1", 
        description: "416！416！416！我是超级防杀人！", 
        xp_value: 1346269, 
        rank: 2712,
        image: "image/enemy/E2712.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 41600000, attack: 4160000, agility: 4160000, attack_speed: 1.2, defense: 4160000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "B1·能量核心", chance:0.15},
            {item_name: "摩羽币", chance:0.05},
            {item_name: "雷电加护", chance:0.4},
            //500Z
        ],
    });
    enemy_templates["持盾战士A9"] = new Enemy({
        name: "持盾战士A9", 
        description: "再怎么拿盾你也没有那个天空级的家伙强的。说起来，地宫养殖者的60w在这里算什么...", 
        xp_value: 514229, 
        rank: 2713,
        image: "image/enemy/E2713.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [1],
        spec_value:{},
        tags: [],
        stats: {health: 10, attack: 5000000, agility: 3200000, attack_speed: 1.2, defense: 3000000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "重甲残骸", chance:0.18},
            //90Z
        ],
    });
    enemy_templates["血洛游侠"] = new Enemy({
        name: "血洛游侠", 
        description: "法师/蝙蝠的双面生物。似乎蝙蝠更强一点耶。", 
        xp_value: 1346269, 
        rank: 2714,
        image: "image/enemy/E2714.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [10],
        spec_value:{},
        tags: [],
        stats: {health: 52800000, attack: 3200000, agility: 3200000, attack_speed: 1.2, defense: 1600000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "摩羽币", chance:0.3},
            //500Z
        ],
    });
    
    enemy_templates["方片重工A9"] = new Enemy({
        name: "方片重工A9", 
        description: "重工系列(3/4).两个特殊属性配合的最好的一次，感觉连B1级生物都随便打！", 
        xp_value: 514229, 
        rank: 2715,
        image: "image/enemy/E2715.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [8,40],
        spec_value:{8:10},
        tags: [],
        stats: {health: 4500000, attack: 5000000, agility: 3200000, attack_speed: 1.2, defense: 3000000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "红黑印记", chance:0.2},
            {item_name: "雷电加护", chance:0.4},
            //90Z
        ],
    });
    enemy_templates["燕岗狂战傀儡"] = new Enemy({
        name: "燕岗狂战傀儡", 
        description: "傀儡怎么可以把伤害转化为生命力呢？简直是未解之谜。", 
        xp_value: 1346269, 
        rank: 2716,
        image: "image/enemy/E2716.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [7,24],
        spec_value:{},
        tags: [],
        stats: {health: 2600000, attack: 4100000, agility: 3200000, attack_speed: 1.2, defense: 1900000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "B1·能量核心", chance:0.2},
            //500Z
        ],
    });
    
    enemy_templates["激光炮塔A9"] = new Enemy({
        name: "激光炮塔A9", 
        description: "激光不是受击特效，而是攻击特效了！无论普攻中不中，激光都是必中的~", 
        xp_value: 514229, 
        rank: 2717,
        image: "image/enemy/E2717.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [43],
        spec_value:{43:2500000},
        tags: [],
        stats: {health: 960000, attack: 3600000, agility: 3400000, attack_speed: 1.2, defense: 2800000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "雷电加护", chance:0.2},
            //90Z
        ],
    });
    enemy_templates["舰船护卫A9"] = new Enemy({
        name: "舰船护卫A9", 
        description: "看来百方就是不知道从哪搞来了两只快没电的这种护卫。不过，他那两只还怪有用的，可以打6连击。", 
        xp_value: 514229, 
        rank: 2718,
        image: "image/enemy/E2718.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 19900000, attack: 3300000, agility: 3200000, attack_speed: 1.2, defense: 2330000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.04},
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "重甲残骸", chance:0.2},
            //90Z
        ],
    });
    
    enemy_templates["红桃重工B1"] = new Enemy({
        name: "红桃重工B1", 
        description: "重工系列的巅峰之作...哈？时封配饮盾？来搞笑的吗？还不如方片耶。", 
        xp_value: 1346269, 
        rank: 2719,
        image: "image/enemy/E2719.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [12,25],
        spec_value:{},
        tags: [],
        stats: {health: 1, attack: 4800000, agility: 3800000, attack_speed: 1.2, defense: 3000000}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "红黑印记", chance:0.8},
            //500Z
        ],
    });
    
    enemy_templates["塔门战甲B1"] = new Enemy({
        name: "塔门战甲B1", 
        description: "可以召唤许多舰船除草机。虽然看起来很像送经验的...", 
        xp_value: 1346269, 
        rank: 2801,
        image: "image/enemy/E2801.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [44],
        spec_value:{},
        tags: [],
        stats: {health: 1900e4, attack: 880e4, agility: 400e4, attack_speed: 1.2, defense: 200e4}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "红钢锭", chance:0.2},
            {item_name: "一捆高能凝胶", chance:0.01},
            //500Z
        ],
    });
    enemy_templates["万象天引B1"] = new Enemy({
        name: "万象天引B1", 
        description: "看起来像是某种阿拉丁神灯。不过它可不会满足你的愿望。", 
        xp_value: 1346269, 
        rank: 2802,
        image: "image/enemy/E2802.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 1521e4, attack: 740e4, agility: 420e4, attack_speed: 1.2, defense: 280e4}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "血气升腾药剂", chance:0.1},
            {item_name: "一捆B1·能量核心", chance:0.001},
            //500Z
        ],
    });
     enemy_templates["镭射步兵B1"] = new Enemy({
        name: "镭射步兵B1", 
        description: "只要打得中它，就不会被万恶的阻击伤害到。不过，镭射不是激光的意思吗...", 
        xp_value: 1346269, 
        rank: 2803,
        image: "image/enemy/E2803.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [29],
        spec_value:{29:10000000},
        tags: [],
        stats: {health: 640e4, attack: 600e4, agility: 400e4, attack_speed: 1.2, defense: 420e4}, 
        loot_list: [
            {item_name: "殿堂蓝宝石", chance:0.02},
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "红黑印记", chance:0.2},
            {item_name: "一捆B1·能量核心", chance:0.001},
            //500Z
        ],
    });
    enemy_templates["空间三角B1"] = new Enemy({
        name: "空间三角B1", 
        description: "其实只是核心的敌人。之所以外面那一只有那么多宝石...占山为王desu。", 
        xp_value: 2178309, 
        rank: 2804,
        image: "image/enemy/E2804.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 1050e4, attack: 650e4, agility: 440e4, attack_speed: 1.2, defense: 350e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "殿堂绿宝石", chance:0.02},
            {item_name: "摩羽币", chance:0.5},
            {item_name: "一捆高能凝胶", chance:0.006},
            //900Z
        ],
    });
    enemy_templates["舰船除草机B1"] = new Enemy({
        name: "舰船除草机B1", 
        description: "其实挺难搞的，但只要你有够多的破墙镐...我是说绿色刀币。", 
        xp_value: 2178309, 
        rank: 2805,
        image: "image/enemy/E2805.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [8,18],
        spec_value:{8:10,18:10e9},
        tags: [],
        stats: {health: 529e4, attack: 830e4, agility: 460e4, attack_speed: 1.2, defense: 350e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "殿堂绿宝石", chance:0.02},
            {item_name: "紫色刀币", chance:0.0009},
            //900Z
        ],
    });
    enemy_templates["异化者B1"] = new Enemy({
        name: "异化者B1", 
        description: "最后一看，追光得了MVP。老盯着这个伤害数字干嘛？它会把反转的努力异化掉的！", 
        xp_value: 2178309, 
        rank: 2806,
        image: "image/enemy/E2806.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [9],
        spec_value:{},
        tags: [],
        stats: {health: 850e4, attack: 770e4, agility: 480e4, attack_speed: 1.2, defense: 380e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "殿堂绿宝石", chance:0.02},
            {item_name: "血气升腾药剂", chance:0.13},
            {item_name: "一捆高能凝胶", chance:0.03},
            //900Z
        ],
    });
    enemy_templates["核爆能源"] = new Enemy({
        name: "核爆能源", 
        description: "真正的核爆也不过如此了。说起来，13斧考不考虑招核弹？", 
        xp_value: 3524578, 
        rank: 2807,
        image: "image/enemy/E2807.png",
        realm: "<span class=realm_sky><b>天空级二阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 5555.5e4, attack: 1111e4, agility: 500e4, attack_speed: 1.2, defense: 0e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "雷电加护", chance:1},
            {item_name: "一捆B1·能量核心", chance:0.004},
            //1.6D
        ],
    });
    enemy_templates["鲜血之锋B1"] = new Enemy({
        name: "鲜血之锋B1", 
        description: "哈？夺少血？散华？你说你是天空一阶有人信吗？快去请魔攻牵制老祖！", 
        xp_value: 5702887, 
        rank: 2808,
        image: "image/enemy/E2808.png",
        realm: "<span class=realm_sky><b>天空级一阶 +++</b></span>",
        size: "small",
        spec: [37],
        spec_value:{},
        tags: [],
        stats: {health: 81920e4, attack: 1600e4, agility: 600e4, attack_speed: 1.2, defense: 10e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "血气升腾药剂", chance:0.5},
            //1.6D
        ],
    });
    enemy_templates["剧毒恐怖B1"] = new Enemy({
        name: "剧毒恐怖B1", 
        description: "总比你下面的那一只好打。迄今为止还没有任何毒素可以和【马里奥菇菇】媲美...", 
        xp_value: 2178309, 
        rank: 2809,
        image: "image/enemy/E2809.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 450e4, attack: 940e4, agility: 540e4, attack_speed: 1.2, defense: 500e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "殿堂绿宝石", chance:0.02},
            {item_name: "一捆B1·能量核心", chance:0.003},
            //900Z
        ],
    });
    enemy_templates["黄金茸茸"] = new Enemy({
        name: "黄金茸茸", 
        description: "贵金属茸茸似乎是一条不错的进化路线。不过个人意见：返璞归真的【亲民茸茸】才是究极体。", 
        xp_value: 3524578, 
        rank: 2810,
        image: "image/enemy/E2810.png",
        realm: "<span class=realm_sky><b>天空级二阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 800e4, attack: 900e4, agility: 560e4, attack_speed: 1.2, defense: 240e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "一捆高能凝胶", chance:0.05},
            //1.6D
        ],
    });
    enemy_templates["银色血眼B1"] = new Enemy({
        name: "银色血眼B1", 
        description: "久违(?)的坚固属性。三叉戟打的就是你这种硬石头！", 
        xp_value: 2178309, 
        rank: 2811,
        image: "image/enemy/E2811.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [1],
        spec_value:{},
        tags: [],
        stats: {health: 28, attack: 1100e4, agility: 600e4, attack_speed: 1.2, defense: 600e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "殿堂绿宝石", chance:0.02},
            {item_name: "红钢锭", chance:0.33},
            {item_name: "一捆B1·能量核心", chance:0.001},
            //900Z
        ],
    });
    enemy_templates["光子石像B1"] = new Enemy({
        name: "光子石像B1", 
        description: "警惕一切和【光】有关的东西。天空级一阶和arc的定数10.6变成一样的定位了...", 
        xp_value: 5702887, 
        rank: 2812,
        image: "image/enemy/E2812.png",
        realm: "<span class=realm_sky><b>天空级一阶 +++</b></span>",
        size: "small",
        spec: [40],
        spec_value:{},
        tags: [],
        stats: {health: 500e4, attack: 1050e4, agility: 640e4, attack_speed: 1.2, defense: 550e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "一捆B1·能量核心", chance:0.0025},
            {item_name: "B1·能量核心", chance:0.25},
            {item_name: "A7·能量核心", chance:2.5},
            //1.6D
        ],
    });
    enemy_templates["游走三头蛇"] = new Enemy({
        name: "游走三头蛇", 
        description: "它怎么没有导致飞船的机械短路呢？防护工作做的真好哇。", 
        xp_value: 3524578, 
        rank: 2813,
        image: "image/enemy/E2813.png",
        realm: "<span class=realm_sky><b>天空级二阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 4400e4, attack: 980e4, agility: 660e4, attack_speed: 1.2, defense: 420e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "战场·荒兽肉排", chance:1},
            {item_name: "一捆高能凝胶", chance:0.05},
            //1.6D
        ],
    });
    enemy_templates["质子粉碎机B1"] = new Enemy({
        name: "质子粉碎机B1", 
        description: "夭寿啦——夸克禁闭坏掉啦——", 
        xp_value: 2178309, 
        rank: 2814,
        image: "image/enemy/E2814.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [7],
        spec_value:{},
        tags: [],
        stats: {health: 1440e4, attack: 960e4, agility: 680e4, attack_speed: 1.2, defense: 500e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.05},
            {item_name: "殿堂绿宝石", chance:0.02},
            {item_name: "雷电加护", chance:1},
            {item_name: "一捆高能凝胶", chance:0.02},
            //900Z
        ],
    });
    enemy_templates["城主府基层"] = new Enemy({
        name: "城主府基层", 
        description: "没有明说，但不吃贪婪应该是燕岗城的城主府。疾走已经退环境了...现在就连飓风都不好意思拿出来了。", 
        xp_value: 3524578, 
        rank: 2815,
        image: "image/enemy/E2815.png",
        realm: "<span class=realm_sky><b>天空级二阶</b></span>",
        size: "small",
        spec: [4],
        spec_value:{},
        tags: [],
        stats: {health: 422.5e4, attack: 2500e4, agility: 680e4, attack_speed: 1.2, defense: 640e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "绿色刀币", chance:0.4},
            {item_name: "绿色刀币", chance:0.4},
            {item_name: "绿色刀币", chance:0.4},
            {item_name: "绿色刀币", chance:0.4},
            //1.6D
        ],
    });
    enemy_templates["合金弹头B1"] = new Enemy({
        name: "合金弹头B1", 
        description: "弹头怎么还有圣阵这种分段打击啊！皮也太厚实了。", 
        xp_value: 5702887, 
        rank: 2816,
        image: "image/enemy/E2816.png",
        realm: "<span class=realm_sky><b>天空级一阶 +++</b></span>",
        size: "small",
        spec: [42],
        spec_value:{},
        tags: [],
        stats: {health: 1764e4, attack: 1000e4, agility: 700e4, attack_speed: 1.2, defense: 700e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "红钢锭", chance:0.2},
            {item_name: "一捆B1·能量核心", chance:0.006},
            //1.6D
        ],
    });
    enemy_templates["深邃之暗B2"] = new Enemy({
        name: "深邃之暗B2", 
        description: "虽然基础属性十分强大，但好在不像那些一阶特化机器人一样有奇妙的感悟。", 
        xp_value: 3524578, 
        rank: 2817,
        image: "image/enemy/E2817.png",
        realm: "<span class=realm_sky><b>天空级二阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 7744e4, attack: 1296e4, agility: 720e4, attack_speed: 1.2, defense: 720e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "一捆B1·能量核心", chance:0.008},
            //1.6D
        ],
    });
    enemy_templates["无面修者"] = new Enemy({
        name: "无面修者", 
        description: "在好奇为什么天空级二阶的敌人那么少？答案是天外族群的划分太严，好多B2级的被划成B1了...", 
        xp_value: 5702887, 
        rank: 3101,
        image: "image/enemy/E3101.png",
        realm: "<span class=realm_sky><b>天空级二阶 +</b></span>",
        spec: [],
        stats: {health: 600e4, attack: 1490e4, agility: 1080e4, attack_speed: 1.2, defense: 900e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "荒兽凭证", chance:1.0},
            //2.8D
        ],
    });
    enemy_templates["大教掌灯人"] = new Enemy({
        name: "大教掌灯人", 
        description: "在兽潮中发现家里的魂灯灭了一大片的他，正在气势汹汹地准备向荒兽发起复仇！", 
        xp_value: 9227465, 
        rank: 3102,
        image: "image/enemy/E3102.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [],
        stats: {health: 880e4, attack: 1580e4, agility: 1200e4, attack_speed: 1.3, defense: 1080e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "沼泽兽油", chance:0.1},
            //5D
        ],
    });
    enemy_templates["单眼蝠幼体"] = new Enemy({
        name: "单眼蝠幼体", 
        description: "某种血脉似乎相当坚韧的蝙蝠，皮糙肉厚。但是...你的天赋是不是混进了什么不干净的东西?", 
        xp_value: 5702887, 
        rank: 3103,
        image: "image/enemy/E3103.png",
        realm: "<span class=realm_sky><b>天空级二阶 +</b></span>",
        spec: [5],
        stats: {health: 9025e4, attack: 1680e4, agility: 1200e4, attack_speed: 1.3, defense: 400e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "沼泽兽油", chance:0.04},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            //2.8D
        ],
    });
    enemy_templates["淳羽家族近卫"] = new Enemy({
        name: "淳羽家族近卫", 
        description: "明明是燕岗领第一家族，为什么要用毒药呢？*我是不会告诉你任何东西的！*", 
        xp_value: 5702887, 
        rank: 3104,
        image: "image/enemy/E3104.png",
        realm: "<span class=realm_sky><b>天空级二阶 +</b></span>",
        spec: [8],
        spec_value: {8:10},
        stats: {health: 350e4, attack: 1850e4, agility: 1320e4, attack_speed: 1.3, defense: 800e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "紫色刀币", chance:0.001},
            {item_name: "荒兽凭证", chance:1},
            //2.8D
        ],
    });
    enemy_templates["赫尔沼泽野火"] = new Enemy({
        name: "赫尔沼泽野火", 
        description: "以火为载体的野生“灵”。温度远不如核爆，却掌握着多种能力。", 
        xp_value: 5702887, 
        rank: 3105,
        image: "image/enemy/E3105.png",
        realm: "<span class=realm_sky><b>天空级二阶 +</b></span>",
        spec: [23,0],
        spec_value: {8:10},
        stats: {health: 480e4, attack: 1200e4, agility: 1320e4, attack_speed: 1.3, defense: 720e4}, 
        loot_list: [
            {item_name: "殿堂红宝石", chance:0.02},
            {item_name: "殿堂绿宝石", chance:0.05},
            {item_name: "荧光精华", chance:0.04},
            //2.8D
        ],
    });
    enemy_templates["地龙成长期"] = new Enemy({
        name: "地龙成长期", 
        description: "理论上来说天空级已经可以飞了。但它的战斗风格和体重决定了它不会长期飞行。", 
        xp_value: 9227465, 
        rank: 3106,
        image: "image/enemy/E3106.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [],
        stats: {health: 2000e4, attack: 1900e4, agility: 1440e4, attack_speed: 1.3, defense: 1225e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "沼泽·荒兽肉块", chance:0.05},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            //5D
        ],
    });
    enemy_templates["圣荒杀手傀儡"] = new Enemy({
        name: "圣荒杀手傀儡", 
        description: "从圣荒城进口的傀儡。因为太笨，它不会和其他圣荒城单位一样见钱眼开，但代价是敌友不分。", 
        xp_value: 9227465, 
        rank: 3107,
        image: "image/enemy/E3107.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [10],
        stats: {health: 1900e4, attack: 2100e4, agility: 1440e4, attack_speed: 1.3, defense: 550e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "一捆B1·能量核心", chance:0.02},
            //5D
        ],
    });
    enemy_templates["小门派供奉"] = new Enemy({
        name: "小门派供奉", 
        description: "加入了剿灭行动以应对兽潮威胁的修者。你问3连击?抬头看看攻速吧(笑", 
        xp_value: 9227465, 
        rank: 3108,
        image: "image/enemy/E3108.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [],
        stats: {health: 3250e4, attack: 1750e4, agility: 1560e4, attack_speed: 3.9, defense: 500e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "荒兽凭证", chance:2.5},
            //5D
        ],
    });
    enemy_templates["化灵蝶"] = new Enemy({
        name: "化灵蝶", 
        description: "花灵液？感觉完全是谐音的存在呢。", 
        xp_value: 9227465, 
        rank: 3109,
        image: "image/enemy/E3109.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [31],
        stats: {health: 800e4, attack: 2116e4, agility: 1620e4, attack_speed: 1.3, defense: 1100e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            {item_name: "荧光精华", chance:0.06},
            //5D
        ],
    });
    enemy_templates["沼泽石灵"] = new Enemy({
        name: "沼泽石灵", 
        description: "这个纪元是不是有个石头之神之类的纪元神明？怎么走到哪里都有这帮坚固石头怪啊。对了，好多荒兽在它上面撞死了，所以它身上有油..", 
        xp_value: 9227465, 
        rank: 3110,
        image: "image/enemy/E3110.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [1],
        stats: {health: 20, attack: 2600e4, agility: 1680e4, attack_speed: 1.3, defense: 1300e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            {item_name: "沼泽兽油", chance:0.1},
            //5D
        ],
    });
    enemy_templates["冈崎猫妖"] = new Enemy({
        name: "冈崎猫妖", 
        description: "听起来像是11区的猫妖。完全不讲武德的偷袭玩家！", 
        xp_value: 9227465, 
        rank: 3111,
        image: "image/enemy/E3111.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [2],
        stats: {health: 240e4, attack: 9000e4, agility: 1680e4, attack_speed: 1.3, defense: 1500e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            {item_name: "沼泽·荒兽肉块", chance:0.08},
            //5D
        ],
    });
    enemy_templates["沉陷死者"] = new Enemy({
        name: "沉陷死者", 
        description: "1-4探险者亡魂也有异界之门。它似乎是某种和死亡相关的领悟...", 
        xp_value: 9227465, 
        rank: 3112,
        image: "image/enemy/E3112.png",
        realm: "<span class=realm_sky><b>天空级三阶</b></span>",
        spec: [15],
        stats: {health: 2000e4, attack: 4000e4, agility: 1800e4, attack_speed: 1.3, defense: 1400e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.04},
            {item_name: "史诗黄宝石", chance:0.015},
            {item_name: "沼泽兽油", chance:0.1},
            //5D
        ],
    });
    enemy_templates["赫尔沼泽飞鼠"] = new Enemy({
        name: "赫尔沼泽飞鼠", 
        description: "老鼠飞上天的时候，它还是老鼠吗？还是说，已经可以归类到一种肉翅鸟了呢？", 
        xp_value: 14930352, 
        rank: 3113,
        image: "image/enemy/E3113.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [],
        stats: {health: 1296e4, attack: 2400e4, agility: 1860e4, attack_speed: 1.3, defense: 1250e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            {item_name: "沼泽·荒兽肉块", chance:0.12},
            {item_name: "荧光精华", chance:0.04},
            //9D
        ],
    });
    enemy_templates["赫尔沼泽蝠"] = new Enemy({
        name: "赫尔沼泽蝠", 
        description: "一想到蝙蝠从天上叼着剑劈下来的画面..就好想笑啊w", 
        xp_value: 14930352, 
        rank: 3114,
        image: "image/enemy/E3114.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [20],
        stats: {health: 400e4, attack: 2000e4, agility: 1920e4, attack_speed: 1.3, defense: 1350e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            {item_name: "荧光精华", chance:0.15},
            //9D
        ],
    });
    enemy_templates["不瞑之目"] = new Enemy({
        name: "不瞑之目", 
        description: "盯~ (若叶睦表情包.jpg)", 
        xp_value: 14930352, 
        rank: 3115,
        image: "image/enemy/E3115.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [19],
        stats: {health: 1849e4, attack: 2600e4, agility: 1980e4, attack_speed: 1.3, defense: 1200e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荧光精华", chance:0.16},
            //9D
        ],
    });
    enemy_templates["兰陵天空骑士"] = new Enemy({
        name: "兰陵天空骑士", 
        description: "天空级的骑士听起来和斗气化马差不多耶。不过，似乎这里的骑士只是一个职称~", 
        xp_value: 14930352, 
        rank: 3116,
        image: "image/enemy/E3116.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [39],
        spec_value: {39:1000e4},
        stats: {health: 1280e4, attack: 2200e4, agility: 2040e4, attack_speed: 1.3, defense: 1681e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荒兽凭证", chance:3.2},
            //9D
        ],
    });
    enemy_templates["大教外门弟子"] = new Enemy({
        name: "大教外门弟子", 
        description: "教和门派有什么关系呢？不过这样的爆攻教似乎活不久的样子。", 
        xp_value: 14930352, 
        rank: 3117,
        image: "image/enemy/E3117.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [],
        stats: {health: 300e4, attack: 6600e4, agility: 2100e4, attack_speed: 1.3, defense: 1444e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荒兽凭证", chance:4.0},
            //9D
        ],
    });
    enemy_templates["燕岗精英佣兵"] = new Enemy({
        name: "燕岗精英佣兵", 
        description: "天下武功，唯快不破。这些刀口舔血的佣兵的行事法则就是如此。只是，他们似乎也没那么快。", 
        xp_value: 14930352, 
        rank: 3118,
        image: "image/enemy/E3118.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [],
        stats: {health: 900e4, attack: 2401e4, agility: 2160e4, attack_speed: 2.7, defense: 1400e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荒兽凭证", chance:2.0},
            {item_name: "沼泽兽油", chance:0.1},
            //9D
        ],
    });
    enemy_templates["凌空级魔法师"] = new Enemy({
        name: "凌空级魔法师", 
        description: "均衡加点确实是某种意义上的版本答案。全防+魔攻虽然理论胜率更高，但无法适应变化多端的战场。", 
        xp_value: 14930352, 
        rank: 3119,
        image: "image/enemy/E3119.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [],
        stats: {health: 6400e4, attack: 1800e4, agility: 2220e4, attack_speed: 1.2, defense: 1800e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "一捆B1·能量核心", chance:0.04},
            //9D
        ],
    });
    enemy_templates["飞龙成长期"] = new Enemy({
        name: "飞龙成长期", 
        description: "同样被原能辐射影响加速成长期的龙。似乎天生就懂得如何把一份力发挥出两份的效果。", 
        xp_value: 14930352, 
        rank: 3120,
        image: "image/enemy/E3120.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [],
        stats: {health: 3844e4, attack: 3000e4, agility: 2222e4, attack_speed: 1.2, defense: 1500e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荒兽凭证", chance:1,ignore_luck:true},
            {item_name: "沼泽兽油", chance:0.08},
            {item_name: "沼泽·荒兽肉块", chance:0.08},
            //9D
        ],
    });
    //【LIFE CHANGE】
    // 10%↑
    //
    // 20%↓

    enemy_templates["有角族壮年"] = new Enemy({
        name: "有角族壮年", 
        description: "荒兽森林敌人的进化版本。狂战士的画风和领悟真的搭配吗..", 
        xp_value: 14930352, 
        rank: 3201,
        image: "image/enemy/E3201.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [9],
        stats: {health: 11200e4, attack: 3100e4, agility: 2400e4, attack_speed: 1.3, defense: 1200e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "天空兽角", chance:0.025},
            //9D
        ],
    });
    
    enemy_templates["黑森异惑之花"] = new Enemy({
        name: "黑森异惑之花", 
        description: "听起来像是XOR之花。有没有OR之花和AND之花呢？", 
        xp_value: 14930352, 
        rank: 3202,
        image: "image/enemy/E3202.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [8],
        spec_value: {8:10},
        stats: {health: 10000e4, attack: 3300e4, agility: 2520e4, attack_speed: 1.3, defense: 1750e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "荧光精华", chance:0.05},
            {item_name: "黑森叶片", chance:0.01},
            //9D
        ],
    });
    enemy_templates["黑森镔铁战士"] = new Enemy({
        name: "黑森镔铁战士", 
        description: "可惜这里缺少塔门战甲B3来一次召唤一窝。不然也是个令人头疼的对象。", 
        xp_value: 14930352, 
        rank: 3203,
        image: "image/enemy/E3203.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [],
        stats: {health: 3864e4, attack: 3750e4, agility: 2640e4, attack_speed: 1.3, defense: 2300e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "B4·能量核心", chance:0.02},
            {item_name: "黑白枝丫", chance:0.015},
            //9D
        ],
    });
    enemy_templates["黑森骸骨"] = new Enemy({
        name: "黑森骸骨", 
        description: "和之前的骸骨完全不是一个画风。99^2,2^12,7^4...学数学学疯了?。", 
        xp_value: 14930352, 
        rank: 3204,
        image: "image/enemy/E3204.png",
        realm: "<span class=realm_sky><b>天空级三阶 +</b></span>",
        spec: [32],
        stats: {health: 1960.2e4, attack: 4096e4, agility: 2662e4, attack_speed: 1.331, defense: 2401e4}, 
        loot_list: [
            {item_name: "殿堂绿宝石", chance:0.015},
            {item_name: "史诗黄宝石", chance:0.04},
            {item_name: "B4·能量核心", chance:0.03},
            //9D
        ],
    });
    enemy_templates["司雍世界骨干"] = new Enemy({
        name: "司雍世界骨干", 
        description: "其实我觉得下面那家伙更适合称为骨干。B4级对于权力来说太低了，但对于魔物来说刚刚好。", 
        xp_value: 24157817, 
        rank: 3205,
        image: "image/enemy/E3205.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [],
        stats: {health: 15000e4, attack: 5000e4, agility: 3276.8e4, attack_speed: 1.3, defense: 2500e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "史诗蓝宝石", chance:0.014},
            {item_name: "黑白枝丫", chance:0.03},
            {item_name: "黑森叶片", chance:0.015},
            //16D
        ],
    });
    enemy_templates["黑森僵尸茸茸"] = new Enemy({
        name: "黑森僵尸茸茸", 
        description: "原来茸茸这种生物也可以尸变的吗！本来以为是暴毙了就化掉的类型...", 
        xp_value: 24157817, 
        rank: 3206,
        image: "image/enemy/E3206.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [9],
        stats: {health: 11200e4, attack: 4400e4, agility: 3430e4, attack_speed: 1.3, defense: 2500e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "史诗蓝宝石", chance:0.014},
            {item_name: "荧光精华", chance:0.09},
            {item_name: "B4·能量核心", chance:0.05},
            //16D
        ],
    });
    enemy_templates["黑森猿人战士"] = new Enemy({
        name: "黑森猿人战士", 
        description: "为什么只有人类不能做成肉排吃掉呢？", 
        xp_value: 24157817, 
        rank: 3207,
        image: "image/enemy/E3207.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [],
        stats: {health: 9000e4, attack: 5400e4, agility: 3600e4, attack_speed: 1.3, defense: 3000e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "史诗蓝宝石", chance:0.014},
            {item_name: "天空兽角", chance:0.04},
            //16D
        ],
    });
    enemy_templates["怨灵探险者"] = new Enemy({
        name: "怨灵探险者", 
        description: "衣服都褪色了。在清野江漂了多少年了哇？", 
        xp_value: 24157817, 
        rank: 3208,
        image: "image/enemy/E3208.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [47],
        stats: {health: 1e4, attack: 5000e4, agility: 4000e4, attack_speed: 1.6, defense: 3200e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "史诗蓝宝石", chance:0.014},
            {item_name: "黑白枝丫", chance:0.04},
            //16D
        ],
    });
    enemy_templates["兰陵城深骑士"] = new Enemy({
        name: "兰陵城深骑士", 
        description: "别告诉我深骑士就是衣服的颜色比较深。似乎是B9级【蓝金精】镀层..真有钱啊。", 
        xp_value: 24157817, 
        rank: 3209,
        image: "image/enemy/E3209.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [39],
        spec_value:{39:0.8e8},
        stats: {health: 11000e4, attack: 4200e4, agility: 4200e4, attack_speed: 1.2, defense: 2800e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "史诗蓝宝石", chance:0.014},
            {item_name: "秘银锭", chance:0.3},
            //16D
        ],
    });
    enemy_templates["黑森蝎龙"] = new Enemy({
        name: "黑森蝎龙", 
        description: "可曾记得在秘境深层被那个爆攻蝎龙支配的恐惧？从这里开始，小怪的生命比例要翻倍了！", 
        xp_value: 24157817, 
        rank: 3210,
        image: "image/enemy/E3210.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [42],
        stats: {health: 15842e4, attack: 5400e4, agility: 4400e4, attack_speed: 1.2, defense: 2700e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "史诗蓝宝石", chance:0.014},
            {item_name: "黑白枝丫", chance:0.02},
            {item_name: "天空兽角", chance:0.03},
            //16D
        ],
    });

    enemy_templates["黑森猎兵"] = new Enemy({
        name: "黑森猎兵", 
        description: "嘿，爆攻的这不就来了~", 
        xp_value: 24157817, 
        rank: 3211,
        image: "image/enemy/E3211.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        spec: [26],
        stats: {health: 6000e4, attack: 4500e4, agility: 4400e4, attack_speed: 1.4, defense: 3400e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.035},
            {item_name: "天空兽角", chance:0.04},
            //16D
        ],
    });
    enemy_templates["石风家族队长"] = new Enemy({
        name: "石风家族队长", 
        description: "至今我们仍然不知道为什么石风家族要把天空级四阶和大地级一阶编成队伍。暴发户家族缺乏底蕴可见一斑。", 
        xp_value: 39088169, 
        rank: 3212,
        image: "image/enemy/E3212.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [],
        stats: {health: 13000e4, attack: 5600e4, agility: 4600e4, attack_speed: 1.3, defense: 3800e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.014},
            {item_name: "史诗蓝宝石", chance:0.035},
            {item_name: "紫色刀币", chance:0.03},
            //28D
        ],
    });
    enemy_templates["凶悍树妖"] = new Enemy({
        name: "凶悍树妖", 
        description: "要是在雾岛上能有这么一颗，巴巴塔恐怕永远也找不到传人了。", 
        xp_value: 39088169, 
        rank: 3213,
        image: "image/enemy/E3213.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [],
        stats: {health: 20000e4, attack: 11000e4, agility: 4800e4, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.014},
            {item_name: "史诗蓝宝石", chance:0.035},
            {item_name: "黑森叶片", chance:0.06},
            //28D
        ],
    });
    enemy_templates["人立电法茸茸"] = new Enemy({
        name: "人立电法茸茸", 
        description: "滋滋滋滋——闪光皮卡丘（划掉，降临！", 
        xp_value: 39088169, 
        rank: 3214,
        image: "image/enemy/E3214.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [0],
        stats: {health: 9600e4, attack: 2200e4, agility: 4800e4, attack_speed: 1.2, defense: 4400e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.014},
            {item_name: "史诗蓝宝石", chance:0.035},
            {item_name: "荧光精华", chance:0.2},
            {item_name: "天空兽角", chance:0.05},
            //28D
        ],
    });
    enemy_templates["嫉妒毒虫"] = new Enemy({
        name: "嫉妒毒虫", 
        description: "嫉妒使茸茸面目全非。凭什么你有飞船反应堆造的剑柄！呜啊啊啊！", 
        xp_value: 39088169, 
        rank: 3215,
        image: "image/enemy/E3215.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [20,46],
        stats: {health: 3e8, attack: 6300e4, agility: 5000e4, attack_speed: 1.5, defense: 2800e4}, 
        loot_list: [
            {item_name: "史诗黄宝石", chance:0.014},
            {item_name: "史诗蓝宝石", chance:0.035},
            {item_name: "B4·能量核心", chance:0.05},
            {item_name: "黑白枝丫", chance:0.07},
            //28D
        ],
    });


    enemy_templates["冰原之痕"] = new Enemy({
        name: "冰原之痕", 
        description: "冰元素化生的骷髅，生命力相当顽强！", 
        xp_value: 39088169, 
        rank: 3301,
        image: "image/enemy/E3301.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [],
        stats: {health: 11.552e8, attack: 7225e4, agility: 5400e4, attack_speed: 1.2, defense: 2100e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.030},
            {item_name: "史诗红宝石", chance:0.006},
            {item_name: "多孔冰晶", chance:0.04},
            //28D
        ],
    });
    enemy_templates["出芽茸茸战士"] = new Enemy({
        name: "出芽茸茸战士", 
        description: "想不到还有续集~喵可对茸茸的潜力挖掘不足1%。", 
        xp_value: 39088169, 
        rank: 3302,
        image: "image/enemy/E3302.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [4],
        stats: {health: 2.52e8, attack: 8200e4, agility: 5700e4, attack_speed: 1.4, defense: 4000e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.030},
            {item_name: "史诗红宝石", chance:0.006},
            {item_name: "冰原超流体", chance:0.03},
            //28D
        ],
    });
    enemy_templates["冰原骑士"] = new Enemy({
        name: "冰原骑士", 
        description: "你不知道吗？散华这东西只有自己血够多才能削弱到人的。", 
        xp_value: 39088169, 
        rank: 3303,
        image: "image/enemy/E3303.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [37],
        stats: {health: 4.232e8, attack: 7900e4, agility: 6000e4, attack_speed: 1.3, defense: 5200e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.030},
            {item_name: "史诗红宝石", chance:0.006},
            {item_name: "光暗枝丫", chance:0.06},
            //28D
        ],
    });
    enemy_templates["冰原近卫"] = new Enemy({
        name: "冰原近卫", 
        description: "冰凌剑倒是不管血多不多都能削到人。实在是强大的领悟...", 
        xp_value: 39088169, 
        rank: 3304,
        image: "image/enemy/E3304.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [48],
        spec_value:{48:80e4},
        stats: {health: 2.16e8, attack: 8600e4, agility: 6300e4, attack_speed: 1.3, defense: 5700e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.030},
            {item_name: "史诗红宝石", chance:0.006},
            {item_name: "B4·能量核心", chance:0.08},
            //28D
        ],
    });
    enemy_templates["天空级死士"] = new Enemy({
        name: "天空级死士", 
        description: "作为死士居然不带个自爆，都是加伤害技能...而且天剑太难了所以没学会！", 
        xp_value: 39088169, 
        rank: 3305,
        image: "image/enemy/E3305.png",
        realm: "<span class=realm_sky><b>天空级四阶 +</b></span>",
        spec: [3,7],
        stats: {health: 3.362e8, attack: 8100e4, agility: 6600e4, attack_speed: 1.3, defense: 4200e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.030},
            {item_name: "史诗红宝石", chance:0.006},
            {item_name: "B4·能量核心", chance:0.04},
            {item_name: "玄冰果实", chance:0.0005},
            //28D
        ],
    });
    enemy_templates["司雍传道士"] = new Enemy({
        name: "司雍传道士", 
        description: "长得和结界湖的血牛一模一样耶，不过居然是个爆攻人！", 
        xp_value: 63245986, 
        rank: 3306,
        image: "image/enemy/E3306.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [19],
        stats: {health: 6.48e8, attack: 10700e4, agility: 6900e4, attack_speed: 1.3, defense: 5200e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "多孔冰晶", chance:0.06},
            //50D
        ],
    });
    enemy_templates["冰原出芽茸茸"] = new Enemy({
        name: "冰原出芽茸茸", 
        description: "失踪的青色出芽茸茸终于找到了！虽然是靠着外力把自己弄成这个颜色的就是了。", 
        xp_value: 63245986, 
        rank: 3307,
        image: "image/enemy/E3307.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [49],
        spec_value: {49:{rnd:200,hp:0.3e8}},
        stats: {health: 3.6e8, attack: 13000e4, agility: 7200e4, attack_speed: 0.9, defense: 5400e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "冰原超流体", chance:0.04},
            //50D
        ],
    });
    enemy_templates["出芽红茸战士"] = new Enemy({
        name: "出芽红茸战士", 
        description: "这就是彩虹攻击！茸茸家族，出发~", 
        xp_value: 63245986, 
        rank: 3308,
        image: "image/enemy/E3308.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [],
        stats: {health: 1.92e8, attack: 1.98e8, agility: 7800e4, attack_speed: 1.2, defense: 6800e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "冰原超流体", chance:0.05},
            //50D
        ],
    });
    enemy_templates["冰原之空骸"] = new Enemy({
        name: "冰原之空骸", 
        description: "看着很强，其实一点也不弱。被它来上40连击可够喝一壶的了。", 
        xp_value: 63245986, 
        rank: 3309,
        image: "image/enemy/E3309.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [48],
        spec_value: {48:100e4},
        stats: {health: 14.45e8, attack: 9216e4, agility: 8100e4, attack_speed: 1.5, defense: 4900e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "多孔冰晶", chance:0.025},
            {item_name: "玄冰果实", chance:0.001},
            //50D
        ],
    });
    enemy_templates["掠冰之蝠"] = new Enemy({
        name: "掠冰之蝠", 
        description: "6连击...至少比那一帮开局先打出巨额伤害的好处理，对吧？", 
        xp_value: 63245986, 
        rank: 3310,
        image: "image/enemy/E3310.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [33],
        spec_value: {33:6},
        stats: {health: 5.618e8, attack: 12900e4, agility: 8400e4, attack_speed: 1.1, defense: 6500e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "光暗枝丫", chance:0.1},
            //50D
        ],
    });
    enemy_templates["霜傀儡"] = new Enemy({
        name: "霜傀儡", 
        description: "在下面铲一铲制造雪球会不会有点赚头的样子？", 
        xp_value: 63245986, 
        rank: 3311,
        image: "image/enemy/E3311.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [50],
        spec_value: {50:210e4},
        stats: {health: 3.52e8, attack: 18500e4, agility: 8800e4, attack_speed: 1.4, defense: 7500e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "B4·能量核心", chance:0.2},
            {item_name: "玄冰果实", chance:0.0008},
            //50D
        ],
    });
    enemy_templates["冰原荒兽"] = new Enemy({
        name: "冰原荒兽", 
        description: "这地方怎么到处都是这些战前扣血的领悟！好可怕，好可怕，好可怕……", 
        xp_value: 63245986, 
        rank: 3312,
        image: "image/enemy/E3312.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [49],
        spec_value: {49:{rnd:100,hp:1.0e8}},
        stats: {health: 9e8, attack: 15000e4, agility: 9200e4, attack_speed: 1.2, defense: 7500e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "多孔冰晶", chance:0.07},
            //50D
        ],
    });
    enemy_templates["射击卫戍"] = new Enemy({
        name: "射击卫戍", 
        description: "如果靠着激光可以融化这里的冰雪该有多好……", 
        xp_value: 63245986, 
        rank: 3313,
        image: "image/enemy/E3313.png",
        realm: "<span class=realm_sky><b>天空级五阶</b></span>",
        spec: [43],
        spec_value: {43:1e8},
        stats: {health: 57.6e8, attack: 14400e4, agility: 9600e4, attack_speed: 1.2, defense: 7200e4}, 
        loot_list: [
            {item_name: "史诗蓝宝石", chance:0.012},
            {item_name: "史诗红宝石", chance:0.030},
            {item_name: "冰原超流体", chance:0.06},
            //50D
        ],
    });
    enemy_templates["冰山石灵"] = new Enemy({
        name: "冰山石灵", 
        description: "难得有个属性正常一点的了。坚固比起那一帮开局嗷嗷冲上来冻住你的要和蔼可亲太多了叭……是的，这里是奖励关卡！", 
        xp_value: 102334155, 
        rank: 3314,
        image: "image/enemy/E3314.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        spec: [1],
        stats: {health: 60, attack: 12250e4, agility: 10000e4, attack_speed: 1.4, defense: 8500e4}, 
        loot_list: [
            {item_name: "史诗红宝石", chance:0.036},
            {item_name: "蓝金锭", chance:1},
            {item_name: "秘银锭", chance:0.30},
            {item_name: "旋律合金锭", chance:0.06},
            //90D
        ],
    });
    enemy_templates["冰原老人"] = new Enemy({
        name: "冰原老人", 
        description: "呼~我要在它面前呆着回血。谁也不要拦着我。", 
        xp_value: 102334155, 
        rank: 3315,
        image: "image/enemy/E3315.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        spec: [5],
        stats: {health: 15.644e8, attack: 22000e4, agility: 10400e4, attack_speed: 1.3, defense: 4400e4}, 
        loot_list: [
            {item_name: "史诗红宝石", chance:0.036},
            {item_name: "玄冰果实", chance:0.0032},
            //90D
        ],
    });
    enemy_templates["冰原骸骨骑士"] = new Enemy({
        name: "冰原骸骨骑士", 
        description: "是的，每个区域都有自己的冰凌剑~这就是我们的纯白冰原啊。", 
        xp_value: 102334155, 
        rank: 3316,
        image: "image/enemy/E3316.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        spec: [48],
        spec_value: {48:120e4},
        stats: {health: 13.6e8, attack: 17000e4, agility: 10800e4, attack_speed: 1.3, defense: 8500e4}, 
        loot_list: [
            {item_name: "史诗红宝石", chance:0.036},
            {item_name: "多孔冰晶", chance:0.13},
            //90D
        ],
    });
    
    //【LIFE CHANGE】
    // 20%↑
    //
    // 30%↓
    enemy_templates["探险者的怨恨"] = new Enemy({
        name: "探险者的怨恨", 
        description: "时封？血量太薄了……它真的可以撑到第二次攻击吗？", 
        xp_value: 102334155, 
        rank: 3401,
        image: "image/enemy/E3401.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        size: "small",
        spec: [12],
        spec_value:{},
        tags: [],
        stats: {health: 2.7e8, attack: 39690e4, agility: 1.2e8, attack_speed: 1.7, defense:0e4}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.020},
            {item_name: "史诗绿宝石", chance:0.002},
            {item_name: "B4·能量核心", chance:0.4},
            //90D
        ],
    });
    enemy_templates["出芽橙茸战士"] = new Enemy({
        name: "出芽橙茸战士", 
        description: "彩虹攻击:(2/7)!!单独出芽和单独拿着武器都没什么用，连在一起……看起来是本命灵宝！", 
        xp_value: 102334155, 
        rank: 3402,
        image: "image/enemy/E3402.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 6.6e8, attack: 1.85e8, agility: 1.3e8, attack_speed: 1.3, defense:1.25e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.020},
            {item_name: "史诗绿宝石", chance:0.002},
            {item_name: "镶晶盾牌", chance:0.02},
            {item_name: "冰原超流体", chance:0.04},
            //90D
        ],
    });
    enemy_templates["敌意猎兵"] = new Enemy({
        name: "敌意猎兵", 
        description: "和刚刚那只除了血薄了很多以外没有什么区别。之前来群殴你的六只已经是精锐了啦……", 
        xp_value: 102334155, 
        rank: 3403,
        image: "image/enemy/E3403.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 9.075e8, attack: 2.2e8, agility: 1.4e8, attack_speed: 1.3, defense:1.1e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.020},
            {item_name: "史诗绿宝石", chance:0.002},
            {item_name: "冰宫鳞片", chance:0.015},
            {item_name: "多孔冰晶", chance:0.045},
            //90D
        ],
    });
    enemy_templates["大眼霜冻鱼"] = new Enemy({
        name: "大眼霜冻鱼", 
        description: "很遗憾，因为温度太低，冰元素四溢，这里没有湖可以钓鱼……活着的鱼都爬出来了！", 
        xp_value: 102334155, 
        rank: 3404,
        image: "image/enemy/E3404.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        size: "small",
        spec: [50],
        spec_value:{50:361e4},
        tags: [],
        stats: {health: 33e8, attack: 1.84e8, agility: 1.6e8, attack_speed: 1.3, defense:1.0e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.020},
            {item_name: "史诗绿宝石", chance:0.002},
            {item_name: "冰宫鳞片", chance:0.03},
            //90D
        ],
    });
    enemy_templates["敌意女巫"] = new Enemy({
        name: "敌意女巫", 
        description: "就是它……不仅光环强还可以叠加！实在是好过分的说！", 
        xp_value: 165580141, 
        rank: 3405,
        image: "image/enemy/E3405.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [0],
        spec_value:{},
        tags: [],
        stats: {health: 33e8, attack: 1.84e8, agility: 1.8e8, attack_speed: 1.3, defense:1.0e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "光环杖芯", chance:0.023},
            //160D
        ],
    });
    enemy_templates["出芽黄茸战士"] = new Enemy({
        name: "出芽黄茸战士", 
        description: "彩虹攻击(3/7)！特殊能力如何比拟久经锻炼的……茸身？", 
        xp_value: 165580141, 
        rank: 3406,
        image: "image/enemy/E3406.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 2.1e8, attack: 3.2e8, agility: 2.0e8, attack_speed: 1.3, defense:1.6e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "镶晶盾牌", chance:0.04},
            {item_name: "冰原超流体", chance:0.06},
            //160D
        ],
    });
    enemy_templates["绝对低温能源"] = new Enemy({
        name: "绝对低温能源", 
        description: "不仅仅本身的温度接近0K，还含有致死量的冰元素。一个这货可以中和几十个【核爆能源】！", 
        xp_value: 165580141, 
        rank: 3407,
        image: "image/enemy/E3407.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [50,39],
        spec_value:{50:486e4,39:8.0e8},
        tags: [],
        stats: {health: 0.0001e8, attack: 0.0001e8, agility: 2.1e8, attack_speed: 1.3, defense:0.0001e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "冰原超流体", chance:0.1},
            {item_name: "万载冰髓锭", chance:0.01},
            //160D
        ],
    });
    enemy_templates["敌意骑士"] = new Enemy({
        name: "敌意骑士", 
        description: "很久很久以前，【燕岗城】区域就有一只长得差不多的怪……还记得第一次commit的时候，中间忘了，总之せーの！っインターネット最高！", 
        xp_value: 165580141, 
        rank: 3408,
        image: "image/enemy/E3408.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 7.5e8, attack: 2.704e8, agility: 2.2e8, attack_speed: 1.3, defense:1.6e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "镶晶盾牌", chance:0.06},
            //160D
        ],
    });
    enemy_templates["出芽绿茸战士"] = new Enemy({
        name: "出芽绿茸战士", 
        description: "彩虹攻击(4/7)！明明只比前面那只强了一点点吧……", 
        xp_value: 165580141, 
        rank: 3409,
        image: "image/enemy/E3409.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 15e8, attack: 4e8, agility: 2.2e8, attack_speed: 1.3, defense:1.8e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "镶晶盾牌", chance:0.03},
            {item_name: "光环杖芯", chance:0.02},
            //160D
        ],
    });
    enemy_templates["冰血除草者"] = new Enemy({
        name: "冰血除草者", 
        description: "热血沸腾的组合技，1080亿(划掉)480亿的斩杀线！虽然因为RPG的机制，冰封和圣阵的组合技消失了就是了啦。", 
        xp_value: 165580141, 
        rank: 3410,
        image: "image/enemy/E3410.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [5,42,49],
        spec_value:{49:{rnd:300,hp:1.6e8}},
        tags: [],
        stats: {health: 26.7e8, attack: 3.5e8, agility: 2.3e8, attack_speed: 1.0, defense:0.9e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "光环杖芯", chance:0.02},
            {item_name: "冰宫鳞片", chance:0.03},
            //160D
        ],
    });
    enemy_templates["夹击卫戍"] = new Enemy({
        name: "夹击卫戍", 
        description: "居然还是一个系列的。你那会用激光的兄弟距离这里有点远的……", 
        xp_value: 165580141, 
        rank: 3411,
        image: "image/enemy/E3411.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 18e8, attack: 2.8e8, agility: 2.4e8, attack_speed: 1.4, defense:1.5e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "冰宫鳞片", chance:0.03},
            {item_name: "B4·能量核心", chance:0.40},
            //160D
        ],
    });
    enemy_templates["敌意傀儡"] = new Enemy({
        name: "敌意傀儡", 
        description: "说起来，极寒冰宫的敌意是不是有点太大了？好多【敌意】词头的家伙！", 
        xp_value: 165580141, 
        rank: 3412,
        image: "image/enemy/E3412.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 2.6508e8, attack: 3.1e8, agility: 2.5e8, attack_speed: 1.4, defense:1.9e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "B4·能量核心", chance:0.40},
            {item_name: "镶晶盾牌", chance:0.04},
            //160D
        ],
    });
    enemy_templates["冰兽龙龙"] = new Enemy({
        name: "冰兽龙龙", 
        description: "一种体温极低，可以释放冰霜吐息的龙亚种。", 
        xp_value: 267914296, 
        rank: 3413,
        image: "image/enemy/E3413.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [50],
        spec_value:{50:616e4},
        tags: [],
        stats: {health: 19.8e8, attack: 3.7e8, agility: 2.7e8, attack_speed: 1.3, defense:2.2e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.008},
            {item_name: "史诗绿宝石", chance:0.020},
            {item_name: "冰宫鳞片", chance:0.09},
            //280D
        ],
    });
    enemy_templates["雪茸茸战士"] = new Enemy({
        name: "雪茸茸战士", 
        description: "双刀流！左剑伤害高~右剑高伤害！", 
        xp_value: 165580141, 
        rank: 3414,
        image: "image/enemy/E3414.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 12e8, attack: 4e8, agility: 2.8e8, attack_speed: 3.0, defense:0.0e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "镶晶盾牌", chance:0.03},
            {item_name: "多孔冰晶", chance:0.09},
            //160D
        ],
    });
    enemy_templates["大教内门弟子"] = new Enemy({
        name: "大教内门弟子", 
        description: "远道之后，是足以匹敌混沌10转……不好意思串台了，这个大教明显比炒鸡蛋的大教小好多的说……", 
        xp_value: 165580141, 
        rank: 3415,
        image: "image/enemy/E3415.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 14.4e8, attack: 2.8e8, agility: 2.6e8, attack_speed: 1.3, defense:2.1e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.016},
            {item_name: "史诗绿宝石", chance:0.008},
            {item_name: "光环杖芯", chance:0.05},
            //160D
        ],
    });
    enemy_templates["敌意美杜莎"] = new Enemy({
        name: "敌意美杜莎", 
        description: "大地境修者只要被瞪一下就会变成石头。但是对于天空级中期以上战力，这样的技巧只会有微弱的效益。", 
        xp_value: 267914296, 
        rank: 3416,
        image: "image/enemy/E3416.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [0,8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 14.7e8, attack: 1.0e8, agility: 2.4e8, attack_speed: 1.3, defense:2.0e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.008},
            {item_name: "史诗绿宝石", chance:0.020},
            {item_name: "冰宫鳞片", chance:0.10},
            //280D
        ],
    });
    enemy_templates["敌意巫师"] = new Enemy({
        name: "敌意巫师", 
        description: "叠甲，过！这个巫师明明超强却过分谨慎——虽然没用就是了啦。", 
        xp_value: 267914296, 
        rank: 3417,
        image: "image/enemy/E3417.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 27e8, attack: 3.3e8, agility: 2.7e8, attack_speed: 1.3, defense:2.3e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.008},
            {item_name: "史诗绿宝石", chance:0.020},
            {item_name: "光环杖芯", chance:0.08},
            //280D
        ],
    });
    enemy_templates["出芽青茸战士"] = new Enemy({
        name: "出芽青茸战士", 
        description: "比起双刀流选手，这位更加贴近所谓的防杀策略。2.8亿防御足以让它傲视群雄……除了那些冰封和冻伤的机制怪！", 
        xp_value: 267914296, 
        rank: 3418,
        image: "image/enemy/E3418.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 7.5e8, attack: 4.2e8, agility: 3.2e8, attack_speed: 1.3, defense:2.8e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.008},
            {item_name: "史诗绿宝石", chance:0.020},
            {item_name: "冰原超流体", chance:0.12},
            {item_name: "镶晶盾牌", chance:0.08},
            //280D
        ],
    });enemy_templates["自爆步兵"] = new Enemy({
        name: "自爆步兵", 
        description: "全体都有~板载！这次可是携带了超强的绝对零度·疾冻弹药！", 
        xp_value: 267914296, 
        rank: 3419,
        image: "image/enemy/E3419.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [36],
        spec_value:{},
        tags: [],
        stats: {health: 21.675e8, attack: 3.8e8, agility: 3.6e8, attack_speed: 1.3, defense:3.2e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.008},
            {item_name: "史诗绿宝石", chance:0.020},
            {item_name: "玄冰果实", chance:0.01},
            {item_name: "玄冰果实·觉醒", chance:0.001},
            //280D
        ],
    });
    enemy_templates["敌意老人"] = new Enemy({
        name: "敌意老人", 
        description: "【广告位招租】：这里急缺一个乳牵制笑话~", 
        xp_value: 267914296, 
        rank: 3420,
        image: "image/enemy/E3420.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [5],
        spec_value:{},
        tags: [],
        stats: {health: 32.67e8, attack: 4.5e8, agility: 3.9e8, attack_speed: 1.4, defense:3.0e8}, //血量30%
        loot_list: [
            {item_name: "史诗红宝石", chance:0.008},
            {item_name: "史诗绿宝石", chance:0.020},
            {item_name: "B4·能量核心", chance:0.5},
            {item_name: "多孔冰晶", chance:0.15},
            //280D
        ],
    });

    
    //【LIFE CHANGE】
    // 30%↑
    //
    // 40%↓

    enemy_templates["大门派先锋"] = new Enemy({
        name: "大门派先锋", 
        description: "如果把先锋全部丢进这种低光速黑洞一样的地方，这个门派估计离死不远了……", 
        xp_value: 267914296, 
        rank: 3501,
        image: "image/enemy/E3501.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [34],
        spec_value:{},
        tags: [],
        stats: {health: 17.6e8, attack: 4.8e8, agility: 4.4e8, attack_speed: 1.3, defense:3.2e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "水素晶体", chance:0.025},
            //280D
        ],
    });
    enemy_templates["水牢雪怪"] = new Enemy({
        name: "水牢雪怪", 
        description: "真的不会融化吗……或许它的体内自带一个极寒引擎的循环？", 
        xp_value: 267914296, 
        rank: 3502,
        image: "image/enemy/E3502.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 51.2e8, attack: 5.2e8, agility: 4.5e8, attack_speed: 1.3, defense:3.0e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "多孔冰晶", chance:0.36},
            //280D
        ],
    });
    enemy_templates["水牢花妖"] = new Enemy({
        name: "水牢花妖", 
        description: "幸好是超凡的世界，即使没有氧气，根部也不会烂掉的！", 
        xp_value: 267914296, 
        rank: 3503,
        image: "image/enemy/E3503.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 51.2e8, attack: 5.2e8, agility: 4.6e8, attack_speed: 1.3, defense:3.0e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "虹彩凝胶", chance:0.025},
            //280D
        ],
    });
    enemy_templates["成熟期蛟龙"] = new Enemy({
        name: "成熟期蛟龙", 
        description: "既不是地龙也不是飞龙，因为血脉不纯的原因，就到此为止了呢……", 
        xp_value: 267914296, 
        rank: 3504,
        image: "image/enemy/E3504.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 30e8, attack: 5.5e8, agility: 4.8e8, attack_speed: 1.1, defense:3.5e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "冰宫鳞片", chance:0.09},
            //280D
        ],
    });
    enemy_templates["出芽蓝茸战士"] = new Enemy({
        name: "出芽蓝茸战士", 
        description: "彩虹攻击(6/7).怎么突然多了这么多能力啊！", 
        xp_value: 267914296, 
        rank: 3505,
        image: "image/enemy/E3505.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [4],
        spec_value:{},
        tags: [],
        stats: {health: 58e8, attack: 5.3e8, agility: 5.0e8, attack_speed: 2.9, defense:2.6e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "虹彩凝胶", chance:0.03},
            //280D
        ],
    });
    enemy_templates["燕岗迷途强者"] = new Enemy({
        name: "燕岗迷途强者", 
        description: "迷い星のうた——不过就算一起迷路也迷太远了吧。这是钓到冰柱鱼王了吗……", 
        xp_value: 267914296, 
        rank: 3506,
        image: "image/enemy/E3506.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [5],
        spec_value:{},
        tags: [],
        stats: {health: 28.9e8, attack: 6.225e8, agility: 5.2e8, attack_speed: 1.3, defense:3.125e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "紫色刀币", chance:0.3},
            //280D
        ],
    });
    enemy_templates["水牢嗜血哥布林"] = new Enemy({
        name: "水牢嗜血哥布林", 
        description: "七个字的标题耶。简直是除了百方[荒兽森林 ver.][BOSS]以外名字最长的家伙了。<br>(PS:半角算半个，所以舰船中枢B6[BOSS]也是七个字~", 
        xp_value: 267914296, 
        rank: 3507,
        image: "image/enemy/E3507.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [49],
        spec_value:{49:{rnd:200,hp:3e8}},
        tags: [],
        stats: {health: 60e8, attack: 5.1e8, agility: 5.0e8, attack_speed: 1.3, defense:2.55e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.025},
            {item_name: "光环杖芯", chance:0.11},
            //280D
        ],
    });
    enemy_templates["识灵水藻"] = new Enemy({
        name: "识灵水藻", 
        description: "似乎是相当没有存在感的灵体。高伤成群的情况下灵体也没什么特别的不是吗？", 
        xp_value: 433494437, 
        rank: 3508,
        image: "image/enemy/E3508.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [27,21],
        spec_value:{21:6.0e8},
        tags: [],
        stats: {health: 132e8, attack: 5.8e8, agility: 5.2e8, attack_speed: 1.3, defense:3.4e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.012},
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "B7·能量核心", chance:0.045},
            //500D
        ],
    });
    enemy_templates["徘徊的紫乌"] = new Enemy({
        name: "徘徊的紫乌", 
        description: "出芽紫茸？不要以为带了个帽子就没人认识你了啦。", 
        xp_value: 433494437, 
        rank: 3509,
        image: "image/enemy/E3509.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [19],
        tags: [],
        stats: {health: 62.28e8, attack: 5.2e8, agility: 5.2e8, attack_speed: 1.4, defense:4.1e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.012},
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "水素晶体", chance:0.02},
            {item_name: "虹彩凝胶", chance:0.02},
            //500D
        ],
    });
    enemy_templates["夜巡傀儡"] = new Enemy({
        name: "夜巡傀儡", 
        description: "话说，水牢应该不分昼夜吧……如果可以看到天的话，没理由关的住人哇。", 
        xp_value: 433494437, 
        rank: 3510,
        image: "image/enemy/E3510.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [18],
        spec_value:{18:100e12},
        tags: [],
        stats: {health: 64e8, attack: 6.2e8, agility: 5.4e8, attack_speed: 1.3, defense:4.2e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.012},
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "宇宙币", chance:0.0005},
            //500D
        ],
    });
    enemy_templates["水猫茸茸"] = new Enemy({
        name: "水猫茸茸", 
        description: "一种上限较高但较为温和的光环茸茸。或许是水溶茸茸长大后的样子呢？", 
        xp_value: 433494437, 
        rank: 3511,
        image: "image/enemy/E3511.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [11],
        tags: [],
        stats: {health: 84.64e8, attack: 5.75e8, agility: 5.6e8, attack_speed: 1.3, defense:4.5e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.012},
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "B7·能量核心", chance:0.08},
            //500D
        ],
    });
    enemy_templates["徘徊的骸骨"] = new Enemy({
        name: "徘徊的骸骨", 
        description: "你也迷路了？看来冰柱鱼王肯定不止一条~不对，骷髅会钓鱼吗？", 
        xp_value: 433494437, 
        rank: 3512,
        image: "image/enemy/E3512.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 160e8, attack: 6.3e8, agility: 6.0e8, attack_speed: 1.3, defense:3.7e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.012},
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "水素晶体", chance:0.05},
            //500D
        ],
    });
    enemy_templates["水牢骨角茸茸"] = new Enemy({
        name: "水牢骨角茸茸", 
        description: "好多各种各样的茸茸~并不奇怪，毕竟最容易构建的就是环形回路，产生的生命也就是茸茸了。", 
        xp_value: 433494437, 
        rank: 3513,
        image: "image/enemy/E3513.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 140e8, attack: 6.4e8, agility: 6.4e8, attack_speed: 1.3, defense:4.9e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.012},
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "冰原超流体", chance:0.2},
            {item_name: "虹彩凝胶", chance:0.03},
            //500D
        ],
    });
    enemy_templates["水牢石灵"] = new Enemy({
        name: "水牢石灵", 
        description: "如果以后有高血量坚固怪会是个问题么？现在的倍率已经是40%了……", 
        xp_value: 433494437, 
        rank: 3514,
        image: "image/enemy/E3514.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 39.6, attack: 10.0e8, agility: 6.8e8, attack_speed: 1.3, defense:8.0e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.006},
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "万载冰髓锭", chance:0.25},
            //500D
        ],
    });
    enemy_templates["仙旅城强战士"] = new Enemy({
        name: "仙旅城强战士", 
        description: "声律城倒下了，迎接我们的是……仙旅城？什么时候加入酰氯城w", 
        xp_value: 433494437, 
        rank: 3515,
        image: "image/enemy/E3515.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 153.76e8, attack: 9.0e8, agility: 7.0e8, attack_speed: 1.3, defense:4.5e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.006},
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "光环杖芯", chance:0.15},
            //500D
        ],
    });
    enemy_templates["城主府队长"] = new Enemy({
        name: "城主府队长", 
        description: "虽然城主府标配着白色制服和骷髅头套，但在水牢呆了数百年，这套制服已经被水元素浸染成蓝色的样子了。", 
        xp_value: 433494437, 
        rank: 3516,
        image: "image/enemy/E3516.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [7],
        tags: [],
        stats: {health: 179.56e8, attack: 9.9e8, agility: 7.2e8, attack_speed: 1.3, defense:4.4e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.006},
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "水素晶体", chance:0.06},
            //500D
        ],
    });
    enemy_templates["火箭卫戍"] = new Enemy({
        name: "火箭卫戍", 
        description: "在这个所有东西都是蓝的地方还能保持自己的红衣，已经是实力的证明了。", 
        xp_value: 433494437, 
        rank: 3517,
        image: "image/enemy/E3517.png",
        realm: "<span class=realm_sky><b>天空级七阶</b></span>",
        size: "small",
        spec: [35],
        spec_value: {35:10e8},
        tags: [],
        stats: {health: 144e8, attack: 12.9e8, agility: 7.6e8, attack_speed: 1.3, defense:6.9e8}, //血量40%
        loot_list: [
            {item_name: "史诗绿宝石", chance:0.006},
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "B7·能量核心", chance:0.09},
            //500D
        ],
    });
    enemy_templates["小门派长老"] = new Enemy({
        name: "小门派长老", 
        description: "长老走了这么久，门派还好吗……空有境界没有实力，宛如一颗肥美的经验球。", 
        xp_value: 701408733, 
        rank: 3518,
        image: "image/enemy/E3518.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 144e8, attack: 7.5e8, agility: 7.2e8, attack_speed: 1.3, defense:5.5e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "冰原超流体", chance:0.2},
            {item_name: "多孔冰晶", chance:0.2},
            //900D
        ],
    });
    enemy_templates["水牢幽暗人形"] = new Enemy({
        name: "水牢幽暗人形", 
        description: "在这里可能看不出来，但是它真的和环境融为一体了。喵可可看不到巨大的伤害数字……", 
        xp_value: 701408733, 
        rank: 3519,
        image: "image/enemy/E3519.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 30e8, attack: 5.25e8, agility: 7.2e8, attack_speed: 1.3, defense:5.25e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "水素晶体", chance:0.10},
            //900D
        ],
    });
    enemy_templates["出芽紫茸战士"] = new Enemy({
        name: "出芽紫茸战士", 
        description: "彩虹攻击(7/7).你是不是有点掉队了的说？", 
        xp_value: 701408733, 
        rank: 3520,
        image: "image/enemy/E3520.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [16],
        tags: [],
        stats: {health: 39e8, attack: 9.9e8, agility: 7.6e8, attack_speed: 1.3, defense:6.3e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "虹彩凝胶", chance:0.08},
            //900D
        ],
    });
    enemy_templates["星月幻术师"] = new Enemy({
        name: "星月幻术师", 
        description: "实力强劲的法师，兼具buff/回血/攻击三种形态。", 
        xp_value: 701408733, 
        rank: 3521,
        image: "image/enemy/E3521.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [0,11,31],
        tags: [],
        stats: {health: 39e8, attack: 11.5e8, agility: 8.0e8, attack_speed: 1.3, defense:7.2e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "虹彩凝胶", chance:0.04},
            {item_name: "光环杖芯", chance:0.15},
            //900D
        ],
    });
    enemy_templates["绿皮怪物"] = new Enemy({
        name: "绿皮怪物", 
        description: "喂喂，这个有点敷衍了……狂战士没有人权吗？", 
        xp_value: 701408733, 
        rank: 3522,
        image: "image/enemy/E3522.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 127.2e8, attack: 13.2e8, agility: 8.4e8, attack_speed: 1.3, defense:5.5e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "B7·能量核心", chance:0.12},
            //900D
        ],
    });
    enemy_templates["魔化枭蝎"] = new Enemy({
        name: "魔化枭蝎", 
        description: "这种魔力有点强的样子啊。属性超级强化，而技能全数保留。", 
        xp_value: 701408733, 
        rank: 3523,
        image: "image/enemy/E3523.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [22,16],
        tags: [],
        stats: {health: 120e8, attack: 13.3e8, agility: 9.2e8, attack_speed: 1.3, defense:8.0e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "虹彩凝胶", chance:0.10},
            //900D
        ],
    });
    enemy_templates["古龙幼崽"] = new Enemy({
        name: "古龙幼崽", 
        description: "喵可龙族排行榜:蛟龙<<地龙<飞龙<<古龙。", 
        xp_value: 701408733, 
        rank: 3524,
        image: "image/enemy/E3524.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 57.6e8, attack: 9.9e8, agility: 8.8e8, attack_speed: 1.3, defense:7.1e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "水素晶体", chance:0.12},
            //900D
        ],
    });
    enemy_templates["血杀殿余孽"] = new Enemy({
        name: "血杀殿余孽", 
        description: "这个组织还挺强的……不过血杀殿秘法和水牢规则倒也是一对好搭配。", 
        xp_value: 701408733, 
        rank: 3525,
        image: "image/enemy/E3525.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [19],
        tags: [],
        stats: {health: 124e8, attack: 12.1e8, agility: 9.6e8, attack_speed: 1.3, defense:4.0e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.015},
            {item_name: "传说蓝宝石", chance:0.006},
            {item_name: "宇宙币", chance:0.001},
            //900D
        ],
    });
    enemy_templates["城主府骨干"] = new Enemy({
        name: "城主府骨干", 
        description: "字面意义上的骨干。也不知道城主府的员工是不是签了群星那永身雇佣制合同之类的，都这样了还归属于城主府。", 
        xp_value: 1134903170, 
        rank: 3526,
        image: "image/enemy/E3526.png",
        realm: "<span class=realm_sky><b>天空级七阶 ++</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 133.2e8, attack: 14.6e8, agility: 10.5e8, attack_speed: 1.3, defense:9.6e8}, //血量40%
        loot_list: [
            {item_name: "传说黄宝石", chance:0.006},
            {item_name: "传说蓝宝石", chance:0.015},
            {item_name: "冰原超流体", chance:0.3},
            {item_name: "光环杖芯", chance:0.15},
            //900D
        ],
    });
    enemy_templates["奇异菇菇"] = new Enemy({
        name: "奇异菇菇", 
        description: "已经进入了幻境，但战斗还要继续！说起来，外面的装备居然可以带进来耶。", 
        xp_value: 701408733, 
        rank: 3601,
        image: "image/enemy/E3601.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 150e8, attack: 15.4e8, agility: 12.0e8, attack_speed: 1.3, defense:8.9e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传承水晶·绿", chance:0.015},
            //900D
        ],
    });
    enemy_templates["幻境掌灯人"] = new Enemy({
        name: "幻境掌灯人", 
        description: "喂喂，版本更新了！这里到处都是光，要你有什么用哇。", 
        xp_value: 701408733, 
        rank: 3602,
        image: "image/enemy/E3602.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 72e8, attack: 16.1e8, agility: 13e8, attack_speed: 1.3, defense:13.5e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传承水晶·蓝", chance:0.012},
            //900D
        ],
    });
    enemy_templates["蓝皮怪物"] = new Enemy({
        name: "蓝皮怪物", 
        description: "和绿皮怪物一桌!这一只和那个东西一样敷衍啊。", 
        xp_value: 701408733, 
        rank: 3603,
        image: "image/enemy/E3603.png",
        realm: "<span class=realm_sky><b>天空级七阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 90e8, attack: 17.2e8, agility: 14.0e8, attack_speed: 1.3, defense:10.5e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传承水晶·橙", chance:0.022},
            //900D
        ],
    });
    enemy_templates["幻境通识者"] = new Enemy({
        name: "幻境通识者", 
        description: "胸口蝴蝶结，但看起来心事重重的样子。衣服不会是他抢来的吧……", 
        xp_value: 1134903170, 
        rank: 3604,
        image: "image/enemy/E3604.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [18],
        spec_value:{18:400e12},
        tags: [],
        stats: {health: 440e8, attack: 17.7e8, agility: 16.0e8, attack_speed: 1.3, defense:12.5e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·白", chance:0.027},
            //1.6B
        ],
    });
    enemy_templates["火烈茸茸"] = new Enemy({
        name: "火烈茸茸", 
        description: "居然在高温下还可以下毒。只要防杀喵可就好了吧~(不过你能看到这个就说明它失败了！)", 
        xp_value: 1134903170, 
        rank: 3605,
        image: "image/enemy/E3605.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [8],
        spec_value:{8:10},
        tags: [],
        stats: {health: 16e8, attack: 35e8, agility: 17.0e8, attack_speed: 1.3, defense:17.5e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·橙", chance:0.04},
            //1.6B
        ],
    });
    enemy_templates["幻境翠绿行者"] = new Enemy({
        name: "幻境翠绿行者", 
        description: "蓝帽行者总是被模仿，但400%血量下它也从未被超越。", 
        xp_value: 1134903170, 
        rank: 3606,
        image: "image/enemy/E3606.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [3],
        tags: [],
        stats: {health: 16e8, attack: 22.5e8, agility: 18.0e8, attack_speed: 1.3, defense:14.0e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·绿", chance:0.026},
            //1.6B
        ],
    });
    enemy_templates["风尘的窃贼"] = new Enemy({
        name: "风尘的窃贼", 
        description: "追光……？既然可以破防火烈茸茸，你大概也接近20亿攻防了吧。", 
        xp_value: 1134903170, 
        rank: 3607,
        image: "image/enemy/E3607.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [40],
        tags: [],
        stats: {health: 288e8, attack: 20e8, agility: 19.0e8, attack_speed: 1.3, defense:14.8e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·白", chance:0.033},
            //1.6B
        ],
    });
    enemy_templates["深邃级魔法师"] = new Enemy({
        name: "深邃级魔法师", 
        description: "丢掉了本职工作——魔攻。是法师失格！绝对算的吧！这就是deep♂dark♂fantasy的代价啊。", 
        xp_value: 1134903170, 
        rank: 3608,
        image: "image/enemy/E3608.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [20,49],
        spec_value:{49:{rnd:200,hp:8e8}},
        tags: [],
        stats: {health: 288e8, attack: 22e8, agility: 20e8, attack_speed: 1.3, defense:11.0e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·粉", chance:0.013},
            //1.6B
        ],
    });
    enemy_templates["荒野守尸人"] = new Enemy({
        name: "荒野守尸人", 
        description: "骷髅守尸是准备组个mc小队吗？这样，带上苦力怕蜘蛛和末影人，组个乐队……", 
        xp_value: 1134903170, 
        rank: 3609,
        image: "image/enemy/E3609.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 360e8, attack: 25.6e8, agility: 21.0e8, attack_speed: 1.3, defense:16.0e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·白", chance:0.037},
            //1.6B
        ],
    });
    enemy_templates["幻境火蝶"] = new Enemy({
        name: "幻境火蝶", 
        description: "你已经救出了公主！你可以选择就此封盘，认为你已经“通关”了，又或者你还愿意继续……串台了。公主不是红色翅膀……", 
        xp_value: 1134903170, 
        rank: 3610,
        image: "image/enemy/E3610.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 109.6e8, attack: 27e8, agility: 22.0e8, attack_speed: 1.3, defense:16.0e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·橙", chance:0.045},
            //1.6B
        ],
    });
    enemy_templates["出芽粉茸战士"] = new Enemy({
        name: "出芽粉茸战士", 
        description: "彩虹攻击(8/7)。是不是最开始搞错了啦……", 
        xp_value: 1134903170, 
        rank: 3611,
        image: "image/enemy/E3611.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [23],
        tags: [],
        stats: {health: 81e8, attack: 24.01e8, agility: 23.0e8, attack_speed: 1.3, defense:18.0e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·粉", chance:0.015},
            //1.6B
        ],
    });
    enemy_templates["凶恶的金乌"] = new Enemy({
        name: "凶恶的金乌", 
        description: "我，纱雪，在此发誓！我绝不会和上次一样把乌打成马了！", 
        xp_value: 1836311903, 
        rank: 3612,
        image: "image/enemy/E3612.png",
        realm: "<span class=realm_sky><b>天空级八阶 +</b></span>",
        size: "small",
        spec: [19],
        tags: [],
        stats: {health: 270.4e8, attack: 24e8, agility: 24.0e8, attack_speed: 1.3, defense:20.8e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.004},
            {item_name: "传说红宝石", chance:0.010},
            {item_name: "传承水晶·蓝", chance:0.02},
            {item_name: "传承水晶·绿", chance:0.02},
            //2.8B
        ],
    });
    enemy_templates["幻境血魔"] = new Enemy({
        name: "幻境血魔", 
        description: "血魔海一滴血液分化而成的生命。只有普通七阶后期的战力，但生命力雄厚。", 
        xp_value: 1836311903, 
        rank: 3613,
        image: "image/enemy/E3613.png",
        realm: "<span class=realm_sky><b>天空级八阶 +</b></span>",
        size: "small",
        spec: [37],
        tags: [],
        stats: {health: 440e8, attack: 18.8e8, agility: 25.0e8, attack_speed: 1.3, defense:13.5e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.004},
            {item_name: "传说红宝石", chance:0.010},
            {item_name: "传承水晶·橙", chance:0.07},
            //2.8B
        ],
    });
    enemy_templates["窥秘商人"] = new Enemy({
        name: "窥秘商人", 
        description: "看起来就很狡猾。影魇族人转生来了？", 
        xp_value: 1836311903, 
        rank: 3614,
        image: "image/enemy/E3614.png",
        realm: "<span class=realm_sky><b>天空级八阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 704e8, attack: 30e8, agility: 26.0e8, attack_speed: 1.3, defense:20e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.004},
            {item_name: "传说红宝石", chance:0.010},
            {item_name: "传承水晶·粉", chance:0.01},
            {item_name: "传承水晶·白", chance:0.03},
            //2.8B
        ],
    });
    enemy_templates["燕岗领独行侠"] = new Enemy({
        name: "燕岗领独行侠", 
        description: "走投无路的迷途强者，误入水牢，从厮杀中悟出领域三重……多棒的故事啊。可惜这个结界可不是那种真正的传承之地哦。", 
        xp_value: 1836311903, 
        rank: 3615,
        image: "image/enemy/E3615.png",
        realm: "<span class=realm_sky><b>天空级八阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 140e8, attack: 35e8, agility: 27.0e8, attack_speed: 1.3, defense:0e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.004},
            {item_name: "传说红宝石", chance:0.010},
            {item_name: "传承水晶·绿", chance:0.035},
            //2.8B
        ],
    });
    enemy_templates["幻境飞蛾"] = new Enemy({
        name: "幻境飞蛾", 
        description: "在这里是不是搞错了什么哇。上下都是八阶巅峰，而你只是八阶初期……", 
        xp_value: 1134903170, 
        rank: 3616,
        image: "image/enemy/E3616.png",
        realm: "<span class=realm_sky><b>天空级八阶</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 320e8, attack: 21e8, agility: 17.0e8, attack_speed: 1.3, defense:12e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.010},
            {item_name: "传说红宝石", chance:0.004},
            {item_name: "传承水晶·蓝", chance:0.022},
            //1.6B
        ],
    });
    enemy_templates["幻境石灵"] = new Enemy({
        name: "幻境石灵", 
        description: "如果生命倍率一直这样提高，这些石头怪迟早会变成问题的?内甲的A.mul会保护大家的！", 
        xp_value: 1836311903, 
        rank: 3617,
        image: "image/enemy/E3617.png",
        realm: "<span class=realm_sky><b>天空级八阶 +</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 96, attack: 28.8e8, agility: 28.0e8, attack_speed: 1.3, defense:24e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.004},
            {item_name: "传说红宝石", chance:0.010},
            {item_name: "传承水晶·蓝", chance:0.044},
            //2.8B
        ],
    });
    enemy_templates["磐石蜘蛛"] = new Enemy({
        name: "磐石蜘蛛", 
        description: "蜘蛛类绝对是最强的荒兽。每回合高百分比而且无上限的回血呢。", 
        xp_value: 1836311903, 
        rank: 3618,
        image: "image/enemy/E3618.png",
        realm: "<span class=realm_sky><b>天空级八阶 +</b></span>",
        size: "small",
        spec: [31],
        tags: [],
        stats: {health: 409.6e8, attack: 33e8, agility: 29.0e8, attack_speed: 1.3, defense:22e8}, //血量40%
        loot_list: [
            {item_name: "传说蓝宝石", chance:0.004},
            {item_name: "传说红宝石", chance:0.010},
            {item_name: "传承水晶·白", chance:0.08},
            //2.8B
        ],
    });

    
    //【LIFE CHANGE】
    // 40%↑
    //
    // 50%↓

    enemy_templates["心魔"] = new Enemy({
        name: "心魔", 
        description: "和那只BOSS级的有相同的弱点。可以干死四只就可以干死它！", 
        xp_value: 2971215073, 
        rank: 3701,
        image: "image/enemy/E3701.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [52,33,53],
        spec_value:{33:13},
        tags: [],
        stats: {health: 2222e8, attack: 56.78e8, agility: 30e8, attack_speed: 1.0, defense:0e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "天空级魂魄", chance:0.023},
            //5B
        ],
    });
    enemy_templates["燕岗辉煌佣兵"] = new Enemy({
        name: "燕岗辉煌佣兵", 
        description: "我乃蓝玉职业者巅峰！何人能杀我，何人敢杀我？", 
        xp_value: 2971215073, 
        rank: 3702,
        image: "image/enemy/E3702.png",
        realm: "<span class=realm_sky><b>天空级八阶 ++</b></span>",
        size: "small",
        spec: [6],
        tags: [],
        stats: {health: 440e8, attack: 36e8, agility: 32e8, attack_speed: 1.5, defense:22e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "传承水晶·白", chance:0.05},
            {item_name: "传承水晶·橙", chance:0.062},
            //5B
        ],
    });
    enemy_templates["地宫虫将"] = new Enemy({
        name: "地宫虫将", 
        description: "从卒到将的属性加了五个数量级……【地宫虫劫】是不是达到不朽神灵级了？", 
        xp_value: 2971215073, 
        rank: 3703,
        image: "image/enemy/E3703.png",
        realm: "<span class=realm_sky><b>天空级八阶 ++</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1100e8, attack: 38e8, agility: 34e8, attack_speed: 1.4, defense:20e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "传承水晶·粉", chance:0.02},
            {item_name: "天空级魂魄", chance:0.012},
            //5B
        ],
    });
    enemy_templates["地宫不眠者"] = new Enemy({
        name: "地宫不眠者", 
        description: "原来熬夜不睡觉可以进入别人的心魔幻境！奇怪的知识又增加了。", 
        xp_value: 2971215073, 
        rank: 3704,
        image: "image/enemy/E3704.png",
        realm: "<span class=realm_sky><b>天空级八阶 ++</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 250e8, attack: 55e8, agility: 36e8, attack_speed: 1.4, defense:27.5e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "天空级魂魄", chance:0.025},
            //5B
        ],
    });
    enemy_templates["地下焚天火"] = new Enemy({
        name: "地下焚天火", 
        description: "打人非常痛！不过生命如风中残烛……台风中篝火？总之很容易灭就是了。", 
        xp_value: 2971215073, 
        rank: 3705,
        image: "image/enemy/E3705.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 75e8, attack: 90e8, agility: 38e8, attack_speed: 1.4, defense:35e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "天空级魂魄", chance:0.026},
            //5B
        ],
    });
    
    enemy_templates["燕岗城卫队长"] = new Enemy({
        name: "燕岗城卫队长", 
        description: "之前就是你小子把坚固队员派到光环怪旁边的？", 
        xp_value: 2971215073, 
        rank: 3706,
        image: "image/enemy/E3706.png",
        realm: "<span class=realm_sky><b>天空级八阶 ++</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 160, attack: 44.44e8, agility: 40e8, attack_speed: 1.4, defense:0e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "传承水晶·粉", chance:0.02},
            {item_name: "天空级魂魄", chance:0.012},
            //5B
        ],
    });

    enemy_templates["秘境荧光帕芙"] = new Enemy({
        name: "秘境荧光帕芙", 
        description: "最近，好多人都在抓的闪光品种，是这个吗？", 
        xp_value: 2971215073, 
        rank: 3707,
        image: "image/enemy/E3707.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 320e8, attack: 32e8, agility: 42e8, attack_speed: 1.4, defense:32e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "传承水晶·白", chance:0.06},
            {item_name: "传承水晶·橙", chance:0.06},
            //5B
        ],
    });
    enemy_templates["秘境闪耀精灵"] = new Enemy({
        name: "秘境闪耀精灵", 
        description: "更亮了！惑幻……说起来，明明是幻境，它居然是第一只有这种属性的敌人吗？", 
        xp_value: 2971215073, 
        rank: 3708,
        image: "image/enemy/E3708.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [13,27],
        tags: [],
        stats: {health: 344.45e8, attack: 49e8, agility: 44e8, attack_speed: 1.4, defense:33e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "传承水晶·粉", chance:0.05},
            //5B
        ],
    });
    enemy_templates["喵咕啦"] = new Enemy({
        name: "喵咕啦", 
        description: "这种生物是怎么拟态成姐姐的样子的……衣服可以模拟，那皮肤呢？", 
        xp_value: 2971215073, 
        rank: 3709,
        image: "image/enemy/E3709.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [21],
        spec_value:{21:60e8},
        tags: [],
        stats: {health: 555.5e8, attack: 1e4, agility: 46e8, attack_speed: 1.4, defense:37.5e8}, //血量50%(x)
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "紫晶碎片", chance:0.018},
            //5B
        ],
    });
    enemy_templates["残雪灵阵"] = new Enemy({
        name: "残雪灵阵", 
        description: "相传，在一个魔女之力满地飞的时间线，许多残雪灵阵被释放进了地宫。好在这里没有那种事情。", 
        xp_value: 2971215073, 
        rank: 3710,
        image: "image/enemy/E3710.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [11],
        tags: [],
        stats: {health: 1e4, attack: 1e4, agility: 48e8, attack_speed: 1.4, defense:42e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "紫晶碎片", chance:0.020},
            //5B
        ],
    });
    enemy_templates["晓雪魅蝠"] = new Enemy({
        name: "晓雪魅蝠", 
        description: "名字前面加一个晓的确听起来厉害多了！越打血越多的可恶蝙蝠……", 
        xp_value: 2971215073, 
        rank: 3711,
        image: "image/enemy/E3711.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [31],
        tags: [],
        stats: {health: 451.25e8, attack: 52e8, agility: 50e8, attack_speed: 1.4, defense:36e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.008},
            {item_name: "传说绿宝石", chance:0.003},
            {item_name: "紫晶碎片", chance:0.022},
            //5B
        ],
    });
    enemy_templates["威武星骑士"] = new Enemy({
        name: "威武星骑士", 
        description: "幸好结界湖的蓝帽行者没有戴着更大的帽子出现在这里。否则它大概能有几兆血。", 
        xp_value: 4807526976, 
        rank: 3712,
        image: "image/enemy/E3712.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 1352e8, attack: 63e8, agility: 52e8, attack_speed: 1.4, defense:27e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.003},
            {item_name: "传说绿宝石", chance:0.008},
            {item_name: "紫晶碎片", chance:0.027},
            //9B
        ],
    });
    enemy_templates["圣荒城头目"] = new Enemy({
        name: "圣荒城头目", 
        description: "幻境也复刻了对应城市居民的弱点！无伤它的方法已经昭然若揭了。", 
        xp_value: 4807526976, 
        rank: 3713,
        image: "image/enemy/E3713.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [18],
        spec_value: {18:1e15},
        tags: [],
        stats: {health: 1104.5e8, attack: 63e8, agility: 48e8, attack_speed: 1.4, defense:37e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.003},
            {item_name: "传说绿宝石", chance:0.008},
            {item_name: "传承水晶·白", chance:0.04},
            {item_name: "传承水晶·橙", chance:0.04},
            {item_name: "传承水晶·粉", chance:0.04},
            //9B
        ],
    });
    enemy_templates["兰陵城头目"] = new Enemy({
        name: "兰陵城头目", 
        description: "这只也差不多！虽然冰宫幻境本身在燕岗领深处，但幻境中的灵却是恐惧显化而成。", 
        xp_value: 4807526976, 
        rank: 3714,
        image: "image/enemy/E3714.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [39],
        spec_value: {39:5000e8},
        tags: [],
        stats: {health: 924.5e8, attack: 55e8, agility: 50e8, attack_speed: 1.4, defense:44e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.003},
            {item_name: "传说绿宝石", chance:0.008},
            {item_name: "幻境符文", chance:0.021},
            //9B
        ],
    });
    enemy_templates["战场不朽骸骨"] = new Enemy({
        name: "战场不朽骸骨", 
        description: "就连头骨都已然发黑。光环……甚至还增强了一些？", 
        xp_value: 4807526976, 
        rank: 3715,
        image: "image/enemy/E3715.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [11],
        tags: [],
        stats: {health: 900e8, attack: 65e8, agility: 52e8, attack_speed: 1.4, defense:30e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.003},
            {item_name: "传说绿宝石", chance:0.008},
            {item_name: "幻境符文", chance:0.024},
            //9B
        ],
    });
    enemy_templates["血腥追风者"] = new Enemy({
        name: "血腥追风者", 
        description: "【废墟追风者】的概念扰动延续到幻境了！毕竟追光作为小怪技能也太超模了啦……", 
        xp_value: 4807526976, 
        rank: 3716,
        image: "image/enemy/E3716.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [36,16],
        tags: [],
        stats: {health: 1350e8, attack: 65e8, agility: 52e8, attack_speed: 1.4, defense:30e8}, //血量50%
        loot_list: [
            {item_name: "传说红宝石", chance:0.003},
            {item_name: "传说绿宝石", chance:0.008},
            {item_name: "幻境符文", chance:0.027},
            //9B
        ],
    });



    
    /*
     红   绿 
B9  0.8% 0.3% 5B
B9+ 0.3% 0.8% 9B
B9++ ？？？
B7 4'3349'4437 /7'0140'8733 exp
B8 11'3490'3170/18'3631'1903exp
B9 29'7121'5073/48'0752'6976exp

B9++ 7,778,742,049exp 16B

火烈茸茸和幻境飞蛾换位


圣荒城头目开始9阶+
血洛大陆骨干开始9阶++(考虑到C1=B9+4 B9+2是常规等级)
大门派精英独占9阶+++(经验和C1一致 掉落比C1少半档)



*/    
})();


//challenge enemies
(function(){
    enemy_templates["纳家待从[BOSS]"] = new Enemy({
        name: "纳家待从[BOSS]", 
        description: "用出全部力量的纳家待从。在家里出手就是无所顾忌！", 
        add_to_bestiary: true,
        xp_value: 13, 
        rank: 1199,
        image: "image/boss/B1101.png",
        realm: "<span class=realm_basic><b>万物级巅峰</b></span>",
        size: "small",
        spec: [5],
        tags: [],
        stats: {health: 3444, attack: 111, agility: 60, attack_speed: 1.1, defense: 44}, //可能改动
        loot_list: [
            {item_name: "初始红宝石", chance:1.0},
            {item_name: "初始红宝石", chance:1.0},
            {item_name: "初始蓝宝石", chance:1.0},
            {item_name: "初始蓝宝石", chance:1.0},//固定掉落
        ],
    });
    enemy_templates["百家小卒[BOSS]"] = new Enemy({
        name: "百家小卒[BOSS]", 
        description: "为了抢夺秘法而用出全力的百家小卒。", 
        add_to_bestiary: true,
        xp_value: 13, 
        rank: 1298,
        image: "image/boss/B1201.png",
        realm: "<span class=realm_basic><b>万物级巅峰 +</b></span>",
        size: "small",
        spec: [2],
        tags: [],
        stats: {health: 6600, attack: 144, agility: 90, attack_speed: 1.1, defense: 60}, //与原作相同
        loot_list: [
            {item_name: "银钱", chance: 1},
            {item_name: "银钱", chance: 1},
            //奖励在秘法石碑后面
        ],
    });
    enemy_templates["腐蚀质石精[BOSS]"] = new Enemy({
        name: "腐蚀质石精[BOSS]", 
        description: "城门边上的大石头。对人类有着天然的仇恨，不死不休", 
        add_to_bestiary: true,
        xp_value: 34, 
        rank: 1299,
        image: "image/boss/B1202.png",
        realm: "<span class=realm_basic><b>潮汐级高等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 17700, attack: 380, agility: 200, attack_speed: 1.2, defense: 160}, //可能改动
        loot_list: [
            {item_name: "初始绿宝石", chance:1.0},
            {item_name: "初始绿宝石", chance:1.0},
            {item_name: "毒液", chance: 1},
            {item_name: "毒液", chance: 1},
        ],
    });
    enemy_templates["百兰[BOSS]"] = new Enemy({
        name: "百兰[BOSS]", 
        description: "城外的大叔。看不起纳可，但实力却不比纳可强多少。", 
        add_to_bestiary: true,
        xp_value: 34, 
        rank: 1398,
        image: "image/boss/B1301.png",
        realm: "<span class=realm_basic><b>潮汐级高等</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 9000, attack: 540, agility: 200, attack_speed: 1.2, defense: 50}, //可能改动
        loot_list: [
            {item_name: "初始绿宝石", chance:1.0},
            {item_name: "初始绿宝石", chance:1.0},
        ],
    });
    enemy_templates["燕岗领佣兵[BOSS]"] = new Enemy({
        name: "燕岗领佣兵[BOSS]", 
        description: "守在地宫门口，伺机而动的佣兵。已经截胡许多修者，底蕴丰厚。", 
        add_to_bestiary: true,
        xp_value: 144, 
        rank: 1399,
        image: "image/boss/B1302.png",
        realm: "<span class=realm_terra><b>大地级一阶</b></span>",
        size: "small",
        spec: [2],
        tags: [],
        stats: {health: 29900, attack: 1225, agility: 600, attack_speed: 1.2, defense: 400}, 
        loot_list: [
            //{item_name: "高级黄宝石", chance:1},
            //{item_name: "高级黄宝石", chance:1},
        ],
    });
    enemy_templates["地宫看门人[BOSS]"] = new Enemy({
        name: "地宫看门人[BOSS]", 
        description: "听说，有喵在叠铁质皮肤...", 
        add_to_bestiary: true,
        xp_value: 987, 
        rank: 1497,
        image: "image/boss/B1401.png",
        realm: "<span class=realm_terra><b>大地级三阶</b></span>",
        size: "small",
        spec: [28],
        tags: [],
        stats: {health: 270000, attack: 7500, agility: 5000, attack_speed: 1.2, defense: 3750}, 
        loot_list: [
            {item_name: "高级红宝石", chance:1},
            {item_name: "高级红宝石", chance:1},
            {item_name: "黑色刀币", chance:1},
        ],
    });
    
    enemy_templates["行走树妖[BOSS]"] = new Enemy({
        name: "行走树妖[BOSS]", 
        description: "相当灵活的树妖，想接近它必须做好被20条蓄力柳条先各抽一下的准备！", 
        add_to_bestiary: true,
        xp_value: 377, 
        rank: 1498,
        image: "image/boss/B1402.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [16],
        tags: [],
        stats: {health: 135000, attack: 2900, agility: 2000, attack_speed: 1.2, defense: 1800}, 
        loot_list: [
            {item_name: "三月断宵", chance:1},
        ],
    });
    enemy_templates["深邃之影[BOSS]"] = new Enemy({
        name: "深邃之影[BOSS]", 
        description: "属性均衡的精英荒兽，地宫核心的守门人。", 
        add_to_bestiary: true,
        xp_value: 377, 
        rank: 1499,
        image: "image/boss/B1403.png",
        realm: "<span class=realm_terra><b>大地级二阶</b></span>",
        size: "small",
        spec: [17],
        tags: [],
        stats: {health: 81000, attack: 4800, agility: 2000, attack_speed: 1.2, defense: 2000}, 
        loot_list: [
            {item_name: "高级红宝石", chance:1},
            {item_name: "高级蓝宝石", chance:1},
            {item_name: "高级蓝宝石", chance:1},
        ],
    });
    
    enemy_templates["地下岩火[BOSS]"] = new Enemy({
        name: "地下岩火[BOSS]", 
        description: "这只屑BOSS的皮怎么那么脆啊！好像一下子就可以打死的样子。", 
        xp_value: 610, 
        rank: 1597,
        image: "image/boss/B1501.png",
        realm: "<span class=realm_terra><b>大地级二阶 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 10800, attack:16000, agility: 5400, attack_speed: 1.2, defense: 4000}, 
        loot_list: [
            {item_name: "极品黄宝石", chance:1.00},
            //应为28X
        ],
    });
    enemy_templates["喵咕哩[BOSS]"] = new Enemy({
        name: "喵咕哩[BOSS]", 
        description: "~满·血·版·真·神·降·临~ 强大，无需多言！", 
        xp_value: 1587, 
        rank: 1598,
        image: "image/boss/B1502.png",
        realm: "<span class=realm_terra><b>大地级三阶 +</b></span>",
        size: "small",
        spec: [21],
        spec_value:{21:8000},
        tags: [],
        stats: {health: 365000, attack:10040, agility: 8000, attack_speed: 1.2, defense: 2333}, 
        loot_list: [
        ],
    });
    enemy_templates["地宫养殖者[BOSS]"] = new Enemy({
        name: "地宫养殖者[BOSS]", 
        description: "第一幕的最终BOSS。本来2-5也不一定打得过，幸好有镭射枪...", 
        xp_value: 1346269, 
        rank: 1599,
        image: "image/boss/B1503.png",
        realm: "<span class=realm_sky><b>天空级一阶</b></span>",
        size: "small",
        spec: [28],
        spec_value:{},
        tags: [],
        stats: {health: 120000000, attack:4000000, agility: 800000, attack_speed: 1.0, defense: 600000}, 
        loot_list: [],
    });
    enemy_templates["百家近卫[BOSS]"] = new Enemy({
        name: "百家近卫[BOSS]", 
        description: "百方携带的护卫。为什么少爷会带比自己还弱的护卫呢...", 
        xp_value: 7575, 
        rank: 2198,
        image: "image/boss/B2101.png",
        realm: "<span class=realm_terra><b>大地级五阶</b></span>",
        size: "small",
        spec: [33],
        spec_value:{33:6},
        tags: [],
        stats: {health: 2000000, attack:44000, agility: 24000, attack_speed: 1.2, defense: 22000}, 
        loot_list: [{item_name:"极品蓝宝石",chance:1.00}],
    });
    enemy_templates["百方[荒兽森林 ver.][BOSS]"] = new Enemy({
        name: "百方[荒兽森林 ver.][BOSS]", 
        description: "和飞船里的百方比起来只低了两阶，属性却少了20余倍。大地级后期的跨度也太大了叭。", 
        xp_value: 46368, 
        rank: 2199,
        image: "image/boss/B2102.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [32,34],
        spec_value:{},
        tags: [],
        stats: {health: 38400000, attack:192000, agility: 96000, attack_speed: 1.2, defense: 63000}, 
        loot_list: [{item_name:"玻璃小炮",chance:1.00}],
    });
    enemy_templates["威武武士[BOSS]"] = new Enemy({
        name: "威武武士[BOSS]", 
        description: "呐，这就叫做误闯天家...2-4的武士怎么跑来这里了！", 
        xp_value: 46368, 
        rank: 2297,
        image: "image/boss/B2201.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 7500000, attack:370000, agility: 120000, attack_speed: 1.2, defense: 30000}, 
        loot_list: [{item_name:"极品绿宝石",chance:1.00},{item_name:"极品绿宝石",chance:1.00}],
    });
    enemy_templates["礁石灵[BOSS]"] = new Enemy({
        name: "礁石灵[BOSS]", 
        description: "拦着前往清野瀑布的路的坚硬石头。温馨提醒：普攻倍率在坚固之后判定！", 
        xp_value: 17711, 
        rank: 2298,
        image: "image/boss/B2202.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [1],
        spec_value:{},
        tags: [],
        stats: {health: 200, attack:88000, agility: 54000, attack_speed: 1.0, defense: 55000}, 
        loot_list: [],
    });
    enemy_templates["大门派杂役[BOSS]"] = new Enemy({
        name: "大门派杂役[BOSS]", 
        description: "不愧是大门派，连杂役都这么强...之前的小势力探险者都快穷死了！", 
        xp_value: 17711, 
        rank: 2299,
        image: "image/boss/B2203.png",
        realm: "<span class=realm_terra><b>大地级六阶</b></span>",
        size: "small",
        spec: [32,6],
        spec_value:{},
        tags: [],
        stats: {health: 3900000, attack:125000, agility: 60000, attack_speed: 1.2, defense: 15000}, 
        loot_list: [{item_name:"极品红宝石",chance:3.00}],
    });
    enemy_templates["秘境心火精灵[BOSS]"] = new Enemy({
        name: "秘境心火精灵[BOSS]", 
        description: "本来就够强了，还有光环用耶...幸好可以挖光环！", 
        xp_value: 46368, 
        rank: 2399,
        image: "image/boss/B2301.png",
        realm: "<span class=realm_terra><b>大地级七阶</b></span>",
        size: "small",
        spec: [27,13],
        spec_value:{},
        tags: [],
        stats: {health: 3200000, attack:280000, agility: 150000, attack_speed: 1.2, defense: 120000}, 
        loot_list: [{item_name:"极品绿宝石",chance:4.00}],
    });
    
    enemy_templates["蓝帽行者[BOSS]"] = new Enemy({
        name: "蓝帽行者[BOSS]", 
        description: "等会？夺少血？？", 
        xp_value: 75025, 
        rank: 2499,
        image: "image/boss/B2403.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [3,5],
        spec_value:{},
        tags: [],
        stats: {health: 150000000, attack:400000, agility: 250000, attack_speed: 1.2, defense: 40000}, 
        loot_list: [
        ],
    });
    enemy_templates["流云级魔法师[BOSS]"] = new Enemy({
        name: "流云级魔法师[BOSS]", 
        description: "前面有承伤的，嘻嘻嘻嘻嘻", 
        xp_value: 75025, 
        rank: 2497,
        image: "image/boss/B2401.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [0,6],
        spec_value:{},
        tags: [],
        stats: {health: 2560000, attack:80000, agility: 260000, attack_speed: 1.2, defense: 240000}, 
        loot_list: [
        ],
    });
    enemy_templates["威武异衣士[BOSS]"] = new Enemy({
        name: "威武异衣士[BOSS]", 
        description: "可以造成一定的伤害也有承伤能力。在4重攻击下似乎相当重要呢。", 
        xp_value: 75025, 
        rank: 2498,
        image: "image/boss/B2402.png",
        realm: "<span class=realm_terra><b>大地级七阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 22000000, attack:560000, agility: 270000, attack_speed: 1.2, defense: 90000}, 
        loot_list: [
        ],
    });

    
    enemy_templates["废墟追光者[BOSS]"] = new Enemy({
        name: "废墟追光者[BOSS]", 
        description: "正面打大概是要被追光给暴揍的。但是，追光只有3段伤害~", 
        xp_value: 317811, 
        rank: 2599,
        image: "image/boss/B2501.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [23,40],
        spec_value:{},
        tags: [],
        stats: {health: 102000000, attack:1600000, agility: 800000, attack_speed: 1.0, defense: 520000}, 
        loot_list: [{item_name:"殿堂蓝宝石",chance:4.00}],
    });
    
    enemy_templates["初级卫兵A9[BOSS]"] = new Enemy({
        name: "初级卫兵A9[BOSS]", 
        description: "散华真是麻烦的领悟呢...蛾眉月之祝福，魔攻药剂，你喜欢哪一种~", 
        xp_value: 514229, 
        rank: 2699,
        image: "image/boss/B2601.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [37],
        spec_value:{},
        tags: [],
        stats: {health: 144000000, attack:3200000, agility: 1600000, attack_speed: 1.4, defense: 1250000}, 
        loot_list: [{item_name:"殿堂红宝石",chance:4.00}],
    });
    
    enemy_templates["百方[BOSS]"] = new Enemy({
        name: "百方[BOSS]", 
        description: "这只是正牌的了！不过少爷和纳可比起来进步的有点慢呢——", 
        xp_value: 514229, 
        rank: 2797,
        image: "image/boss/B2102.png",
        realm: "<span class=realm_terra><b>大地级巅峰 +</b></span>",
        size: "small",
        spec: [32,34],
        spec_value:{},
        tags: [],
        stats: {health: 77700000, attack:4560000, agility: 2000000, attack_speed: 1.2, defense: 700000}, 
        loot_list: [{item_name:"玻璃大炮",chance:1.00,quality:160}],
    });

    enemy_templates["空间三角B1[BOSS]"] = new Enemy({
        name: "空间三角B1[BOSS]", 
        description: "好大一只！好难打！不过，速度有点慢耶。", 
        xp_value: 2178309, 
        rank: 2798,
        image: "image/boss/B2702.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [6],
        spec_value:{},
        tags: [],
        stats: {health: 105000000, attack:6500000, agility: 4000000, attack_speed: 0.9, defense: 3500000}, 
        loot_list: [{item_name:"殿堂绿宝石",chance:2.00}],
    });
    
    enemy_templates["储存姬B1[BOSS]"] = new Enemy({
        name: "储存姬B1[BOSS]", 
        description: "哈~自爆！我看谁敢嫌弃加血宝石~", 
        xp_value: 2178309, 
        rank: 2799,
        image: "image/boss/B2703.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [36],
        spec_value:{},
        tags: [],
        stats: {health: 361000000, attack:9990000, agility: 4800000, attack_speed: 1.2, defense: 3340000}, 
        loot_list: [{item_name:"殿堂绿宝石",chance:2.00},{item_name:"摩羽币",chance:33.00}],
    });

    enemy_templates["银色血眼B1[BOSS]"] = new Enemy({
        name: "银色血眼B1[BOSS]", 
        description: "守护着堪称【巨量】的宝物的它，作为重要的剧情节点——被加强了！", 
        xp_value: 2178309, 
        rank: 2897,
        image: "image/boss/B2801.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [1],
        spec_value:{},
        tags: [],
        stats: {health: 2800, attack: 1100e4, agility: 600e4, attack_speed: 1.2, defense: 600e4}, 
        loot_list: [
            {item_name: "高能凝胶", chance:999},
            {item_name: "A7·能量核心", chance:999},
            {item_name: "B1·能量核心", chance:333},
            {item_name: "进化结晶凝聚-一学就会", chance:1},
            //大概3-4B了？
        ],
    });
    
    enemy_templates["质子粉碎机B1[BOSS]"] = new Enemy({
        name: "质子粉碎机B1[BOSS]", 
        description: "夭寿啦——夸克禁闭坏掉啦——", 
        xp_value: 2178309, 
        rank: 2898,
        image: "image/boss/B2802.png",
        realm: "<span class=realm_sky><b>天空级一阶 +</b></span>",
        size: "small",
        spec: [7],
        spec_value:{},
        tags: [],
        stats: {health: 14400e4, attack: 960e4, agility: 680e4, attack_speed: 1.6, defense: 500e4}, 
        loot_list: [
        ],
    });
    
    enemy_templates["舰船中枢B6[BOSS]"] = new Enemy({
        name: "舰船中枢B6[BOSS]", 
        description: "B6飞船的主战中枢。移速迅捷，战力强悍。不过，镭射枪也到了发挥作用的时候了。", 
        xp_value: 165580141, 
        rank: 2899,
        image: "image/boss/B2803.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [45],//10回合
        spec_value:{},
        tags: [],
        stats: {health: 4225e8, attack: 168100e4, agility: 1200e4, attack_speed: 1.0, defense: 0}, 
        loot_list: [
            {item_name: "B6·飞船核心", chance:1 ,ignore_luck:true},
        ],
    });
    enemy_templates["魅影幻姬[BOSS]"] = new Enemy({
        name: "魅影幻姬[BOSS]", 
        description: "擅长幻术的荒兽。本身实力不算强悍，但可以神不知鬼不觉地让人迷失方向。对了，10x固定凭证是天空级中期的击杀奖励，而4x受影响凭证是两只精英佣兵掉的。", 
        xp_value: 24157817, 
        rank: 3199,
        image: "image/boss/B3101.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        size: "small",
        spec: [13,0],
        spec_value:{},
        tags: [],
        stats: {health: 4.9e8, attack: 7000e4, agility: 3200e4, attack_speed: 1.5, defense: 1800e4}, 
        loot_list: [
            {item_name: "荒兽凭证", chance:4},
            {item_name: "沼泽兽油", chance:0.2},
            //抢劫了两只精英佣兵
            {item_name: "史诗蓝宝石", chance:1},
            {item_name: "荒兽凭证", chance:10,ignore_luck:true},
            //本身的掉落
        ],
    });
    enemy_templates["蛮咕兽[BOSS]"] = new Enemy({
        name: "蛮咕兽[BOSS]", 
        description: "皮糙肉厚的荒兽。那边那个冒失的家伙在干什么啊！", 
        xp_value: 24157817, 
        rank: 3298,
        image: "image/boss/B3201.png",
        realm: "<span class=realm_sky><b>天空级四阶</b></span>",
        size: "small",
        spec: [13,0],
        spec_value:{},
        tags: [],
        stats: {health: 33.32e8, attack: 6000e4, agility: 4500e4, attack_speed: 1.2, defense:3000e4}, 
        loot_list: [
            {item_name: "史诗红宝石", chance:1},
        ],
    });
    enemy_templates["天空级凶兽[BOSS]"] = new Enemy({
        name: "天空级凶兽[BOSS]", 
        description: "好潦草的名字...简直是荒兽里的路人甲。", 
        xp_value: 63245986, 
        rank: 3299,
        image: "image/boss/B3202.png",
        realm: "<span class=realm_sky><b>天空级四阶 ++</b></span>",
        size: "small",
        spec: [20],
        spec_value:{},
        tags: [],
        stats: {health: 23e8, attack: 7000e4, agility: 5500e4, attack_speed: 1.2, defense:3500e4}, //血量200%
        loot_list: [
            {item_name: "史诗红宝石", chance:1},
            {item_name: "天空兽角", chance:4},
        ],
    });
    enemy_templates["探险者的怨恨[BOSS]"] = new Enemy({
        name: "探险者的怨恨[BOSS]", 
        description: "虽然有时封和200%血量，但是0防在普攻倍率面前~不堪一击！。", 
        xp_value: 102334155, 
        rank: 3397,
        image: "image/boss/B3301.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        size: "small",
        spec: [12],
        spec_value:{},
        tags: [],
        stats: {health: 18e8, attack: 39690e4, agility: 9000e4, attack_speed: 1.5, defense:0e4}, //血量200%
        loot_list: [
            {item_name: "万载冰髓锭", chance:2},
            {item_name: "史诗绿宝石", chance:1},
        ],
    });
    enemy_templates["敌意猎兵[BOSS]"] = new Enemy({
        name: "敌意猎兵[BOSS]", 
        description: "其实本来也不算特别强……但是它们六只来群殴你耶。", 
        xp_value: 102334155, 
        rank: 3398,
        image: "image/boss/B3302.png",
        realm: "<span class=realm_sky><b>天空级五阶 +</b></span>",
        size: "small",
        spec: [],
        spec_value:{},
        tags: [],
        stats: {health: 60.5e8, attack: 2.2e8, agility: 1.2e8, attack_speed: 1.2, defense:1.1e8}, //血量200%
        loot_list: [
        ],
    });
    enemy_templates["敌意女巫[BOSS]"] = new Enemy({
        name: "敌意女巫[BOSS]", 
        description: "躲在一大群猎兵后面来偷袭你！好屑啊……", 
        xp_value: 165580141, 
        rank: 3399,
        image: "image/boss/B3303.png",
        realm: "<span class=realm_sky><b>天空级六阶</b></span>",
        size: "small",
        spec: [0],
        spec_value:{},
        tags: [],
        stats: {health: 134.48e8, attack: 2.16e8, agility: 1.4e8, attack_speed: 1.5, defense:1.08e8}, //血量200%
        loot_list: [
            {item_name: "史诗绿宝石", chance:2},
        ],
    });
    enemy_templates["敌意老人[BOSS]"] = new Enemy({
        name: "敌意老人[BOSS]", 
        description: "相当耐揍，但是也只剩下耐揍了。", 
        xp_value: 267914296, 
        rank: 3499,
        image: "image/boss/B3401.png",
        realm: "<span class=realm_sky><b>天空级六阶 +</b></span>",
        size: "small",
        spec: [5],
        spec_value:{},
        tags: [],
        stats: {health: 326.7e8, attack: 4.5e8, agility: 3.9e8, attack_speed: 1.4, defense:3.0e8}, //血量300%
        loot_list: [
            //280D
        ],
    });
    enemy_templates["竺虎[BOSS]"] = new Enemy({
        name: "竺虎[BOSS]", 
        description: "在同阶里称得上实力强悍，但想要逆伐喵可是不是搞错了什么？", 
        xp_value: 267914296, 
        rank: 3595,
        image: "image/boss/B3501.png",
        realm: "<span class=realm_sky><b>天空级五阶 +++</b></span>",
        size: "small",
        spec: [23],
        spec_value:{},
        tags: [],
        stats: {health: 810e8, attack: 8.5e8, agility: 4.5e8, attack_speed: 1.4, defense:2.4e8}, //血量400%
        loot_list: [
            {item_name: "传说黄宝石", chance:1},
        ],
    });
    enemy_templates["莫尔[BOSS]"] = new Enemy({
        name: "莫尔[BOSS]", 
        description: "水牢里的好人。真是让人感动啊……", 
        xp_value: 433494437, 
        rank: 3596,
        image: "image/boss/B3502.png",
        realm: "<span class=realm_sky><b>天空级六阶 ++</b></span>",
        size: "small",
        spec: [50],
        spec_value:{50:0.16e8},
        tags: [],
        stats: {health: 1299.6e8, attack: 7.7e8, agility: 6.0e8, attack_speed: 1.2, defense:3.3e8}, //血量400%
        loot_list: [
            {item_name: "传说黄宝石", chance:2},
        ],
    });
    enemy_templates["秋兴[BOSS]"] = new Enemy({
        name: "秋兴[BOSS]", 
        description: "强榜强者【落叶刀】。暂列第三——当你看到这个提示就不是了。", 
        xp_value: 701408733, 
        rank: 3597,
        image: "image/boss/B3503.png",
        realm: "<span class=realm_sky><b>天空级六阶 +++</b></span>",
        size: "small",
        spec: [46,32],
        tags: [],
        stats: {health: 1000e8, attack: 10.5e8, agility: 9.0e8, attack_speed: 1.4, defense:8.4e8}, //血量400%
        loot_list: [
        ],
    });
    enemy_templates["蓝柒[放水 ver.][BOSS]"] = new Enemy({
        name: "蓝柒[放水 ver.][BOSS]", 
        description: "强榜的发布者，拥有着碾压般的实力。虽然这里三重领域只用了一重……", 
        xp_value: 701408733, 
        rank: 3598,
        image: "image/boss/B3504.png",
        realm: "<span class=realm_sky><b>天空级六阶 +++</b></span>",//真正实力：天空级六阶 [IV].(3个加号以上换用罗马数字)
        size: "small",
        spec: [0],
        tags: [],
        stats: {health: 1210e8, attack: 12.25e8, agility: 10.8e8, attack_speed: 1.6, defense:6.76e8}, //血量400%
        loot_list: [
            {item_name: "传说红宝石", chance:2,ignore_luck:true},
        ],
    });
    enemy_templates["蓝柒[BOSS]"] = new Enemy({
        name: "蓝柒[BOSS]", 
        description: "强榜的发布者，拥有着碾压般的实力。领域齐出的她强的可怕，甚至超越了3+之境……", 
        xp_value: 1134903170, 
        rank: 3599,
        image: "image/boss/B3504.png",
        realm: "<span class=realm_sky><b>天空级六阶 [IV]</b></span>",
        size: "small",
        spec: [0,7,42],
        tags: [],
        stats: {health: 1742.4e8, attack: 17.64e8, agility: 14.4e8, attack_speed: 1.7, defense:10.24e8}, //血量400%
        loot_list: [
            {item_name: "传说红宝石", chance:4,ignore_luck:true},
        ],
    });
    enemy_templates["怪物手册[BOSS]"] = new Enemy({
        name: "怪物手册[BOSS]", 
        description: "为什么怪物手册会成精啊！另外，不觉得压制比牵制还要容易成为负累吗……", 
        xp_value: 2971215073, 
        rank: 3697,
        image: "image/boss/B3601.png",
        realm: "<span class=realm_sky><b>天空级八阶 ++</b></span>",
        size: "small",
        spec: [9,51],
        tags: [],
        stats: {health: 4936e8, attack: 36e8, agility: 21e8, attack_speed: 1.3, defense:21e8}, //血量400%
        loot_list: [
            {item_name: "传承水晶·橙", chance:2,ignore_luck:true},
            {item_name: "传承水晶·白", chance:2,ignore_luck:true},
            {item_name: "传承水晶·粉", chance:2,ignore_luck:true},
            {item_name: "传承水晶·绿", chance:2,ignore_luck:true},
            {item_name: "传承水晶·蓝", chance:2,ignore_luck:true},
        ],
    });
    enemy_templates["心魔木偶[SP]"] = new Enemy({
        name: "心魔木偶[SP]", 
        description: "被高维存在注入力量的木偶。测试完压制·伪它就该下班了！", 
        xp_value: 4807526976, 
        rank: 3698,
        image: "image/spec/fishmark.png",
        realm: "<span class=realm_basic><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [52],
        tags: [],
        stats: {health: 9999e12, attack: 113.56e8, agility: 44.4e8, attack_speed: 1.0, defense:1e4}, 
        loot_list: [
            {item_name: "宇宙币", chance:168,ignore_luck:true},
        ],
    });
    
    enemy_templates["心魔[BOSS]"] = new Enemy({
        name: "心魔[BOSS]", 
        description: "我保留了一些同调，这样你才知道你打的是心魔。不过，它还是会被牵制领悟度欺负就是了！", 
        xp_value: 2971215073, 
        rank: 3699,
        image: "image/boss/B3602.png",
        realm: "<span class=realm_sky><b>天空级巅峰</b></span>",
        size: "small",
        spec: [33,52,53],
        spec_value:{33:13},
        tags: [],
        stats: {health: 17776e8, attack: 1e4, agility: 44.4e8, attack_speed: 1.0, defense:1e4}, //血量400%
        loot_list: [
        ],
    });
    enemy_templates["喵咕啦[BOSS]"] = new Enemy({
        name: "喵咕啦[BOSS]", 
        description: "颜色和姐姐的衣服真的很像……现在不是想这种事情的时候！", 
        xp_value: 4807526976, 
        rank: 3791,
        image: "image/boss/B3701.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [21],
        spec_value:{21:60e8},
        tags: [],
        stats: {health: 5555e8, attack: 1e4, agility: 50e8, attack_speed: 1.5, defense:37.5e8}, //血量500%(x)原创属性！
        loot_list: [
        ],
    });
    enemy_templates["不可能三角B9[BOSS]"] = new Enemy({
        name: "不可能三角B9[BOSS]", 
        description: "单纯的数值怪。我猜可以打到这里应该不是很怕它了。", 
        xp_value: 4807526976, 
        rank: 3791,
        image: "image/boss/B3702.png",
        realm: "<span class=realm_sky><b>天空级巅峰 +</b></span>",
        size: "small",
        spec: [],
        tags: [],
        stats: {health: 15125e8, attack: 77e8, agility: 60e8, attack_speed: 1.6, defense:48e8}, //血量500%
        loot_list: [
        ],
    });
/*

17776Z/113.56E/1W/44.4E/1.0

属性是99.99J/113.56E/1W/44.4E/1.0，
只有一个【压制·伪】属性。
 
*/







    enemy_templates["Village guard (heavy)"] = new Enemy({
        name: "Village guard (heavy)", 
        description: "", 
        add_to_bestiary: false,
        xp_value: 1,
        rank: 4,
        tags: ["living", "human"],
        size: "medium",
        stats: {health: 300, attack: 50, agility: 20, dexterity: 80, intuition: 20, attack_speed: 0.2, defense: 30},
    });
    enemy_templates["Village guard (quick)"] = new Enemy({
        name: "Village guard (quick)", 
        description: "", 
        add_to_bestiary: false,
        xp_value: 1,
        rank: 4,
        tags: ["living", "human"],
        size: "medium",
        stats: {health: 300, attack: 20, agility: 20, dexterity: 50, intuition: 20, attack_speed: 2, defense: 10},
    });
    enemy_templates["Suspicious wall"] = new Enemy({
        name: "Suspicious wall", 
        description: "", 
        add_to_bestiary: false,
        xp_value: 1,
        rank: 1,
        tags: ["unanimate"],
        size: "large",
        stats: {health: 10000, attack: 0, agility: 0, dexterity: 0, intuition: 0, attack_speed: 0.000001, defense: 100},
    });

    enemy_templates["Suspicious man"] = new Enemy({
        name: "Suspicious man", 
        description: "", 
        add_to_bestiary: false,
        xp_value: 1,
        rank: 5,
        tags: ["living", "human"],
        size: "medium",
        stats: {health: 400, attack: 60, agility: 60, dexterity: 60,intuition: 60, attack_speed: 2, defense: 30},
    });
})()

export {Enemy, enemy_templates, enemy_killcount};
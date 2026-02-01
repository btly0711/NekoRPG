"use strict";

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
            throw new Error(`No such enemy size option as "size"!`);
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
            let item_count = 0;
            item_count = Math.floor(raw_chance);
            let final_chance = raw_chance - item_count;
            if (final_chance>= Math.random()) item_count ++;
            // if ("count" in item) {
            //     item_count = Math.round(Math.random() * (item["count"]["max"] - item["count"]["min"]) + item["count"]["min"]);
            //     // calculates how much drops (from range min-max, both inclusive)
            // }
                

            if(item_count != 0) loot.push({ "item": getItem(item_templates[item.item_name]), "count": item_count });
        }

        return loot;
    }

    get_droprate_modifier() {
        let droprate_modifier = this.loot_multi;
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
            {item_name: "蓝晶碎片", chance:0.07},
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

    /*
      黄 蓝
八阶+ 5%/2%     28Z
巅峰  3%/5%     50Z
A9 31'7811   /51'4229  exp
A9卫兵开始算巅峰+
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
        loot_list: [],
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
        loot_list: [],
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
        xp_value: 46368, 
        rank: 2599,
        image: "image/boss/B2501.png",
        realm: "<span class=realm_terra><b>大地级巅峰</b></span>",
        size: "small",
        spec: [23,40],
        spec_value:{},
        tags: [],
        stats: {health: 102000000, attack:1600000, agility: 800000, attack_speed: 1.0, defense: 520000}, 
        loot_list: [],
    });

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
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
                 spec_value = {},
                 image = "",
                }) {
                    
        this.name = name;
        this.rank = rank; //only for the bestiary order; higher rank => higher in display
        this.description = description; //try to keep it short
        this.xp_value = xp_value;
        this.stats = stats;
        this.spec = spec;
        this.spec_value = spec_value;
        //console.log(spec);
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
        //console.log("try to loot");
        for (let i = 0; i < this.loot_list.length; i++) {
            item = this.loot_list[i];
            if(!item_templates[item.item_name]) {
                console.warn(`Tried to loot an item "${item.item_name}" from "${this.name}", but such an item doesn't exist!`);
                continue;
            }
            
            //console.log("try to loot II");
            if (item.chance * this.get_droprate_modifier() >= Math.random()) {
                // checks if it should drop
                let item_count = 1;
                if ("count" in item) {
                    item_count = Math.round(Math.random() * (item["count"]["max"] - item["count"]["min"]) + item["count"]["min"]);
                    // calculates how much drops (from range min-max, both inclusive)
                }
                
                //console.log("Looted");

                loot.push({ "item": getItem(item_templates[item.item_name]), "count": item_count });
            }
        }

        return loot;
    }

    get_droprate_modifier() {
        let droprate_modifier = 1;
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
        description: "第一只大地级魔物。温馨提醒：大地级以上经验增长速率会翻倍！", 
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
        description: "蕴含着狂暴力量的茸茸，周围的魔物都会被其影响，变得暴戾", 
        xp_value: 55, 
        rank: 1319,
        image: "image/enemy/E1319.png",
        realm: "<span class=realm_basic><b>潮汐级巅峰 +</b></span>",
        size: "small",
        spec: [],
        tags: [11],
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
    //以下为1-4的怪物[掉落物WIP]
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
        spec_value:{21:10000},
        tags: [],
        stats: {health: 36500, attack:10040, agility: 8000, attack_speed: 1.2, defense: 2333}, 
        loot_list: [
            {item_name: "高级红宝石", chance:0.03},
            {item_name: "高级绿宝石", chance:0.02},
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
            //应为50X
        ],
    });
    enemy_templates["巨型蜘蛛"] = new Enemy({
        name: "巨型蜘蛛", 
        description: "十分敏捷的巨型蜘蛛。只有两条腿的力量较大，因此只能进行二连击。", 
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
            {item_name: "高级绿宝石", chance:0.02},
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
            {item_name: "高级绿宝石", chance:0.02},
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
            {item_name: "高级绿宝石", chance:0.02},
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
            {item_name: "高级绿宝石", chance:0.02},
            //应为89X
        ],
    });
    enemy_templates["苍白之触"] = new Enemy({
        name: "苍白之触", 
        description: "它吸收了许多荒兽的精华..结果所有的属性都冲突了，技能全没了。", 
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
            {item_name: "高级绿宝石", chance:0.02},
            //应为89X
        ],
    });
    enemy_templates["燕岗城守卫"] = new Enemy({
        name: "燕岗城守卫", 
        description: "坚固，还血厚。看起来好像无解..但是坚固怕姐姐！", 
        xp_value: 2584, 
        rank: 1523,
        image: "image/enemy/E1523.png",
        realm: "<span class=realm_terra><b>大地级四阶</b></span>",
        size: "small",
        spec: [1],
        tags: [],
        stats: {health: 32, attack:11111, agility: 10081, attack_speed: 1.2, defense: 0}, 
        loot_list: [
            {item_name: "高级绿宝石", chance:0.04},
            //应为160X
        ],
    });


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
        spec: [],
        tags: [],
        stats: {health: 270000, attack: 7500, agility: 5000, attack_speed: 1.2, defense: 3750}, 
        loot_list: [
            {item_name: "高级红宝石", chance:1},
            {item_name: "高级红宝石", chance:1},
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
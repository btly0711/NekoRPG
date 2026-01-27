"use strict";

import { current_game_time } from "./game_time.js";
import { InventoryHaver } from "./inventory.js";
import { item_templates, getItem} from "./items.js";
import { skills } from "./skills.js";

var traders = {};
var inventory_templates = {};


class Trader extends InventoryHaver {
    constructor({name,
                 trade_text = `<span style="color:#ffffd0"> <i class="material-icons">storefront</i> 与 ${name} 交易</span>`,
                 location_name,
                 refresh_time = 1,
                 refresh_shift = 0,
                 inventory_template,
                 profit_margin = 2,
                 is_unlocked = true,
                }) 
    {
        super();
        this.name = name;
        this.trade_text = trade_text;
        this.location_name = location_name;
        this.last_refresh = -1;  
        //just the day_count from game_time at which trader was supposedly last refreshed

        this.refresh_time = refresh_time; 
        //7 would mean it's refreshed every 7 days (with shift at 0 it's every monday)
        
        this.refresh_shift = refresh_shift; 
        //shift refreshing days, e.g. time 7 + shift 2 would be every wednesday, shift 4 would push it to every friday
        //pretty much pointless if refresh time is not N*7
        
        this.inventory_template = inventory_template;
        //a template for the trader to use, so multiple traders can have same predefined item selection (but still separate and with certain randomness)

        this.profit_margin = profit_margin;
        //how much more expensive are the trader's items than their actual value, with default being 2 (so 2x more)
        //don't make it too low to prevent easy xp grinding for the haggling skill
        this.is_unlocked = is_unlocked;
    }
    
    /**
     * refreshes trader inventory
     * @returns boolean informing if it was able to refresh
     */
    refresh() {
        if (this.can_refresh()) {
            //refresh inventory
            this.inventory = this.get_inventory_from_template();

            this.last_refresh = (current_game_time.day_count + 1 - current_game_time.day_count % this.refresh_time);
            return true;
        }
        //otherwise do nothing
        return false;
    }

    /**
     * checks if enough time passed since last refresh
     * @returns {Boolean}
     */
    can_refresh() {
        return (this.last_refresh < 0 || current_game_time.day_count - (this.last_refresh + this.refresh_shift) >= this.refresh_time);
    }

    /**
     * creates new choice of items for the trader, based on assigned inventory template
     * @returns {null}
     */
    get_inventory_from_template() {
        const inventory = {};
        const inventory_template = inventory_templates[this.inventory_template];

        for (let i = 0; i < inventory_template.length; i++) {
            if (inventory_template[i].chance >= Math.random()) {
                let item_count = inventory_template[i].count.length == 1 ?
                inventory_template[i].count[0] : Math.round(Math.random() *
                    (inventory_template[i].count[1] - inventory_template[i].count[0]) + inventory_template[i].count[0]);
                
                if(inventory_template[i].quality) {
                    let quality = Math.round(Math.random() *
                        (inventory_template[i].quality[1] - inventory_template[i].quality[0]) + inventory_template[i].quality[0]);

                    const item = getItem({...item_templates[inventory_template[i].item_name], quality});
                    inventory[item.getInventoryKey()] = { item: item, count: item_count };
                } else {
                    inventory[item_templates[inventory_template[i].item_name].getInventoryKey()] = { item: getItem(item_templates[inventory_template[i].item_name]), count: item_count };

                }
            }
            //console.log(inventory_template[i]);


        }

        //just add items based on their chances and counts in inventory_template
        return inventory;
    }

    /**
     * 
     * @returns {Number} trader's profit margin multiplied by bonus from the haggling skill
     */
    getProfitMargin() {
        return Math.max(Math.min(1.1,this.profit_margin),this.profit_margin * (Math.pow(0.98,skills["Haggling"].current_level)));
    }

    getItemPrice(value) {
        let price = Math.ceil(value*this.getProfitMargin());
        if(price >= 100) {
            return Math.round(price/10)*10;
        } else if(price >= 1000) {
            return Math.round(price/100)*100;
        } else {
            return price;
        }
    }
}

class TradeItem {
    constructor({ item_name,
                  chance = 1,
                  count = [1],
                  quality = [0.2, 0.8]
                }) 
    {
        this.item_name = item_name;
        this.chance = chance; //chance for item to appear, 1 is 100%
        this.count = count; 
        //how many can appear, will randomly choose something between min and max if specificed, otherwise will go with specific ammount
        
        this.quality = quality; //min and max quality of item
    }
}

//create traders
(function(){
    traders["village trader"] = new Trader({
        name: "village trader",
        inventory_template: "Basic",
        is_unlocked: false,
        location_name: "Village",
    });
    traders["suspicious trader"] = new Trader({
        name: "suspicious trader",
        inventory_template: "Basic plus",
        is_unlocked: true,
        location_name: "Slums",
        profit_margin: 3,
    });
    traders["自动售货机"] = new Trader({
        name: "自动售货机",
        inventory_template: "Basic I",
        is_unlocked: true,
        location_name: "纳家大厅",
    });
    traders["燕岗杂货铺"] = new Trader({
        name: "燕岗杂货铺",
        inventory_template: "Basic II",
        is_unlocked: false,
        location_name: "燕岗城",
        profit_margin: 3,
    });
    traders["矿井集市"] = new Trader({
        name: "矿井集市",
        inventory_template: "Basic III",
        is_unlocked: true,
        location_name: "燕岗矿井",
        profit_margin: 3.2,
    });
    traders["金属批发商"] = new Trader({
        name: "金属批发商",
        inventory_template: "Terra Palace",
        is_unlocked: false,
        location_name: "地宫浅层",
        profit_margin: 1.5,
    });
    traders["营地商铺"] = new Trader({
        name: "营地商铺",
        inventory_template: "Terra II",
        is_unlocked: true,
        location_name: "荒兽森林营地",
        profit_margin: 3.6,
    });
    traders["行脚商人"] = new Trader({
        name: "行脚商人",
        inventory_template: "Terra III",
        is_unlocked: false,
        location_name: "清野江畔",
        profit_margin: 4.2,
    });
    traders["废墟商人"] = new Trader({
        name: "废墟商人",
        inventory_template: "Terra IV",
        is_unlocked: false,
        location_name: "声律城废墟",
        profit_margin: 5.4,
    });
    traders["物品存储箱"] = new Trader({
        name: "物品存储箱",
        trade_text: `<span style="color:#c0ffe0"> <i class="material-icons">work_outline</i> 向箱子里存取物品</span>`,
        inventory_template: "Box",
        is_unlocked: true,
        location_name: "纳家秘境",
        profit_margin: 1.0,
        refresh_time: 9e15,
    });
})();

//create inventory templates
(function(){
    inventory_templates["Basic"] = 
    [
            new TradeItem({item_name: "Cheap iron spear", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron dagger", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron sword", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron axe", count: [1], quality: [40, 90], chance: 0.8}),
            new TradeItem({item_name: "Cheap iron battle hammer", count: [1], quality: [40, 90], chance: 0.8}),

            new TradeItem({item_name: "Cheap iron spear", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron dagger", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron sword", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron axe", count: [1], quality: [91, 120], chance: 0.4}),
            new TradeItem({item_name: "Cheap iron battle hammer", count: [1], quality: [91, 120], chance: 0.4}),

            new TradeItem({item_name: "Cheap wooden shield", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap wooden shield", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Crude wooden shield", count: [1], chance: 0.7, quality: [40, 90]}),
            new TradeItem({item_name: "Crude wooden shield", count: [1], chance: 0.4, quality: [91, 120]}),

            new TradeItem({item_name: "Cheap leather vest", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather vest", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather pants", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather pants", count: [1], chance: 0.5, quality: [91, 120]}),
            new TradeItem({item_name: "Cheap leather hat", count: [1], quality: [40, 90]}),
            new TradeItem({item_name: "Cheap leather hat", count: [1], chance: 0.5, quality: [91, 120]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.7, quality: [60, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.7, quality: [60, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.7, quality: [60, 120]}),

            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.3, quality: [60, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.3, quality: [60, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.3, quality: [60, 120]}),

            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),

            new TradeItem({item_name: "ABC for kids", count: [1], chance: 1}),
            new TradeItem({item_name: "Old combat manual", count: [1], chance: 0.5}),
            
            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
    ];

    inventory_templates["Basic plus"] = 
    [
            new TradeItem({item_name: "Iron spear", count: [1], quality: [40, 80], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [40, 80], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [40, 80], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [40, 80], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [40, 80], chance: 0.8}),

            new TradeItem({item_name: "Iron spear", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron dagger", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron sword", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron axe", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "Iron battle hammer", count: [1], quality: [81, 120], chance: 0.8}),

            new TradeItem({item_name: "Wooden shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Wooden shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Crude iron shield", count: [1], quality: [40, 80]}),
            new TradeItem({item_name: "Crude iron shield", count: [1], chance: 0.8, quality: [81, 120]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.6, quality: [40, 80]}),
            new TradeItem({item_name: "Iron shield", count: [1], chance: 0.4, quality: [81, 120]}),

            new TradeItem({item_name: "Leather vest", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather pants", count: [1], chance: 0.9, quality: [81, 120]}),
            new TradeItem({item_name: "Leather hat", count: [1], chance: 0.9, quality: [81, 120]}),

            new TradeItem({item_name: "Leather shoes", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Leather gloves", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armor", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather armored pants", count: [1], chance: 0.8, quality: [91, 120]}),
            new TradeItem({item_name: "Wolf leather helmet", count: [1], chance: 0.8, quality: [91, 120]}),
            
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail armor", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail pants", count: [1], chance: 0.6, quality: [81, 120]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.8, quality: [40, 80]}),
            new TradeItem({item_name: "Iron chainmail helmet", count: [1], chance: 0.6, quality: [81, 120]}),
            
            new TradeItem({item_name: "Weak healing powder", count: [2,5]}),

            new TradeItem({item_name: "Twist liek a snek", count: [1], chance: 0.7}),

            new TradeItem({item_name: "Glass phial", count: [5,10], chance: 1}),
    ];

    //NekoRPG Trades below
    inventory_templates["Basic I"] = 
    [
            new TradeItem({item_name: "凝胶", count: [5,10]}),
            new TradeItem({item_name: "飞蛾翅膀", count: [5,10]}),

            new TradeItem({item_name: "金属残片", count: [5,10]}),
            new TradeItem({item_name: "魔力碎晶", count: [5,10]}),
            
            new TradeItem({item_name: "骨头", count: [2,5]}),
            
            new TradeItem({item_name: "微尘·凶兽肉排", count: [2,5], chance: 0.5}),
            
            new TradeItem({item_name: "铁剑", count: [1], quality: [61, 100], chance: 0.8}),
            new TradeItem({item_name: "铁剑·改", count: [1], quality: [81, 120], chance: 0.2}),
            new TradeItem({item_name: "粘合帽子", count: [1], quality: [61, 100], chance: 0.5}),
            new TradeItem({item_name: "粘合背心", count: [1], quality: [61, 100], chance: 0.5}),
            new TradeItem({item_name: "粘合裤子", count: [1], quality: [61, 100], chance: 0.5}),
            new TradeItem({item_name: "粘合袜子", count: [1], quality: [61, 100], chance: 0.5}),
    ];

    inventory_templates["Basic II"] = 
    [
            new TradeItem({item_name: "金属残片", count: [10,25]}),
            new TradeItem({item_name: "魔力碎晶", count: [10,25]}),
            
            
            new TradeItem({item_name: "铁锭", count: [5,15]}),
            new TradeItem({item_name: "合金残片", count: [1,10], chance: 0.8}),
            new TradeItem({item_name: "异兽皮", count: [1,25], chance: 0.8}),

            new TradeItem({item_name: "万物·凶兽肉排", count: [2,5], chance: 0.8}),
            
            new TradeItem({item_name: "铁剑·改", count: [1], quality: [81, 120], chance: 0.8}),
            new TradeItem({item_name: "精钢剑", count: [1], quality: [71, 110], chance: 0.3}),

            new TradeItem({item_name: "异兽帽子", count: [1], quality: [61, 100], chance: 0.5}),
            new TradeItem({item_name: "异兽背心", count: [1], quality: [61, 100], chance: 0.5}),
            new TradeItem({item_name: "异兽裤子", count: [1], quality: [61, 100], chance: 0.5}),
            new TradeItem({item_name: "异兽袜子", count: [1], quality: [61, 100], chance: 0.5}),
    ];

    inventory_templates["Basic III"] = 
    [
            new TradeItem({item_name: "异兽皮", count: [15,40]}),
            new TradeItem({item_name: "铜骨", count: [10,25]}),
            new TradeItem({item_name: "精钢锭", count: [5,15]}),
            //旧物品


            new TradeItem({item_name: "紫铜矿", count: [1,12], chance: 0.7}),
            new TradeItem({item_name: "煤炭", count: [1,12], chance: 0.8}),
            new TradeItem({item_name: "灵液", count: [1,12], chance: 0.8}),
            new TradeItem({item_name: "毒液", count: [1,12], chance: 0.8}),
            //初级产品


            new TradeItem({item_name: "润灵铜骨", count: [2,4], chance: 0.4}),
            new TradeItem({item_name: "潮汐·凶兽肉排", count: [2,5], chance: 0.9}),
            //加工品


            new TradeItem({item_name: "紫铜头盔", count: [1], quality: [41, 80], chance: 0.4}),
            new TradeItem({item_name: "紫铜胸甲", count: [1], quality: [41, 80], chance: 0.4}),
            new TradeItem({item_name: "紫铜腿甲", count: [1], quality: [41, 80], chance: 0.4}),
            new TradeItem({item_name: "紫铜战靴", count: [1], quality: [41, 80], chance: 0.4}),
            //装备
    ];

    
    inventory_templates["Terra Palace"] = 
    [
            new TradeItem({item_name: "地宫金属锭", count: [999,999]}),
    ];
    
    inventory_templates["Terra II"] = 
    [
            new TradeItem({item_name: "A1·能量核心", count: [100,250]}),
            new TradeItem({item_name: "黑色刀币", count: [100,250]}),
            new TradeItem({item_name: "霜炙皮草", count: [100,250]}),
            new TradeItem({item_name: "地宫·荒兽肉排", count: [100,250]}),
            
            
            new TradeItem({item_name: "荒兽精华", count: [3,5]}),
            new TradeItem({item_name: "A4·能量核心", count: [5,10], chance: 0.8}),
            new TradeItem({item_name: "甲壳碎片", count: [5,10], chance: 0.8}),

            new TradeItem({item_name: "森林·荒兽肉块", count: [2,5], chance: 0.8}),
            new TradeItem({item_name: "活化柳木", count: [5,10], chance: 0.8}),
            
            new TradeItem({item_name: "充能剑", count: [1], quality: [81, 120], chance: 0.5}),
            new TradeItem({item_name: "充能戟", count: [1], quality: [71, 110], chance: 0.2}),

            new TradeItem({item_name: "活性帽子", count: [1], quality: [91, 120], chance: 0.8}),
            new TradeItem({item_name: "活性背心", count: [1], quality: [91, 120], chance: 0.8}),
            new TradeItem({item_name: "活性裤子", count: [1], quality: [91, 120], chance: 0.8}),
            new TradeItem({item_name: "活性袜子", count: [1], quality: [91, 110], chance: 0.8}),
    ];

    inventory_templates["Terra III"] = 
    [
            new TradeItem({item_name: "活性织料", count: [100,250]}),
            new TradeItem({item_name: "甲壳碎片", count: [100,250]}),
            new TradeItem({item_name: "流动凝胶", count: [100,250]}),
            new TradeItem({item_name: "A4·能量核心", count: [50,150]}),
            new TradeItem({item_name: "森林·荒兽肉块", count: [20,50], chance: 0.8}),

            
            new TradeItem({item_name: "A9·牵制药剂", count: [10,20]}),
            new TradeItem({item_name: "A9·魔攻药剂", count: [10,20]}),
            new TradeItem({item_name: "A9·坚固药剂", count: [10,20]}),
            new TradeItem({item_name: "A9·回风药剂", count: [10,20]}),

            
            new TradeItem({item_name: "充能剑", count: [1], quality: [111, 140], chance: 0.8}),
            new TradeItem({item_name: "充能戟", count: [1], quality: [111, 140], chance: 0.8}),

    ];
    inventory_templates["Terra IV"] = 
    [
            new TradeItem({item_name: "透明水晶", count: [100,250]}),
            new TradeItem({item_name: "蓝金锭", count: [100,250]}),
            new TradeItem({item_name: "湛蓝芦苇", count: [100,250]}),
            new TradeItem({item_name: "A7·能量核心", count: [50,150]}),
            new TradeItem({item_name: "水溶精华", count: [99,99]}),
            new TradeItem({item_name: "荒兽精华", count: [99,99]}),
            new TradeItem({item_name: "青花鱼", count: [20,50], chance: 0.8}),

            
            new TradeItem({item_name: "废墟恢复药水", count: [10,20]}),
            new TradeItem({item_name: "废墟狂暴药水", count: [10,20]}),
            new TradeItem({item_name: "冰柱鱼", count: [1,1],chance:0.3}),
            new TradeItem({item_name: "废墟符文", count: [10,20],chance:0.6}),
            new TradeItem({item_name: "绿色刀币", count: [10,20],chance:0.6}),



            
            new TradeItem({item_name: "符文工作台套件", count: [1,1]}),

            

    ];
    inventory_templates["Box"] = 
    [
    ];


})();
export {traders};
"use strict";

function expo(number, precision = 2)
{
    if(number == 0) {
        return 0;
    } else if(number >= 1000 || number < 0.01) {
        return Number.parseFloat(number).toExponential(precision).replace(/[+-]/g,"");
    } else if(number > 10) {
        return Math.round(number);
    } else if(number > 1) {
        return Math.round(number*10)/10;
    } else {
        return Math.round(number*100)/100;
    }
}

function round_item_price(price) {
    
    return Math.ceil(price-0.01);
}

function format_reading_time(time) {
    return `${Math.round(time)} 秒`;
}
                
const stat_names = {"strength": "str",
                    "health": "hp",
                    "max_health": "生命上限", //same as for "health"
                    "health_regeneration_flat": "生命恢复", //same as for "health"
                    "agility": "敏捷",
                    "dexterity": "dex",
                    "UK1": "UK1",
                    "attack_speed": "攻击速度",
                    "attack_power": "攻击",
                    "crit_rate": "暴击概率",
                    "crit_multiplier": "暴击伤害",
                    "intuition": "int",
                    "block_strength": "shield strength",
                    "hit_chance": "hit chance",
                    "evasion": "EP",
                    "evasion_points": "EP",
                    "attack_points": "AP",
                };

function get_hit_chance(attack_agi, evasion_agi) {
    let result = 2* attack_agi/evasion_agi;
    
    result = 0.63661977*Math.atan(result**1.5)// 2 / pi
    return result;
}

/**
 * 
 * @returns {String} 1 if a is newer, 0 if both are same, -1 if b is newer
 */
function compare_game_version(version_a, version_b) {
    let a = version_a.replace("v","").split(".");
    let b = version_b.replace("v","").split(".");
    for(let i = 0; i < a.length; i++) {
        let temp;
        if(Number.parseInt(a[i]) && Number.parseInt(b[i])) {
            temp = [Number.parseInt(a[i]), Number.parseInt(b[i])] 
        } else {
            temp = [a[i], b[i]];
        }
        if(temp[0] === temp[1]) {
            continue;
        } else if(temp[0] > temp[1]) {
            return 1;
        } else {
            return -1;
        }
    }

    return 0;
}

export { expo, format_reading_time, stat_names, get_hit_chance, compare_game_version, round_item_price};
"use strict";

import { player ,REALM_DATA} from "./main.js";
import {format_number} from "./display.js";
import Decimal from "./break_eternity.js";
import { getAchievement ,showAchievementToast} from "./achievement.js";

const BUILDING_MAPS = {"none":"[无]","tda":"[乱时法阵]"}
function renderBuilding(){
    document.getElementById("building_workhour").innerText = format_number(player.build.wh) + 'wh/w\'';
    document.getElementById("building_workhour_rt").innerText = format_number(player.build.wh.div(10800).mul(player.time.spd)) + 'wh/s';

    document.getElementById("build_project").innerText = BUILDING_MAPS[player.build.wt.status];
    if(player.build.wt.prog_max.lte(1)) document.getElementById("build_progress").innerText = '当前不在建设中'
    else document.getElementById("build_progress").innerText = format_number(player.build.wt.progress) + ' / ' + format_number(player.build.wt.prog_max) + ' wh';
    document.getElementById("build_prog_bar").style.width = Math.floor(player.build.wt.progress.div(player.build.wt.prog_max).mul(100).mag*100)/100 + '%';

    document.getElementById("tda_level").innerText = format_number(player.build.tda.level);
    document.getElementById("tda_upgrade_ore").innerText = format_number(player.build.tda.price) + ' 灵矿';
    document.getElementById("tda_upgrade_wh").innerText = format_number(player.build.tda.price.mul(1e4).pow(1.2)) + ' wh';
    document.getElementById("tda_effect").innerText = format_number(player.build.tda.effect) + 'x';
}
function update_building(dt){
    player.build.wh = player.family.stats.wh.mul(player.work.build);

    if(player.build.wt.status!='none'){
        player.build.wt.progress = player.build.wt.progress.add(player.build.wh.div(10800).mul(player.time.spd.mul(dt))).min(player.build.wt.prog_max);//wh/w'->wh/s'->wh/t
        //推进建设进度
    }
    if(player.build.wt.progress.gte(player.build.wt.prog_max)){
        if(player.build.wt.status=='tda'){
            player.build.tda.level =  player.build.tda.level.add(1);//升级
            //未来这里可能加入折算空间
            player.build.tda.price = (new Decimal(5)).pow(player.build.tda.level);//计算价格

            player.build.tda.effect = (new Decimal(1.5)).pow(player.build.tda.level);//计算效果
            if(player.build.tda.level.gte(1)) getAchievement(14);
            if(player.build.tda.level.gte(13)) getAchievement(20);
            
            showAchievementToast([`乱时法阵 Lv.${format_number(player.build.tda.level)} 竣工`,`时间流速 ${format_number((new Decimal(1.5)).pow(player.build.tda.level))}x(↑)`],"build-toast");
        }
        player.build.wt.progress = new Decimal(0);
        player.build.wt.prog_max = new Decimal(1);
        player.build.wt.status = 'none';//重置建设进度
    }

}

function build_tda(){
    if(player.resources.ore.lt(player.build.tda.price)) return;//灵矿不足
    if(player.build.wt.status != 'none') return;//建筑中

    player.resources.ore = player.resources.ore.sub(player.build.tda.price);//扣除灵矿
    player.build.wt.status = 'tda';//time distorting array
    player.build.wt.progress = new Decimal(0);
    player.build.wt.prog_max = new Decimal(player.build.tda.price.mul(1e4).pow(1.2));//设置建设进度
}
window.build_tda = build_tda;

export {update_building , renderBuilding}
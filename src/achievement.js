"use strict";

import { player ,REALM_DATA} from "./main.js";

import {format_number} from "./display.js";
import Decimal from "./break_eternity.js";
const ACHIEVEMENTS = [
    [],
    ["家族伊始","招募第一只小猫(家族成员)"],
    ["完全脱产","将某境界小猫的工作时长设为0"],
    ["你跑不过我你信吗","将某境界小猫的休息时长设为0"],
    ["指数增长?","在分工菜单中将小猫分配到生育岗位"],
    ["标准劳力","有小猫抵达万物级"],
    ["双倍力量","有小猫抵达万物级高等","解锁探索菜单"],
    ["反正卡上限…","将某境界小猫的修炼时长设为0"],//7
    ["探索小队","将小猫分配到探索岗位"],
    ["首战告捷","通过练兵场-1","解锁灵矿，建设菜单"],
    ["界限突破","通过练兵场-4"],
    ["自增循环","有小猫抵达万物级巅峰"],
    ["并不是指数增长","抵达生育一重软上限"],
    ["土木老猫","小猫分配到建筑岗位"],
    ["时间扭曲","建造第1个乱时法阵"],
    ["这是……灵药？","扫荡燕岗城-1","解锁灵药，以及突破率加成"],//14
    ["生存延续","有小猫抵达潮汐级"],
    ["深入地宫","通过燕岗近郊 -4"],
    ["\"第八维度\"","有小猫抵达潮汐级高等"],
    ["第九维度是个谎言","有小猫抵达潮汐级巅峰","解锁影响力重置层(点击图标来重置)"],
    ["十眼一年","时间流速抵达5w'/s"],
    ["1000年生きてる","游戏内时间抵达1000年"],
];
const ACHI_NUM = 21;


function LoadAchievement(){
    const achi_table = document.getElementById("achievement_table");
    let at_c = "";
    for(let i=1;i<=ACHI_NUM;i+=1){
        at_c += `<div id="achi_${i}" class="achi_single achi_${player.achievement.list[i]==1?'':'un'}comp "><span ${(!ACHIEVEMENTS[i][2])?'':'class="achi_spec"'}>${ACHIEVEMENTS[i][0]}</span><div class="tooltip">${ACHIEVEMENTS[i][1]}${(!ACHIEVEMENTS[i][2])?'':`<br><span class="achi_spec">${ACHIEVEMENTS[i][2]}</span>`}</div></div>`;
        if(i%7==0) at_c += '<br>';
    }
    achi_table.innerHTML = at_c;
}

function getAchievement(num){
    if(!player.achievement.list[num]){
        player.achievement.list[num]=1;
        player.achievement.total += 1;
        document.getElementById(`achi_${num}`).classList.remove("achi_uncomp");
        document.getElementById(`achi_${num}`).classList.add("achi_comp");
        showAchievementToast(ACHIEVEMENTS[num],'achi-toast');
        RefreshLockedContent();//重载解锁。
    }

}


function renderAchievement(){
    document.getElementById("achi_num").innerText=player.achievement.total;
    document.getElementById("achi_bonus").innerText=format_number((new Decimal(1.01)).pow(player.achievement.total));

}



function RefreshLockedContent(){
    if(!player.achievement.list[6]){
        document.getElementById("explore_button").style.display="none";
        document.getElementById("explore_wh_span").style.display="none";
        document.getElementById("bp_display_span").style.display="none";
    }
    else{
        document.getElementById("explore_button").style.display="block";
        document.getElementById("explore_wh_span").style.display="block";
        document.getElementById("bp_display_span").style.display="block";
    }
    
    if(!player.achievement.list[9]){
        document.getElementById("building_button").style.display="none";
        document.getElementById("build_wh_span").style.display="none";
        document.getElementById("ore_display_span").style.display="none";
    }
    else{
        document.getElementById("building_button").style.display="block";
        document.getElementById("build_wh_span").style.display="block";
        document.getElementById("ore_display_span").style.display="block";
    }
    if(!player.achievement.list[15]){
        document.getElementById("herb_display_span").style.display="none";
        document.getElementById("herb_related").style.display="none";
    }
    else{
        document.getElementById("herb_display_span").style.display="block";
        document.getElementById("herb_related").style.display="block";
    }
    if(!player.achievement.list[19]){
        document.getElementById("influ_display_span").style.display="none";
        document.getElementById("influ_button").style.display="none";
    }
    else{
        document.getElementById("influ_display_span").style.display="block";
        document.getElementById("influ_button").style.display="block";
    }
}


function showAchievementToast(text,e_cl){
    const container = document.getElementById('achievement-toast-container');
    const toast = document.createElement('div');
    toast.classList.add('achievement-toast');
    toast.classList.add(e_cl);
    
    toast.innerHTML = `
        <div>
            <div class="toast-title">${text[0]}</div>
            <div class="toast-name">${text[1]}${(!text[2])?'':` : <span class="achi_spec">${text[2]}</span>`}</div>
        </div>
    `;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show'); 
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400); 
    }, 3000);
}//显示弹出条！

export {LoadAchievement,getAchievement , renderAchievement,showAchievementToast , RefreshLockedContent};
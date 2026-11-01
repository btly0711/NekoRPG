"use strict";

import { player ,REALM_DATA} from "./main.js";

import { updateRealmcap} from "./explore.js";
import {showAchievementToast} from "./achievement.js";
import {format_number,renderFamilyMembers , renderExploreLocation} from "./display.js";
import Decimal from "./break_eternity.js";
function get_pending_influ(){
    if(!player.family.cats[8]) return new Decimal(0);
    return player.family.cats[8].div(4e7).pow(0.5).floor();
}
function try_influ_reset(){
    if(player.influ.miles[3]){
        influ_reset();
        return;//直接重置 跳过确认
    }
    document.getElementById("reset_screen").style.display='flex';
    document.getElementById("influ_reset_screen").style.display='flex';
    document.getElementById("pending_influ_screen").innerText=`作为交换，你将得到 ${format_number(get_pending_influ())} 影响力`;

    //尝试重置时获取里程碑 0.24删除
    for(let m=1;m<influ_miles.length;m+=1){
        if(player.influ.times.gte(influ_miles[m]) && (!player.influ.miles[m])){
            player.influ.miles[m] = 1;
            showAchievementToast([`获得了新的影响力里程碑！`,`#${m}`],"influ-toast");
            ReloadInfluMilestones();
        }
    }
}
function cancel_influ_reset(){
    document.getElementById("reset_screen").style.display='none';
    document.getElementById("influ_reset_screen").style.display='none';
}
function commit_influ_reset(){
    document.getElementById("reset_screen").style.display='none';
    document.getElementById("influ_reset_screen").style.display='none';
    influ_reset();
}
window.try_influ_reset = try_influ_reset;
window.cancel_influ_reset = cancel_influ_reset;
window.commit_influ_reset = commit_influ_reset;
const influ_miles = [0,1,3,6,10,15,20];
function influ_reset(){
    if(get_pending_influ().lte(0)){
        showAchievementToast([`[潮汐级巅峰]不足.`,`无法获取任何影响力，重置已取消。`],"battle-toast-lose");
        return;
    }
    showAchievementToast([`重置成功!`,`获取了 ${get_pending_influ()} 影响力。`],"influ-toast");
    player.influ.points = player.influ.points.add(get_pending_influ());
    player.influ.times = player.influ.times.add(1);
    
    for(let m=1;m<influ_miles.length;m+=1){
        if(player.influ.times.gte(influ_miles[m]) && (!player.influ.miles[m])){
            player.influ.miles[m] = 1;
            showAchievementToast([`获得了新的影响力里程碑！`,`#${m}`],"influ-toast");
            ReloadInfluMilestones();
        }
    }
    //资源获取
    player.time.reseting = 1;
    //WIP(0.14):里程碑减免重置内容
    reset_cats();
    reset_explore();//含realmcap
    reset_building();
    reset_resources();
    player.time.reseting = 0;
    player.time.cur = new Decimal(0);
    console.log("influ reset complete");

}
function reset_cats(){
    player.family.maxrealm = 0;
    player.family.cats = [new Decimal(0)];
    player.family.stats = {wh:new Decimal(0),cnt:new Decimal(0)};
    renderFamilyMembers();
    player.family.birt = new Decimal(0);
}
function reset_explore(){
    if(player.influ.miles[4]) return;//不重置
    player.family.realmcap = 4;
    updateRealmcap();
    player.explore.prog = 0;
    player.explore.cur = 1;
    player.explore.b_mul = new Decimal(1);
    renderExploreLocation();
}
function reset_building(){
    player.build.wt = {status:'none',progress:new Decimal(0),prog_max:new Decimal(1)};
    let tda_lv = new Decimal(0);
    if(player.influ.miles[2]) tda_lv = player.build.tda.level.min(player.influ.times);//保留一些乱时
    player.build.tda = {level:tda_lv,price:(new Decimal(5)).pow(tda_lv),effect:(new Decimal(1.5)).pow(tda_lv)};
}
function reset_resources(){
    if(!player.influ.miles[6]) player.resources.herb = new Decimal(0);
    if(!player.influ.miles[5]) player.resources.ore = new Decimal(0);
}
function renderInfluMiles(){
    document.getElementById("influ_reset_times").innerText = format_number(player.influ.times);
}
function renderInfluUpg(){
    document.getElementById("influ_bonus").innerText = format_number(player.influ.points.mul(2).add(1).ln().add(1));
}
function ReloadInfluMilestones(){
    for(let m=1;m<=influ_miles.length;m+=1){
        let ml=document.getElementById(`influ_miles_${m}`); 
        if(player.influ.miles[m]){
            ml.classList.add('influ_miles_active');
        }
    }
}
export {influ_reset, get_pending_influ , renderInfluMiles , renderInfluUpg , ReloadInfluMilestones};
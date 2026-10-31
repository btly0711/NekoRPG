"use strict";

import { player ,REALM_DATA} from "./main.js";
import { format_timedur, format_number , renderExploreLocation} from "./display.js";
import { getAchievement ,showAchievementToast} from "./achievement.js";
import Decimal from "./break_eternity.js";

const EXP_LOCATIONS = [
['家里蹲',new Decimal(0),new Decimal(1.00),4,"blank_location"],
['练兵场 - 1',new Decimal(1e4),new Decimal(1.04),4,"blank_location",new Decimal(1),new Decimal(0)],
['练兵场 - 2',new Decimal(3.2e4),new Decimal(1.10),4,"blank_location",new Decimal(4),new Decimal(0)],
['练兵场 - 3',new Decimal(1e5),new Decimal(1.17),4,"blank_location",new Decimal(12),new Decimal(0)],
['练兵场 - 4',new Decimal(4e5),new Decimal(1.25),5,"blank_location",new Decimal(60),new Decimal(0)],
['燕岗城 - 1',new Decimal(1e6),new Decimal(1.32),5,"gray_location",new Decimal(160),new Decimal(1)],
['燕岗城 - 2',new Decimal(3e6),new Decimal(1.40),5,"gray_location",new Decimal(530),new Decimal(4)],
['燕岗城 - 3',new Decimal(8e6),new Decimal(1.50),5,"gray_location",new Decimal(1560),new Decimal(12)],
['燕岗城 - 4',new Decimal(2e7),new Decimal(1.62),6,"gray_location",new Decimal(4280),new Decimal(36)],
['燕岗近郊 - 1',new Decimal(6e7),new Decimal(1.75),6,"grass_location",new Decimal(14300),new Decimal(136)],
['燕岗近郊 - 2',new Decimal(16e7),new Decimal(1.88),6,"grass_location",new Decimal(42100),new Decimal(440)],
['燕岗近郊 - 3',new Decimal(42e7),new Decimal(2.05),6,"grass_location",new Decimal(12.2e4),new Decimal(1400)],
['燕岗近郊 - 4',new Decimal(999999999),new Decimal(2.24),7,"grass_location",new Decimal(31.6e4),new Decimal(3980)],
['地宫 - 1',new Decimal(2.7e9),new Decimal(2.44),7,"palace_location",new Decimal(94.3e4),new Decimal(13000)],
['地宫 - 2',new Decimal(7.2e9),new Decimal(2.65),7,"palace_location",new Decimal(277e4),new Decimal(4.25e4)],
['地宫 - 3',new Decimal(18e9),new Decimal(2.87),7,"palace_location",new Decimal(760e4),new Decimal(12.8e4)],
['地宫 - 4',new Decimal(48e9),new Decimal(3.10),8,"palace_location",new Decimal(2235e4),new Decimal(41.4e4)],
['地宫核心 - 1',new Decimal(3.402823669e38),new Decimal(3.35),8,"palace_core_location",new Decimal(4280),new Decimal(36)],
]
//地点名,需求战力,环境乘数,解锁新境界,背景名,灵矿,灵药
/*

灵矿/e4 ^1.1
灵药/e6 ^1.2
 */
let DC_E = new Decimal(Math.E),DC_1 = new Decimal(1),DC_M1 = new Decimal(-1);
function get_battle_passrate(){
    if(player.explore.bb.lte(0)) player.explore.bb = new Decimal(1);
    let ans = DC_1.minus(EXP_LOCATIONS[player.explore.cur][1].div(player.explore.bb).pow(2).atan().mul(2/Math.PI));
    //console.log(ans);
    if(!ans.sign) return new Decimal(0);
    return ans;
}
function update_explore(dt){
    player.explore.wh = player.family.stats.wh.mul(player.work.explore);
    if(player.explore.wh.lte(0)){
        player.explore.trt = new Decimal(0);
        
        player.display.explore.trp = player.display.explore.trt = '未开始训练';
        
        player.display.explore.bb = '0ψ';
    }
    else player.explore.trt = player.explore.trt.add(player.time.spd.mul(dt));
    player.display.explore.trt = format_timedur(player.explore.trt);
    player.explore.trp = DC_1.minus(DC_E.pow(DC_M1.div(600).mul(player.explore.trt).mul(player.explore.wh.pow(-0.32))))
    //1-e^(-Ctb^(-a)) a=1/4 C=τ0=10h
    player.display.explore.trp = format_number(player.explore.trp.mul(100)) + '%';

    player.explore.bb = player.explore.wh.mul(player.explore.trp).add(1);
    player.display.explore.bb = format_number(player.explore.bb) + 'ψ';

    player.display.explore.pr = format_number(get_battle_passrate().mul(100)) + '%';
}
function location_change(op){
    //console.log(player.explore);
    if(op==-1 && player.explore.cur >= 2){
        player.explore.cur -= 1;
    }
    if(op==1 && player.explore.cur <= player.explore.prog){
        player.explore.cur += 1;
    }
    renderExploreLocation();
}
function location_fight(){
    if(get_battle_passrate().gt(Math.random())){
        if(player.explore.cur > player.explore.prog){
            showAchievementToast([`${EXP_LOCATIONS[player.explore.cur][0]} 开拓 成功`,`环境 ${format_number(EXP_LOCATIONS[Math.max(0,player.explore.cur-1)][2])}x -> ${format_number(EXP_LOCATIONS[player.explore.cur][2])}x , ${(EXP_LOCATIONS[player.explore.cur][3]!=EXP_LOCATIONS[player.explore.cur-1][3])?'解锁新境界':''}`],"battle-toast-win");
            player.explore.prog += 1;
            player.explore.cur += 1;
            player.explore.b_mul = EXP_LOCATIONS[player.explore.prog][2];
            player.family.realmcap = EXP_LOCATIONS[player.explore.prog][3];
            updateRealmcap();
            renderExploreLocation();
            //探索开拓
            let EP=player.explore.prog;
            if(EP==1) getAchievement(9);
            if(EP==4) getAchievement(10);
            if(EP==12) getAchievement(17);
            
        }
        else{
            showAchievementToast([`${EXP_LOCATIONS[player.explore.cur][0]} 扫荡 成功`,`获取 ${format_number(EXP_LOCATIONS[player.explore.cur][5])} 灵矿 ${(player.explore.cur>=5)?`, ${format_number(EXP_LOCATIONS[player.explore.cur][6])} 灵药`:``}`],"battle-toast-win");
            player.resources.ore = player.resources.ore.add(EXP_LOCATIONS[player.explore.cur][5]);
            player.resources.herb = player.resources.herb.add(EXP_LOCATIONS[player.explore.cur][6]);

            if(player.resources.herb.gt(0)) getAchievement(15);
        }
        //console.log("win");
    }//赢了
    else{
        showAchievementToast([`${EXP_LOCATIONS[player.explore.cur][0]} ${(player.explore.cur > player.explore.prog)?"开拓":"扫荡"} 失败.`,`什么都没有得到。`],"battle-toast-lose");
        console.log("lose");
    }//输了
    player.explore.trt = new Decimal(0);//训练时间清零
}
window.location_change = location_change;
window.location_fight = location_fight;
function updateRealmcap(){
    const realmcap = document.getElementById("realm_cap");
    realmcap.innerText = REALM_DATA[player.family.realmcap][0];
    realmcap.className = '';
    realmcap.classList.add('realm_'+REALM_DATA[player.family.realmcap][1]);
}


function renderExplore(){
    //player.family.stats.wh.mul(player.work.explore)
    //↑探索工时
    document.getElementById("explore_workhour").innerText = format_number(player.explore.wh) + 'wh/w\'';
    document.getElementById("training_time").innerText = player.display.explore.trt;
    document.getElementById("training_power").innerText = player.display.explore.trp;
    document.getElementById("explore_battle_power").innerText = player.display.explore.bb;


    document.getElementById("explore_success_chance").innerText = player.display.explore.pr;
    let p = player.explore.trp.mag;
    if(p<0.5) document.getElementById("training_power").style = `color:rgb(255,${Math.floor(p*510)},${Math.floor(p*510)}`;
    else document.getElementById("training_power").style = `color:rgb(${Math.floor(510-p*510)},255,${Math.floor(510-p*510)}`;
    p = get_battle_passrate();
    if(p<0.5) document.getElementById("explore_success_chance").style = `color:rgb(255,${Math.floor(p*510)},${Math.floor(p*510)}`;
    else document.getElementById("explore_success_chance").style = `color:rgb(${Math.floor(510-p*510)},255,${Math.floor(510-p*510)}`;
    
    

    document.getElementById("explore_herb").innerText = format_number(player.resources.herb);

    let hpc = player.resources.herb.mul(1e4).div(player.family.stats.cnt.add(0.01));
    //console.log(hpc);
    //console.log(hpc.add(1).ln().pow(0.8).mul(10));
    document.getElementById("herb_per_catpital").innerText = format_number(hpc) + ' / 10,000c';
    document.getElementById("herb_bonus").innerText = format_number(hpc.add(1).ln().pow(0.8).mul(10)) + '%';
}

export { update_explore ,EXP_LOCATIONS, updateRealmcap , get_battle_passrate , renderExplore};
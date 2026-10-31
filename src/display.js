"use strict";

import { player , REALM_DATA} from "./main.js";
import { renderBuilding } from "./building.js";
import { renderAchievement ,getAchievement} from "./achievement.js";
import { EXP_LOCATIONS , get_battle_passrate , renderExplore} from "./explore.js";
import { get_pending_influ , renderInfluMiles , renderInfluUpg} from "./influence.js";
import Decimal from "./break_eternity.js";


function change_tab(target){
    document.getElementById(`${player.display.tab}_button`).classList.remove("tab_button_active");
    document.getElementById(`${player.display.tab}_content`).style.display = 'none';
    //卸载选项卡以及按钮激活
    player.display.tab = target;
    document.getElementById(`${player.display.tab}_button`).classList.add("tab_button_active");
    document.getElementById(`${player.display.tab}_content`).style.display = 'block';
    //加载选项卡以及按钮激活
}

function change_subtab(target_s){
    let cur_s = player.display.subtab[player.display.tab];
    document.getElementById(`${player.display.tab}_${cur_s}_button`).classList.remove("subtab_button_active");
    document.getElementById(`${player.display.tab}_${cur_s}_content`).style.display = 'none';
    //卸载选项卡以及按钮激活
    player.display.subtab[player.display.tab] = target_s;
    document.getElementById(`${player.display.tab}_${target_s}_button`).classList.add("subtab_button_active");
    document.getElementById(`${player.display.tab}_${target_s}_content`).style.display = 'block';
    //加载选项卡以及按钮激活
}

window.change_tab = change_tab;

window.change_subtab = change_subtab;

/*
progress1(ach.6):抵达万物级高等，解锁探索
progress2(ach.9):通过练兵场-1，解锁灵矿/建筑
progress3(ach.15):通过燕岗-1，解锁灵药
progress4(ach.19):潮汐巅峰，解锁影响力
 */

function renderGame(adt){
    renderMain(adt);
    switch (player.display.tab){
        case 'family':
            renderFamily();
            break;
        case 'work':
            renderWork();
            break;
        case 'explore':
            renderExplore();
            break;
        case 'building':
            renderBuilding();
            break;
        case 'influ':
            switch (player.display.subtab.influ){
                case 'mile':
                    renderInfluMiles();
                    break;
                case 'upg':
                    renderInfluUpg();
                    break;
            }
            break;
        case 'achievement':
            renderAchievement();
            break;
        case 'settings':
            renderSettings();
            break;
    }
}//渲染当前页面
function renderMain(adt){
    document.getElementById("tps_monitor").innerText = `TPS:${(1/adt).toFixed(2)}(${(adt*1000).toFixed(1)})`;

    document.getElementById("autosave_monitor").innerText = player.time.save.toFixed(1);
    document.getElementById("main_birth_monitor").innerText = format_number(player.family.birt.mul(player.time.spd));

    
    document.getElementById("time_cur").innerText = format_timept(player.time.cur);
    document.getElementById("time_spd").innerText = format_timedur(player.time.spd);


    document.getElementById("total_cat").innerText = format_number(player.family.stats.cnt)+ 'c';
    document.getElementById("total_workhour").innerText = format_number(player.family.stats.wh)+ 'wh/w\'';
    if(player.achievement.list[6])document.getElementById("total_bp").innerText = player.display.explore.bb;
    if(player.achievement.list[9])document.getElementById("total_ore").innerText = format_number(player.resources.ore);
    if(player.achievement.list[15])document.getElementById("total_herb").innerText = format_number(player.resources.herb);
    if(player.achievement.list[19]){
        document.getElementById("total_influ").innerText = format_number(player.influ.points); 
        document.getElementById("pending_influ").innerText = format_number(get_pending_influ());
        document.getElementById("reset_times").innerText = `第${format_number(player.influ.times.add(1))}轮回·`;
    }
    

}
function renderFamily(){
    let members = '';
    document.getElementById("get_member_num").innerText = format_number(player.family.stats.wh.div(10).add(3).log10().mul(2).mul(player.influ.times.add(1).min(10)).round())
    
    
    for(let i=0;i<=player.family.maxrealm;i+=1){
        document.getElementById(`member_list_count_${i}`).innerText = format_number(player.family.cats[i]);
        //document.getElementById(`member_list_break_${i}`).innerText = '('+format_timedur(player.family.rdata[i].br.pow(-1)) + ')⁻¹';
        //document.getElementById(`member_list_death_${i}`).innerText = '('+format_timedur(player.family.rdata[i].dd.pow(-1)) + ')⁻¹';
        let brate = player.family.rdata[i].br.mul(player.time.spd).div(50);
        let drate = player.family.rdata[i].dd.mul(player.time.spd).div(50);
        let br_m = brate.min(brate.div(brate.add(drate))).mul(50);
        let dr_m = drate.min(drate.div(brate.add(drate))).mul(50);

        document.getElementById(`member_list_ttlbreak_${i}`).innerText = format_number(br_m.mul(player.family.cats[i]));
        document.getElementById(`member_list_ttldeath_${i}`).innerText = format_number(dr_m.mul(player.family.cats[i]));
        document.getElementById(`member_list_work_${i}`).innerText = format_number(player.family.rdata[i].wk) + '/c';
        document.getElementById(`member_list_ttlwork_${i}`).innerText = format_number(player.family.rdata[i].wk.mul(player.family.cats[i]));

    }
    //console.log('family rended');

    

}//渲染家族页面
function renderWork(){
    document.getElementById("workhour_workless").innerText = format_number(player.work.workless.mul(100).round()) + '%';
    document.getElementById("workhour_reproduce").innerText = format_number(player.work.reproduce.mul(100).round()) + '%';
    document.getElementById("workhour_explore").innerText = format_number(player.work.explore.mul(100).round()) + '%';
    document.getElementById("workhour_building").innerText = format_number(player.work.build.mul(100).round()) + '%';

    document.getElementById("reproduce_workhour").innerText = player.display.birt.wh;
    document.getElementById("basic_reproduce").innerText = player.display.birt.basic;

    if(player.display.birt.scn>=1){
        document.getElementById("1st_reproduce").innerText = "因为超过1c/h,生育率受到一重软上限(^0.6)限制,变为" + player.display.birt.sc1;
    }// 1p/h一重软上限
    else document.getElementById("1st_reproduce").innerText = "";
    document.getElementById("final_reproduce").innerText = format_number(player.family.birt.mul(player.time.spd))


}
const formats = ["科学","标准","中文"];
function renderSettings(){
    //
    document.getElementById("format_chosen").innerText = formats[player.display.format];
    document.getElementById("format_eg").innerText = format_number(new Decimal('1.793e308'));
    //计数法
}
function renderFamilyMembers(){
    const chart = document.getElementById("family_member_chart");
    let chart_html = '';
    for(let i=0;i<=player.family.maxrealm;i+=1){
        let row = '';
        row += `<tr><td class="member_list member_list_realm realm_${REALM_DATA[i][1]}">${REALM_DATA[i][0]}</td>`;
        row += `<td class="member_list member_list_count" id="member_list_count_${i}">0</td>`;
        //row += `<td class="member_list member_list_change"><span style="color:lightgreen" id="member_list_break_${i}" >(1d)⁻¹</span><br><span id="member_list_death_${i}" style="color:lightcoral">(1d)⁻¹</span></td>`;//这个不需要了……太复杂了。
        row += `<td class="member_list member_list_ttlchange"><span style="color:lightgreen" id="member_list_ttlbreak_${i}" >0</span></td><td class="member_list member_list_ttlchange"><span id="member_list_ttldeath_${i}" style="color:lightcoral">0</span></td>`;
        row += `<td class="member_list member_list_workhour" style="color:lightblue"><span id="member_list_work_${i}">0/c</span><br><span id="member_list_ttlwork_${i}" >0</span></td>`;
        row += `<td class="member_list member_list_timedtb"><span  style="color:lightblue" id="member_list_timework_${i}">${format_number(player.family.rdata[i].timedtb.wk)}h'</span> | <span  style="color:lightgreen"><span onclick="change_timedtb(${i},1,-6)">[-]</span><span  id="member_list_timerest_${i}">${format_number(player.family.rdata[i].timedtb.rt)}h'</span><span onclick="change_timedtb(${i},1,6)">[+]</span></span> | <span  style="color:lightgoldenrodyellow"><span onclick="change_timedtb(${i},2,-6)">[-]</span><span  id="member_list_timecultivate_${i}">${format_number(player.family.rdata[i].timedtb.ct)}h'</span><span onclick="change_timedtb(${i},2,6)">[+]</span></span><br><span id="member_list_time_brate_${i}" style="color:lightgoldenrodyellow">突破:x${format_number(player.family.rdata[i].timedtb.ct.div(60).pow(0.8))}</span> | <span id="member_list_time_drate_${i}" style="color:lightcoral">死亡:x${format_number(player.family.rdata[i].timedtb.rt.add(2).div(62).pow(-0.8))}</span></td>`;

        //
        row += '</tr>';
        chart_html += row;
    }
    chart.innerHTML = chart_html;
}
function renderExploreLocation(){
    document.getElementById("explore_class").innerText = player.explore.cur>player.explore.prog?"开拓":"扫荡"
    document.getElementById("explore_location").innerText = '[ '+EXP_LOCATIONS[player.explore.cur][0]+' ]';
    document.getElementById("explore_enemy_power").innerText = format_number(EXP_LOCATIONS[player.explore.cur][1]) + 'ψ';
    document.getElementById("explore_max_location").innerText = '[ '+EXP_LOCATIONS[player.explore.prog][0]+' ]';
    document.getElementById("explore_break_mul").innerText = format_number(player.explore.b_mul) + 'x';
    if(player.explore.cur>player.explore.prog) document.getElementById("explore_success_reward").innerText = `通过奖励 : 环境 ${format_number(EXP_LOCATIONS[Math.max(0,player.explore.cur-1)][2])}x -> ${format_number(EXP_LOCATIONS[player.explore.cur][2])}x , ${(EXP_LOCATIONS[player.explore.cur][3]!=EXP_LOCATIONS[player.explore.cur-1][3])?'解锁新境界':''}`;
    else document.getElementById("explore_success_reward").innerText = `扫荡获取 ${format_number(EXP_LOCATIONS[player.explore.cur][5])} 灵矿${player.explore.cur>=5?`, ${format_number(EXP_LOCATIONS[player.explore.cur][6])} 灵药`:''}.`
    document.getElementById("explore_location_div").className = '';
    document.getElementById("explore_location_div").classList.add(EXP_LOCATIONS[player.explore.cur][4])
}

function change_timedtb(realm,op,change){
    //console.log(player.family);
    if(op==1){
        if(change>0){
            if(player.family.rdata[realm].timedtb.wk.gte(change)){
                player.family.rdata[realm].timedtb.wk = player.family.rdata[realm].timedtb.wk.sub(change);
                player.family.rdata[realm].timedtb.rt = player.family.rdata[realm].timedtb.rt.add(change);
            }
        }
        else{
            if(player.family.rdata[realm].timedtb.rt.gte(-change)){
                player.family.rdata[realm].timedtb.wk = player.family.rdata[realm].timedtb.wk.sub(change);
                player.family.rdata[realm].timedtb.rt = player.family.rdata[realm].timedtb.rt.add(change);
            }
        }
        document.getElementById(`member_list_timerest_${realm}`).innerText = format_number(player.family.rdata[realm].timedtb.rt) + 'h\'';
        document.getElementById(`member_list_time_drate_${realm}`).innerText = '死亡:x' + format_number(player.family.rdata[realm].timedtb.rt.add(2).div(62).pow(-0.8));
        
    }
    if(op==2){
        if(change>0){
            if(player.family.rdata[realm].timedtb.wk.gte(change)){
                player.family.rdata[realm].timedtb.wk = player.family.rdata[realm].timedtb.wk.sub(change);
                player.family.rdata[realm].timedtb.ct = player.family.rdata[realm].timedtb.ct.add(change);
            }
        }
        else{
            if(player.family.rdata[realm].timedtb.ct.gte(-change)){
                player.family.rdata[realm].timedtb.wk = player.family.rdata[realm].timedtb.wk.sub(change);
                player.family.rdata[realm].timedtb.ct = player.family.rdata[realm].timedtb.ct.add(change);
            }
        }
        document.getElementById(`member_list_timecultivate_${realm}`).innerText = format_number(player.family.rdata[realm].timedtb.ct) + 'h\'';
        
        document.getElementById(`member_list_time_brate_${realm}`).innerText = '突破:x' + format_number(player.family.rdata[realm].timedtb.ct.div(60).pow(0.8));
    }
    document.getElementById(`member_list_timework_${realm}`).innerText = format_number(player.family.rdata[realm].timedtb.wk) + 'h\'';
    
        //member_list_time_brate_i
        //member_list_time_drate_i
    if(player.family.rdata[realm].timedtb.wk.lte(0)) getAchievement(2);
    if(player.family.rdata[realm].timedtb.rt.lte(0)) getAchievement(3);
    if(player.family.rdata[realm].timedtb.ct.lte(0)) getAchievement(7);
}
window.change_timedtb = change_timedtb;
function wh_dtb(worktype,change){
    change = new Decimal(change).mul(0.01);
    if(worktype==1){
        if(change.gt(0)){
            if(player.work.workless.lt(change)) change = player.work.workless;
        }
        else if(player.work.reproduce.lt(change.mul(-1))) change = player.work.reproduce.mul(-1);
        player.work.workless = player.work.workless.sub(change);
        player.work.reproduce = player.work.reproduce.add(change);
    }
    if(worktype==2){
        if(change.gt(0)){
            if(player.work.workless.lt(change)) change = player.work.workless;
        }
        else if(player.work.explore.lt(change.mul(-1))) change = player.work.explore.mul(-1);
        player.work.workless = player.work.workless.sub(change);
        if(change.lt(0)) player.explore.trt = player.explore.trt.mul(player.work.explore.add(change).div(player.work.explore));
        player.work.explore = player.work.explore.add(change);
        if(change.gt(0)) player.explore.trt = player.explore.trt.mul(player.work.explore.minus(change).div(player.work.explore));
    }
    if(worktype==3){
        if(change.gt(0)){
            if(player.work.workless.lt(change)) change = player.work.workless;
        }
        else if(player.work.build.lt(change.mul(-1))) change = player.work.build.mul(-1);
        player.work.workless = player.work.workless.sub(change);
        player.work.build = player.work.build.add(change);
    }
    if(player.work.reproduce.gt(0)) getAchievement(4);
    if(player.work.explore.gt(0)) getAchievement(8);
    if(player.work.build.gt(0)) getAchievement(13);
}
window.wh_dtb = wh_dtb;
function switch_format(){
    player.display.format += 1;
    player.display.format %= formats.length;
}
window.switch_format = switch_format;

function format_number(decimal){
    let sig = decimal.sign==-1?'-':'';
    // if(decimal.layer >= 2 || (decimal.layer == 1 && decimal.mag >= 308.254)){
    //     return 'Infinity';//WIP:需要适配更大数字
    // }
    if(decimal.layer==0 && decimal.mag<1e9)
    {
        if(decimal.mag<1e3){
            if(decimal.sub(decimal.floor()).abs().lte(0.00005)) return sig + decimal.mag.toFixed(0);
            if(decimal.mag>100) return sig + decimal.mag.toFixed(1);
            if(decimal.mag>10) return sig + decimal.mag.toFixed(2);
            return sig + decimal.mag.toFixed(3);
        }
        return sig + (Math.round(decimal.mag)).toLocaleString('en-US');
    }//不足1e6的数直接显示

    
    let ma,ex;
    let tr,un;//中文/标准计数法
    if(decimal.layer==1){
        ma=10**(decimal.mag  - Math.floor(decimal.mag));
        ex = Math.floor(decimal.mag);
    }
    if(decimal.layer==0){
        ex = Math.floor(Math.log10(decimal.mag));
        ma = (decimal.mag/(10**ex));
    }
    if(player.display.format==2){
        tr = Math.floor(ex/4);
        ex-=tr*4;
        ma*=10**ex;
        ma=ma.toFixed(Math.floor(4-Math.log10(ma)));
        const CN_units=['','万','亿','兆','京','垓','秭','穣','沟','涧','正','载','极'];
        un = CN_units[tr%12];
        if(tr>=12) un+='极';
        if(tr>=24) un+='^'+Math.floor(tr/12);
        return sig + ma + un;

    }//中文计数法
    if(player.display.format==1){
        tr = Math.floor(ex/3);
        ex-=tr*3;
        ma*=10**ex;
        ma=ma.toFixed(Math.floor(4-Math.log10(ma)));
        const ls_units = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];
        const S1_units = ['','U','D','T','Qa','Qi','Sx','Sp','Oc','No'];
        const S2_units = ['','Dc','Vg','Tg','Qd','Qn','Se','St','Og','Nn','Ct'];
        if(tr<=10) un=ls_units[tr];
        else{
            tr-=1;
            un = S1_units[tr%10]+S2_units[Math.floor(tr/10)];
        }
        return sig + ma + un;

    }//标准计数法

    //科学计数法
    return sig + ma.toFixed(3) + 'e' + ex;
}

function format_timedur(decimal){
    //1h=60m 1d=180h=1.08e4m 1y=50d=5.4e5m
    //1j=1e4y=5.4e8m
    //超过9e11纪元显示【时间刻度】，10^n年为n时间刻度
    //超过1e12时间刻度显示时间刻度^2,以此类推
    let time_a = decimal.div(5.4e5);
    if(time_a.layer==1) return format_number(new Decimal(time_a.sign*time_a.mag)) + ' TT\'';
    if(time_a.layer>1&&time_a.layer<1e8){
        return format_number(new Decimal(time_a.sign*time_a.mag)) + ' TT\'^'+time_a.layer.toLocaleString('en-US');
    }
    if(time_a.layer >= 1e8) return 'TT\'^' + format_number(new Decimal(time_a.layer));
    if(time_a.gt(1e4)) return format_number(time_a.div(1e4)) + 'j\'';
    if(time_a.gt(1)) return format_number(time_a) + 'y\'';
    if(decimal.gt(1.08e4)) return format_number(decimal.div(1.08e4)) + 'w\'';
    if(decimal.gt(60)) return format_number(decimal.div(60)) + 'h\'';
    return format_number(decimal) + 'm\'';
}//时间间隔
function format_timept(decimal){
    
    let str = ''
    let time_a = decimal.div(5.4e5);
    if(time_a.layer==1) return format_number(new Decimal(time_a.sign*time_a.mag)) + ' 时间刻度';
    if(time_a.layer>1&&time_a.layer<1e8){
        return format_number(new Decimal(time_a.sign*time_a.mag)) + ' 时间刻度^'+time_a.layer.toLocaleString('en-US');
    }
    if(time_a.layer >= 1e8) return '时间刻度^' + format_number(new Decimal(time_a.layer));
            //百纪内显示完整，百纪以上省略时分，万纪以上省略日，亿纪元以上省略年
    let shtn = 0;
    if(time_a.gt(1e4)) shtn=1;
    if(time_a.gt(1e6)) shtn=2;
    if(time_a.gt(1e8)) shtn=3;
    if(time_a.gt(1e12)) shtn=4;
    if(Math.floor(time_a.div(1e4).mag) != 0) str += Math.floor(time_a.div(1e4).mag).toLocaleString('en-US') + '纪元 ';
    time_a = time_a.sub(time_a.div(1e4).floor().mul(1e4));
    if(shtn<4){
        if(Math.floor(time_a.mag)<10) str += '0';
        if(Math.floor(time_a.mag)<100) str += '0';
        if(Math.floor(time_a.mag)<1000) str += '0';
        str += Math.floor(time_a.mag) + '年 ';
        time_a = time_a.sub(time_a.floor());
        if(shtn<3){
            if(Math.floor(time_a.mul(50).mag)<10) str += '0';
            str += Math.floor(time_a.mul(50).mag) + '周 ';
            time_a = time_a.sub(time_a.mul(50).floor().div(50));
            if(shtn<2){
                if(shtn==1){
                    if(Math.floor(time_a.mul(9000).mag)<100) str += '0';
                    if(Math.floor(time_a.mul(9000).mag)<10) str += '0';
                    str += Math.floor(time_a.mul(9000).mag)+'时';
                }
                else{

                    if(Math.floor(time_a.mul(9000).mag)<100) str += '0';
                    if(Math.floor(time_a.mul(9000).mag)<10) str += '0';
                    str += Math.floor(time_a.mul(9000).mag)+':';
                    time_a = time_a.sub(time_a.mul(9000).floor().div(9000));
                    if(Math.floor(time_a.mul(540000).mag)<10) str += '0';
                    str += Math.floor(time_a.mul(540000).mag)+'';
                }
            }
        }
    }
    return str;
}//时刻
function format_chance_time(decimal){
    if(decimal.gt(1)) return format_number(decimal) + ' c/m\'';
    if(decimal.gt(1/60)) return format_number(decimal.mul(60)) + ' c/h\'';
    if(decimal.gt(1/10800)) return format_number(decimal.mul(10800)) + ' c/w\'';
    if(decimal.gt(1/5.4e5)) return format_number(decimal.mul(5.4e5)) + ' c/y\'';
    if(decimal.gt(1/5.4e11)) return format_number(decimal.mul(5.4e9)) + ' c/j\'';
    if(decimal.lte(0)) return '0';
    return '('+format_timedur(decimal.pow(-1)) +')⁻¹';
}

export {renderGame, renderFamilyMembers,renderExploreLocation,format_number,format_chance_time,format_timedur};
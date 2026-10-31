"use strict";

import {renderGame, renderFamilyMembers,renderExploreLocation,format_number,format_chance_time} from "./display.js";
import {update_explore, updateRealmcap} from "./explore.js";
import {update_building} from "./building.js";
import {LoadAchievement,getAchievement , RefreshLockedContent} from "./achievement.js";
import {ReloadInfluMilestones} from "./influence.js";
import Decimal from "./break_eternity.js";
const GAME_VERSION = 'V0.14';
let player ={
    time:{
        cur:new Decimal(0),//存储单位:分钟
        spd:new Decimal("300"),//分钟/s
        save:0,//自动保存计数器，30触发保存
        reseting:0,//重置器
    },
    display:{
        tab:"family",//选项卡
        subtab:{
            influ:"mile",
        },//子选项卡
        format:0,//计数法
        birt:{
            wh:"0wh/w'",
            basic:"0c/w'",
            sc1:"0c/w'",
            scn:0,
        },
        explore:{
            trt:"0d",//训练时间
            trp:"0.0%",//训练效果
            bb:"0ψ",//ψ长得像三叉戟，所以是战力单位
            pr:"0.0%",//pass rate通过率(上述4个中唯一一个不懒更新的)
        }
    },
    family:{
        cats:[new Decimal(0)],
        maxrealm:0,//微尘级初等
        realmcap:4,//万物级高等
        rdata:[{
            br:new Decimal(0),
            dd:new Decimal(0),
            wk:new Decimal(0),
            //当前突破率/死亡率/每猫工时
            timedtb:{
                wk:new Decimal(60),
                rt:new Decimal(60),
                ct:new Decimal(60),
            }//时间分配work/rest/cultivate],
        }],
        stats:{
            wh:new Decimal(0),//workhour
            cnt:new Decimal(0),//小猫总量
        },//统计数据
        birt:new Decimal(0),//小猫生育率(c/m)
    },
    work:{
        workless:new Decimal(1),//无业
        reproduce:new Decimal(0),//生育
        explore: new Decimal(0),//探索
        build: new Decimal(0),//建筑
    },
    explore:{
        wh:new Decimal(0),//探索工时
        trt:new Decimal(0),//训练时间
        trp:new Decimal(0),//训练效果
        bb:new Decimal(0),//战力

        prog:0,//进度(目前最高8)
        cur:1,//目前查看的探索区域(最高prog+1)
        b_mul:new Decimal(1),//突破乘数
        //概率:现场计算
    },
    build:{
        wh:new Decimal(1),//建筑工时
        wt:{
            status:'none',//正在建设何项目
            progress:new Decimal(0),//建筑已投入工作量
            prog_max:new Decimal(1),//建筑需要工作量
        },
        tda:{
            level:new Decimal(0),//等级
            price:new Decimal(1),//价格(灵矿)
            effect:new Decimal(1),//效果(时速)
        }
//0待机1工作中//time distorting array@乱时法阵
    },
    influ:{
        points:new Decimal(0),//影响力
        times:new Decimal(0),//重置次数
        miles:{},
        reseting:0,//重置标记，防止家族猫浑水摸鱼
    },
    achievement:{
        total:0,
        list:{},
    },
    resources:{
        ore:new Decimal(0),
        herb:new Decimal(0),
    },
}
function complete_data(){
    //0.07↓
    if(!player.work.explore) player.work.explore = new Decimal(0);
    if(!player.explore) player.explore = {wh:new Decimal(0),trt:new Decimal(0),trp:new Decimal(0),bp:new Decimal(0),prog:0,cur:1,b_mul:new Decimal(1)};
    if(!player.explore.cur) player.explore = {wh:new Decimal(0),trt:new Decimal(0),trp:new Decimal(0),bp:new Decimal(0),prog:0,cur:1,b_mul:new Decimal(1)};
    if(!player.display.explore) player.display.explore = {trt:"0d",trp:"0.0%",bb:"0ψ",pr:"0.0%",};
    //0.08↓
    if(!player.resources) player.resources = {ore:new Decimal(0),herb:new Decimal(0),}
    //0.09↓
    if(!player.work.build) player.work.build = new Decimal(0);
    if(!player.build) player.build = {wh:new Decimal(1),};
    if(!player.build.wt) player.build.wt = {status:'none',progress:new Decimal(0),prog_max:new Decimal(1),};
    if(!player.build.tda) player.build.tda = {level:new Decimal(0),price:new Decimal(1),effect:new Decimal(1)};
    //0.11↓
    if(!player.achievement) player.achievement = {total:0,list:{}};
    //0.13↓
    if(!player.influ) player.influ ={points:new Decimal(0),times:new Decimal(0),};
    if(!player.time.reseting) player.time.reseting = 0;
    //0.14↓
    if(!player.display.subtab) player.display.subtab ={influ:"mile",};
    if(!player.influ.miles) player.influ.miles = {};
}//最多同时兼容10个版本
function complete_achievements(){
    //0.11↓
    let MR=player.family.maxrealm;
    if(MR>=3) getAchievement(5);
    if(MR>=4) getAchievement(6);
    if(MR>=5) getAchievement(11);
    if(MR>=6) getAchievement(16);
    if(MR>=7) getAchievement(18);
    if(MR>=8) getAchievement(19);
    let EP=player.explore.prog;
    if(EP>=1) getAchievement(9);
    if(EP>=4) getAchievement(10);
    if(EP>=12) getAchievement(17);

    if(player.build.tda.level.gte(1)) getAchievement(14);
    if(player.build.tda.level.gte(13)) getAchievement(20);

    if(player.resources.herb.gt(0)) getAchievement(15);
}
const tickspeed = 50;
function prepareGame(){
    //load everything
    //if illegal reset
    try{load_from_local()}
    catch(error) {console.error("加载本地存档时出错！");
        console.error(error);}
    complete_data();//补全数据

    loadGamePage();//游戏所有懒更新

    complete_achievements();//补全成就
    
    let lastTime = Date.now();
    let cnt_t = 0,sum_t = 0,adt = 0.2;
    setInterval(()=>{
        let now = Date.now();
        let dt = (now - lastTime);
        cnt_t += 1,sum_t += dt;
        if(cnt_t >= 10){
            cnt_t = 0;
            adt = sum_t;
            sum_t = 0;
        }//
        lastTime = now;
        if(dt>=1000) dt=1000;
        updateGame(dt / 1000);
        renderGame(adt / 10000); 
    },1000/tickspeed);
}

window.prepareGame = prepareGame;
function loadGamePage(){
    updateRealmcap();
    renderFamilyMembers();
    renderExploreLocation();
    LoadAchievement();
    updateVersionTab();
    RefreshLockedContent();
    ReloadInfluMilestones();
}
const SUBTAB_TABS = ["influ"];
function updateVersionTab(){
    document.getElementById("cur_version").innerText = GAME_VERSION;
    document.getElementById("loading_screen").style.display='none';
    
    document.getElementById(`${player.display.tab}_button`).classList.add("tab_button_active");
    document.getElementById(`${player.display.tab}_content`).style.display = 'block';
    for(let t=0;t<SUBTAB_TABS.length;t+=1){
        document.getElementById(`${SUBTAB_TABS[t]}_${player.display.subtab[SUBTAB_TABS[t]]}_button`).classList.add("subtab_button_active");
        document.getElementById(`${SUBTAB_TABS[t]}_${player.display.subtab[SUBTAB_TABS[t]]}_content`).style.display = 'block';
    }
}
const REALM_DATA = [
    ["微尘级初等",'basic',1e-4,1e-5,0.1,0],
    ["微尘级高等",'basic',5e-5,1e-5,0.2,1],
    ["微尘级巅峰",'basic',2e-5,1e-5,0.4,2],
    ["万物级初等",'basic2',2e-6,1e-6,1,3],
    ["万物级高等",'basic2',6e-7,1e-6,2,4],
    ["万物级巅峰",'basic2',3e-7,1e-6,4,5],
    ["潮汐级初等",'basic3',4e-8,1e-7,10,6],
    ["潮汐级高等",'basic3',1e-8,1e-7,20,7],
    ["潮汐级巅峰",'basic3',1e-9,1e-7,40,8],

]//等级名，颜色，突破率，死亡率，工时，境界编号
function update_game_spd(){
    player.time.spd = (new Decimal(300)).mul(player.build.tda.effect);
    //player.time.spd = player.time.spd.mul(1.03);
}

function updateGame(dt){
    //dt:现实中实际经过秒数
    //一切计算更新
    update_game_spd();
    player.time.cur = player.time.cur.add(player.time.spd.mul(dt));
    if(player.time.cur.gte(5.4e8))  getAchievement(21);
    update_family(dt);
    update_work(dt);
    update_explore(dt);
    update_building(dt);
    player.time.save += dt;
    if(player.time.save >= 30) save_to_local();
}
function update_family(dt){
    update_family_rdata();
    calculate_family_bd(player.time.spd.mul(dt));//break&death
    
}
function update_family_rdata(){
    let wh_n = new Decimal(0),cnt_n = new Decimal(0);//计数
    let wh_bonus = (new Decimal(1.01)).pow(player.achievement.total);//成就加成
    wh_bonus = wh_bonus.mul(player.influ.points.mul(2).add(1).ln().add(1));//影响力-工时加成(WIP/0.14待删除)
    for(let i=0;i<=player.family.realmcap;i+=1){
        player.family.rdata[i] ||= {};
        if(player.family.rdata[i].timedtb == undefined) player.family.rdata[i].timedtb = {
            wk:new Decimal(60),
            rt:new Decimal(60),
            ct:new Decimal(60),
        };
        player.family.rdata[i].br = new Decimal(REALM_DATA[i][2]).mul(player.family.rdata[i].timedtb.ct.div(60).pow(0.8)).mul(player.explore.b_mul);//修炼时间乘数 | 探索乘数
        player.family.rdata[i].br = player.family.rdata[i].br.mul(player.resources.herb.mul(1e4).div(player.family.stats.cnt.add(0.01)).add(1).ln().pow(0.8).mul(0.1).add(1));//灵药乘数
        player.family.rdata[i].dd = new Decimal(REALM_DATA[i][3]).mul(player.family.rdata[i].timedtb.rt.add(2).div(62).pow(-0.8));
        player.family.rdata[i].wk = new Decimal(REALM_DATA[i][4]).mul(player.family.rdata[i].timedtb.wk).mul(wh_bonus);//默认60h工作/d

        //以后这里会有乘数
        //player.family.rdata[i].wk = player.family.rdata[i].wk.div(player.family.rdata[i].dd.mul(player.time.spd).add(1));
        wh_n = wh_n.add(player.family.rdata[i].wk.mul(player.family.cats[i]));
        cnt_n = cnt_n.add(player.family.cats[i])
    }
    player.family.stats.wh = wh_n;
    player.family.stats.cnt = cnt_n;

}
let p_cats = [];
let brate,drate,bf,df;
function calculate_family_bd(gt){//gametime passed
    //console.log(gt);
    for(let i=0;i<=player.family.maxrealm+1;i+=1) p_cats[i]=player.family.cats[i];
    for(let i=player.family.maxrealm;i>=0;i-=1){
        if(player.time.reseting) continue;//重置中
        brate = player.family.rdata[i].br.mul(gt);
        drate = player.family.rdata[i].dd.mul(gt);
        if(brate.gt(brate.div(brate.add(drate)))) brate = brate.div(brate.add(drate));
        brate = brate.mul(p_cats[i]);
        bf =brate.floor();
        if(brate.sub(bf).gt(Math.random())) brate=bf.add(1);
        else brate = bf;
        //突破
        if(i==player.family.realmcap) continue;//境界硬上限
        if(brate.gt(0)){
            if(i==player.family.maxrealm){
                player.family.maxrealm += 1;//扩展境界最大值
                player.family.cats[i+1] = brate;
                renderFamilyMembers();
                let MR = player.family.maxrealm;
                if(MR==3) getAchievement(5);
                if(MR==4) getAchievement(6);
                if(MR==5) getAchievement(11);
                if(MR==6) getAchievement(16);
                if(MR==7) getAchievement(18);
                if(MR==8) getAchievement(19);
            }
            else player.family.cats[i+1] = player.family.cats[i+1].add(brate);
            player.family.cats[i] = player.family.cats[i].sub(brate);
        }
    }//突破计算
    for(let i=player.family.maxrealm;i>=0;i-=1){
        if(player.time.reseting) continue;//重置中
        brate = player.family.rdata[i].br.mul(gt);
        drate = player.family.rdata[i].dd.mul(gt);
        if(drate.gt(drate.div(brate.add(drate)))) drate = drate.div(brate.add(drate));
        drate = drate.mul(p_cats[i]);
        df =drate.floor();
        if(drate.sub(df).gt(Math.random())) drate=df.add(1);
        else drate = df;
        //死亡
        if(drate.gt(0)){
            player.family.cats[i] = player.family.cats[i].sub(drate);
        }
    }//死亡计算

    if(player.time.reseting) return;//重置中
    let nrate = player.family.birt.mul(gt);
    let nf=nrate.floor();
    if(nrate.sub(nf).gt(Math.random())) nrate=nf.add(1);
    else nrate = nf;
    player.family.cats[0] = player.family.cats[0].add(nrate);
    //计算出生
}
function update_work(){
    //work_reproduce
    let reproduce_workhour = player.family.stats.wh.mul(player.work.reproduce);//wh/w
    player.display.birt.wh = format_number(reproduce_workhour)+ 'wh/w\'';
    reproduce_workhour = reproduce_workhour.div(10800);//wh/m
    reproduce_workhour = reproduce_workhour.div(1920);//c/m(这一步可能后续加强?)

    player.display.birt.basic = format_chance_time(reproduce_workhour);
    player.display.birt.scn=0;
    if(reproduce_workhour.gt(1/60)){
        reproduce_workhour = reproduce_workhour.mul(60).pow(0.6).div(60);
        player.display.birt.scn=1;
        player.display.birt.sc1 = format_chance_time(reproduce_workhour);
        getAchievement(12);
    }// 1p/h一重软上限
    else player.display.birt.sc1 = "";
    player.family.birt = reproduce_workhour;// p/m单位
}
function get_member(){
    player.family.cats[0]=player.family.cats[0].add(player.family.stats.wh.div(10).add(3).log10().mul(2).mul(player.influ.times.add(1).min(10)).round());
    getAchievement(1);
}
window.get_member = get_member;
function get_save_string() {
    const save = JSON.stringify(player, function (key, value) {
        // 用 this[key] 拿到原始对象，而不是已被 toJSON 处理过的 value
        const original = this[key];
        if (original instanceof Decimal) {
            return { __decimal__: original.toString() };
        }
        return value;
    });
    return btoa(encodeURIComponent(save));
}
function load_from_save(save) {
    console.log("load_from_save 收到:", typeof save, save && save.slice ? save.slice(0, 60) : save);
    const json = decodeURIComponent(atob(save));
    player = JSON.parse(json, function (key, value) {
        if (value && typeof value === "object" && typeof value.__decimal__ === "string") {
            return new Decimal(value.__decimal__);
        }
        return value;
    });
    complete_data();
    complete_achievements();
    
    save_to_local();
    
    updateRealmcap();
    renderFamilyMembers();
    renderExploreLocation();
    LoadAchievement();
    updateVersionTab();
    RefreshLockedContent();
}
const SAVE_KEY = 'Kuro_Family_Local_Save';
function save_to_local(){
    player.time.save = 0;
    localStorage.setItem(SAVE_KEY,get_save_string());
}
window.save_to_local = save_to_local;
function load_from_local(){
    let item = localStorage.getItem(SAVE_KEY);
    if(item == null) return;
    load_from_save(item);
}
window.player = player;
window.save_to_local = save_to_local;

function hard_reset() {
    const CONFIRM_TEXT = "Goodbye,Kuro_family";   // 想改成什么就改什么
    const input = prompt(
        `确定要硬重置吗？\n所有进度将永久丢失，无法恢复。\n\n请输入 "${CONFIRM_TEXT}" 以确认：`
    );
    if (input === null) return; 
    if (input !== CONFIRM_TEXT) {
        alert("已取消硬重置……果然还是不想离开吧。");
        return;
    }
    try {
        localStorage.clear();
    } catch (e) {
        console.error("硬重置失败:", e);
        alert("清空存档失败，请手动清除浏览器数据。");
        return;
    }
    location.reload();
}
window.hard_reset = hard_reset;
function format_timestamp(d = new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
         + `_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}
function save_to_file() {
    const data = get_save_string();  
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Kuro_family ${GAME_VERSION} ${format_timestamp()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}


window.save_to_file = save_to_file;

document.getElementById("load-file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            load_from_save(reader.result);
            console.log("读档成功");
        } catch (err) {
            console.error(err);
            alert("存档无效");
        }
    };
    reader.readAsText(file);

});



export {player,REALM_DATA};
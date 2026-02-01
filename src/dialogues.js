"use strict";

const dialogues = {};

class Dialogue {
    constructor({ name, 
                  starting_text = `与 ${name} 对话`, 
                  ending_text = `返回`, 
                  is_unlocked = true, 
                  is_finished = false, 
                  textlines = {}, 
                  location_name,
    }) 
    {
        this.name = name; //displayed name, e.g. "Village elder"
        this.starting_text = starting_text;
        this.ending_text = ending_text; //text shown on option to finish talking
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished; //separate bool to remove dialogue option if it's finished
        this.textlines = textlines; //all the lines in dialogue

        this.location_name = location_name; //this is purely informative and wrong value shouldn't cause any actual issues
    }
}

class Textline {
    constructor({name,
                 text,
                 getText,
                 is_unlocked = true,
                 is_finished = false,
                 unlocks = {textlines: [],
                            locations: [],
                            dialogues: [],
                            traders: [],
                            stances: [],
                            flags: [],
                            items: [],
                            spec: [],
                            },
                locks_lines = {},
                otherUnlocks,
                required_flags,
            }) 
    {
        this.name = name; // displayed option to click, don't make it too long
        this.text = text; // what's shown after clicking
        this.getText = getText || function(){return this.text;};
        this.otherUnlocks = otherUnlocks || function(){return;};
        this.is_unlocked = is_unlocked;
        this.is_finished = is_finished;
        this.unlocks = unlocks || {};
        //this.spec = spec;
        
        this.unlocks.textlines = unlocks.textlines || [];
        this.unlocks.locations = unlocks.locations || [];
        this.unlocks.dialogues = unlocks.dialogues || [];
        this.unlocks.traders = unlocks.traders || [];
        this.unlocks.stances = unlocks.stances || [];
        this.unlocks.flags = unlocks.flags || [];
        this.unlocks.items = unlocks.items || []; //not so much unlocks as simply items that player will receive
        
        this.required_flags = required_flags;

        this.locks_lines = locks_lines;
        //related text lines that get locked; might be itself, might be some previous line 
        //e.g. line finishing quest would also lock line like "remind me what I was supposed to do"
        //should be alright if it's limited only to lines in same Dialogue
        //just make sure there won't be Dialogues with ALL lines unavailable
    }
}

(function(){
    dialogues["village elder"] = new Dialogue({
        name: "village elder",
        textlines: {
            "hello": new Textline({
                name: "Hello?",
                text: "Hello. Glad to see you got better",
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["what happened", "where am i", "dont remember", "about"]}],
                },
                locks_lines: ["hello"],
            }),
            "what happened": new Textline({
                name: "My head hurts.. What happened?",
                text: `Some of our people found you unconscious in the forest, wounded and with nothing but pants and an old sword, so they brought you to our village. `
                + `It would seem you were on your way to a nearby town when someone attacked you and hit you really hard in the head.`,
                is_unlocked: false,
                locks_lines: ["what happened", "where am i", "dont remember"],
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
                },
            }),
            "where am i": new Textline({
                name: "Where am I?",
                text: `Some of our people found you unconscious in the forest, wounded and with nothing but pants and an old sword, so they brought you to our village. `
                + `It would seem you were on your way to a nearby town when someone attacked you and hit you really hard in the head.`,
                is_unlocked: false,
                locks_lines: ["what happened", "where am i", "dont remember"],
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
                },
            }),
            "dont remember": new Textline({
                name: "I don't remember how I got here, what happened?",
                text: `Some of our people found you unconscious in the forest, wounded and with nothing but pants and an old sword, so they brought you to our village. `
                + `It would seem you were on your way to a nearby town when someone attacked you and hit you really hard in the head.`,
                is_unlocked: false,
                locks_lines: ["what happened", "where am i", "dont remember"],
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
                },
            }),
            "about": new Textline({
                name: "Who are you?",
                text: "I'm the unofficial leader of this village. If you have any questions, come to me",
                is_unlocked: false,
                locks_lines: ["about"]
            }),
            "ask to leave 1": new Textline({
                name: "Great... Thank you for help, but I think I should go there then. Maybe it will help me remember more.",
                text: "Nearby lands are dangerous and you are still too weak to leave. Do you plan on getting ambushed again?",
                is_unlocked: false,
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["need to"]}],
                },
                locks_lines: ["ask to leave 1"],
            }),
            "need to": new Textline({
                name: "But I want to leave",
                text: `You first need to recover, to get some rest and maybe also training, as you seem rather frail... Well, you know what? Killing a few wolf rats could be a good exercise. `
                        +`You could help us clear some field of them, how about that?`,
                is_unlocked: false,
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["rats", "ask to leave 2", "equipment"]}],
                    locations: ["Infested field"],
                    activities: [{location:"Village", activity:"weightlifting"}],
                },
                locks_lines: ["need to"],
            }),
            "equipment": new Textline({
                name: "Is there any way I could get a weapon and proper clothes?",
                text: `We don't have anything to spare, but you can talk with our trader. He should be somewhere nearby. `
                        +`If you need money, try selling him some rat remains. Fangs, tails or pelts, he will buy them all. I have no idea what he does with this stuff...`,
                is_unlocked: false,
                locks_lines: ["equipment"],
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["money"]}],
                    traders: ["village trader"]
                }
            }),
            "money": new Textline({
                name: "Are there other ways to make money?",
                text: "You could help us with some fieldwork. I'm afraid it won't pay too well.",
                is_unlocked: false,
                locks_lines: ["money"],
                unlocks: {
                    activities: [{location: "Village", activity: "fieldwork"}],
                }
            }),
            "ask to leave 2": new Textline({
                name: "Can I leave the village?",
                text: "We talked about this, you are still too weak",
                is_unlocked: false,
            }),
            "rats": new Textline({
                name: "Are wolf rats a big issue?",
                text: `Oh yes, quite a big one. Not literally, no, though they are much larger than normal rats... `
                        +`They are a nasty vermin that's really hard to get rid of. And with their numbers they can be seriously life-threatening. `
                        +`Only in a group though, single wolf rat is not much of a threat`,
                is_unlocked: false,
            }),
            "cleared field": new Textline({ //will be unlocked on clearing infested field combat_zone
                name: "I cleared the field, just as you asked me to",
                text: `You did? That's good. How about a stronger target? Nearby cave is just full of this vermin. `
                        +`Before that, maybe get some sleep? Some folks prepared that shack over there for you. It's clean, it's dry, and it will give you some privacy. `
                        +`Oh, and before I forget, our old craftsman wanted to talk to you.`,
                is_unlocked: false,
                unlocks: {
                    locations: ["Nearby cave", "Infested field", "Shack"],
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 3"]}],
                    dialogues: ["old craftsman"],
                },
                locks_lines: ["ask to leave 2", "cleared field"],
            }),
            "ask to leave 3": new Textline({
                name: "Can I leave the village?",
                text: "You still need to get stronger.",
                unlocks: {
                    locations: ["Nearby cave", "Infested field"],
                    dialogues: ["old craftsman"],
                },
                is_unlocked: false,
            }),
            "cleared cave": new Textline({
                name: "I cleared the cave. Most of it, at least",
                text: `Then I can't call you "too weak" anymore, can I? You are free to leave whenever you want, but still, be careful. You might also want to ask the guard for some tips about the outside. He used to be an adventurer.`,
                is_unlocked: false,
                unlocks: {
                    textlines: [{dialogue: "village elder", lines: ["ask to leave 4"]}],
                    locations: ["Forest road", "Infested field", "Nearby cave"],
                    dialogues: ["village guard"],
                },
                locks_lines: ["ask to leave 3", "rats", "cleared cave"],
            }),
            "ask to leave 4": new Textline({
                name: "Can I leave the village?",
                text: "You are strong enough, you can leave and come whenever you want.",
                is_unlocked: false,
                unlocks: {
                    locations: ["Forest road", "Infested field", "Nearby cave"],
                    dialogues: ["village guard", "old craftsman"],
                },
            }),
            "new tunnel": new Textline({
                name: "I found an even deeper tunnel in the cave",
                text: "The what?... I have a bad feeling about this, you better avoid it until you get better equipment. Don't forget to bring a good shield too.",
                is_unlocked: false,
                locks_lines: ["new tunnel"],
            }),
        }
    });

    dialogues["old craftsman"] = new Dialogue({
        name: "old craftsman",
        is_unlocked: false,
        textlines: {
            "hello": new Textline({
                name: "Hello, I heard you wanted to talk to me?",
                text: "Ahh, good to see you traveler. I just thought of a little something that could be of help for someone like you. See, young people this days "+
                "don't care about the good old art of crafting and prefer to buy everything from the store, but I have a feeling that you just might be different. "+
                "Would you like a quick lesson?",
                unlocks: {
                    textlines: [{dialogue: "old craftsman", lines: ["learn", "leave"]}],
                },
                locks_lines: ["hello"],
            }),
            "learn": new Textline({
                name: "Sure, I'm in no hurry.",
                text: "Ahh, that's great. Well then... \n*[Old man spends some time explaining all the important basics of crafting and providing you with tips]*\n"+
                "Ahh, and before I forget, here, take these. They will be helpful for gathering necessary materials.",
                unlocks: {
                    textlines: [{dialogue: "old craftsman", lines: ["remind1", "remind2", "remind3"]}],
                    items: ["Old pickaxe" ,"Old axe", "Old sickle"],
                    flags: ["is_gathering_unlocked", "is_crafting_unlocked"],
                },
                locks_lines: ["learn","leave"],
                is_unlocked: false,
            }),
            "leave": new Textline({
                name: "I'm not interested.",
                text: "Ahh, I see. Maybe some other time then, when you change your mind, hmm?",
                is_unlocked: false,
            }),
            
            "remind1": new Textline({
                name: "Could you remind me how to create equipment for myself?",
                text: "Ahh, of course. Unless you are talking about something simple like basic clothing, then you will first need to create components that can then be assembled together. "+
                "For weapons, you generally need a part that you use to hit an enemy and a part that you hold in your hand. For armor, you will need some actual armor and then something softer to wear underneath, "+
                "which would mostly mean some clothes.",
                is_unlocked: false,
            }),
            "remind2": new Textline({
                name: "Could you remind me how to improve my creations?",
                text: "Ahh, that's simple, you just need more experience. This alone will be a great boon to your efforts. For equipment, you might also want to start with better components. "+
                "After all, even with the most perfect assembling you can't turn a bent blade into a legendary sword.",
                is_unlocked: false,
            }),
            "remind3": new Textline({
                name: "Could you remind me how to get crafting materials?",
                text: "Ahh, there's multiple ways of that. You can gain them from fallen foes, you can gather them around, or you can even buy them if you have some spare coin.",
                is_unlocked: false,
            }),
        }
    });

    dialogues["village guard"] = new Dialogue({
        name: "village guard",
        is_unlocked: false,
        textlines: {
            "hello": new Textline({
                name: "Hello?",
                text: "Hello. I see you are finally leaving, huh?",
                unlocks: {
                    textlines: [{dialogue: "village guard", lines: ["tips", "job"]}],
                },
                locks_lines: ["hello"],
            }),
            "job": new Textline({
                name: "Do you maybe have any jobs for me?",
                is_unlocked: false,
                text: "You are somewhat combat capable now, so how about you help me and the boys on patrolling? Not much happens, but it pays better than working on fields",
                unlocks: {
                    activities: [{location:"Village", activity:"patrolling"}],
                },
                locks_lines: ["job"],
            }),
            "tips": new Textline({
                name: "Can you give me any tips for the journey?",
                is_unlocked: false,
                text: `First and foremost, don't rush. It's fine to spend some more time here, to better prepare yourself. `
                +`There's a lot of dangerous animals out there, much stronger than those damn rats, and in worst case you might even run into some bandits. `
                +`If you see something that is too dangerous to fight, try to run away.`,
                unlocks: {
                    textlines: [{dialogue: "village guard", lines: ["teach"]}],
                },
            }),
            "teach": new Textline({
                name: "Could you maybe teach me something that would be of use?",
                is_unlocked: false,
                text: `Lemme take a look... Yes, it looks like you know some basics. Do you know any proper techniques? No? I thought so. I could teach you the most standard three. `
                +`They might be more tiring than fighting the "normal" way, but if used in a proper situation, they will be a lot more effective. Two can be easily presented through `
                + `some sparring, so let's start with it. The third I'll just have to explain. How about that?`,
                unlocks: {
                    locations: ["Sparring with the village guard (quick)", "Sparring with the village guard (heavy)"],
                },
                locks_lines: ["teach"],
            }),
            "quick": new Textline({
                name: "So about the quick stance...",
                is_unlocked: false,
                text: `It's usually called "quick steps". As you have seen, it's about being quick on your feet. `
                +`While power of your attacks will suffer, it's very fast, making it perfect against more fragile enemies`,
                otherUnlocks: () => {
                    if(dialogues["village guard"].textlines["heavy"].is_finished) {
                        dialogues["village guard"].textlines["wide"].is_unlocked = true;
                    }
                },
                locks_lines: ["quick"],
                unlocks: {
                    stances: ["quick"]
                }
            }),
            "heavy": new Textline({
                name: "So about the heavy stance...",
                is_unlocked: false,
                text: `It's usually called "crushing force". As you have seen, it's about putting all your strength in attacks. ` 
                +`It will make your attacks noticeably slower, but it's a perfect solution if you face an enemy that's too tough for normal attacks`,
                otherUnlocks: () => {
                    if(dialogues["village guard"].textlines["quick"].is_finished) {
                        dialogues["village guard"].textlines["wide"].is_unlocked = true;
                    }
                },
                locks_lines: ["heavy"],
                unlocks: {
                    stances: ["heavy"]
                }
            }),
            "wide": new Textline({
                name: "What's the third technique?",
                is_unlocked: false,
                text: `It's usually called "broad arc". Instead of focusing on a single target, you make a wide swing to hit as many as possible. ` 
                +`It might work great against groups of weaker enemies, but it will also significantly reduce the power of your attacks and will be even more tiring than the other two stances.`,
                locks_lines: ["wide"],
                unlocks: {
                    stances: ["wide"]
                }
            }),
        }
    });

    dialogues["gate guard"] = new Dialogue({
        name: "gate guard",
        textlines: {
            "enter": new Textline({
                name: "Hello, can I get in?",
                text: "The town is currently closed to everyone who isn't a citizen or a guild member. No exceptions.",
            }), 
        }
    });
    dialogues["suspicious man"] = new Dialogue({
        name: "suspicious man",
        textlines: {
            "hello": new Textline({ 
                name: "Hello? Why are you looking at me like that?",
                text: "Y-you! You should be dead! *the man pulls out a dagger*",
                unlocks: {
                    locations: ["Fight off the assailant"],
                },
                locks_lines: ["hello"],
            }), 
            "defeated": new Textline({ 
                name: "What was that about?",
                is_unlocked: false,
                text: "I... We... It was my group that robbed you. I thought you came back from your grave for revenge... Please, I don't know anything. "
                +"If you want answers, ask my boss. He's somewhere in the town.",
                locks_lines: ["defeated"],
                unlocks: {
                    textlines: [{dialogue: "suspicious man", lines: ["behave"]}],
                },
            }), 
            "behave": new Textline({ 
                name: "Are you behaving yourself?",
                is_unlocked: false,
                text: "Y-yes! Please don't beat me again!",
                locks_lines: ["defeated"],
            }), 
        }
    });
    dialogues["farm supervisor"] = new Dialogue({
        name: "farm supervisor",
        textlines: {
            "hello": new Textline({ 
                name: "Hello",
                text: "Hello stranger",
                unlocks: {
                    textlines: [{dialogue: "farm supervisor", lines: ["things", "work", "animals", "fight", "fight0"]}],
                },
                locks_lines: ["hello"],
            }),
            "work": new Textline({
                name: "Do you have any work with decent pay?",
                is_unlocked: false,
                text: "We sure could use more hands. Feel free to help my boys on the fields whenever you have time!",
                unlocks: {
                    activities: [{location: "Town farms", activity: "fieldwork"}],
                },
                locks_lines: ["work"],
            }),
            "animals": new Textline({
                name: "Do you sell anything?",
                is_unlocked: false,
                text: "Sorry, I'm not allowed to. I could however let you take some stuff in exchange for physical work, and it just so happens our sheep need shearing.",
                required_flags: {yes: ["is_gathering_unlocked"]},
                unlocks: {
                    activities: [{location: "Town farms", activity: "animal care"}],
                },
                locks_lines: ["animals"],
            }),
            "fight0": new Textline({
                name: "Do you have any task that requires some good old violence?",
                is_unlocked: false,
                text: "I kinda do, but you don't seem strong enough for that. I'm sorry.",
                required_flags: {no: ["is_deep_forest_beaten"]},
            }),
            "fight": new Textline({
                name: "Do you have any task that requires some good old violence?",
                is_unlocked: false,
                text: "Actually yes. There's that annoying group of boars that keep destroying our fields. "
                + "They don't do enough damage to cause any serious problems, but I would certainly be calmer if someone took care of them. "
                + "Go to the forest and search for a clearing in north, that's where they usually roam when they aren't busy eating our crops."
                + "I can of course pay you for that, but keep in mind it won't be that much, I'm running on a strict budget here.",
                required_flags: {yes: ["is_deep_forest_beaten"]},
                unlocks: {
                    locations: ["Forest clearing"],
                },
                locks_lines: ["fight"],
            }),
            "things": new Textline({
                is_unlocked: false,
                name: "How are things around here?",
                text: "Nothing to complain about. Trouble is rare, pay is good, and the soil is as fertile as my wife!",
                unlocks: {
                    textlines: [{dialogue: "farm supervisor", lines: ["animals", "fight", "fight0"]}],
                }
            }), 
            "defeated boars": new Textline({
                is_unlocked: false,
                name: "I took care of those boars",
                text: "Really? That's great! Here, this is for you.",
                locks_lines: ["defeated boars"],
                unlocks: {
                    money: 1000,
                }
            }), 
        }

    });

    //NekoRPG dialogues below
    dialogues["猫妖"] = new Dialogue({
        name: "猫妖",
        textlines: {
            "你是谁": new Textline({
                name: "你是谁？",
                text: "这里是猫妖!现在，请让我简要为你介绍一下这里",
                unlocks: {
                    textlines: [{dialogue: "猫妖", lines: ["背景故事"]}],
                },
                locks_lines: ["你是谁"],
            }),
            "背景故事": new Textline({
                is_unlocked: false,
                name: "这里是哪里？",
                text: "太初之时，诞有一方大陆名为血洛。<br>"+"血洛大陆能量充盈，孕育出诸多种族与生命。<br>"+"在这方大陆，强者，可以肆意将无数弱者踩在脚下！<br>而这里，是血洛大陆-司雍世界-燕岗领-纳家。",

                
                unlocks: {
                    textlines: [{dialogue: "猫妖", lines: ["Neko是谁"]}],
                },
                
                locks_lines: ["背景故事"],
            }),
            "Neko是谁": new Textline({
                is_unlocked: false,
                name: "Neko又是谁？",
                text: "纳可，燕岗城纳家一个平平无奇的小丫头。<br>"+
                "这一天，当纳可刚结束了早上的修行<br>"+
                "却发现和自己一同长大的姐姐纳娜米不见了。<br>"+
                "当从家族中得知，纳娜米昨天外出历练，至今未回时，纳可已经顾不上思考<br>"+
                "她决然地独自一人离开家族，寻找纳娜米的踪迹。<br>"+
                "我们的故事，就从这里开始…",
                
                unlocks: {
                    
                    flags: ["is_gathering_unlocked", "is_crafting_unlocked"],
                    locations: ["纳家练兵场 - 1"],
                },
                
                locks_lines: ["Neko是谁"],
            }),
            "MT10_clear": new Textline({
                is_unlocked: false,
                name: "打开大门",
                text: "在[V0.13]中，该对话理论上不会解锁。<br>" +
                "如果是旧版本更新存档，可使用此条对话以解锁后续区域。<br>" +
                "MOD - NekoRPG作者：超自然生物吐火研究协会 - 纱雪(持续呜呜中=w=) <br>" +
                "原作：Yet Another Idle RPG - miktaew <br>" +
                "设定来自： 我吃西红柿《吞噬星空》,千夜《纳可物语》 <br>",
                unlocks: {
                    locations: ["燕岗城"],
                },
                locks_lines: ["MT10_clear"],
            })
            // "what happened": new Textline({
            //     name: "My head hurts.. What happened?",
            //     text: `Some of our people found you unconscious in the forest, wounded and with nothing but pants and an old sword, so they brought you to our village. `
            //     + `It would seem you were on your way to a nearby town when someone attacked you and hit you really hard in the head.`,
            //     is_unlocked: false,
            //     locks_lines: ["what happened", "where am i", "dont remember"],
            //     unlocks: {
            //         textlines: [{dialogue: "village elder", lines: ["ask to leave 1"]}],
            //     },
            // }),
        }
    });
    dialogues["秘法石碑 - 1"] = new Dialogue({
        name: "秘法石碑 - 1",
        textlines: {
            "Speed": new Textline({
                is_unlocked: false,
                name: "参悟融血·疾",
                text: "融血·疾 已加入可选秘法！",
                locks_lines: ["Speed"],
                unlocks: {
                    stances: ["MB_Speed"],
                },
            }), 
            "Power": new Textline({
                is_unlocked: false,
                name: "参悟融血·锐",
                text: "融血·锐 已加入可选秘法！",

                locks_lines: ["Power"],
                unlocks: {
                    stances: ["MB_Power"],
                },
            }), 
        }
    });
    
    dialogues["路人甲"] = new Dialogue({
        name: "路人甲",
        textlines: {
            "shop": new Textline({ 
                is_unlocked: false,
                name: "你好？这附近有商店吗？",
                text: "小丫头，刚从家族里出来的吧？<br>" +
                "燕岗城中心寸土寸金，商店一般都开在16环外。<br>" +
                "距离这里最近的一处是连锁店“燕岗杂货铺”<br>"+"往东再走一里半即可到达",

                unlocks: {
                    traders: ["燕岗杂货铺"],
                },
                locks_lines: ["shop"],
            }), 
        }
    });
    
    dialogues["百兰"] = new Dialogue({
        name: "百兰",
        textlines: {
            "before": new Textline({ 
                is_unlocked: true,
                name: "请问你是？",
                text: "哪来的小丫头，你这点修为一个人出门历练，<br>真的没问题吗？外面的荒兽可是会吃人的。",

                unlocks: {
                    textlines: [{dialogue: "百兰", lines: ["before2"]}],
                },
                locks_lines: ["before"],
            }),
            "before2": new Textline({ 
                is_unlocked: false,
                name: "这位大叔，看不起人可是不对的哦。",
                text: "嘿，谁是大叔啊，信不信我——",

                unlocks: {
                    locations: ["燕岗近郊 - 0"],
                },
                locks_lines: ["before2"],
            }), 
            "defeat": new Textline({ 
                is_unlocked: false,
                name: "等等，大叔你手上拿的是什么？",
                text: "这，这是地图，<br>绘制的是最近新发现的一处藏宝地。",

                unlocks: {
                    textlines: [{dialogue: "百兰", lines: ["defeat2"]}],
                },
                locks_lines: ["defeat"],
            }), 
            "defeat2": new Textline({ 
                is_unlocked: false,
                name: "有更详细的信息吗？",
                text: "有的有的，听说里面有不少好东西，<br>危险度还挺高的，鲜少有人能够活着出来。",

                unlocks: {
                    textlines: [{dialogue: "百兰", lines: ["defeat3"]}],
                },
                locks_lines: ["defeat2"],
            }), 
            "defeat3": new Textline({ 
                is_unlocked: false,
                name: "交出这个，你可以走啦。",
                text: "……也罢。<br>（唉，这次居然栽在一个小丫头手上，<br>运气是真的差，回头要如何和家族交待……）",

                unlocks: {
                    items: [{item_name:"地图-藏宝地"}],
                    //items: ["地图-藏宝地"],
                    locations: ["燕岗近郊 - 1"],
                },
                locks_lines: ["defeat3"],
            }),
            "V0.21 Recover": new Textline({ 
                is_unlocked: false,
                name: "V0.21更新存档请点击此提示获取下一区域访问权限",
                text: "已开启3 - 1区域！",

                unlocks: {
                    locations: ["燕岗近郊 - 1"],
                },
                locks_lines: ["V0.21 Recover"],
            }),
        }
    });
    
    dialogues["地宫老人"] = new Dialogue({
        name: "地宫老人",
        textlines: {
            "dig": new Textline({ 
                is_unlocked: true,
                name: "唔..老人家，想要说什么啊？",
                text: "有些时候，直接打怪收效甚微。<br>" +
                "但是当你用你的镐子取巧，<br>" +
                "便可能产生意想不到的奇效。”<br>"+"不过，也不要贪多...<br>边际收益递减在这里展现的淋漓尽致。",
                
                locks_lines: ["dig"],
            }),
        }
    });

    
    dialogues["纳娜米"] = new Dialogue({
        name: "纳娜米",
        textlines: {
            "1": new Textline({ 
                is_unlocked: true,
                name: "姐姐！",
                text: "可可？！<br>你为什么在这里，这里很危险，<br>听姐姐的话，别胡闹，快回家族去。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米", lines: ["2"]}],
                },
                locks_lines: ["1"],
            }),
            "2": new Textline({ 
                is_unlocked: false,
                name: "不。如果是听话的孩子，这种时候不可能丢下姐姐不管的。",
                text: "……怪姐姐没有说清楚。<br>其实这次探险，是纳布家主默许的。<br>或者说，是他有意安排我来的。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米", lines: ["3"]}],
                },
                locks_lines: ["2"],
            }),
            "3": new Textline({ 
                is_unlocked: false,
                name: "诶，诶？",
                text: "…实不相瞒，在之前的一次荒兽狩猎行动中，<br>家族遭到不明来由的偷袭，损失惨重。<br>"+
                "偷袭者实力非常强大，<br>他利用自己诡异的身法和速度，<br>几乎是以摧枯拉朽般的姿态杀掉了那些族人。<br>"+
                "家主大怒，派出族中最为优秀的精英前去搜寻，<br>并最终——发现了这座藏有宝藏的地宫，<br>将消息散布出去！<br>"+
                "现在，方圆千里的大地级修行者，<br>已经陆续接到消息赶来。<br>可地宫的主人却没有什么动静。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米", lines: ["4"]}],
                },
                locks_lines: ["3"],
            }),
            "4": new Textline({ 
                is_unlocked: false,
                name: "原来是这样吗？有点吓人的感觉。那姐姐，你为什么会……",
                text: "嗯……这一次的对手非常狡猾。<br>如果家族中贸然派出天空级强者，<br>只会引起对方的警觉。<br>"+
                "所以，才会悄悄把我这个不起眼的小辈派来<br>，伪装成冒失的寻常冒险者。<br>并且，现在我的手上，有足以击杀对方的底牌。<br>"+
                "但是下面的荒兽实在太多了。<br>我这边最多只能应付几头，<br>那张底牌又无法暴露，所以才被困在这里。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米", lines: ["5"]}],
                },
                locks_lines: ["4"],
            }),
            "5": new Textline({ 
                is_unlocked: false,
                name: "交给我吧，姐姐。我们就一起，把它们通通干掉！",
                text: "不行不行，太危险了。<br>……等等，可可，你是怎么来到这里的？<br>难道上面的那头荒兽精英，被你解决了？<br>",

                unlocks: {
                    textlines: [{dialogue: "纳娜米", lines: ["6"]}],
                },
                locks_lines: ["5"],
            }),
            "6": new Textline({ 
                is_unlocked: false,
                name: "都说过了，不要小看我啊。而且，如果连这点小问题都帮不了姐姐，那还要我做什么呢。",
                text: "……<br>原来如此，小丫头不知不觉已经长大了吗……<br>好，我知道了。",

                unlocks: {
                    items: [{item_name: "纳娜米"}],
                },
                locks_lines: ["6"],
            }),
        }
    });
    
    dialogues["纳布"] = new Dialogue({
        name: "纳布",
        textlines: {
            "1": new Textline({ 
                is_unlocked: true,
                name: "父亲大人，姐姐。",
                text: "[纳布]都来了啊。可可，娜娜，这次辛苦你们了。<br>[纳娜米]可可，这次我们可是立了大功的呀！<br>城主府居然给了那么多的奖赏。",

                unlocks: {
                    textlines: [{dialogue: "纳布", lines: ["2"]}],
                },
                locks_lines: ["1"],
            }),
            "2": new Textline({ 
                is_unlocked: false,
                name: "是呀……比想象中的奖励还要丰厚很多。",
                text: "[纳布]可可，你是有什么心事吗？<br>[纳娜米]家主前辈，可可她想说的话，自己会说的。<br>不要再问了……<br>[纳布]也罢。毕竟小丫头，今年也十一岁了啊。<br>感觉怎么样？快要突破大地级了吧？",

                unlocks: {
                    textlines: [{dialogue: "纳布", lines: ["3"]}],
                },
                locks_lines: ["2"],
            }),
            "3": new Textline({ 
                is_unlocked: false,
                name: "是的……自地宫一行之后，感触很深，已经隐约触摸到了那道门槛。",
                text: "达到大地级有两种办法呢，<br>第一种是慢慢积累领悟，最终水到渠成。<br>第二种——在历练中快速突破。",

                unlocks: {
                    textlines: [{dialogue: "纳布", lines: ["4"]}],
                },
                locks_lines: ["3"],
            }),
            "4": new Textline({ 
                is_unlocked: false,
                name: "……我不想再等待了。父亲大人，姐姐，我想前往荒兽森林，找寻突破的契机。",
                text: "[纳娜米]可可……<br>[纳布]荒兽森林十分凶险，<br>但你有这份冒险的心，那为父必定支持。<br>"+
                "你在练兵场中捡破烂造的剑和盔甲，<br>从此以后就是你的了。<br>"+
                "还有一张隐藏着传送术式的护身符咒。<br>如果你遇到危险，就使用它。<br>"+
                "[纳娜米]家主前辈，荒兽森林太危险了，<br>把我之前使用的那把镭射枪交给可可吧？<br>"+
                "不行。这虽然能让可可轻松应对困境，<br>但也会少了突破所应有的压力。<br>",

                unlocks: {
                    textlines: [{dialogue: "纳布", lines: ["5"]}],
                },
                locks_lines: ["4"],
            }),
            "5": new Textline({ 
                is_unlocked: false,
                name: "父亲大人，镭射枪是什么？",
                text: "也是时候告诉你这些了。<br>这些东西，牵涉到一个传说。<br>" +
                `<span style="color:lightblue">【天外族群】</span>的传说。<br>待可可你突破到大地级，我会告诉你更多的。`,

                unlocks: {
                    textlines: [{dialogue: "纳布", lines: ["6"]}],
                },
                locks_lines: ["5"],
            }),
            "6": new Textline({ 
                is_unlocked: false,
                name: "这样吗……我明白了。那么，等着我的好消息吧。",
                text: "哼，不让姐姐省心。<br>要加油啊，小丫头。<br>……就像之前一样，一定要安然无恙回来。",

                unlocks: {
                    //items: [{item_name: "纳娜米"}],
                    locations: ["荒兽森林"],
                },
                locks_lines: ["6"],
            }),
        }
    });
    
    dialogues["清野瀑布"] = new Dialogue({
        name: "清野瀑布",
        starting_text: "注视着清野瀑布",
        textlines: {
            "wf1": new Textline({
                is_unlocked: false,
                name: "...",
                text: "父亲大人曾说，外面的世界危险而且残酷。<br>……可我不相信，我想去更远的地方看一看。",
                locks_lines: ["wf1"],
                unlocks: {
                    textlines: [{dialogue: "清野瀑布", lines: ["wf2"]}],
                },
            }), 
            "wf2": new Textline({
                is_unlocked: false,
                name: "...",
                text: "如今也算是历经了一次生死呢，<br>也知道了父亲大人的话是什么意思。",
                locks_lines: ["wf2"],
                unlocks: {
                    spec:"DeathCount-1",
                    textlines: [{dialogue: "清野瀑布", lines: ["wf3"]}],
                },
            }), 
            "wf3": new Textline({
                is_unlocked: false,
                name: "...",
                text: "也许，等真正成为强者的那一天，<br>这个愿望能够实现吧。",
                locks_lines: ["wf3"],
                unlocks: {
                    textlines: [{dialogue: "清野瀑布", lines: ["wf4"]}],
                },
            }), 
            "wf4": new Textline({
                is_unlocked: false,
                name: "瀑布外面是山，山外面是什么？",
                text: "[奇怪的声音]你在害怕什么？<br>你要成为强者！去探索外面的世界！<br>生死的历练，杀不死你，只会让你失败了回到床上！",
                locks_lines: ["wf4"],
                unlocks: {
                    textlines: [{dialogue: "清野瀑布", lines: ["wf5"]}],
                },
            }), 
            "wf5": new Textline({
                is_unlocked: false,
                name: "*不自觉地挥剑*",
                text: "身体渐渐变得越发灵活，敏捷。<br>这些日子以来，所积累下来的沉淀，<br>终于在这一刻被全部激发。！",
                locks_lines: ["wf5"],
                unlocks: {
                    textlines: [{dialogue: "清野瀑布", lines: ["wf6"]}],
                },
            }), 
            "wf6": new Textline({
                is_unlocked: false,
                name: "……发生了什么，我刚才都做了什么。",
                text: "水无心·洪水，水无心·流水，水无心·雨水 已加入可选秘法！",

                locks_lines: ["wf6"],
                unlocks: {
                    stances: ["WH_Power","WH_Speed","WH_Multi"],
                },
            }), 
        }
    });
    dialogues["纳布(江畔)"] = new Dialogue({
        name: "纳布(江畔)",
        starting_text: "与父亲纳布对话",
        textlines: {
            "jp1": new Textline({ 
                is_unlocked: false,
                name: "...",
                text: "可可！你没事吧，这身伤是怎么回事？",
                unlocks: {
                    textlines: [{dialogue: "纳布(江畔)", lines: ["jp2"]}],
                },
                
                locks_lines: ["jp1"],
            }),
            "jp2": new Textline({ 
                is_unlocked: false,
                name: "说来话长……和百家的人在外面打了一架。还好有那张符咒在呢。",
                text: "纳可将之前的事情告诉了纳布，<br>也包括自己受伤后，<br>观想清野瀑布的意外收获。<br><br>[纳布]岂有此理，百家那群混蛋！他们真是该死！<br>不过是眼红我纳家此次所得，便做出此等勾当。<br>那个百兰连大地级都不是，<br>在百家根本没什么地位，说帮他出气只不过是个可耻的借口罢了！",
                unlocks: {
                    textlines: [{dialogue: "纳布(江畔)", lines: ["jp3"]}],
                },
                
                locks_lines: ["jp2"],
            }),
            "jp3": new Textline({ 
                is_unlocked: false,
                name: "这件事……我也有一部分责任。我不该去招惹强大的百家，给家族添麻烦。",
                text: "可可，这不是你的错。<br>最近一段时间不要单独出去了，我会派人保护你。[纳可]我没关系的。父亲大人，您说过的，只有危险的地方才有机遇。",
                unlocks: {
                    textlines: [{dialogue: "纳布(江畔)", lines: ["jp4"]}],
                },
                
                locks_lines: ["jp3"],
            }),
            "jp4": new Textline({ 
                is_unlocked: false,
                name: "我能有现在的实力，也正是拜这次生死危机所赐。",
                text: "",
                unlocks: {
                    spec:"Realm-A3",
                    textlines: [{dialogue: "纳布(江畔)", lines: ["jp5"]}],
                },
                
                locks_lines: ["jp4"],
            }),
            "jp5": new Textline({ 
                is_unlocked: false,
                name: "(省略天外族群的设定)真是令人神往的世界—",
                text: "……也是时候，送你进入家族秘境磨炼了。要知道，进入纳家秘境的标准，就是实力达到大地级中期。",
                unlocks: {
                    textlines: [{dialogue: "纳布(江畔)", lines: ["jp6"]}],
                },
                
                locks_lines: ["jp5"],
            }),
            "jp6": new Textline({ 
                is_unlocked: false,
                name: "诶，家族秘境吗？",
                text: "",
                unlocks: {
                    spec:"Realm-A4",
                    locations: ["纳家秘境"],
                },
                
                locks_lines: ["jp6"],
            }),
        }
    });
    dialogues["秘境心火精灵"] = new Dialogue({
        name: "秘境心火精灵",
        textlines: {
            "xh1": new Textline({ 
                is_unlocked: true,
                name: "哼~知道我的厉害了吗？",
                text: "饶命，饶命——<br>小的只是秘境诞生的“灵”，<br>根本没有家底或者资源哇...",
                unlocks: {
                    textlines: [{dialogue: "秘境心火精灵", lines: ["xh2"]}],
                },
                
                locks_lines: ["xh1"],
            }),
            "xh2": new Textline({ 
                is_unlocked: false,
                name: "诶，在这样的核心区域，你应该也有秘境的一些权限吧",
                text: "啊对的对的！<br>我可以帮您调节秘境的灵阵功率！<br>这样您就可以得到更多的战斗领悟了！",
                unlocks: {
                    textlines: [{dialogue: "秘境心火精灵", lines: ["check"]},{dialogue: "秘境心火精灵", lines: ["powerup"]},{dialogue: "秘境心火精灵", lines: ["powerdown"]}],
                    locations: ["纳家秘境 - ∞"],
                },
                
                locks_lines: ["xh2"],
            }),
            "check": new Textline({ 
                is_unlocked: false,
                name: "现在灵阵功率开了多少哇？",
                text: "",
                unlocks: {
                    spec: "A6-check"
                },
            }),
            "powerup": new Textline({ 
                is_unlocked: false,
                name: "提高一层灵阵功率\\o/",
                text: "",
                unlocks: {
                    spec: "A6-up"
                },
            }),
            "powerdown": new Textline({ 
                is_unlocked: false,
                name: "降低一层灵阵功率T_T",
                text: "",
                unlocks: {
                    spec: "A6-down"
                },
            }),
        }
    });
    dialogues["纳鹰"] = new Dialogue({
        name: "纳鹰",
        starting_text: "和结界湖的神秘强者对话",
        textlines: {
            "nb1": new Textline({ 
                is_unlocked: true,
                name: "……这位前辈，您是？",
                text: "呵呵，你还不认识我吗？<br>确实，距我陨落，也已经过去数千年之久了吧。<br>想当初，我追随燕岗城主创下战功，<br>在燕岗城中建立起纳家，<br>也没有想到家族能走到如今这一步。",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb2"]}],
                },
                
                locks_lines: ["nb1"],
            }),
            "nb2": new Textline({ 
                is_unlocked: false,
                name: "……您是纳家的先祖！这……怎么可能，长老和父亲都说您……",
                text: "不必惊讶，我确实是纳家的先祖，名为纳鹰。<br>如今纳家的后人，也无人知晓我这道意念，<br>隐藏在秘境之中。<br> 若是为人知晓，只怕这秘境，<br>就要被那群探险者掀个天翻地覆吧。<br>",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb3"]}],
                },
                
                locks_lines: ["nb2"],
            }),
            "nb3": new Textline({ 
                is_unlocked: false,
                name: "这是怎么回事，当年您遭遇了什么变故，才变成这个样子？",
                text: "呵呵，小丫头，别急。<br>这也不过是一段无聊的往事罢了。<br>当年，我为了筹集一笔交易的材料，<br>铤而走险，深入危险的血魔海，<br>猎取强大的荒兽。<br>在血魔海，我不慎中了圈套，<br>沦为一位<span style='color:pink'>领域级</span>强者的灵魂奴仆。<br>那强者……恐怕与燕岗城主实力相差无几。<br>",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb4"]}],
                },
                
                locks_lines: ["nb3"],
            }),
            "nb4": new Textline({ 
                is_unlocked: false,
                name: "...",
                text: "这些强者缔结灵魂奴仆，<br>无非就是想要获得一个强大的“炮灰”罢了。<br>当时的我，根本就无法逃脱。<br>那些灵魂奴仆，终生服从于主人，没有自由，<br>死亡随时会降临到头顶。<br>大多数都在没日没夜经受各种危险之后，悲惨死去！<br>为了摆脱这种宿命，我选择自毁灵魂！<br>并且将意识转移到这一缕念头上。<br>这道念头，原本是寄存在家族秘境之中，<br>以备与家族传讯，此时却是派上了用场。",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb5"]}],
                },
                
                locks_lines: ["nb4"],
            }),
            "nb5": new Textline({ 
                is_unlocked: false,
                name: "啊...",
                text: "",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb6"]}],
                    spec: "A7-begin",
                },
                
                locks_lines: ["nb5"],
            }),
            "nb6": new Textline({ 
                is_unlocked: false,
                name: "我……可以吗？<br>有什么我能帮到前辈的，请尽管说吧。",
                text: "你的火元素领悟已有小成，<br>但提升空间仍然很大。<br>那领域境界的强者，<br>能够张开蕴含法则感悟的【领域】对敌，<br>我也曾见识他施展过几次。<br>数千年过去，我对这领域也有了自己的几分见解。<br>现在，我便将自己对这等秘法的领悟，<br>传授于你。你仔细听好。<br>",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb7"]}],
                },
                
                locks_lines: ["nb6"],
            }),
            "nb7": new Textline({ 
                is_unlocked: false,
                name: "是，晚辈遵命。",
                text: "纳鹰伸出手指，点在了纳可眉心处，<br>顿时，庞杂的信息涌入了她的脑海中，<br>令她一时间沉浸在种种玄妙的领悟意境之内。<br>过了片刻后，纳可睁开眼睛，<br>眼底闪烁着兴奋的光芒。<br>她能感受到这些领悟对她的帮助有多大。<br>  [纳可]前辈，谢谢您。<br>我对之后的路，已经有了清晰的认知。<br>[纳鹰]谢就不必了。<br>我想，我的传承到这里也差不多快结束了。<br>接下来，你要做的是好好努力提升自己，<br>等我再次苏醒之后，希望看见你更上一层楼。<br>",
                unlocks: {
                    textlines: [{dialogue: "纳鹰", lines: ["nb8"]}],
                    spec: "A7-exp",
                },
                
                locks_lines: ["nb7"],
            }),
            "nb8": new Textline({ 
                is_unlocked: false,
                name: "前辈您……要沉睡了？",
                text: "  呵呵，一缕念头自是无法长期维持。<br>下一次，就不知道什么时候才能醒了。<br>如果你希望检验自己——<br>去这片结界湖的深处。<br>那里有一些结界里自然滋生的“灵”，<br>诞生了意识，想要反抗和挣脱结界。<br>为了秘境的稳固，这个任务便交予你。<br>去吧，我就不打扰了。",
                unlocks: {
                    locations: ["结界湖 - 1"],
                },
                
                locks_lines: ["nb8"],
            }),
        }
    });
    
    dialogues["纳娜米(废墟)"] = new Dialogue({
        name: "纳娜米(废墟)",
        textlines: {
            "fx1": new Textline({ 
                is_unlocked: true,
                name: "姐姐，这片庞大的废墟……就是曾经的声律城所在地吗？",
                text: "是的。据传那位天外来客，<br>操纵着一艘庞大的飞行物，<br>被称之为“D9级飞船”的宫殿类奇宝。<br>那奇宝将整座城池炸成了废墟，<br>令我血洛大陆一方死伤惨重。<br>最终——靠着几百位城主级别强者的合力围攻，<br>甚至还有一位通天彻地的存在出手，<br>才终于将那奇宝击落！",
                unlocks: {
                    textlines: [{dialogue: "纳娜米(废墟)", lines: ["fx2"]}],
                },
                
                locks_lines: ["fx1"],
            }),
            "fx2": new Textline({ 
                is_unlocked: false,
                name: "……几百位城主级！临近十几座领的强者，已经齐聚在此了吗？",
                text: "至少来了一多半呢。<br>可当强者们攻入“D9飞船”之内，<br>才发现那天外来客根本就不在里面。<br>我们低估了天外来客，<br>他早就已经悄悄放出上百艘小型的，<br>被称为“B9飞船”的飞行物，欲要逃跑。",
                unlocks: {
                    textlines: [{dialogue: "纳娜米(废墟)", lines: ["fx3"]}],
                },
                
                locks_lines: ["fx2"],
            }),
            "fx3": new Textline({ 
                is_unlocked: false,
                name: "D9，B9。感觉上，像是某种划分一样，是什么呢……",
                text: "谁知道呢。<br>的确，这种小型飞行物，材质仅仅是珍宝级，<br>可体型小，速度快，一时间无人能够发现它的踪迹。<br>还是那位大人物亲自出手，<br>在他的灵魂探测范围内，<br>一切都无所遁形。<br>最终，强者们在接近第十八层云层之下，<br>拦截了他搭乘的那艘珍宝飞船，<br>并将所有的飞船尽数击毁。",
                unlocks: {
                    textlines: [{dialogue: "纳娜米(废墟)", lines: ["fx4"]}],
                },
                
                locks_lines: ["fx3"],
            }),
            "fx4": new Textline({ 
                is_unlocked: false,
                name: "呼……跌宕起伏呢。我们的目的，就是去寻找那些掉落的“飞船”，搜寻所需的宝物吧？",
                text: "正是。那座主战的飞船奇宝，<br>之中的宝藏，此刻正在被云霄级之上的强者抢夺。<br>而我们的目标，却是那些小型的飞船。<br>不过——还有一个目标，<br>可可，就在你的眼前。<br>声律城的废墟。",
                unlocks: {
                    textlines: [{dialogue: "纳娜米(废墟)", lines: ["fx5"]}],
                },
                
                locks_lines: ["fx4"],
            }),
            "fx5": new Textline({ 
                is_unlocked: false,
                name: "声律城的……废墟？",
                text: "嗯，没错。曾经繁荣昌盛的声律城，<br>化作废墟之后，众多原住民死去，<br>遗落下不少东西。家主大人已经下令，<br>纳家全体分开搜寻，<br>找到有用的财物、宝物之后——",
                unlocks: {
                    textlines: [{dialogue: "纳娜米(废墟)", lines: ["fx6"]}],
                },
                
                locks_lines: ["fx5"],
            }),
            "fx6": new Textline({ 
                is_unlocked: false,
                name: "等一下，姐姐，这种做法……不好吧。这座城池的人，难道不会无法安息吗？",
                text: "可可，姐姐只知道，<br>只要能够让纳家更快发展起来，<br>这些事情都是值得的。<br>如今，临近城池所有大小势力，都在做同样的事情。<br>我们想要争取到更多，并非容易，<br>更没有时间为那些难民感到悲痛。",
                unlocks: {
                    textlines: [{dialogue: "纳娜米(废墟)", lines: ["fx7"]}],
                },
                
                locks_lines: ["fx6"],
            }),
            "fx7": new Textline({ 
                is_unlocked: false,
                name: "……我，我听姐姐的。",
                text: "（如果燕岗城发生了同样的事情，大家……也会这样对待我们吗？）",
                unlocks: {
                    textlines: [{dialogue: "声律城难民", lines: ["fx8"]}],
                    
                    locations: ["声律城废墟 - 1"],
                },
                
                locks_lines: ["fx7"],
            }),
        }
    });
    dialogues["声律城难民"] = new Dialogue({
        name: "声律城难民",
        textlines: {
            "fx8": new Textline({ 
                is_unlocked: false,
                name: "……你渴了吗？我去帮你找水。",
                text: "谢谢你，小姑娘，但是没有必要。<br>多亏了这次遭难，我欠城主府的债务就不需要还了。<br>过一会，我还会去城里，<br>这城里天空乃至云霄级的身家，<br>可有不少留在了里面。<br>哪怕只是一位强者的部分家当，<br>也足以令我后半生无忧，哈哈哈——",
                unlocks: {
                    textlines: [{dialogue: "声律城难民", lines: ["fx9"]}],
                },
                
                locks_lines: ["fx8"],
            }),
            "fx9": new Textline({ 
                is_unlocked: false,
                name: "……那，那打扰了。",
                text: "(说起来...回燕岗城之后要不要找城主府,<br>借个<span class='coin coin_moneyT'>10B,8B</span>的呢?)<br>如果燕岗城发生了同样的事情，<br>至少有了重新开始的资源。",
                unlocks: {
                },
                
                locks_lines: ["fx9"],
            }),
        }
    });
    
    dialogues["心魔(战场)"] = new Dialogue({
        name: "心魔(战场)",
        starting_text: "停下来，稳定心神",
        textlines: {
            "zc1": new Textline({ 
                is_unlocked: true,
                name: "刚出城就有刺鼻的血腥味传来……好难受。",
                text: "只这一个天外来客，<br>便造成这么多的强者陨落。<br>我必须保持清醒，不能制造无谓的杀戮。<br>不然……只会在这条路上越走越远。<br>",
                unlocks: {
                    textlines: [{dialogue: "心魔(战场)", lines: ["zc2"]}],
                    locations: ["声律城战场 - 1"],
                },
                
                locks_lines: ["zc1"],
            }),
            "zc2": new Textline({ 
                is_unlocked: false,
                name: "……(检查过往的经历)",
                text: "",
                unlocks: {
                    spec: "A8-killcount",
                },
            }),
        }
    });
    
    dialogues["御兰"] = new Dialogue({
        name: "御兰",
        starting_text: "观赏御兰与昊荒的强者之战",
        textlines: {
            "yl1": new Textline({ 
                is_unlocked: false,
                name: "...",
                text: "[昊荒]御兰！又是你，<br>这艘飞船是我圣荒城的人先发现的，<br>难不成你兰陵城，还要继续死皮赖脸相争？",
                unlocks: {
                    textlines: [{dialogue: "御兰", lines: ["yl2"]}],
                },
                
                locks_lines: ["yl1"],
            }), 
            "yl2": new Textline({ 
                is_unlocked: false,
                name: "（飞船！有飞船的消息？）",
                text: "[御兰]我的昊将军，您说什么呢？<br>这次，可是您圣荒城的人马故意挑衅，<br>兰陵城不过是正当防卫罢了。<br>[昊荒]既然你如此不识时务，那我也没有必要跟你多废话！<br>就凭你这点人，也想破我等的荒门大阵，<br>简直是痴心妄想！",
                unlocks: {
                    textlines: [{dialogue: "御兰", lines: ["yl3"]}],
                },
                
                locks_lines: ["yl2"],
            }),
            "yl3": new Textline({ 
                is_unlocked: false,
                name: "诶，已经交上手了吗？战斗好精彩呀。",
                text: "(激烈的巨剑特效)<br>(激烈的雷击特效)<br><br>[纳可]呼……隔着这么远的距离，<br>都能清晰感觉到那些骇人的能量余波。",
                unlocks: {
                    textlines: [{dialogue: "御兰", lines: ["yl4"]}],
                },
                
                locks_lines: ["yl3"],
            }),
            "yl4": new Textline({ 
                is_unlocked: false,
                name: "...",
                text: "但比起害怕，<br>能够亲眼得见这些强大精妙的秘法被施展出来，<br>真是令人兴奋。<br>感觉——脑海深处的那些领悟，<br>已经有一部分化为了自己的东西。",
                unlocks: {
                    flags: ["is_realm_enabled"],
                },
                
                locks_lines: ["yl4"],
            }),
        }
    });
    
    dialogues["皎月神像"] = new Dialogue({
        name: "皎月神像",
        starting_text: "参拜战场中的皎月之神像",
        textlines: {
            "jy1": new Textline({ 
                is_unlocked: false,
                name: "(恭敬地拜三拜)",
                text: "[皎月投影]<br>(这是一条自动回复)<br>都什么时代了，别整那老一套了，<br>整点刀币给咱上供就成。<br>作为回报，你可以得到皎月的祝福...<br><br>对了，生命力越雄厚的祝福消耗越大，<br>所以得加钱。<br><span class='realm_sky'>天空级四阶</span>以上的修者也算了，<br>这个小神像承载不了太强的力量投影。",
                unlocks: {
                    textlines: [{dialogue: "皎月神像", lines: ["jy2"]},{dialogue: "皎月神像", lines: ["jy3"]}],
                },
                
                locks_lines: ["jy1"],
            }), 
            "jy2": new Textline({ 
                is_unlocked: false,
                name: "(查询目前赐福与消耗信息)",
                text: "",
                unlocks: {
                    spec: "JY-check",
                },
            }), 
            "jy3": new Textline({ 
                is_unlocked: false,
                name: "(上供刀币获取赐福)",
                text: "",
                unlocks: {
                    spec: "JY-sacrifice",
                },
            }), 
        }
    });
    dialogues["心之石像"] = new Dialogue({
        name: "心之石像",
        starting_text: "凝聚战斗中积累的感悟",
        textlines: {
            "clumbs": new Textline({ 
                is_unlocked: true,
                name: "荒兽森林感悟/点击就送！！(在1.10将被移除)",
                text: "...",
                unlocks: {
                    spec:"A1-fusion",
                },
                
                locks_lines: ["clumbs"],
            }),
        }
    });
})();

export {dialogues};
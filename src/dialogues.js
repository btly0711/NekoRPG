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
                is_unlocked: false,
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
                    textlines: [{dialogue: "秘境心火精灵", lines: ["check"]},{dialogue: "秘境心火精灵", lines: ["powerup"]},{dialogue: "秘境心火精灵", lines: ["powerdown"]},{dialogue: "秘境心火精灵", lines: ["powermax"]}],
                    locations: ["纳家秘境 - ∞"],
                },
                
                locks_lines: ["xh2"],
            }),
            "check": new Textline({ 
                is_unlocked: false,
                name: "现在灵阵功率开了多少哇？",
                text: "",
                unlocks: {
                    textlines:[{dialogue: "秘境心火精灵", lines: ["powermax"]}],
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
            "powermax": new Textline({ 
                is_unlocked: false,
                name: "将灵阵功率提高到当前上限(ノ▼Д▼)ノ",
                text: "",
                unlocks: {
                    spec: "A6-max"
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


    
    dialogues["纳娜米(飞船)"] = new Dialogue({
        name: "纳娜米(飞船)",
        textlines: {
            "nnm1": new Textline({ 
                is_unlocked: false,
                name: "姐姐！你怎么在这里？",
                text: "[纳可]……姐姐？戳一戳。<br>纳可歪了歪头，<br>自己的姐姐好像并没有什么反应，<br>她此刻正在专心致志地看着手里的一本书。<br>[纳可]书脊上写着……《基因原能运用 - 灵体之术》？<br>姐姐她，好像沉浸在这本书里，<br>似乎有所顿悟，还是不要打扰她了……。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米(飞船)", lines: ["nnm2"]}],
                },
                locks_lines: ["nnm1"],
            }),
            "nnm2": new Textline({ 
                is_unlocked: false,
                name: "纳可默默地守在一边，转眼间便是三个时辰过去。",
                text: "[纳娜米]原来如此，怪不得呢。<br>这本书讲得真是详细，短短时间就有这么大收获，<br>简直太棒了！<br>她把手中的书扔到一旁，<br>然后站起身来，伸了个懒腰，<br>望向旁边，纳可正用怨念的眼神盯着她。<br>[纳娜米/纳可]哇啊啊啊啊！！",

                unlocks: {
                    textlines: [{dialogue: "纳娜米(飞船)", lines: ["nnm3"]}],
                },
                locks_lines: ["nnm2"],
            }),
            "nnm3": new Textline({ 
                is_unlocked: false,
                name: "干什么啊姐姐！为什么突然发出那种声音！",
                text: "[纳娜米]可，可可，你，你什么时候在这里的？<br>我还以为是那些铁皮怪物来了……<br>[纳可]嗯，三个时辰吧，<br>不管怎么喊姐姐都没有回应。<br>[纳娜米]呜呜，都是姐姐不好，让你担心了。刚才那本修行书，似乎有一种吸引力，不自觉就沉浸进去了。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米(飞船)", lines: ["nnm4"]}],
                },
                locks_lines: ["nnm3"],
            }),
            "nnm3": new Textline({ 
                is_unlocked: false,
                name: "但是姐姐，2亿的灵体值只要敌人有200万敏捷就免疫了，这里敌人的敏捷都超过200万...",
                text: "[纳娜米]诶，可可，你刚才说了什么。<br>[纳可]以我对这个游戏的了解，<br>只要不学牵制，都不会有坏处啦。<br>[纳娜米]……现在的设定是这样子的吗？！<br>两人交换着这次舰船之行的收获，<br>以及路上的所见所闻。<br>[纳娜米]我找到的情报，很多都是来自于这书架上的书籍。<br>里面似乎记载了天外族群的不少讯息，<br>可惜比较核心的内容却只字未提。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米(飞船)", lines: ["nnm4"]}],
                },
                locks_lines: ["nnm3"],
            }),
            "nnm4": new Textline({ 
                is_unlocked: false,
                name: "姐姐，你说这些傀儡被天外族群叫做“科技造物”？而且路上的那些，很多都属于“A9”和“B1”级？",
                text: "[纳娜米]是的，如果树上的记载属实，<br>A、B、C三个等次，相当于大地、天空、云霄级，<br>而之后的数字则与小境界依次对应。<br>[纳可]那“A9”级，是大地级九阶吗？<br>但我在路上见到的，比如那个蓝皮怪物……<br>恐怕都相当于初入天空级的战力了吧。<br>[纳娜米]只能认为……天外族群的划分，更为严格。<br>比血洛世界要高出半级以上<br>可可，你现在好强。<br>如果没有镭射枪的话，如今的我，<br>是拿那些科技造物毫无办法的。",

                unlocks: {
                    textlines: [{dialogue: "纳娜米(飞船)", lines: ["nnm5"]}],
                },
                locks_lines: ["nnm4"],
            }),
            "nnm5": new Textline({ 
                is_unlocked: false,
                name: "还好吧，哼哼。那姐姐，我们现在要做什么？",
                text: "[纳娜米]都已经来到这里了，自然是继续前进。<br>天外来客的飞船啊……<br>不知道多少年才能见一回呢。<br>即使抛开可能的各种珍贵宝物不谈，我还想试试新学会的领悟呢。<br>[纳可]那个真的没有用处...<br>姐姐，要不要趁着新月接受一份皎月祝福，<br>然后喝了这瓶回风药水啊？<br>保证可以把你的伤害提高一倍还多！<br>以你的血量，只要十六个大钱就可以接受祝福！<br><br>[纳娜米]诶...算了吧，<br>我们都已经在飞船里面了，<br>总不能一路跑出去找神像..",

                unlocks: {
                    items: [{item_name: "纳娜米(飞船)",quality:130}],
                },
                locks_lines: ["nnm5"],
            }),
        }
    });
    
    dialogues["核心反应堆"] = new Dialogue({
        name: "核心反应堆",
        starting_text: "使用 [核心反应堆]",
        textlines: {
            "reactor": new Textline({ 
                is_unlocked: true,
                name: "使用 [核心反应堆]",
                text: "...",
                unlocks: {
                    spec:"A7-reactor",
                },
            }),
        }
    });

    dialogues["纳布(沼泽)"] = new Dialogue({
        name: "纳布(沼泽)",
        textlines: {
            "zz1": new Textline({ 
                is_unlocked: true,
                name: "...",
                text: "没人能够想到，<br>天外来客飞船坠落后的辐射，<br>竟能让如此之多的荒兽产生变异。<br>这或许是外来者最后的报复……<br>这些荒兽变得比之前更强大、更凶残。<br>大量天空级乃至云霄级的荒兽诞生，兽潮产生。",
                unlocks: {
                    textlines: [{dialogue: "纳布(沼泽)", lines: ["zz2"]}],
                },
                locks_lines: ["zz1"],
            }),
            "zz2": new Textline({ 
                is_unlocked: false,
                name: "父亲大人以前经历过兽潮吗？是什么样子的？",
                text: "[纳布]顾名思义……<br>无数发疯的荒兽冲击人类的城镇，<br>众多弱小的平民家破人亡，流离失所。<br>[纳可]……好可怜……<br>[纳布]可可，此次城主府开出了丰厚的奖励，<br>乃是几大领在天外来客的身上所得。<br>只要猎杀荒兽并带回证明，就能领取奖励。",
                unlocks: {
                    textlines: [{dialogue: "纳布(沼泽)", lines: ["zz3"]}],
                },
                locks_lines: ["zz2"],
            }),
            "zz3": new Textline({ 
                is_unlocked: false,
                name: "父亲大人，姐姐她现在，已经跟着家族的第一批队伍出发了吗？",
                text: "",
                unlocks: {
                    spec:"3-1-nanami",
                    textlines: [{dialogue: "纳布(沼泽)", lines: ["zz4"]}],
                },
                locks_lines: ["zz3"],
            }),
            "zz4": new Textline({ 
                is_unlocked: false,
                name: "……明白",
                text: "好了，时间也差不多了，<br>纳家的下一批队伍已经开拨，<br>那就收拾心情出发吧。<br>有燕岗城大部队的超级强者开路，<br>就不用担心碰到游荡的领域，云霄级兽王了。",
                unlocks: {
                    
                    locations: ["赫尔沼泽"],
                },
                locks_lines: ["zz4"],
            }),
        }
    });

    dialogues["结界湖转化器"] = new Dialogue({
        name: "结界湖转化器",
        starting_text: "使用荒兽凭证兑换物品(包括转化器)",
        textlines: {
            "jjh": new Textline({ 
                is_unlocked: true,
                name: "转化结界湖之心(需要结界湖之心位于装备栏)",
                text: "",
                unlocks: {
                    spec:"jjhzx",
                },
            }),
            "pz-my": new Textline({ 
                is_unlocked: true,
                name: "兑换秘银锭(30:1)",
                text: "",
                unlocks: {
                    spec:"pz-my",
                },
            }),
            "pz-bs": new Textline({ 
                is_unlocked: true,
                name: "兑换史诗黄宝石(80:1)",
                text: "",
                unlocks: {
                    spec:"pz-bs",
                },
            }),
            "pz-Bq": new Textline({ 
                is_unlocked: true,
                name: "兑换紫色刀币(250:1)",
                text: "",
                unlocks: {
                    spec:"pz-Bq",
                },
            }),


            //20:1 宝石
            //40:1 秘银
            //250:1 紫刀币
        }
    });

    dialogues["峰"] = new Dialogue({
        name: "峰",
        starting_text: "和铁甲青年对话",
        textlines: {
            "lf1": new Textline({ 
                is_unlocked: false,
                name: "你，你……",
                text: "[???]谢谢。<br>[纳可]你是谁，为什么会出现在这种地方？<br>也太可疑了吧！<br>[???]呃……我看上去很可疑吗？",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf2"]}],
                },
                locks_lines: ["lf1"],
            }),
            "lf2": new Textline({ 
                is_unlocked: false,
                name: "还有，你知道刚才有多危险吗，那个大家伙可是天空级四阶！",
                text: "[???]是吗，天空级四阶……<br>(根据情报，也就是对应恒星级四阶。)<br>以你的实力，对付刚才那头荒兽，<br>也是有不小风险的吧？<br>即使这样，也不惜出手帮助别人？",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf3"]}],
                },
                locks_lines: ["lf2"],
            }),
            "lf3": new Textline({ 
                is_unlocked: false,
                name: "举手之劳而已，才不要你管呀，是在小瞧我吗？",
                text: "",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf4"]}],
                    spec: "lf-1",
                    flags: ["is_moonwheel_unlocked"],
                },
                locks_lines: ["lf3"],
            }),
            "lf4": new Textline({ 
                is_unlocked: false,
                name: "……等等！不许走！",
                text: "[???]还有什么事吗？<br>[纳可]你……<br>既然你这么厉害，那就带我走出森林吧。<br>我找不到回去的路了。<br>[???]呵呵，好。小丫头，你叫什么名字。<br>[纳可]……<br><br>纳可，我的名字。你呢？<br>[峰]我叫，<span style='color:aqua'>【峰】</span>",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf5"]}],
                },
                locks_lines: ["lf4"],
            }),
            "lf5": new Textline({ 
                is_unlocked: false,
                name: "………………路上，两人逐渐畅谈起来。",
                text: "[纳可]（怎么说呢……<br>这个家伙，虽然刚才看见的时候，<br>感觉表现得很奇怪。）<br>（但一路走下来，<br>意外地感觉很好相处的样子。）<br>峰……你的年龄应该比我大，<br>那我就称呼你一声峰大哥好了。<br>不介意的话，叫我可可吧。<br>[峰]好啊。可可，你刚才说，<br>这里是燕岗领的势力范围中心？<br>而我们要去的，<br>是燕岗领的【领地主城】燕岗城？",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf6"]}],
                },
                locks_lines: ["lf5"],
            }),
            "lf6": new Textline({ 
                is_unlocked: false,
                name: "是的，只不过兽潮来袭，",
                text: "[纳可]燕岗领的强者都在抵御兽潮，<br>所以城里暂时没什么人呢。<br>[峰]那么……出了森林之后，<br>就麻烦你带路了。<br><br>【峰】加入了队伍！",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf7"]}],
                    items: [{item_name: "峰"}],
                },
                locks_lines: ["lf6"],
            }),
            "lf7": new Textline({ 
                is_unlocked: false,
                name: "有情况！",
                text: "(百方带着一帮百家人出现！)<br>[百方]哈哈，我当是谁，<br>原来是纳可小姐。<br>(反转:我方雷冬出现)<br>(激烈的对峙)<br>(反转:敌方百炎塔出现)<br>(另一轮激烈的对峙)<br>(反转：敌方被峰大哥吓跑)",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf8"]}],
                },
                locks_lines: ["lf7"],
            }),
            "lf8": new Textline({ 
                is_unlocked: false,
                name: "异变再生！",
                text: "(百家人被13斧抢劫了！)<br>(百家人因为缺少牵制药水打不过13斧！)<br>(百炎塔逃到纳可面前喊救命！)<br>(13斧的人以为好东西在纳可身上准备抢劫！)<br><br>该说不说，还真有个<span class='coin coin_moneySp'>1.21Δ</span>的好东西...<br>(<span class='coin coin_moneySp'>1.21Δ</span>暴起把13斧全杀了！)<br>(雷叔突然激动地要求纳可和峰交好！)",
                unlocks: {
                    textlines: [{dialogue: "峰", lines: ["lf9"]}],
                },
                locks_lines: ["lf8"],
            }),
            "lf9": new Textline({ 
                is_unlocked: false,
                name: "这都什么乱七八糟的...",
                text: "[峰]呵呵，没什么。暂且安全了，<br>先赶路吧。有什么话到了主城再说。<br>[纳可]呜，这个家伙到底怎么回事，<br>这么强为什么不早点说啊！<br>之前花那么大力气救他，<br>其实那只蛮咕兽身上加亿层光环都打不动他！",
                unlocks: {
                    locations: ["黑暗森林 - 3"],
                },
                locks_lines: ["lf9"],
            }),
            "lf10": new Textline({ 
                is_unlocked: false,
                name: "呼啊——终于除了那片黑漆漆的森林。",
                text: "[雷冬]峰大人，这城里我非常熟，<br>如果您有什么想去的地方……<br>[峰]不必了……我们就在此分开吧。<br>[纳可]分开……吗？<br>(纳可严重掠过一抹失落)<br>[峰]对了，这燕岗城最好的住宿地是哪里？<br>[纳可]飞云阁<br>[峰]嗯，如果你想找我，就去飞云阁吧。<br><br>【峰】离开了队伍！",
                unlocks: {
                    locations: ["飞云阁"],
                    spec:"lf-leave",
                },
                locks_lines: ["lf10"],
            }),
        }
    });
    
    dialogues["峰(飞云)"] = new Dialogue({
        name: "峰(飞云)",
        starting_text: "和峰大哥对话",
        textlines: {
            "lf11": new Textline({ 
                is_unlocked: true,
                name: "峰大哥你……有什么想问的吗？",
                text: "小家伙，你现在使用的秘法，<br>是从哪里得来的？",
                unlocks: {
                    textlines: [{dialogue: "峰(飞云)", lines: ["lf12"]}],
                },
                locks_lines: ["lf11"],
            }),
            "lf12": new Textline({ 
                is_unlocked: false,
                name: "……两年以前，在“天外来客”的飞船上找到的。",
                text: "[峰]这套秘法仅仅包含基础内容，<br>尚有不很多不完善之处。<br>我且给你一套更深层次的秘法来研习。<br><br>峰手指轻弹，两条光线飞射出去，钻进了纳可眉心。<br>纳可只感觉到脑袋一阵胀痛，<br>随后突然涌现出了许多知识。<br><br>映星花·繁星，映星花·巨星，映星花·花海<br> 已加入可选秘法！",
                unlocks: {
                    textlines: [{dialogue: "峰(飞云)", lines: ["lf13"]}],
                    stances: ["SF_Power","SF_Lucky","SF_Multi"],
                },
                locks_lines: ["lf12"],
            }),
            "lf13": new Textline({ 
                is_unlocked: false,
                name: "……这次抵御兽潮，",
                text: "[纳可]城主府给予前几名的奖励，<br>恐怕都比不上峰大哥给的这些呢。<br>[峰]兽潮吗？<br>说起来，这其中也有蹊跷。<br>看似是由于飞船坠落所导致，<br>但据我了解，那【D9飞船】里<br>有一台超大的反应堆，<br>而这片大陆缺少安全运行它的知识。",
                unlocks: {
                    textlines: [{dialogue: "峰(飞云)", lines: ["lf14"]}],
                },
                locks_lines: ["lf13"],
            }),
            "lf14": new Textline({ 
                is_unlocked: false,
                name: "...?",
                text: "这种原能反应堆每次爆炸，<br>都会泄露许多【原能辐射】。<br>根据现场的痕迹来看，<br>为了炼制一批【极品进化结晶】，<br>这台反应堆足足爆炸了58次。",
                unlocks: {
                    textlines: [{dialogue: "峰(飞云)", lines: ["lf15"]}],
                },
                locks_lines: ["lf14"],
            }),
            "lf15": new Textline({ 
                is_unlocked: false,
                name: "诶——可是死了这么多人啊，为什么……",
                text: "只要万千弱者的牺牲，<br>能换来一位强者的突破，<br>对族群的价值便远大于那万千弱者。<br>而且，变异后的荒兽材料价值更高，<br>也是合适的历练对象。<br>无法接受吗？没关系。<br>说到底，我并未炸过核心反应堆。<br>这终归只是我的推断罢了。",
                unlocks: {
                    textlines: [{dialogue: "峰(飞云)", lines: ["lf16"]}],
                },
                locks_lines: ["lf15"],
            }),
            "lf16": new Textline({ 
                is_unlocked: false,
                name: "突然……对于抵御兽潮没有什么兴趣了。",
                text: "这些都是【强者】所必须认识到的东西。<br>比起抵御兽潮，<br>或许有一个地方更适合你。<br>在燕岗城以东约万里的地带，<br>有一处隐秘之地，<br>似乎时间的流速在那里被加快了。",
                unlocks: {
                    textlines: [{dialogue: "峰(飞云)", lines: ["lf17"]}],
                },
                locks_lines: ["lf16"],
            }),
            "lf17": new Textline({ 
                is_unlocked: false,
                name: "可是峰大哥，为什么你自己不去呢……",
                text: "没有必要，那些东西是一位域主……<br>领域级强者留下的，<br>打包带走也没有<span class='coin coin_moneySp'>0.01Δ</span>，<br>对我而言没有意义。<br>记住，一定要小心，<br>我且在你的身上留下一道精神印记，<br>遇到危险时，用它来与我沟通。<br><br>",
                unlocks: {
                    locations: ["纯白冰原"],
                },
                locks_lines: ["lf17"],
            }),
        }
    });

    dialogues["纳娜米(冰原)"] = new Dialogue({
        name: "纳娜米(冰原)",
        textlines: {
            "by1": new Textline({ 
                is_unlocked: true,
                name: "好冷啊……姐姐。为什么燕岗领地图上没有这片雪原的标注？",
                text: "这里，应该就是那神秘强者峰所说的地方了。<br>环境确实很恶劣，低温加上冰元素，<br>估计大地级在这里都有冻死的风险。",
                //冰元素设定：微型而懒惰的拉普拉斯妖怪，可以在气温并不十分离谱的情况下制造负热量，吸收人的能量

                unlocks: {
                    textlines: [{dialogue: "纳娜米(冰原)", lines: ["by2"]}],
                },
                locks_lines: ["by1"],
            }),
            "by2": new Textline({ 
                is_unlocked: false,
                name: "受不了呀，太冷了，还是张开火焰领域取暖吧。",
                text: "[纳娜米]不要把领域用来做这个...<br>不对，可可，你的火焰领域关过吗？<br>[纳可]诶...<br>总之姐姐你靠过来一点！<br><br>纳娜米加入了队伍！能力的效力增加了5%！",
                //火焰领域设定：高温会让冰元素活化，释放出负热量，但高温领域的量级高于一小片区域的冰元素，起到驱散效果

                unlocks: {
                    items: [{item_name: "纳娜米(冰原)",quality:160}],
                },
                locks_lines: ["by2"],
            }),
        }
    });


    dialogues["极寒相变引擎"] = new Dialogue({
        name: "极寒相变引擎",
        starting_text: "使用 [极寒相变引擎]",
        textlines: {
            "engine": new Textline({ 
                is_unlocked: false,
                name: "使用 [极寒相变引擎]",
                text: "...",
                unlocks: {
                    spec:"freezing-engine",
                },
            }),
        }
    });

    dialogues["冰霜门户"] = new Dialogue({
        name: "冰霜门户",
        textlines: {
            "bs1": new Textline({ 
                is_unlocked:false,
                name: "咦，这是什么。(触摸)",
                text: "纳可的手触碰上了这冰雪门户。<br>霎时间，刺骨的寒冷触感，<br>从手掌传来，让少女不禁打了个哆嗦。<br>在纳可的眼前，出现了一条长长的甬道，<br>一直通向前方。<br>甬道两侧都是高耸透明的冰壁。",

                unlocks: {
                    textlines: [{dialogue: "冰霜门户", lines: ["bs2"]}],
                },
                locks_lines: ["bs1"],
            }),
            "bs2": new Textline({ 
                is_unlocked:false,
                name: "(继续向前)",
                text: "她本能地迈步向甬道的尽头走去，<br>很快看到了一扇冰门，<br>这扇冰门看上去朴实无华，散发着淡蓝色的光芒。<br>冰寒的力量犹如实质，弥漫在空气中，<br>逐渐汇聚成一种陌生而又熟悉的景象，<br>那是——水蓝色的庞大六芒星阵！",

                unlocks: {
                    textlines: [{dialogue: "冰霜门户", lines: ["bs3"]}],
                },
                locks_lines: ["bs2"],
            }),
            "bs3": new Textline({ 
                is_unlocked:false,
                name: "领域……冰元素的领域！",
                text: "纳可不受控制地抬起手，火焰的能量席卷，<br>在她的身周蔓延，<br>转瞬与硕大的冰蓝六芒星碰撞！<br>剧烈的爆炸声响彻四周，<br>整个甬道都剧烈地晃动起来。<br>冲击波席卷四周，<br>冰墙出现一道道裂痕，旋即迅速愈合。<br>那水蓝色的六芒星，同样出现一道道缺口，<br>炽热的火焰能量，便趁虚而入，<br>融合进了六芒星的缝隙当中，最终消失不见。",

                unlocks: {
                    textlines: [{dialogue: "冰霜门户", lines: ["bs4"]}],
                },
                locks_lines: ["bs3"],
            }),
            "bs4": new Textline({ 
                is_unlocked:false,
                name: "水，滋润万物……火，照耀一切……",
                text: "",

                unlocks: {
                    spec:"realm-II",
                    textlines: [{dialogue: "冰霜门户", lines: ["bs5"]}],
                },
                locks_lines: ["bs4"],
            }),
            "bs5": new Textline({ 
                is_unlocked:false,
                name: "……",
                text: "[纳娜米]可可，你快醒醒啊……<br>别吓姐姐。<br>纳可睁开迷离的双眼，<br>身边姐姐焦急的声音传来。<br>[纳娜米]可可！<br>你刚才突然晕倒了，我还以为你……<br>你还记得发生了什么？",

                unlocks: {
                    textlines: [{dialogue: "冰霜门户", lines: ["bs6"]}],
                },
                locks_lines: ["bs5"],
            }),
            "bs6": new Textline({ 
                is_unlocked:false,
                name: "(构造微型法阵)你怎么知道我的领域突破了？",
                text: "[纳娜米]诶诶？什么时候……<br>原来如此，刚才的冰霜门户吗。<br>不愧是你可可，总能给姐姐带来惊吓。<br>说起来，刚刚在里面还发现了这个……<br><br>获取了 [万载冰髓锭] !",

                unlocks: {
                    items: [{item_name: "万载冰髓锭"}],
                },
                locks_lines: ["bs6"],
            }),
        }
    });


    dialogues["溪月"] = new Dialogue({
        name: "溪月",
        starting_text: "和突然出现的神秘少女交流",
        textlines: {
            "xy1": new Textline({ 
                is_unlocked: false,
                name: "有点奇怪，姐姐。",
                text: "[纳可]之前的战斗中，那些家伙在死亡后，<br>他们的“族人”非但没有害怕，<br>反倒更疯狂地扑上来。<br>简直不像是正常人嘛……<br>打个比方的话，更像是我们曾经遇到的,<br>那些没有感情的【科技造物】。<br><br>[纳娜米]诶，不可能吧？<br>你的意思是说，<br>这些家伙都不是真正的人类？<br>[纳可]真正的人类里，怎么会像这样，<br>成千上万地冲锋上来呢？",
                unlocks: {
                    textlines: [{dialogue: "溪月", lines: ["xy2"]}],
                },
                
                locks_lines: ["xy1"],
            }),
            "xy2": new Textline({ 
                is_unlocked: false,
                name: "……",
                text: "[???]恭喜恭喜。外来者，<br>你们破译了这里的秘密！<br>作为奖励，送你们去一个好玩的地方，<br>【水牢】。<br>[纳娜米]你是……之前看到的那个女孩子！<br>果然，是你刻意把我们引导到这里的。<br>[纳可](双眼放光)感觉是，不得了的地方！",
                unlocks: {
                    textlines: [{dialogue: "溪月", lines: ["xy3"]}],
                    locations: ["时封水牢"],
                },
                
                locks_lines: ["xy2"],
            }),
            "xy3": new Textline({ 
                is_unlocked: false,
                name: "姐姐，姐姐，醒醒……",
                text: "[纳娜米]唔，可可……？！<br>太好了，你还在就好……<br>[纳可]我没事，……那个女孩，并没有杀我们，<br>而是把我们扔在了这里……<br>[溪月]欢迎两位可爱的小姑娘。<br>咯咯，我还在哦。比起【那个女孩】,<br>你们称呼我为【溪月】更好些。",
                unlocks: {
                    textlines: [{dialogue: "溪月", lines: ["xy4"]}],
                },
                locks_lines: ["xy3"],
            }),
            "xy4": new Textline({ 
                is_unlocked: false,
                name: "是你在引导我们吗？为什么要这么做。",
                text: "[溪月]这都是主人的安排。<br>不过怎么也没想到，<br>这次的外来者，竟然这么可爱，咯咯。<br>两位，这水牢之中，<br>关押着数百名天空级强者，<br>实力从天空级一二阶，到五六阶不等。<br>想要出去，办法很简单——<br>杀死这座水牢中所有的强者！<br>出口，会向最后的胜利者开启。",
                unlocks: {
                    textlines: [{dialogue: "溪月", lines: ["xy5"]}],
                },
                locks_lines: ["xy4"],
            }),
            "xy5": new Textline({ 
                is_unlocked: false,
                name: "(愣住)",
                text: "[纳可]才数百名?<br>突破到天空级六阶都需要1120兆经验耶。<br>这么点哪里够啦！<br><br>[溪月]咯咯，这里还有主人布下的结界。<br>丰沛的水元素孕育下，<br>这里会产生，最高天空级七阶的水【灵】。<br>简而言之，<br>战斗经验绝对管够！<br>虽然这里你们想跑随便跑，<br>但是天空级七阶的敌人可不是哪里都有的哦！<br>好啦，我的任务已经完成啦，<br>祝你们好运，拜拜咯。",
                unlocks: {
                    textlines: [{dialogue: "溪月", lines: ["xy6"]}],
                },
                locks_lines: ["xy5"],
            }),
            "xy6": new Textline({ 
                is_unlocked: false,
                name: "喂，喂！",
                text: "[纳娜米]看样子人真的走了。<br>[纳可]现在该怎么办，姐姐……<br>这里一只【灵】都没有呢。<br>[纳娜米]不一定。<br>也许，可以主动去找水牢中的强者，<br>尝试沟通一番。<br>[纳可]诶，要去找他们吗？<br>[纳娜米]他们或许也因为【灵】的袭击而感到困扰吧。<br>去帮忙解决【灵】，似乎是双赢的事呢。",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh1"]}],
                },
                locks_lines: ["xy6"],
            }),
        }
    });

    

    dialogues["竺虎"] = new Dialogue({
        name: "竺虎",
        
        textlines: {
            "zh1": new Textline({ 
                is_unlocked: false,
                name: "…",
                text: "[竺虎]哦呦，生面孔？<br>呵呵，这水牢有段时间没有新人了。<br><br>[纳娜米]你好，<br>你也是被关押进来的强者？<br><br>[竺虎]是啊，早先几百年就被关押在这里了。<br>哦，那边那个小姑娘，<br>你手里拿的那把武器，不错嘛。",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh2"]}],
                },
                
                locks_lines: ["zh1"],
            }),
            "zh2": new Textline({ 
                is_unlocked: false,
                name: "在叫我吗……？",
                text: "[竺虎]没错，啧啧，<br>看起来是品质很高的念力兵器。<br>那么，我就不客气的收下了。",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh3"]}],
                },
                
                locks_lines: ["zh2"],
            }),
            "zh3": new Textline({ 
                is_unlocked: false,
                name: "这，这可不能随便给你！",
                text: "[竺虎]哈哈哈，真是太幼稚了。<br>新人，你们还不懂这里的规则吧。<br>在这里强者为尊，杀人更是家常便饭。<br>两个天空级初……哈？！<br>现在求饶还来得及吗？",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh4"]}],
                },
                
                locks_lines: ["zh3"],
            }),
            "zh4": new Textline({ 
                is_unlocked: false,
                name: "想打架就直说嘛……",
                text: "[纳娜米]既然如此，<br>不再废话——你就死在这里好了。<br>(可可，拿下这家伙就交给你了！)",
                unlocks: {
                    locations: ["时封水牢 - I"],
                },
                
                locks_lines: ["zh4"],
            }),
            "zh5": new Textline({ 
                is_unlocked: false,
                name: "现在呢，到底是谁要死在这里呀。",
                text: "[竺虎]天真！就算你们再能打，<br>在境界所限………………<br><br>(死一般的寂静)",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh6-1"]},{dialogue: "竺虎", lines: ["zh6-2"]}],
                },
                
                locks_lines: ["zh5"],
            }),
            "zh6-1": new Textline({ 
                is_unlocked: false,
                name: "饶恕",
                text: "[纳可]看在本小姐今天心情不错的份上，<br>你可以走了~<br><br>[竺虎]那就告辞了，两位大人——",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh7"]}],
                },
                
                locks_lines: ["zh6-1","zh6-2"],
            }),
            "zh6-2": new Textline({ 
                is_unlocked: false,
                name: "<span style='color:red'><b>杀害</b></span>",
                text: "[竺虎]饶命啊——<br><br>(月轮切割声)<br><br>[纳可]好了，差不多就这样埋了吧。<br>[纳娜米]长大了啊……<br><br>获取了 沼泽·荒兽肉块 * 5!<br>获取了 晶化 剑(品质 239%)!<br>获取了 <span class='coin coin_moneyT'>259B</span> <span class='coin coin_moneyB'>346D</span> <span class='coin coin_moneyM'>107Z</span> <span class='coin coin_moneyK'>197X</span> <span class='coin coin_copper'>56C</span>!",
                unlocks: {
                    spec:"kill-zh",
                    textlines: [{dialogue: "竺虎", lines: ["zh7"]}],
                },
                
                locks_lines: ["zh6-1","zh6-2"],
            }),
            "zh7": new Textline({ 
                is_unlocked: false,
                name: "真是的，明明自己技不如人，还要放狠话。",
                text: "[纳娜米](此处省去水牢的强度判断)<br>还记得你之前，<br>在那天外来客的飞船中说过的话吗？<br>[纳可]是指什么话呢。<br>[纳娜米]你说，只要在飞船内成为天空级九阶，<br>麻烦便会迎刃而解！<br><br>仿佛醍醐灌顶一般，纳可似乎意识到了什么，顿时眼前一亮。",
                unlocks: {
                    textlines: [{dialogue: "竺虎", lines: ["zh8"]}],
                },
                
                locks_lines: ["zh7"],
            }),
            "zh8": new Textline({ 
                is_unlocked: false,
                name: "可是姐姐，压级要扣80%经验耶。",
                text: "[纳娜米]只有当实力超出了所有人，<br>才会受到这样的惩罚。<br>而已经超越了所有人，<br>危机不就不复存在了吗？<br><br>[纳可]有道理诶。",
                unlocks: {
                    locations: ["时封水牢 - 1"],
                },
                
                locks_lines: ["zh8"],
            }),
        }
    });
    
    dialogues["莫尔"] = new Dialogue({
        name: "莫尔",
        textlines: {
            "mr1": new Textline({ 
                is_unlocked: false,
                name: "你找上我们，有什么事吗？",
                text: "放心吧，我无意对付你们。<br>我只是想讨教一下，能压制竺虎的【领域】，<br>到底有多神奇。",
                unlocks: {
                    textlines: [{dialogue: "莫尔", lines: ["mr2"]}],
                },
                locks_lines: ["mr1"],
            }),
            "mr2": new Textline({ 
                is_unlocked: false,
                name: "没兴趣啊，而且很奇怪啊。",
                text: "[纳可]明明身处牢笼之中，朝不保夕的处境下，<br>还在想着与人切磋较量吗……<br><br>[莫尔]这里的凶险，我当然知道的比你们多。<br>可比起变强，这有算得了什么呢。<br>我可以告诉你们，<br>这水牢中的几个最强者，<br>脾气可都很古怪。<br>像强榜发布者【蓝柒】，落叶刀【秋兴】等，<br>每一个实力都数十倍于我。",
                unlocks: {
                    textlines: [{dialogue: "莫尔", lines: ["mr3"]}],
                },
                locks_lines: ["mr2"],
            }),
            "mr3": new Textline({ 
                is_unlocked: false,
                name: "…",
                text: "[纳娜米]所以，你觉得我们会答应吗？<br>在这里战斗，对我们也没有任何好处吧，<br>还可能会吸引来其他强者。<br><br>[莫尔]嗯，这也确实，<br>在下料定两位不会轻易答应，不过——<br>这不是轻率的冒犯，而是一次交易。",
                unlocks: {
                    textlines: [{dialogue: "莫尔", lines: ["mr4"]}],
                },
                locks_lines: ["mr3"],
            }),
            "mr4": new Textline({ 
                is_unlocked: false,
                name: "诶诶？什么交易，你在说什么啊。",
                text: "[莫尔]可爱的小家伙，你手里的武器，很强。<br>我曾长时间研究过念力兵器，<br>你这月轮的构架，起码是巅峰灵宝级。<br>即使云霄级强者，也会趋之若鹜。<br>可是你暂时无法发挥它的威力。<br>而我，或许可以帮到你。<br>[纳可]你的意思是！<br><br>[莫尔]如果我赢了，我什么都不会做。<br>只求能够学习你的领悟，<br>或是听听你对领域一道的见解。",
                unlocks: {
                    textlines: [{dialogue: "莫尔", lines: ["mr5"]}],
                },
                locks_lines: ["mr4"],
            }),
            "mr5": new Textline({ 
                is_unlocked: false,
                name: "(他真的值得信任吗……)",
                text: "[莫尔]我知道你在担心什么，<br>以强榜强者的声誉起誓，<br>我绝不会随意做什么手脚。<br>况且，做出见不得人的勾当，<br>一旦消息从这传出去，<br>恐怕便是身败名裂，招致灾祸吧。<br><br>[纳可]好……我答应你。既然如此，请吧。",
                unlocks: {
                    locations: ["时封水牢 - II"],
                },
                locks_lines: ["mr5"],
            }),
            "mr6": new Textline({ 
                is_unlocked: false,
                name: "(……)",
                text: "依照约定，莫尔将自己关于念力兵器的领悟，<br>毫无保留地教给了纳可。<br>到了此时，她才发现，<br>在这水牢之中，也并非只有你死我活，<br>如莫尔这般一心为修炼的强者也有不少。<br>交谈之中，她感受得到莫尔对于变强的渴望，<br>这份渴望的价值甚至是超越了生存。<br>很快，由216颗白水晶构造成的月轮，<br></br>在少女的手上，绽放出更华丽的光彩……<br>【银霜月轮】获取2.99垓经验！",
                unlocks: {
                    spec:"moonwheel-lv40",
                },
                locks_lines: ["mr6"],
            }),
        }
    });

    dialogues["秋兴"] = new Dialogue({
        name: "秋兴",
        textlines: {
            "qx1": new Textline({ 
                is_unlocked: false,
                name: "(落叶刀……！排名第三的落叶刀！)",
                text: "[秋兴]啊哈，我知道你们想说什么。<br>其实我早就发现你们的藏身之处了。<br>只不过，我在等你们成长，<br>直到足以与我对抗。",
                unlocks: {
                    textlines: [{dialogue: "秋兴", lines: ["qx2"]}],
                },
                locks_lines: ["qx1"],
            }),
            "qx2": new Textline({ 
                is_unlocked: false,
                name: "想要更强的对手，为什么盯着我们不放啊。",
                text: "[秋兴]哈哈哈，<br>小姑娘，你看到一个好玩的玩具，<br>会忍心放着不玩吗？",
                unlocks: {
                    textlines: [{dialogue: "秋兴", lines: ["qx3-1"]},{dialogue: "秋兴", lines: ["qx3-2"]}],
                },
                locks_lines: ["qx2"],
            }),
            "qx3-1": new Textline({ 
                is_unlocked: false,
                name: "……所谓好玩的玩具，是指我们？",
                text: "[秋兴]聪明！没错，我只是单纯觉得好玩，<br>所以想和你们玩而已。<br>自然，如果你们能让我满意，<br>我会放你们离开。<br>哎呀，真是漂亮的小东西呢……<br>让我看看。<br><br>秋兴伸出手来，<br>作势想要触碰纳可的脸颊。",
                unlocks: {
                    textlines: [{dialogue: "秋兴", lines: ["qx4"]}],
                },
                locks_lines: ["qx3-1","qx3-2"],
            }),
            "qx3-2": new Textline({ 
                is_unlocked: false,
                name: "(拿出极寒相变引擎)这个我可是放着没管！",
                text: "[秋兴]哈？(推，拉，推，拉)<br>这根本不是什么玩具啊！<br>比起这个，还是你们更好玩一点。<br>哎呀，真是漂亮的小东西呢……<br>让我看看。<br><br>秋兴伸出手来，<br>作势想要触碰纳可的脸颊。",
                unlocks: {
                    textlines: [{dialogue: "秋兴", lines: ["qx4"]}],
                },
                locks_lines: ["qx3-1","qx3-2"],
            }),
            "qx4": new Textline({ 
                is_unlocked: false,
                name: "啪——",
                text: "[纳娜米]呸，无耻败类，别碰可可，<br>否则你最好祈祷你不会出事。<br><br>[秋兴]哦呀，小姐脾气倒挺大。<br>只不过，你的实力能不能配得上你的脾气呢?",
                unlocks: {
                    locations: ["时封水牢 - III"],
                },
                locks_lines: ["qx4"],
            }),
            "qx5": new Textline({ 
                is_unlocked: false,
                name: "你这家伙……为什么要留手？",
                text: "[秋兴]怎么？这么可爱的小妹妹，<br>难道一定要打生打死不成？哈哈哈……<br>(省略了部分关于水牢势力分布的剧情)<br>(蓝柒没有碾压的实力，<br>但因为反抗者内部矛盾，<br>反抗蓝柒从未成功)<br><br>从秋兴的身上学到了领域之道！<br>【水元素亲和】获取了3997万经验！",
                unlocks: {
                    spec:"realm-III",
                    locations: ["时封水牢 - 5"],
                    textlines: [{dialogue: "秋兴", lines: ["qx6-1"]},{dialogue: "秋兴", lines: ["qx6-2"]},{dialogue: "秋兴", lines: ["qx6-3"]}],
                },
                locks_lines: ["qx5"],
            }),
            
            "qx6-1": new Textline({ 
                is_unlocked: false,
                name: "<span style='color:red'><b>杀害</b></span>",
                text: "[秋兴]不要……求你了……我什么都会做的！<br><br>(月轮切割声)<br><br>[纳可]呜，为什么我要这么做……<br>[纳娜米]……可可，你让我感到陌生。<br><br><br>获取了 <span class='coin coin_moneyT'>923B</span> <span class='coin coin_moneyB'>124D</span> <span class='coin coin_moneyM'>981Z</span> <span class='coin coin_moneyK'>247X</span> <span class='coin coin_copper'>561C</span>!<br><span style='color:aqua'>冰家</span>对纳可的好感大幅降低了！",
                unlocks: {
                    spec:"qx-kill",
                },
                locks_lines: ["qx6-1","qx6-2","qx6-3"],
            }),
            "qx6-2": new Textline({ 
                is_unlocked: false,
                name: "<span style='color:red'><b>侵犯</b></span>",
                text: "(纳可蹲下,挑起秋兴的下巴)<br>现在谁才是可爱的小妹妹哇？<br>领域三重·焰海霜天·焰海，开！<br>伴随着1280K的高温，<br>以及伴生的强劲环流，<br>秋兴的衣物瞬间被撕开几条巨型裂口。<br>3颗从哥布林身上提取的【冰封术】水晶，<br>被轮番催动，冰冻秋兴。在对方无力反抗的条件下，<br>3颗水晶恰好连续控制。<br>……<br>……<br>如此一整血洛日后，<br>纳可方才击杀哥布林，<br>将秋兴带回了洞府。<br><br>秋兴对纳可产生了特殊的情感！",
                unlocks: {
                    spec:"qx-sox",
                },
                locks_lines: ["qx6-1","qx6-2","qx6-3"],
            }),
            "qx6-3": new Textline({ 
                is_unlocked: false,
                name: "<b>离开</b>",
                text: "[纳可]你可以走了哦~<br>以后有空再来交流领域之道哇？<br><br>[秋兴]",
                unlocks: {
                },
                locks_lines: ["qx6-1","qx6-2","qx6-3"],
            }),
        }
    });


    dialogues["蓝柒"] = new Dialogue({
        name: "蓝柒",
        textlines: {
            "lq1": new Textline({ 
                is_unlocked: false,
                name: "(强者的气息……她果然来了吗？)",
                text: "[蓝柒]……<br><br>[纳娜米]你一直在看着吧，<br>我们和秋兴的那一场战斗。<br>不然，也不会把可可的实力，<br>评定为强榜第三——<br>不如说，水牢里的很多次战斗，<br>你都在背后看着？<br><br>[蓝柒]……",
                unlocks: {
                    textlines: [{dialogue: "蓝柒", lines: ["lq2"]}],
                },
                locks_lines: ["lq1"],
            }),"lq2": new Textline({ 
                is_unlocked: false,
                name: "姐姐，先停一下……",
                text: "[纳娜米]可可，这种时候打断姐姐很烦诶……<br><br>[蓝柒]……<br>不要再继续成长了。<br>会有可怕的事情发生的。",
                unlocks: {
                    textlines: [{dialogue: "蓝柒", lines: ["lq3"]}],
                },
                locks_lines: ["lq2"],
            }),"lq3": new Textline({ 
                is_unlocked: false,
                name: "什么意思……？",
                text: "[蓝柒]有特殊的原因。<br>总之，不要再继续了，这是警告——",
                unlocks: {
                    locations: ["时封水牢 - IV"],
                },
                locks_lines: ["lq3"],
            }),"lq4": new Textline({ 
                is_unlocked: false,
                name: "……",
                text: "[蓝柒]到此为止吧，这是最后的劝告。<br>这里的破局方法，和你们想的不一样。<br>再见。《br><br>[纳娜米]这样就走了吗？<br>似乎是我们预想之外的情况。",
                unlocks: {
                    textlines: [{dialogue: "蓝柒", lines: ["lq5"]}],
                },
                locks_lines: ["lq4"],
            }),"lq5": new Textline({ 
                is_unlocked: false,
                name: "搞不懂呢，之前的秋兴也不像在说话的样子。",
                text: "[纳可]这个女孩，真的是蓝柒吗？<br>实力确实很强，但和说话的不一样呀。<br>甚至……没有在她的身上感受到什么恶意。<br><br>[纳娜米]疑点越来越多了。<br>她的意思是，这座水牢中，<br>还存在着不同的，能够逃出去的方法吗？<br>[纳可]回去吧，姐姐。<br>稍晚一点再做打算。",
                unlocks: {
                    
                    items: [{item_name: "传说红宝石"}],
                },
                locks_lines: ["lq5"],
            }),"lq6": new Textline({ 
                is_unlocked: false,
                name: "……",
                text: "[蓝柒]你们很强……<br>但是，想要破局，<br>还不够……",
                unlocks: {
                    textlines: [{dialogue: "蓝柒", lines: ["lq7"]}],
                },
                locks_lines: ["lq6"],
            }),"lq7": new Textline({ 
                is_unlocked: false,
                name: "可以问一下吗？",
                text: "[纳娜米]你看到我们来到这里，<br>为什么会表现得这么失态。<br><br>[蓝柒]这个问题，不是很想回答……<br>可能……很快，你们就会明白的吧。<br>可我已经帮不了你们什么了。<br>",
                unlocks: {
                    locations: ["水牢走廊"],
                    textlines: [{dialogue: "蓝柒", lines: ["lq8-1"]},{dialogue: "蓝柒", lines: ["lq8-2"]},{dialogue: "蓝柒", lines: ["lq8-3"]}],
                },
                locks_lines: ["lq7"],
            }),
            "lq8-1": new Textline({ 
                is_unlocked: false,
                name: "<span style='color:red'><b>杀害</b></span>",
                text: "[蓝柒]如果……这就是你们心中的水牢……<br><br>(月轮切割声)<br><br>[纳可]重要的人……靠谱的前辈……<br>我是从什么时候开始变成这样的呢？<br>[纳娜米]……可可，别杀我，我害怕……<br><br><br>获取了 <span class='coin coin_moneyQa'>5U</span> <span class='coin coin_moneyT'>810B</span> <span class='coin coin_moneyB'>358D</span> <span class='coin coin_moneyM'>643Z</span> <span class='coin coin_moneyK'>364X</span> <span class='coin coin_copper'>656C</span>!<br><span style='color:aqua'>冰家</span>对纳可的好感大幅降低了！",
                unlocks: {
                    spec:"lq-kill",
                },
                locks_lines: ["lq8-1","lq8-2","lq8-3"],
            }),
            "lq8-2": new Textline({ 
                is_unlocked: false,
                name: "<span style='color:red'><b>侵犯</b></span>",
                text: "蓝柒在纳可心中早已是谜团重重的强者。<br>借此机会，她决定把蓝柒带回洞府，<br>严加“审问”，以便探出个究竟。<br>[纳可]地宫狂暴药剂~废墟狂暴药剂~<br>永远别想恢复体力，反抗我了哦~<br>[蓝柒]你很强……但是……还不够……<br>[纳可]差不多得了，领域四重才够嘛？<br>(纳可取出一桶异界药剂，一饮而尽！)<br><br>在每回合不断加码的倍率下，<br>蓝柒终究还是没能抵挡住纳可的“攻击”。<br><br>蓝柒对纳可产生了特殊的情感！",
                unlocks: {
                    spec:"lq-sox",
                },
                locks_lines: ["lq8-1","lq8-2","lq8-3"],
            }),
            "lq8-3": new Textline({ 
                is_unlocked: false,
                name: "<b>离开</b>",
                text: "想要前进的话，就过去吧，<br>愿伟大的不朽神灵保佑你们。",
                unlocks: {
                },
                locks_lines: ["lq8-1","lq8-2","lq8-3"],
            }),
        }
    });


    dialogues["溪月 II"] = new Dialogue({
        name: "溪月 II",
        starting_text: "和走廊中的粉发少女交流",
        textlines: {
            "xy7": new Textline({ 
                is_unlocked: true,
                name: "…",
                text: "恭喜恭喜，你们过关了！",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy8"]}],
                },
                
                locks_lines: ["xy7"],
            }),
            "xy8": new Textline({ 
                is_unlocked: false,
                name: "过关……你是，之前冰原上的那个女孩子。",
                text: "[纳娜米]这样也算我们过关了吗。<br>我们可并没有杀光水牢的强者。<br><br>[溪月]过关的办法——并非只有自相残杀，<br>如果你到达领域三重，这条通道自然会为你敞开。<br>是不是觉得很混乱呀？<br>没关系，你们很快会明白的。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy9"]}],
                },
                
                locks_lines: ["xy8"],
            }),
            "xy9": new Textline({ 
                is_unlocked: false,
                name: "能告诉我们这里究竟是什么地方吗。。",
                text: "[溪月]唔姆，这个嘛，当然没问题。<br>这里是主人构建的结界，<br>据说有百万年历史呢，可厉害啦。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy10"]}],
                },
                
                locks_lines: ["xy9"],
            }),
            "xy10": new Textline({ 
                is_unlocked: false,
                name: "等等，主人？",
                text: "[溪月]你也知道，被关在这里的这些强者，<br>虽然都被困住出不去的……<br>可只要他们不破坏这里的规矩，<br>就能安全地活上许多年，<br>令实力提升到惊人的程度。<br><br>当然，水牢中缺乏修炼资源。<br>原本可能已经突破天空级九阶的强者，<br>在这里只能打磨到天空级六阶[IV]，<br>具有抗衡初入天空级八阶的实力。<br><br>[PS/设定补充]<br>无特殊说明下，2+对应1个小境界。<br>为避免境界过于冗长，<br>3+以上会以罗马数字的形式展示。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy11"]}],
                },
                
                locks_lines: ["xy10"],
            }),
            "xy11": new Textline({ 
                is_unlocked: false,
                name: "可是……在这期间，你知道有多少人死去了吗？",
                text: "[溪月]啊呀，真是单纯的孩子。<br>虽然不忍心，可还是给你讲讲吧。<br>为培养强者，这些都是必然的牺牲。<br>在几百名天空级的厮杀中，<br>一旦诞生了一名云霄级——<br>这云霄级强者的价值，<br>可就要超过，嗯……我算算……<br>根据阶位不同，<br>10万~31亿天空级一阶的总和！<br><br>说到底这里百万年来就死了三万天空级！<br>你看看右上角的击杀统计，<br>有什么资格在这里评价主人啊！",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy12"]}],
                },
                
                locks_lines: ["xy11"],
            }),
            "xy12": new Textline({ 
                is_unlocked: false,
                name: "那，已经获得胜利的我们要做什么？",
                text: "[溪月]你们已经有了接受传承的资格！<br>接下来嘛，就让我带你们去见主人。<br>进入传承幻境，能得到多少领悟经验和修炼心得，<br>就看你们自己啦。<br><br>[纳可]我……无法接受。<br>[纳娜米]……可可，我们跟上去吧。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy13"]}],
                },
                
                locks_lines: ["xy12"],
            }),
            "xy13": new Textline({ 
                is_unlocked: false,
                name: "不，我说的不是这个……",
                text: "[纳可]10万~31亿天空级一阶的总和！<br>如果可以培养出一些云霄级强者，<br>肯定可以有源源不断的<span class='coin coin_moneyT'>宝钱</span>和<span class='coin coin_moneyQa'>宇宙币</span>涌来吧……<br>等接收完传承，是时候整合家族了！<br>现在的我，感觉已经具备了挑战父亲大人的能力呢。<br>(天空级巅峰 [-4]的老东西！<br>你的时代结束了！)",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy14"]}],
                },
                
                locks_lines: ["xy13"],
            }),
            "xy14": new Textline({ 
                is_unlocked: false,
                name: "(抖了抖)收拾收拾心情……",
                text: "[???]小姑娘，能来到这里，<br>勇气可嘉，胆识可嘉。<br>[左阿]首先，自我介绍一下。<br>原燕岗领混元门，少门主左阿。<br>[纳娜米]左阿？！您是……<br>燕岗领史书上记载的那位前辈？<br>[左阿]哈哈，不错。这么多年过去了，<br>还有小辈记得我的名字，<br>看来我还没被世人忘个干净。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy15"]}],
                },
                
                locks_lines: ["xy14"],
            }),
            "xy15": new Textline({ 
                is_unlocked: false,
                name: "(姐姐……我没看过史书诶。他是谁？）",
                text: "[纳娜米]距今约十万年历史的前辈高人……<br>因为和门主的冲突毁灭了昔日如日中天的【混元门】。<br>[左阿]呵呵，在这里传音可瞒不住我的感知。<br>当年，我出身于外门弟子之家，<br>天资平平，不受人重视。<br>后来，觉醒了天生元神体，<br>才突飞猛进，称为宗门高层。<br><br>[纳可]诶？天生元神体怎么会后天觉醒的哇。<br>[左阿]咳咳……总之门主要夺舍我！<br>我以云霄级巅峰之身，<br>与他同归于尽。<br>但是在我死亡的瞬间，我迈入了领域级层次。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy16"]}],
                },
                
                locks_lines: ["xy15"],
            }),
            "xy16": new Textline({ 
                is_unlocked: false,
                name: "呼……",
                text: "[左阿]最终就成了现在这样，<br>以一个扭曲的姿态活在这结界里。<br>既然你们冒着巨大风险来到这里，<br>又通过了我设下的重重关卡，<br>自然是不能让你们白来一趟。<br>[左阿]现在，开放你们的身心，<br>进入传承幻境，接受我的传承吧。<br>我只负责送你们进入幻境，<br>能有多少领悟，就看你们的造化了。<br>切记，传承只赠有缘人……<br>我占了溪月的对话框那么久，<br>也该歇歇了。",
                unlocks: {
                    textlines: [{dialogue: "溪月 II", lines: ["xy17"]}],
                },
                
                locks_lines: ["xy16"],
            }),
            "xy17": new Textline({ 
                is_unlocked: false,
                name: "（眼前一亮）",
                text: "随着左阿话音落下，<br>纳可和纳娜米眼前浮现白光，<br>似乎要将身体里的灵魂拉扯出来。<br>白光持续了片刻，而后，在这片空间中央，<br>形成了一个巨大的漩涡，<br><br>隐约之间，旋涡中映出了彩色的光华。<br>随着漩涡中的光线越来越亮，<br>纳可终于能够看清周围的一切，<br>她缓缓地睁开了眼睛。<br><br>进入传承幻境，纳娜米……算了，这个不收了啦。<br>反正估计你也有冰原之心了的说……",
                unlocks: {
                    locations: ["传承幻境"],
                },
                
                locks_lines: ["xy17"],
            }),

            
        }
    });

    dialogues["传承水晶"] = new Dialogue({
        name: "传承水晶",
        starting_text: "触摸散发着光亮的水晶",
        textlines: {
            "sj1": new Textline({ 
                is_unlocked: false,
                name: "(摸)",
                text: "[纳可]果然，这些水晶中，<br>蕴含着左阿前辈的感悟！<br>好强大的力量……<br>可却夹杂着强烈的暴戾气息。<br>左阿前辈，过去到底经历了什么呢？<br>一定要静心凝神……<br>算了，我也不好说人家啦。",
                unlocks: {
                    textlines: [{dialogue: "传承水晶", lines: ["sj2"]}],
                },
                
                locks_lines: ["sj1"],
            }),
            "sj2": new Textline({ 
                is_unlocked: false,
                name: "(闭眼)",
                text: "[纳可]……只是稍一接触，<br>秘法之中，许多尚未融汇贯通的部分，<br>一下就豁然开朗。<br>这是峰大哥赐予我的秘法，<br>它真正的潜力果然不同凡响。<br>(内心OS:毕竟上限可是50级！)<br>有些期待，不知道蜕变成功后会有多强呢？<br><br>领悟了新的秘法<span style='color:aqua'> 【映星紫华】</span>！<br>请在装备栏中进行装备。",
                unlocks: {
                    items: [{item_name: "映星紫华",quality:200}],
                },
                
                locks_lines: ["sj2"],
            }),

        }
    });

    dialogues["纳娜米?"] = new Dialogue({
        name: "纳娜米?",
        starting_text: "和地宫的姐姐……真的是姐姐吗？",
        textlines: {
            "hx1": new Textline({ 
                is_unlocked: false,
                name: "诶，姐姐，……你说什么？",
                text: "[纳娜米]可可！你终于醒了！<br>你之前和地宫的怪物厮杀，<br>消耗了太多体力，晕过去了。<br>不过放心吧，这一片区域的怪物，<br>刚才已经被姐姐清理干净了，<br>姐姐会保护你的。",
                unlocks: {
                    textlines: [{dialogue: "纳娜米?", lines: ["hx2"]}],
                },
                
                locks_lines: ["hx1"],
            }),
            "hx2": new Textline({ 
                is_unlocked: false,
                name: "姐姐，方才我晕倒的时候",
                text: "[纳可]你在……清理这片区域的怪物对吧。<br><br>[纳娜米?]是啊，你就不要担心了。<br>有姐姐在，这些都是小问题……",
                unlocks: {
                    textlines: [{dialogue: "纳娜米?", lines: ["hx3"]}],
                },
                
                locks_lines: ["hx2"],
            }),
            "hx3": new Textline({ 
                is_unlocked: false,
                name: "你……你不是姐姐！",
                text: "[纳可]在进幻境之前，<br>姐姐还只有天空级六阶！<br>怎么可能打得过八九阶的敌人哇。<br><br>[纳娜米?]………………<br><br>[纳可]你在听吗？我终于明白了，<br>我现在看到的一切都是幻觉，<br>而不是什么时间倒流。<br>你到底是谁？",
                unlocks: {
                    textlines: [{dialogue: "纳娜米?", lines: ["hx4"]}],
                },
                
                locks_lines: ["hx3"],
            }),
            "hx4": new Textline({ 
                is_unlocked: false,
                name: "你到底是谁？",
                text: "[纳可]你是我内心的心魔！对不对！<br><br><del>[纳娜米?]</del>[喵咕啦]<br>恭喜，答错啦！我是，<br>和你姐姐衣服颜色一样的茸茸！<br>我可不像心魔那个笨蛋一样会去用牵制！",
                unlocks: {
                    locations: ["幻境核心 - I"],
                },
                
                locks_lines: ["hx4"],
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
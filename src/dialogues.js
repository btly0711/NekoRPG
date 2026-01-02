"use strict";

const dialogues = {};

class Dialogue {
    constructor({ name, 
                  starting_text = `与 ${name} 对话`, 
                  ending_text = `返回`, 
                  is_unlocked = true, 
                  is_finished = false, 
                  textlines = {}, 
                  location_name
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
                    items: ["地图-藏宝地"],
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
                    //2-1初区
                },
                //locks_lines: ["6"],
            }),
        }
    });
})();

export {dialogues};
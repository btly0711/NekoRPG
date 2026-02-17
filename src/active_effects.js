const effect_templates = {}; 
//templates, since some effects will appear across multiple items but with different durations

class ActiveEffect {
    /**
     * 
     * @param {Object} effect_data
     * @param {String} effect_data.name
     * @param {String} [effect_data.id]
     * @param {Number} effect_data.duration
     * @param {Object} effect_data.effects {stats}
     */
    constructor({name, id, duration, effects}) {
        this.name = name;
        this.id = id || name;
        this.duration = duration ?? 0;
        this.effects = effects;
    }
}

effect_templates["Weak healing powder"] = new ActiveEffect({
    name: "Weak healing powder",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 1},
        }
    }
});
effect_templates["Weak healing potion"] = new ActiveEffect({
    name: "Weak healing potion",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 6},
            health_regeneration_percent: {flat: 1},
        }
    }
});

effect_templates["Slight food poisoning"] = new ActiveEffect({
    name: "Slight food poisoning",
    effects: {
        stats: {
            health_regeneration_flat: {flat: -0.5},
        }
    }
});

//NekoRPG effects below

effect_templates["饱食"] = new ActiveEffect({
    name: "饱食",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 40},
        }
    }
});

effect_templates["饱食 II"] = new ActiveEffect({
    name: "饱食 II",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 80},
        }
    }
});

effect_templates["饱食 III"] = new ActiveEffect({
    name: "饱食 III",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 400},
            attack_power:{flat:20},
            defense:{flat:20},
            agility:{flat:20},
        }
    }
});


effect_templates["恢复 A1"] = new ActiveEffect({
    name: "恢复 A1",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 1200},
        }
    }
});


effect_templates["强化 A1"] = new ActiveEffect({
    name: "强化 A1",
    effects: {
        stats: {
            health_regeneration_percent: {flat: 1},
            attack_power:{flat:1280},
            defense:{flat:1280},
            agility:{flat:1280},
        }
    }
});
effect_templates["恢复 A8"] = new ActiveEffect({
    name: "恢复 A8",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 600000},
        }
    }
});


effect_templates["强化 A8"] = new ActiveEffect({
    name: "强化 A8",
    effects: {
        stats: {
            health_regeneration_percent: {flat: 1},
            attack_power:{flat:256000},
            defense:{flat:256000},
            agility:{flat:256000},
        }
    }
});


effect_templates["虚弱"] = new ActiveEffect({
    name: "虚弱",
    effects: {
        stats: {
            health_regeneration_percent: {flat: -1},
        }
    }
});

effect_templates["饱食 IV"] = new ActiveEffect({
    name: "饱食 IV",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 1600},
            attack_power:{flat:320},
            defense:{flat:320},
            agility:{flat:320},
        }
    }
});

effect_templates["饱食 V"] = new ActiveEffect({
    name: "饱食 V",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 12000},
            attack_power:{flat:800},
            defense:{flat:800},
            agility:{flat:800},
        }
    }
});
effect_templates["饱食 VI"] = new ActiveEffect({
    name: "饱食 VI",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 180000},
            attack_power:{flat:12000},
            defense:{flat:12000},
            agility:{flat:12000},
        }
    }
});


effect_templates["饱食 VII"] = new ActiveEffect({
    name: "饱食 VII",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 1200000},
            attack_power:{flat:32000},
            defense:{flat:32000},
            agility:{flat:32000},
        }
    }
});

effect_templates["饱食 VIII"] = new ActiveEffect({
    name: "饱食 VIII",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 32000000},
            attack_power:{flat:640000},
            defense:{flat:640000},
            agility:{flat:640000},
        }
    }
});


effect_templates["魔攻 A9"] = new ActiveEffect({
    name: "魔攻 A9",
    effects: {
        stats: {
            attack_mul: {multiplier: 0.9},
        }
    }
});

effect_templates["牵制 A9"] = new ActiveEffect({
    name: "牵制 A9",
    effects: {
        stats: {
        }
    }
});

effect_templates["回风 A9"] = new ActiveEffect({
    name: "回风 A9",
    effects: {
        stats: {
            health_regeneration_percent: {flat: -1},
        }
    }
});

effect_templates["坚固 A9"] = new ActiveEffect({
    name: "坚固 A9",
    effects: {
        stats: {
            health_regeneration_percent: {flat: -1},
        }
    }
});
effect_templates["皎月祝福·新月"] = new ActiveEffect({
    name: "皎月祝福·新月",
    effects: {stats: {health_regeneration_percent: {flat: 1}}}
});
effect_templates["皎月祝福·蛾眉月"] = new ActiveEffect({
    name: "皎月祝福·蛾眉月",
    effects: {stats: {max_health: {multiplier: 1.5}}}
});
effect_templates["皎月祝福·上弦月"] = new ActiveEffect({
    name: "皎月祝福·上弦月",
    effects: {stats: {crit_multiplier: {multiplier: 1.6}}}
});
effect_templates["皎月祝福·盈凸月"] = new ActiveEffect({
    name: "皎月祝福·盈凸月",
    effects: {stats: {attack_mul: {multiplier: 1.4}}}
});
effect_templates["皎月祝福·满月"] = new ActiveEffect({
    name: "皎月祝福·满月",
    effects: {stats: {attack_power: {multiplier: 1.1}}}
});
effect_templates["皎月祝福·亏凸月"] = new ActiveEffect({
    name: "皎月祝福·亏凸月",
    effects: {stats: {defense: {multiplier: 1.2}}}
});
effect_templates["皎月祝福·下弦月"] = new ActiveEffect({
    name: "皎月祝福·下弦月",
    effects: {stats: {agility: {multiplier: 1.2}}}
});
effect_templates["皎月祝福·残月"] = new ActiveEffect({
    name: "皎月祝福·残月",
    effects: {stats: {attack_speed: {multiplier: 1.1}}}
});
effect_templates["辐射"] = new ActiveEffect({
    name: "辐射",
    effects: {stats: {max_health: {multiplier: 0.5},health_regeneration_percent:{flat:-8}}}
});

effect_templates["恢复 B1"] = new ActiveEffect({
    name: "恢复 B1",
    effects: {
        stats: {
            health_regeneration_flat: {flat: 4800000},
            max_health:{flat: 480000000},
        }
    }
});



/*  let MM1 = ["新月","蛾眉月","上弦月","盈凸月","满月","亏凸月","下弦月","残月"];
                let MM2 = ["生命恢复 + 1%","暴击概率 x 1.5","暴击伤害 x 1.6","普攻倍率 x 1.4","攻击力 x 1.1","防御力 x 1.2","敏捷 x 1.2","速度 x 1.1"];*/


export {effect_templates, ActiveEffect};
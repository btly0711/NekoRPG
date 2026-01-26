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
            attack_power:{flat:320},
            defense:{flat:320},
            agility:{flat:320},
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
            attack_power:{flat:320},
            defense:{flat:320},
            agility:{flat:320},
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
            attack_power:{flat:32000},
            defense:{flat:32000},
            agility:{flat:32000},
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


export {effect_templates, ActiveEffect};
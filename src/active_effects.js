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

export {effect_templates, ActiveEffect};
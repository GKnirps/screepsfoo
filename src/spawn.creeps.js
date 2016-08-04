const countCreepsByRole = function(creeps) {
    return _.reduce(_.values(creeps), (counter, creep) => {
        const role = creep.memory.role;
        if (!role) {
            console.log('Creep ' + creep.name + ' has no name. Cannot count this creep.');
            return counter;
        }
        if (!(role in counter)) {
            counter[role] = 0;
        }
        counter[role] += 1;
        return counter;
    }, {});
};

const buryCreeps = function() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};

module.exports = {
    countCreepsByRole: countCreepsByRole,
    buryCreeps: buryCreeps
};

const roles = require('roles');

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

const buryCreeps = function(game, memory) {
    for(var name in memory.creeps) {
        if(!game.creeps[name]) {
            delete memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};

const spawnCreepsAsNecessary = function(creeps, spawn) {
    const creepCount = creepSpawner.countCreepsByRole(creeps);
    if (!(roles.HARVESTER in creepCount) || creepCount[roles.HARVESTER] < 1) {
        var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: roles.HARVESTER});
        console.log("Spawned new harvester: " + newName);
    }
    if (!(roles.UPGRADER in creepCount) || creepCount[roles.UPGRADER] < 2) {
        var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: roles.UPGRADER});
        console.log("Spawned new upgrader: " + newName);
    }
    if (!(roles.BUILDER in creepCount) || creepCount[roles.BUILDER] < 2) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES)) {
            var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: roles.BUILDER});
            console.log("Spawned new builder: " + newName);
        }
    }
    if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 1) {
        var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {role: roles.ATTACKER});
        console.log("Spawned new attacker: " + newName);
    }

}

const manageCreeps(game, memory) {
  buryCreeps(game, memory);
  spawnCreepsAsNecessary(game.creeps, Game.spawns['Nest']);
}

module.exports = {
    countCreepsByRole: countCreepsByRole,
    manageCreeps: manageCreeps
};

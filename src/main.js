const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleAttacker = require('role.attacker');
const creepSpawner = require('spawn.creeps');
const roles = require('roles');

const roleBehaviors = {};
roleBehaviors[roles.HARVESTER] = roleHarvester;
roleBehaviors[roles.UPGRADER] = roleUpgrader;
roleBehaviors[roles.BUILDER] = roleBuilder;
roleBehaviors[roles.AATTACKER] = roleAttacker;

module.exports.loop = function () {
    creepSpawner.buryCreeps();
    const creepCount = creepSpawner.countCreepsByRole(Game.creeps);
    if (!(roles.HARVESTER in creepCount) || creepCount[roles.HARVESTER] < 1) {
        var newName = Game.spawns['Nest'].createCreep([WORK,CARRY,MOVE], undefined, {role: roles.HARVESTER});
        console.log("Spawned new harvester: " + newName);
    }
    if (!(roles.UPGRADER in creepCount) || creepCount[roles.UPGRADER] < 2) {
        var newName = Game.spawns['Nest'].createCreep([WORK,CARRY,MOVE], undefined, {role: roles.UPGRADER});
        console.log("Spawned new upgrader: " + newName);
    }
    if (!(roles.BUILDER in creepCount) || creepCount[roles.BUILDER] < 2) {
        if (Game.spawns['Nest'].room.find(FIND_CONSTRUCTION_SITES)) {
            var newName = Game.spawns['Nest'].createCreep([WORK,CARRY,MOVE], undefined, {role: roles.BUILDER});
            console.log("Spawned new builder: " + newName);
        }
    }
    if (!(roles.ATTACKER in creepCount) || creepCount[roles.Attacker] < 1) {
        var newName = Game.spawns['Nest'].createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {role: roles.ATTACKER});
        console.log("Spawned new attacker: " + newName);
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        const behavior = roleBehaviors[creep.memory.role];
        if (behavior) {
            behavior.run(creep);
        }
    }
}

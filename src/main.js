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
roleBehaviors[roles.ATTACKER] = roleAttacker;

module.exports.loop = function () {
    creepSpawner.manageCreeps(Game, Memory);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        const behavior = roleBehaviors[creep.memory.role];
        if (behavior) {
            behavior.run(creep);
        }
    }
}

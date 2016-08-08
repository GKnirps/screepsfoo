const roleHarvester = require('role.harvester');
const roleSpawnMaintainer = require('role.spawnmaintainer');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleAttacker = require('role.attacker');
const roleRepairman = require('role.repairman');
const towerFunctions = require('building.tower');
const creepSpawner = require('spawn.creeps');
const roles = require('roles');

const roleBehaviors = {};
roleBehaviors[roles.HARVESTER] = roleHarvester;
roleBehaviors[roles.UPGRADER] = roleUpgrader;
roleBehaviors[roles.BUILDER] = roleBuilder;
roleBehaviors[roles.ATTACKER] = roleAttacker;
roleBehaviors[roles.SPAWN_MAINTAINER] = roleSpawnMaintainer;
roleBehaviors[roles.REPAIRMAN] = roleRepairman;

module.exports.loop = function () {
    try {
      _.forEach(Game.spawns, spawn => {
        const towers = spawn.room.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_TOWER});
        _.forEach(towers, towerFunctions.towerBehavior);
      });
    } catch (err) {
      console.log('Error while doing something with the tower. Error: ' + err);
    }

    try {
      creepSpawner.manageCreeps(Game, Memory);
    } catch (err) {
      console.log('Error while managing creep spawning. Resuming other tasks. Error: ' + err);
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        const behavior = roleBehaviors[creep.memory.role];
        if (behavior) {
            try {
              behavior.run(creep);
            } catch (err) {
              console.log('Error while running creep ' + name + ' with role ' + creep.memory.role + '. Resuming other creeps. Error:' + err);
            }
        }
    }
}

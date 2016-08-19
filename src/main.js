const roleHarvester = require('role.harvester');
const roleSpawnMaintainer = require('role.spawnmaintainer');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleAttacker = require('role.attacker');
const roleRepairman = require('role.repairman');
const roleColonizer = require('role.colonizer');
const towerFunctions = require('building.tower');
const creepSpawner = require('spawn.creeps');
const roles = require('roles');

const SPAWNING_INTERVAL = 10;

const roleBehaviors = {};
roleBehaviors[roles.HARVESTER] = roleHarvester;
roleBehaviors[roles.UPGRADER] = roleUpgrader;
roleBehaviors[roles.BUILDER] = roleBuilder;
roleBehaviors[roles.ATTACKER] = roleAttacker;
roleBehaviors[roles.SPAWN_MAINTAINER] = roleSpawnMaintainer;
roleBehaviors[roles.REPAIRMAN] = roleRepairman;
roleBehaviors[roles.COLONIZER] = roleColonizer;

module.exports.loop = function () {
    _.forEach(Game.rooms, room => {
      const towers = room.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_TOWER});
      _.forEach(towers, towerFunctions.towerBehavior);
    });
    // don't check if we need to spawn on every tick (saves processing time)
    if (Game.time % SPAWNING_INTERVAL == 0) {
      // we can leave out spawns that are busy
      const idleSpawns = _.reject(Game.spawns, spawn => spawn.spawning);
      try {
        creepSpawner.manageCreeps(Game, Memory, idleSpawns);
      } catch (err) {
        console.log('Error while managing creep spawning. Resuming other tasks. Error: ' + err);
      }
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

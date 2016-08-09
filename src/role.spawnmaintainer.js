const findHelpers = require('helpers.find');
const common = require('common_behaviors');
const roles = require('roles');

const roleSpawnMaintainer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let target;
        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
          target = findHelpers.findClosestFillableSpawnOrExtension(creep.room, creep);
        } else {
          // If there are no spawns to fill, maybe we can fill a tower?
          const towers = creep.room.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_TOWER});
          if (towers.length) {
            target = _.min(towers, tower => tower.energy);
          }
        }
        if (target) {
            if (creep.memory.harvestTargetId !== target.id) {
                creep.memory.harvestTargetId = target.id;
            }
            if (!creep.memory.delivering && creep.carry.energy === creep.carryCapacity) {
              creep.memory.delivering = true;
            }
            if (creep.memory.delivering && creep.carry.energy === 0) {
              creep.memory.delivering = false;
            }
            if(creep.memory.delivering) {
              if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
              }
            }
            else {
                // if no harvesters are present, harvest for yourself.
                if (findHelpers.findCreepsInRoomByRole(creep.room, roles.HARVESTER).length === 0) {
                  const source = findHelpers.findClosestSourceToObject(creep.room, target);
                  if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                      creep.moveTo(source);
                  }
                } else {
                  common.getEnergyFromClosestHarvester(creep);
                }
            } 
        } else {
            // TODO: find spawn dynamically here
            creep.moveTo(Game.spawns['Nest']);
        }
    }
};

module.exports = roleSpawnMaintainer;

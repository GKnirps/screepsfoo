const findHelpers = require('helpers.find');
const common = require('common_behaviors');

const isValidRepairTarget = function(structure) {
  if (!structure.my && structure.structureType !== STRUCTURE_ROAD && structure.structureType !== STRUCTURE_WALL) {
    return false;
  }
  if (structure.structureType === STRUCTURE_WALL && structure.structureType === STRUCTURE_RAMPART) {
    if (structure.hits > 100) {
      return false;
    }
  }
  return structure.hits < structure.hitsMax;
};

const getStructureToRepair = function(creep) {
  if (creep.memory.repairTargetId) {
    previousTarget = Game.getObjectById(creep.memory.repairTargetId);
    if (isValidRepairTarget(previousTarget) {
      return previousTarget;
    }
  }
  const structures = creep.room.find(FIND_STRUCTURES, {filter: isValidRepairTarget});
  if (!structures.length) {
    return null;
  }
  return findHelpers.getClosestObjectFromList(creep.pos, structures);
};

/**
 * Creep that repairs structures, but does not boost walls and Ramparts above 100
 */
const roleRepairman = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('fetching energy');
        }
        if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.repairing = true;
            creep.say('repairing');
        }
        const structure = getStructureToRepair(creep);
        if (!structure) {
            // TODO: we can do wall improving if nothing is to be repaired (when we have a wall improver)
            creep.moveTo(Game.spawns['Nest']);
        } else {
            creep.memory.repairTargetId = structure.id; 
            if(creep.memory.repairing) {
                if(creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else {
                common.getEnergyFromClosestHarvester(creep);
            }
        }
    }
};

module.exports = roleRepairman;

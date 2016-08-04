const findHelpers = require('helpers.find');

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const target = findHelpers.findClosestFillableSpawnOrExtension(creep.room, creep);
        if (target) {
            if (creep.memory.harvestTargetId !== target.id) {
                creep.memory.harvestTargetId = target.id;
            }
            if(creep.carry.energy < creep.carryCapacity) {
                const source = findHelpers.findClosestSourceToObject(creep.room, target);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
            else {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } 
        } else {
            // TODO: find spawn dynamically here
            creep.moveTo(Game.spawns['Nest']);
        }
    }
};

module.exports = roleHarvester;

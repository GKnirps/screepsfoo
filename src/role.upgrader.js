const findHelpers = require('helpers.find');
const common = require('common_behaviors');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrade = true;
        }
        const controller = creep.room.controller;
        if(!creep.memory.upgrade && creep.carry.energy < creep.carryCapacity) {
            common.getEnergyFromClosestHarvester(creep);
        }
        else {
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            if (creep.carry.energy === 0) {
                creep.memory.upgrade = false;
            }
        }
    }
};

module.exports = roleUpgrader;

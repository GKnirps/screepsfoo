const findHelpers = require('helpers.find');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrade = true;
        }
        const controller = creep.room.controller;
        if(!creep.memory.upgrade && creep.carry.energy < creep.carryCapacity) {
            const source = findHelpers.findClosestSourceToObject(creep.room, controller)
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
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

const findHelpers = require('helpers.find');
const common = require('common_behaviors');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length) {
            const cSite = constructionSites[0];
            if(creep.memory.building) {
                if(creep.build(cSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(cSite);
                }
            }
            else {
                common.getEnergyFromClosestHarvester(creep);
            }
        }
    }
};

module.exports = roleBuilder;

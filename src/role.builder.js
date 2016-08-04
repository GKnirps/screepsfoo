const findHelpers = require('helpers.find');

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
        if (!constructionSites.length) {
            creep.moveTo(Game.spawns['Nest']);
        } else {
            const cSite = constructionSites[0];
            const source = findHelpers.findClosestSourceToObject(creep.room, cSite);
            if(creep.memory.building) {
                // move, otherwise you may be blocking the source!
                if(creep.pos.inRangeTo(source, 3) && !creep.pos.isNearTo(cSite)) {
                    creep.moveTo(cSite);
                } else if(creep.build(cSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(cSite);
                }
            }
            else {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};

module.exports = roleBuilder;

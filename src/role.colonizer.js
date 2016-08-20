const roles = require('roles');
const findHelpers = require('helpers.find');

const roleColonizer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        /** fixed target room, for now */
        const room = creep.room;
        if (room.name === 'W33N57') {
          const x = 49;
          const y = 14;
          if (creep.pos.x !== x || creep.pos.y !== y) {
            creep.moveTo(x,y, {reusePath: 0});
          } else {
            creep.move(RIGHT);
          }
        } else {
          if (!room.controller.my) {
            if (creep.claimController(room.controller) === ERR_NOT_IN_RANGE) {
              creep.moveTo(room.controller);
            }
            return;
          }
          const spawns = room.find(FIND_MY_SPAWNS);
          if (spawns.length) {
            creep.memory.role = roles.SPAWN_MAINTAINER;
            return;
          }
          if (room.find(FIND_MY_SPAWNS).length === 0 && room.find(FIND_MY_CONSTRUCTION_SITES) === 0) {
            room.createConstructionSite(25,20, STRUCTURE_SPAWN);
          }
          const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
          if (!creep.memory.state) {
            creep.memory.state = 'HARVESTING';
          }
          if (constructionSites.length !== 0) {
            if (creep.memory.state === 'HARVESTING' && creep.carry.energy === creep.carryCapacity) {
              creep.memory.state = 'BUILDING';
            } else if (creep.memory.state === 'BUILDING' && creep.carry.energy === 0) {
              creep.memory.state = 'HARVESTING';
            }
            if (creep.memory.state === 'BUILDING') {
              if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSites[0]);
              }
            } else {
              const source = findHelpers.getClosestObjectFromList(creep.pos, creep.room.find(FIND_SOURCES));
              if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(source);
                }
                else (creep.say('Ain\'t no source!'));
              }
            }
          }
        }
    }
        
};

module.exports = roleColonizer;

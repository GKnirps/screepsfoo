const findHelpers = require('helpers.find');
const roles = require('roles');

const associateSource = function(creep) {
  if (creep.memory.sourceId) {
    // we already have a source, ignore this.
    return;
  }
  const sources = creep.room.find(FIND_SOURCES);
  const harvesters = findHelpers.findCreepsInRoomByRole(creep.room, roles.HARVESTER);

  const sourceIds = _.map(sources, (source) => source.id);
  const harvesterSourceIds = _.map(harvesters, (harv) => harv.memory.sourceId);

  const unassociatedSources = _.filter(sourceIds, id => {
    let found = false;
    for(i=0; i<harvesterSourceIds.length; i++) {
      found = found || harvesterSourceIds[i] === id;
    }
    return !found;
  });

  if (unassociatedSources.length === 0) {
    // TODO: notify player when this happens?
    console.log("We have one harvester more than we need. Why?");
    return;
  }

  // take the first best unassociated source
  creep.memory.sourceId = unassociatedSources[0];
};

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
      // a harvester needs an associated source. If it has no source, it has to search for one.
      // For now, we allow only one harvester per source. So we have to look if there are any
      // other harvesters
      if (!creep.memory.sourceId) {
        associateSource(creep);
      }
      const sourceId = creep.memory.sourceId;
      const source = Game.getObjectById(sourceId);

      // go to that source and harvest
      if (creep.carry.energy < creep.carryCapacity) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
          // this is only for other creeps to recognize if this creep is on the move or harvesting
          // because harvesters are slow and if other creeps swarm the harvester, it won't find reach the source.
          creep.memory.harvesting = false;
        } else {
          creep.memory.harvesting = true;
        }
      }
      // never move away anymore, other creeps can get their energy from this harvester
      // TODO: initiate container building of a container for this source (if possible), fill container if internal capacity is reached
    }
};

module.exports = roleHarvester;

const findHelpers = require('helpers.find');
const roles = require('roles');

/**
 * Find a good spot for a container where we can put the harvested energy into.
 * This spot must be have a distance of 2 from the source, but no more than 2 on any axis.
 * Figure: s is the source, x are the possible positions of the container.
 *
 * xxxxx
 * x   x
 * x s x
 * x   x
 * xxxxx
 * Among those possible options, pick the place where
 * 1. you can place a building
 * 2. that has the most walkable fields around.
 */
const possibleStorageDPos = [
  [-2, -2],
  [-2, -1],
  [-2, 0],
  [-2, 1],
  [-2, 2],
  [2, -2],
  [2, -1],
  [2, 0],
  [2, 1],
  [2, 2],
  [-1, -2],
  [0, -2],
  [1, -2],
  [-1, 2],
  [0, 2],
  [1, 2]
];

const findSpotForContainer = function(room, sourcepos) {
  /* TDB */ 
};

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

const associateContainer = function(creep, source) {
  if (creep.memory.containerId) {
    // we already have a container, but does it still exist?
    const existingContainer = Game.getObjectById(creep.memory.containerId);
    if (existingContainer) {
      return existingContainer;
    }
  }

  for (i=0; i<possibleStorageDPos.length; i++) {
    const x = source.pos.x + possibleStorageDPos[i][0];
    const y = source.pos.y + possibleStorageDPos[i][1];
    const objects = source.room.lookAt(x,y);
    containers = _.filter(objects, object => {
      return object.type === LOOK_STRUCTURES && object[LOOK_STRUCTURES].structureType === STRUCTURE_CONTAINER;
    });
    if (containers.length === 0) {
      const container = containers[0][LOOK_STRUCTURES];
      creep.memory.containerId = container.id;

      return container;
    }
  }
  // no container has been build yet for this harvester. Just harvest without one.
  return null;
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
      if (!source) {
        console.log("Trying to harvest, but harvester " + creep.name + " has no source.");
        return
      }

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
      // fill a nearby container if available
      const container = associateContainer(creep, source);
      if (container) {
        if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          // The container is always not more than two fields away from the source.
          // This is guaranteed by associateContainer. So at some point, we do not have to move anymore.
          creep.moveTo(container);
        }
      }
      // never move away anymore, other creeps can get their energy from this harvester
      // TODO: initiate container building of a container for this source (if possible)
    }
};

module.exports = roleHarvester;

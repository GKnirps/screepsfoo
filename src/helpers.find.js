const roles = require('roles')

/**
 * Square bee-line distance between two RoomObjects
 * @params {!RoomPosition} p1
 * @params {!RoomPosition} p2
 * @return {number}
 */
const squareDistance = function(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
};

/**
 * Returns the the object in the list that is the closest to pos (bee-line).
 * @params {!RoomPosition} pos
 * @params {!Array.<RoomObject>} objects
 * @return {?RoomObject} null if objects is empty, closest object to pos otherwise
 */
const getClosestObjectFromList = function(pos, objects) {
  const min = _.min(objects, object => squareDistance(object.pos, pos));
  if (typeof min === 'number' && !isFinite(min)) {
    return null;
  }
  return min;
}

module.exports = {
    squareDistance: squareDistance,
    getClosestObjectFromList: getClosestObjectFromList,

    /**
     * returns source with shortest bee-line distance to the given object in the room
     * It works only if both objects are in the same room.
     * @params {Room} room
     * @params {RoomObject} target
    */
    findClosestSourceToObject: function(room, target) {
        const sources = room.find(FIND_SOURCES);
        return getClosestObjectFromList(target.pos, sources);
    },
    
    /**
     * Returns the spawn or extension that is closest to this creep  not at its capacity.
     * If the creep still has one structure in memory that still exists and is not at its capacity
     * 
     * @param {!Room} room
     * @param {!Creep} creep
     */
    findClosestFillableSpawnOrExtension: function(room, creep) {
        const previousTarget = Game.getObjectById(creep.memory.harvestTargetId);
        if (previousTarget) {
            if (previousTarget.energy < previousTarget.energyCapacity) {
                return previousTarget;
            }
        }
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        return getClosestObjectFromList(creep.pos, targets);
    },

    /**
     * Returns all creeps in the room with a specific role
     * @param {!Room} room
     * @param {string} role
     */
    findCreepsInRoomByRole: function(room, role) {
      return room.find(FIND_MY_CREEPS, {filter: (creep) => {
        return creep.memory.role === role;
      }});
    }
}

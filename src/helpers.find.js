/**
 * Square bee-line distance between two RoomObjects
 * @params {!RoomObject} o1
 * @params {!RoomObject} o2
 * @return {number}
 */
const squareDistance = function(o1, o2) {
    return Math.pow(o1.pos.x - o2.pos.x, 2) + Math.pow(o1.pos.y - o2.pos.y, 2);
};

module.exports = {
    /**
     * returns source with shortest bee-line distance to the given object in the room
     * Right now, it works only if both objects are in the same room.
     * @params {Room} room
     * @params {RoomObject} target
    */
    findClosestSourceToObject: function(room, target) {
        const sources = room.find(FIND_SOURCES);
        const min = _.min(sources, source => squareDistance(source, target));
        if (typeof min === 'number' && !isFinite(min)) {
          return null;
        }
        return min;
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
        const min = _.min(targets, target => squareDistance(target, creep));
        if (typeof min === 'number' && !isFinite(min)) {
          return null;
        }
        return min;
    }
}

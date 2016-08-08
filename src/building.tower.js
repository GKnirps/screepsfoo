const findHelpers = require('helpers.find');

// a Tower:
// Behavior rules:
// Prio 1: attack all enemies in the room, closest first (closer enemies get hit harder)
// Prio 2: heal all creeps (if there are no enemies) until the energy is at 50% capacity or less
// Prio 3: repair buildings that are no more that 10 blocks away if the energy is above 50%, or any buildings, if the energy is above 80%

const towerBehavior = function(tower) {
  // Prio 1
  const enemies = tower.room.find(FIND_HOSTILE_CREEPS)
  if (enemies.length) {
    const closestEnemy = findHelpers.getClosestObjectFromList(tower.pos, enemies);
    tower.attack(closestEnemy);
    return;
  }

  const relEnergy = tower.energy / tower.energyCapacity;
  // We want at least 50% energy reserve in case we get attacked.
  if (relEnergy >=0.5) {
    // Prio 2: There were no enemies, so heal if necessary and your energy reserves are above 50%
    const hurtFriends = tower.room.find(FIND_MY_CREEPS, {filter: creep => creep.hits < creep.hitsMax});
    if (hurtFriends.length) {
      const closestHurtFriend = findHelpers.getClosestObjectFromList(tower.pos, hurtFriends);
      tower.heal(closestHurtFriend);
      return;
    }
    
    // Prio 3: We can repair buildings.
    const buildingsToRepair = tower.room.find(FIND_STRUCTURES, {filter: structure => {
      // only own structures, roads, walls and containers (which somehow do not call as own)
      if (
        !structure.my &&
        structure.structureType !== STRUCTURE_ROAD &&
        structure.structureType !== STRUCTURE_WALL &&
        structure.structureType !== STRUCTURE_CONTAINER
      ) {
        return false;
      }
      if (structure.hits === structure.hitsMax) {
        return false;
      }
      // if our energy is below 80%, we only repair close objects (as ist is more efficient)
      if (relEnergy < 0.8 && findHelper.squareDistance(structure.pos, tower.pos) > 10) {
        return false;
      }
      return true;
    }});
    if (buildingsToRepair.length) {
      const building = findHelpers.getClosestObjectFromList(tower.pos, buildingsToRepair);
      tower.repair(building);
    }
  }
};

module.exports = {
  towerBehavior: towerBehavior
};

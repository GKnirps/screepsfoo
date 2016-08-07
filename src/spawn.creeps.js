const roles = require('roles');

const countCreepsByRole = function(creeps) {
    return _.reduce(_.values(creeps), (counter, creep) => {
        const role = creep.memory.role;
        if (!role) {
            console.log('Creep ' + creep.name + ' has no role. Cannot count this creep.');
            return counter;
        }
        if (!(role in counter)) {
            counter[role] = 0;
        }
        counter[role] += 1;
        return counter;
    }, {});
};

const getRoomSpawnEnergyAndCapacity = function(room) {
  const spawnsAndExtensions = room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN);
    }
  });

  return _.reduce(spawnsAndExtensions, (sum, item) => {
    return [sum[0] + item.energy, sum[1] + item.energyCapacity];
  }, [0, 0]);
};

const buryCreeps = function(game, memory) {
    for(var name in memory.creeps) {
        if(!game.creeps[name]) {
            delete memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};

const BASIC_WORKER = [WORK, WORK, CARRY, MOVE]; // cost: 300
const BASIC_SPAWN_MAINTAINER = [WORK, CARRY, CARRY, MOVE, MOVE]; // cost: 300
const ADVANCED_SPAWN_MAINTAINER = [WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; // cost: 450
const ADVANCED_WORKER = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]; // cost: 500

const costForBody = function(body) {
  return _.reduce(body, (sum, part) => sum + BODYPART_COST[part], 0);
}

const spawnHarvesterAsNecessary = function(creepCount, spawn, capacity) {
  const sourcesCount = spawn.room.find(FIND_SOURCES).length;
  // we need no more than one harvester for each source
  const harvesterCount = creepCount[roles.HARVESTER];
  if (!harvesterCount || harvesterCount < sourcesCount) {
    const basicConfig = [CARRY, MOVE];
    const basicCost = costForBody(basicConfig);

    const capacityLeftForWork = capacity - basicCost;
    // TODO: this may need work, so large capacities this may end in a problem...
    const numberOfWorkParts = Math.floor(capacityLeftForWork / BODYPART_COST[WORK]);
    
    const body = Array(numberOfWorkParts).fill(WORK).concat(basicConfig);
    var newName = spawn.createCreep(body, undefined, {role: roles.HARVESTER});
    console.log("Spawned new harvester: " + newName);
  }
}

const spawnCreepsAsNecessary = function(creeps, spawn) {
    const creepCount = countCreepsByRole(creeps);
    const [energy, capacity] = getRoomSpawnEnergyAndCapacity(spawn.room);

    // Build bigger workers if possible
    let workerTemplate = BASIC_WORKER;
    if (capacity >= 500) {
      workerTemplate = ADVANCED_WORKER;
    }

    // panic mode! spawn attackers with priority if there are enemies
    if (spawn.room.find(FIND_HOSTILE_CREEPS).length > 0) {
      if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 3) {
          var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {role: roles.ATTACKER});
          console.log("Spawned new attacker: " + newName);
      }
    }
    let requiredSpawnMaintainers = 1;
    if (capacity >= 450) {
      requiredSpawnMaintainers = 2;
    }
    const availableSpawnMaintainers = (roles.SPAWN_MAINTAINER in creepCount) ? creepCount[roles.SPAWN_MAINTAINER] : 0;
    if (availableSpawnMaintainers < requiredSpawnMaintainers) {
        // if we do not have any spawn maintainer, and not enough to build a big one, build a small one to get things going.
        let maintainerTemplate = ADVANCED_SPAWN_MAINTAINER;
        if (energy < 450 && availableSpawnMaintainers === 0) {
          maintainerTemplate = BASIC_SPAWN_MAINTAINER;
        }
        var newName = spawn.createCreep(maintainerTemplate, undefined, {role: roles.SPAWN_MAINTAINER});
        console.log("Spawned new spawn maintainer: " + newName);
    }
    if (!(roles.UPGRADER in creepCount) || creepCount[roles.UPGRADER] < 2) {
        var newName = spawn.createCreep(workerTemplate, undefined, {role: roles.UPGRADER});
        console.log("Spawned new upgrader: " + newName);
    }
    if (!(roles.BUILDER in creepCount) || creepCount[roles.BUILDER] < 1) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            var newName = spawn.createCreep(workerTemplate, undefined, {role: roles.BUILDER});
            console.log("Spawned new builder: " + newName);
        }
    }
    if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 1) {
        var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {role: roles.ATTACKER});
        console.log("Spawned new attacker: " + newName);
    }
    if (!(roles.REPAIRMAN in creepCount) || creepCount[roles.REPAIRMAN] < 1) {
      // We only start repairing if the room has a minimum capacity
      if (capacity >= 500) {
        var newName = spawn.createCreep(workerTemplate, undefined, {role: roles.REPAIRMAN});
        console.log("It's BICYCLE REPAIR MAN!: " + newName);
      }
    }
    spawnHarvesterAsNecessary(creepCount, spawn, capacity);
}

const manageCreeps = function(game, memory) {
  buryCreeps(game, memory);
  spawnCreepsAsNecessary(game.creeps, Game.spawns['Nest']);
}

module.exports = {
    countCreepsByRole: countCreepsByRole,
    manageCreeps: manageCreeps
};

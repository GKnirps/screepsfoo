const roles = require('roles');
const archetypes = require('archetypes');

const countCreepsByRole = function(creeps) {
    return _.reduce(_.values(creeps), (counter, creep) => {
        const role = creep.memory.role;
        if (!role) {
            console.log('Creep ' + creep.name + ' has no role. Cannot count this creep.');
            return counter;
        }
        const roomName = creep.room.name;
        if (!(roomName in counter)) {
          counter[roomName] = {};
        }
        if (!(role in counter[roomName])) {
            counter[roomName][role] = 0;
        }
        counter[roomName][role] += 1;
        return counter;
    }, {});
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

const spawnHarvesterAsNecessary = function(creepCount, spawn, energy, capacity) {
  const sourcesCount = spawn.room.find(FIND_SOURCES).length;
  // we need no more than one harvester for each source
  const harvesterCount = creepCount[roles.HARVESTER];
  if (!harvesterCount || harvesterCount < sourcesCount) {
    const basicConfig = [CARRY, MOVE];
    const basicCost = costForBody(basicConfig);

    const capacityLeftForWork = capacity - basicCost;
    let numberOfWorkParts = Math.floor(capacityLeftForWork / BODYPART_COST[WORK]);
    // If we do not have enough energy to spawn more than five parts, just spawn five of them
    if (numberOfWorkParts > 5 && basicCost + BODYPART_COST[WORK] * numberOfWorkParts > energy) {
      numberOfWorkParts = 5;
    }
    if (numberOfWorkParts > 7) {
      numberOfWorkParts = 7;
    }
    
    const body = Array(numberOfWorkParts).fill(WORK).concat(basicConfig);
    const newName = spawn.createCreep(body, undefined, {role: roles.HARVESTER, archetype: archetypes.STATIONARY_WORKER.name});
    console.log("Spawned new harvester: " + newName);
    return true;
  }
  return false;
}

const spawnCreepsAsNecessary = function(creepCount, spawn) {
    const energy = spawn.room.energyAvailable;
    const capacity = spawn.room.energyCapacityAvailable;

    // Build bigger workers if possible
    let workerTemplate = BASIC_WORKER;
    if (capacity >= 500) {
      workerTemplate = ADVANCED_WORKER;
    }

    // panic mode! spawn attackers with priority if there are enemies
    if (spawn.room.find(FIND_HOSTILE_CREEPS).length > 0) {
      if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 3) {
          var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {
            role: roles.ATTACKER,
            archetype: archetypes.MELEE.name
          });
          console.log("Spawned new attacker: " + newName);
      }
    }
    let requiredSpawnMaintainers = 1;
    if (capacity >= 450) {
      requiredSpawnMaintainers = 2;
    }
    const availableSpawnMaintainers = (roles.SPAWN_MAINTAINER in creepCount) ? creepCount[roles.SPAWN_MAINTAINER] : 0;
    const availableHarvesters = (roles.HARVESTER in creepCount) ? creepCount[roles.HARVESTER] : 0;
    if (availableSpawnMaintainers > 0 && availableHarvesters === 0) {
      if (spawnHarvesterAsNecessary(creepCount, spawn, energy, capacity)) {
        // Don't fucking overwrite this with other spawn commands!
        return;
      }
    }
    if (availableSpawnMaintainers < requiredSpawnMaintainers) {
        // if we do not have any spawn maintainer, and not enough to build a big one, build a small one to get things going.
        let maintainerTemplate = ADVANCED_SPAWN_MAINTAINER;
        if (energy < 450 && availableSpawnMaintainers === 0) {
          maintainerTemplate = BASIC_SPAWN_MAINTAINER;
        }
        var newName = spawn.createCreep(maintainerTemplate, undefined, {
          role: roles.SPAWN_MAINTAINER,
          archetype: archetypes.TRANSPORTER.name
        });
        console.log("Spawned new spawn maintainer: " + newName);
        return;
    }
    spawnHarvesterAsNecessary(creepCount, spawn, energy, capacity);
    if (!(roles.UPGRADER in creepCount) || creepCount[roles.UPGRADER] < 2) {
        var newName = spawn.createCreep(workerTemplate, undefined, {
          role: roles.UPGRADER,
          archetype: archetypes.MOBILE_WORKER.name
        });
        console.log("Spawned new upgrader: " + newName);
        return;
    }
    if (!(roles.BUILDER in creepCount) || creepCount[roles.BUILDER] < 1) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            var newName = spawn.createCreep(workerTemplate, undefined, {
              role: roles.BUILDER,
              archetype: archetypes.MOBILE_WORKER.name
            });
            console.log("Spawned new builder: " + newName);
            return;
        }
    }
    if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 1) {
        var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {
          role: roles.ATTACKER,
          archetype: archetypes.MELEE.name
        });
        console.log("Spawned new attacker: " + newName);
        return;
    }
    if (!(roles.REPAIRMAN in creepCount) || creepCount[roles.REPAIRMAN] < 1) {
      // We only start repairing if the room has a minimum capacity
      if (capacity >= 500) {
        var newName = spawn.createCreep(workerTemplate, undefined, {
          role: roles.REPAIRMAN,
          archetype: archetypes.MOBILE_WORKER.name
        });
        console.log("It's BICYCLE REPAIR MAN!: " + newName);
        return;
      }
    }
}

const manageCreeps = function(game, memory, spawns) {
  buryCreeps(game, memory);
  const creepCounts = countCreepsByRole(game.creeps); 
  _.forEach(spawns, spawn => {
    let creepCount = creepCounts[spawn.room.name];
    if (!creepCount) {
      creepCount = {};
    }
    spawnCreepsAsNecessary(creepCount, spawn);
  })
}

module.exports = {
    manageCreeps: manageCreeps
};

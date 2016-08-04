const roles = require('roles');

const countCreepsByRole = function(creeps) {
    return _.reduce(_.values(creeps), (counter, creep) => {
        const role = creep.memory.role;
        if (!role) {
            console.log('Creep ' + creep.name + ' has no name. Cannot count this creep.');
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

const BASIC_WORKER = [WORK, CARRY, MOVE]; // cost: 200
const ADVANCED_WORKER = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]; // cost: 500

const spawnCreepsAsNecessary = function(creeps, spawn) {
    const creepCount = countCreepsByRole(creeps);
    const [energy, capacity] = getRoomSpawnEnergyAndCapacity(spawn.room);

    // Build bigger workers if possible
    let workerTemplate = BASIC_WORKER;
    if (capacity >= 500) {
      workerTemplate = ADVANCED_WORKER;
    }

    // panic mode! spawn attackers with priority if there are enemies
    if (spawn.room.find(HOSTILE_CREEPS)) {
      if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 3) {
          var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {role: roles.ATTACKER});
          console.log("Spawned new attacker: " + newName);
      }
    }
    if (!(roles.HARVESTER in creepCount) || creepCount[roles.HARVESTER] < 1) {
        // if we do not have any harvesters, and not enough to build a big one, build a small one to get things going.
        let harvesterTemplate = workerTemplate;
        if (energy < 500 && !creepCount[roles.HARVESTER]) {
          harvesterTemplate = BASIC_WORKER;
        }
        var newName = spawn.createCreep(workerTemplate, undefined, {role: roles.HARVESTER});
        console.log("Spawned new harvester: " + newName);
    }
    if (!(roles.UPGRADER in creepCount) || creepCount[roles.UPGRADER] < 2) {
        var newName = spawn.createCreep(workerTemplate, undefined, {role: roles.UPGRADER});
        console.log("Spawned new upgrader: " + newName);
    }
    if (!(roles.BUILDER in creepCount) || creepCount[roles.BUILDER] < 2) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES)) {
            var newName = spawn.createCreep(workerTemplate, undefined, {role: roles.BUILDER});
            console.log("Spawned new builder: " + newName);
        }
    }
    if (!(roles.ATTACKER in creepCount) || creepCount[roles.ATTACKER] < 1) {
        var newName = spawn.createCreep([ATTACK, ATTACK,MOVE, MOVE], undefined, {role: roles.ATTACKER});
        console.log("Spawned new attacker: " + newName);
    }
}

const manageCreeps = function(game, memory) {
  buryCreeps(game, memory);
  spawnCreepsAsNecessary(game.creeps, Game.spawns['Nest']);
}

module.exports = {
    countCreepsByRole: countCreepsByRole,
    manageCreeps: manageCreeps
};

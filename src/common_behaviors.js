const findHelpers = require('helpers.find');
const roles = require('roles');

const getEnergyFromClosestHarvester = function(creep) {
  // TODO: to be more efficient, we should search for harvesters not more than once per tick and store the result by room id.
  const harvesters = findHelpers.findCreepsInRoomByRole(creep.room, roles.HARVESTER);
  const harvestingHarvesters = _.filter(harvesters, harv => harv.memory.harvesting);
  const closestHarvester = findHelpers.getClosestObjectFromList(creep.pos, harvesters);

  if (closestHarvester && closestHarvester.transfer(creep, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(closestHarvester);
  }
}

module.exports = {
  getEnergyFromClosestHarvester: getEnergyFromClosestHarvester
};

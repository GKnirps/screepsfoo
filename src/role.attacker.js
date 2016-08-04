const roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles) {
            const hostile = hostiles[0];
            if(creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile);
            }
        }
    }
        
};

module.exports = roleAttacker;

module.exports = {
  /**
   * Creep with high number of work parts, low number of move and carry parts.
   * Is supposed to put or take its resources from/into some sort of storage.
   * Example: Harvester
   */
  STATIONARY_WORKER: {
    name: "stationary_worker"
  },
  /**
   * Creep with a medium number of work and carry parts, and enough move parts to move fast.
   * Example: Builder, Repairman
   */
  MOBILE_WORKER: {
    name: "mobile_worker"
  },
  /**
   * Creep with a high number of carry parts, one work part and enough move parts to move fast.
   * Example: spawn maintainer
   */
  TRANSPORTER: {
    name: "transporter"
  },
  /**
   * Fast creep with tough, attack and move parts.
   */
  MELEE: {
    name: "melee"
  },
  /**
   * Creep to claim other rooms.
   */
  COLONIZER: {
    name: "colonizer"
  },
};

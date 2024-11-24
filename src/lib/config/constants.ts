export const MEMORY_TYPES = ['declarative', 'procedural', 'episodic', 'intentional'] as const;

export const SYSTEM_CONSTANTS = {
  DEFAULT_ENERGY: 1.0,
  DEFAULT_RESONANCE: 0.5,
  MAX_HISTORY_DURATION: 86400000, // 24 hours
  UPDATE_INTERVAL: 5000,
  MEMORY_NORMALIZATION_FACTOR: 1000,
  CONNECTION_NORMALIZATION_FACTOR: 5000,
  MEMORY_LOAD_WEIGHT: 0.3,
  CONNECTION_LOAD_WEIGHT: 0.7
} as const;

export const DB_CONFIG = {
  NAME: 'echocog',
  VERSION: 1,
  STORES: {
    MEMORIES: '++id, type, timestamp, [type+timestamp], *tags'
  }
} as const;
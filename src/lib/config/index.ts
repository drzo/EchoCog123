export const METRICS_CONFIG = {
  UPDATE_INTERVAL: 5000,
  HISTORY_DURATION: 86400000, // 24 hours
  BATCH_SIZE: 100,
  DEBOUNCE_TIME: 100,
  THRESHOLDS: {
    HIGH_LOAD: 0.8,
    MEDIUM_LOAD: 0.5,
    LOW_LOAD: 0.2
  },
  WEIGHTS: {
    MEMORY: 0.3,
    CONNECTIONS: 0.7,
    RESONANCE: 0.4,
    ENERGY: 0.6
  },
  CACHE_SIZE: 1000,
  PRUNE_THRESHOLD: 0.9
} as const;

export const SYNC_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 50,
  EVENT_DEBOUNCE: 100,
  BROADCAST_DEBOUNCE: 200,
  INSTANCE_TIMEOUT: 30000, // 30 seconds
  MAX_QUEUE_SIZE: 1000
} as const;

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
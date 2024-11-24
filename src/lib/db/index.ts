import Dexie from 'dexie';
import { DB_CONFIG } from '../constants';
import { createMemoryHooks } from './hooks';
import type { DBSchema } from './schema';

export class EchoCogDB extends Dexie {
  memories!: Dexie.Table<DBSchema['memories'], string>;

  constructor() {
    super(DB_CONFIG.NAME);
    
    this.version(DB_CONFIG.VERSION).stores({
      memories: DB_CONFIG.STORES.MEMORIES
    });

    const hooks = createMemoryHooks(this.memories);
    
    this.memories.hook('creating', hooks.creating);
    this.memories.hook('updating', hooks.updating);
    this.memories.hook('deleting', hooks.deleting);
  }

  async searchByTag(tag: string) {
    return this.memories.where('tags').equals(tag).toArray();
  }

  async getRecentMemories(limit = 10) {
    return this.memories
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getMemoriesByType(type: DBSchema['memories']['type']) {
    return this.memories
      .where('type')
      .equals(type)
      .toArray();
  }
}

export const db = new EchoCogDB();
import Dexie, { Table } from 'dexie';
import type { Memory } from './store';

export class EchoCogDB extends Dexie {
  memories!: Table<Memory>;

  constructor() {
    super('echocog');
    
    this.version(1).stores({
      memories: '++id, type, timestamp, [type+timestamp], *tags'
    });

    this.memories.hook('creating', function(primKey, obj, trans) {
      obj.timestamp = Date.now();
      obj.version = 1;
    });

    this.memories.hook('updating', function(mods, primKey, obj, trans) {
      if (mods.hasOwnProperty('version')) {
        return mods;
      }
      return { ...mods, version: (obj.version || 0) + 1 };
    });
  }

  async searchByTag(tag: string): Promise<Memory[]> {
    return this.memories.where('tags').equals(tag).toArray();
  }

  async getRecentMemories(limit = 10): Promise<Memory[]> {
    return this.memories
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getMemoriesByType(type: Memory['type']): Promise<Memory[]> {
    return this.memories
      .where('type')
      .equals(type)
      .toArray();
  }
}

export const db = new EchoCogDB();
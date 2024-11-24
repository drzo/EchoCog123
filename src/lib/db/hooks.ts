import { Table } from 'dexie';
import type { DBMemory } from './schema';

export function createMemoryHooks(table: Table<DBMemory>) {
  return {
    creating: function(primKey: string, obj: DBMemory) {
      obj.timestamp = Date.now();
      obj.version = 1;
      return obj;
    },

    updating: function(mods: Partial<DBMemory>, primKey: string, obj: DBMemory) {
      if (!mods.hasOwnProperty('version')) {
        return { ...mods, version: (obj.version || 0) + 1 };
      }
      return mods;
    },

    deleting: function(primKey: string, obj: DBMemory) {
      // Optional: Add any cleanup logic before deletion
      return true;
    }
  };
}
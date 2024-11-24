import { useCallback } from 'react';
import { useEchoCogStore } from '../store';
import { validateMemory, validateConnection } from '../utils/validation';
import { SYSTEM_CONSTANTS } from '../constants';
import type { Memory } from '../types';
import { db } from '../db';

export function useMemoryOperations() {
  const store = useEchoCogStore();

  const createMemory = useCallback(async (
    type: Memory['type'],
    content: string,
    tags: string[] = []
  ) => {
    const memory: Partial<Memory> = {
      type,
      content,
      tags,
      energy: SYSTEM_CONSTANTS.DEFAULT_ENERGY,
      resonance: SYSTEM_CONSTANTS.DEFAULT_RESONANCE,
      connections: []
    };

    if (!validateMemory(memory)) {
      throw new Error('Invalid memory data');
    }

    return store.addMemory(type, content, tags);
  }, [store]);

  const addTags = useCallback(async (
    ids: string[],
    tags: string[]
  ) => {
    await Promise.all(ids.map(async (id) => {
      const memory = await db.memories.get(id);
      if (memory) {
        const newTags = [...new Set([...memory.tags, ...tags])];
        await db.memories.update(id, { tags: newTags });
      }
    }));
  }, []);

  const deleteMemories = useCallback(async (
    ids: string[]
  ) => {
    await Promise.all(ids.map(id => store.removeMemory(id)));
  }, [store]);

  const exportMemories = useCallback(async () => {
    const memories = await db.memories.toArray();
    return {
      version: 1,
      timestamp: Date.now(),
      memories
    };
  }, []);

  const importMemories = useCallback(async (
    data: { version: number; memories: Memory[] }
  ) => {
    if (data.version !== 1) {
      throw new Error('Unsupported export version');
    }

    await db.transaction('rw', db.memories, async () => {
      for (const memory of data.memories) {
        if (validateMemory(memory)) {
          await db.memories.put(memory);
        }
      }
    });
  }, []);

  return {
    createMemory,
    addTags,
    deleteMemories,
    exportMemories,
    importMemories,
    connectMemories: store.connectMemories,
    updateMemoryEnergy: store.updateMemoryEnergy,
    searchMemories: store.searchMemories
  };
}
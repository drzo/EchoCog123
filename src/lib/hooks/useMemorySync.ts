import { useEffect } from 'react';
import { useEchoCogStore } from '../store';
import { SyncManager } from '../services/sync';
import type { Memory } from '../types';

const syncManager = new SyncManager();

export function useMemorySync() {
  const store = useEchoCogStore();

  useEffect(() => {
    const instanceId = crypto.randomUUID();
    syncManager.addInstance(instanceId);

    const handleMemoryAdd = async (memory: Memory) => {
      syncManager.broadcast({
        type: 'add',
        payload: memory
      });
    };

    const handleMemoryUpdate = async (id: string, updates: Partial<Memory>) => {
      syncManager.broadcast({
        type: 'update',
        payload: { id, ...updates }
      });
    };

    const handleMemoryRemove = async (id: string) => {
      syncManager.broadcast({
        type: 'remove',
        payload: id
      });
    };

    // Subscribe to store changes
    const unsubscribe = store.subscribe((state, prevState) => {
      // Handle memory additions
      Object.keys(state.memories).forEach(id => {
        if (!prevState.memories[id]) {
          handleMemoryAdd(state.memories[id]);
        }
      });

      // Handle memory updates
      Object.entries(state.memories).forEach(([id, memory]) => {
        const prevMemory = prevState.memories[id];
        if (prevMemory && memory.version !== prevMemory.version) {
          handleMemoryUpdate(id, memory);
        }
      });

      // Handle memory removals
      Object.keys(prevState.memories).forEach(id => {
        if (!state.memories[id]) {
          handleMemoryRemove(id);
        }
      });
    });

    return () => {
      unsubscribe();
      syncManager.removeInstance(instanceId);
    };
  }, [store]);

  return syncManager;
}
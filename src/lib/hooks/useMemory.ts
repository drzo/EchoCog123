import { useCallback } from 'react';
import { useEchoCogStore } from '../store';
import { useEchoCogContext } from '../context';
import type { Memory } from '../types';

export function useMemory(id: string | null) {
  const store = useEchoCogStore();
  const context = useEchoCogContext();

  const memory = id ? store.memories[id] : null;
  const connectedMemories = id ? store.getConnectedMemories(id) : [];

  const updateEnergy = useCallback(async (delta: number) => {
    if (id) {
      await store.updateMemoryEnergy(id, delta);
    }
  }, [id, store]);

  const connect = useCallback(async (targetId: string) => {
    if (id) {
      await store.connectMemories(id, targetId);
    }
  }, [id, store]);

  const remove = useCallback(async () => {
    if (id) {
      await store.removeMemory(id);
      if (context.focusedMemoryId === id) {
        context.setFocusedMemory(null);
      }
    }
  }, [id, store, context]);

  return {
    memory,
    connectedMemories,
    updateEnergy,
    connect,
    remove,
    isActive: context.focusedMemoryId === id
  };
}
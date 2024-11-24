import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { db } from './db';

export interface Memory {
  id: string;
  type: 'declarative' | 'procedural' | 'episodic' | 'intentional';
  content: string;
  connections: string[];
  energy: number;
  resonance: number;
  timestamp: number;
  tags: string[];
  version: number;
}

interface EchoCogState {
  memories: Record<string, Memory>;
  addMemory: (type: Memory['type'], content: string, tags?: string[]) => Promise<string>;
  connectMemories: (sourceId: string, targetId: string) => Promise<void>;
  updateMemoryEnergy: (id: string, delta: number) => Promise<void>;
  removeMemory: (id: string) => Promise<void>;
  getConnectedMemories: (id: string) => Memory[];
  searchMemories: (query: string) => Memory[];
}

export const useEchoCogStore = create<EchoCogState>()(
  immer((set, get) => ({
    memories: {},
    
    addMemory: async (type, content, tags = []) => {
      const id = nanoid();
      const memory: Memory = {
        id,
        type,
        content,
        connections: [],
        energy: 1.0,
        resonance: 0.5,
        timestamp: Date.now(),
        tags,
        version: 1
      };

      await db.memories.add(memory);
      
      set((state) => {
        state.memories[id] = memory;
      });

      return id;
    },

    connectMemories: async (sourceId, targetId) => {
      set((state) => {
        const source = state.memories[sourceId];
        const target = state.memories[targetId];
        
        if (source && target) {
          if (!source.connections.includes(targetId)) {
            source.connections.push(targetId);
            source.version++;
          }
          if (!target.connections.includes(sourceId)) {
            target.connections.push(sourceId);
            target.version++;
          }
        }
      });

      await Promise.all([
        db.memories.update(sourceId, { connections: get().memories[sourceId].connections, version: get().memories[sourceId].version }),
        db.memories.update(targetId, { connections: get().memories[targetId].connections, version: get().memories[targetId].version })
      ]);
    },

    updateMemoryEnergy: async (id, delta) => {
      set((state) => {
        const memory = state.memories[id];
        if (memory) {
          memory.energy = Math.max(0, Math.min(1, memory.energy + delta));
          memory.version++;
        }
      });

      await db.memories.update(id, { 
        energy: get().memories[id].energy,
        version: get().memories[id].version 
      });
    },

    removeMemory: async (id) => {
      set((state) => {
        const memory = state.memories[id];
        if (memory) {
          // Remove connections from other memories
          memory.connections.forEach(connectedId => {
            const connected = state.memories[connectedId];
            if (connected) {
              connected.connections = connected.connections.filter(c => c !== id);
              connected.version++;
            }
          });
          delete state.memories[id];
        }
      });

      await db.memories.delete(id);
    },

    getConnectedMemories: (id) => {
      const state = get();
      const memory = state.memories[id];
      if (!memory) return [];
      
      return memory.connections
        .map(connId => state.memories[connId])
        .filter((m): m is Memory => m !== undefined);
    },

    searchMemories: (query) => {
      const state = get();
      const lowercaseQuery = query.toLowerCase();
      
      return Object.values(state.memories).filter(memory => 
        memory.content.toLowerCase().includes(lowercaseQuery) ||
        memory.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }
  }))
);
import { db } from '../db';
import type { Memory } from '../types';
import { validateMemory, validateConnection } from '../utils/validation';
import { SYSTEM_CONSTANTS } from '../constants';
import { calculateMemoryResonance } from '../utils/memory';

export class MemoryManager {
  private memoryCache = new Map<string, Memory>();

  async createMemory(type: Memory['type'], content: string, tags: string[] = []): Promise<string> {
    const memory: Partial<Memory> = {
      type,
      content,
      tags,
      energy: SYSTEM_CONSTANTS.DEFAULT_ENERGY,
      resonance: SYSTEM_CONSTANTS.DEFAULT_RESONANCE,
      connections: [],
      timestamp: Date.now(),
      version: 1,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    if (!validateMemory(memory)) {
      throw new Error('Invalid memory data');
    }

    const id = await db.memories.add(memory as Memory);
    this.memoryCache.set(id, memory as Memory);
    return id;
  }

  async getMemory(id: string): Promise<Memory | undefined> {
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id);
    }

    const memory = await db.memories.get(id);
    if (memory) {
      this.memoryCache.set(id, memory);
      await this.updateAccessStats(id);
    }
    return memory;
  }

  async connectMemories(sourceId: string, targetId: string): Promise<void> {
    if (!validateConnection(sourceId, targetId)) {
      throw new Error('Invalid connection');
    }

    const [source, target] = await Promise.all([
      this.getMemory(sourceId),
      this.getMemory(targetId)
    ]);

    if (!source || !target) {
      throw new Error('Memory not found');
    }

    await Promise.all([
      db.memories.update(sourceId, {
        connections: [...source.connections, targetId],
        version: source.version + 1
      }),
      db.memories.update(targetId, {
        connections: [...target.connections, sourceId],
        version: target.version + 1
      })
    ]);

    // Update cache
    this.memoryCache.set(sourceId, {
      ...source,
      connections: [...source.connections, targetId],
      version: source.version + 1
    });
    this.memoryCache.set(targetId, {
      ...target,
      connections: [...target.connections, sourceId],
      version: target.version + 1
    });
  }

  async updateMemoryEnergy(id: string, delta: number): Promise<void> {
    const memory = await this.getMemory(id);
    if (!memory) {
      throw new Error('Memory not found');
    }

    const newEnergy = Math.max(0, Math.min(1, memory.energy + delta));
    const updates = {
      energy: newEnergy,
      version: memory.version + 1
    };

    await db.memories.update(id, updates);
    this.memoryCache.set(id, { ...memory, ...updates });
  }

  async updateMemoryResonance(id: string, contextTags: Set<string>): Promise<void> {
    const memory = await this.getMemory(id);
    if (!memory) {
      throw new Error('Memory not found');
    }

    const newResonance = calculateMemoryResonance(memory, contextTags);
    const updates = {
      resonance: newResonance,
      version: memory.version + 1
    };

    await db.memories.update(id, updates);
    this.memoryCache.set(id, { ...memory, ...updates });
  }

  async searchMemories(query: string, type?: Memory['type']): Promise<Memory[]> {
    let collection = db.memories.toCollection();
    
    if (type) {
      collection = collection.filter(m => m.type === type);
    }

    const memories = await collection.toArray();
    const lowercaseQuery = query.toLowerCase();
    
    return memories.filter(memory => 
      memory.content.toLowerCase().includes(lowercaseQuery) ||
      memory.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  private async updateAccessStats(id: string): Promise<void> {
    const memory = await db.memories.get(id);
    if (!memory) return;

    const updates = {
      accessCount: (memory.accessCount || 0) + 1,
      lastAccessed: Date.now(),
      version: memory.version + 1
    };

    await db.memories.update(id, updates);
    this.memoryCache.set(id, { ...memory, ...updates });
  }

  clearCache(): void {
    this.memoryCache.clear();
  }
}
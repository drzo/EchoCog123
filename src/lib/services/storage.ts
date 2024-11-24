import { db } from '../db';
import type { Memory } from '../types';
import { validateMemory } from '../utils/validation';

export class StorageService {
  async createMemory(memory: Partial<Memory>): Promise<string> {
    if (!validateMemory(memory)) {
      throw new Error('Invalid memory data');
    }
    
    const id = await db.memories.add(memory as Memory);
    return id.toString();
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<void> {
    await db.memories.update(id, updates);
  }

  async deleteMemory(id: string): Promise<void> {
    await db.memories.delete(id);
  }

  async getMemory(id: string): Promise<Memory | undefined> {
    return db.memories.get(id);
  }

  async searchMemories(query: string, type?: Memory['type']): Promise<Memory[]> {
    let collection = db.memories.toCollection();
    
    if (type) {
      collection = db.memories.where('type').equals(type);
    }

    const memories = await collection.toArray();
    const lowercaseQuery = query.toLowerCase();
    
    return memories.filter(memory => 
      memory.content.toLowerCase().includes(lowercaseQuery) ||
      memory.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getMemoriesByTag(tag: string): Promise<Memory[]> {
    return db.memories.where('tags').equals(tag).toArray();
  }

  async getRecentMemories(limit: number = 10): Promise<Memory[]> {
    return db.memories
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }
}
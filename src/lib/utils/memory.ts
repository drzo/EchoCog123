import type { Memory } from '../types';

export function calculateMemoryResonance(memory: Memory, contextTags: Set<string>): number {
  const tagOverlap = memory.tags.filter(tag => contextTags.has(tag)).length;
  const tagFactor = memory.tags.length > 0 ? tagOverlap / memory.tags.length : 0;
  
  return (memory.energy * 0.6) + (tagFactor * 0.4);
}

export function sortMemoriesByResonance(memories: Memory[], contextTags: Set<string>): Memory[] {
  return [...memories].sort((a, b) => {
    const resonanceA = calculateMemoryResonance(a, contextTags);
    const resonanceB = calculateMemoryResonance(b, contextTags);
    return resonanceB - resonanceA;
  });
}

export function filterMemoriesByType(memories: Memory[], type: Memory['type']): Memory[] {
  return memories.filter(memory => memory.type === type);
}

export function getMemoryStats(memories: Memory[]) {
  const typeCount = memories.reduce((acc, memory) => {
    acc[memory.type] = (acc[memory.type] || 0) + 1;
    return acc;
  }, {} as Record<Memory['type'], number>);

  const avgEnergy = memories.reduce((sum, memory) => sum + memory.energy, 0) / memories.length;

  const connectionCount = memories.reduce((sum, memory) => sum + memory.connections.length, 0);

  return {
    typeCount,
    avgEnergy,
    connectionCount,
    totalMemories: memories.length
  };
}
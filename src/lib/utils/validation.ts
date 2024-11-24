import type { Memory } from '../types';

export function validateMemory(memory: Partial<Memory>): boolean {
  if (!memory.type || !['declarative', 'procedural', 'episodic', 'intentional'].includes(memory.type)) {
    return false;
  }

  if (!memory.content || typeof memory.content !== 'string' || memory.content.trim().length === 0) {
    return false;
  }

  if (memory.energy !== undefined && (memory.energy < 0 || memory.energy > 1)) {
    return false;
  }

  if (memory.resonance !== undefined && (memory.resonance < 0 || memory.resonance > 1)) {
    return false;
  }

  if (memory.tags && !Array.isArray(memory.tags)) {
    return false;
  }

  if (memory.connections && !Array.isArray(memory.connections)) {
    return false;
  }

  return true;
}

export function validateConnection(sourceId: string, targetId: string): boolean {
  if (!sourceId || !targetId) {
    return false;
  }

  if (sourceId === targetId) {
    return false;
  }

  return true;
}

export function validateTag(tag: string): boolean {
  return typeof tag === 'string' && tag.trim().length > 0;
}
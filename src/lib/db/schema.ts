import { MEMORY_TYPES } from '../constants';

export type MemoryType = typeof MEMORY_TYPES[number];

export interface DBMemory {
  id?: string;
  type: MemoryType;
  content: string;
  connections: string[];
  energy: number;
  resonance: number;
  timestamp: number;
  tags: string[];
  version: number;
}

export interface DBSchema {
  memories: DBMemory;
}
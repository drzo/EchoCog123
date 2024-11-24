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
  lastAccessed?: number;
  accessCount?: number;
}

export interface SystemMetrics {
  memoryCount: number;
  averageEnergy: number;
  activeConnections: number;
  systemLoad: number;
  memoryTypeDistribution: Record<string, number>;
  recentChanges: number;
  timestamp?: number;
  energyDistribution?: Record<string, number>;
  resonanceDistribution?: Record<string, number>;
  accessPatterns?: Record<string, number>;
}

export interface SyncEvent {
  type: 'add' | 'update' | 'connect' | 'remove';
  payload: any;
  instanceId: string;
  timestamp: number;
  priority?: number;
  retryCount?: number;
}

export interface ContextState {
  activeMemories: Memory[];
  focusedMemoryId: string | null;
  contextualResonance: number;
  memoryStack: string[];
  contextTags: Set<string>;
  lastUpdate?: number;
  loadStatus?: 'low' | 'medium' | 'high';
}

export interface ContextActions {
  setFocusedMemory: (id: string | null) => Promise<void>;
  updateContextualResonance: (value: number) => void;
  pushMemoryContext: (id: string) => void;
  popMemoryContext: () => void;
  addContextTag: (tag: string) => void;
  removeContextTag: (tag: string) => void;
}
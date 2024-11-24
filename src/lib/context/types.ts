import type { Memory } from '../types';

export interface ContextState {
  activeMemories: Memory[];
  focusedMemoryId: string | null;
  contextualResonance: number;
  memoryStack: string[];
  contextTags: Set<string>;
}

export interface ContextActions {
  setFocusedMemory: (id: string | null) => Promise<void>;
  updateContextualResonance: (value: number) => void;
  pushMemoryContext: (id: string) => void;
  popMemoryContext: () => void;
  addContextTag: (tag: string) => void;
  removeContextTag: (tag: string) => void;
}

export type ContextValue = ContextState & ContextActions;
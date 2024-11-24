import { createContext, useContext, useEffect, useState } from 'react';
import type { Memory } from './store';
import { db } from './db';

interface ContextState {
  activeMemories: Memory[];
  focusedMemoryId: string | null;
  contextualResonance: number;
  memoryStack: string[];
  contextTags: Set<string>;
}

interface ContextActions {
  setFocusedMemory: (id: string | null) => Promise<void>;
  updateContextualResonance: (value: number) => void;
  pushMemoryContext: (id: string) => void;
  popMemoryContext: () => void;
  addContextTag: (tag: string) => void;
  removeContextTag: (tag: string) => void;
}

type EchoCogContextType = ContextState & ContextActions;

const initialState: ContextState = {
  activeMemories: [],
  focusedMemoryId: null,
  contextualResonance: 0.5,
  memoryStack: [],
  contextTags: new Set()
};

const initialActions: ContextActions = {
  setFocusedMemory: async () => {},
  updateContextualResonance: () => {},
  pushMemoryContext: () => {},
  popMemoryContext: () => {},
  addContextTag: () => {},
  removeContextTag: () => {}
};

export const EchoCogContext = createContext<EchoCogContextType>({
  ...initialState,
  ...initialActions
});

export function useEchoCogContext() {
  return useContext(EchoCogContext);
}

export function EchoCogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContextState>(initialState);

  useEffect(() => {
    if (state.focusedMemoryId) {
      loadActiveMemories(state.focusedMemoryId);
    }
  }, [state.focusedMemoryId]);

  const loadActiveMemories = async (focusedId: string) => {
    const memory = await db.memories.get(focusedId);
    if (!memory) return;

    const connected = await Promise.all(
      memory.connections.map(id => db.memories.get(id))
    );

    setState(prev => ({
      ...prev,
      activeMemories: [memory, ...connected.filter((m): m is Memory => m !== undefined)]
    }));
  };

  const contextValue: EchoCogContextType = {
    ...state,
    setFocusedMemory: async (id) => {
      setState(prev => ({ ...prev, focusedMemoryId: id }));
    },
    updateContextualResonance: (value) => {
      setState(prev => ({ ...prev, contextualResonance: value }));
    },
    pushMemoryContext: (id) => {
      setState(prev => ({
        ...prev,
        memoryStack: [...prev.memoryStack, id]
      }));
    },
    popMemoryContext: () => {
      setState(prev => ({
        ...prev,
        memoryStack: prev.memoryStack.slice(0, -1)
      }));
    },
    addContextTag: (tag) => {
      setState(prev => ({
        ...prev,
        contextTags: new Set([...prev.contextTags, tag])
      }));
    },
    removeContextTag: (tag) => {
      setState(prev => {
        const newTags = new Set(prev.contextTags);
        newTags.delete(tag);
        return { ...prev, contextTags: newTags };
      });
    }
  };

  return (
    <EchoCogContext.Provider value={contextValue}>
      {children}
    </EchoCogContext.Provider>
  );
}
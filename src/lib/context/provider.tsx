import React, { createContext, useContext } from 'react';
import { useContextState } from './state';
import type { ContextValue } from './types';
import { StorageService } from '../services/storage';
import type { Memory } from '../types';

const storage = new StorageService();

const initialState: ContextValue = {
  activeMemories: [],
  focusedMemoryId: null,
  contextualResonance: 0.5,
  memoryStack: [],
  contextTags: new Set(),
  setFocusedMemory: async () => {},
  updateContextualResonance: () => {},
  pushMemoryContext: () => {},
  popMemoryContext: () => {},
  addContextTag: () => {},
  removeContextTag: () => {}
};

export const EchoCogContext = createContext<ContextValue>(initialState);

export function useEchoCogContext() {
  const context = useContext(EchoCogContext);
  if (!context) {
    throw new Error('useEchoCogContext must be used within an EchoCogProvider');
  }
  return context;
}

interface EchoCogProviderProps {
  children: React.ReactNode;
}

export function EchoCogProvider({ children }: EchoCogProviderProps) {
  const [state, setState] = useContextState();

  const contextValue: ContextValue = {
    ...state,
    setFocusedMemory: async (id: string | null) => {
      if (id) {
        const memory = await storage.getMemory(id);
        if (memory) {
          const connected = await Promise.all(
            memory.connections.map(connId => storage.getMemory(connId))
          );

          setState(prev => ({
            ...prev,
            focusedMemoryId: id,
            activeMemories: [memory, ...connected.filter((m): m is Memory => m !== undefined)]
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          focusedMemoryId: null,
          activeMemories: []
        }));
      }
    },
    updateContextualResonance: (value: number) => {
      setState(prev => ({ ...prev, contextualResonance: value }));
    },
    pushMemoryContext: (id: string) => {
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
    addContextTag: (tag: string) => {
      setState(prev => ({
        ...prev,
        contextTags: new Set([...prev.contextTags, tag])
      }));
    },
    removeContextTag: (tag: string) => {
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
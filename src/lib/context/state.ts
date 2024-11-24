import { useState, useCallback } from 'react';
import type { ContextState } from './types';

const initialState: ContextState = {
  activeMemories: [],
  focusedMemoryId: null,
  contextualResonance: 0.5,
  memoryStack: [],
  contextTags: new Set()
};

export function useContextState() {
  const [state, setStateInternal] = useState<ContextState>(initialState);

  const setState = useCallback((updater: (prev: ContextState) => ContextState) => {
    setStateInternal(prev => {
      const next = updater(prev);
      return next;
    });
  }, []);

  return [state, setState] as const;
}
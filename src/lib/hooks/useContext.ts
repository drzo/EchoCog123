import { useEffect, useState } from 'react';
import type { ContextState } from '../types';
import { ContextManager } from '../services/context';

const contextManager = new ContextManager();

export function useContext() {
  const [state, setState] = useState<ContextState>(contextManager.getState().getValue());

  useEffect(() => {
    const subscription = contextManager.getState().subscribe(setState);
    return () => subscription.unsubscribe();
  }, []);

  return {
    state,
    setFocusedMemory: contextManager.setFocusedMemory.bind(contextManager),
    updateContextualResonance: contextManager.updateContextualResonance.bind(contextManager),
    pushMemoryContext: contextManager.pushMemoryContext.bind(contextManager),
    popMemoryContext: contextManager.popMemoryContext.bind(contextManager),
    addContextTag: contextManager.addContextTag.bind(contextManager),
    removeContextTag: contextManager.removeContextTag.bind(contextManager)
  };
}
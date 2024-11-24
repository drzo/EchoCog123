import { useCallback } from 'react';
import { useEchoCogContext } from './provider';
import type { Memory } from '../types';

export function useMemoryContext() {
  const context = useEchoCogContext();

  const getActiveMemories = useCallback(() => {
    return context.activeMemories;
  }, [context.activeMemories]);

  const getFocusedMemory = useCallback(() => {
    if (!context.focusedMemoryId) return null;
    return context.activeMemories.find(m => m.id === context.focusedMemoryId) || null;
  }, [context.focusedMemoryId, context.activeMemories]);

  const getContextTags = useCallback(() => {
    return Array.from(context.contextTags);
  }, [context.contextTags]);

  const isMemoryActive = useCallback((id: string) => {
    return context.activeMemories.some(m => m.id === id);
  }, [context.activeMemories]);

  const getMemoryStack = useCallback(() => {
    return context.memoryStack;
  }, [context.memoryStack]);

  return {
    activeMemories: getActiveMemories,
    focusedMemory: getFocusedMemory,
    contextTags: getContextTags,
    isMemoryActive,
    memoryStack: getMemoryStack,
    setFocusedMemory: context.setFocusedMemory,
    updateContextualResonance: context.updateContextualResonance,
    pushMemoryContext: context.pushMemoryContext,
    popMemoryContext: context.popMemoryContext,
    addContextTag: context.addContextTag,
    removeContextTag: context.removeContextTag
  };
}
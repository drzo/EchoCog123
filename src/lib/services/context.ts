import { BehaviorSubject } from 'rxjs';
import type { Memory, ContextState } from '../types';
import { StorageService } from './storage';

const storage = new StorageService();

export class ContextManager {
  private state = new BehaviorSubject<ContextState>({
    activeMemories: [],
    focusedMemoryId: null,
    contextualResonance: 0.5,
    memoryStack: [],
    contextTags: new Set()
  });

  getState() {
    return this.state.asObservable();
  }

  async setFocusedMemory(id: string | null) {
    if (id) {
      const memory = await storage.getMemory(id);
      if (memory) {
        const connected = await Promise.all(
          memory.connections.map(connId => storage.getMemory(connId))
        );

        this.state.next({
          ...this.state.value,
          focusedMemoryId: id,
          activeMemories: [memory, ...connected.filter((m): m is Memory => m !== undefined)]
        });
      }
    } else {
      this.state.next({
        ...this.state.value,
        focusedMemoryId: null,
        activeMemories: []
      });
    }
  }

  updateContextualResonance(value: number) {
    this.state.next({
      ...this.state.value,
      contextualResonance: value
    });
  }

  pushMemoryContext(id: string) {
    this.state.next({
      ...this.state.value,
      memoryStack: [...this.state.value.memoryStack, id]
    });
  }

  popMemoryContext() {
    this.state.next({
      ...this.state.value,
      memoryStack: this.state.value.memoryStack.slice(0, -1)
    });
  }

  addContextTag(tag: string) {
    const newTags = new Set(this.state.value.contextTags);
    newTags.add(tag);
    this.state.next({
      ...this.state.value,
      contextTags: newTags
    });
  }

  removeContextTag(tag: string) {
    const newTags = new Set(this.state.value.contextTags);
    newTags.delete(tag);
    this.state.next({
      ...this.state.value,
      contextTags: newTags
    });
  }
}
import type { Memory, SyncEvent } from '../types';
import { db } from '../db';
import { SYNC_CONFIG } from '../config';

export class SyncEventHandler {
  constructor(private instanceId: string) {}

  createEvent(type: SyncEvent['type'], payload: any): SyncEvent {
    return {
      type,
      payload,
      instanceId: this.instanceId,
      timestamp: Date.now()
    };
  }

  shouldProcessEvent(event: SyncEvent): boolean {
    if (event.instanceId === this.instanceId) {
      return false;
    }

    if (Date.now() - event.timestamp > SYNC_CONFIG.INSTANCE_TIMEOUT) {
      return false;
    }

    return true;
  }

  async handleEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case 'add':
        await this.handleAdd(event.payload);
        break;
      case 'connect':
        await this.handleConnect(event.payload);
        break;
      case 'update':
        await this.handleUpdate(event.payload);
        break;
      case 'remove':
        await this.handleRemove(event.payload);
        break;
    }
  }

  private async handleAdd(payload: { id: string }): Promise<void> {
    const memory = await db.memories.get(payload.id);
    if (!memory) {
      throw new Error('Memory not found');
    }
  }

  private async handleConnect(payload: { sourceId: string; targetId: string }): Promise<void> {
    const { sourceId, targetId } = payload;
    const [source, target] = await Promise.all([
      db.memories.get(sourceId),
      db.memories.get(targetId)
    ]);

    if (!source || !target) {
      throw new Error('Memory not found');
    }

    await Promise.all([
      db.memories.update(sourceId, {
        connections: [...source.connections, targetId],
        version: source.version + 1
      }),
      db.memories.update(targetId, {
        connections: [...target.connections, sourceId],
        version: target.version + 1
      })
    ]);
  }

  private async handleUpdate(payload: Partial<Memory> & { id: string }): Promise<void> {
    const existing = await db.memories.get(payload.id);
    if (existing && payload.version && payload.version > existing.version) {
      await db.memories.update(payload.id, payload);
    }
  }

  private async handleRemove(id: string): Promise<void> {
    await db.memories.delete(id);
  }
}
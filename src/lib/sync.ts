import { Subject, BehaviorSubject, filter } from 'rxjs';
import type { Memory } from './store';
import { db } from './db';

interface SyncEvent {
  type: 'add' | 'update' | 'connect' | 'remove';
  payload: any;
  instanceId: string;
  timestamp: number;
}

export class SyncManager {
  private events = new Subject<SyncEvent>();
  private instances = new Map<string, BehaviorSubject<boolean>>();
  private instanceId = crypto.randomUUID();

  constructor() {
    this.events
      .pipe(filter(event => event.instanceId !== this.instanceId))
      .subscribe(this.handleEvent.bind(this));
  }

  private async handleEvent(event: SyncEvent) {
    switch (event.type) {
      case 'add':
        await this.handleAddMemory(event.payload);
        break;
      case 'update':
        await this.handleUpdateMemory(event.payload);
        break;
      case 'connect':
        await this.handleConnect(event.payload);
        break;
      case 'remove':
        await this.handleRemove(event.payload);
        break;
    }
  }

  private async handleAddMemory(memory: Memory) {
    await db.memories.add(memory);
  }

  private async handleUpdateMemory(update: Partial<Memory> & { id: string }) {
    const existing = await db.memories.get(update.id);
    if (existing && update.version && update.version > existing.version) {
      await db.memories.update(update.id, update);
    }
  }

  private async handleConnect(connection: { sourceId: string, targetId: string }) {
    const [source, target] = await Promise.all([
      db.memories.get(connection.sourceId),
      db.memories.get(connection.targetId)
    ]);

    if (source && target) {
      await Promise.all([
        db.memories.update(connection.sourceId, {
          connections: [...source.connections, connection.targetId],
          version: source.version + 1
        }),
        db.memories.update(connection.targetId, {
          connections: [...target.connections, connection.sourceId],
          version: target.version + 1
        })
      ]);
    }
  }

  private async handleRemove(id: string) {
    await db.memories.delete(id);
  }

  broadcast(event: Omit<SyncEvent, 'instanceId' | 'timestamp'>) {
    this.events.next({
      ...event,
      instanceId: this.instanceId,
      timestamp: Date.now()
    });
  }

  addInstance(instanceId: string) {
    this.instances.set(instanceId, new BehaviorSubject(true));
  }

  removeInstance(instanceId: string) {
    this.instances.delete(instanceId);
  }

  isInstanceActive(instanceId: string): boolean {
    return this.instances.get(instanceId)?.value ?? false;
  }
}
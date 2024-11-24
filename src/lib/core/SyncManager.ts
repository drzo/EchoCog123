import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { filter, debounceTime, retryWhen, delay, take } from 'rxjs/operators';
import type { SyncEvent, Memory } from '../types';
import { db } from '../db';
import { SYNC_CONFIG } from '../config';
import { SyncEventHandler } from '../utils/sync';

export class SyncManager {
  private events = new Subject<SyncEvent>();
  private instances = new Map<string, BehaviorSubject<boolean>>();
  private instanceId = crypto.randomUUID();
  private syncStatus = new BehaviorSubject<boolean>(true);
  private eventHandler: SyncEventHandler;
  private eventQueue: SyncEvent[] = [];
  private processingQueue = false;

  constructor() {
    this.eventHandler = new SyncEventHandler(this.instanceId);
    
    this.events.pipe(
      debounceTime(SYNC_CONFIG.EVENT_DEBOUNCE),
      filter(event => this.eventHandler.shouldProcessEvent(event)),
      retryWhen(errors => 
        errors.pipe(
          delay(SYNC_CONFIG.RETRY_DELAY),
          take(SYNC_CONFIG.RETRY_ATTEMPTS)
        )
      )
    ).subscribe(this.handleEvent.bind(this));

    this.startQueueProcessor();
  }

  getStatus(): Observable<boolean> {
    return this.syncStatus.asObservable();
  }

  registerInstance(instanceId: string): void {
    this.instances.set(instanceId, new BehaviorSubject(true));
    this.checkInstances();
  }

  unregisterInstance(instanceId: string): void {
    this.instances.delete(instanceId);
    this.checkInstances();
  }

  broadcastMemoryCreation(id: string): void {
    this.broadcast('add', { id });
  }

  broadcastConnection(sourceId: string, targetId: string): void {
    this.broadcast('connect', { sourceId, targetId });
  }

  broadcastMemoryUpdate(id: string, updates: Partial<Memory>): void {
    this.broadcast('update', { id, ...updates });
  }

  broadcastMemoryRemoval(id: string): void {
    this.broadcast('remove', { id });
  }

  private broadcast(type: SyncEvent['type'], payload: any): void {
    const event = this.eventHandler.createEvent(type, payload);
    
    if (this.eventQueue.length < SYNC_CONFIG.MAX_QUEUE_SIZE) {
      this.eventQueue.push(event);
    }
  }

  private async handleEvent(event: SyncEvent): Promise<void> {
    try {
      await this.eventHandler.handleEvent(event);
      this.syncStatus.next(true);
    } catch (error) {
      console.error('Sync error:', error);
      this.syncStatus.next(false);
      throw error; // Allow retry mechanism to catch
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.processingQueue || this.eventQueue.length === 0) return;

    this.processingQueue = true;
    
    try {
      const batchSize = Math.min(SYNC_CONFIG.BATCH_SIZE, this.eventQueue.length);
      const batch = this.eventQueue.splice(0, batchSize);

      await Promise.all(
        batch.map(event => this.handleEvent(event))
      );
    } finally {
      this.processingQueue = false;
    }
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      this.processEventQueue();
    }, SYNC_CONFIG.BROADCAST_DEBOUNCE);
  }

  private checkInstances(): void {
    const now = Date.now();
    for (const [id, status] of this.instances) {
      if (now - status.value > SYNC_CONFIG.INSTANCE_TIMEOUT) {
        this.instances.delete(id);
      }
    }
  }
}
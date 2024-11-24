import { MemoryManager } from './MemoryManager';
import { SyncManager } from './SyncManager';
import { MetricsManager } from './MetricsManager';
import type { Memory, SystemMetrics } from '../types';
import { Observable } from 'rxjs';

export class EchoCogCore {
  private memoryManager: MemoryManager;
  private syncManager: SyncManager;
  private metricsManager: MetricsManager;

  constructor() {
    this.memoryManager = new MemoryManager();
    this.syncManager = new SyncManager();
    this.metricsManager = new MetricsManager();
  }

  // Memory Operations
  async createMemory(type: Memory['type'], content: string, tags: string[] = []): Promise<string> {
    const id = await this.memoryManager.createMemory(type, content, tags);
    this.syncManager.broadcastMemoryCreation(id);
    return id;
  }

  async getMemory(id: string): Promise<Memory | undefined> {
    return this.memoryManager.getMemory(id);
  }

  async connectMemories(sourceId: string, targetId: string): Promise<void> {
    await this.memoryManager.connectMemories(sourceId, targetId);
    this.syncManager.broadcastConnection(sourceId, targetId);
  }

  async updateMemoryEnergy(id: string, delta: number): Promise<void> {
    await this.memoryManager.updateMemoryEnergy(id, delta);
    const memory = await this.memoryManager.getMemory(id);
    if (memory) {
      this.syncManager.broadcastMemoryUpdate(id, { energy: memory.energy });
    }
  }

  async updateMemoryResonance(id: string, contextTags: Set<string>): Promise<void> {
    await this.memoryManager.updateMemoryResonance(id, contextTags);
    const memory = await this.memoryManager.getMemory(id);
    if (memory) {
      this.syncManager.broadcastMemoryUpdate(id, { resonance: memory.resonance });
    }
  }

  async searchMemories(query: string, type?: Memory['type']): Promise<Memory[]> {
    return this.memoryManager.searchMemories(query, type);
  }

  // Metrics
  getMetrics(): Observable<SystemMetrics> {
    return this.metricsManager.getMetrics();
  }

  getMetricsHistory(duration?: number): SystemMetrics[] {
    return this.metricsManager.getHistory(duration);
  }

  async getEnergyDistribution(): Promise<Map<string, number>> {
    return this.metricsManager.getEnergyDistribution();
  }

  async getResonanceDistribution(): Promise<Map<string, number>> {
    return this.metricsManager.getResonanceDistribution();
  }

  async getAccessPatterns(): Promise<Map<string, number>> {
    return this.metricsManager.getAccessPatterns();
  }

  // Sync Status
  getSyncStatus(): Observable<boolean> {
    return this.syncManager.getStatus();
  }

  // Instance Management
  registerInstance(instanceId: string): void {
    this.syncManager.registerInstance(instanceId);
  }

  unregisterInstance(instanceId: string): void {
    this.syncManager.unregisterInstance(instanceId);
  }

  // Cache Management
  clearMemoryCache(): void {
    this.memoryManager.clearCache();
  }
}
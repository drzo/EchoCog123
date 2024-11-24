import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, shareReplay, debounceTime } from 'rxjs/operators';
import type { SystemMetrics, Memory } from '../types';
import { db } from '../db';
import { METRICS_CONFIG } from '../config';
import { MetricsCalculator } from '../utils/metrics';

export class MetricsManager {
  private metrics = new BehaviorSubject<SystemMetrics | null>(null);
  private history: SystemMetrics[] = [];
  private calculator: MetricsCalculator;
  private cache = new Map<string, SystemMetrics>();
  private energyDistribution = new Map<string, number>();
  private resonanceDistribution = new Map<string, number>();
  private accessPatterns = new Map<string, number>();

  constructor() {
    this.calculator = new MetricsCalculator();
    this.startMonitoring();
  }

  getMetrics(): Observable<SystemMetrics> {
    return this.metrics.pipe(
      debounceTime(METRICS_CONFIG.DEBOUNCE_TIME),
      map(m => m!),
      shareReplay(1)
    );
  }

  getHistory(duration = METRICS_CONFIG.HISTORY_DURATION): SystemMetrics[] {
    const now = Date.now();
    return this.history.filter(m => now - m.timestamp! <= duration);
  }

  async getMetricsByType(type: keyof SystemMetrics): Promise<number> {
    const metrics = await this.getCurrentMetrics();
    return metrics[type] as number;
  }

  async getEnergyDistribution(): Promise<Map<string, number>> {
    await this.updateDistributions();
    return new Map(this.energyDistribution);
  }

  async getResonanceDistribution(): Promise<Map<string, number>> {
    await this.updateDistributions();
    return new Map(this.resonanceDistribution);
  }

  async getAccessPatterns(): Promise<Map<string, number>> {
    await this.updateAccessPatterns();
    return new Map(this.accessPatterns);
  }

  private async getCurrentMetrics(): Promise<SystemMetrics> {
    const cacheKey = Date.now().toString();
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const memories = await db.memories.toArray();
    const metrics = this.calculator.calculateMetrics(memories);
    
    this.updateCache(cacheKey, metrics);
    return metrics;
  }

  private async updateMetrics(): Promise<void> {
    const metrics = await this.getCurrentMetrics();
    this.metrics.next(metrics);
    this.updateHistory(metrics);
  }

  private async updateDistributions(): Promise<void> {
    const memories = await db.memories.toArray();
    
    this.energyDistribution.clear();
    this.resonanceDistribution.clear();

    memories.forEach(memory => {
      const energyBin = Math.floor(memory.energy * 10) / 10;
      const resonanceBin = Math.floor(memory.resonance * 10) / 10;

      this.energyDistribution.set(
        energyBin.toFixed(1),
        (this.energyDistribution.get(energyBin.toFixed(1)) || 0) + 1
      );

      this.resonanceDistribution.set(
        resonanceBin.toFixed(1),
        (this.resonanceDistribution.get(resonanceBin.toFixed(1)) || 0) + 1
      );
    });
  }

  private async updateAccessPatterns(): Promise<void> {
    const memories = await db.memories.toArray();
    const now = Date.now();
    
    this.accessPatterns.clear();

    memories.forEach(memory => {
      if (memory.lastAccessed) {
        const hoursSinceAccess = Math.floor((now - memory.lastAccessed) / (1000 * 60 * 60));
        this.accessPatterns.set(
          hoursSinceAccess.toString(),
          (this.accessPatterns.get(hoursSinceAccess.toString()) || 0) + 1
        );
      }
    });
  }

  private startMonitoring(): void {
    interval(METRICS_CONFIG.UPDATE_INTERVAL).subscribe(() => {
      this.updateMetrics();
      this.updateDistributions();
      this.updateAccessPatterns();
    });
  }

  private updateHistory(metrics: SystemMetrics): void {
    this.history.push(metrics);
    
    const cutoff = Date.now() - METRICS_CONFIG.HISTORY_DURATION;
    this.history = this.history.filter(m => m.timestamp! > cutoff);
  }

  private updateCache(key: string, metrics: SystemMetrics): void {
    this.cache.set(key, metrics);
    
    if (this.cache.size > METRICS_CONFIG.CACHE_SIZE) {
      const keys = Array.from(this.cache.keys());
      const oldestKey = keys[0];
      this.cache.delete(oldestKey);
    }
  }
}
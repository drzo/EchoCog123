import { BehaviorSubject, interval, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { SYSTEM_CONSTANTS } from '../constants';
import type { SystemMetrics } from '../types';
import { db } from '../db';

export class MetricsService {
  private metricsSubject = new BehaviorSubject<SystemMetrics | null>(null);
  private metricsHistory: SystemMetrics[] = [];

  constructor() {
    this.startMonitoring();
  }

  getMetrics(): Observable<SystemMetrics | null> {
    return this.metricsSubject.asObservable().pipe(
      shareReplay(1)
    );
  }

  getMetricsHistory(duration = SYSTEM_CONSTANTS.MAX_HISTORY_DURATION): SystemMetrics[] {
    const now = Date.now();
    return this.metricsHistory.filter(m => now - m.timestamp! <= duration);
  }

  getMetricsByType(type: keyof SystemMetrics): Observable<number> {
    return this.metricsSubject.pipe(
      map(metrics => metrics ? metrics[type] as number : 0)
    );
  }

  private async updateMetrics() {
    const memories = await db.memories.toArray();
    
    const metrics: SystemMetrics = {
      memoryCount: memories.length,
      averageEnergy: this.calculateAverageEnergy(memories),
      activeConnections: this.calculateActiveConnections(memories),
      systemLoad: this.calculateSystemLoad(memories),
      memoryTypeDistribution: this.calculateTypeDistribution(memories),
      recentChanges: this.calculateRecentChanges(memories),
      timestamp: Date.now()
    };

    this.metricsSubject.next(metrics);
    this.updateHistory(metrics);
  }

  private startMonitoring() {
    interval(SYSTEM_CONSTANTS.UPDATE_INTERVAL).subscribe(() => this.updateMetrics());
  }

  private calculateAverageEnergy(memories: any[]): number {
    if (memories.length === 0) return 0;
    const totalEnergy = memories.reduce((sum, m) => sum + m.energy, 0);
    return totalEnergy / memories.length;
  }

  private calculateActiveConnections(memories: any[]): number {
    return memories.reduce((sum, m) => sum + m.connections.length, 0) / 2;
  }

  private calculateSystemLoad(memories: any[]): number {
    const memoryFactor = memories.length / SYSTEM_CONSTANTS.MEMORY_NORMALIZATION_FACTOR;
    const connections = this.calculateActiveConnections(memories);
    const connectionFactor = connections / SYSTEM_CONSTANTS.CONNECTION_NORMALIZATION_FACTOR;
    
    return Math.min(1, 
      (memoryFactor * SYSTEM_CONSTANTS.MEMORY_LOAD_WEIGHT) + 
      (connectionFactor * SYSTEM_CONSTANTS.CONNECTION_LOAD_WEIGHT)
    );
  }

  private calculateTypeDistribution(memories: any[]): Record<string, number> {
    return memories.reduce((dist, m) => {
      dist[m.type] = (dist[m.type] || 0) + 1;
      return dist;
    }, {});
  }

  private calculateRecentChanges(memories: any[]): number {
    const now = Date.now();
    return memories.filter(m => 
      now - m.timestamp < SYSTEM_CONSTANTS.UPDATE_INTERVAL
    ).length;
  }

  private updateHistory(metrics: SystemMetrics) {
    this.metricsHistory.push(metrics);
    
    // Prune old metrics
    const cutoff = Date.now() - SYSTEM_CONSTANTS.MAX_HISTORY_DURATION;
    this.metricsHistory = this.metricsHistory.filter(m => 
      m.timestamp! > cutoff
    );
  }
}
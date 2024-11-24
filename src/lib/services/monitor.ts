import { BehaviorSubject, interval, shareReplay } from 'rxjs';
import { db } from '../db';
import type { SystemMetrics } from '../types';

export class SystemMonitor {
  private metrics = new BehaviorSubject<SystemMetrics>({
    memoryCount: 0,
    averageEnergy: 0,
    activeConnections: 0,
    systemLoad: 0,
    memoryTypeDistribution: {},
    recentChanges: 0
  });

  private updateInterval = 5000;
  private metricsHistory: SystemMetrics[] = [];

  constructor() {
    this.startMonitoring();
  }

  getMetrics() {
    return this.metrics.asObservable().pipe(
      shareReplay(1)
    );
  }

  getMetricsHistory(duration: number = 3600000) {
    const now = Date.now();
    return this.metricsHistory.filter(m => now - m.timestamp! > duration);
  }

  private async updateMetrics() {
    const memories = await db.memories.toArray();
    
    const memoryCount = memories.length;
    const totalEnergy = memories.reduce((sum, m) => sum + m.energy, 0);
    const activeConnections = memories.reduce((sum, m) => sum + m.connections.length, 0) / 2;
    
    const typeDistribution = memories.reduce((dist, m) => {
      dist[m.type] = (dist[m.type] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    const recentChanges = memories.filter(m => 
      Date.now() - m.timestamp < this.updateInterval
    ).length;

    const metrics: SystemMetrics = {
      memoryCount,
      averageEnergy: memoryCount > 0 ? totalEnergy / memoryCount : 0,
      activeConnections,
      systemLoad: this.calculateSystemLoad(memoryCount, activeConnections),
      memoryTypeDistribution: typeDistribution,
      recentChanges,
      timestamp: Date.now()
    };

    this.metrics.next(metrics);
    this.metricsHistory.push(metrics);

    // Keep last 24 hours of history
    const dayAgo = Date.now() - 86400000;
    this.metricsHistory = this.metricsHistory.filter(m => 
      m.timestamp! > dayAgo
    );
  }

  private startMonitoring() {
    interval(this.updateInterval).subscribe(() => this.updateMetrics());
  }

  private calculateSystemLoad(memoryCount: number, connections: number): number {
    const memoryFactor = memoryCount / 1000; // Normalize for 1000 memories
    const connectionFactor = connections / 5000; // Normalize for 5000 connections
    return Math.min(1, (memoryFactor * 0.3 + connectionFactor * 0.7));
  }
}
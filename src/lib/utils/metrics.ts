import type { Memory, SystemMetrics } from '../types';
import { METRICS_CONFIG } from '../config';

export class MetricsCalculator {
  calculateMetrics(memories: Memory[]): SystemMetrics {
    return {
      memoryCount: memories.length,
      averageEnergy: this.calculateAverageEnergy(memories),
      activeConnections: this.calculateActiveConnections(memories),
      systemLoad: this.calculateSystemLoad(memories),
      memoryTypeDistribution: this.calculateTypeDistribution(memories),
      recentChanges: this.calculateRecentChanges(memories),
      timestamp: Date.now()
    };
  }

  private calculateAverageEnergy(memories: Memory[]): number {
    if (memories.length === 0) return 0;
    
    const totalEnergy = memories.reduce((sum, m) => {
      const resonanceFactor = m.resonance * METRICS_CONFIG.WEIGHTS.RESONANCE;
      const energyFactor = m.energy * METRICS_CONFIG.WEIGHTS.ENERGY;
      return sum + (resonanceFactor + energyFactor);
    }, 0);

    return totalEnergy / memories.length;
  }

  private calculateActiveConnections(memories: Memory[]): number {
    const connections = memories.reduce((sum, m) => sum + m.connections.length, 0);
    return connections / 2; // Divide by 2 since connections are bidirectional
  }

  private calculateSystemLoad(memories: Memory[]): number {
    const memoryFactor = memories.length / METRICS_CONFIG.BATCH_SIZE;
    const connections = this.calculateActiveConnections(memories);
    const connectionFactor = connections / (METRICS_CONFIG.BATCH_SIZE * 5);
    
    const load = (memoryFactor * METRICS_CONFIG.WEIGHTS.MEMORY) + 
                (connectionFactor * METRICS_CONFIG.WEIGHTS.CONNECTIONS);
                
    return Math.min(1, load);
  }

  private calculateTypeDistribution(memories: Memory[]): Record<string, number> {
    return memories.reduce((dist, m) => {
      dist[m.type] = (dist[m.type] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
  }

  private calculateRecentChanges(memories: Memory[]): number {
    const now = Date.now();
    return memories.filter(m => 
      now - m.timestamp < METRICS_CONFIG.UPDATE_INTERVAL
    ).length;
  }

  getLoadThreshold(load: number): 'low' | 'medium' | 'high' {
    if (load >= METRICS_CONFIG.THRESHOLDS.HIGH_LOAD) return 'high';
    if (load >= METRICS_CONFIG.THRESHOLDS.MEDIUM_LOAD) return 'medium';
    return 'low';
  }
}
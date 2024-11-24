import { useEffect, useState, useCallback } from 'react';
import { SystemMonitor } from '../services/monitor';
import type { SystemMetrics } from '../types';
import { METRICS_CONFIG } from '../config';

const monitor = new SystemMonitor();

export function useMetrics(updateInterval = METRICS_CONFIG.UPDATE_INTERVAL) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const [loadStatus, setLoadStatus] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    const subscription = monitor.getMetrics().subscribe(newMetrics => {
      setMetrics(newMetrics);
      updateLoadStatus(newMetrics.systemLoad);
    });
    
    const historyInterval = setInterval(() => {
      setHistory(monitor.getMetricsHistory());
    }, updateInterval);

    return () => {
      subscription.unsubscribe();
      clearInterval(historyInterval);
    };
  }, [updateInterval]);

  const updateLoadStatus = useCallback((load: number) => {
    if (load >= METRICS_CONFIG.THRESHOLDS.HIGH_LOAD) {
      setLoadStatus('high');
    } else if (load >= METRICS_CONFIG.THRESHOLDS.MEDIUM_LOAD) {
      setLoadStatus('medium');
    } else {
      setLoadStatus('low');
    }
  }, []);

  const getMetricsByType = useCallback(async (type: keyof SystemMetrics) => {
    return monitor.getMetricsByType(type);
  }, []);

  return {
    metrics,
    history,
    loadStatus,
    getMetricsByType,
    monitor
  };
}
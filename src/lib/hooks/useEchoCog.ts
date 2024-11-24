import { useEffect, useMemo } from 'react';
import { EchoCogCore } from '../core';
import type { SystemMetrics } from '../types';

const core = new EchoCogCore();

export function useEchoCog() {
  const instanceId = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    core.registerInstance(instanceId);
    return () => core.unregisterInstance(instanceId);
  }, [instanceId]);

  return {
    createMemory: core.createMemory.bind(core),
    connectMemories: core.connectMemories.bind(core),
    getMetrics: core.getMetrics.bind(core),
    getMetricsHistory: core.getMetricsHistory.bind(core),
    getSyncStatus: core.getSyncStatus.bind(core)
  };
}
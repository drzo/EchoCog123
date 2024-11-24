import React from 'react';
import { useMetrics } from '../lib/hooks/useMetrics';

export function MetricsDisplay() {
  const { metrics, loadStatus } = useMetrics();

  if (!metrics) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Memory Count</h3>
          <p className="text-2xl font-bold">{metrics.memoryCount}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Active Connections</h3>
          <p className="text-2xl font-bold">{metrics.activeConnections}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Average Energy</h3>
          <p className="text-2xl font-bold">{metrics.averageEnergy.toFixed(2)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">System Load</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{(metrics.systemLoad * 100).toFixed(1)}%</p>
            <span className={`px-2 py-1 rounded text-sm ${getLoadStatusColor(loadStatus)}`}>
              {loadStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Memory Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metrics.memoryTypeDistribution).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{type}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getLoadStatusColor(status: 'low' | 'medium' | 'high'): string {
  switch (status) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
  }
}
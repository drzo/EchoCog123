import React from 'react';
import { useMetrics } from '../../lib/hooks/useMetrics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea'];

export function MetricsCharts() {
  const { metrics, history } = useMetrics();

  if (!metrics || !history.length) return null;

  const memoryTypeData = Object.entries(metrics.memoryTypeDistribution).map(
    ([name, value]) => ({ name, value })
  );

  const energyData = history.map(m => ({
    timestamp: format(m.timestamp!, 'HH:mm'),
    energy: m.averageEnergy
  }));

  const loadData = history.map(m => ({
    timestamp: format(m.timestamp!, 'HH:mm'),
    load: m.systemLoad * 100
  }));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Memory Type Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={memoryTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {memoryTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Average Energy Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#4299e1" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">System Load History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar 
                dataKey="load" 
                fill="#48bb78" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
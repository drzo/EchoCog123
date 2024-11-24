import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CellularAgent } from '../swarm/CellularAgent'
import { Logger } from '@/cogutil/Logger'

interface CellMetrics {
  energy: number;
  efficiency: number;
  stress: number;
  mitochondria: number;
}

export function CellularView() {
  const [cell, setCell] = useState<CellularAgent | null>(null);
  const [metrics, setMetrics] = useState<CellMetrics>({
    energy: 0,
    efficiency: 0,
    stress: 0,
    mitochondria: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeCell();
  }, []);

  useEffect(() => {
    if (!cell) return;

    const interval = setInterval(() => {
      updateMetrics();
    }, 1000);

    return () => clearInterval(interval);
  }, [cell]);

  const initializeCell = () => {
    try {
      const capabilities = [{
        name: 'metabolism',
        description: 'Basic metabolic functions',
        parameters: {},
        autonomyLevel: 0.8,
        learningRate: 0.1,
        energyCost: 10,
        successRate: 1.0
      }];

      const newCell = new CellularAgent('Cell-1', capabilities);
      setCell(newCell);
      Logger.info('Cell initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize cell:', error);
      setError('Failed to initialize cell. Please try again.');
    }
  };

  const updateMetrics = () => {
    if (!cell) return;

    try {
      const mitochondrialStatus = cell.getMitochondrialStatus();
      const metabolicStatus = cell.getMetabolicStatus();
      
      setMetrics({
        energy: metabolicStatus.atpLevel,
        efficiency: mitochondrialStatus.efficiency,
        stress: metabolicStatus.stressLevel,
        mitochondria: mitochondrialStatus.count
      });
    } catch (error) {
      Logger.error('Failed to update metrics:', error);
      setError('Failed to update cell status.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cellular Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-2">
                <dt>Energy Level:</dt>
                <dd>{(metrics.energy * 100).toFixed(1)}%</dd>
                <dt>Efficiency:</dt>
                <dd>{(metrics.efficiency * 100).toFixed(1)}%</dd>
                <dt>Stress Level:</dt>
                <dd>{(metrics.stress * 100).toFixed(1)}%</dd>
                <dt>Mitochondria:</dt>
                <dd>{metrics.mitochondria}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={initializeCell}
                disabled={cell !== null}
              >
                Reset Cell
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
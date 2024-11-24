import React from 'react';

interface VisualizationControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  centerGraph: () => void;
  togglePhysics: () => void;
  physicsEnabled: boolean;
}

export function VisualizationControls({
  scale,
  onScaleChange,
  centerGraph,
  togglePhysics,
  physicsEnabled
}: VisualizationControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-white rounded-lg shadow p-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          -
        </button>
        <span className="text-sm text-gray-600 min-w-[3ch] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => onScaleChange(Math.min(2, scale + 0.1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          +
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <button
        onClick={centerGraph}
        className="p-2 hover:bg-gray-100 rounded text-sm text-gray-600"
      >
        Center
      </button>

      <div className="w-px h-6 bg-gray-200" />

      <button
        onClick={togglePhysics}
        className={`p-2 rounded text-sm ${
          physicsEnabled ? 'text-indigo-600' : 'text-gray-600'
        }`}
      >
        Physics
      </button>
    </div>
  );
}
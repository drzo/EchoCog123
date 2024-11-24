import React, { useState } from 'react';
import { useMemoryOperations } from '../lib/hooks/useMemoryOperations';
import type { Memory } from '../lib/types';

interface BatchOperationsProps {
  selectedMemories: Memory[];
  onComplete: () => void;
}

export function BatchOperations({ selectedMemories, onComplete }: BatchOperationsProps) {
  const [operation, setOperation] = useState<'tag' | 'energy' | 'delete'>('tag');
  const [tagValue, setTagValue] = useState('');
  const [energyDelta, setEnergyDelta] = useState(0);
  const { updateMemoryEnergy, addTags, deleteMemories } = useMemoryOperations();

  const handleExecute = async () => {
    try {
      switch (operation) {
        case 'tag':
          if (tagValue.trim()) {
            await addTags(selectedMemories.map(m => m.id), tagValue.split(',').map(t => t.trim()));
          }
          break;
        case 'energy':
          await Promise.all(selectedMemories.map(m => updateMemoryEnergy(m.id, energyDelta)));
          break;
        case 'delete':
          await deleteMemories(selectedMemories.map(m => m.id));
          break;
      }
      onComplete();
    } catch (error) {
      console.error('Batch operation failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Batch Operations</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Operation Type
        </label>
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as any)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="tag">Add Tags</option>
          <option value="energy">Update Energy</option>
          <option value="delete">Delete Memories</option>
        </select>
      </div>

      {operation === 'tag' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="tag1, tag2, tag3..."
          />
        </div>
      )}

      {operation === 'energy' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Energy Delta (-1.0 to 1.0)
          </label>
          <input
            type="number"
            value={energyDelta}
            onChange={(e) => setEnergyDelta(Number(e.target.value))}
            step="0.1"
            min="-1"
            max="1"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedMemories.length} memories selected
        </span>
        <button
          onClick={handleExecute}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Execute
        </button>
      </div>
    </div>
  );
}
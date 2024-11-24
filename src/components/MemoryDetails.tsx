import React from 'react';
import { useMemory } from '../lib/hooks/useMemory';
import { useMemoryContext } from '../lib/context';

interface MemoryDetailsProps {
  id: string;
}

export function MemoryDetails({ id }: MemoryDetailsProps) {
  const { memory, connectedMemories, updateEnergy, isActive } = useMemory(id);
  const { addContextTag, removeContextTag } = useMemoryContext();

  if (!memory) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">{memory.type}</h2>
          <p className="text-sm text-gray-500">
            Created {new Date(memory.timestamp).toLocaleDateString()}
          </p>
        </div>
        {isActive && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            Active
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4">{memory.content}</p>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {memory.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeContextTag(tag)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Energy</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2"
                style={{ width: `${memory.energy * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {(memory.energy * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Resonance</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 rounded-full h-2"
                style={{ width: `${memory.resonance * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {(memory.resonance * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {connectedMemories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Connected Memories
          </h3>
          <div className="space-y-2">
            {connectedMemories.map(connected => (
              <div
                key={connected.id}
                className="p-2 bg-gray-50 rounded-md text-sm text-gray-700"
              >
                {connected.content.substring(0, 100)}
                {connected.content.length > 100 && '...'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
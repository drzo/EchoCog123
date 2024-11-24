import React from 'react';
import type { Memory } from '../lib/types';

interface MemoryListProps {
  memories: Memory[];
  onSelect?: (id: string) => void;
  selectedMemories?: Memory[];
  onSelectionChange?: (memories: Memory[]) => void;
}

export function MemoryList({ 
  memories, 
  onSelect,
  selectedMemories = [],
  onSelectionChange
}: MemoryListProps) {
  const handleToggleSelect = (memory: Memory) => {
    if (!onSelectionChange) return;
    
    const isSelected = selectedMemories.some(m => m.id === memory.id);
    if (isSelected) {
      onSelectionChange(selectedMemories.filter(m => m.id !== memory.id));
    } else {
      onSelectionChange([...selectedMemories, memory]);
    }
  };

  return (
    <div className="space-y-4">
      {memories.map(memory => {
        const isSelected = selectedMemories.some(m => m.id === memory.id);
        
        return (
          <div 
            key={memory.id}
            className={`p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
              isSelected ? 'ring-2 ring-indigo-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(memory)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                )}
                <span className="text-sm font-medium text-gray-500">{memory.type}</span>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(memory.timestamp).toLocaleDateString()}
              </span>
            </div>
            
            <div onClick={() => onSelect?.(memory.id)}>
              <p className="text-gray-700">{memory.content}</p>
              {memory.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {memory.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Energy: {memory.energy.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Resonance: {memory.resonance.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Connections: {memory.connections.length}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
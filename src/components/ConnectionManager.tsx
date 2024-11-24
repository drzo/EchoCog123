import React, { useState } from 'react';
import { useMemoryOperations } from '../lib/hooks/useMemoryOperations';
import type { Memory } from '../lib/types';

interface ConnectionManagerProps {
  sourceMemory: Memory;
  availableMemories: Memory[];
  onConnect: () => void;
}

export function ConnectionManager({ sourceMemory, availableMemories, onConnect }: ConnectionManagerProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const { connectMemories } = useMemoryOperations();

  const handleConnect = async () => {
    if (!selectedId) return;
    
    try {
      await connectMemories(sourceMemory.id, selectedId);
      setSelectedId('');
      onConnect();
    } catch (error) {
      console.error('Failed to connect memories:', error);
    }
  };

  const filteredMemories = availableMemories.filter(memory => 
    memory.id !== sourceMemory.id && 
    !sourceMemory.connections.includes(memory.id)
  );

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Connect to Memory
      </h3>
      
      <div className="flex gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a memory...</option>
          {filteredMemories.map(memory => (
            <option key={memory.id} value={memory.id}>
              {memory.content.substring(0, 50)}...
            </option>
          ))}
        </select>

        <button
          onClick={handleConnect}
          disabled={!selectedId}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect
        </button>
      </div>
    </div>
  );
}
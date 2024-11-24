import React, { useState, useCallback } from 'react';
import { useMemoryOperations } from '../lib/hooks/useMemoryOperations';
import { MEMORY_TYPES } from '../lib/constants';
import type { Memory } from '../lib/types';

interface SearchBarProps {
  onResultsChange: (memories: Memory[]) => void;
}

export function SearchBar({ onResultsChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<Memory['type'] | 'all'>('all');
  const { searchMemories } = useMemoryOperations();

  const handleSearch = useCallback(async () => {
    const results = await searchMemories(
      query,
      selectedType === 'all' ? undefined : selectedType
    );
    onResultsChange(results);
  }, [query, selectedType, searchMemories, onResultsChange]);

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search memories..."
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as Memory['type'] | 'all')}
        className="px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="all">All Types</option>
        {MEMORY_TYPES.map(type => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>

      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Search
      </button>
    </div>
  );
}
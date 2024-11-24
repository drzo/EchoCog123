import React, { useState } from 'react';
import { useMemoryOperations } from '../lib/hooks/useMemoryOperations';
import type { Memory } from '../lib/types';
import { MEMORY_TYPES } from '../lib/constants';

export function MemoryCreator() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<Memory['type']>('declarative');
  const [tags, setTags] = useState('');
  const { createMemory } = useMemoryOperations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createMemory(type, content, tags.split(',').map(t => t.trim()).filter(Boolean));
      setContent('');
      setTags('');
    } catch (error) {
      console.error('Failed to create memory:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Memory Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Memory['type'])}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {MEMORY_TYPES.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="Enter memory content..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="tag1, tag2, tag3..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Memory
      </button>
    </form>
  );
}
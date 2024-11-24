import React from 'react';
import { useMemoryContext } from '../../lib/context';
import { useMemory } from '../../lib/hooks/useMemory';

export function ContextManager() {
  const { 
    activeMemories,
    focusedMemory,
    contextTags,
    memoryStack,
    addContextTag,
    removeContextTag,
    popMemoryContext
  } = useMemoryContext();

  const focused = focusedMemory();
  const tags = contextTags();

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Active Context</h2>
        {focused ? (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-900">{focused.type}</p>
                <p className="text-sm text-blue-800">{focused.content}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Focused
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No memory focused</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Context Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
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
          <button
            onClick={() => {
              const tag = prompt('Enter new tag:');
              if (tag) addContextTag(tag);
            }}
            className="px-2 py-1 border border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-gray-400 hover:text-gray-600"
          >
            + Add Tag
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Memory Stack</h3>
        <div className="space-y-2">
          {memoryStack.map((id, index) => (
            <MemoryStackItem 
              key={id} 
              id={id} 
              isLast={index === memoryStack.length - 1}
              onPop={popMemoryContext}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Active Memories</h3>
        <div className="space-y-2">
          {activeMemories().map(memory => (
            <div
              key={memory.id}
              className="p-2 bg-gray-50 rounded text-sm text-gray-700"
            >
              <p className="font-medium">{memory.type}</p>
              <p className="truncate">{memory.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryStackItem({ 
  id, 
  isLast,
  onPop 
}: { 
  id: string; 
  isLast: boolean;
  onPop: () => void;
}) {
  const { memory } = useMemory(id);

  if (!memory) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
        <p className="font-medium">{memory.type}</p>
        <p className="truncate">{memory.content}</p>
      </div>
      {isLast && (
        <button
          onClick={onPop}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
}
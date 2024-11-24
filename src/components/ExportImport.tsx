import React, { useRef } from 'react';
import { useMemoryOperations } from '../lib/hooks/useMemoryOperations';
import type { Memory } from '../lib/types';

export function ExportImport() {
  const fileInput = useRef<HTMLInputElement>(null);
  const { exportMemories, importMemories } = useMemoryOperations();

  const handleExport = async () => {
    try {
      const data = await exportMemories();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echocog-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importMemories(data);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Export/Import</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={handleExport}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Export Memories
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import Memories
          </label>
          <input
            type="file"
            ref={fileInput}
            accept=".json"
            onChange={handleImport}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}
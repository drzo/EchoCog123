import React, { useState } from 'react';
import { EchoCogProvider } from './lib/context/provider';
import { MemoryGraph } from './components/MemoryGraph';
import { MemoryList } from './components/MemoryList';
import { MetricsDisplay } from './components/MetricsDisplay';
import { MetricsCharts } from './components/metrics/MetricsCharts';
import { MemoryCreator } from './components/MemoryCreator';
import { MemoryDetails } from './components/MemoryDetails';
import { SearchBar } from './components/SearchBar';
import { VisualizationControls } from './components/VisualizationControls';
import { ConnectionManager } from './components/ConnectionManager';
import { ContextManager } from './components/context/ContextManager';
import { BatchOperations } from './components/BatchOperations';
import { ExportImport } from './components/ExportImport';
import type { Memory } from './lib/types';

function App() {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [selectedMemories, setSelectedMemories] = useState<Memory[]>([]);
  const [scale, setScale] = useState(1);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);

  return (
    <EchoCogProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">EchoCog System</h1>
          
          <SearchBar onResultsChange={setSearchResults} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Create Memory</h2>
                <MemoryCreator />
              </div>

              <div className="relative mb-8">
                <h2 className="text-xl font-semibold mb-4">Memory Graph</h2>
                <div className="bg-white rounded-lg shadow p-4 h-[600px]">
                  <MemoryGraph 
                    memories={searchResults}
                    onNodeClick={setSelectedMemoryId}
                    scale={scale}
                    physicsEnabled={physicsEnabled}
                  />
                  <VisualizationControls
                    scale={scale}
                    onScaleChange={setScale}
                    centerGraph={() => {/* Implement centering */}}
                    togglePhysics={() => setPhysicsEnabled(!physicsEnabled)}
                    physicsEnabled={physicsEnabled}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Metrics Overview</h2>
                <MetricsCharts />
              </div>
            </div>
            
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
                <MetricsDisplay />
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Context Management</h2>
                <ContextManager />
              </div>

              <div className="mb-8">
                <BatchOperations 
                  selectedMemories={selectedMemories}
                  onComplete={() => setSelectedMemories([])}
                />
              </div>

              <div className="mb-8">
                <ExportImport />
              </div>

              {selectedMemoryId && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Memory Details</h2>
                  <MemoryDetails id={selectedMemoryId} />
                  <ConnectionManager
                    sourceMemory={searchResults.find(m => m.id === selectedMemoryId)!}
                    availableMemories={searchResults}
                    onConnect={() => {/* Refresh data */}}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Memory List</h2>
            <MemoryList 
              memories={searchResults}
              onSelect={setSelectedMemoryId}
              selectedMemories={selectedMemories}
              onSelectionChange={setSelectedMemories}
            />
          </div>
        </div>
      </div>
    </EchoCogProvider>
  );
}

export default App;
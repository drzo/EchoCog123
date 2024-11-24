import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useMemory } from '../lib/hooks/useMemory';
import type { Memory } from '../lib/types';

interface MemoryGraphProps {
  memories: Memory[];
  onNodeClick?: (id: string) => void;
}

export function MemoryGraph({ memories, onNodeClick }: MemoryGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !memories.length) return;

    const width = 800;
    const height = 600;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create links data
    const links = memories.flatMap(memory => 
      memory.connections.map(targetId => ({
        source: memory.id,
        target: targetId
      }))
    );

    // Create simulation
    const simulation = d3.forceSimulation(memories)
      .force("link", d3.forceLink(links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    // Draw nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(memories)
      .join("circle")
      .attr("r", 5)
      .attr("fill", d => getColorByType(d.type))
      .call(drag(simulation));

    if (onNodeClick) {
      node.on("click", (event, d: any) => onNodeClick(d.id));
    }

    // Update positions
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [memories, onNodeClick]);

  return <svg ref={svgRef} className="w-full h-full" />;
}

function getColorByType(type: Memory['type']): string {
  const colors: Record<Memory['type'], string> = {
    declarative: '#4299e1',
    procedural: '#48bb78',
    episodic: '#ed8936',
    intentional: '#9f7aea'
  };
  return colors[type];
}

function drag(simulation: d3.Simulation<any, undefined>) {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}
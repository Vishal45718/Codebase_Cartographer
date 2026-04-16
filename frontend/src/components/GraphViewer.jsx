import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphViewer({ data, onNodeSelect, selectedNodeId, searchQuery }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState(null);

  // Derive neighbors for focus mode
  const { nodesById, links, neighbors } = useMemo(() => {
    if (!data) return { nodesById: {}, links: [], neighbors: {} };
    
    // Create quick lookups
    const nodesById = data.nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
    
    const neighbors = {};
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (!neighbors[sourceId]) neighbors[sourceId] = new Set();
      if (!neighbors[targetId]) neighbors[targetId] = new Set();
      
      neighbors[sourceId].add(targetId);
      neighbors[targetId].add(sourceId);
    });

    return { nodesById, links: data.links, neighbors };
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Zoom to fit after data loads
    if (data && data.nodes.length > 0 && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [data]);

  // Handle external focus (e.g. from search)
  useEffect(() => {
    if (selectedNodeId && fgRef.current && nodesById[selectedNodeId]) {
      const node = nodesById[selectedNodeId];
      if (node.x !== undefined && node.y !== undefined) {
         fgRef.current.centerAt(node.x, node.y, 1000);
         fgRef.current.zoom(8, 1000);
      }
    }
  }, [selectedNodeId, nodesById]);

  // Color Mapping based on Group/Directory
  const colorMap = useMemo(() => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
      const map = {};
      let colorIndex = 0;
      if (data) {
          data.nodes.forEach(node => {
             if (!map[node.group]) {
                 map[node.group] = colors[colorIndex % colors.length];
                 colorIndex++;
             }
          });
      }
      return map;
  }, [data]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex w-full h-full items-center justify-center text-textMuted bg-grid">
        <div className="glass p-6 rounded-2xl flex flex-col items-center max-w-sm text-center">
            <h3 className="text-lg font-bold text-white mb-2">No Visual Data</h3>
            <p className="text-sm">Enter a GitHub repository URL above to generate a map.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-grid">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel="" // We use custom text rendering in canvas
        nodeVal={node => Math.max(2, Math.sqrt(node.val) * 2)}
        nodeColor={node => colorMap[node.group] || '#3b82f6'}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={link => (selectedNodeId && (link.source.id === selectedNodeId || link.target.id === selectedNodeId)) ? 4 : 2}
        linkDirectionalParticleSpeed={0.005}
        linkCurvature={0.2}
        linkColor={link => {
            const isHighlight = (selectedNodeId && (link.source.id === selectedNodeId || link.target.id === selectedNodeId)) || 
                                (hoverNode && (link.source.id === hoverNode || link.target.id === hoverNode));
            return isHighlight ? 'rgba(255,255,255,0.8)' : 'rgba(163, 163, 163, 0.15)';
        }}
        linkWidth={link => {
            return (selectedNodeId && (link.source.id === selectedNodeId || link.target.id === selectedNodeId)) ? 2 : 1;
        }}
        onNodeHover={node => setHoverNode(node ? node.id : null)}
        onNodeClick={(node) => {
          if (onNodeSelect) onNodeSelect(node.id);
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoverNode === node.id;
          
          // Determine if node should be dimmed (focus mode logic)
          let isDimmed = false;
          if (selectedNodeId && !isSelected) {
             const isNeighbor = neighbors[selectedNodeId]?.has(node.id);
             if (!isNeighbor) isDimmed = true;
          }
          
          // Search query highlighting
          const matchesSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
          if (searchQuery && !matchesSearch && !isSelected) {
              isDimmed = true;
          }

          const r = Math.max(2, Math.sqrt(node.val) * 2);
          const color = colorMap[node.group] || '#3b82f6';

          // Node Halo / Glow
          if (isSelected || isHovered || matchesSearch) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + (isSelected ? 6 : 4), 0, 2 * Math.PI, false);
              ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.4)' : `${color}44`; 
              ctx.fill();
          }

          // Draw main node
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = isDimmed ? '#333333' : color;
          ctx.fill();
          
          // Add border for selected
          if (isSelected) {
              ctx.lineWidth = 1;
              ctx.strokeStyle = '#ffffff';
              ctx.stroke();
          }

          // Labels
          const fontSize = isSelected ? 14/globalScale : 12/globalScale;
          const showLabel = isSelected || isHovered || matchesSearch || globalScale > 1.5;
          
          if (showLabel) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isDimmed ? 'rgba(163,163,163,0.3)' : (isSelected ? '#ffffff' : '#e5e5e5');
            
            // Background pill for readability on smaller zoom
            const labelWidth = ctx.measureText(node.label).width;
            const bckgDimensions = [labelWidth, fontSize].map(n => n + fontSize * 0.5);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + r + fontSize * 0.5, bckgDimensions[0], bckgDimensions[1]);
            
            ctx.fillStyle = isDimmed ? 'rgba(163,163,163,0.3)' : (isSelected ? '#ffffff' : '#e5e5e5');
            ctx.fillText(node.label, node.x, node.y + r + fontSize);
          }
        }}
        d3VelocityDecay={0.3}
      />
      
      {/* Legend Overlay */}
      {Object.keys(colorMap).length > 0 && (
         <div className="absolute bottom-6 left-6 glass rounded-xl p-4 w-48 pointer-events-none fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-3">Directory Legend</h4>
            <div className="flex flex-col space-y-2">
               {Object.entries(colorMap).map(([group, color]) => (
                 <div key={group} className="flex items-center text-xs">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                    <span className="truncate">{group}</span>
                 </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}

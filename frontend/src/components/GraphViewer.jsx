import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphViewer({ data }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex w-full h-full items-center justify-center text-textMuted border border-dashed border-border rounded-xl bg-surface/50">
        Enter a GitHub repository URL to visualize its architecture.
      </div>
    );
  }

  // Ensure graph is centered and physics uses appropriate bounding box
  return (
    <div ref={containerRef} className="w-full h-full relative border border-border rounded-xl bg-surface/30 overflow-hidden shadow-inner">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel="label"
        nodeAutoColorBy="group"
        nodeVal={node => Math.max(2, Math.sqrt(node.val) * 2)}
        nodeColor={node => {
          // Provide vibrant colors based on some heuristic or group if preferred. Default auto color is fine.
          return node.color;
        }}
        linkColor={() => 'rgba(163, 163, 163, 0.3)'}
        linkWidth={1}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Draw standard node
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(2, Math.sqrt(node.val) * 2), 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || '#3b82f6';
          ctx.fill();
          
          // Add label if zoomed in enough
          const label = node.label;
          const fontSize = 12 / globalScale;
          if (globalScale > 1.5) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f5f5f5'; // text color
            ctx.fillText(label, node.x, node.y + Math.max(2, Math.sqrt(node.val) * 2) + fontSize);
          }
        }}
        d3VelocityDecay={0.3}
        onNodeClick={(node) => {
          // Center on node onClick
          fgRef.current.centerAt(node.x, node.y, 1000);
          fgRef.current.zoom(8, 2000);
        }}
      />
      {/* Node Details Overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-xs text-textMuted max-w-xs">
        <p>Hover over nodes to see details. Click to focus.</p>
        <p>Edges represent code dependencies (imports).</p>
      </div>
    </div>
  );
}

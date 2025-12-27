import { useFlowStore } from '@/store/flowStore';
import { ArrowHeadStyle, useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { memo, useMemo } from 'react';

/**
 * Generate arrow head path based on style
 */
function getArrowHeadPath(style: ArrowHeadStyle): string {
  switch (style) {
    case 'filled':
      return 'M2,2 L10,6 L2,10 L4,6 L2,2';
    case 'outlined':
      return 'M2,2 L10,6 L2,10';
    case 'diamond':
      return 'M1,6 L6,2 L11,6 L6,10 Z';
    case 'circle':
      return 'M6,2 A4,4 0 1,1 6,10 A4,4 0 1,1 6,2';
    case 'none':
    default:
      return '';
  }
}

/**
 * EdgeMarkerDefs Component
 * Renders all necessary SVG marker definitions for edges.
 * This is rendered once at the canvas level to ensure markers are always available.
 */
function EdgeMarkerDefsComponent() {
  const edges = useFlowStore((state) => state.edges);
  const globalSettings = useGlobalSettingsStore();
  
  // Collect all unique marker configurations from edges
  const markers = useMemo(() => {
    const markerSet = new Map<string, {
      id: string;
      color: string;
      style: ArrowHeadStyle;
      size: number;
      strokeWidth: number;
    }>();
    
    edges.forEach((edge) => {
      const strokeColor = (edge.style?.stroke as string) || globalSettings.defaultLineColor;
      const strokeWidth = (edge.style?.strokeWidth as number) || globalSettings.defaultLineWidth;
      const arrowHeadSize = (edge.data?.arrowHeadSize as number) || globalSettings.defaultArrowHeadSize;
      const arrowHeadStyle: ArrowHeadStyle = 
        (edge.data?.arrowHeadStyle as ArrowHeadStyle) || globalSettings.defaultArrowHeadStyle;
      
      if (arrowHeadStyle !== 'none') {
        const markerId = `arrowhead-${edge.id}-${strokeColor.replace('#', '')}-${arrowHeadStyle}-${arrowHeadSize}`;
        
        if (!markerSet.has(markerId)) {
          markerSet.set(markerId, {
            id: markerId,
            color: strokeColor,
            style: arrowHeadStyle,
            size: arrowHeadSize,
            strokeWidth,
          });
        }
      }
    });
    
    return Array.from(markerSet.values());
  }, [edges, globalSettings]);
  
  return (
    <svg
      className="react-flow__edge-marker-defs"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {markers.map((marker) => {
          const baseArrowSize = 12;
          const scaledArrowSize = baseArrowSize * marker.size * (1 + (marker.strokeWidth - 2) * 0.15);
          // Position arrowhead so tip ends at the path endpoint (before the destination marker)
          // For filled/outlined arrows, tip is at x=10 in the path, so refX=10 puts tip at endpoint
          // For diamond/circle, center is at x=6
          const arrowRefX = marker.style === 'circle' ? 6 : (marker.style === 'diamond' ? 6 : 10);
          
          return (
            <marker
              key={marker.id}
              id={marker.id}
              markerWidth={scaledArrowSize}
              markerHeight={scaledArrowSize}
              refX={arrowRefX}
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d={getArrowHeadPath(marker.style)}
                fill={marker.style === 'outlined' ? 'none' : marker.color}
                stroke={marker.style === 'outlined' ? marker.color : 'none'}
                strokeWidth={marker.style === 'outlined' ? 1.5 : 0}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </marker>
          );
        })}
      </defs>
    </svg>
  );
}

export const EdgeMarkerDefs = memo(EdgeMarkerDefsComponent);

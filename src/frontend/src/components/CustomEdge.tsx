import { useFlowStore } from '@/store/flowStore';
import { EdgeLineStyle } from '@/types';
import { memo, useMemo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

/**
 * Calculate offset for parallel edges between same nodes
 * This ensures multiple connectors don't overlap
 */
function getParallelEdgeOffset(
  edgeId: string,
  source: string,
  target: string,
  allEdges: { id: string; source: string; target: string }[]
): number {
  // Find all edges between the same source and target (in either direction)
  const parallelEdges = allEdges.filter(
    (e) =>
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
  );

  if (parallelEdges.length <= 1) return 0;

  // Find this edge's index among parallel edges
  const edgeIndex = parallelEdges.findIndex((e) => e.id === edgeId);
  const totalEdges = parallelEdges.length;

  // Calculate offset: spread edges evenly, centered around 0
  const spacing = 25; // pixels between parallel edges
  const offset = (edgeIndex - (totalEdges - 1) / 2) * spacing;

  return offset;
}

/**
 * Get stroke dasharray based on line style
 */
function getStrokeDasharray(lineStyle: EdgeLineStyle): string {
  switch (lineStyle) {
    case 'dashed':
      return '8 4';
    case 'dotted':
      return '2 3';
    case 'solid':
    default:
      return 'none';
  }
}

/**
 * CustomEdge Component
 * A custom edge with:
 * - Smooth bezier curves for organic flow
 * - Arrowhead markers for directionality
 * - Support for multiple parallel edges between same nodes
 * - Line style customization (solid, dashed, dotted)
 * - Individual edge styling (color, width)
 */
function CustomEdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps) {
  const edges = useFlowStore((state) => state.edges);

  // Calculate offset for parallel edges
  const offset = useMemo(
    () => getParallelEdgeOffset(id, source, target, edges),
    [id, source, target, edges]
  );

  // Get edge properties
  const strokeColor = (style.stroke as string) || '#06b6d4';
  const strokeWidth = (style.strokeWidth as number) || 2;
  const lineStyle: EdgeLineStyle = data?.lineStyle || 'solid';

  // Apply offset perpendicular to the edge direction
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize and get perpendicular direction
  const perpX = length > 0 ? -dy / length : 0;
  const perpY = length > 0 ? dx / length : 0;

  // Adjust source and target positions for offset
  const adjustedSourceX = sourceX + perpX * offset;
  const adjustedSourceY = sourceY + perpY * offset;
  const adjustedTargetX = targetX + perpX * offset;
  const adjustedTargetY = targetY + perpY * offset;

  // Calculate dynamic curvature based on distance and offset
  const distance = Math.sqrt(
    Math.pow(adjustedTargetX - adjustedSourceX, 2) +
    Math.pow(adjustedTargetY - adjustedSourceY, 2)
  );
  const curvature = Math.min(0.5, Math.max(0.15, 150 / distance + Math.abs(offset) / 100));

  // Generate smooth bezier path
  const [edgePath] = getBezierPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    sourcePosition,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
    targetPosition,
    curvature,
  });

  // Generate unique marker ID for this edge color
  const markerId = `arrowhead-${strokeColor.replace('#', '')}`;

  return (
    <>
      {/* SVG Defs for arrowhead marker */}
      <defs>
        <marker
          id={markerId}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M2,2 L10,6 L2,10 L4,6 L2,2"
            fill={strokeColor}
            stroke="none"
          />
        </marker>
      </defs>

      {/* Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
          strokeDasharray: getStrokeDasharray(lineStyle),
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          cursor: 'pointer',
        }}
        markerEnd={`url(#${markerId})`}
      />

      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />

      {/* Selection highlight */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={0.2}
          strokeDasharray={getStrokeDasharray(lineStyle)}
          strokeLinecap="round"
        />
      )}
    </>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);

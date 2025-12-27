import { useFlowStore } from '@/store/flowStore';
import { ArrowHeadStyle, useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { EdgeLineStyle } from '@/types';
import {
    calculateHandleOffset,
    generateSmoothPath,
    getPositionFromHandleId,
} from '@/utils/edgeRouting';
import { memo, useMemo } from 'react';
import { EdgeProps, Position, useReactFlow } from 'reactflow';

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
 * Calculate parallel edge index and total count for edges from same source side
 */
function getParallelEdgeInfo(
  edgeId: string,
  source: string,
  sourceHandleId: string | null | undefined,
  allEdges: {
    id: string;
    source: string;
    sourceHandle?: string | null;
  }[]
): { index: number; total: number } {
  const sourcePos = getPositionFromHandleId(sourceHandleId || 'right-source');

  // Find edges with same source node and same source side
  const parallelEdges = allEdges.filter((e) => {
    if (e.source !== source) return false;
    const eSourcePos = getPositionFromHandleId(e.sourceHandle || 'right-source');
    return eSourcePos === sourcePos;
  });

  const index = parallelEdges.findIndex((e) => e.id === edgeId);
  return { index: Math.max(0, index), total: parallelEdges.length };
}

/**
 * CustomEdge Component
 * A custom edge with:
 * - Smooth bezier curves for organic flow
 * - Smart routing for multiple connections from same side
 * - Configurable arrowhead markers (filled, outlined, diamond, circle, none)
 * - Line style customization (solid, dashed, dotted)
 * - Connection point indicators (small circles at attachment points)
 * - Edge labels for annotations (like "true/false" branches)
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
  sourceHandleId,
  targetHandleId,
  style = {},
  data,
  selected,
}: EdgeProps) {
  const edges = useFlowStore((state) => state.edges);
  const { getNode } = useReactFlow();
  const globalSettings = useGlobalSettingsStore();

  // Get source and target nodes for dimension calculations
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  // Get edge properties with fallbacks to global settings
  const strokeColor = (style.stroke as string) || globalSettings.defaultLineColor;
  const strokeWidth = (style.strokeWidth as number) || globalSettings.defaultLineWidth;
  const lineStyle: EdgeLineStyle = data?.lineStyle || globalSettings.defaultLineStyle;
  const arrowHeadSize =
    (data?.arrowHeadSize as number) || globalSettings.defaultArrowHeadSize;
  const arrowHeadStyle: ArrowHeadStyle =
    (data?.arrowHeadStyle as ArrowHeadStyle) || globalSettings.defaultArrowHeadStyle;
  const edgeLabel = data?.label as string | undefined;

  // Calculate handle offsets for multiple connections per side
  const sourceOffset = useMemo(
    () =>
      calculateHandleOffset(
        id,
        source,
        sourcePosition || Position.Right,
        true,
        edges
      ),
    [id, source, sourcePosition, edges]
  );

  const targetOffset = useMemo(
    () =>
      calculateHandleOffset(
        id,
        target,
        targetPosition || Position.Left,
        false,
        edges
      ),
    [id, target, targetPosition, edges]
  );

  // Get parallel edge info for curve separation
  const { index: parallelIndex, total: parallelTotal } = useMemo(
    () => getParallelEdgeInfo(id, source, sourceHandleId, edges),
    [id, source, sourceHandleId, edges]
  );

  // Calculate adjusted positions based on node dimensions and offsets
  const getAdjustedPosition = (
    baseX: number,
    baseY: number,
    position: Position,
    offset: number,
    node: typeof sourceNode
  ) => {
    if (!node) return { x: baseX, y: baseY };

    const nodeWidth = node.width || 150;
    const nodeHeight = node.height || 50;
    const isHorizontal = position === Position.Top || position === Position.Bottom;
    const offsetPx = offset * (isHorizontal ? nodeWidth : nodeHeight) * 0.6;

    switch (position) {
      case Position.Top:
      case Position.Bottom:
        return { x: baseX + offsetPx, y: baseY };
      case Position.Left:
      case Position.Right:
        return { x: baseX, y: baseY + offsetPx };
      default:
        return { x: baseX, y: baseY };
    }
  };

  const adjustedSource = getAdjustedPosition(
    sourceX,
    sourceY,
    sourcePosition || Position.Right,
    sourceOffset,
    sourceNode
  );
  const adjustedTarget = getAdjustedPosition(
    targetX,
    targetY,
    targetPosition || Position.Left,
    targetOffset,
    targetNode
  );

  // Generate smooth bezier path with smart routing
  const edgePath = useMemo(
    () =>
      generateSmoothPath(
        adjustedSource.x,
        adjustedSource.y,
        adjustedTarget.x,
        adjustedTarget.y,
        sourcePosition || Position.Right,
        targetPosition || Position.Left,
        parallelIndex,
        parallelTotal
      ),
    [
      adjustedSource.x,
      adjustedSource.y,
      adjustedTarget.x,
      adjustedTarget.y,
      sourcePosition,
      targetPosition,
      parallelIndex,
      parallelTotal,
    ]
  );

  // Generate unique marker ID for this edge's combination of color, style, and size
  const markerId = `arrowhead-${id}-${strokeColor.replace('#', '')}-${arrowHeadStyle}-${arrowHeadSize}`;

  // Calculate arrow size proportional to stroke width
  const baseArrowSize = 12;
  const scaledArrowSize = baseArrowSize * arrowHeadSize * (1 + (strokeWidth - 2) * 0.15);

  // Calculate label position (middle of the curve)
  const labelX = (adjustedSource.x + adjustedTarget.x) / 2;
  const labelY = (adjustedSource.y + adjustedTarget.y) / 2 - 10;

  // Connection point indicator size
  const connectionPointSize = 4;

  return (
    <g className="react-flow__edge">
      {/* SVG Defs for arrowhead marker */}
      {arrowHeadStyle !== 'none' && (
        <defs>
          <marker
            id={markerId}
            markerWidth={scaledArrowSize}
            markerHeight={scaledArrowSize}
            refX={arrowHeadStyle === 'circle' ? 6 : 10}
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={getArrowHeadPath(arrowHeadStyle)}
              fill={arrowHeadStyle === 'outlined' ? 'none' : strokeColor}
              stroke={arrowHeadStyle === 'outlined' ? strokeColor : 'none'}
              strokeWidth={arrowHeadStyle === 'outlined' ? 1.5 : 0}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </marker>
        </defs>
      )}

      {/* Selection highlight (behind main edge) */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 6}
          strokeOpacity={0.15}
          strokeLinecap="round"
          className="react-flow__edge-interaction"
        />
      )}

      {/* Main Edge Path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? strokeWidth + 0.5 : strokeWidth}
        strokeDasharray={getStrokeDasharray(lineStyle)}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={arrowHeadStyle !== 'none' ? `url(#${markerId})` : undefined}
        className="react-flow__edge-path"
        style={{ cursor: 'pointer' }}
      />

      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        className="react-flow__edge-interaction"
      />

      {/* Connection point indicator at source */}
      <circle
        cx={adjustedSource.x}
        cy={adjustedSource.y}
        r={connectionPointSize}
        fill={strokeColor}
        stroke="#1e1e1e"
        strokeWidth={1.5}
        className="react-flow__edge-connection-point"
      />

      {/* Connection point indicator at target */}
      <circle
        cx={adjustedTarget.x}
        cy={adjustedTarget.y}
        r={connectionPointSize}
        fill={strokeColor}
        stroke="#1e1e1e"
        strokeWidth={1.5}
        className="react-flow__edge-connection-point"
      />

      {/* Edge Label */}
      {edgeLabel && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-edgeLabel.length * 3.5 - 6}
            y={-10}
            width={edgeLabel.length * 7 + 12}
            height={20}
            rx={4}
            fill="#1e1e1e"
            stroke={strokeColor}
            strokeWidth={1}
            opacity={0.9}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={11}
            fontFamily="system-ui, sans-serif"
          >
            {edgeLabel}
          </text>
        </g>
      )}
    </g>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);

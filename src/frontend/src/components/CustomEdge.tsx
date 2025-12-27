import { useConnectionPointsStore } from '@/store/connectionPointsStore';
import { useFlowStore } from '@/store/flowStore';
import { ArrowHeadStyle, useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { useUIStore } from '@/store/uiStore';
import { EdgeLineStyle } from '@/types';
import {
    DestinationConnectionPoint,
    OriginConnectionPoint,
} from '@/types/connectionPoints';
import { getPixelPosition } from '@/utils/connectionPointUtils';
import {
    generateSmoothPath,
    getPositionFromHandleId,
} from '@/utils/edgeRouting';
import { X } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EdgeLabelRenderer, EdgeProps, Position, useReactFlow } from 'reactflow';

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
 * - Draggable connection point markers at origins (dot/diamond) and destinations (rectangle)
 * - Edge labels for annotations (like "true/false" branches)
 * - Auto-spacing for multiple connectors on same node side
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
  const setSelectedEdgeId = useFlowStore((state) => state.setSelectedEdgeId);
  const setSelectedNodeId = useFlowStore((state) => state.setSelectedNodeId);
  const removeEdge = useFlowStore((state) => state.removeEdge);
  const { getNode } = useReactFlow();
  const globalSettings = useGlobalSettingsStore();
  
  const pathRef = useRef<SVGPathElement>(null);
  
  // Connection points store
  const {
    getConnectionPoints,
    initializeConnectionPoints,
    recalculateAutoSpacing,
  } = useConnectionPointsStore();
  
  // Get source and target nodes for dimension calculations
  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  
  // Initialize connection points for this edge if not exists
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!initialized) {
      const edge = edges.find(e => e.id === id);
      if (edge) {
        initializeConnectionPoints(edge, edges);
        setInitialized(true);
      }
    }
  }, [id, edges, initialized, initializeConnectionPoints]);
  
  // Recalculate auto-spacing when edges change
  useEffect(() => {
    if (sourceNode) {
      const sourceSide = getPositionFromHandleId(sourceHandleId || 'right-source');
      recalculateAutoSpacing(source, sourceSide, edges);
    }
    if (targetNode) {
      const targetSide = getPositionFromHandleId(targetHandleId || 'left-target');
      recalculateAutoSpacing(target, targetSide, edges);
    }
  }, [edges.length, source, target, sourceHandleId, targetHandleId, sourceNode, targetNode, recalculateAutoSpacing]);
  
  // Get connection point configurations
  const connectionPointConfig = getConnectionPoints(id);
  
  // Get source and target positions from connection points or fall back to defaults
  const sourceSide = sourcePosition || Position.Right;
  const targetSide = targetPosition || Position.Left;
  
  // Create default connection point configs if not available
  const originConfig: OriginConnectionPoint = connectionPointConfig?.origin || {
    type: 'origin',
    position: 0.5,
    isManuallyPositioned: false,
    side: sourceSide,
    markerStyle: 'circle',
  };
  
  const destinationConfig: DestinationConnectionPoint = connectionPointConfig?.destination || {
    type: 'destination',
    position: 0.5,
    isManuallyPositioned: false,
    side: targetSide,
    markerStyle: 'rectangle',
  };

  /**
   * Handle edge click to select the edge
   */
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent) => {
      // Allow event to bubble to React Flow for selection handling
      // But also explicitly set selection here to ensure it works
      console.log('Edge clicked (CustomEdge):', id);
      setSelectedEdgeId(id);
      setSelectedNodeId(null);
      
      // Force right panel to be visible when an edge is selected
      // This ensures the property panel opens even if it was closed
      const { setRightPanelVisible } = useUIStore.getState();
      setRightPanelVisible(true);
    },
    [id, setSelectedEdgeId, setSelectedNodeId]
  );

  /**
   * Handle delete button click
   */
  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      // Allow event to bubble
      removeEdge(id);
      setSelectedEdgeId(null);
    },
    [id, removeEdge, setSelectedEdgeId]
  );

  /**
   * Handle mouse down on edge for better click detection
   */
  const handleEdgeMouseDown = useCallback(
    (event: React.MouseEvent) => {
      // Only handle left mouse button
      if (event.button !== 0) return;
      event.stopPropagation();
    },
    []
  );

  // Get edge properties with fallbacks to global settings
  const strokeColor = (style.stroke as string) || globalSettings.defaultLineColor;
  const strokeWidth = (style.strokeWidth as number) || globalSettings.defaultLineWidth;
  const lineStyle: EdgeLineStyle = data?.lineStyle || globalSettings.defaultLineStyle;
  const arrowHeadSize =
    (data?.arrowHeadSize as number) || globalSettings.defaultArrowHeadSize;
  const arrowHeadStyle: ArrowHeadStyle =
    (data?.arrowHeadStyle as ArrowHeadStyle) || globalSettings.defaultArrowHeadStyle;
  const edgeLabel = data?.label as string | undefined;

  // Get node dimensions for connection point calculations
  const sourceNodeWidth = sourceNode?.width || 150;
  const sourceNodeHeight = sourceNode?.height || 50;
  const targetNodeWidth = targetNode?.width || 150;
  const targetNodeHeight = targetNode?.height || 50;
  
  // Get node positions
  const sourceNodeX = sourceNode?.position.x || 0;
  const sourceNodeY = sourceNode?.position.y || 0;
  const targetNodeX = targetNode?.position.x || 0;
  const targetNodeY = targetNode?.position.y || 0;

  // Get parallel edge info for curve separation
  const { index: parallelIndex, total: parallelTotal } = useMemo(
    () => getParallelEdgeInfo(id, source, sourceHandleId, edges),
    [id, source, sourceHandleId, edges]
  );

  // Calculate actual positions using connection point normalized positions
  const adjustedSource = useMemo(() => {
    return getPixelPosition(
      originConfig.position,
      originConfig.side,
      sourceNodeX,
      sourceNodeY,
      sourceNodeWidth,
      sourceNodeHeight
    );
  }, [originConfig.position, originConfig.side, sourceNodeX, sourceNodeY, sourceNodeWidth, sourceNodeHeight]);
  
  const adjustedTarget = useMemo(() => {
    return getPixelPosition(
      destinationConfig.position,
      destinationConfig.side,
      targetNodeX,
      targetNodeY,
      targetNodeWidth,
      targetNodeHeight
    );
  }, [destinationConfig.position, destinationConfig.side, targetNodeX, targetNodeY, targetNodeWidth, targetNodeHeight]);

  // Generate smooth bezier path with smart routing
  const edgePath = useMemo(
    () =>
      generateSmoothPath(
        adjustedSource.x,
        adjustedSource.y,
        adjustedTarget.x,
        adjustedTarget.y,
        originConfig.side,
        destinationConfig.side,
        parallelIndex,
        parallelTotal
      ),
    [
      adjustedSource.x,
      adjustedSource.y,
      adjustedTarget.x,
      adjustedTarget.y,
      originConfig.side,
      destinationConfig.side,
      parallelIndex,
      parallelTotal,
    ]
  );

  // Generate unique marker ID for this edge's combination of color, style, and size
  // This matches the ID generated in EdgeMarkerDefs
  const markerId = `arrowhead-${id}-${strokeColor.replace('#', '')}-${arrowHeadStyle}-${arrowHeadSize}`;

  // Calculate label position (middle of the curve)
  const labelX = (adjustedSource.x + adjustedTarget.x) / 2;
  const labelY = (adjustedSource.y + adjustedTarget.y) / 2 - 10;

  return (
    <>
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

      {/* Main Edge Path - arrowhead is rendered in ConnectionPointsOverlay */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? strokeWidth + 0.5 : strokeWidth}
        strokeDasharray={getStrokeDasharray(lineStyle)}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="react-flow__edge-path"
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
        ref={pathRef}
        onClick={handleEdgeClick}
        onMouseDown={handleEdgeMouseDown}
      />

      {/* Invisible wider path for easier selection - uses rgba for better event handling */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(255, 255, 255, 0)"
        strokeWidth={30}
        strokeLinecap="round"
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
        className="react-flow__edge-interaction"
        onClick={handleEdgeClick}
        onMouseDown={handleEdgeMouseDown}
      />

      {/* Connection point markers are rendered by ConnectionPointsOverlay for proper z-index */}

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

      {/* Delete Button - shows when selected */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <button
              onClick={handleDelete}
              className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 
                         flex items-center justify-center transition-all duration-150
                         shadow-lg hover:scale-110 border border-red-600"
              title="Delete edge"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);

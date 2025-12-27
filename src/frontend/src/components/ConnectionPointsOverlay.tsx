import { useConnectionPointsStore } from '@/store/connectionPointsStore';
import { useFlowStore } from '@/store/flowStore';
import { ArrowHeadStyle, useGlobalSettingsStore } from '@/store/globalSettingsStore';
import {
    CONNECTION_POINT_STYLES,
    DestinationConnectionPoint,
    OriginConnectionPoint,
} from '@/types/connectionPoints';
import { getPixelPosition } from '@/utils/connectionPointUtils';
import { calculateEndTangentAngle } from '@/utils/edgeRouting';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Position, useReactFlow, useStore } from 'reactflow';

import { getPositionFromHandleId } from '@/utils/edgeRouting';

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
 * ConnectionPointsOverlay Component
 * Renders all connection point markers as a single overlay layer on top of nodes.
 * This ensures connection points are always visible and properly draggable.
 */
function ConnectionPointsOverlayComponent() {
  const edges = useFlowStore((state) => state.edges);
  const selectedEdgeId = useFlowStore((state) => state.selectedEdgeId);
  const { getNode, screenToFlowPosition } = useReactFlow();
  
  const {
    connectionPoints,
    getConnectionPoints,
    initializeConnectionPoints,
    updateConnectionPointPosition,
    setManuallyPositioned,
    draggedPoint,
    startDrag,
    endDrag,
  } = useConnectionPointsStore();
  
  // Get the ReactFlow transform for proper SVG rendering
  const transform = useStore((state) => state.transform);
  const [x, y, zoom] = transform;
  
  // Ref for tracking drag state
  const dragStateRef = useRef<{
    isDragging: boolean;
    edgeId: string;
    pointType: 'origin' | 'destination';
    side: Position;
  } | null>(null);
  
  // Track previous edge count to detect changes
  const prevEdgeCountRef = useRef(edges.length);
  
  // Get recalculateAutoSpacing from store
  const recalculateAutoSpacing = useConnectionPointsStore((state) => state.recalculateAutoSpacing);
  
  // Initialize connection points for all edges and recalculate spacing when edges change
  useEffect(() => {
    // Initialize any new edges
    edges.forEach((edge) => {
      if (!connectionPoints.has(edge.id)) {
        initializeConnectionPoints(edge, edges);
      }
    });
    
    // If edge count changed, recalculate all auto-spaced positions
    if (prevEdgeCountRef.current !== edges.length) {
      // Collect all unique node-side combinations that need recalculation
      const nodeSides = new Set<string>();
      edges.forEach((edge) => {
        const sourceHandle = edge.sourceHandle || 'right-source';
        const targetHandle = edge.targetHandle || 'left-target';
        const sourceSide = sourceHandle.startsWith('top') ? Position.Top :
                          sourceHandle.startsWith('bottom') ? Position.Bottom :
                          sourceHandle.startsWith('left') ? Position.Left : Position.Right;
        const targetSide = targetHandle.startsWith('top') ? Position.Top :
                          targetHandle.startsWith('bottom') ? Position.Bottom :
                          targetHandle.startsWith('left') ? Position.Left : Position.Right;
        nodeSides.add(`${edge.source}-${sourceSide}`);
        nodeSides.add(`${edge.target}-${targetSide}`);
      });
      
      // Recalculate each unique node-side combination
      nodeSides.forEach((key) => {
        const [nodeId, side] = key.split('-');
        recalculateAutoSpacing(nodeId, side as Position, edges);
      });
      
      prevEdgeCountRef.current = edges.length;
    }
  }, [edges, connectionPoints, initializeConnectionPoints, recalculateAutoSpacing]);
  
  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStateRef.current) return;
    
    const { edgeId, pointType, side } = dragStateRef.current;
    const edge = edges.find((ed) => ed.id === edgeId);
    if (!edge) return;
    
    const nodeId = pointType === 'origin' ? edge.source : edge.target;
    const node = getNode(nodeId);
    if (!node) return;
    
    // Convert screen coordinates to flow coordinates
    const flowPosition = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });
    
    const nodeX = node.position.x;
    const nodeY = node.position.y;
    const nodeWidth = node.width || 150;
    const nodeHeight = node.height || 50;
    
    // Calculate normalized position based on side
    let normalizedPos: number;
    if (side === Position.Top || side === Position.Bottom) {
      normalizedPos = (flowPosition.x - nodeX) / nodeWidth;
    } else {
      normalizedPos = (flowPosition.y - nodeY) / nodeHeight;
    }
    
    // Clamp to valid range
    normalizedPos = Math.max(0.05, Math.min(0.95, normalizedPos));
    
    updateConnectionPointPosition(edgeId, pointType, normalizedPos);
  }, [edges, getNode, screenToFlowPosition, updateConnectionPointPosition]);
  
  /**
   * Handle mouse up to end drag
   */
  const handleMouseUp = useCallback(() => {
    if (dragStateRef.current) {
      const { edgeId, pointType } = dragStateRef.current;
      setManuallyPositioned(edgeId, pointType, true);
      endDrag();
      dragStateRef.current = null;
    }
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [endDrag, setManuallyPositioned, handleMouseMove]);
  
  /**
   * Start dragging a connection point
   */
  const handleStartDrag = useCallback((
    e: React.MouseEvent,
    edgeId: string,
    pointType: 'origin' | 'destination',
    side: Position,
    currentPosition: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    dragStateRef.current = { isDragging: true, edgeId, pointType, side };
    
    startDrag({
      edgeId,
      pointType,
      nodeId: '', // Not used in this implementation
      side,
      startPosition: currentPosition,
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [startDrag, handleMouseMove, handleMouseUp]);
  
  // Get global settings for arrowhead defaults
  const globalSettings = useGlobalSettingsStore();
  
  // Render all connection points
  const renderConnectionPoints = () => {
    const points: JSX.Element[] = [];
    
    edges.forEach((edge) => {
      const config = getConnectionPoints(edge.id);
      if (!config) return;
      
      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);
      if (!sourceNode || !targetNode) return;
      
      // Get edge stroke color for the markers
      const strokeColor = (edge.style?.stroke as string) || '#06b6d4';
      const isSelected = selectedEdgeId === edge.id;
      
      // Get arrowhead settings
      const arrowHeadStyle: ArrowHeadStyle = (edge.data?.arrowHeadStyle as ArrowHeadStyle) || globalSettings.defaultArrowHeadStyle;
      const arrowHeadSize = (edge.data?.arrowHeadSize as number) || globalSettings.defaultArrowHeadSize;
      
      // Render origin marker
      const originPos = getPixelPosition(
        config.origin.position,
        config.origin.side,
        sourceNode.position.x,
        sourceNode.position.y,
        sourceNode.width || 150,
        sourceNode.height || 50
      );
      
      points.push(
        <OriginPoint
          key={`origin-${edge.id}`}
          config={config.origin}
          position={originPos}
          color={strokeColor}
          isSelected={isSelected}
          isDragging={draggedPoint?.edgeId === edge.id && draggedPoint?.pointType === 'origin'}
          onStartDrag={(e) => handleStartDrag(e, edge.id, 'origin', config.origin.side, config.origin.position)}
        />
      );
      
      // Render destination marker
      const destPos = getPixelPosition(
        config.destination.position,
        config.destination.side,
        targetNode.position.x,
        targetNode.position.y,
        targetNode.width || 150,
        targetNode.height || 50
      );
      
      // Calculate the tangent angle of the edge at the destination
      // This ensures the arrowhead aligns perfectly with the edge direction
      const { index: parallelIndex, total: parallelTotal } = getParallelEdgeInfo(
        edge.id,
        edge.source,
        edge.sourceHandle,
        edges
      );

      const tangentAngle = calculateEndTangentAngle(
        originPos.x,
        originPos.y,
        destPos.x,
        destPos.y,
        config.origin.side,
        config.destination.side,
        parallelIndex,
        parallelTotal
      );
      
      points.push(
        <DestinationPoint
          key={`dest-${edge.id}`}
          config={config.destination}
          position={destPos}
          color={strokeColor}
          isSelected={isSelected}
          isDragging={draggedPoint?.edgeId === edge.id && draggedPoint?.pointType === 'destination'}
          onStartDrag={(e) => handleStartDrag(e, edge.id, 'destination', config.destination.side, config.destination.position)}
          arrowHeadStyle={arrowHeadStyle}
          arrowHeadSize={arrowHeadSize}
          tangentAngle={tangentAngle}
        />
      );
    });
    
    return points;
  };
  
  return (
    <svg
      className="react-flow__connection-points-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'visible',
      }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        {renderConnectionPoints()}
      </g>
    </svg>
  );
}

/**
 * Origin Point Component
 */
interface OriginPointProps {
  config: OriginConnectionPoint;
  position: { x: number; y: number };
  color: string;
  isSelected: boolean;
  isDragging: boolean;
  onStartDrag: (e: React.MouseEvent) => void;
}

function OriginPoint({
  config,
  position,
  color,
  isSelected,
  isDragging,
  onStartDrag,
}: OriginPointProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const styles = CONNECTION_POINT_STYLES.origin[config.markerStyle];
  const hoverStyles = CONNECTION_POINT_STYLES.hover;
  const scale = isHovered || isDragging ? hoverStyles.scale : 1;
  
  if (config.markerStyle === 'diamond') {
    const size = (styles as typeof CONNECTION_POINT_STYLES.origin.diamond).size;
    const halfSize = size / 2;
    
    return (
      <g 
        transform={`translate(${position.x}, ${position.y}) scale(${scale})`}
        style={{ pointerEvents: 'all' }}
      >
        {(isHovered || isDragging) && (
          <rect
            x={-halfSize - hoverStyles.glowRadius}
            y={-halfSize - hoverStyles.glowRadius}
            width={size + hoverStyles.glowRadius * 2}
            height={size + hoverStyles.glowRadius * 2}
            transform="rotate(45)"
            fill={color}
            opacity={0.3}
            rx={2}
          />
        )}
        <rect
          x={-halfSize}
          y={-halfSize}
          width={size}
          height={size}
          transform="rotate(45)"
          fill={color}
          stroke={isSelected ? '#ffffff' : '#1e1e1e'}
          strokeWidth={styles.strokeWidth}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={onStartDrag}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
        {config.isManuallyPositioned && (
          <circle cx={halfSize + 2} cy={-halfSize - 2} r={2} fill="#22c55e" />
        )}
      </g>
    );
  }
  
  // Circle marker
  const radius = (styles as typeof CONNECTION_POINT_STYLES.origin.circle).radius;
  
  return (
    <g 
      transform={`translate(${position.x}, ${position.y}) scale(${scale})`}
      style={{ pointerEvents: 'all' }}
    >
      {(isHovered || isDragging) && (
        <circle
          cx={0}
          cy={0}
          r={radius + hoverStyles.glowRadius}
          fill={color}
          opacity={0.3}
        />
      )}
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill={color}
        stroke={isSelected ? '#ffffff' : '#1e1e1e'}
        strokeWidth={styles.strokeWidth}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={onStartDrag}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      {config.isManuallyPositioned && (
        <circle cx={radius + 2} cy={-radius - 2} r={2} fill="#22c55e" />
      )}
    </g>
  );
}

/**
 * Generate arrow head path based on style
 */
function getArrowHeadPath(style: ArrowHeadStyle): string {
  switch (style) {
    case 'filled':
      return 'M0,0 L8,4 L0,8 L2,4 Z';
    case 'outlined':
      return 'M0,0 L8,4 L0,8';
    case 'diamond':
      return 'M0,4 L4,0 L8,4 L4,8 Z';
    case 'circle':
      return 'M4,0 A4,4 0 1,1 4,8 A4,4 0 1,1 4,0';
    case 'none':
    default:
      return '';
  }
}

/**
 * Destination Point Component
 * Renders destination marker with arrowhead on top
 * The flat bar (rectangle) is always perpendicular to the incoming edge direction
 * The arrowhead aligns perfectly with the edge tangent at the destination
 */
interface DestinationPointProps {
  config: DestinationConnectionPoint;
  position: { x: number; y: number };
  color: string;
  isSelected: boolean;
  isDragging: boolean;
  onStartDrag: (e: React.MouseEvent) => void;
  arrowHeadStyle: ArrowHeadStyle;
  arrowHeadSize: number;
  tangentAngle: number; // The angle of the edge tangent at the destination (in degrees)
}

function DestinationPoint({
  config,
  position,
  color,
  isSelected,
  isDragging,
  onStartDrag,
  arrowHeadStyle,
  arrowHeadSize,
  tangentAngle,
}: DestinationPointProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const styles = CONNECTION_POINT_STYLES.destination.rectangle;
  const hoverStyles = CONNECTION_POINT_STYLES.hover;
  const scale = isHovered || isDragging ? hoverStyles.scale : 1;
  
  // Use the actual tangent angle from the edge curve for arrowhead rotation
  // tangentAngle is in degrees where 0 = pointing right
  // The arrowhead points in the direction of the edge (towards the destination)
  const arrowRotation = tangentAngle;
  
  // The bar should be aligned with the node side
  // side is determined by config.side
  let barRotation = 0;
  switch (config.side) {
    case Position.Top:
    case Position.Bottom:
      barRotation = 0; // Horizontal bar
      break;
    case Position.Left:
    case Position.Right:
      barRotation = 90; // Vertical bar
      break;
  }
  
  const halfWidth = styles.width / 2;
  const halfHeight = styles.height / 2;
  
  // Calculate arrowhead offset - position it so tip barely touches the bar
  const arrowSize = 8 * arrowHeadSize;
  // For filled arrows, the tip is at x=8 in the path (0,0 L8,4 L0,8 L2,4 Z)
  // We want the tip to just touch the edge of the bar (halfHeight away from center)
  // Note: This offset logic assumes the arrowhead is rotated around (0,0)
  // We need to push it back along the tangent vector
  const arrowOffset = halfHeight + arrowSize - 1; // Tip barely touches the bar
  
  return (
    <g 
      transform={`translate(${position.x}, ${position.y}) scale(${scale})`}
      style={{ pointerEvents: 'all' }}
    >
      {/* Arrowhead - rotates based on edge direction, positioned so tip barely touches the bar */}
      {arrowHeadStyle !== 'none' && (
        <g transform={`rotate(${arrowRotation})`}>
          <g transform={`translate(${-arrowOffset}, ${-arrowSize / 2})`}>
            <path
              d={getArrowHeadPath(arrowHeadStyle)}
              fill={arrowHeadStyle === 'outlined' ? 'none' : color}
              stroke={arrowHeadStyle === 'outlined' ? color : 'none'}
              strokeWidth={arrowHeadStyle === 'outlined' ? 1.5 : 0}
              strokeLinejoin="round"
              strokeLinecap="round"
              transform={`scale(${arrowHeadSize})`}
            />
          </g>
        </g>
      )}
      
      {/* Hover glow - follows bar rotation */}
      {(isHovered || isDragging) && (
        <g transform={`rotate(${barRotation})`}>
          <rect
            x={-halfWidth - hoverStyles.glowRadius}
            y={-halfHeight - hoverStyles.glowRadius}
            width={styles.width + hoverStyles.glowRadius * 2}
            height={styles.height + hoverStyles.glowRadius * 2}
            fill={color}
            opacity={0.3}
            rx={styles.cornerRadius + 1}
          />
        </g>
      )}
      
      {/* Destination marker (flat bar) - perpendicular to the arrowhead direction */}
      <g transform={`rotate(${barRotation})`}>
        <rect
          x={-halfWidth}
          y={-halfHeight}
          width={styles.width}
          height={styles.height}
          fill={color}
          stroke={isSelected ? '#ffffff' : '#1e1e1e'}
          strokeWidth={styles.strokeWidth}
          rx={styles.cornerRadius}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={onStartDrag}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      </g>
      
      {/* Manual position indicator */}
      {config.isManuallyPositioned && (
        <circle cx={halfWidth + 2} cy={-halfHeight - 2} r={2} fill="#22c55e" />
      )}
    </g>
  );
}

export const ConnectionPointsOverlay = memo(ConnectionPointsOverlayComponent);

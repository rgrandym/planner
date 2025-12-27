import { Edge, Node, Position } from 'reactflow';

/**
 * Edge routing utilities for intelligent connector path calculation
 * Handles multiple connections per node side with even distribution
 */

/**
 * Connection info for a specific handle
 */
export interface HandleConnection {
  handleId: string;
  position: Position;
  nodeId: string;
  isSource: boolean;
  connectionIndex: number;
  totalConnections: number;
}

/**
 * Get the position of a side as a string
 */
export function positionToSide(position: Position): 'top' | 'bottom' | 'left' | 'right' {
  switch (position) {
    case Position.Top:
      return 'top';
    case Position.Bottom:
      return 'bottom';
    case Position.Left:
      return 'left';
    case Position.Right:
      return 'right';
    default:
      return 'right';
  }
}

/**
 * Analyze edges to determine connection distribution per node side
 */
export function analyzeNodeConnections(
  nodeId: string,
  edges: Edge[]
): Map<Position, { sources: string[]; targets: string[] }> {
  const connectionMap = new Map<Position, { sources: string[]; targets: string[] }>();

  // Initialize all sides
  [Position.Top, Position.Bottom, Position.Left, Position.Right].forEach((pos) => {
    connectionMap.set(pos, { sources: [], targets: [] });
  });

  edges.forEach((edge) => {
    if (edge.source === nodeId) {
      // Outgoing connection
      const handleId = edge.sourceHandle || 'right-source';
      const position = getPositionFromHandleId(handleId);
      const existing = connectionMap.get(position) || { sources: [], targets: [] };
      existing.sources.push(edge.id);
      connectionMap.set(position, existing);
    }
    if (edge.target === nodeId) {
      // Incoming connection
      const handleId = edge.targetHandle || 'left-target';
      const position = getPositionFromHandleId(handleId);
      const existing = connectionMap.get(position) || { sources: [], targets: [] };
      existing.targets.push(edge.id);
      connectionMap.set(position, existing);
    }
  });

  return connectionMap;
}

/**
 * Extract position from handle ID
 */
export function getPositionFromHandleId(handleId: string): Position {
  if (handleId.startsWith('top')) return Position.Top;
  if (handleId.startsWith('bottom')) return Position.Bottom;
  if (handleId.startsWith('left')) return Position.Left;
  if (handleId.startsWith('right')) return Position.Right;
  return Position.Right;
}

/**
 * Calculate the offset for a connection point on a node side
 * Returns a value between -0.5 and 0.5 representing position along the edge
 */
export function calculateHandleOffset(
  edgeId: string,
  nodeId: string,
  position: Position,
  isSource: boolean,
  edges: Edge[]
): number {
  // Find all edges connecting to this node on this side
  const handlePrefix = positionToSide(position);

  const relevantEdges = edges.filter((edge) => {
    if (isSource && edge.source === nodeId) {
      const handleId = edge.sourceHandle || 'right-source';
      return handleId.startsWith(handlePrefix);
    }
    if (!isSource && edge.target === nodeId) {
      const handleId = edge.targetHandle || 'left-target';
      return handleId.startsWith(handlePrefix);
    }
    return false;
  });

  if (relevantEdges.length <= 1) return 0;

  // Find this edge's index
  const edgeIndex = relevantEdges.findIndex((e) => e.id === edgeId);
  if (edgeIndex === -1) return 0;

  // Calculate evenly distributed offset
  const totalEdges = relevantEdges.length;
  const spacing = 1 / (totalEdges + 1);
  const offset = (edgeIndex + 1) * spacing - 0.5;

  return offset;
}

/**
 * Calculate connection point coordinates with offset
 */
export function getConnectionPoint(
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  position: Position,
  offset: number = 0
): { x: number; y: number } {
  const isHorizontal = position === Position.Top || position === Position.Bottom;
  const dimension = isHorizontal ? nodeWidth : nodeHeight;
  const offsetPx = offset * dimension * 0.8; // Use 80% of dimension for spacing

  switch (position) {
    case Position.Top:
      return { x: nodeX + nodeWidth / 2 + offsetPx, y: nodeY };
    case Position.Bottom:
      return { x: nodeX + nodeWidth / 2 + offsetPx, y: nodeY + nodeHeight };
    case Position.Left:
      return { x: nodeX, y: nodeY + nodeHeight / 2 + offsetPx };
    case Position.Right:
      return { x: nodeX + nodeWidth, y: nodeY + nodeHeight / 2 + offsetPx };
    default:
      return { x: nodeX + nodeWidth, y: nodeY + nodeHeight / 2 };
  }
}

/**
 * Generate smooth bezier control points for edge routing
 * Ensures curves don't overlap for parallel edges
 * Handles self-loops and backward connections with special routing
 */
export function calculateBezierControlPoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  edgeIndex: number = 0,
  totalParallelEdges: number = 1,
  isSelfLoop: boolean = false,
  isBackwardConnection: boolean = false
): { controlPoint1: { x: number; y: number }; controlPoint2: { x: number; y: number } } {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Handle self-loop (node connecting to itself)
  if (isSelfLoop) {
    const loopSize = 80 + edgeIndex * 30; // Increase size for multiple self-loops
    // Create a loop that goes out and comes back
    return {
      controlPoint1: { x: sourceX + loopSize, y: sourceY - loopSize },
      controlPoint2: { x: targetX + loopSize, y: targetY + loopSize },
    };
  }

  // Handle backward connection (target is "before" source in typical flow)
  if (isBackwardConnection) {
    const loopOffset = 60 + edgeIndex * 25;
    // Route the connection around the nodes
    const midY = Math.min(sourceY, targetY) - loopOffset;
    
    return {
      controlPoint1: { x: sourceX, y: midY },
      controlPoint2: { x: targetX, y: midY },
    };
  }

  // Base curvature factor
  const baseCurvature = Math.min(distance * 0.4, 150);

  // Offset for parallel edges
  const parallelOffset = totalParallelEdges > 1 
    ? (edgeIndex - (totalParallelEdges - 1) / 2) * 30 
    : 0;

  // Calculate control points based on positions
  let cp1 = { x: sourceX, y: sourceY };
  let cp2 = { x: targetX, y: targetY };

  switch (sourcePosition) {
    case Position.Right:
      cp1 = { x: sourceX + baseCurvature, y: sourceY + parallelOffset };
      break;
    case Position.Left:
      cp1 = { x: sourceX - baseCurvature, y: sourceY + parallelOffset };
      break;
    case Position.Bottom:
      cp1 = { x: sourceX + parallelOffset, y: sourceY + baseCurvature };
      break;
    case Position.Top:
      cp1 = { x: sourceX + parallelOffset, y: sourceY - baseCurvature };
      break;
  }

  switch (targetPosition) {
    case Position.Left:
      cp2 = { x: targetX - baseCurvature, y: targetY + parallelOffset };
      break;
    case Position.Right:
      cp2 = { x: targetX + baseCurvature, y: targetY + parallelOffset };
      break;
    case Position.Top:
      cp2 = { x: targetX + parallelOffset, y: targetY - baseCurvature };
      break;
    case Position.Bottom:
      cp2 = { x: targetX + parallelOffset, y: targetY + baseCurvature };
      break;
  }

  return { controlPoint1: cp1, controlPoint2: cp2 };
}

/**
 * Generate SVG path for a smooth bezier curve
 * Supports self-loops and backward connections
 */
export function generateSmoothPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  edgeIndex: number = 0,
  totalParallelEdges: number = 1,
  isSelfLoop: boolean = false,
  isBackwardConnection: boolean = false
): string {
  // Self-loop requires a special path - a nice circular loop above the node
  if (isSelfLoop) {
    const loopRadius = 50 + edgeIndex * 20;
    // Create a proper circular self-loop path going up and around
    const startX = sourceX;
    const startY = sourceY;
    // Go up-right, then arc around to up-left, then back down
    return `M ${startX} ${startY} 
            C ${startX + loopRadius} ${startY - loopRadius * 0.5},
              ${startX + loopRadius} ${startY - loopRadius * 1.5},
              ${startX} ${startY - loopRadius * 1.2}
            C ${startX - loopRadius} ${startY - loopRadius * 1.5},
              ${startX - loopRadius} ${startY - loopRadius * 0.5},
              ${startX} ${startY}`;
  }

  const { controlPoint1, controlPoint2 } = calculateBezierControlPoints(
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    edgeIndex,
    totalParallelEdges,
    isSelfLoop,
    isBackwardConnection
  );

  return `M ${sourceX} ${sourceY} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${targetX} ${targetY}`;
}

/**
 * Determine the best handle position for a connection
 * based on relative positions of source and target nodes
 */
export function getBestHandlePositions(
  sourceNode: Node,
  targetNode: Node
): { sourcePosition: Position; targetPosition: Position } {
  const sx = sourceNode.position.x + (sourceNode.width || 150) / 2;
  const sy = sourceNode.position.y + (sourceNode.height || 50) / 2;
  const tx = targetNode.position.x + (targetNode.width || 150) / 2;
  const ty = targetNode.position.y + (targetNode.height || 50) / 2;

  const dx = tx - sx;
  const dy = ty - sy;

  // Determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      return { sourcePosition: Position.Right, targetPosition: Position.Left };
    } else {
      return { sourcePosition: Position.Left, targetPosition: Position.Right };
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      return { sourcePosition: Position.Bottom, targetPosition: Position.Top };
    } else {
      return { sourcePosition: Position.Top, targetPosition: Position.Bottom };
    }
  }
}

/**
 * Calculate the tangent angle (in degrees) of a cubic bezier curve at the endpoint (t=1)
 * The tangent at t=1 is the direction from control point 2 to the end point
 */
export function calculateEndTangentAngle(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  edgeIndex: number = 0,
  totalParallelEdges: number = 1
): number {
  const { controlPoint2 } = calculateBezierControlPoints(
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    edgeIndex,
    totalParallelEdges,
    false,
    false
  );

  // The tangent at t=1 is the direction from controlPoint2 to target
  const dx = targetX - controlPoint2.x;
  const dy = targetY - controlPoint2.y;
  
  // Calculate angle in degrees (0 = pointing right, 90 = pointing down)
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = angleRad * (180 / Math.PI);
  
  return angleDeg;
}

import {
    AutoSpacingConfig,
    ConnectionPointsMap,
    DEFAULT_AUTO_SPACING_CONFIG,
    DestinationConnectionPoint,
    DraggedConnectionPoint,
    EdgeConnectionPoints,
    NormalizedPosition,
    OriginConnectionPoint,
    OriginMarkerStyle,
} from '@/types/connectionPoints';
import { Edge, Position } from 'reactflow';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Get position from handle ID
 */
function getPositionFromHandleId(handleId: string | null | undefined): Position {
  if (!handleId) return Position.Right;
  if (handleId.startsWith('top')) return Position.Top;
  if (handleId.startsWith('bottom')) return Position.Bottom;
  if (handleId.startsWith('left')) return Position.Left;
  if (handleId.startsWith('right')) return Position.Right;
  return Position.Right;
}

/**
 * Interface for the connection points store
 */
interface ConnectionPointsStore {
  /** Map of edge IDs to their connection point configurations */
  connectionPoints: ConnectionPointsMap;
  
  /** Currently dragged connection point */
  draggedPoint: DraggedConnectionPoint | null;
  
  /** Auto-spacing configuration */
  autoSpacingConfig: AutoSpacingConfig;
  
  /** Default origin marker style for new connections */
  defaultOriginStyle: OriginMarkerStyle;
  
  /**
   * Initialize connection points for an edge
   */
  initializeConnectionPoints: (edge: Edge, allEdges: Edge[]) => void;
  
  /**
   * Update connection point position (manual repositioning)
   */
  updateConnectionPointPosition: (
    edgeId: string,
    pointType: 'origin' | 'destination',
    newPosition: NormalizedPosition
  ) => void;
  
  /**
   * Set connection point as manually positioned
   */
  setManuallyPositioned: (
    edgeId: string,
    pointType: 'origin' | 'destination',
    isManual: boolean
  ) => void;
  
  /**
   * Update origin marker style
   */
  setOriginMarkerStyle: (edgeId: string, style: OriginMarkerStyle) => void;
  
  /**
   * Start dragging a connection point
   */
  startDrag: (point: DraggedConnectionPoint) => void;
  
  /**
   * Update drag position
   */
  updateDrag: (newPosition: NormalizedPosition) => void;
  
  /**
   * End drag and commit position
   */
  endDrag: () => void;
  
  /**
   * Cancel drag operation
   */
  cancelDrag: () => void;
  
  /**
   * Recalculate auto-spacing for all edges on a node side
   */
  recalculateAutoSpacing: (
    nodeId: string,
    side: Position,
    allEdges: Edge[]
  ) => void;
  
  /**
   * Reset a connection point to auto-positioned
   */
  resetToAutoPosition: (edgeId: string, pointType: 'origin' | 'destination') => void;
  
  /**
   * Reset all connection points on a node side to auto-positioned
   */
  resetSideToAutoPosition: (
    nodeId: string,
    side: Position,
    allEdges: Edge[]
  ) => void;
  
  /**
   * Remove connection points for an edge
   */
  removeConnectionPoints: (edgeId: string) => void;
  
  /**
   * Sync connection points with edges (clean up orphaned points)
   */
  syncWithEdges: (edges: Edge[]) => void;
  
  /**
   * Get connection points for an edge
   */
  getConnectionPoints: (edgeId: string) => EdgeConnectionPoints | undefined;
  
  /**
   * Update auto-spacing configuration
   */
  setAutoSpacingConfig: (config: Partial<AutoSpacingConfig>) => void;
  
  /**
   * Set default origin marker style
   */
  setDefaultOriginStyle: (style: OriginMarkerStyle) => void;
}

/**
 * Calculate evenly distributed positions for connection points
 */
function calculateAutoSpacedPositions(
  count: number,
  config: AutoSpacingConfig
): NormalizedPosition[] {
  if (count === 0) return [];
  if (count === 1) return [0.5]; // Single point at center
  
  // Use a fixed spacing percentage instead of filling available space
  // 0.15 (15%) is a reasonable spacing that keeps points identifiable but clustered
  const FIXED_SPACING = 0.15;
  
  const positions: NormalizedPosition[] = [];
  
  // Always distribute symmetrically around center
  const halfCount = Math.floor(count / 2);
  const isOdd = count % 2 === 1;
  
  if (isOdd) {
    positions.push(0.5); // Center point
    for (let i = 1; i <= halfCount; i++) {
      const offset = i * FIXED_SPACING;
      positions.push(0.5 - offset);
      positions.push(0.5 + offset);
    }
  } else {
    for (let i = 0; i < halfCount; i++) {
      const offset = (i - 0.5) * FIXED_SPACING + (FIXED_SPACING / 2);
      positions.push(0.5 - offset);
      positions.push(0.5 + offset);
    }
  }
  
  // Sort positions and clamp to ensure they stay within bounds [0.05, 0.95]
  return positions
    .sort((a, b) => a - b)
    .map(p => Math.max(0.05, Math.min(0.95, p)));
}

/**
 * Get edges connected to a specific node side
 * Returns ALL edges (both incoming and outgoing) on that side
 */
function getEdgesOnNodeSide(
  nodeId: string,
  side: Position,
  edges: Edge[]
): Edge[] {
  const sidePrefix = side.toLowerCase();
  
  return edges.filter((edge) => {
    // Check if it's an outgoing edge from this side
    if (edge.source === nodeId) {
      const handleId = edge.sourceHandle || 'right-source';
      if (handleId.startsWith(sidePrefix)) return true;
    }
    // Check if it's an incoming edge to this side
    if (edge.target === nodeId) {
      const handleId = edge.targetHandle || 'left-target';
      if (handleId.startsWith(sidePrefix)) return true;
    }
    return false;
  });
}

/**
 * Zustand store for managing connection point positions and behavior
 */
export const useConnectionPointsStore = create<ConnectionPointsStore>()(
  subscribeWithSelector((set, get) => ({
    connectionPoints: new Map(),
    draggedPoint: null,
    autoSpacingConfig: DEFAULT_AUTO_SPACING_CONFIG,
    defaultOriginStyle: 'circle',
    
    initializeConnectionPoints: (edge: Edge, allEdges: Edge[]) => {
      const { connectionPoints, autoSpacingConfig, defaultOriginStyle } = get();
      
      // Skip if already initialized
      if (connectionPoints.has(edge.id)) return;
      
      const sourceSide = getPositionFromHandleId(edge.sourceHandle);
      const targetSide = getPositionFromHandleId(edge.targetHandle);
      
      // Get edges on same sides to calculate auto-spacing
      // We now combine all edges on a side (incoming + outgoing)
      const sourceEdges = getEdgesOnNodeSide(edge.source, sourceSide, allEdges);
      const targetEdges = getEdgesOnNodeSide(edge.target, targetSide, allEdges);
      
      // Calculate positions for all edges on these sides
      const sourcePositions = calculateAutoSpacedPositions(
        sourceEdges.length,
        autoSpacingConfig
      );
      const targetPositions = calculateAutoSpacedPositions(
        targetEdges.length,
        autoSpacingConfig
      );
      
      // Find this edge's index
      const sourceIndex = sourceEdges.findIndex((e) => e.id === edge.id);
      const targetIndex = targetEdges.findIndex((e) => e.id === edge.id);
      
      const origin: OriginConnectionPoint = {
        type: 'origin',
        position: sourcePositions[sourceIndex] ?? 0.5,
        isManuallyPositioned: false,
        side: sourceSide,
        markerStyle: defaultOriginStyle,
      };
      
      const destination: DestinationConnectionPoint = {
        type: 'destination',
        position: targetPositions[targetIndex] ?? 0.5,
        isManuallyPositioned: false,
        side: targetSide,
        markerStyle: 'rectangle',
      };
      
      const newPoints: EdgeConnectionPoints = {
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        origin,
        destination,
      };
      
      const newMap = new Map(connectionPoints);
      newMap.set(edge.id, newPoints);
      
      set({ connectionPoints: newMap });
    },
    
    updateConnectionPointPosition: (edgeId, pointType, newPosition) => {
      const { connectionPoints } = get();
      const points = connectionPoints.get(edgeId);
      
      if (!points) return;
      
      const clampedPosition = Math.max(0.05, Math.min(0.95, newPosition));
      
      const newMap = new Map(connectionPoints);
      const updatedPoints = { ...points };
      
      if (pointType === 'origin') {
        updatedPoints.origin = {
          ...updatedPoints.origin,
          position: clampedPosition,
          isManuallyPositioned: true,
        };
      } else {
        updatedPoints.destination = {
          ...updatedPoints.destination,
          position: clampedPosition,
          isManuallyPositioned: true,
        };
      }
      
      newMap.set(edgeId, updatedPoints);
      set({ connectionPoints: newMap });
    },
    
    setManuallyPositioned: (edgeId, pointType, isManual) => {
      const { connectionPoints } = get();
      const points = connectionPoints.get(edgeId);
      
      if (!points) return;
      
      const newMap = new Map(connectionPoints);
      const updatedPoints = { ...points };
      
      if (pointType === 'origin') {
        updatedPoints.origin = {
          ...updatedPoints.origin,
          isManuallyPositioned: isManual,
        };
      } else {
        updatedPoints.destination = {
          ...updatedPoints.destination,
          isManuallyPositioned: isManual,
        };
      }
      
      newMap.set(edgeId, updatedPoints);
      set({ connectionPoints: newMap });
    },
    
    setOriginMarkerStyle: (edgeId, style) => {
      const { connectionPoints } = get();
      const points = connectionPoints.get(edgeId);
      
      if (!points) return;
      
      const newMap = new Map(connectionPoints);
      newMap.set(edgeId, {
        ...points,
        origin: { ...points.origin, markerStyle: style },
      });
      
      set({ connectionPoints: newMap });
    },
    
    startDrag: (point) => {
      set({ draggedPoint: point });
    },
    
    updateDrag: (newPosition) => {
      const { draggedPoint } = get();
      if (!draggedPoint) return;
      
      // Update the position in real-time during drag
      get().updateConnectionPointPosition(
        draggedPoint.edgeId,
        draggedPoint.pointType,
        newPosition
      );
    },
    
    endDrag: () => {
      const { draggedPoint } = get();
      if (draggedPoint) {
        // Mark as manually positioned
        get().setManuallyPositioned(draggedPoint.edgeId, draggedPoint.pointType, true);
      }
      set({ draggedPoint: null });
    },
    
    cancelDrag: () => {
      const { draggedPoint, connectionPoints } = get();
      if (!draggedPoint) return;
      
      // Restore original position
      const points = connectionPoints.get(draggedPoint.edgeId);
      if (points) {
        get().updateConnectionPointPosition(
          draggedPoint.edgeId,
          draggedPoint.pointType,
          draggedPoint.startPosition
        );
        get().setManuallyPositioned(
          draggedPoint.edgeId,
          draggedPoint.pointType,
          false
        );
      }
      
      set({ draggedPoint: null });
    },
    
    recalculateAutoSpacing: (nodeId, side, allEdges) => {
      const { connectionPoints, autoSpacingConfig } = get();
      
      // Get all edges on this side (both sources and targets combined)
      const edgesOnSide = getEdgesOnNodeSide(nodeId, side, allEdges);
      
      // Recalculate positions for all edges on this side
      const positions = calculateAutoSpacedPositions(
        edgesOnSide.length,
        autoSpacingConfig
      );
      
      const newMap = new Map(connectionPoints);
      
      // Update edges that aren't manually positioned
      edgesOnSide.forEach((edge, index) => {
        const points = connectionPoints.get(edge.id);
        if (!points) return;
        
        // Check if this edge is connected as source or target on this side
        const isSource = edge.source === nodeId && getPositionFromHandleId(edge.sourceHandle) === side;
        const isTarget = edge.target === nodeId && getPositionFromHandleId(edge.targetHandle) === side;
        
        if (isSource && !points.origin.isManuallyPositioned) {
          newMap.set(edge.id, {
            ...points,
            origin: {
              ...points.origin,
              position: positions[index] ?? 0.5,
            },
          });
        } else if (isTarget && !points.destination.isManuallyPositioned) {
          newMap.set(edge.id, {
            ...points,
            destination: {
              ...points.destination,
              position: positions[index] ?? 0.5,
            },
          });
        }
      });
      
      set({ connectionPoints: newMap });
    },
    
    resetToAutoPosition: (edgeId, pointType) => {
      const { connectionPoints } = get();
      const points = connectionPoints.get(edgeId);
      
      if (!points) return;
      
      const newMap = new Map(connectionPoints);
      const updatedPoints = { ...points };
      
      if (pointType === 'origin') {
        updatedPoints.origin = {
          ...updatedPoints.origin,
          isManuallyPositioned: false,
        };
      } else {
        updatedPoints.destination = {
          ...updatedPoints.destination,
          isManuallyPositioned: false,
        };
      }
      
      newMap.set(edgeId, updatedPoints);
      set({ connectionPoints: newMap });
    },
    
    resetSideToAutoPosition: (nodeId, side, allEdges) => {
      const { connectionPoints } = get();
      
      // Reset all edges on this side
      const edgesOnSide = getEdgesOnNodeSide(nodeId, side, allEdges);
      
      const newMap = new Map(connectionPoints);
      
      edgesOnSide.forEach((edge) => {
        const points = connectionPoints.get(edge.id);
        if (!points) return;
        
        const isSource = edge.source === nodeId && getPositionFromHandleId(edge.sourceHandle) === side;
        const isTarget = edge.target === nodeId && getPositionFromHandleId(edge.targetHandle) === side;
        
        if (isSource) {
          newMap.set(edge.id, {
            ...points,
            origin: { ...points.origin, isManuallyPositioned: false },
          });
        } else if (isTarget) {
          newMap.set(edge.id, {
            ...points,
            destination: { ...points.destination, isManuallyPositioned: false },
          });
        }
      });
      
      set({ connectionPoints: newMap });
      
      // Recalculate auto-spacing
      get().recalculateAutoSpacing(nodeId, side, allEdges);
    },
    
    removeConnectionPoints: (edgeId) => {
      const { connectionPoints } = get();
      const newMap = new Map(connectionPoints);
      newMap.delete(edgeId);
      set({ connectionPoints: newMap });
    },
    
    syncWithEdges: (edges) => {
      const { connectionPoints } = get();
      const edgeIds = new Set(edges.map((e) => e.id));
      
      const newMap = new Map(connectionPoints);
      let changed = false;
      
      // Remove orphaned connection points
      for (const edgeId of connectionPoints.keys()) {
        if (!edgeIds.has(edgeId)) {
          newMap.delete(edgeId);
          changed = true;
        }
      }
      
      // Initialize missing connection points
      edges.forEach((edge) => {
        if (!connectionPoints.has(edge.id)) {
          get().initializeConnectionPoints(edge, edges);
          changed = true;
        }
      });
      
      if (changed) {
        set({ connectionPoints: newMap });
      }
    },
    
    getConnectionPoints: (edgeId) => {
      return get().connectionPoints.get(edgeId);
    },
    
    setAutoSpacingConfig: (config) => {
      set((state) => ({
        autoSpacingConfig: { ...state.autoSpacingConfig, ...config },
      }));
    },
    
    setDefaultOriginStyle: (style) => {
      set({ defaultOriginStyle: style });
    },
  }))
);

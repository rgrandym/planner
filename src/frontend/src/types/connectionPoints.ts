import { Position } from 'reactflow';

/**
 * Connection point marker style types
 */
export type OriginMarkerStyle = 'circle' | 'diamond';
export type DestinationMarkerStyle = 'rectangle';

/**
 * Represents a position along a node's edge as a normalized value (0-1)
 * 0 = start of edge, 0.5 = center, 1 = end of edge
 */
export type NormalizedPosition = number;

/**
 * Connection point configuration for an edge endpoint
 */
export interface ConnectionPointConfig {
  /** Normalized position along the node edge (0-1) */
  position: NormalizedPosition;
  /** Whether this position was manually set by user */
  isManuallyPositioned: boolean;
  /** The side of the node this point is on */
  side: Position;
}

/**
 * Origin connection point (where connector leaves a node)
 */
export interface OriginConnectionPoint extends ConnectionPointConfig {
  type: 'origin';
  /** Visual style of the origin marker */
  markerStyle: OriginMarkerStyle;
}

/**
 * Destination connection point (where connector enters a node)
 */
export interface DestinationConnectionPoint extends ConnectionPointConfig {
  type: 'destination';
  /** Visual style of the destination marker */
  markerStyle: DestinationMarkerStyle;
}

/**
 * Complete connection point data for an edge
 */
export interface EdgeConnectionPoints {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  origin: OriginConnectionPoint;
  destination: DestinationConnectionPoint;
}

/**
 * Map of edge IDs to their connection point configurations
 */
export type ConnectionPointsMap = Map<string, EdgeConnectionPoints>;

/**
 * Connection point being dragged
 */
export interface DraggedConnectionPoint {
  edgeId: string;
  pointType: 'origin' | 'destination';
  nodeId: string;
  side: Position;
  startPosition: NormalizedPosition;
}

/**
 * Auto-spacing configuration
 */
export interface AutoSpacingConfig {
  /** Minimum distance between connection points (as normalized value) */
  minSpacing: number;
  /** Whether to distribute points symmetrically around center */
  symmetricDistribution: boolean;
  /** Padding from edge endpoints (as normalized value) */
  edgePadding: number;
}

/**
 * Default auto-spacing configuration
 */
export const DEFAULT_AUTO_SPACING_CONFIG: AutoSpacingConfig = {
  minSpacing: 0.15,
  symmetricDistribution: true,
  edgePadding: 0.1,
};

/**
 * Visual styling constants for connection point markers
 */
export const CONNECTION_POINT_STYLES = {
  origin: {
    circle: {
      radius: 5,
      strokeWidth: 1.5,
    },
    diamond: {
      size: 10,
      strokeWidth: 1.5,
    },
  },
  destination: {
    rectangle: {
      width: 12,
      height: 4,
      strokeWidth: 1.5,
      cornerRadius: 1,
    },
  },
  hover: {
    scale: 1.3,
    glowRadius: 4,
  },
  drag: {
    opacity: 0.7,
    previewLineWidth: 1,
    previewLineDash: '4 2',
  },
};

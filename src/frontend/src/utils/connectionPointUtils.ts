import { Position } from 'reactflow';

/**
 * Calculate pixel coordinates from normalized position along a node side
 */
export function getPixelPosition(
  normalizedPos: number,
  side: Position,
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number
): { x: number; y: number } {
  switch (side) {
    case Position.Top:
      return {
        x: nodeX + nodeWidth * normalizedPos,
        y: nodeY,
      };
    case Position.Bottom:
      return {
        x: nodeX + nodeWidth * normalizedPos,
        y: nodeY + nodeHeight,
      };
    case Position.Left:
      return {
        x: nodeX,
        y: nodeY + nodeHeight * normalizedPos,
      };
    case Position.Right:
      return {
        x: nodeX + nodeWidth,
        y: nodeY + nodeHeight * normalizedPos,
      };
    default:
      return { x: nodeX, y: nodeY };
  }
}

/**
 * Calculate normalized position from pixel coordinates
 */
export function getNormalizedPosition(
  pixelX: number,
  pixelY: number,
  side: Position,
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number
): number {
  switch (side) {
    case Position.Top:
    case Position.Bottom:
      return Math.max(0.05, Math.min(0.95, (pixelX - nodeX) / nodeWidth));
    case Position.Left:
    case Position.Right:
      return Math.max(0.05, Math.min(0.95, (pixelY - nodeY) / nodeHeight));
    default:
      return 0.5;
  }
}

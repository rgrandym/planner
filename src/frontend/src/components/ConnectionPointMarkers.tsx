import { useConnectionPointsStore } from '@/store/connectionPointsStore';
import {
    CONNECTION_POINT_STYLES,
    DestinationConnectionPoint,
    OriginConnectionPoint,
} from '@/types/connectionPoints';
import { getNormalizedPosition, getPixelPosition } from '@/utils/connectionPointUtils';
import { memo, useCallback, useMemo, useState } from 'react';
import { Position } from 'reactflow';

interface ConnectionPointMarkerProps {
  edgeId: string;
  color: string;
  nodeId: string;
  nodeWidth: number;
  nodeHeight: number;
  nodeX: number;
  nodeY: number;
  selected?: boolean;
}

interface OriginMarkerProps extends ConnectionPointMarkerProps {
  config: OriginConnectionPoint;
}

interface DestinationMarkerProps extends ConnectionPointMarkerProps {
  config: DestinationConnectionPoint;
}

/**
 * Origin Connection Point Marker (Circle or Diamond)
 * Displays at the base of a connector where it leaves a node
 */
function OriginMarkerComponent({
  edgeId,
  color,
  config,
  nodeId,
  nodeWidth,
  nodeHeight,
  nodeX,
  nodeY,
  selected,
}: OriginMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    startDrag,
    updateDrag,
    endDrag,
    draggedPoint,
  } = useConnectionPointsStore();
  
  const isBeingDragged = draggedPoint?.edgeId === edgeId && draggedPoint?.pointType === 'origin';
  const styles = CONNECTION_POINT_STYLES.origin[config.markerStyle];
  const hoverStyles = CONNECTION_POINT_STYLES.hover;
  
  const scale = isHovered || isBeingDragged ? hoverStyles.scale : 1;
  
  // Calculate actual position from normalized position
  const position = useMemo(() => 
    getPixelPosition(config.position, config.side, nodeX, nodeY, nodeWidth, nodeHeight),
    [config.position, config.side, nodeX, nodeY, nodeWidth, nodeHeight]
  );
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsDragging(true);
    startDrag({
      edgeId,
      pointType: 'origin',
      nodeId,
      side: config.side,
      startPosition: config.position,
    });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const svgElement = (e.target as SVGElement).ownerSVGElement;
      if (!svgElement) return;
      
      const point = svgElement.createSVGPoint();
      point.x = moveEvent.clientX;
      point.y = moveEvent.clientY;
      
      const ctm = svgElement.getScreenCTM();
      if (!ctm) return;
      
      const svgPoint = point.matrixTransform(ctm.inverse());
      
      const newNormalizedPos = getNormalizedPosition(
        svgPoint.x,
        svgPoint.y,
        config.side,
        nodeX,
        nodeY,
        nodeWidth,
        nodeHeight
      );
      
      updateDrag(newNormalizedPos);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      endDrag();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [edgeId, nodeId, config.side, config.position, nodeX, nodeY, nodeWidth, nodeHeight, startDrag, updateDrag, endDrag]);
  
  const commonProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onMouseDown: handleMouseDown,
    style: { 
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'transform 0.15s ease',
    },
  };
  
  // Render based on marker style
  if (config.markerStyle === 'diamond') {
    const size = (styles as typeof CONNECTION_POINT_STYLES.origin.diamond).size;
    const halfSize = size / 2;
    
    return (
      <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
        {/* Glow effect on hover */}
        {(isHovered || isBeingDragged) && (
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
          stroke={selected ? '#ffffff' : '#1e1e1e'}
          strokeWidth={styles.strokeWidth}
          {...commonProps}
        />
        {/* Manual position indicator */}
        {config.isManuallyPositioned && (
          <circle
            cx={halfSize + 2}
            cy={-halfSize - 2}
            r={2}
            fill="#22c55e"
          />
        )}
      </g>
    );
  }
  
  // Default: Circle marker
  const radius = (styles as typeof CONNECTION_POINT_STYLES.origin.circle).radius;
  
  return (
    <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
      {/* Glow effect on hover */}
      {(isHovered || isBeingDragged) && (
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
        stroke={selected ? '#ffffff' : '#1e1e1e'}
        strokeWidth={styles.strokeWidth}
        {...commonProps}
      />
      {/* Manual position indicator */}
      {config.isManuallyPositioned && (
        <circle
          cx={radius + 2}
          cy={-radius - 2}
          r={2}
          fill="#22c55e"
        />
      )}
    </g>
  );
}

/**
 * Destination Connection Point Marker (Rectangle)
 * Displays where a connector enters a node
 */
function DestinationMarkerComponent({
  edgeId,
  color,
  config,
  nodeId,
  nodeWidth,
  nodeHeight,
  nodeX,
  nodeY,
  selected,
}: DestinationMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    startDrag,
    updateDrag,
    endDrag,
    draggedPoint,
  } = useConnectionPointsStore();
  
  const isBeingDragged = draggedPoint?.edgeId === edgeId && draggedPoint?.pointType === 'destination';
  const styles = CONNECTION_POINT_STYLES.destination.rectangle;
  const hoverStyles = CONNECTION_POINT_STYLES.hover;
  
  const scale = isHovered || isBeingDragged ? hoverStyles.scale : 1;
  
  // Calculate actual position from normalized position
  const position = useMemo(() => 
    getPixelPosition(config.position, config.side, nodeX, nodeY, nodeWidth, nodeHeight),
    [config.position, config.side, nodeX, nodeY, nodeWidth, nodeHeight]
  );
  
  // Calculate rotation based on side (rectangle should be perpendicular to edge)
  const rotation = useMemo(() => {
    switch (config.side) {
      case Position.Top:
        return 0;
      case Position.Bottom:
        return 180;
      case Position.Left:
        return 270;
      case Position.Right:
        return 90;
      default:
        return 0;
    }
  }, [config.side]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsDragging(true);
    startDrag({
      edgeId,
      pointType: 'destination',
      nodeId,
      side: config.side,
      startPosition: config.position,
    });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const svgElement = (e.target as SVGElement).ownerSVGElement;
      if (!svgElement) return;
      
      const point = svgElement.createSVGPoint();
      point.x = moveEvent.clientX;
      point.y = moveEvent.clientY;
      
      const ctm = svgElement.getScreenCTM();
      if (!ctm) return;
      
      const svgPoint = point.matrixTransform(ctm.inverse());
      
      const newNormalizedPos = getNormalizedPosition(
        svgPoint.x,
        svgPoint.y,
        config.side,
        nodeX,
        nodeY,
        nodeWidth,
        nodeHeight
      );
      
      updateDrag(newNormalizedPos);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      endDrag();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [edgeId, nodeId, config.side, config.position, nodeX, nodeY, nodeWidth, nodeHeight, startDrag, updateDrag, endDrag]);
  
  const halfWidth = styles.width / 2;
  const halfHeight = styles.height / 2;
  
  return (
    <g 
      transform={`translate(${position.x}, ${position.y}) rotate(${rotation}) scale(${scale})`}
    >
      {/* Glow effect on hover */}
      {(isHovered || isBeingDragged) && (
        <rect
          x={-halfWidth - hoverStyles.glowRadius}
          y={-halfHeight - hoverStyles.glowRadius}
          width={styles.width + hoverStyles.glowRadius * 2}
          height={styles.height + hoverStyles.glowRadius * 2}
          fill={color}
          opacity={0.3}
          rx={styles.cornerRadius + 1}
        />
      )}
      <rect
        x={-halfWidth}
        y={-halfHeight}
        width={styles.width}
        height={styles.height}
        fill={color}
        stroke={selected ? '#ffffff' : '#1e1e1e'}
        strokeWidth={styles.strokeWidth}
        rx={styles.cornerRadius}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleMouseDown}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.15s ease',
        }}
      />
      {/* Manual position indicator */}
      {config.isManuallyPositioned && (
        <circle
          cx={halfWidth + 2}
          cy={-halfHeight - 2}
          r={2}
          fill="#22c55e"
        />
      )}
    </g>
  );
}

export const OriginMarker = memo(OriginMarkerComponent);
export const DestinationMarker = memo(DestinationMarkerComponent);

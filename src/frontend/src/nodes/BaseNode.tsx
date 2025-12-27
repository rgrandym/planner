import { NODE_TYPE_MAP } from '@/config/nodes';
import { useCustomNodesStore } from '@/store/customNodesStore';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { ArchNodeData, NodeShape } from '@/types';
import { Box, Plus, X } from 'lucide-react';
import { memo, useState } from 'react';
import { Handle, NodeProps, NodeResizer, Position, useReactFlow, useStore } from 'reactflow';

/**
 * Get shape-specific styling for the node container
 * Uses CSS for proper shape rendering
 */
function getShapeStyles(shape: NodeShape = 'rectangle', color: string, selected: boolean) {
  const baseStyles = {
    boxShadow: selected ? `0 0 20px ${color}40` : `0 4px 6px rgba(0, 0, 0, 0.15)`,
    transform: selected ? 'scale(1.02)' : 'scale(1)',
  };

  switch (shape) {
    case 'circle':
      return {
        ...baseStyles,
        borderRadius: '50%',
        aspectRatio: '1',
        minWidth: '100px',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    case 'diamond':
      return {
        ...baseStyles,
        borderRadius: '4px',
        // Remove rotation from container, apply it to a background element instead
        // or use clip-path for better content handling
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        minWidth: '100px',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      };
    case 'hexagon':
      return {
        ...baseStyles,
        borderRadius: '0',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        minWidth: '140px',
        minHeight: '80px',
        padding: '1rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Ensure background color is applied correctly with clip-path
        backgroundColor: color,
      };
    case 'triangle':
      return {
        ...baseStyles,
        borderRadius: '0',
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        minWidth: '120px',
        minHeight: '100px',
        padding: '2.5rem 1.5rem 1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Ensure background color is applied correctly with clip-path
        backgroundColor: color,
      };
    case 'rounded':
      return {
        ...baseStyles,
        borderRadius: '2rem',
      };
    case 'rectangle':
    default:
      return {
        ...baseStyles,
        borderRadius: '0.5rem',
      };
  }
}

/**
 * BaseNode Component
 * A customizable node component for the architecture canvas.
 * Features:
 * - Handles on all 4 sides for flexible connections
 * - Each handle supports both input and output
 * - n8n-style plus buttons for quick connections
 * - Icon and label display with resizable icons
 * - Hover glow effect
 * - Category-based coloring
 * - Multiple shape support (rectangle, circle, diamond, hexagon, rounded)
 * - Theme-adaptive transparency
 */
function BaseNodeComponent({ id, data, selected }: NodeProps<ArchNodeData>) {
  const { customNodes } = useCustomNodesStore();
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  // Get icon from NODE_TYPE_MAP or custom nodes to ensure it's always a valid component
  // This prevents issues when icon is undefined or an object after serialization
  const nodeConfig = NODE_TYPE_MAP[data.nodeType];
  const customNode = customNodes.find(n => n.type === data.nodeType);
  const Icon = nodeConfig?.icon || customNode?.icon || Box; // Fallback to Box icon if not found
  
  const opacity = data.opacity ?? 90;
  const fontSize = data.fontSize ?? 14;
  const borderColor = data.borderColor ?? data.color;
  const borderWidth = data.borderWidth ?? 2;
  const shape = data.shape || 'rectangle';
  const nodeWidth = data.width;
  const nodeHeight = data.height;
  const iconSizeMode = data.iconSizeMode || 'ratio';
  
  // Calculate icon size based on mode
  let iconSize = data.iconSize ?? 20;
  if (iconSizeMode === 'ratio') {
    // If ratio mode, iconSize is a percentage (10-90) of the smallest dimension
    // Default to 50% if not set or if using old pixel value
    const ratio = (data.iconSize && data.iconSize <= 100) ? data.iconSize / 100 : 0.5;
    const minDim = Math.min(nodeWidth || 150, nodeHeight || (shape === 'circle' || shape === 'diamond' ? 100 : 60));
    iconSize = minDim * ratio;
  }

  const [showConnectButtons, setShowConnectButtons] = useState(false);
  
  const { getEdges } = useReactFlow();
  const { removeEdge } = useFlowStore();

  // Track if a connection is being made globally
  const isConnecting = useStore((state) => state.connectionNodeId !== null);

  // Check connections for this node
  const edges = getEdges();
  const hasOutgoingEdge = edges.some(edge => edge.source === id);
  const hasIncomingEdge = edges.some(edge => edge.target === id);

  // Show handles when hovering, selected, or during any connection
  const showHandles = showConnectButtons || selected || isConnecting;

  // Get shape-specific styles
  // We now handle shapes via SVG backgrounds for better control
  const shapeStyles = {
    transform: selected ? 'scale(1.02)' : 'scale(1)',
    minWidth: shape === 'circle' || shape === 'diamond' ? '80px' : '140px',
    minHeight: shape === 'circle' || shape === 'diamond' ? '80px' : '60px',
    width: nodeWidth ? `${nodeWidth}px` : undefined,
    height: nodeHeight ? `${nodeHeight}px` : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    // Ensure content is centered for all shapes
    // For triangle, we might need to offset the content slightly upwards visually
    paddingTop: shape === 'triangle' ? '15%' : '0',
  };

  // Theme-adaptive background color
  const bgColor = isDarkMode 
    ? `rgba(30, 30, 30, ${opacity / 100})`
    : `rgba(255, 255, 255, ${opacity / 100})`;

  // Theme-adaptive text color
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const secondaryTextColor = isDarkMode ? '#9ca3af' : '#6b7280';

  // Render shape background
  const renderShapeBackground = () => {
    const commonProps = {
      fill: bgColor,
      stroke: borderColor,
      strokeWidth: borderWidth,
      className: "transition-all duration-200",
    };

    // For SVG shapes, we need to know dimensions. 
    // Since we can't easily get real-time DOM dims in React Flow without ResizeObserver,
    // we'll use 100% width/height and vector-effect="non-scaling-stroke" or preserveAspectRatio
    
    switch (shape) {
      case 'circle':
        return (
          <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: -1 }}>
            <circle cx="50%" cy="50%" r="48%" {...commonProps} />
          </svg>
        );
      case 'diamond':
        return (
          <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: -1 }}>
            <polygon points="50,0 100,50 50,100 0,50" vectorEffect="non-scaling-stroke" preserveAspectRatio="none" {...commonProps} />
          </svg>
        );
      case 'hexagon':
        return (
          <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: -1 }}>
            <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" vectorEffect="non-scaling-stroke" preserveAspectRatio="none" {...commonProps} />
          </svg>
        );
      case 'triangle':
        return (
          <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: -1 }}>
            <polygon points="50,0 100,100 0,100" vectorEffect="non-scaling-stroke" preserveAspectRatio="none" {...commonProps} />
          </svg>
        );
      case 'rounded':
        return (
          <div 
            className="absolute inset-0 transition-all duration-200"
            style={{ 
              backgroundColor: bgColor,
              border: `${borderWidth}px solid ${borderColor}`,
              borderRadius: '2rem',
              zIndex: -1,
              boxShadow: selected ? `0 0 20px ${data.color}40` : `0 4px 6px rgba(0, 0, 0, 0.15)`,
            }} 
          />
        );
      case 'rectangle':
      default:
        return (
          <div 
            className="absolute inset-0 transition-all duration-200"
            style={{ 
              backgroundColor: bgColor,
              border: `${borderWidth}px solid ${borderColor}`,
              borderRadius: '0.5rem',
              zIndex: -1,
              boxShadow: selected ? `0 0 20px ${data.color}40` : `0 4px 6px rgba(0, 0, 0, 0.15)`,
            }} 
          />
        );
    }
  };

  /**
   * Handle quick connect button click - opens a node selector
   */
  const handleAddConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent('archflow:quickconnect', {
      detail: { sourceNodeId: id, position: { x: e.clientX, y: e.clientY } }
    });
    window.dispatchEvent(event);
  };

  /**
   * Handle disconnect for a specific side
   */
  const handleDisconnectSide = (e: React.MouseEvent, side: 'top' | 'bottom' | 'left' | 'right') => {
    e.stopPropagation();
    edges.filter(edge => 
      (edge.source === id && edge.sourceHandle?.startsWith(side)) ||
      (edge.target === id && edge.targetHandle?.startsWith(side))
    ).forEach(edge => {
      removeEdge(edge.id);
    });
  };

  // Check for connections on each side
  const hasTopConnection = edges.some(edge => 
    (edge.source === id && edge.sourceHandle?.startsWith('top')) ||
    (edge.target === id && edge.targetHandle?.startsWith('top'))
  );
  const hasBottomConnection = edges.some(edge => 
    (edge.source === id && edge.sourceHandle?.startsWith('bottom')) ||
    (edge.target === id && edge.targetHandle?.startsWith('bottom'))
  );
  const hasLeftConnection = edges.some(edge => 
    (edge.source === id && edge.sourceHandle?.startsWith('left')) ||
    (edge.target === id && edge.targetHandle?.startsWith('left'))
  );
  const hasRightConnection = edges.some(edge => 
    (edge.source === id && edge.sourceHandle?.startsWith('right')) ||
    (edge.target === id && edge.targetHandle?.startsWith('right'))
  );

  // Common handle styles
  const handleStyle = {
    backgroundColor: data.color,
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowConnectButtons(true)}
      onMouseLeave={() => setShowConnectButtons(false)}
      style={shapeStyles}
    >
      {/* Shape Background Layer */}
      {renderShapeBackground()}

      {/* Node Content - Centered and unclipped */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center p-4 pointer-events-none"
        style={{
          // Adjust content position for specific shapes to appear visually centered
          transform: shape === 'triangle' ? 'translateY(10%)' : 'none'
        }}
      >
        {/* Icon */}
        <div 
          className="transition-transform duration-200"
          style={{ color: data.color }}
        >
          <Icon size={iconSize} strokeWidth={1.5} />
        </div>

        {/* Label */}
        {(data.label || (data.labelLines && data.labelLines.length > 0)) && (
          <div className="mt-2 text-center pointer-events-auto">
            {/* Primary Label */}
            {(!data.labelLines || data.labelLines.length === 0) && (
              <div 
                className="font-medium leading-tight whitespace-pre-wrap"
                style={{ 
                  color: textColor,
                  fontSize: `${fontSize}px`
                }}
              >
                {data.label}
              </div>
            )}
            
            {/* Multi-line Labels */}
            {data.labelLines?.map((line, index) => (
              <div 
                key={index}
                className="leading-tight"
                style={{ 
                  color: textColor,
                  fontSize: `${line.fontSize}px`,
                  fontWeight: line.fontWeight || 'normal',
                  marginTop: index > 0 ? '2px' : '0'
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handles - Always visible but transparent until hovered/connecting */}
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-top-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-top-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />

      {/* Bottom Handle */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-bottom-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-bottom-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />

      {/* Left Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-left-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-left-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />

      {/* Right Handle */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-right-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={true}
        className={`!w-2.5 !h-2.5 !border-2 !border-arch-surface !-right-1.5 transition-opacity duration-150 ${showHandles ? '!opacity-100' : '!opacity-0'}`}
        style={handleStyle}
      />

      {/* Disconnect incoming button - Left side */}
      {showConnectButtons && hasLeftConnection && (
        <button
          onClick={(e) => handleDisconnectSide(e, 'left')}
          className="absolute -left-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full 
                     bg-red-500/80 hover:bg-red-500 
                     flex items-center justify-center transition-all duration-150 z-10
                     shadow-lg hover:scale-110"
          title="Disconnect left"
        >
          <X size={12} className="text-white" />
        </button>
      )}

      {/* Disconnect button - Top side */}
      {showConnectButtons && hasTopConnection && (
        <button
          onClick={(e) => handleDisconnectSide(e, 'top')}
          className="absolute left-1/2 -top-7 -translate-x-1/2 w-5 h-5 rounded-full 
                     bg-red-500/80 hover:bg-red-500 
                     flex items-center justify-center transition-all duration-150 z-10
                     shadow-lg hover:scale-110"
          title="Disconnect top"
        >
          <X size={12} className="text-white" />
        </button>
      )}

      {/* Disconnect button - Bottom side */}
      {showConnectButtons && hasBottomConnection && (
        <button
          onClick={(e) => handleDisconnectSide(e, 'bottom')}
          className="absolute left-1/2 -bottom-7 -translate-x-1/2 w-5 h-5 rounded-full 
                     bg-red-500/80 hover:bg-red-500 
                     flex items-center justify-center transition-all duration-150 z-10
                     shadow-lg hover:scale-110"
          title="Disconnect bottom"
        >
          <X size={12} className="text-white" />
        </button>
      )}

      {/* Quick connect/disconnect buttons - Right side */}
      {showConnectButtons && (
        <div className="absolute -right-7 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          {hasRightConnection && (
            <button
              onClick={(e) => handleDisconnectSide(e, 'right')}
              className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 
                         flex items-center justify-center transition-all duration-150 z-10
                         shadow-lg hover:scale-110"
              title="Disconnect right"
            >
              <X size={12} className="text-white" />
            </button>
          )}
          <button
            onClick={handleAddConnection}
            className="w-5 h-5 rounded-full bg-arch-primary/80 hover:bg-arch-primary 
                       flex items-center justify-center transition-all duration-150 z-10
                       shadow-lg hover:scale-110"
            title="Add connection"
          >
            <Plus size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* Node Resizer - Only visible when selected */}
      <NodeResizer 
        isVisible={selected} 
        minWidth={shape === 'circle' || shape === 'diamond' ? 80 : 100}
        minHeight={shape === 'circle' || shape === 'diamond' ? 80 : 50}
        handleStyle={{ width: 8, height: 8, borderRadius: 4 }}
        lineStyle={{ border: `1px solid ${data.color}` }}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const BaseNode = memo(BaseNodeComponent);

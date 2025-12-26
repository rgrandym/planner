import { NODE_TYPE_MAP } from '@/config/nodes';
import { useFlowStore } from '@/store/flowStore';
import { ArchNodeData } from '@/types';
import { Box, Plus, X } from 'lucide-react';
import { memo, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';

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
 */
function BaseNodeComponent({ id, data, selected }: NodeProps<ArchNodeData>) {
  // Get icon from NODE_TYPE_MAP to ensure it's always a valid component
  // This prevents issues when icon is undefined or an object after serialization
  const nodeConfig = NODE_TYPE_MAP[data.nodeType];
  const Icon = nodeConfig?.icon || Box; // Fallback to Box icon if not found
  
  const opacity = data.opacity ?? 90;
  const fontSize = data.fontSize ?? 14;
  const iconSize = data.iconSize ?? 20;
  const borderColor = data.borderColor ?? data.color;
  const [showConnectButtons, setShowConnectButtons] = useState(false);
  
  const { getEdges } = useReactFlow();
  const { removeEdge } = useFlowStore();

  // Check connections for this node
  const edges = getEdges();
  const hasOutgoingEdge = edges.some(edge => edge.source === id);
  const hasIncomingEdge = edges.some(edge => edge.target === id);

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
   * Handle disconnect button - removes all outgoing edges from this node
   */
  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    edges.filter(edge => edge.source === id).forEach(edge => {
      removeEdge(edge.id);
    });
  };

  /**
   * Handle removing incoming connections
   */
  const handleDisconnectIncoming = (e: React.MouseEvent) => {
    e.stopPropagation();
    edges.filter(edge => edge.target === id).forEach(edge => {
      removeEdge(edge.id);
    });
  };

  // Common handle styles
  const handleStyle = {
    backgroundColor: data.color,
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 
        bg-arch-surface backdrop-blur-sm 
        shadow-lg transition-all duration-200
        min-w-[120px] group
        ${selected ? 'ring-2 ring-arch-primary ring-opacity-50' : ''}
      `}
      style={{
        borderColor: borderColor,
        backgroundColor: `rgba(30, 30, 30, ${opacity / 100})`,
        boxShadow: selected
          ? `0 0 20px ${data.color}40`
          : `0 4px 6px rgba(0, 0, 0, 0.3)`,
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setShowConnectButtons(true)}
      onMouseLeave={() => setShowConnectButtons(false)}
    >
      {/* Top Handle - Input & Output */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-top-1.5"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-top-1.5 !opacity-0 hover:!opacity-100"
        style={handleStyle}
      />

      {/* Bottom Handle - Input & Output */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-bottom-1.5"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-bottom-1.5 !opacity-0 hover:!opacity-100"
        style={handleStyle}
      />

      {/* Left Handle - Input & Output */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-left-1.5"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-left-1.5 !opacity-0 hover:!opacity-100"
        style={handleStyle}
      />

      {/* Right Handle - Input & Output */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-right-1.5"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-2.5 !h-2.5 !border-2 !border-arch-surface !-right-1.5 !opacity-0 hover:!opacity-100"
        style={handleStyle}
      />

      {/* Disconnect incoming button - Left side */}
      {showConnectButtons && hasIncomingEdge && (
        <button
          onClick={handleDisconnectIncoming}
          className="absolute -left-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full 
                     bg-red-500/80 hover:bg-red-500 
                     flex items-center justify-center transition-all duration-150 z-10
                     shadow-lg hover:scale-110"
          title="Disconnect incoming"
        >
          <X size={12} className="text-white" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3">
        <div
          className="p-1.5 rounded-md flex-shrink-0 transition-all duration-200"
          style={{ 
            backgroundColor: `${data.color}20`,
            padding: iconSize > 24 ? '8px' : '6px',
          }}
        >
          <Icon size={iconSize} color={data.color} strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span
            className="font-medium text-white leading-tight"
            style={{ fontSize: `${fontSize}px` }}
          >
            {data.label}
          </span>
          {data.description && (
            <span className="text-xs text-gray-400 mt-0.5 max-w-[150px] truncate">
              {data.description}
            </span>
          )}
        </div>
      </div>

      {/* Quick connect/disconnect buttons - Right side */}
      {showConnectButtons && (
        <div className="absolute -right-7 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          {hasOutgoingEdge && (
            <button
              onClick={handleDisconnect}
              className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 
                         flex items-center justify-center transition-all duration-150 z-10
                         shadow-lg hover:scale-110"
              title="Disconnect outgoing"
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
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const BaseNode = memo(BaseNodeComponent);

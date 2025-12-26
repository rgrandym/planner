import { NODE_CATEGORIES } from '@/config/nodes';
import { useFlowStore } from '@/store/flowStore';
import { ArchNodeData, NodeTypeConfig } from '@/types';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Node } from 'reactflow';

interface QuickConnectMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  sourceNodeId: string;
  onClose: () => void;
}

/**
 * QuickConnectMenu Component
 * A floating menu that appears when clicking the plus button on a node.
 * Allows quick selection and connection of a new node.
 */
export function QuickConnectMenu({
  isOpen,
  position,
  sourceNodeId,
  onClose,
}: QuickConnectMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNode, connectNodes, getNodeById } = useFlowStore();

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter nodes based on search term
  const filteredCategories = NODE_CATEGORIES.map((category) => ({
    ...category,
    nodes: category.nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.nodes.length > 0);

  /**
   * Handle node selection - create node and connect it
   */
  const handleSelectNode = (nodeConfig: NodeTypeConfig) => {
    const sourceNode = getNodeById(sourceNodeId);
    if (!sourceNode) {
      onClose();
      return;
    }

    // Calculate position for new node (to the right of source node)
    const newPosition = {
      x: sourceNode.position.x + 250,
      y: sourceNode.position.y,
    };

    // Create the new node
    const newNode: Node<ArchNodeData> = {
      id: `${nodeConfig.type}_${Date.now()}`,
      type: 'baseNode',
      position: newPosition,
      data: {
        label: nodeConfig.label,
        nodeType: nodeConfig.type,
        icon: nodeConfig.icon,
        color: nodeConfig.color,
        category: nodeConfig.category,
      },
    };

    addNode(newNode);

    // Connect the nodes
    setTimeout(() => {
      connectNodes(sourceNodeId, newNode.id);
    }, 0);

    onClose();
  };

  // Calculate menu position (keep in viewport)
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="w-72 bg-arch-surface border border-arch-border rounded-lg shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-arch-border flex items-center gap-2">
        <Search size={16} className="text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search nodes..."
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
        />
        <button
          onClick={onClose}
          className="p-1 hover:bg-arch-surface-light rounded transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Node List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No nodes found
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div className="px-3 py-2 bg-arch-bg sticky top-0">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {category.label}
                </span>
              </div>

              {/* Category Nodes */}
              {category.nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <button
                    key={node.type}
                    onClick={() => handleSelectNode(node)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-arch-surface-light
                               transition-colors text-left"
                  >
                    <div
                      className="p-1.5 rounded"
                      style={{ backgroundColor: `${node.color}20` }}
                    >
                      <Icon size={16} color={node.color} />
                    </div>
                    <span className="text-sm text-white">{node.label}</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-arch-border bg-arch-bg">
        <p className="text-xs text-gray-500">
          Click a node to add and connect
        </p>
      </div>
    </div>
  );
}

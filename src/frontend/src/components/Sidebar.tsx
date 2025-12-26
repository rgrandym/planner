import { NODE_CATEGORIES } from '@/config/nodes';
import { useCustomNodesStore } from '@/store/customNodesStore';
import { NodeCategory, NodeTypeConfig } from '@/types';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { DragEvent, useMemo, useState } from 'react';

/**
 * Sidebar component with draggable node palette
 * Features:
 * - Collapsible category sections
 * - Draggable nodes with visual feedback
 * - Category color coding
 * - Hover effects
 * - Custom user-created nodes
 */
export function Sidebar() {
  const { customNodes } = useCustomNodesStore();
  
  // Combine built-in categories with custom nodes category
  const allCategories = useMemo(() => {
    const categories = [...NODE_CATEGORIES];
    
    // Add custom nodes category if there are any custom nodes
    if (customNodes.length > 0) {
      categories.push({
        id: 'custom' as NodeCategory,
        label: 'Custom Nodes',
        color: '#a855f7',
        nodes: customNodes,
      });
    }
    
    return categories;
  }, [customNodes]);

  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(allCategories.map((c) => c.id))
  );

  /**
   * Toggle a category's expanded state
   */
  const toggleCategory = (categoryId: NodeCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  /**
   * Handle drag start for a node
   */
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeTypeConfig) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-arch-surface border-r border-arch-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-arch-border">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-arch-primary">⬡</span>
          ArchFlow
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Drag components to canvas
        </p>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {allCategories.map((category) => (
          <div key={category.id} className="mb-2">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2 
                         rounded-lg hover:bg-arch-surface-light transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-200">
                  {category.label}
                </span>
              </div>
              {expandedCategories.has(category.id) ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>

            {/* Category Nodes */}
            {expandedCategories.has(category.id) && (
              <div className="mt-1 ml-2 space-y-1">
                {category.nodes.map((node) => (
                  <NodeItem
                    key={node.type}
                    node={node}
                    onDragStart={onDragStart}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-arch-border">
        <p className="text-xs text-gray-500 text-center">
          Tip: Right-click nodes for options
        </p>
      </div>
    </aside>
  );
}

/**
 * Individual draggable node item in the sidebar
 */
interface NodeItemProps {
  node: NodeTypeConfig;
  onDragStart: (event: DragEvent<HTMLDivElement>, node: NodeTypeConfig) => void;
}

function NodeItem({ node, onDragStart }: NodeItemProps) {
  const Icon = node.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg 
                 bg-arch-bg border border-transparent
                 hover:border-arch-border hover:shadow-lg
                 cursor-grab active:cursor-grabbing
                 transition-all duration-200 group"
      style={{
        '--hover-glow': `${node.color}20`,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 15px ${node.color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <GripVertical 
        size={14} 
        className="text-gray-600 group-hover:text-gray-400 transition-colors" 
      />
      <div
        className="p-1.5 rounded"
        style={{ backgroundColor: `${node.color}20` }}
      >
        <Icon size={16} color={node.color} strokeWidth={2} />
      </div>
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {node.label}
      </span>
    </div>
  );
}

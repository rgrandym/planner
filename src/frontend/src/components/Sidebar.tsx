import { NODE_CATEGORIES } from '@/config/nodes';
import { useCustomNodesStore } from '@/store/customNodesStore';
import { useThemeStore } from '@/store/themeStore';
import { useUIStore } from '@/store/uiStore';
import { CategoryConfig, NodeCategory, NodeTypeConfig } from '@/types';
import { Check, ChevronDown, ChevronRight, GripVertical, Pencil, X } from 'lucide-react';
import { DragEvent, KeyboardEvent, useMemo, useRef, useState } from 'react';

/**
 * Sidebar component with draggable node palette
 * Features:
 * - Collapsible category sections
 * - Draggable nodes with visual feedback
 * - Category color coding
 * - Hover effects
 * - Custom user-created nodes
 * - Reorderable categories via drag and drop
 */
export function Sidebar() {
  const { customNodes } = useCustomNodesStore();
  const { categoryOrder, setCategoryOrder, sidebarLabels, setCategoryLabel } = useUIStore();
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  // Drag state for category reordering
  const [draggedCategoryId, setDraggedCategoryId] = useState<NodeCategory | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<NodeCategory | null>(null);
  const dragCounter = useRef(0);
  
  // Editing state for category labels
  const [editingCategoryId, setEditingCategoryId] = useState<NodeCategory | null>(null);
  const [editingCategoryLabel, setEditingCategoryLabel] = useState('');
  
  // Combine built-in categories with custom nodes category, ordered by preference
  const allCategories = useMemo(() => {
    const categoryMap = new Map<NodeCategory, CategoryConfig>();
    
    // Add all built-in categories
    NODE_CATEGORIES.forEach((cat) => {
      categoryMap.set(cat.id, cat);
    });
    
    // Add custom nodes category if there are any
    if (customNodes.length > 0) {
      categoryMap.set('custom', {
        id: 'custom' as NodeCategory,
        label: 'Custom Nodes',
        color: '#a855f7',
        nodes: customNodes,
      });
    }
    
    // Sort by user preference
    const orderedCategories: CategoryConfig[] = [];
    categoryOrder.forEach((id) => {
      const cat = categoryMap.get(id);
      if (cat) {
        orderedCategories.push(cat);
        categoryMap.delete(id);
      }
    });
    
    // Add any remaining categories not in the order list
    categoryMap.forEach((cat) => {
      orderedCategories.push(cat);
    });
    
    return orderedCategories;
  }, [customNodes, categoryOrder]);

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
  const onNodeDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeTypeConfig) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  /**
   * Handle category drag start
   */
  const onCategoryDragStart = (e: DragEvent<HTMLDivElement>, categoryId: NodeCategory) => {
    e.dataTransfer.setData('text/plain', categoryId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCategoryId(categoryId);
  };
  
  /**
   * Handle category drag over
   */
  const onCategoryDragOver = (e: DragEvent<HTMLDivElement>, categoryId: NodeCategory) => {
    e.preventDefault();
    if (draggedCategoryId && draggedCategoryId !== categoryId) {
      setDragOverCategoryId(categoryId);
    }
  };
  
  /**
   * Handle category drag enter
   */
  const onCategoryDragEnter = (e: DragEvent<HTMLDivElement>, categoryId: NodeCategory) => {
    e.preventDefault();
    dragCounter.current++;
    if (draggedCategoryId && draggedCategoryId !== categoryId) {
      setDragOverCategoryId(categoryId);
    }
  };
  
  /**
   * Handle category drag leave
   */
  const onCategoryDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverCategoryId(null);
    }
  };
  
  /**
   * Handle category drop
   */
  const onCategoryDrop = (e: DragEvent<HTMLDivElement>, targetCategoryId: NodeCategory) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      setDragOverCategoryId(null);
      return;
    }
    
    // Reorder categories
    const currentOrder = [...categoryOrder];
    const draggedIndex = currentOrder.indexOf(draggedCategoryId);
    const targetIndex = currentOrder.indexOf(targetCategoryId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedCategoryId);
      setCategoryOrder(currentOrder);
    }
    
    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
  };
  
  /**
   * Handle drag end
   */
  const onCategoryDragEnd = () => {
    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
    dragCounter.current = 0;
  };
  
  /**
   * Start editing a category label
   */
  const startEditingCategory = (categoryId: NodeCategory, currentLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategoryId(categoryId);
    setEditingCategoryLabel(sidebarLabels.categoryLabels[categoryId] || currentLabel);
  };
  
  /**
   * Save the edited category label
   */
  const saveEditingCategory = () => {
    if (editingCategoryId && editingCategoryLabel.trim()) {
      setCategoryLabel(editingCategoryId, editingCategoryLabel.trim());
    }
    setEditingCategoryId(null);
    setEditingCategoryLabel('');
  };
  
  /**
   * Cancel editing category label
   */
  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryLabel('');
  };
  
  /**
   * Handle keyboard events for category editing
   */
  const handleCategoryEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditingCategory();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingCategory();
    }
  };

  return (
    <aside className={`w-64 flex flex-col h-full border-r transition-colors
      ${isDarkMode 
        ? 'bg-arch-surface border-arch-border' 
        : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-arch-border' : 'border-gray-200'}`}>
        <h1 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-arch-primary">⬡</span>
          ArchFlow
        </h1>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Drag components to canvas
        </p>
      </div>

      {/* Category Header - Drag hint */}
      <div className={`px-4 py-2 border-b flex items-center justify-between
        ${isDarkMode ? 'border-arch-border' : 'border-gray-200'}`}
      >
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Categories
        </span>
        <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Drag to reorder
        </span>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {allCategories.map((category) => (
          <div 
            key={category.id} 
            className={`mb-2 rounded-lg transition-all duration-200
              ${draggedCategoryId === category.id ? 'opacity-50' : ''}
              ${dragOverCategoryId === category.id ? 'ring-2 ring-arch-primary ring-offset-2 ring-offset-transparent' : ''}
            `}
            draggable
            onDragStart={(e) => onCategoryDragStart(e, category.id)}
            onDragOver={(e) => onCategoryDragOver(e, category.id)}
            onDragEnter={(e) => onCategoryDragEnter(e, category.id)}
            onDragLeave={onCategoryDragLeave}
            onDrop={(e) => onCategoryDrop(e, category.id)}
            onDragEnd={onCategoryDragEnd}
          >
            {/* Category Header */}
            <div 
              className={`flex items-center gap-1 cursor-grab active:cursor-grabbing
                ${isDarkMode ? 'hover:bg-arch-surface-light' : 'hover:bg-gray-50'} rounded-lg`}
            >
              {/* Drag Handle */}
              <div className="p-1.5">
                <GripVertical 
                  size={14} 
                  className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} 
                />
              </div>
              
              {editingCategoryId === category.id ? (
                /* Editing Mode */
                <div className="flex-1 flex items-center gap-2 px-2 py-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <input
                    type="text"
                    value={editingCategoryLabel}
                    onChange={(e) => setEditingCategoryLabel(e.target.value)}
                    onKeyDown={handleCategoryEditKeyDown}
                    autoFocus
                    className={`flex-1 text-sm font-medium px-2 py-0.5 rounded outline-none
                      ${isDarkMode 
                        ? 'bg-arch-bg text-white border border-arch-primary' 
                        : 'bg-white text-gray-900 border border-blue-500'
                      }`}
                  />
                  <button
                    onClick={saveEditingCategory}
                    className="p-1 rounded hover:bg-green-500/20 text-green-500"
                    title="Save"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={cancelEditingCategory}
                    className="p-1 rounded hover:bg-red-500/20 text-red-500"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Display Mode */
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`flex-1 flex items-center justify-between px-2 py-2 
                             rounded-lg transition-colors group/cat`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {sidebarLabels.categoryLabels[category.id] || category.label}
                    </span>
                    <button
                      onClick={(e) => startEditingCategory(category.id, category.label, e)}
                      className={`p-1 rounded opacity-0 group-hover/cat:opacity-100 transition-opacity
                        ${isDarkMode ? 'hover:bg-arch-border text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      title="Edit category name"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  ) : (
                    <ChevronRight size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  )}
                </button>
              )}
            </div>

            {/* Category Nodes */}
            {expandedCategories.has(category.id) && (
              <div className="mt-1 ml-2 space-y-1">
                {category.nodes.map((node) => (
                  <NodeItem
                    key={node.type}
                    node={node}
                    onDragStart={onNodeDragStart}
                    isDarkMode={isDarkMode}
                    customLabel={sidebarLabels.nodeLabels[node.type]}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`p-3 border-t ${isDarkMode ? 'border-arch-border' : 'border-gray-200'}`}>
        <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
  isDarkMode: boolean;
  customLabel?: string;
}

function NodeItem({ node, onDragStart, isDarkMode, customLabel }: NodeItemProps) {
  const { setNodeLabel } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const Icon = node.icon;
  
  const displayLabel = customLabel || node.label;
  
  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditLabel(displayLabel);
    setIsEditing(true);
  };
  
  const saveLabel = () => {
    if (editLabel.trim()) {
      setNodeLabel(node.type, editLabel.trim());
    }
    setIsEditing(false);
    setEditLabel('');
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditLabel('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveLabel();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border
          ${isDarkMode 
            ? 'bg-arch-bg border-arch-primary' 
            : 'bg-white border-blue-500'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-1.5 rounded flex-shrink-0"
          style={{ backgroundColor: `${node.color}20` }}
        >
          <Icon size={16} color={node.color} strokeWidth={2} />
        </div>
        <input
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className={`flex-1 text-sm px-1 py-0.5 rounded outline-none min-w-0
            ${isDarkMode 
              ? 'bg-arch-surface text-white' 
              : 'bg-gray-50 text-gray-900'
            }`}
        />
        <button
          onClick={saveLabel}
          className="p-1 rounded hover:bg-green-500/20 text-green-500 flex-shrink-0"
          title="Save"
        >
          <Check size={12} />
        </button>
        <button
          onClick={cancelEditing}
          className="p-1 rounded hover:bg-red-500/20 text-red-500 flex-shrink-0"
          title="Cancel"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg 
                 border border-transparent
                 cursor-grab active:cursor-grabbing
                 transition-all duration-200 group
                 ${isDarkMode 
                   ? 'bg-arch-bg hover:border-arch-border hover:shadow-lg' 
                   : 'bg-gray-50 hover:border-gray-200 hover:shadow-md'
                 }`}
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
        className={`transition-colors flex-shrink-0 ${isDarkMode ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-300 group-hover:text-gray-500'}`}
      />
      <div
        className="p-1.5 rounded flex-shrink-0"
        style={{ backgroundColor: `${node.color}20` }}
      >
        <Icon size={16} color={node.color} strokeWidth={2} />
      </div>
      <span className={`text-sm transition-colors flex-1 truncate ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
        {displayLabel}
      </span>
      <button
        onClick={startEditing}
        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0
          ${isDarkMode ? 'hover:bg-arch-border text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
        title="Edit node name"
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}

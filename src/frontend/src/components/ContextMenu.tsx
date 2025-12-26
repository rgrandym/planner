import { useFlowStore } from '@/store/flowStore';
import { Copy, Edit3, Palette, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * ContextMenu Component
 * Right-click menu for nodes with common actions.
 */
export function ContextMenu() {
  const { contextMenu, setContextMenu, copyNode, duplicateNode, deleteNode, setSelectedNodeId } = useFlowStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setContextMenu]);

  if (!contextMenu || !contextMenu.nodeId) return null;

  const nodeId = contextMenu.nodeId;

  const menuItems = [
    {
      label: 'Edit Properties',
      icon: Edit3,
      onClick: () => {
        setSelectedNodeId(nodeId);
        setContextMenu(null);
      },
    },
    {
      label: 'Copy',
      icon: Copy,
      shortcut: '⌘C',
      onClick: () => {
        copyNode(nodeId);
        setContextMenu(null);
      },
    },
    {
      label: 'Duplicate',
      icon: Palette,
      shortcut: '⌘D',
      onClick: () => {
        duplicateNode(nodeId);
        setContextMenu(null);
      },
    },
    { type: 'divider' as const },
    {
      label: 'Delete',
      icon: Trash2,
      shortcut: '⌫',
      danger: true,
      onClick: () => {
        deleteNode(nodeId);
        setContextMenu(null);
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] py-1 bg-arch-surface border border-arch-border 
                 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      {menuItems.map((item, index) =>
        item.type === 'divider' ? (
          <div key={index} className="my-1 border-t border-arch-border" />
        ) : (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors
              ${item.danger 
                ? 'text-red-400 hover:bg-red-500/10' 
                : 'text-gray-300 hover:bg-arch-surface-light hover:text-white'
              }`}
          >
            <item.icon size={16} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-500">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}

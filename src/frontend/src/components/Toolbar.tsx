import { useFlowStore } from '@/store/flowStore';
import { useProjectStore } from '@/store/projectStore';
import {
  ChevronDown,
  Copy,
  Download,
  Edit3,
  FileIcon,
  FilePlus,
  FolderOpen,
  Maximize2,
  Redo2,
  Save,
  Scissors,
  Settings,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useReactFlow } from 'reactflow';

type MenuType = 'file' | 'edit' | 'view' | 'settings' | null;

/**
 * Toolbar Component
 * Top menubar with dropdown menus for all actions.
 * Features:
 * - File menu: New Canvas, Open, Save, Export
 * - Edit menu: Undo, Redo, Cut, Copy, Paste, Delete, Clear
 * - View menu: Zoom controls, Fit View
 * - Settings dropdown
 */
export function Toolbar() {
  const [openMenu, setOpenMenu] = useState<MenuType>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    undo,
    redo,
    clearCanvas,
    setExportModalOpen,
    setProjectModalOpen,
    undoStack,
    redoStack,
    nodes,
    edges,
    viewport,
    isDirty,
    selectedNodeId,
    deleteNode,
    copyNode,
    pasteNode,
    copiedNode,
    loadCanvas,
  } = useFlowStore();

  const {
    projects,
    activeProjectId,
    saveProject,
    createProject,
  } = useProjectStore();

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Close menu on Escape
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Handle new canvas
   */
  const handleNewCanvas = () => {
    if (isDirty && nodes.length > 0) {
      if (!confirm('You have unsaved changes. Create new canvas anyway?')) {
        setOpenMenu(null);
        return;
      }
    }
    loadCanvas([], [], { x: 0, y: 0, zoom: 1 });
    toast.success('New canvas created');
    setOpenMenu(null);
  };

  /**
   * Handle save
   */
  const handleSave = () => {
    if (activeProjectId) {
      saveProject(activeProjectId, nodes, edges, viewport);
      const project = projects.find((p) => p.id === activeProjectId);
      toast.success(`Saved "${project?.name}"`);
    } else if (nodes.length > 0) {
      const name = `Project ${projects.length + 1}`;
      const id = createProject(name);
      saveProject(id, nodes, edges, viewport);
      toast.success(`Saved as "${name}"`);
    } else {
      toast.error('Nothing to save');
    }
    setOpenMenu(null);
  };

  /**
   * Handle clear canvas
   */
  const handleClear = () => {
    if (nodes.length === 0) {
      toast.error('Canvas is already empty');
      setOpenMenu(null);
      return;
    }
    if (confirm('Are you sure you want to clear the canvas?')) {
      clearCanvas();
      toast.success('Canvas cleared');
    }
    setOpenMenu(null);
  };

  /**
   * Handle export
   */
  const handleExport = () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes before exporting');
      setOpenMenu(null);
      return;
    }
    setExportModalOpen(true);
    setOpenMenu(null);
  };

  /**
   * Handle delete selected
   */
  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      toast.success('Node deleted');
    } else {
      toast.error('Select a node first');
    }
    setOpenMenu(null);
  };

  /**
   * Handle copy
   */
  const handleCopy = () => {
    if (selectedNodeId) {
      copyNode(selectedNodeId);
      toast.success('Node copied');
    } else {
      toast.error('Select a node first');
    }
    setOpenMenu(null);
  };

  /**
   * Handle paste
   */
  const handlePaste = () => {
    if (copiedNode) {
      pasteNode({ x: 400, y: 300 });
      toast.success('Node pasted');
    } else {
      toast.error('Nothing to paste');
    }
    setOpenMenu(null);
  };

  /**
   * Handle cut
   */
  const handleCut = () => {
    if (selectedNodeId) {
      copyNode(selectedNodeId);
      deleteNode(selectedNodeId);
      toast.success('Node cut');
    } else {
      toast.error('Select a node first');
    }
    setOpenMenu(null);
  };

  /**
   * Toggle menu
   */
  const toggleMenu = (menu: MenuType) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20">
      {/* Main Menubar */}
      <div
        ref={menuRef}
        className="flex items-center bg-arch-surface border-b border-arch-border px-2"
      >
        {/* Logo */}
        <div className="px-3 py-2 flex items-center gap-2 border-r border-arch-border mr-2">
          <span className="text-arch-primary text-lg">⬡</span>
          <span className="text-white font-semibold text-sm">ArchFlow</span>
        </div>

        {/* File Menu */}
        <MenuButton
          label="File"
          isOpen={openMenu === 'file'}
          onClick={() => toggleMenu('file')}
        >
          <MenuItem
            icon={FilePlus}
            label="New Canvas"
            shortcut="⌘N"
            onClick={handleNewCanvas}
          />
          <MenuItem
            icon={FolderOpen}
            label="Open Project..."
            shortcut="⌘P"
            onClick={() => {
              setProjectModalOpen(true);
              setOpenMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon={Save}
            label="Save"
            shortcut="⌘S"
            onClick={handleSave}
            disabled={nodes.length === 0}
          />
          <MenuItem
            icon={Download}
            label="Export..."
            shortcut="⌘E"
            onClick={handleExport}
            disabled={nodes.length === 0}
          />
          <MenuDivider />
          <MenuItem
            icon={Trash2}
            label="Clear Canvas"
            onClick={handleClear}
            danger
            disabled={nodes.length === 0}
          />
        </MenuButton>

        {/* Edit Menu */}
        <MenuButton
          label="Edit"
          isOpen={openMenu === 'edit'}
          onClick={() => toggleMenu('edit')}
        >
          <MenuItem
            icon={Undo2}
            label="Undo"
            shortcut="⌘Z"
            onClick={() => {
              undo();
              setOpenMenu(null);
            }}
            disabled={undoStack.length === 0}
          />
          <MenuItem
            icon={Redo2}
            label="Redo"
            shortcut="⌘⇧Z"
            onClick={() => {
              redo();
              setOpenMenu(null);
            }}
            disabled={redoStack.length === 0}
          />
          <MenuDivider />
          <MenuItem
            icon={Scissors}
            label="Cut"
            shortcut="⌘X"
            onClick={handleCut}
            disabled={!selectedNodeId}
          />
          <MenuItem
            icon={Copy}
            label="Copy"
            shortcut="⌘C"
            onClick={handleCopy}
            disabled={!selectedNodeId}
          />
          <MenuItem
            icon={FileIcon}
            label="Paste"
            shortcut="⌘V"
            onClick={handlePaste}
            disabled={!copiedNode}
          />
          <MenuDivider />
          <MenuItem
            icon={Trash2}
            label="Delete"
            shortcut="⌫"
            onClick={handleDelete}
            disabled={!selectedNodeId}
            danger
          />
        </MenuButton>

        {/* View Menu */}
        <MenuButton
          label="View"
          isOpen={openMenu === 'view'}
          onClick={() => toggleMenu('view')}
        >
          <MenuItem
            icon={ZoomIn}
            label="Zoom In"
            shortcut="⌘+"
            onClick={() => {
              zoomIn();
              setOpenMenu(null);
            }}
          />
          <MenuItem
            icon={ZoomOut}
            label="Zoom Out"
            shortcut="⌘-"
            onClick={() => {
              zoomOut();
              setOpenMenu(null);
            }}
          />
          <MenuItem
            icon={Maximize2}
            label="Fit View"
            shortcut="⌘0"
            onClick={() => {
              fitView({ padding: 0.2 });
              setOpenMenu(null);
            }}
          />
        </MenuButton>

        {/* Settings */}
        <MenuButton
          label="Settings"
          isOpen={openMenu === 'settings'}
          onClick={() => toggleMenu('settings')}
        >
          <MenuItem
            icon={Settings}
            label="Preferences"
            onClick={() => {
              toast('Settings coming soon', { icon: '⚙️' });
              setOpenMenu(null);
            }}
          />
          <MenuItem
            icon={Edit3}
            label="Customize Theme"
            onClick={() => {
              toast('Theme customization coming soon', { icon: '🎨' });
              setOpenMenu(null);
            }}
          />
        </MenuButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Actions */}
        <div className="flex items-center gap-1 px-2">
          <QuickButton
            icon={Undo2}
            onClick={undo}
            disabled={undoStack.length === 0}
            tooltip="Undo"
          />
          <QuickButton
            icon={Redo2}
            onClick={redo}
            disabled={redoStack.length === 0}
            tooltip="Redo"
          />
          <div className="w-px h-4 bg-arch-border mx-1" />
          <QuickButton icon={ZoomOut} onClick={() => zoomOut()} tooltip="Zoom Out" />
          <QuickButton icon={ZoomIn} onClick={() => zoomIn()} tooltip="Zoom In" />
          <QuickButton
            icon={Maximize2}
            onClick={() => fitView({ padding: 0.2 })}
            tooltip="Fit View"
          />
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 px-3 border-l border-arch-border">
          {isDirty && nodes.length > 0 && (
            <div
              className="flex items-center gap-1.5 text-amber-400 text-xs"
              title="Unsaved changes"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved
            </div>
          )}
          {activeProjectId && (
            <div className="text-gray-400 text-xs">
              {projects.find((p) => p.id === activeProjectId)?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Menu button component
 */
interface MenuButtonProps {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function MenuButton({ label, isOpen, onClick, children }: MenuButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          px-3 py-2 text-sm transition-colors flex items-center gap-1
          ${isOpen ? 'bg-arch-surface-light text-white' : 'text-gray-300 hover:bg-arch-surface-light hover:text-white'}
        `}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-0.5 w-56 bg-arch-surface border border-arch-border rounded-lg shadow-xl py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Menu item component
 */
interface MenuItemProps {
  icon: React.FC<{ size?: number | string; className?: string }>;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  danger = false,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-arch-surface-light'}
        ${danger && !disabled ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'}
      `}
    >
      <Icon size={16} />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-xs text-gray-500">{shortcut}</span>}
    </button>
  );
}

/**
 * Menu divider
 */
function MenuDivider() {
  return <div className="h-px bg-arch-border my-1" />;
}

/**
 * Quick action button
 */
interface QuickButtonProps {
  icon: React.FC<{ size?: number | string; className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

function QuickButton({ icon: Icon, onClick, disabled = false, tooltip }: QuickButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        p-1.5 rounded transition-colors
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-arch-surface-light text-gray-400 hover:text-white'}
      `}
    >
      <Icon size={16} />
    </button>
  );
}

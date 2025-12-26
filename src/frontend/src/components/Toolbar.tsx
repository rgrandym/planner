import { NODE_TYPE_MAP } from '@/config/nodes';
import { useFlowStore } from '@/store/flowStore';
import { useProjectStore } from '@/store/projectStore';
import { useThemeStore } from '@/store/themeStore';
import {
  ChevronDown,
  Copy,
  Download,
  FileIcon,
  FilePlus,
  FolderOpen,
  Maximize2,
  Moon,
  Redo2,
  Save,
  Scissors,
  Settings,
  Sun,
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
    setSettingsModalOpen,
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

  const { mode, toggleMode } = useThemeStore();

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  /**
   * Close menu when clicking outside
   * Uses capture phase to catch events before ReactFlow's pane handlers
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only process if a menu is currently open
      if (openMenu === null) return;
      
      // Check if click is inside the menu container
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return; // Click is inside menu, don't close
      }
      
      // Click is outside, close the menu
      setOpenMenu(null);
    };

    // Use capture phase to ensure we get the event before ReactFlow's handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('pointerdown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('pointerdown', handleClickOutside, true);
    };
  }, [openMenu]);

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
   * Close menu when window loses focus or user clicks on another app
   */
  useEffect(() => {
    const handleBlur = () => {
      setOpenMenu(null);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
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
   * Handle save - uses File System Access API or fallback download
   */
  const handleSave = async () => {
    if (nodes.length === 0) {
      toast.error('Nothing to save');
      setOpenMenu(null);
      return;
    }

    try {
      // Prepare project data for saving
      const projectData = {
        name: activeProjectId 
          ? projects.find(p => p.id === activeProjectId)?.name || 'Untitled'
          : `Project ${projects.length + 1}`,
        nodes: nodes.map(node => {
          const { icon, ...restData } = node.data;
          return { ...node, data: restData };
        }),
        edges,
        viewport,
        savedAt: new Date().toISOString(),
        version: '1.0',
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const filename = `${projectData.name.replace(/\s+/g, '_')}.archflow.json`;

      // Check if File System Access API is available and we're in a secure context
      const supportsFilePicker = 'showSaveFilePicker' in window && 
        (window.isSecureContext || location.hostname === 'localhost');

      if (supportsFilePicker) {
        // Close menu AFTER preparing data but BEFORE showing picker
        // This ensures we still have user gesture context
        setOpenMenu(null);
        
        try {
          // Use File System Access API for native file picker
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'ArchFlow Project',
              accept: { 'application/json': ['.json'] },
            }],
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          toast.success(`Saved "${projectData.name}"`);
          
          // Also save to local storage for quick access
          if (!activeProjectId) {
            const id = createProject(projectData.name);
            saveProject(id, nodes, edges, viewport);
          } else {
            saveProject(activeProjectId, nodes, edges, viewport);
          }
          return;
        } catch (err) {
          // User cancelled - don't fall back to download
          if ((err as Error).name === 'AbortError') {
            return;
          }
          // Other error - fall back to download
          console.warn('File System Access API failed, falling back to download:', err);
        }
      } else {
        setOpenMenu(null);
      }

      // Fallback: use download
      downloadFile(blob, filename);
      toast.success('File downloaded');
      
      // Save to local storage
      if (!activeProjectId) {
        const id = createProject(projectData.name);
        saveProject(id, nodes, edges, viewport);
      } else {
        saveProject(activeProjectId, nodes, edges, viewport);
      }
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Save error:', error);
    }
  };

  /**
   * Fallback download function
   */
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Handle open file - uses File System Access API or file input
   */
  const handleOpenFile = async () => {
    // Check if File System Access API is available
    const supportsFilePicker = 'showOpenFilePicker' in window && 
      (window.isSecureContext || location.hostname === 'localhost');

    if (supportsFilePicker) {
      // Close menu before showing picker to maintain user gesture context
      setOpenMenu(null);
      setOpenMenu(null);
      
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{
            description: 'ArchFlow Project',
            accept: { 'application/json': ['.json'] },
          }],
          multiple: false,
        });
        const file = await fileHandle.getFile();
        await loadProjectFromFile(file);
        return;
      } catch (err) {
        // User cancelled
        if ((err as Error).name === 'AbortError') {
          return;
        }
        console.warn('File System Access API failed, falling back to file input:', err);
      }
    } else {
      setOpenMenu(null);
    }

    // Fallback: use file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.archflow.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await loadProjectFromFile(file);
      }
    };
    input.click();
  };

  /**
   * Load project data from file
   */
  const loadProjectFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.nodes || !data.edges) {
        throw new Error('Invalid project file format');
      }

      // Hydrate nodes with icons
      const hydratedNodes = data.nodes.map((node: { data: { nodeType: string } }) => {
        const nodeConfig = NODE_TYPE_MAP[node.data.nodeType];
        return {
          ...node,
          data: {
            ...node.data,
            icon: nodeConfig?.icon || NODE_TYPE_MAP['LLM']?.icon,
          },
        };
      });

      loadCanvas(hydratedNodes, data.edges, data.viewport || { x: 0, y: 0, zoom: 1 });
      
      // Create a new project entry
      const projectName = data.name || file.name.replace('.archflow.json', '').replace('.json', '');
      const id = createProject(projectName);
      saveProject(id, hydratedNodes, data.edges, data.viewport || { x: 0, y: 0, zoom: 1 });
      
      toast.success(`Opened "${projectName}"`);
    } catch (error) {
      toast.error('Failed to parse project file');
      console.error('Parse error:', error);
    }
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

  const isDarkMode = mode === 'dark';

  return (
    <div className="absolute top-0 left-0 right-0 z-30">
      {/* Main Menubar */}
      <div
        ref={menuRef}
        className={`flex items-center px-2 border-b transition-colors
          ${isDarkMode 
            ? 'bg-arch-surface border-arch-border' 
            : 'bg-white border-gray-200'
          }`}
      >
        {/* Logo */}
        <div className={`px-3 py-2 flex items-center gap-2 border-r mr-2
          ${isDarkMode ? 'border-arch-border' : 'border-gray-200'}`}>
          <span className="text-arch-primary text-lg">⬡</span>
          <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ArchFlow</span>
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
            label="Open File..."
            shortcut="⌘O"
            onClick={handleOpenFile}
          />
          <MenuItem
            icon={FolderOpen}
            label="Open Recent..."
            shortcut="⌘P"
            onClick={() => {
              setProjectModalOpen(true);
              setOpenMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon={Save}
            label="Save As..."
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
              setSettingsModalOpen(true);
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
          <div className="w-px h-4 bg-arch-border mx-1" />
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="p-1.5 rounded hover:bg-arch-surface-light transition-colors group"
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mode === 'dark' ? (
              <Sun size={18} className="text-gray-400 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon size={18} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
            )}
          </button>
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
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          px-3 py-2 text-sm transition-colors flex items-center gap-1
          ${isOpen 
            ? isDarkMode 
              ? 'bg-arch-surface-light text-white' 
              : 'bg-gray-100 text-gray-900'
            : isDarkMode 
              ? 'text-gray-300 hover:bg-arch-surface-light hover:text-white' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-0.5 w-56 rounded-lg shadow-xl py-1 z-50 border
          ${isDarkMode 
            ? 'bg-arch-surface border-arch-border' 
            : 'bg-white border-gray-200'
          }`}>
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
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors
        ${disabled 
          ? 'opacity-40 cursor-not-allowed' 
          : isDarkMode 
            ? 'hover:bg-arch-surface-light' 
            : 'hover:bg-gray-100'
        }
        ${danger && !disabled 
          ? 'text-red-400 hover:text-red-300' 
          : isDarkMode 
            ? 'text-gray-300 hover:text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }
      `}
    >
      <Icon size={16} />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{shortcut}</span>}
    </button>
  );
}

/**
 * Menu divider
 */
function MenuDivider() {
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  return <div className={`h-px my-1 ${isDarkMode ? 'bg-arch-border' : 'bg-gray-200'}`} />;
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
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        p-1.5 rounded transition-colors
        ${disabled 
          ? 'opacity-40 cursor-not-allowed' 
          : isDarkMode 
            ? 'hover:bg-arch-surface-light text-gray-400 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
        }
      `}
    >
      <Icon size={16} />
    </button>
  );
}

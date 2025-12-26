import { DragEvent, useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    Node,
    NodeTypes,
    ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CATEGORY_COLORS } from '@/config/nodes';
import { BaseNode } from '@/nodes';
import { useFlowStore } from '@/store/flowStore';
import { useProjectStore } from '@/store/projectStore';
import { ArchNodeData, NodeTypeConfig } from '@/types';
import toast from 'react-hot-toast';
import { ContextMenu } from './ContextMenu';
import { ExportModal } from './ExportModal';
import { ProjectModal } from './ProjectModal';
import { QuickConnectMenu } from './QuickConnectMenu';
import { Toolbar } from './Toolbar';

/**
 * Custom node types mapping
 */
const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
};

/**
 * Default edge options for new connections
 */
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: {
    stroke: '#06b6d4',
    strokeWidth: 2,
  },
  animated: false,
};

/**
 * Canvas Component
 * Main React Flow canvas with drag-and-drop, connections, and interactions.
 * Features:
 * - Drop zone for sidebar nodes
 * - Node selection and context menu
 * - Keyboard shortcuts
 * - Auto-save to localStorage
 */
export function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Quick connect menu state
  const [quickConnectState, setQuickConnectState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    sourceNodeId: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    sourceNodeId: '',
  });

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    setContextMenu,
    setExportModalOpen,
    setProjectModalOpen,
    setViewport,
    copyNode,
    pasteNode,
    deleteNode,
    duplicateNode,
    undo,
    redo,
    selectedNodeId,
    copiedNode,
    isDirty,
    loadCanvas,
    viewport,
  } = useFlowStore();

  const {
    projects,
    activeProjectId,
    saveProject,
    createProject,
  } = useProjectStore();

  /**
   * Handle initialization of React Flow instance
   */
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  /**
   * Listen for quick connect events from nodes
   */
  useEffect(() => {
    const handleQuickConnect = (e: CustomEvent<{ sourceNodeId: string; position: { x: number; y: number } }>) => {
      setQuickConnectState({
        isOpen: true,
        position: e.detail.position,
        sourceNodeId: e.detail.sourceNodeId,
      });
    };

    window.addEventListener('archflow:quickconnect', handleQuickConnect as EventListener);
    return () => {
      window.removeEventListener('archflow:quickconnect', handleQuickConnect as EventListener);
    };
  }, []);

  /**
   * Warn before leaving with unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && nodes.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, nodes.length]);

  /**
   * Handle drag over event to allow dropping
   */
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handle drop event to create new node
   */
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance.current || !reactFlowWrapper.current) return;

      const nodeTypeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeTypeData) return;

      const nodeType: NodeTypeConfig = JSON.parse(nodeTypeData);
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<ArchNodeData> = {
        id: `${nodeType.type}_${Date.now()}`,
        type: 'baseNode',
        position,
        data: {
          label: nodeType.label,
          nodeType: nodeType.type,
          icon: nodeType.icon,
          color: nodeType.color,
          category: nodeType.category,
          description: '',
          opacity: 90,
          fontSize: 14,
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  /**
   * Handle node selection
   */
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  /**
   * Handle node context menu (right-click)
   */
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
        edgeId: null,
      });
    },
    [setContextMenu]
  );

  /**
   * Handle pane click to deselect
   */
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setContextMenu(null);
  }, [setSelectedNodeId, setContextMenu]);

  /**
   * Handle viewport changes for persistence
   */
  const onMoveEnd = useCallback(
    (_: unknown, viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport);
    },
    [setViewport]
  );

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;

      // New Canvas: Cmd/Ctrl + N
      if (isMeta && event.key === 'n') {
        event.preventDefault();
        if (isDirty && nodes.length > 0) {
          if (!confirm('You have unsaved changes. Create new canvas anyway?')) {
            return;
          }
        }
        loadCanvas([], [], { x: 0, y: 0, zoom: 1 });
        toast.success('New canvas created');
        return;
      }

      // Save: Cmd/Ctrl + S
      if (isMeta && event.key === 's') {
        event.preventDefault();
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
        return;
      }

      // Projects: Cmd/Ctrl + P
      if (isMeta && event.key === 'p') {
        event.preventDefault();
        setProjectModalOpen(true);
        return;
      }

      // Export: Cmd/Ctrl + E
      if (isMeta && event.key === 'e') {
        event.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if (isMeta && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if (isMeta && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      // Copy: Cmd/Ctrl + C
      if (isMeta && event.key === 'c' && selectedNodeId) {
        event.preventDefault();
        copyNode(selectedNodeId);
        return;
      }

      // Paste: Cmd/Ctrl + V
      if (isMeta && event.key === 'v' && copiedNode) {
        event.preventDefault();
        const center = reactFlowInstance.current?.getViewport();
        if (center) {
          pasteNode({ x: -center.x + 400, y: -center.y + 300 });
        }
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (isMeta && event.key === 'd' && selectedNodeId) {
        event.preventDefault();
        duplicateNode(selectedNodeId);
        return;
      }

      // Delete: Backspace or Delete
      if ((event.key === 'Backspace' || event.key === 'Delete') && selectedNodeId) {
        // Don't delete if focus is on an input
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        event.preventDefault();
        deleteNode(selectedNodeId);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    copiedNode,
    setExportModalOpen,
    setProjectModalOpen,
    undo,
    redo,
    copyNode,
    pasteNode,
    duplicateNode,
    deleteNode,
    nodes,
    edges,
    viewport,
    isDirty,
    loadCanvas,
    activeProjectId,
    projects,
    saveProject,
    createProject,
  ]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative pt-10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        snapGrid={[16, 16]}
        fitView
        minZoom={0.1}
        maxZoom={2}
        connectionLineStyle={{
          stroke: '#06b6d4',
          strokeWidth: 2,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#333333"
        />
        <Controls
          className="!bg-arch-surface !border-arch-border !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-arch-surface !border-arch-border !rounded-lg"
          nodeColor={(node) => {
            const data = node.data as ArchNodeData;
            return data.color || CATEGORY_COLORS['infrastructure'];
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
      </ReactFlow>

      <Toolbar />
      <ContextMenu />
      <ExportModal />
      <ProjectModal />
      <QuickConnectMenu
        isOpen={quickConnectState.isOpen}
        position={quickConnectState.position}
        sourceNodeId={quickConnectState.sourceNodeId}
        onClose={() => setQuickConnectState({ ...quickConnectState, isOpen: false })}
      />

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4">⬡</div>
            <p className="text-gray-500 text-lg">
              Drag a node from the sidebar to start
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Connect nodes by dragging from handles
            </p>
            <p className="text-gray-600 text-sm mt-1">
              <kbd className="px-1.5 py-0.5 bg-arch-surface rounded border border-arch-border">⌘N</kbd> New &nbsp;
              <kbd className="px-1.5 py-0.5 bg-arch-surface rounded border border-arch-border">⌘P</kbd> Projects &nbsp;
              <kbd className="px-1.5 py-0.5 bg-arch-surface rounded border border-arch-border">⌘S</kbd> Save
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

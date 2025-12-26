import { NODE_TYPE_MAP } from '@/config/nodes';
import { ArchNodeData, ContextMenuState } from '@/types';
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Connection,
    Edge,
    Node,
    OnConnect,
    OnEdgesChange,
    OnNodesChange,
    Viewport,
} from 'reactflow';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Serializable version of node data (without icon component)
 */
interface SerializableNodeData extends Omit<ArchNodeData, 'icon'> {
  icon?: undefined;
}

/**
 * Reconstruct node data with icon from nodeType
 */
export function hydrateNodeData(data: SerializableNodeData): ArchNodeData {
  const nodeConfig = NODE_TYPE_MAP[data.nodeType];
  return {
    ...data,
    icon: nodeConfig?.icon || NODE_TYPE_MAP['LLM'].icon,
  };
}

/**
 * Prepare node data for serialization (remove icon)
 */
export function dehydrateNodeData(data: ArchNodeData): SerializableNodeData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon, ...rest } = data;
  return rest;
}

/**
 * Interface for the flow store state and actions
 */
interface FlowStore {
  // State
  nodes: Node<ArchNodeData>[];
  edges: Edge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  contextMenu: ContextMenuState | null;
  isExportModalOpen: boolean;
  copiedNode: Node<ArchNodeData> | null;
  undoStack: { nodes: Node<ArchNodeData>[]; edges: Edge[] }[];
  redoStack: { nodes: Node<ArchNodeData>[]; edges: Edge[] }[];
  isProjectModalOpen: boolean;
  isDirty: boolean;

  // Node actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node<ArchNodeData>) => void;
  updateNode: (nodeId: string, data: Partial<ArchNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;

  // Selection actions
  setSelectedNodeId: (nodeId: string | null) => void;

  // Context menu actions
  setContextMenu: (menu: ContextMenuState | null) => void;

  // Export modal actions
  setExportModalOpen: (open: boolean) => void;

  // Project modal actions
  setProjectModalOpen: (open: boolean) => void;

  // Viewport actions
  setViewport: (viewport: Viewport) => void;

  // Clipboard actions
  copyNode: (nodeId: string) => void;
  pasteNode: (position: { x: number; y: number }) => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  saveToUndoStack: () => void;

  // Canvas management
  clearCanvas: () => void;
  loadCanvas: (nodes: Node<ArchNodeData>[], edges: Edge[], viewport?: Viewport) => void;
  setDirty: (dirty: boolean) => void;

  // Quick connect actions
  getNodeById: (nodeId: string) => Node<ArchNodeData> | undefined;
  connectNodes: (sourceId: string, targetId: string) => void;
}

/**
 * Zustand store for managing the flow canvas state
 * Uses subscribeWithSelector for efficient updates without full re-renders
 */
export const useFlowStore = create<FlowStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedNodeId: null,
    contextMenu: null,
    isExportModalOpen: false,
    isProjectModalOpen: false,
    copiedNode: null,
    undoStack: [],
    redoStack: [],
    isDirty: false,

    /**
     * Handle node changes from React Flow
     */
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
        isDirty: true,
      });
    },

    /**
     * Handle edge changes from React Flow
     */
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        isDirty: true,
      });
    },

    /**
     * Handle new connections between nodes
     */
    onConnect: (connection: Connection) => {
      get().saveToUndoStack();
      set({
        edges: addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#06b6d4',
              strokeWidth: 2,
            },
          },
          get().edges
        ),
        isDirty: true,
      });
    },

    /**
     * Add a new node to the canvas
     */
    addNode: (node) => {
      get().saveToUndoStack();
      set((state) => ({
        nodes: [...state.nodes, node],
        isDirty: true,
      }));
    },

    /**
     * Update node data by ID
     */
    updateNode: (nodeId, data) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        ),
        isDirty: true,
      }));
    },

    /**
     * Delete a node and its connected edges
     */
    deleteNode: (nodeId) => {
      get().saveToUndoStack();
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        isDirty: true,
      }));
    },

    /**
     * Remove an edge by ID
     */
    removeEdge: (edgeId) => {
      get().saveToUndoStack();
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== edgeId),
        isDirty: true,
      }));
    },

    /**
     * Duplicate a node with offset position
     */
    duplicateNode: (nodeId) => {
      const nodeToDuplicate = get().nodes.find((node) => node.id === nodeId);
      if (!nodeToDuplicate) return;

      get().saveToUndoStack();
      const newNode: Node<ArchNodeData> = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.data.nodeType}_${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50,
        },
        selected: false,
      };

      set((state) => ({
        nodes: [...state.nodes, newNode],
        isDirty: true,
      }));
    },

    /**
     * Set the currently selected node
     */
    setSelectedNodeId: (nodeId) => {
      set({ selectedNodeId: nodeId });
    },

    /**
     * Set context menu state
     */
    setContextMenu: (menu) => {
      set({ contextMenu: menu });
    },

    /**
     * Toggle export modal
     */
    setExportModalOpen: (open) => {
      set({ isExportModalOpen: open });
    },

    /**
     * Toggle project modal
     */
    setProjectModalOpen: (open) => {
      set({ isProjectModalOpen: open });
    },

    /**
     * Update viewport state
     */
    setViewport: (viewport) => {
      set({ viewport });
    },

    /**
     * Copy a node to clipboard
     */
    copyNode: (nodeId) => {
      const nodeToCopy = get().nodes.find((node) => node.id === nodeId);
      if (nodeToCopy) {
        set({ copiedNode: nodeToCopy });
      }
    },

    /**
     * Paste copied node at position
     */
    pasteNode: (position) => {
      const { copiedNode } = get();
      if (!copiedNode) return;

      get().saveToUndoStack();
      const newNode: Node<ArchNodeData> = {
        ...copiedNode,
        id: `${copiedNode.data.nodeType}_${Date.now()}`,
        position,
        selected: false,
      };

      set((state) => ({
        nodes: [...state.nodes, newNode],
        isDirty: true,
      }));
    },

    /**
     * Save current state to undo stack
     */
    saveToUndoStack: () => {
      const { nodes, edges, undoStack } = get();
      set({
        undoStack: [...undoStack.slice(-19), { nodes: [...nodes], edges: [...edges] }],
        redoStack: [],
      });
    },

    /**
     * Undo last action
     */
    undo: () => {
      const { undoStack, nodes, edges } = get();
      if (undoStack.length === 0) return;

      const lastState = undoStack[undoStack.length - 1];
      set({
        nodes: lastState.nodes,
        edges: lastState.edges,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...get().redoStack, { nodes, edges }],
        isDirty: true,
      });
    },

    /**
     * Redo last undone action
     */
    redo: () => {
      const { redoStack, nodes, edges } = get();
      if (redoStack.length === 0) return;

      const nextState = redoStack[redoStack.length - 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        redoStack: redoStack.slice(0, -1),
        undoStack: [...get().undoStack, { nodes, edges }],
        isDirty: true,
      });
    },

    /**
     * Clear all nodes and edges from canvas
     */
    clearCanvas: () => {
      get().saveToUndoStack();
      set({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        isDirty: true,
      });
    },

    /**
     * Load canvas state (from project)
     */
    loadCanvas: (nodes, edges, viewport) => {
      set({
        nodes,
        edges,
        viewport: viewport || { x: 0, y: 0, zoom: 1 },
        selectedNodeId: null,
        undoStack: [],
        redoStack: [],
        isDirty: false,
      });
    },

    /**
     * Set dirty flag
     */
    setDirty: (dirty) => {
      set({ isDirty: dirty });
    },

    /**
     * Get node by ID
     */
    getNodeById: (nodeId) => {
      return get().nodes.find((node) => node.id === nodeId);
    },

    /**
     * Connect two nodes programmatically
     */
    connectNodes: (sourceId, targetId) => {
      get().saveToUndoStack();
      const newEdge: Edge = {
        id: `edge_${sourceId}_${targetId}_${Date.now()}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#06b6d4',
          strokeWidth: 2,
        },
      };
      set((state) => ({
        edges: [...state.edges, newEdge],
        isDirty: true,
      }));
    },
  }))
);

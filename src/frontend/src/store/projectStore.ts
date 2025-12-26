import { NODE_TYPE_MAP } from '@/config/nodes';
import { ArchNodeData } from '@/types';
import { Edge, Node, Viewport } from 'reactflow';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Serializable version of node data (without icon component)
 */
interface SerializableNodeData extends Omit<ArchNodeData, 'icon'> {
  icon?: undefined;
}

/**
 * Serializable node for storage
 */
interface SerializableNode extends Omit<Node<ArchNodeData>, 'data'> {
  data: SerializableNodeData;
}

/**
 * A saved canvas/project
 */
export interface SavedProject {
  id: string;
  name: string;
  nodes: SerializableNode[];
  edges: Edge[];
  viewport: Viewport;
  createdAt: number;
  updatedAt: number;
}

/**
 * Project store state and actions
 */
interface ProjectStore {
  // State
  projects: SavedProject[];
  activeProjectId: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  createProject: (name: string) => string;
  saveProject: (id: string, nodes: Node<ArchNodeData>[], edges: Edge[], viewport: Viewport) => void;
  loadProject: (id: string) => SavedProject | null;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => string;
  setActiveProject: (id: string | null) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  getProjectList: () => { id: string; name: string; updatedAt: number }[];
}

/**
 * Prepare node data for serialization (remove icon)
 */
function dehydrateNode(node: Node<ArchNodeData>): SerializableNode {
  const { icon, ...restData } = node.data;
  return {
    ...node,
    data: restData,
  };
}

/**
 * Reconstruct node data with icon from nodeType
 */
function hydrateNode(node: SerializableNode): Node<ArchNodeData> {
  const nodeConfig = NODE_TYPE_MAP[node.data.nodeType];
  return {
    ...node,
    data: {
      ...node.data,
      icon: nodeConfig?.icon || NODE_TYPE_MAP['LLM'].icon,
    },
  };
}

/**
 * Generate unique project ID
 */
function generateProjectId(): string {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Project store for managing multiple canvases
 */
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      hasUnsavedChanges: false,

      /**
       * Create a new project
       */
      createProject: (name: string) => {
        const id = generateProjectId();
        const now = Date.now();
        const newProject: SavedProject = {
          id,
          name,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          createdAt: now,
          updatedAt: now,
        };

        set({
          projects: [...get().projects, newProject],
          activeProjectId: id,
          hasUnsavedChanges: false,
        });

        return id;
      },

      /**
       * Save current canvas state to a project
       */
      saveProject: (id: string, nodes: Node<ArchNodeData>[], edges: Edge[], viewport: Viewport) => {
        const projects = get().projects.map((project) =>
          project.id === id
            ? {
                ...project,
                nodes: nodes.map(dehydrateNode),
                edges,
                viewport,
                updatedAt: Date.now(),
              }
            : project
        );

        set({ projects, hasUnsavedChanges: false });
      },

      /**
       * Load a project and return its data
       */
      loadProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return null;

        set({ activeProjectId: id, hasUnsavedChanges: false });

        // Return hydrated project
        return {
          ...project,
          nodes: project.nodes.map(hydrateNode) as unknown as SerializableNode[],
        };
      },

      /**
       * Delete a project
       */
      deleteProject: (id: string) => {
        const projects = get().projects.filter((p) => p.id !== id);
        const activeProjectId = get().activeProjectId === id ? null : get().activeProjectId;
        set({ projects, activeProjectId });
      },

      /**
       * Rename a project
       */
      renameProject: (id: string, name: string) => {
        const projects = get().projects.map((project) =>
          project.id === id ? { ...project, name, updatedAt: Date.now() } : project
        );
        set({ projects });
      },

      /**
       * Duplicate a project
       */
      duplicateProject: (id: string) => {
        const original = get().projects.find((p) => p.id === id);
        if (!original) return '';

        const newId = generateProjectId();
        const now = Date.now();
        const duplicate: SavedProject = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };

        set({ projects: [...get().projects, duplicate] });
        return newId;
      },

      /**
       * Set the active project
       */
      setActiveProject: (id: string | null) => {
        set({ activeProjectId: id });
      },

      /**
       * Mark canvas as having unsaved changes
       */
      setHasUnsavedChanges: (value: boolean) => {
        set({ hasUnsavedChanges: value });
      },

      /**
       * Get list of projects for display
       */
      getProjectList: () => {
        return get().projects.map((p) => ({
          id: p.id,
          name: p.name,
          updatedAt: p.updatedAt,
        }));
      },
    }),
    {
      name: 'archflow-projects',
    }
  )
);

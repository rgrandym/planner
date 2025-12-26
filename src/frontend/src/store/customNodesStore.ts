import { NodeCategory, NodeTypeConfig } from '@/types';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Serializable version of custom node (stores icon name instead of component)
 */
interface SerializableCustomNode {
  type: string;
  label: string;
  iconName: string;
  category: NodeCategory;
  color: string;
  description?: string;
  shape?: string;
  isCustom: boolean;
}

/**
 * Store for managing custom user-created node types
 */
interface CustomNodesStore {
  customNodes: NodeTypeConfig[];
  _serializedNodes: SerializableCustomNode[];
  addCustomNode: (node: NodeTypeConfig, iconName: string) => void;
  updateCustomNode: (type: string, updates: Partial<NodeTypeConfig>, iconName?: string) => void;
  deleteCustomNode: (type: string) => void;
  getCustomNode: (type: string) => NodeTypeConfig | undefined;
  getIconName: (type: string) => string | undefined;
}

/**
 * Get icon component from icon name
 */
function getIconFromName(iconName: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
  return icon || Icons.Box;
}

/**
 * Hydrate serialized nodes with icon components
 */
function hydrateNodes(serializedNodes: SerializableCustomNode[]): NodeTypeConfig[] {
  return serializedNodes.map((node) => ({
    type: node.type,
    label: node.label,
    icon: getIconFromName(node.iconName),
    category: node.category,
    color: node.color,
    description: node.description,
    shape: node.shape as NodeTypeConfig['shape'],
    isCustom: true,
  }));
}

/**
 * Custom nodes store with localStorage persistence
 */
export const useCustomNodesStore = create<CustomNodesStore>()(
  persist(
    (set, get) => ({
      customNodes: [],
      _serializedNodes: [],

      /**
       * Add a new custom node type
       */
      addCustomNode: (node: NodeTypeConfig, iconName: string) => {
        const serializedNode: SerializableCustomNode = {
          type: node.type,
          label: node.label,
          iconName,
          category: 'custom',
          color: node.color,
          description: node.description,
          shape: node.shape,
          isCustom: true,
        };

        set((state) => {
          const newSerializedNodes = [...state._serializedNodes, serializedNode];
          return {
            _serializedNodes: newSerializedNodes,
            customNodes: hydrateNodes(newSerializedNodes),
          };
        });
      },

      /**
       * Update an existing custom node
       */
      updateCustomNode: (type: string, updates: Partial<NodeTypeConfig>, iconName?: string) => {
        set((state) => {
          const newSerializedNodes = state._serializedNodes.map((node) => {
            if (node.type === type) {
              return {
                ...node,
                label: updates.label ?? node.label,
                iconName: iconName ?? node.iconName,
                color: updates.color ?? node.color,
                description: updates.description ?? node.description,
                shape: updates.shape ?? node.shape,
              };
            }
            return node;
          });
          return {
            _serializedNodes: newSerializedNodes,
            customNodes: hydrateNodes(newSerializedNodes),
          };
        });
      },

      /**
       * Delete a custom node type
       */
      deleteCustomNode: (type: string) => {
        set((state) => {
          const newSerializedNodes = state._serializedNodes.filter((node) => node.type !== type);
          return {
            _serializedNodes: newSerializedNodes,
            customNodes: hydrateNodes(newSerializedNodes),
          };
        });
      },

      /**
       * Get a custom node by type
       */
      getCustomNode: (type: string) => {
        return get().customNodes.find((node) => node.type === type);
      },

      /**
       * Get icon name for a custom node
       */
      getIconName: (type: string) => {
        return get()._serializedNodes.find((node) => node.type === type)?.iconName;
      },
    }),
    {
      name: 'archflow-custom-nodes',
      partialize: (state) => ({ _serializedNodes: state._serializedNodes }),
      onRehydrateStorage: () => (state) => {
        if (state && state._serializedNodes) {
          state.customNodes = hydrateNodes(state._serializedNodes);
        }
      },
    }
  )
);

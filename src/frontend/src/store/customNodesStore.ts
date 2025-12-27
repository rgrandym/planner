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
  // New properties for persistence
  width?: number;
  height?: number;
  iconSizeMode?: 'ratio' | 'fixed' | 'free';
  iconSize?: number;
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
    // Hydrate new properties
    // We cast to any because NodeTypeConfig might not have these fields yet in strict typing
    // but they will be passed to the node data
    ...({
      width: node.width,
      height: node.height,
      iconSizeMode: node.iconSizeMode,
      iconSize: node.iconSize,
    } as any),
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
          // Persist new properties if they exist on the input node
          // Note: NodeTypeConfig needs to be updated to include these optional fields
          // or we cast to any for now if they come from ArchNodeData
          width: (node as any).width,
          height: (node as any).height,
          iconSizeMode: (node as any).iconSizeMode,
          iconSize: (node as any).iconSize,
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
                // Update new properties
                width: (updates as any).width ?? node.width,
                height: (updates as any).height ?? node.height,
                iconSizeMode: (updates as any).iconSizeMode ?? node.iconSizeMode,
                iconSize: (updates as any).iconSize ?? node.iconSize,
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

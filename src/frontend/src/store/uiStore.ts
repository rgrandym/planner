import { NodeCategory } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Custom label override for sidebar items
 */
interface SidebarCustomLabels {
  /** Custom category labels by category ID */
  categoryLabels: Record<NodeCategory, string>;
  /** Custom node labels by node type */
  nodeLabels: Record<string, string>;
}

/**
 * UI visibility and layout preferences store
 */
interface UIStore {
  // Panel visibility
  isLeftSidebarVisible: boolean;
  isRightPanelVisible: boolean;
  isPropertyPanelPinned: boolean; // When true, always show even when nothing selected
  isMinimapVisible: boolean;
  isFullViewMode: boolean;
  
  // Sidebar category order
  categoryOrder: NodeCategory[];
  
  // Sidebar custom labels
  sidebarLabels: SidebarCustomLabels;
  
  // Actions
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  togglePropertyPanelPinned: () => void;
  toggleMinimap: () => void;
  toggleFullViewMode: () => void;
  setLeftSidebarVisible: (visible: boolean) => void;
  setRightPanelVisible: (visible: boolean) => void;
  setCategoryOrder: (order: NodeCategory[]) => void;
  moveCategoryUp: (categoryId: NodeCategory) => void;
  moveCategoryDown: (categoryId: NodeCategory) => void;
  resetCategoryOrder: () => void;
  
  // Sidebar label actions
  setCategoryLabel: (categoryId: NodeCategory, label: string) => void;
  setNodeLabel: (nodeType: string, label: string) => void;
  resetCategoryLabel: (categoryId: NodeCategory) => void;
  resetNodeLabel: (nodeType: string) => void;
  resetAllLabels: () => void;
}

/**
 * Default category order
 */
const defaultCategoryOrder: NodeCategory[] = [
  'ai-ml',
  'memory',
  'tools',
  'database',
  'storage',
  'data-types',
  'logic',
  'infrastructure',
  'integrations',
  'communication',
  'processing',
  'annotations',
  'custom',
];

/**
 * Default empty sidebar labels
 */
const defaultSidebarLabels: SidebarCustomLabels = {
  categoryLabels: {} as Record<NodeCategory, string>,
  nodeLabels: {},
};

/**
 * UI Store with persistence
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLeftSidebarVisible: true,
      isRightPanelVisible: true,
      isPropertyPanelPinned: false,
      isMinimapVisible: true,
      isFullViewMode: false,
      categoryOrder: defaultCategoryOrder,
      sidebarLabels: defaultSidebarLabels,

      // Toggle actions
      toggleLeftSidebar: () => set((state) => ({ 
        isLeftSidebarVisible: !state.isLeftSidebarVisible 
      })),
      
      toggleRightPanel: () => set((state) => ({ 
        isRightPanelVisible: !state.isRightPanelVisible 
      })),
      
      togglePropertyPanelPinned: () => set((state) => ({ 
        isPropertyPanelPinned: !state.isPropertyPanelPinned 
      })),
      
      toggleMinimap: () => set((state) => ({ 
        isMinimapVisible: !state.isMinimapVisible 
      })),
      
      toggleFullViewMode: () => set((state) => {
        const entering = !state.isFullViewMode;
        return {
          isFullViewMode: entering,
          // Hide sidebars when entering full view mode
          isLeftSidebarVisible: entering ? false : true,
          isRightPanelVisible: entering ? false : true,
        };
      }),

      // Set actions
      setLeftSidebarVisible: (visible) => set({ isLeftSidebarVisible: visible }),
      setRightPanelVisible: (visible) => set({ isRightPanelVisible: visible }),
      setCategoryOrder: (order) => set({ categoryOrder: order }),

      // Category reordering
      moveCategoryUp: (categoryId) => {
        const order = [...get().categoryOrder];
        const index = order.indexOf(categoryId);
        if (index > 0) {
          [order[index - 1], order[index]] = [order[index], order[index - 1]];
          set({ categoryOrder: order });
        }
      },

      moveCategoryDown: (categoryId) => {
        const order = [...get().categoryOrder];
        const index = order.indexOf(categoryId);
        if (index < order.length - 1 && index >= 0) {
          [order[index], order[index + 1]] = [order[index + 1], order[index]];
          set({ categoryOrder: order });
        }
      },

      resetCategoryOrder: () => set({ categoryOrder: defaultCategoryOrder }),
      
      // Sidebar label actions
      setCategoryLabel: (categoryId, label) => {
        const current = get().sidebarLabels;
        set({
          sidebarLabels: {
            ...current,
            categoryLabels: {
              ...current.categoryLabels,
              [categoryId]: label,
            },
          },
        });
      },
      
      setNodeLabel: (nodeType, label) => {
        const current = get().sidebarLabels;
        set({
          sidebarLabels: {
            ...current,
            nodeLabels: {
              ...current.nodeLabels,
              [nodeType]: label,
            },
          },
        });
      },
      
      resetCategoryLabel: (categoryId) => {
        const current = get().sidebarLabels;
        const { [categoryId]: _, ...rest } = current.categoryLabels;
        set({
          sidebarLabels: {
            ...current,
            categoryLabels: rest as Record<NodeCategory, string>,
          },
        });
      },
      
      resetNodeLabel: (nodeType) => {
        const current = get().sidebarLabels;
        const { [nodeType]: _, ...rest } = current.nodeLabels;
        set({
          sidebarLabels: {
            ...current,
            nodeLabels: rest,
          },
        });
      },
      
      resetAllLabels: () => set({ sidebarLabels: defaultSidebarLabels }),
    }),
    {
      name: 'archflow-ui-settings',
    }
  )
);

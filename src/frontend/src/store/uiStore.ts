import { NodeCategory } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    }),
    {
      name: 'archflow-ui-settings',
    }
  )
);

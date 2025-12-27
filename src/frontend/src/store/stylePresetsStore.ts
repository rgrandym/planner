import { EdgeLineStyle } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ArrowHeadStyle, ColorScheme, useGlobalSettingsStore } from './globalSettingsStore';

/**
 * Style preset settings (subset of global settings relevant to styling)
 */
export interface StylePresetSettings {
  // Line/Connector Settings
  defaultLineWidth: number;
  defaultLineStyle: EdgeLineStyle;
  defaultLineColor: string;
  defaultArrowHeadSize: number;
  defaultArrowHeadStyle: ArrowHeadStyle;
  
  // Color Settings
  colorScheme: ColorScheme;
  defaultNodeColor: string;
  defaultBorderColor: string;
  defaultNodeOpacity: number;
  defaultBorderWidth: number;
  
  // Category Colors
  useCategoryColors: boolean;
}

/**
 * Style preset definition
 */
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  settings: StylePresetSettings;
  isBuiltIn: boolean;
  createdAt: number;
}

/**
 * Built-in style presets
 */
const BUILT_IN_PRESETS: StylePreset[] = [
  {
    id: 'default-category-colors',
    name: 'Default (Category Colors)',
    description: 'Original theme with different colors per category',
    settings: {
      defaultLineWidth: 2,
      defaultLineStyle: 'solid',
      defaultLineColor: '#06b6d4',
      defaultArrowHeadSize: 1,
      defaultArrowHeadStyle: 'filled',
      colorScheme: 'default',
      defaultNodeColor: '#06b6d4',
      defaultBorderColor: '#06b6d4',
      defaultNodeOpacity: 90,
      defaultBorderWidth: 2,
      useCategoryColors: true,
    },
    isBuiltIn: true,
    createdAt: 0,
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Professional grayscale theme',
    settings: {
      defaultLineWidth: 2,
      defaultLineStyle: 'solid',
      defaultLineColor: '#666666',
      defaultArrowHeadSize: 1,
      defaultArrowHeadStyle: 'filled',
      colorScheme: 'grayscale',
      defaultNodeColor: '#666666',
      defaultBorderColor: '#666666',
      defaultNodeOpacity: 90,
      defaultBorderWidth: 2,
      useCategoryColors: false,
    },
    isBuiltIn: true,
    createdAt: 0,
  },
  {
    id: 'grayscale-thick',
    name: 'Grayscale (Thick Lines)',
    description: 'Grayscale with thicker connectors',
    settings: {
      defaultLineWidth: 4,
      defaultLineStyle: 'solid',
      defaultLineColor: '#666666',
      defaultArrowHeadSize: 1.5,
      defaultArrowHeadStyle: 'filled',
      colorScheme: 'grayscale',
      defaultNodeColor: '#666666',
      defaultBorderColor: '#666666',
      defaultNodeOpacity: 90,
      defaultBorderWidth: 3,
      useCategoryColors: false,
    },
    isBuiltIn: true,
    createdAt: 0,
  },
  {
    id: 'monochrome-blue',
    name: 'Monochrome Blue',
    description: 'Unified blue color scheme',
    settings: {
      defaultLineWidth: 2,
      defaultLineStyle: 'solid',
      defaultLineColor: '#3b82f6',
      defaultArrowHeadSize: 1,
      defaultArrowHeadStyle: 'filled',
      colorScheme: 'monochrome',
      defaultNodeColor: '#3b82f6',
      defaultBorderColor: '#3b82f6',
      defaultNodeOpacity: 90,
      defaultBorderWidth: 2,
      useCategoryColors: false,
    },
    isBuiltIn: true,
    createdAt: 0,
  },
  {
    id: 'monochrome-purple',
    name: 'Monochrome Purple',
    description: 'Unified purple color scheme',
    settings: {
      defaultLineWidth: 2,
      defaultLineStyle: 'solid',
      defaultLineColor: '#8b5cf6',
      defaultArrowHeadSize: 1,
      defaultArrowHeadStyle: 'filled',
      colorScheme: 'monochrome',
      defaultNodeColor: '#8b5cf6',
      defaultBorderColor: '#8b5cf6',
      defaultNodeOpacity: 90,
      defaultBorderWidth: 2,
      useCategoryColors: false,
    },
    isBuiltIn: true,
    createdAt: 0,
  },
  {
    id: 'dashed-minimal',
    name: 'Dashed Minimal',
    description: 'Clean look with dashed connectors',
    settings: {
      defaultLineWidth: 1,
      defaultLineStyle: 'dashed',
      defaultLineColor: '#9ca3af',
      defaultArrowHeadSize: 0.8,
      defaultArrowHeadStyle: 'outlined',
      colorScheme: 'default',
      defaultNodeColor: '#9ca3af',
      defaultBorderColor: '#9ca3af',
      defaultNodeOpacity: 80,
      defaultBorderWidth: 1,
      useCategoryColors: false,
    },
    isBuiltIn: true,
    createdAt: 0,
  },
];

/**
 * Style presets store state
 */
interface StylePresetsStore {
  // State
  customPresets: StylePreset[];
  activePresetId: string | null;
  
  // Actions
  getBuiltInPresets: () => StylePreset[];
  getAllPresets: () => StylePreset[];
  getPresetById: (id: string) => StylePreset | undefined;
  
  // Custom preset management
  saveCurrentAsPreset: (name: string, description?: string) => string;
  duplicatePreset: (id: string, newName: string) => string;
  deletePreset: (id: string) => void;
  updatePreset: (id: string, updates: Partial<Pick<StylePreset, 'name' | 'description'>>) => void;
  
  // Apply preset
  applyPreset: (id: string) => void;
  setActivePresetId: (id: string | null) => void;
}

/**
 * Style presets store with localStorage persistence
 */
export const useStylePresetsStore = create<StylePresetsStore>()(
  persist(
    (set, get) => ({
      customPresets: [],
      activePresetId: 'default-category-colors',
      
      getBuiltInPresets: () => BUILT_IN_PRESETS,
      
      getAllPresets: () => {
        return [...BUILT_IN_PRESETS, ...get().customPresets];
      },
      
      getPresetById: (id: string) => {
        const builtIn = BUILT_IN_PRESETS.find((p) => p.id === id);
        if (builtIn) return builtIn;
        return get().customPresets.find((p) => p.id === id);
      },
      
      saveCurrentAsPreset: (name: string, description = '') => {
        const globalSettings = useGlobalSettingsStore.getState();
        const id = `custom-${Date.now()}`;
        
        const newPreset: StylePreset = {
          id,
          name,
          description,
          settings: {
            defaultLineWidth: globalSettings.defaultLineWidth,
            defaultLineStyle: globalSettings.defaultLineStyle,
            defaultLineColor: globalSettings.defaultLineColor,
            defaultArrowHeadSize: globalSettings.defaultArrowHeadSize,
            defaultArrowHeadStyle: globalSettings.defaultArrowHeadStyle,
            colorScheme: globalSettings.colorScheme,
            defaultNodeColor: globalSettings.defaultNodeColor,
            defaultBorderColor: globalSettings.defaultBorderColor,
            defaultNodeOpacity: globalSettings.defaultNodeOpacity,
            defaultBorderWidth: globalSettings.defaultBorderWidth,
            useCategoryColors: globalSettings.useCategoryColors,
          },
          isBuiltIn: false,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          customPresets: [...state.customPresets, newPreset],
          activePresetId: id,
        }));
        
        return id;
      },
      
      duplicatePreset: (id: string, newName: string) => {
        const preset = get().getPresetById(id);
        if (!preset) return '';
        
        const newId = `custom-${Date.now()}`;
        const newPreset: StylePreset = {
          ...preset,
          id: newId,
          name: newName,
          isBuiltIn: false,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          customPresets: [...state.customPresets, newPreset],
        }));
        
        return newId;
      },
      
      deletePreset: (id: string) => {
        set((state) => ({
          customPresets: state.customPresets.filter((p) => p.id !== id),
          activePresetId: state.activePresetId === id ? null : state.activePresetId,
        }));
      },
      
      updatePreset: (id: string, updates: Partial<Pick<StylePreset, 'name' | 'description'>>) => {
        set((state) => ({
          customPresets: state.customPresets.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      
      applyPreset: (id: string) => {
        const preset = get().getPresetById(id);
        if (!preset) return;
        
        const globalSettings = useGlobalSettingsStore.getState();
        const { settings } = preset;
        
        // Apply all style settings
        globalSettings.setDefaultLineWidth(settings.defaultLineWidth);
        globalSettings.setDefaultLineStyle(settings.defaultLineStyle);
        globalSettings.setDefaultLineColor(settings.defaultLineColor);
        globalSettings.setDefaultArrowHeadSize(settings.defaultArrowHeadSize);
        globalSettings.setDefaultArrowHeadStyle(settings.defaultArrowHeadStyle);
        globalSettings.setColorScheme(settings.colorScheme);
        globalSettings.setDefaultNodeColor(settings.defaultNodeColor);
        globalSettings.setDefaultBorderColor(settings.defaultBorderColor);
        globalSettings.setDefaultNodeOpacity(settings.defaultNodeOpacity);
        globalSettings.setDefaultBorderWidth(settings.defaultBorderWidth);
        globalSettings.setUseCategoryColors(settings.useCategoryColors);
        
        set({ activePresetId: id });
      },
      
      setActivePresetId: (id: string | null) => {
        set({ activePresetId: id });
      },
    }),
    {
      name: 'archflow-style-presets',
    }
  )
);

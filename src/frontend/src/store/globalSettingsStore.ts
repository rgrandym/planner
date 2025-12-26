import { EdgeLineStyle } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Arrow head style options
 */
export type ArrowHeadStyle = 'filled' | 'outlined' | 'diamond' | 'circle' | 'none';

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

/**
 * Color scheme options
 */
export type ColorScheme = 'default' | 'grayscale' | 'monochrome' | 'colorful';

/**
 * Global settings interface
 */
interface GlobalSettings {
  // Font Settings
  defaultFontSize: number;
  fontSizeRange: { min: number; max: number };
  defaultFontFamily: string;
  
  // Line/Connector Settings
  defaultLineWidth: number;
  lineWidthRange: { min: number; max: number };
  defaultLineStyle: EdgeLineStyle;
  defaultLineColor: string;
  defaultArrowHeadSize: number;
  arrowHeadSizeRange: { min: number; max: number };
  defaultArrowHeadStyle: ArrowHeadStyle;
  
  // Color Settings
  colorScheme: ColorScheme;
  primaryColor: string;
  accentColor: string;
  customColors: string[];
  
  // Icon/Node Settings
  defaultIconSize: number;
  iconSizeRange: { min: number; max: number };
  defaultNodeOpacity: number;
  defaultBorderWidth: number;
  defaultNodeColor: string;
  defaultBorderColor: string;
  
  // Save Directory
  saveDirectory: string | null;
  exportDirectory: string | null;
}

/**
 * Global settings store state and actions
 */
interface GlobalSettingsStore extends GlobalSettings {
  // Font Actions
  setDefaultFontSize: (size: number) => void;
  setFontSizeRange: (range: { min: number; max: number }) => void;
  setDefaultFontFamily: (family: string) => void;
  
  // Line Actions
  setDefaultLineWidth: (width: number) => void;
  setLineWidthRange: (range: { min: number; max: number }) => void;
  setDefaultLineStyle: (style: EdgeLineStyle) => void;
  setDefaultLineColor: (color: string) => void;
  setDefaultArrowHeadSize: (size: number) => void;
  setArrowHeadSizeRange: (range: { min: number; max: number }) => void;
  setDefaultArrowHeadStyle: (style: ArrowHeadStyle) => void;
  
  // Color Actions
  setColorScheme: (scheme: ColorScheme) => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  addCustomColor: (color: string) => void;
  removeCustomColor: (color: string) => void;
  
  // Icon Actions
  setDefaultIconSize: (size: number) => void;
  setIconSizeRange: (range: { min: number; max: number }) => void;
  setDefaultNodeOpacity: (opacity: number) => void;
  setDefaultBorderWidth: (width: number) => void;
  setDefaultNodeColor: (color: string) => void;
  setDefaultBorderColor: (color: string) => void;
  
  // Directory Actions
  setSaveDirectory: (path: string | null) => void;
  setExportDirectory: (path: string | null) => void;
  
  // Utility
  resetToDefaults: () => void;
}

/**
 * Default settings
 */
const defaultSettings: GlobalSettings = {
  // Font Settings
  defaultFontSize: 14,
  fontSizeRange: { min: 8, max: 32 },
  defaultFontFamily: 'Inter',
  
  // Line/Connector Settings
  defaultLineWidth: 2,
  lineWidthRange: { min: 1, max: 12 },
  defaultLineStyle: 'solid',
  defaultLineColor: '#06b6d4',
  defaultArrowHeadSize: 1,
  arrowHeadSizeRange: { min: 0.5, max: 3 },
  defaultArrowHeadStyle: 'filled',
  
  // Color Settings
  colorScheme: 'default',
  primaryColor: '#06b6d4',
  accentColor: '#8b5cf6',
  customColors: [],
  
  // Icon/Node Settings
  defaultIconSize: 20,
  iconSizeRange: { min: 8, max: 64 },
  defaultNodeOpacity: 90,
  defaultBorderWidth: 2,
  defaultNodeColor: '#06b6d4',
  defaultBorderColor: '#06b6d4',
  
  // Save Directory
  saveDirectory: null,
  exportDirectory: null,
};

/**
 * Global settings store with localStorage persistence
 */
export const useGlobalSettingsStore = create<GlobalSettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      // Font Actions
      setDefaultFontSize: (size) => set({ defaultFontSize: size }),
      setFontSizeRange: (range) => set({ fontSizeRange: range }),
      setDefaultFontFamily: (family) => set({ defaultFontFamily: family }),

      // Line Actions
      setDefaultLineWidth: (width) => set({ defaultLineWidth: width }),
      setLineWidthRange: (range) => set({ lineWidthRange: range }),
      setDefaultLineStyle: (style) => set({ defaultLineStyle: style }),
      setDefaultLineColor: (color) => set({ defaultLineColor: color }),
      setDefaultArrowHeadSize: (size) => set({ defaultArrowHeadSize: size }),
      setArrowHeadSizeRange: (range) => set({ arrowHeadSizeRange: range }),
      setDefaultArrowHeadStyle: (style) => set({ defaultArrowHeadStyle: style }),

      // Color Actions
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setAccentColor: (color) => set({ accentColor: color }),
      addCustomColor: (color) =>
        set((state) => ({
          customColors: [...state.customColors.filter((c) => c !== color), color].slice(-20),
        })),
      removeCustomColor: (color) =>
        set((state) => ({
          customColors: state.customColors.filter((c) => c !== color),
        })),

      // Icon Actions
      setDefaultIconSize: (size) => set({ defaultIconSize: size }),
      setIconSizeRange: (range) => set({ iconSizeRange: range }),
      setDefaultNodeOpacity: (opacity) => set({ defaultNodeOpacity: opacity }),
      setDefaultBorderWidth: (width) => set({ defaultBorderWidth: width }),
      setDefaultNodeColor: (color) => set({ defaultNodeColor: color }),
      setDefaultBorderColor: (color) => set({ defaultBorderColor: color }),

      // Directory Actions
      setSaveDirectory: (path) => set({ saveDirectory: path }),
      setExportDirectory: (path) => set({ exportDirectory: path }),

      // Reset
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'archflow-global-settings',
    }
  )
);

/**
 * Grayscale color palette
 */
export const GRAYSCALE_COLORS = [
  '#000000', // Black
  '#1a1a1a',
  '#333333',
  '#4d4d4d',
  '#666666',
  '#808080', // Gray
  '#999999',
  '#b3b3b3',
  '#cccccc',
  '#e6e6e6',
  '#f2f2f2',
  '#ffffff', // White
];

/**
 * Default color palette
 */
export const DEFAULT_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#78716c', // Stone
];

/**
 * Extended color palette with more shades
 */
export const EXTENDED_COLORS = [
  // Reds
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  // Oranges
  '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  // Blues
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  // Greens
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  // Purples
  '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87',
];

/**
 * Arrow head style display names
 */
export const ARROW_HEAD_STYLES: { value: ArrowHeadStyle; label: string }[] = [
  { value: 'filled', label: 'Filled' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'circle', label: 'Circle' },
  { value: 'none', label: 'None' },
];

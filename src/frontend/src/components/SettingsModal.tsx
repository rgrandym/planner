import { useCustomNodesStore } from '@/store/customNodesStore';
import { useFlowStore } from '@/store/flowStore';
import {
    ARROW_HEAD_STYLES,
    useGlobalSettingsStore,
} from '@/store/globalSettingsStore';
import { useThemeStore } from '@/store/themeStore';
import { useUIStore } from '@/store/uiStore';
import { EdgeLineStyle, NodeTypeConfig } from '@/types';
import { ArrowRight, CheckCircle2, Folder, Layout, Moon, Palette, Plus, RotateCcw, Settings2, Sun, Trash2, Type, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ColorPicker } from './ColorPicker';
import { NodeEditor } from './NodeEditor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'ui' | 'fonts' | 'lines' | 'colors' | 'icons' | 'files' | 'custom-nodes';

/**
 * Line style options
 */
const LINE_STYLES: { value: EdgeLineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

/**
 * SettingsModal Component
 * Provides access to application settings:
 * - General: Theme switcher, preferences
 * - Fonts: Default font settings
 * - Lines: Default connector settings
 * - Colors: Color scheme settings
 * - Icons: Default icon/node settings
 * - Files: Save/export directory settings
 * - Custom Nodes: Create and manage custom node types
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeTypeConfig | null>(null);

  const { mode, toggleMode } = useThemeStore();
  const { customNodes, addCustomNode, updateCustomNode, deleteCustomNode, getIconName } =
    useCustomNodesStore();
  
  const globalSettings = useGlobalSettingsStore();
  const uiStore = useUIStore();
  const { 
    nodes, 
    edges, 
    applyFontSettingsToAllNodes, 
    applyLineSettingsToAllEdges,
    applyNodeSettingsToAllNodes,
  } = useFlowStore();

  if (!isOpen) return null;

  const handleSaveNode = (node: NodeTypeConfig, iconName: string) => {
    if (editingNode) {
      updateCustomNode(editingNode.type, node, iconName);
      toast.success('Node updated successfully');
      setEditingNode(null);
    } else {
      addCustomNode(node, iconName);
      toast.success('Custom node created');
      setIsCreatingNode(false);
    }
  };

  const handleDeleteNode = (type: string) => {
    if (confirm('Are you sure you want to delete this custom node?')) {
      deleteCustomNode(type);
      toast.success('Custom node deleted');
    }
  };

  /**
   * Handle closing with save confirmation
   */
  const handleClose = () => {
    toast.success('Settings saved');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-arch-surface 
                      rounded-xl shadow-2xl border border-arch-border flex flex-col
                      dark:bg-arch-surface dark:border-arch-border
                      light:bg-arch-surface-light-mode light:border-arch-border-light">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-arch-border
                        dark:border-arch-border light:border-arch-border-light">
          <h2 className="text-2xl font-bold text-white dark:text-white light:text-arch-text-light">
            Settings
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-arch-surface-light rounded-lg transition-colors
                       dark:hover:bg-arch-surface-light light:hover:bg-arch-surface-hover-light"
          >
            <X size={20} className="text-gray-400 dark:text-gray-400 light:text-arch-text-secondary-light" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-arch-border px-6 dark:border-arch-border light:border-arch-border-light overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'general'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <Settings2 size={16} />
            General
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'ui'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <Layout size={16} />
            Interface
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'fonts'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <Type size={16} />
            Fonts
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'lines'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <ArrowRight size={16} />
            Lines
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'colors'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <Palette size={16} />
            Colors
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'files'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <Folder size={16} />
            Files
          </button>
          <button
            onClick={() => setActiveTab('custom-nodes')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2
              ${
                activeTab === 'custom-nodes'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            <Plus size={16} />
            Custom Nodes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme Switcher */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 dark:text-white light:text-arch-text-light">
                  Appearance
                </h3>
                <div className="flex items-center justify-between p-4 bg-arch-bg 
                                rounded-lg border border-arch-border
                                dark:bg-arch-bg dark:border-arch-border
                                light:bg-arch-bg-light light:border-arch-border-light">
                  <div className="flex items-center gap-3">
                    {mode === 'dark' ? (
                      <Moon size={20} className="text-arch-primary" />
                    ) : (
                      <Sun size={20} className="text-arch-primary" />
                    )}
                    <div>
                      <p className="font-medium text-white dark:text-white light:text-arch-text-light">
                        Theme Mode
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-arch-text-secondary-light">
                        Currently using {mode} mode
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMode}
                    className="px-4 py-2 bg-arch-primary hover:bg-arch-primary/80
                               text-white rounded-lg transition-colors font-medium"
                  >
                    Switch to {mode === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 dark:text-white light:text-arch-text-light">
                  About
                </h3>
                <div className="p-4 bg-arch-bg rounded-lg border border-arch-border
                                dark:bg-arch-bg dark:border-arch-border
                                light:bg-arch-bg-light light:border-arch-border-light">
                  <p className="text-gray-300 dark:text-gray-300 light:text-arch-text-light">
                    <strong>ArchFlow</strong> - Visual Architecture Designer
                  </p>
                  <p className="text-sm text-gray-400 mt-2 dark:text-gray-400 light:text-arch-text-secondary-light">
                    Create beautiful architecture diagrams with ease
                  </p>
                </div>
              </div>

              {/* Reset Settings */}
              <div>
                <button
                  onClick={() => {
                    globalSettings.resetToDefaults();
                    toast.success('Settings reset to defaults');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20
                             text-red-400 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset All Settings to Defaults
                </button>
              </div>
            </div>
          )}

          {/* UI Interface Tab */}
          {activeTab === 'ui' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Interface Settings</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Configure panel visibility and layout preferences
                </p>
              </div>

              {/* Panel Visibility */}
              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Panel Visibility</h4>
                
                {/* Left Sidebar */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Left Sidebar</p>
                    <p className="text-xs text-gray-500">Show the component library sidebar</p>
                  </div>
                  <button
                    onClick={uiStore.toggleLeftSidebar}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      uiStore.isLeftSidebarVisible ? 'bg-arch-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        uiStore.isLeftSidebarVisible ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Right Panel */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Right Property Panel</p>
                    <p className="text-xs text-gray-500">Show the element properties panel</p>
                  </div>
                  <button
                    onClick={uiStore.toggleRightPanel}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      uiStore.isRightPanelVisible ? 'bg-arch-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        uiStore.isRightPanelVisible ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Property Panel Pin */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Pin Property Panel</p>
                    <p className="text-xs text-gray-500">Keep panel visible even when nothing is selected</p>
                  </div>
                  <button
                    onClick={uiStore.togglePropertyPanelPinned}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      uiStore.isPropertyPanelPinned ? 'bg-arch-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        uiStore.isPropertyPanelPinned ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Minimap */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Minimap</p>
                    <p className="text-xs text-gray-500">Show the panoramic minimap view</p>
                  </div>
                  <button
                    onClick={uiStore.toggleMinimap}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      uiStore.isMinimapVisible ? 'bg-arch-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        uiStore.isMinimapVisible ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Category Order */}
              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Category Order</h4>
                  <button
                    onClick={uiStore.resetCategoryOrder}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Reset to default
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Use the "Reorder" button in the sidebar to change category order
                </p>
              </div>

              {/* Full View Mode Info */}
              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Full View Mode</h4>
                <p className="text-xs text-gray-500">
                  Use the expand button in the canvas toolbar to enter full view mode.
                  This hides both sidebars for maximum canvas space.
                </p>
              </div>
            </div>
          )}

          {/* Fonts Tab */}
          {activeTab === 'fonts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Font Settings</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Configure default font settings for new elements
                </p>
              </div>

              {/* Default Font Size */}
              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Default Font Size: {globalSettings.defaultFontSize}px
                  </label>
                  <input
                    type="range"
                    min={globalSettings.fontSizeRange.min}
                    max={globalSettings.fontSizeRange.max}
                    value={globalSettings.defaultFontSize}
                    onChange={(e) => globalSettings.setDefaultFontSize(parseInt(e.target.value))}
                    className="w-full accent-arch-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{globalSettings.fontSizeRange.min}px</span>
                    <span>{globalSettings.fontSizeRange.max}px</span>
                  </div>
                </div>

                {/* Font Size Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Min Font Size</label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={globalSettings.fontSizeRange.min}
                      onChange={(e) => globalSettings.setFontSizeRange({
                        ...globalSettings.fontSizeRange,
                        min: parseInt(e.target.value) || 8,
                      })}
                      className="w-full px-3 py-2 bg-arch-surface border border-arch-border rounded-lg
                                 text-white text-sm focus:border-arch-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Max Font Size</label>
                    <input
                      type="number"
                      min="24"
                      max="72"
                      value={globalSettings.fontSizeRange.max}
                      onChange={(e) => globalSettings.setFontSizeRange({
                        ...globalSettings.fontSizeRange,
                        max: parseInt(e.target.value) || 32,
                      })}
                      className="w-full px-3 py-2 bg-arch-surface border border-arch-border rounded-lg
                                 text-white text-sm focus:border-arch-primary outline-none"
                    />
                  </div>
                </div>

                {/* Apply to All Nodes Button */}
                <div className="pt-4 border-t border-arch-border">
                  <button
                    onClick={() => {
                      if (nodes.length === 0) {
                        toast.error('No nodes to update');
                        return;
                      }
                      applyFontSettingsToAllNodes(globalSettings.defaultFontSize);
                      toast.success(`Applied ${globalSettings.defaultFontSize}px font to all ${nodes.length} nodes`);
                    }}
                    disabled={nodes.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-arch-primary/10 hover:bg-arch-primary/20
                               text-arch-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={16} />
                    Apply Font Size to All Existing Nodes ({nodes.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lines Tab */}
          {activeTab === 'lines' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Connector Settings</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Configure default settings for new connectors/lines
                </p>
              </div>

              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border space-y-5">
                {/* Default Line Color */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Default Line Color</label>
                  <ColorPicker
                    value={globalSettings.defaultLineColor}
                    onChange={globalSettings.setDefaultLineColor}
                    showGrayscale
                    showExtended
                    showCustomInput
                  />
                </div>

                {/* Default Line Width */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Default Line Width: {globalSettings.defaultLineWidth}px
                  </label>
                  <input
                    type="range"
                    min={globalSettings.lineWidthRange.min}
                    max={globalSettings.lineWidthRange.max}
                    value={globalSettings.defaultLineWidth}
                    onChange={(e) => globalSettings.setDefaultLineWidth(parseInt(e.target.value))}
                    className="w-full accent-arch-primary"
                  />
                </div>

                {/* Default Line Style */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Default Line Style</label>
                  <div className="flex gap-2">
                    {LINE_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => globalSettings.setDefaultLineStyle(style.value)}
                        className={`
                          flex-1 px-3 py-2 rounded-lg border transition-all text-xs font-medium
                          ${globalSettings.defaultLineStyle === style.value
                            ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                            : 'border-arch-border bg-arch-surface text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arrow Head Size */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Default Arrow Size: {globalSettings.defaultArrowHeadSize.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min={globalSettings.arrowHeadSizeRange.min * 10}
                    max={globalSettings.arrowHeadSizeRange.max * 10}
                    value={globalSettings.defaultArrowHeadSize * 10}
                    onChange={(e) => globalSettings.setDefaultArrowHeadSize(parseInt(e.target.value) / 10)}
                    className="w-full accent-arch-primary"
                  />
                </div>

                {/* Arrow Head Style */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Default Arrow Style</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ARROW_HEAD_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => globalSettings.setDefaultArrowHeadStyle(style.value)}
                        className={`
                          px-2 py-2 rounded-lg border transition-all text-xs font-medium
                          ${globalSettings.defaultArrowHeadStyle === style.value
                            ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                            : 'border-arch-border bg-arch-surface text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply to All Edges Button */}
                <div className="pt-4 border-t border-arch-border">
                  <button
                    onClick={() => {
                      if (edges.length === 0) {
                        toast.error('No connectors to update');
                        return;
                      }
                      applyLineSettingsToAllEdges({
                        lineColor: globalSettings.defaultLineColor,
                        lineWidth: globalSettings.defaultLineWidth,
                        lineStyle: globalSettings.defaultLineStyle,
                        arrowHeadSize: globalSettings.defaultArrowHeadSize,
                        arrowHeadStyle: globalSettings.defaultArrowHeadStyle,
                      });
                      toast.success(`Applied line settings to all ${edges.length} connectors`);
                    }}
                    disabled={edges.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-arch-primary/10 hover:bg-arch-primary/20
                               text-arch-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={16} />
                    Apply Line Settings to All Existing Connectors ({edges.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Node Color Settings</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Configure default colors for new nodes
                </p>
              </div>

              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border space-y-5">
                {/* Default Node Color */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Default Node Color</label>
                  <ColorPicker
                    value={globalSettings.defaultNodeColor}
                    onChange={globalSettings.setDefaultNodeColor}
                    showGrayscale
                    showExtended
                    showCustomInput
                  />
                </div>

                {/* Default Border Color */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Default Border Color</label>
                  <ColorPicker
                    value={globalSettings.defaultBorderColor}
                    onChange={globalSettings.setDefaultBorderColor}
                    showGrayscale
                    showExtended
                    showCustomInput
                  />
                </div>

                {/* Default Border Width */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Default Border Width: {globalSettings.defaultBorderWidth}px
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    value={globalSettings.defaultBorderWidth}
                    onChange={(e) => globalSettings.setDefaultBorderWidth(parseInt(e.target.value))}
                    className="w-full accent-arch-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0px</span>
                    <span>8px</span>
                  </div>
                </div>

                {/* Default Node Opacity */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Default Node Opacity: {globalSettings.defaultNodeOpacity}%
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={globalSettings.defaultNodeOpacity}
                    onChange={(e) => globalSettings.setDefaultNodeOpacity(parseInt(e.target.value))}
                    className="w-full accent-arch-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Apply to All Nodes Button */}
                <div className="pt-4 border-t border-arch-border">
                  <button
                    onClick={() => {
                      if (nodes.length === 0) {
                        toast.error('No nodes to update');
                        return;
                      }
                      applyNodeSettingsToAllNodes({
                        color: globalSettings.defaultNodeColor,
                        borderColor: globalSettings.defaultBorderColor,
                        borderWidth: globalSettings.defaultBorderWidth,
                        opacity: globalSettings.defaultNodeOpacity,
                      });
                      toast.success(`Applied color settings to all ${nodes.length} nodes`);
                    }}
                    disabled={nodes.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-arch-primary/10 hover:bg-arch-primary/20
                               text-arch-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={16} />
                    Apply Color Settings to All Existing Nodes ({nodes.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">File Settings</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Configure save and export directories
                </p>
              </div>

              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border space-y-5">
                {/* Save Directory */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Project Save Location</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={globalSettings.saveDirectory || 'Default (uses Save As dialog)'}
                      className="flex-1 px-3 py-2 bg-arch-surface border border-arch-border rounded-lg
                                 text-gray-400 text-sm"
                    />
                    <button
                      onClick={async () => {
                        try {
                          const dirHandle = await window.showDirectoryPicker();
                          globalSettings.setSaveDirectory(dirHandle.name);
                          toast.success(`Save directory set to: ${dirHandle.name}`);
                        } catch (err) {
                          if ((err as Error).name !== 'AbortError') {
                            toast.error('Could not access directory');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-arch-surface border border-arch-border rounded-lg
                                 text-white text-sm hover:border-arch-primary transition-colors
                                 flex items-center gap-2"
                    >
                      <Folder size={16} />
                      Browse
                    </button>
                  </div>
                </div>

                {/* Export Directory */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Default Export Location</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={globalSettings.exportDirectory || 'Default (uses Save As dialog)'}
                      className="flex-1 px-3 py-2 bg-arch-surface border border-arch-border rounded-lg
                                 text-gray-400 text-sm"
                    />
                    <button
                      onClick={async () => {
                        try {
                          const dirHandle = await window.showDirectoryPicker();
                          globalSettings.setExportDirectory(dirHandle.name);
                          toast.success(`Export directory set to: ${dirHandle.name}`);
                        } catch (err) {
                          if ((err as Error).name !== 'AbortError') {
                            toast.error('Could not access directory');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-arch-surface border border-arch-border rounded-lg
                                 text-white text-sm hover:border-arch-primary transition-colors
                                 flex items-center gap-2"
                    >
                      <Folder size={16} />
                      Browse
                    </button>
                  </div>
                </div>

                {/* Clear Directories */}
                <div className="pt-4 border-t border-arch-border">
                  <button
                    onClick={() => {
                      globalSettings.setSaveDirectory(null);
                      globalSettings.setExportDirectory(null);
                      toast.success('Directories reset to defaults');
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Reset to default locations
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Nodes Tab */}
          {activeTab === 'custom-nodes' && (
            <div className="space-y-4">
              {!isCreatingNode && !editingNode && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white dark:text-white light:text-arch-text-light">
                        Custom Node Types
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 dark:text-gray-400 light:text-arch-text-secondary-light">
                        Create and manage your custom node types
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreatingNode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-arch-primary 
                                 hover:bg-arch-primary/80 text-white rounded-lg 
                                 transition-colors font-medium"
                    >
                      <Plus size={18} />
                      New Node
                    </button>
                  </div>

                  {/* Custom Nodes List */}
                  {customNodes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-400 light:text-arch-text-secondary-light">
                      <p>No custom nodes yet.</p>
                      <p className="text-sm mt-2">
                        Click "New Node" to create your first custom node type.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {customNodes.map((node) => {
                        const Icon = node.icon;
                        return (
                          <div
                            key={node.type}
                            className="p-4 bg-arch-bg rounded-lg border border-arch-border
                                       hover:border-gray-600 transition-colors group
                                       dark:bg-arch-bg dark:border-arch-border
                                       light:bg-arch-bg-light light:border-arch-border-light"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="p-2 rounded"
                                  style={{ backgroundColor: `${node.color}20` }}
                                >
                                  <Icon size={20} color={node.color} />
                                </div>
                                <div>
                                  <p className="font-medium text-white dark:text-white light:text-arch-text-light">
                                    {node.label}
                                  </p>
                                  {node.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-400 light:text-arch-text-secondary-light">
                                      {node.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingNode(node)}
                                className="flex-1 px-3 py-1.5 bg-arch-surface hover:bg-arch-surface-light
                                           text-white text-sm rounded transition-colors
                                           dark:bg-arch-surface dark:hover:bg-arch-surface-light
                                           light:bg-white light:hover:bg-gray-100 light:text-arch-text-light"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNode(node.type)}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30
                                           text-red-400 text-sm rounded transition-colors
                                           flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Node Editor */}
              {(isCreatingNode || editingNode) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 dark:text-white light:text-arch-text-light">
                    {editingNode ? 'Edit Node Type' : 'Create New Node Type'}
                  </h3>
                  <NodeEditor
                    existingNode={editingNode || undefined}
                    existingIconName={editingNode ? getIconName(editingNode.type) : undefined}
                    onSave={handleSaveNode}
                    onCancel={() => {
                      setIsCreatingNode(false);
                      setEditingNode(null);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

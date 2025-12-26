import { NODE_TYPE_MAP } from '@/config/nodes';
import { useFlowStore } from '@/store/flowStore';
import { useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { useUIStore } from '@/store/uiStore';
import { ArchNodeData, NodeCategory } from '@/types';
import { Box, Copy, PanelRightClose, Pin, PinOff, Trash2, X } from 'lucide-react';
import { useMemo } from 'react';
import { ColorPicker } from './ColorPicker';

/**
 * Get metadata fields based on node category
 * Note: Removed AI-ML model/apiKey as this app doesn't use those features
 */
function getMetadataFields(category: NodeCategory): { key: string; label: string; placeholder: string }[] {
  switch (category) {
    case 'database':
      return [
        { key: 'connectionString', label: 'Connection String', placeholder: 'postgresql://...' },
        { key: 'database', label: 'Database Name', placeholder: 'my_database' },
      ];
    case 'infrastructure':
      return [
        { key: 'endpoint', label: 'Endpoint URL', placeholder: 'https://api.example.com' },
        { key: 'port', label: 'Port', placeholder: '8080' },
      ];
    case 'storage':
      return [
        { key: 'filePath', label: 'File Path', placeholder: '/data/file.csv' },
      ];
    default:
      return [];
  }
}

/**
 * PropertyPanel Component
 * Right sidebar that appears when a node is selected.
 * Features:
 * - Node identity editing (name, description)
 * - Styling controls (color, opacity, font size)
 * - Metadata fields based on node type
 * - Action buttons (duplicate, delete)
 */
export function PropertyPanel() {
  const { nodes, selectedNodeId, updateNode, duplicateNode, deleteNode, setSelectedNodeId } = useFlowStore();
  const globalSettings = useGlobalSettingsStore();
  const { isPropertyPanelPinned, togglePropertyPanelPinned, toggleRightPanel } = useUIStore();

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  // Show empty state when nothing selected and panel is pinned
  if (!selectedNode) {
    return (
      <aside className="w-72 bg-arch-surface border-l border-arch-border flex flex-col h-full">
        {/* Header with controls */}
        <div className="p-4 border-b border-arch-border flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">Properties</span>
          <div className="flex items-center gap-1">
            <button
              onClick={togglePropertyPanelPinned}
              className={`p-1.5 rounded transition-colors ${
                isPropertyPanelPinned 
                  ? 'bg-arch-primary/20 text-arch-primary' 
                  : 'hover:bg-arch-surface-light text-gray-400'
              }`}
              title={isPropertyPanelPinned ? 'Unpin panel' : 'Pin panel open'}
            >
              {isPropertyPanelPinned ? <Pin size={16} /> : <PinOff size={16} />}
            </button>
            <button
              onClick={toggleRightPanel}
              className="p-1.5 hover:bg-arch-surface-light rounded transition-colors"
              title="Hide panel"
            >
              <PanelRightClose size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500 text-sm text-center">
            Select a node or edge to view its properties
          </p>
        </div>
      </aside>
    );
  }

  const data = selectedNode.data as ArchNodeData;
  // Get icon from NODE_TYPE_MAP to ensure it's always a valid component
  const nodeConfig = NODE_TYPE_MAP[data.nodeType];
  const Icon = nodeConfig?.icon || Box;
  const metadataFields = getMetadataFields(data.category);

  /**
   * Update a specific field in the node data
   */
  const handleUpdate = (key: keyof ArchNodeData, value: unknown) => {
    updateNode(selectedNode.id, { [key]: value } as Partial<ArchNodeData>);
  };

  /**
   * Update metadata field
   */
  const handleMetadataUpdate = (key: string, value: string) => {
    updateNode(selectedNode.id, {
      metadata: { ...data.metadata, [key]: value },
    });
  };

  return (
    <aside className="w-72 bg-arch-surface border-l border-arch-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-arch-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded"
            style={{ backgroundColor: `${data.color}20` }}
          >
            <Icon size={18} color={data.color} />
          </div>
          <span className="font-medium text-white truncate max-w-[120px]">{data.nodeType}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={togglePropertyPanelPinned}
            className={`p-1 rounded transition-colors ${
              isPropertyPanelPinned 
                ? 'bg-arch-primary/20 text-arch-primary' 
                : 'hover:bg-arch-surface-light text-gray-400'
            }`}
            title={isPropertyPanelPinned ? 'Unpin panel' : 'Pin panel open'}
          >
            {isPropertyPanelPinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 hover:bg-arch-surface-light rounded transition-colors"
            title="Deselect node"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Identity Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Identity
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={data.label}
                onChange={(e) => handleUpdate('label', e.target.value)}
                className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                           text-white text-sm focus:border-arch-primary focus:ring-1 
                           focus:ring-arch-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => handleUpdate('description', e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                           text-white text-sm focus:border-arch-primary focus:ring-1 
                           focus:ring-arch-primary outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* Styling Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Styling
          </h3>
          <div className="space-y-4">
            {/* Color Picker */}
            <ColorPicker
              value={data.borderColor || data.color}
              onChange={(color) => handleUpdate('borderColor', color)}
              label="Border Color"
              showGrayscale
              showCustomInput
            />

            {/* Border Width */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Border Width: {data.borderWidth ?? 2}px
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={data.borderWidth ?? 2}
                onChange={(e) => handleUpdate('borderWidth', parseInt(e.target.value))}
                className="w-full accent-arch-primary"
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Background Opacity: {data.opacity ?? 90}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={data.opacity ?? 90}
                onChange={(e) => handleUpdate('opacity', parseInt(e.target.value))}
                className="w-full accent-arch-primary"
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Font Size: {data.fontSize ?? globalSettings.defaultFontSize}px
              </label>
              <input
                type="range"
                min={globalSettings.fontSizeRange.min}
                max={globalSettings.fontSizeRange.max}
                value={data.fontSize ?? globalSettings.defaultFontSize}
                onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
                className="w-full accent-arch-primary"
              />
            </div>

            {/* Icon Size */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Icon Size: {data.iconSize ?? globalSettings.defaultIconSize}px
              </label>
              <input
                type="range"
                min={globalSettings.iconSizeRange.min}
                max={globalSettings.iconSizeRange.max}
                value={data.iconSize ?? globalSettings.defaultIconSize}
                onChange={(e) => handleUpdate('iconSize', parseInt(e.target.value))}
                className="w-full accent-arch-primary"
              />
            </div>
          </div>
        </section>

        {/* Metadata Section (conditional) */}
        {metadataFields.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Configuration
            </h3>
            <div className="space-y-3">
              {metadataFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={data.metadata?.[field.key] || ''}
                    onChange={(e) => handleMetadataUpdate(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                               text-white text-sm placeholder-gray-500 
                               focus:border-arch-primary focus:ring-1 
                               focus:ring-arch-primary outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-arch-border space-y-2">
        <button
          onClick={() => duplicateNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
                     bg-arch-surface-light hover:bg-arch-border rounded-lg
                     text-gray-300 hover:text-white transition-colors"
        >
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <button
          onClick={() => {
            deleteNode(selectedNode.id);
            setSelectedNodeId(null);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
                     bg-red-500/10 hover:bg-red-500/20 rounded-lg
                     text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </aside>
  );
}

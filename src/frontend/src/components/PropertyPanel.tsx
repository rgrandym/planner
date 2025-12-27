import { NODE_TYPE_MAP } from '@/config/nodes';
import { useFlowStore } from '@/store/flowStore';
import { useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { useUIStore } from '@/store/uiStore';
import { ArchNodeData, LabelLine, NodeCategory } from '@/types';
import { Box, Copy, Minus, PanelRightClose, Pin, PinOff, Plus, Trash2, X } from 'lucide-react';
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
              onClick={() => {
                toggleRightPanel();
                setSelectedNodeId(null);
              }}
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
            onClick={() => {
              setSelectedNodeId(null);
              useUIStore.getState().setRightPanelVisible(false);
            }}
            className="p-1 hover:bg-arch-surface-light rounded transition-colors"
            title="Close panel"
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
              <textarea
                value={data.label}
                onChange={(e) => handleUpdate('label', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                           text-white text-sm focus:border-arch-primary focus:ring-1 
                           focus:ring-arch-primary outline-none transition-colors resize-y"
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

        {/* Multi-line Labels Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Label Lines
            </h3>
            <button
              onClick={() => {
                const currentLines = data.labelLines || [];
                // If this is the first line being added, we should preserve the current primary label
                // as the first line, and then add the new line below it.
                let newLines = [...currentLines];
                
                if (currentLines.length === 0 && data.label) {
                  newLines.push({
                    text: data.label,
                    fontSize: data.fontSize ?? globalSettings.defaultFontSize,
                    fontWeight: 'normal'
                  });
                }

                newLines.push({ 
                  text: 'New line', 
                  fontSize: data.fontSize ?? globalSettings.defaultFontSize,
                  fontWeight: 'normal'
                });
                
                handleUpdate('labelLines', newLines);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded
                         bg-arch-primary/20 text-arch-primary hover:bg-arch-primary/30 transition-colors"
            >
              <Plus size={12} />
              Add Line
            </button>
          </div>
          
          {(!data.labelLines || data.labelLines.length === 0) ? (
            <p className="text-xs text-gray-500 italic">
              No custom label lines. Using single-line label above.
            </p>
          ) : (
            <div className="space-y-3">
              {data.labelLines.map((line, index) => (
                <div key={index} className="p-3 bg-arch-bg rounded-lg border border-arch-border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">Line {index + 1}</span>
                    <button
                      onClick={() => {
                        const newLines = data.labelLines?.filter((_, i) => i !== index) || [];
                        handleUpdate('labelLines', newLines.length > 0 ? newLines : undefined);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"
                      title="Remove line"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => {
                      const newLines = [...(data.labelLines || [])];
                      newLines[index] = { ...newLines[index], text: e.target.value };
                      handleUpdate('labelLines', newLines);
                    }}
                    placeholder="Line text..."
                    className="w-full px-2 py-1.5 bg-arch-surface border border-arch-border rounded
                               text-white text-sm focus:border-arch-primary outline-none"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Size: {line.fontSize}px
                      </label>
                      <input
                        type="range"
                        min={globalSettings.fontSizeRange.min}
                        max={globalSettings.fontSizeRange.max}
                        value={line.fontSize}
                        onChange={(e) => {
                          const newLines = [...(data.labelLines || [])];
                          newLines[index] = { ...newLines[index], fontSize: parseInt(e.target.value) };
                          handleUpdate('labelLines', newLines);
                        }}
                        className="w-full accent-arch-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Weight</label>
                      <select
                        value={line.fontWeight || 'normal'}
                        onChange={(e) => {
                          const newLines = [...(data.labelLines || [])];
                          newLines[index] = { 
                            ...newLines[index], 
                            fontWeight: e.target.value as LabelLine['fontWeight'] 
                          };
                          handleUpdate('labelLines', newLines);
                        }}
                        className="px-2 py-1 bg-arch-surface border border-arch-border rounded
                                   text-white text-xs focus:border-arch-primary outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

            {/* Node Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Width (px)</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={data.width || ''}
                  placeholder="Auto"
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : undefined;
                    handleUpdate('width', val);
                  }}
                  className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                             text-white text-sm focus:border-arch-primary focus:ring-1 
                             focus:ring-arch-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Height (px)</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={data.height || ''}
                  placeholder="Auto"
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : undefined;
                    handleUpdate('height', val);
                  }}
                  className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                             text-white text-sm focus:border-arch-primary focus:ring-1 
                             focus:ring-arch-primary outline-none transition-colors"
                />
              </div>
            </div>

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

            {/* Icon Size Mode */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Icon Sizing</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(['ratio', 'fixed', 'free'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleUpdate('iconSizeMode', mode)}
                    className={`
                      px-2 py-1.5 rounded border transition-all text-xs font-medium capitalize
                      ${(data.iconSizeMode || 'ratio') === mode
                        ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                        : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                      }
                    `}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              
              {/* Icon Size Slider - Context aware */}
              <label className="block text-xs text-gray-500 mb-1">
                {(data.iconSizeMode === 'fixed' || data.iconSizeMode === 'free') 
                  ? `Size: ${data.iconSize ?? globalSettings.defaultIconSize}px`
                  : `Ratio: ${(data.iconSize ?? 50) / 100}x`
                }
              </label>
              <input
                type="range"
                min={(data.iconSizeMode === 'fixed' || data.iconSizeMode === 'free') ? 10 : 10}
                max={(data.iconSizeMode === 'fixed' || data.iconSizeMode === 'free') ? 100 : 90}
                value={data.iconSize ?? ((data.iconSizeMode === 'fixed' || data.iconSizeMode === 'free') ? globalSettings.defaultIconSize : 50)}
                onChange={(e) => handleUpdate('iconSize', parseInt(e.target.value))}
                className="w-full accent-arch-primary"
              />
            </div>

            {/* Node Shape */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {(['rectangle', 'rounded', 'circle', 'diamond', 'hexagon', 'triangle'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => handleUpdate('shape', shape)}
                    className={`
                      px-2 py-2 rounded-lg border transition-all text-xs font-medium capitalize
                      ${(data.shape || 'rectangle') === shape
                        ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                        : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                      }
                    `}
                  >
                    {shape}
                  </button>
                ))}
              </div>
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

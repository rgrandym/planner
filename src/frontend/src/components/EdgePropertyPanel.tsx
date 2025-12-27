import { useFlowStore } from '@/store/flowStore';
import { ARROW_HEAD_STYLES, ArrowHeadStyle, useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { useUIStore } from '@/store/uiStore';
import { EdgeLineStyle } from '@/types';
import { ArrowRight, Pin, PinOff, Trash2, X } from 'lucide-react';
import { useMemo } from 'react';
import { ColorPicker } from './ColorPicker';

/**
 * Line style options
 */
const LINE_STYLES: { value: EdgeLineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

/**
 * EdgePropertyPanel Component
 * Panel for editing edge (connector) properties.
 * Features:
 * - Full color picker with presets and custom input
 * - Stroke width slider
 * - Line style selector (solid, dashed, dotted)
 * - Arrow head size and style
 * - Animation toggle
 * - Delete button
 */
export function EdgePropertyPanel() {
  const { edges, selectedEdgeId, updateEdge, removeEdge, setSelectedEdgeId } = useFlowStore();
  const globalSettings = useGlobalSettingsStore();
  const { isPropertyPanelPinned, togglePropertyPanelPinned } = useUIStore();

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  );

  if (!selectedEdge) {
    return null;
  }

  // Get current values
  const strokeColor = (selectedEdge.style?.stroke as string) || globalSettings.defaultLineColor;
  const strokeWidth = (selectedEdge.style?.strokeWidth as number) || globalSettings.defaultLineWidth;
  const lineStyle: EdgeLineStyle = selectedEdge.data?.lineStyle || globalSettings.defaultLineStyle;
  const arrowHeadSize = (selectedEdge.data?.arrowHeadSize as number) || globalSettings.defaultArrowHeadSize;
  const arrowHeadStyle: ArrowHeadStyle = (selectedEdge.data?.arrowHeadStyle as ArrowHeadStyle) || globalSettings.defaultArrowHeadStyle;
  const isAnimated = selectedEdge.animated || false;
  const edgeLabel = (selectedEdge.data?.label as string) || '';

  /**
   * Update edge style
   */
  const handleStyleUpdate = (updates: Partial<React.CSSProperties>) => {
    const currentStyle = selectedEdge.style || {};
    updateEdge(selectedEdge.id, {
      style: { ...currentStyle, ...updates },
    });
  };

  /**
   * Update edge data
   */
  const handleDataUpdate = (key: string, value: unknown) => {
    const currentData = selectedEdge.data || {};
    updateEdge(selectedEdge.id, {
      data: { ...currentData, [key]: value },
    });
  };

  /**
   * Update line style (solid, dashed, dotted)
   */
  const handleLineStyleChange = (style: EdgeLineStyle) => {
    handleDataUpdate('lineStyle', style);
    
    let strokeDasharray = 'none';
    if (style === 'dashed') {
      strokeDasharray = '8 4';
    } else if (style === 'dotted') {
      strokeDasharray = '2 2';
    }
    
    handleStyleUpdate({ strokeDasharray });
  };

  /**
   * Toggle animation
   */
  const handleAnimationToggle = () => {
    updateEdge(selectedEdge.id, { animated: !isAnimated });
  };

  /**
   * Delete edge
   */
  const handleDelete = () => {
    removeEdge(selectedEdge.id);
    setSelectedEdgeId(null);
  };

  return (
    <aside className="w-72 bg-arch-surface border-l border-arch-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-arch-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded"
            style={{ backgroundColor: `${strokeColor}20` }}
          >
            <ArrowRight size={18} color={strokeColor} />
          </div>
          <span className="font-medium text-white">Connector</span>
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
            onClick={() => setSelectedEdgeId(null)}
            className="p-1 hover:bg-arch-surface-light rounded transition-colors"
            title="Deselect edge"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Label Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Label
          </h3>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Edge Label</label>
            <input
              type="text"
              value={edgeLabel}
              onChange={(e) => handleDataUpdate('label', e.target.value)}
              placeholder="e.g., true, false, next..."
              className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                         text-white text-sm focus:border-arch-primary focus:ring-1 
                         focus:ring-arch-primary outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Label appears at the middle of the connector
            </p>
          </div>
        </section>

        {/* Styling Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Line Styling
          </h3>
          <div className="space-y-4">
            {/* Stroke Color */}
            <ColorPicker
              value={strokeColor}
              onChange={(color) => handleStyleUpdate({ stroke: color })}
              label="Stroke Color"
              showGrayscale
              showCustomInput
            />

            {/* Stroke Width */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Stroke Width: {strokeWidth}px
              </label>
              <input
                type="range"
                min={globalSettings.lineWidthRange.min}
                max={globalSettings.lineWidthRange.max}
                value={strokeWidth}
                onChange={(e) => handleStyleUpdate({ strokeWidth: parseInt(e.target.value) })}
                className="w-full accent-arch-primary"
              />
            </div>

            {/* Line Style */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Line Style</label>
              <div className="flex gap-2">
                {LINE_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleLineStyleChange(style.value)}
                    className={`
                      flex-1 px-3 py-2 rounded-lg border transition-all text-xs font-medium
                      ${lineStyle === style.value
                        ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                        : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                      }
                    `}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Arrow Head Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Arrow Head
          </h3>
          <div className="space-y-4">
            {/* Arrow Head Style */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Arrow Style</label>
              <div className="grid grid-cols-3 gap-2">
                {ARROW_HEAD_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleDataUpdate('arrowHeadStyle', style.value)}
                    className={`
                      px-2 py-2 rounded-lg border transition-all text-xs font-medium
                      ${arrowHeadStyle === style.value
                        ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                        : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
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
                Arrow Size: {arrowHeadSize.toFixed(1)}x
              </label>
              <input
                type="range"
                min={globalSettings.arrowHeadSizeRange.min * 10}
                max={globalSettings.arrowHeadSizeRange.max * 10}
                value={arrowHeadSize * 10}
                onChange={(e) => handleDataUpdate('arrowHeadSize', parseInt(e.target.value) / 10)}
                className="w-full accent-arch-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Scales proportionally with line thickness
              </p>
            </div>
          </div>
        </section>

        {/* Animation Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Animation
          </h3>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`
                  w-12 h-6 rounded-full transition-colors relative cursor-pointer
                  ${isAnimated ? 'bg-arch-primary' : 'bg-arch-border'}
                `}
                onClick={handleAnimationToggle}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${isAnimated ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </div>
              <span className="text-sm text-gray-300">Animated Flow</span>
            </label>
          </div>
        </section>
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-arch-border">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
                     bg-red-500/10 hover:bg-red-500/20 rounded-lg
                     text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete Connection</span>
        </button>
      </div>
    </aside>
  );
}

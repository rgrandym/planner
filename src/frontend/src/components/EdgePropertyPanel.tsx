import { useFlowStore } from '@/store/flowStore';
import { EdgeLineStyle } from '@/types';
import { ArrowRight, Trash2, X } from 'lucide-react';
import { useMemo } from 'react';

/**
 * Color presets for edge styling
 */
const EDGE_COLOR_PRESETS = [
  '#06b6d4', // Cyan (default)
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#ffffff', // White
];

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
 * - Stroke color picker
 * - Stroke width slider
 * - Line style selector (solid, dashed, dotted)
 * - Animation toggle
 * - Delete button
 */
export function EdgePropertyPanel() {
  const { edges, selectedEdgeId, updateEdge, removeEdge, setSelectedEdgeId } = useFlowStore();

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  );

  if (!selectedEdge) {
    return null;
  }

  // Get current values
  const strokeColor = (selectedEdge.style?.stroke as string) || '#06b6d4';
  const strokeWidth = (selectedEdge.style?.strokeWidth as number) || 2;
  const lineStyle: EdgeLineStyle = selectedEdge.data?.lineStyle || 'solid';
  const isAnimated = selectedEdge.animated || false;

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
        <button
          onClick={() => setSelectedEdgeId(null)}
          className="p-1 hover:bg-arch-surface-light rounded transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Styling Section */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Styling
          </h3>
          <div className="space-y-4">
            {/* Stroke Color */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Stroke Color</label>
              <div className="flex flex-wrap gap-2">
                {EDGE_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleStyleUpdate({ stroke: color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110
                      ${strokeColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Stroke Width: {strokeWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="8"
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

            {/* Animation Toggle */}
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
                <span className="text-sm text-gray-300">Animated</span>
              </label>
            </div>
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

import { NodeShape, NodeTypeConfig } from '@/types';
import * as Icons from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface NodeEditorProps {
  existingNode?: NodeTypeConfig;
  existingIconName?: string;
  onSave: (node: NodeTypeConfig, iconName: string) => void;
  onCancel: () => void;
}

/**
 * Icon names from lucide-react for the picker
 */
const AVAILABLE_ICONS = [
  'Box', 'Circle', 'Square', 'Diamond', 'Hexagon', 'Star',
  'Heart', 'Zap', 'Database', 'Server', 'Cloud', 'Cpu',
  'Brain', 'Bot', 'MessageSquare', 'Mail', 'Globe', 'FileText',
  'Table', 'List', 'Filter', 'GitBranch', 'Settings', 'Package',
  'Eye', 'ScanText', 'Calculator', 'Sigma', 'Video', 'Image',
];

const SHAPE_OPTIONS: { value: NodeShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
];

const PRESET_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
  '#06b6d4', '#ec4899', '#14b8a6', '#a855f7', '#f97316',
  '#6366f1', '#22c55e', '#eab308', '#f43f5e', '#8b5cf6',
];

/**
 * NodeEditor Component
 * Allows creating new custom nodes or editing existing ones
 * Features:
 * - Shape selection
 * - Icon picker
 * - Color picker with presets
 * - Label and description editing
 */
export function NodeEditor({ existingNode, existingIconName, onSave, onCancel }: NodeEditorProps) {
  const [label, setLabel] = useState(existingNode?.label || '');
  const [description, setDescription] = useState(existingNode?.description || '');
  const [selectedIcon, setSelectedIcon] = useState(existingIconName || 'Box');
  const [selectedShape, setSelectedShape] = useState<NodeShape>(
    existingNode?.shape || 'rectangle'
  );
  const [color, setColor] = useState(existingNode?.color || '#8b5cf6');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      toast.error('Please enter a label');
      return;
    }

    // Get the icon component
    const IconComponent = (Icons as Record<string, unknown>)[selectedIcon] as NodeTypeConfig['icon'] || Icons.Box;

    const nodeType: NodeTypeConfig = {
      type: existingNode?.type || `Custom_${Date.now()}`,
      label: label.trim(),
      description: description.trim() || undefined,
      icon: IconComponent,
      category: 'custom',
      color,
      shape: selectedShape,
      isCustom: true,
    };

    onSave(nodeType, selectedIcon);
  };

  // Preview icon
  const PreviewIcon = (Icons as Record<string, unknown>)[selectedIcon] as React.ComponentType<{ size: number; color: string }> || Icons.Box;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Node Label *
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                     text-white placeholder-gray-500 focus:border-arch-primary 
                     focus:outline-none transition-colors"
          placeholder="Enter node label..."
          maxLength={50}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                     text-white placeholder-gray-500 focus:border-arch-primary 
                     focus:outline-none transition-colors resize-none"
          placeholder="Brief description..."
          rows={2}
          maxLength={200}
        />
      </div>

      {/* Shape Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Node Shape
        </label>
        <div className="grid grid-cols-5 gap-2">
          {SHAPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedShape(option.value)}
              className={`
                px-3 py-2 rounded-lg border-2 transition-all text-sm
                ${
                  selectedShape === option.value
                    ? 'border-arch-primary bg-arch-primary/10 text-white'
                    : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Icon
        </label>
        <button
          type="button"
          onClick={() => setShowIconPicker(!showIconPicker)}
          className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                     text-white flex items-center gap-3 hover:border-gray-600 transition-colors"
        >
          <PreviewIcon size={20} color={color} />
          <span>{selectedIcon}</span>
        </button>
        
        {showIconPicker && (
          <div className="mt-2 p-3 bg-arch-bg border border-arch-border rounded-lg
                          grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {AVAILABLE_ICONS.map((iconName) => {
              const IconComp = (Icons as Record<string, unknown>)[iconName] as React.ComponentType<{ size: number; className?: string }> || Icons.Box;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(iconName);
                    setShowIconPicker(false);
                  }}
                  className={`
                    p-2 rounded-lg transition-all flex items-center justify-center
                    ${selectedIcon === iconName
                      ? 'bg-arch-primary/20 border border-arch-primary'
                      : 'hover:bg-arch-surface-light border border-transparent'
                    }
                  `}
                  title={iconName}
                >
                  <IconComp size={20} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Node Color
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((presetColor, idx) => (
            <button
              key={`${presetColor}-${idx}`}
              type="button"
              onClick={() => setColor(presetColor)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${color === presetColor ? 'border-white scale-110' : 'border-transparent'}
              `}
              style={{ backgroundColor: presetColor }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Preview
        </label>
        <div className="p-4 bg-arch-bg rounded-lg flex justify-center">
          <div
            className={`
              px-4 py-3 border-2 flex items-center gap-3 min-w-[120px]
              ${selectedShape === 'rounded' ? 'rounded-2xl' : ''}
              ${selectedShape === 'circle' ? 'rounded-full aspect-square justify-center' : 'rounded-lg'}
              ${selectedShape === 'diamond' ? 'rotate-45' : ''}
            `}
            style={{
              borderColor: color,
              backgroundColor: `${color}10`,
            }}
          >
            <div 
              className={selectedShape === 'diamond' ? '-rotate-45 flex items-center gap-3' : 'flex items-center gap-3'}
            >
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: `${color}20` }}
              >
                <PreviewIcon size={20} color={color} />
              </div>
              <span className="text-white font-medium">
                {label || 'Node Label'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-arch-bg border border-arch-border rounded-lg
                     text-gray-300 hover:bg-arch-surface-light transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-arch-primary hover:bg-arch-primary/80
                     text-white rounded-lg transition-colors font-medium"
        >
          {existingNode ? 'Update Node' : 'Create Node'}
        </button>
      </div>
    </form>
  );
}

import { useFlowStore } from '@/store/flowStore';
import { TextAlignment, useGlobalSettingsStore } from '@/store/globalSettingsStore';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';

/**
 * Text Label Node Data
 */
export interface TextLabelData {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: TextAlignment;
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  borderColor: string;
  borderWidth: number;
  padding: number;
  autoFit: boolean;
  width?: number;
  height?: number;
}

const defaultTextLabelData: TextLabelData = {
  text: 'Double-click to edit',
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  textColor: '#ffffff',
  backgroundColor: 'transparent',
  backgroundOpacity: 100,
  borderColor: 'transparent',
  borderWidth: 0,
  padding: 12,
  autoFit: true,
};

/**
 * TextLabel Node Component
 * A text-only node for adding labels, annotations, and descriptions to the canvas.
 * Features:
 * - Inline text editing on double-click
 * - Text alignment options (left, center, right, justify)
 * - Auto-fit text to container when resized
 * - Customizable colors, fonts, and styling
 * - Resizable container
 */
function TextLabelNodeComponent({ id, data, selected }: NodeProps<TextLabelData>) {
  const { updateNode } = useFlowStore();
  
  // Merge with defaults
  const nodeData: TextLabelData = { ...defaultTextLabelData, ...data };
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(nodeData.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editText]);

  /**
   * Handle double-click to start editing
   */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(nodeData.text);
  }, [nodeData.text]);

  /**
   * Handle blur to save changes
   */
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editText !== nodeData.text) {
      updateNode(id, { text: editText } as Partial<TextLabelData>);
    }
  }, [id, editText, nodeData.text, updateNode]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(nodeData.text);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  }, [nodeData.text, handleBlur]);

  // Calculate auto-fit font size
  const autoFitFontSize = nodeData.autoFit && nodeData.width
    ? Math.min(nodeData.fontSize, Math.max(10, nodeData.width / 15))
    : nodeData.fontSize;

  // Background color with opacity
  const bgColor = nodeData.backgroundColor === 'transparent'
    ? 'transparent'
    : `${nodeData.backgroundColor}${Math.round(nodeData.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`;

  // Text alignment class
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[nodeData.textAlign];

  return (
    <>
      {/* Node Resizer */}
      <NodeResizer
        minWidth={50}
        minHeight={30}
        isVisible={selected}
        lineClassName="!border-arch-primary"
        handleClassName="!w-2 !h-2 !bg-arch-primary !border-arch-primary"
        onResize={(_, params) => {
          updateNode(id, {
            width: params.width,
            height: params.height,
          } as Partial<TextLabelData>);
        }}
      />
      
      <div
        ref={containerRef}
        className={`
          relative transition-all duration-200 cursor-text
          ${selected ? 'ring-2 ring-arch-primary ring-opacity-50' : ''}
        `}
        style={{
          backgroundColor: bgColor,
          borderColor: nodeData.borderColor,
          borderWidth: nodeData.borderWidth > 0 ? `${nodeData.borderWidth}px` : undefined,
          borderStyle: nodeData.borderWidth > 0 ? 'solid' : 'none',
          borderRadius: '4px',
          padding: `${nodeData.padding}px`,
          minWidth: '50px',
          minHeight: '30px',
          width: nodeData.width ? `${nodeData.width}px` : 'auto',
          height: nodeData.height ? `${nodeData.height}px` : 'auto',
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`
              w-full h-full bg-transparent border-none outline-none resize-none
              ${alignClass}
            `}
            style={{
              color: nodeData.textColor,
              fontSize: `${autoFitFontSize}px`,
              fontWeight: nodeData.fontWeight,
              fontStyle: nodeData.fontStyle,
              lineHeight: 1.5,
            }}
          />
        ) : (
          <div
            className={`
              whitespace-pre-wrap break-words select-none
              ${alignClass}
            `}
            style={{
              color: nodeData.textColor,
              fontSize: `${autoFitFontSize}px`,
              fontWeight: nodeData.fontWeight,
              fontStyle: nodeData.fontStyle,
              lineHeight: 1.5,
            }}
          >
            {nodeData.text || 'Double-click to edit'}
          </div>
        )}
      </div>
    </>
  );
}

export const TextLabelNode = memo(TextLabelNodeComponent);

/**
 * Text Label Property Panel Component
 * Editing panel for TextLabel nodes
 */
interface TextLabelPropertyPanelProps {
  nodeId: string;
  data: TextLabelData;
}

export function TextLabelPropertyPanel({ nodeId, data }: TextLabelPropertyPanelProps) {
  const { updateNode } = useFlowStore();
  const globalSettings = useGlobalSettingsStore();
  
  const nodeData: TextLabelData = { ...defaultTextLabelData, ...data };

  const handleUpdate = (key: keyof TextLabelData, value: unknown) => {
    updateNode(nodeId, { [key]: value } as Partial<TextLabelData>);
  };

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Text Content</label>
        <textarea
          value={nodeData.text}
          onChange={(e) => handleUpdate('text', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                     text-white text-sm focus:border-arch-primary focus:ring-1 
                     focus:ring-arch-primary outline-none transition-colors resize-none"
        />
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Font Size: {nodeData.fontSize}px
        </label>
        <input
          type="range"
          min={globalSettings.fontSizeRange.min}
          max={globalSettings.fontSizeRange.max}
          value={nodeData.fontSize}
          onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
          className="w-full accent-arch-primary"
        />
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Alignment</label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
            { value: 'justify', icon: AlignJustify },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleUpdate('textAlign', value as TextAlignment)}
              className={`
                flex-1 p-2 rounded-lg border transition-all
                ${nodeData.textAlign === value
                  ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                  : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                }
              `}
            >
              <Icon size={16} className="mx-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Font Weight</label>
        <div className="grid grid-cols-4 gap-1">
          {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
            <button
              key={weight}
              onClick={() => handleUpdate('fontWeight', weight)}
              className={`
                px-2 py-1.5 rounded border transition-all text-xs capitalize
                ${nodeData.fontWeight === weight
                  ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                  : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                }
              `}
            >
              {weight}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-fit Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`
              w-10 h-5 rounded-full transition-colors relative cursor-pointer
              ${nodeData.autoFit ? 'bg-arch-primary' : 'bg-arch-border'}
            `}
            onClick={() => handleUpdate('autoFit', !nodeData.autoFit)}
          >
            <div
              className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
                ${nodeData.autoFit ? 'translate-x-5' : 'translate-x-0.5'}
              `}
            />
          </div>
          <span className="text-sm text-gray-300">Auto-fit text to container</span>
        </label>
      </div>
    </div>
  );
}

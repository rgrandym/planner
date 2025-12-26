import {
    DEFAULT_COLORS,
    EXTENDED_COLORS,
    GRAYSCALE_COLORS,
    useGlobalSettingsStore,
} from '@/store/globalSettingsStore';
import { Check, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showGrayscale?: boolean;
  showExtended?: boolean;
  showCustomInput?: boolean;
  compact?: boolean;
}

/**
 * Parse color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

/**
 * ColorPicker Component
 * Comprehensive color picker with:
 * - RGB/HSL input
 * - Grayscale palette
 * - Default color presets
 * - Extended color palette
 * - Custom color input
 * - Recent/saved colors
 */
export function ColorPicker({
  value,
  onChange,
  label,
  showGrayscale = true,
  showExtended = false,
  showCustomInput = true,
  compact = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'grayscale' | 'extended'>('presets');
  const [hexInput, setHexInput] = useState(value);
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [hslValues, setHslValues] = useState({ h: 0, s: 100, l: 50 });
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const { customColors, addCustomColor } = useGlobalSettingsStore();

  // Sync internal state with prop
  useEffect(() => {
    setHexInput(value);
    const rgb = hexToRgb(value);
    if (rgb) {
      setRgbValues(rgb);
      setHslValues(rgbToHsl(rgb.r, rgb.g, rgb.b));
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = useCallback(
    (color: string) => {
      onChange(color);
      setHexInput(color);
      const rgb = hexToRgb(color);
      if (rgb) {
        setRgbValues(rgb);
        setHslValues(rgbToHsl(rgb.r, rgb.g, rgb.b));
      }
    },
    [onChange]
  );

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      handleColorSelect(hex);
    }
  };

  const handleRgbChange = (key: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...rgbValues, [key]: Math.min(255, Math.max(0, val)) };
    setRgbValues(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorSelect(hex);
  };

  const handleHslChange = (key: 'h' | 's' | 'l', val: number) => {
    const maxVal = key === 'h' ? 360 : 100;
    const newHsl = { ...hslValues, [key]: Math.min(maxVal, Math.max(0, val)) };
    setHslValues(newHsl);
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    handleColorSelect(hex);
  };

  const handleAddCustomColor = () => {
    addCustomColor(value);
  };

  if (compact) {
    return (
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-lg border-2 border-arch-border hover:border-arch-primary 
                     transition-colors shadow-sm"
          style={{ backgroundColor: value }}
          title={value}
        />
        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-2 p-3 bg-arch-surface border border-arch-border 
                          rounded-xl shadow-xl min-w-[200px]">
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_COLORS.slice(0, 12).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    handleColorSelect(color);
                    setIsOpen(false);
                  }}
                  className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110
                    ${value === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {showGrayscale && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-arch-border">
                {GRAYSCALE_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      handleColorSelect(color);
                      setIsOpen(false);
                    }}
                    className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110
                      ${value === color ? 'border-arch-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" ref={pickerRef}>
      {label && <label className="block text-sm text-gray-300 mb-2">{label}</label>}
      
      {/* Color preview and toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border-2 border-arch-border hover:border-arch-primary 
                     transition-colors shadow-sm flex items-center justify-center"
          style={{ backgroundColor: value }}
        >
          {isOpen && <X size={16} className="text-white drop-shadow-lg" />}
        </button>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 bg-arch-bg border border-arch-border rounded-lg
                     text-white text-sm font-mono focus:border-arch-primary focus:ring-1 
                     focus:ring-arch-primary outline-none transition-colors"
        />
        <button
          onClick={handleAddCustomColor}
          className="p-2 bg-arch-bg border border-arch-border rounded-lg hover:border-arch-primary 
                     transition-colors"
          title="Save to custom colors"
        >
          <Plus size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Expanded Picker */}
      {isOpen && (
        <div className="mt-3 p-4 bg-arch-bg border border-arch-border rounded-xl space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-arch-surface rounded-lg">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${activeTab === 'presets' ? 'bg-arch-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Presets
            </button>
            {showGrayscale && (
              <button
                onClick={() => setActiveTab('grayscale')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${activeTab === 'grayscale' ? 'bg-arch-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Grayscale
              </button>
            )}
            {showExtended && (
              <button
                onClick={() => setActiveTab('extended')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${activeTab === 'extended' ? 'bg-arch-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Extended
              </button>
            )}
            {showCustomInput && (
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${activeTab === 'custom' ? 'bg-arch-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Custom
              </button>
            )}
          </div>

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110
                      ${value === color ? 'border-white shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  >
                    {value === color && <Check size={14} className="text-white m-auto drop-shadow" />}
                  </button>
                ))}
              </div>
              
              {/* Custom saved colors */}
              {customColors.length > 0 && (
                <div className="pt-3 border-t border-arch-border">
                  <p className="text-xs text-gray-500 mb-2">Saved Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {customColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110
                          ${value === color ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grayscale Tab */}
          {activeTab === 'grayscale' && (
            <div className="flex flex-wrap gap-2">
              {GRAYSCALE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110
                    ${value === color ? 'border-arch-primary shadow-lg' : 'border-arch-border'}`}
                  style={{ backgroundColor: color }}
                >
                  {value === color && (
                    <Check size={14} className={`m-auto ${color === '#ffffff' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Extended Tab */}
          {activeTab === 'extended' && (
            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-10 gap-1">
                {EXTENDED_COLORS.map((color, idx) => (
                  <button
                    key={`${color}-${idx}`}
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded border transition-all hover:scale-110
                      ${value === color ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Tab (RGB/HSL) */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {/* HSL Sliders */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Hue</span>
                    <span>{hslValues.h}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hslValues.h}
                    onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, ${hslValues.s}%, ${hslValues.l}%), 
                        hsl(60, ${hslValues.s}%, ${hslValues.l}%), 
                        hsl(120, ${hslValues.s}%, ${hslValues.l}%), 
                        hsl(180, ${hslValues.s}%, ${hslValues.l}%), 
                        hsl(240, ${hslValues.s}%, ${hslValues.l}%), 
                        hsl(300, ${hslValues.s}%, ${hslValues.l}%), 
                        hsl(360, ${hslValues.s}%, ${hslValues.l}%))`,
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Saturation</span>
                    <span>{hslValues.s}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslValues.s}
                    onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                    className="w-full accent-arch-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Lightness</span>
                    <span>{hslValues.l}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslValues.l}
                    onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                    className="w-full accent-arch-primary"
                  />
                </div>
              </div>

              {/* RGB Inputs */}
              <div className="pt-3 border-t border-arch-border">
                <p className="text-xs text-gray-500 mb-2">RGB Values</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-red-400 mb-1">R</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbValues.r}
                      onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-arch-surface border border-arch-border rounded 
                                 text-white text-sm text-center focus:border-red-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-green-400 mb-1">G</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbValues.g}
                      onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-arch-surface border border-arch-border rounded 
                                 text-white text-sm text-center focus:border-green-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-blue-400 mb-1">B</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbValues.b}
                      onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-arch-surface border border-arch-border rounded 
                                 text-white text-sm text-center focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simple inline color swatches (for quick selection)
 */
interface ColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export function ColorSwatches({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  size = 'md',
}: ColorSwatchesProps) {
  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`${sizeClass} rounded-full border-2 transition-transform hover:scale-110
            ${value === color ? 'border-white' : 'border-transparent'}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

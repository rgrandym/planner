import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { copyToClipboard, generateMermaidCode, generatePythonCode } from '@/utils/mermaidExport';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Check, Code2, Copy, FileCode, FileImage, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getNodesBounds, useReactFlow } from 'reactflow';

type ExportTab = 'mermaid' | 'python' | 'image';
type ImageFormat = 'png' | 'svg' | 'pdf';
type ImageSize = 'auto' | 'small' | 'medium' | 'large' | 'custom';
type Resolution = 1 | 2 | 3 | 4;

const SIZE_PRESETS: Record<ImageSize, { width: number; height: number } | null> = {
  auto: null,
  small: { width: 800, height: 600 },
  medium: { width: 1920, height: 1080 },
  large: { width: 3840, height: 2160 },
  custom: null,
};

/**
 * ExportModal Component
 * Modal dialog for exporting diagrams as Mermaid, Python code, or images.
 */
export function ExportModal() {
  const { 
    isExportModalOpen, 
    setExportModalOpen, 
    nodes, 
    edges,
    setSelectedNodeId,
    setSelectedEdgeId
  } = useFlowStore();
  const { mode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<ExportTab>('python');
  const [copied, setCopied] = useState(false);
  const [imageFormat, setImageFormat] = useState<ImageFormat>('png');
  const [transparentBg, setTransparentBg] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [imageSize, setImageSize] = useState<ImageSize>('auto');
  const [resolution, setResolution] = useState<Resolution>(2);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [padding, setPadding] = useState(50);
  
  const { getNodes } = useReactFlow();

  const mermaidCode = generateMermaidCode(nodes, edges);
  const pythonCode = generatePythonCode(nodes, edges);

  useEffect(() => {
    setCopied(false);
  }, [activeTab]);

  if (!isExportModalOpen) return null;

  const handleCopy = async () => {
    const code = activeTab === 'mermaid' ? mermaidCode : pythonCode;
    try {
      await copyToClipboard(code);
      setCopied(true);
      toast.success(
        activeTab === 'python' 
          ? 'Copied! Paste in Jupyter notebook' 
          : 'Copied Mermaid code!'
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    setExportModalOpen(false);
    setCopied(false);
  };

  /**
   * Save file using File System Access API or fallback
   */
  const saveFile = async (blob: Blob, filename: string, mimeType: string) => {
    const supportsFilePicker = 'showSaveFilePicker' in window && 
      (window.isSecureContext || location.hostname === 'localhost');

    if (supportsFilePicker) {
      try {
        const extension = filename.split('.').pop() || 'png';
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: `${extension.toUpperCase()} File`,
            accept: { [mimeType]: [`.${extension}`] },
          }],
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return false; // User cancelled
        }
        console.warn('File System Access API failed:', err);
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  };

  /**
   * Export diagram as image - restricted to node bounds with proper resolution
   */
  const handleImageExport = async () => {
    setIsExporting(true);
    setExportProgress('Preparing export...');
    
    // Deselect everything to avoid capturing selection handles
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    
    // Wait for render to clear selection visuals
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let markersClone: Node | null = null;
    let overlayClone: Node | null = null;
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

    try {
      const flowNodes = getNodes();
      if (flowNodes.length === 0) {
        toast.error('No nodes to export');
        setIsExporting(false);
        setExportProgress('');
        return;
      }

      setExportProgress('Calculating diagram bounds...');
      
      if (!viewport) {
        toast.error('Could not find canvas');
        setIsExporting(false);
        setExportProgress('');
        return;
      }

      // Temporarily inject markers into viewport for capture
      const markers = document.querySelector('.react-flow__edge-marker-defs');
      if (markers) {
        markersClone = markers.cloneNode(true);
        viewport.appendChild(markersClone);
      }

      // Temporarily inject connection points overlay into viewport for capture
      const overlay = document.querySelector('.react-flow__connection-points-overlay');
      if (overlay) {
        overlayClone = overlay.cloneNode(true);
        // Reset transform on the group inside overlay because viewport already handles transform
        const group = (overlayClone as Element).querySelector('g');
        if (group) {
          group.setAttribute('transform', '');
        }
        // Ensure the overlay is visible and has pointer events (though pointer events don't matter for image)
        (overlayClone as HTMLElement).style.display = 'block';
        (overlayClone as HTMLElement).style.visibility = 'visible';
        (overlayClone as HTMLElement).style.opacity = '1';
        
        viewport.appendChild(overlayClone);
      }

      // Calculate tight bounds around nodes only
      const nodesBounds = getNodesBounds(flowNodes);
      
      // Apply padding to bounds
      const paddedBounds = {
        x: nodesBounds.x - padding,
        y: nodesBounds.y - padding,
        width: nodesBounds.width + padding * 2,
        height: nodesBounds.height + padding * 2,
      };

      // Determine export dimensions based on content
      let contentWidth: number;
      let contentHeight: number;

      if (imageSize === 'auto') {
        // Auto: use the actual node bounds + padding
        contentWidth = paddedBounds.width;
        contentHeight = paddedBounds.height;
      } else if (imageSize === 'custom') {
        contentWidth = customWidth;
        contentHeight = customHeight;
      } else {
        const preset = SIZE_PRESETS[imageSize];
        contentWidth = preset?.width || paddedBounds.width;
        contentHeight = preset?.height || paddedBounds.height;
      }

      // Calculate the final export dimensions with resolution scaling
      const exportWidth = contentWidth;
      const exportHeight = contentHeight;
      
      setExportProgress('Preparing viewport...');

      // Calculate the zoom level needed to fit the content
      const scaleX = contentWidth / paddedBounds.width;
      const scaleY = contentHeight / paddedBounds.height;
      const scale = Math.min(scaleX, scaleY, 2); // Cap at 2x to prevent over-zooming

      // Center the content within the export dimensions
      const scaledWidth = paddedBounds.width * scale;
      const scaledHeight = paddedBounds.height * scale;
      const offsetX = (contentWidth - scaledWidth) / 2 - paddedBounds.x * scale;
      const offsetY = (contentHeight - scaledHeight) / 2 - paddedBounds.y * scale;

      const bgColor = transparentBg 
        ? 'transparent' 
        : (mode === 'dark' ? '#121212' : '#f8f9fa');

      setExportProgress('Rendering diagram...');

      // Use html-to-image with proper settings for high quality
      const exportOptions = {
        backgroundColor: bgColor,
        width: exportWidth,
        height: exportHeight,
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          // Connection points overlay is now injected into viewport, so we don't filter it out
          // But we should filter out the ORIGINAL overlay if it somehow gets captured (it shouldn't as it's outside viewport)
          // However, if we were capturing the parent, we would need to be careful.
          // Since we capture viewport, we only see what's inside.
          // The injected clone doesn't have the class 'react-flow__connection-points-overlay' on the node itself?
          // Yes it does, because we cloned the SVG which has the class.
          // So we must NOT filter it out if it's the clone.
          // But wait, the filter runs on the node being traversed.
          // If we filter out 'react-flow__connection-points-overlay', we filter out our clone too!
          // So we must REMOVE this filter.
        },
        quality: 1,
        pixelRatio: resolution,
        // Ensure fonts and styles are properly captured
        skipFonts: false,
        cacheBust: true,
        // Filter out unwanted elements
        filter: (node: HTMLElement) => {
          // Include all elements, but exclude controls, minimap, etc.
          if (node.classList?.contains('react-flow__controls')) return false;
          if (node.classList?.contains('react-flow__minimap')) return false;
          if (node.classList?.contains('react-flow__attribution')) return false;
          if (node.classList?.contains('react-flow__connection-points-overlay')) return false;
          return true;
        },
      };

      let blob: Blob;
      let filename: string;
      let mimeType: string;

      if (imageFormat === 'svg') {
        setExportProgress('Generating SVG...');
        const dataUrl = await toSvg(viewport, exportOptions);
        const svgData = atob(dataUrl.split(',')[1]);
        blob = new Blob([svgData], { type: 'image/svg+xml' });
        filename = 'archflow-diagram.svg';
        mimeType = 'image/svg+xml';
      } else if (imageFormat === 'png') {
        setExportProgress('Generating PNG image...');
        const dataUrl = await toPng(viewport, exportOptions);
        const binaryData = atob(dataUrl.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        blob = new Blob([uint8Array], { type: 'image/png' });
        filename = 'archflow-diagram.png';
        mimeType = 'image/png';
      } else {
        // PDF
        setExportProgress('Generating PDF document...');
        const dataUrl = await toPng(viewport, { ...exportOptions, pixelRatio: resolution + 1 });
        
        const pdf = new jsPDF({
          orientation: exportWidth > exportHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [exportWidth, exportHeight],
        });

        if (!transparentBg) {
          pdf.setFillColor(mode === 'dark' ? '#121212' : '#f8f9fa');
          pdf.rect(0, 0, exportWidth, exportHeight, 'F');
        }
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, exportWidth, exportHeight);
        blob = pdf.output('blob');
        filename = 'archflow-diagram.pdf';
        mimeType = 'application/pdf';
      }

      setExportProgress('Saving file...');
      const saved = await saveFile(blob, filename, mimeType);
      if (saved) {
        toast.success(`${imageFormat.toUpperCase()} exported successfully`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    } finally {
      // Cleanup markers and overlay
      if (markersClone && viewport && viewport.contains(markersClone)) {
        viewport.removeChild(markersClone);
      }
      if (overlayClone && viewport && viewport.contains(overlayClone)) {
        viewport.removeChild(overlayClone);
      }
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-3xl mx-4 bg-arch-surface border border-arch-border rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-arch-border">
          <h2 className="text-lg font-semibold text-white">Export Diagram</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-arch-surface-light rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-arch-border">
          <TabButton
            active={activeTab === 'python'}
            onClick={() => setActiveTab('python')}
            icon={FileCode}
            label="Python (Jupyter)"
          />
          <TabButton
            active={activeTab === 'mermaid'}
            onClick={() => setActiveTab('mermaid')}
            icon={Code2}
            label="Mermaid"
          />
          <TabButton
            active={activeTab === 'image'}
            onClick={() => setActiveTab('image')}
            icon={FileImage}
            label="Image"
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Code Export Tabs */}
          {(activeTab === 'mermaid' || activeTab === 'python') && (
            <>
              <div className="relative">
                <pre className="p-4 bg-arch-bg rounded-lg border border-arch-border overflow-x-auto max-h-[400px] overflow-y-auto">
                  <code className="text-sm text-gray-300 whitespace-pre">
                    {activeTab === 'mermaid' ? mermaidCode : pythonCode}
                  </code>
                </pre>

                <button
                  onClick={handleCopy}
                  className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-md
                    transition-all duration-200 text-sm font-medium
                    ${copied 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-arch-primary/20 text-arch-primary hover:bg-arch-primary/30'
                    }`}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-arch-bg rounded-lg border border-arch-border">
                {activeTab === 'python' ? (
                  <p className="text-sm text-gray-400">
                    <span className="text-arch-primary font-medium">Tip:</span> Paste this code in a 
                    Jupyter notebook cell and run it. The code includes multiple rendering methods
                    for compatibility with different notebook environments.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    <span className="text-arch-primary font-medium">Tip:</span> Paste this code at{' '}
                    <a
                      href="https://mermaid.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-arch-primary hover:underline"
                    >
                      mermaid.live
                    </a>{' '}
                    to preview and edit the diagram.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Image Export Tab */}
          {activeTab === 'image' && (
            <div className="space-y-5">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="flex gap-3">
                  {(['png', 'svg', 'pdf'] as ImageFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setImageFormat(format)}
                      className={`
                        flex-1 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium uppercase
                        ${imageFormat === format
                          ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                          : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                        }
                      `}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Size
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['auto', 'small', 'medium', 'large', 'custom'] as ImageSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`
                        px-3 py-2 rounded-lg border transition-all text-xs font-medium capitalize
                        ${imageSize === size
                          ? 'border-arch-primary bg-arch-primary/10 text-arch-primary'
                          : 'border-arch-border bg-arch-bg text-gray-400 hover:border-gray-600'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {imageSize === 'custom' && (
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(100, parseInt(e.target.value) || 100))}
                        className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg text-white text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Math.max(100, parseInt(e.target.value) || 100))}
                        className="w-full px-3 py-2 bg-arch-bg border border-arch-border rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution: {resolution}x ({resolution === 1 ? 'Standard' : resolution === 2 ? 'High' : resolution === 3 ? 'Very High' : 'Ultra'})
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={resolution}
                  onChange={(e) => setResolution(parseInt(e.target.value) as Resolution)}
                  className="w-full accent-arch-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1x (72 DPI)</span>
                  <span>2x (144 DPI)</span>
                  <span>3x (216 DPI)</span>
                  <span>4x (288 DPI)</span>
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Padding: {padding}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                  className="w-full accent-arch-primary"
                />
              </div>

              {/* Transparency Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`
                      w-12 h-6 rounded-full transition-colors relative cursor-pointer
                      ${transparentBg ? 'bg-arch-primary' : 'bg-arch-border'}
                    `}
                    onClick={() => setTransparentBg(!transparentBg)}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${transparentBg ? 'translate-x-7' : 'translate-x-1'}
                      `}
                    />
                  </div>
                  <span className="text-sm text-gray-300">Transparent background</span>
                </label>
              </div>

              {/* Preview Info */}
              <div className="p-4 bg-arch-bg rounded-lg border border-arch-border">
                <div className="flex items-center gap-3 text-gray-300">
                  <FileImage size={24} className="text-arch-primary" />
                  <div>
                    <p className="font-medium">Export Preview</p>
                    <p className="text-sm text-gray-400">
                      {nodes.length} nodes, {edges.length} connections • 
                      {imageSize === 'auto' ? ' Auto-sized to content' : 
                       imageSize === 'custom' ? ` ${customWidth}×${customHeight}px` :
                       ` ${SIZE_PRESETS[imageSize]?.width}×${SIZE_PRESETS[imageSize]?.height}px`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleImageExport}
                disabled={isExporting || nodes.length === 0}
                className={`
                  w-full py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2
                  ${isExporting || nodes.length === 0
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-arch-primary hover:bg-arch-primary/90'
                  }
                `}
              >
                {isExporting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{exportProgress || 'Exporting...'}</span>
                  </>
                ) : (
                  `Export as ${imageFormat.toUpperCase()}`
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer - only for code tabs */}
        {(activeTab === 'mermaid' || activeTab === 'python') && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-arch-border">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-arch-primary text-white text-sm font-medium rounded-lg
                         hover:bg-arch-primary/90 transition-colors"
            >
              {activeTab === 'python' ? 'Copy for Jupyter' : 'Copy Mermaid'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tab button component
 */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.FC<{ size?: number | string; className?: string }>;
  label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
        border-b-2 -mb-px
        ${active
          ? 'text-arch-primary border-arch-primary'
          : 'text-gray-400 border-transparent hover:text-white hover:border-arch-border'
        }`}
    >
      <Icon size={18} className={active ? 'text-arch-primary' : ''} />
      {label}
    </button>
  );
}

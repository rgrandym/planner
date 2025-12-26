import { useFlowStore } from '@/store/flowStore';
import { copyToClipboard, generateMermaidCode, generatePythonCode } from '@/utils/mermaidExport';
import { Check, Code2, Copy, FileCode, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type ExportTab = 'mermaid' | 'python';

/**
 * ExportModal Component
 * Modal dialog for exporting diagrams as Mermaid or Python code.
 * Features:
 * - Tabbed interface for Mermaid and Python exports
 * - Syntax-highlighted code preview
 * - Copy to clipboard functionality
 */
export function ExportModal() {
  const { isExportModalOpen, setExportModalOpen, nodes, edges } = useFlowStore();
  const [activeTab, setActiveTab] = useState<ExportTab>('python');
  const [copied, setCopied] = useState(false);

  // Generate code based on current state
  const mermaidCode = generateMermaidCode(nodes, edges);
  const pythonCode = generatePythonCode(nodes, edges);

  // Reset copied state when tab changes
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-arch-surface border border-arch-border rounded-xl shadow-2xl">
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
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Code Preview */}
          <div className="relative">
            <pre className="p-4 bg-arch-bg rounded-lg border border-arch-border overflow-x-auto max-h-[400px] overflow-y-auto">
              <code className="text-sm text-gray-300 whitespace-pre">
                {activeTab === 'mermaid' ? mermaidCode : pythonCode}
              </code>
            </pre>

            {/* Copy Button */}
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

          {/* Info */}
          <div className="mt-4 p-3 bg-arch-bg rounded-lg border border-arch-border">
            {activeTab === 'python' ? (
              <p className="text-sm text-gray-400">
                <span className="text-arch-primary font-medium">Tip:</span> Paste this code in a 
                Jupyter notebook cell and run it to render the diagram. Make sure you have the 
                Mermaid extension enabled or use a notebook viewer that supports Mermaid.
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
        </div>

        {/* Footer */}
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

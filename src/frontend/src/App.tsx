import { Canvas, ErrorBoundary, PropertyPanel, SettingsModal, Sidebar } from '@/components';
import { EdgePropertyPanel } from '@/components/EdgePropertyPanel';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { useUIStore } from '@/store/uiStore';
import { Maximize2, Minimize2, PanelLeft, PanelRight } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from 'reactflow';

/**
 * App Component
 * Main application layout with three-column structure:
 * - Left: Node library sidebar (toggleable)
 * - Center: React Flow canvas
 * - Right: Property panel (visible when node selected or pinned) or Edge panel
 */
function App() {
  const { isSettingsModalOpen, setSettingsModalOpen, selectedEdgeId, selectedNodeId } = useFlowStore();
  const { mode } = useThemeStore();
  const { 
    isLeftSidebarVisible, 
    isRightPanelVisible, 
    isPropertyPanelPinned,
    isFullViewMode,
    toggleLeftSidebar,
    toggleRightPanel,
    toggleFullViewMode,
  } = useUIStore();

  // Determine if right panel should show
  // Always show if an edge is selected, regardless of pin state
  const showRightPanel = isRightPanelVisible && (
    selectedEdgeId || 
    selectedNodeId || 
    isPropertyPanelPinned
  );

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <div className={`h-full w-full flex overflow-hidden fixed inset-0 ${
          mode === 'dark' 
            ? 'dark bg-arch-bg text-white' 
            : 'light bg-arch-bg-light text-arch-text-light'
        }`}>
          {/* Left Sidebar - Node Library */}
          {isLeftSidebarVisible && !isFullViewMode && <Sidebar />}

          {/* Main Canvas Area */}
          <div className="flex-1 relative">
            <Canvas />
            
            {/* Floating Panel Controls - positioned below toolbar */}
            <div className="absolute top-14 left-4 z-20 flex gap-2">
              {!isFullViewMode && (
                <button
                  onClick={toggleLeftSidebar}
                  className={`p-2 rounded-lg transition-colors shadow-lg
                    ${mode === 'dark' 
                      ? 'bg-arch-surface hover:bg-arch-surface-light border border-arch-border' 
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }
                    ${!isLeftSidebarVisible ? 'ring-2 ring-arch-primary' : ''}
                  `}
                  title={isLeftSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                >
                  <PanelLeft size={18} className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
                </button>
              )}
              
              <button
                onClick={toggleFullViewMode}
                className={`p-2 rounded-lg transition-colors shadow-lg
                  ${mode === 'dark' 
                    ? 'bg-arch-surface hover:bg-arch-surface-light border border-arch-border' 
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }
                  ${isFullViewMode ? 'ring-2 ring-arch-primary' : ''}
                `}
                title={isFullViewMode ? 'Exit full view' : 'Full view'}
              >
                {isFullViewMode 
                  ? <Minimize2 size={18} className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
                  : <Maximize2 size={18} className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
                }
              </button>
            </div>

            {/* Right Panel Toggle (when hidden) - positioned below toolbar */}
            {!isFullViewMode && !isRightPanelVisible && (
              <button
                onClick={toggleRightPanel}
                className={`absolute top-14 right-4 z-20 p-2 rounded-lg transition-colors shadow-lg
                  ${mode === 'dark' 
                    ? 'bg-arch-surface hover:bg-arch-surface-light border border-arch-border' 
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }
                  ring-2 ring-arch-primary
                `}
                title="Show property panel"
              >
                <PanelRight size={18} className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            )}
          </div>

          {/* Right Sidebar - Property Panel or Edge Panel */}
          {showRightPanel && !isFullViewMode && (
            <div className="absolute right-0 top-0 h-full z-50 shadow-xl">
              {selectedEdgeId ? <EdgePropertyPanel /> : <PropertyPanel />}
            </div>
          )}

          {/* Settings Modal */}
          <SettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setSettingsModalOpen(false)} 
          />

          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: mode === 'dark' ? {
                background: '#1e1e1e',
                color: '#fff',
                border: '1px solid #333',
              } : {
                background: '#ffffff',
                color: '#212529',
                border: '1px solid #dee2e6',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                },
              },
            }}
          />
        </div>
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}

export default App;

import { Canvas, ErrorBoundary, PropertyPanel, SettingsModal, Sidebar } from '@/components';
import { EdgePropertyPanel } from '@/components/EdgePropertyPanel';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from 'reactflow';

/**
 * App Component
 * Main application layout with three-column structure:
 * - Left: Node library sidebar
 * - Center: React Flow canvas
 * - Right: Property panel (visible when node selected) or Edge panel (when edge selected)
 */
function App() {
  const { isSettingsModalOpen, setSettingsModalOpen, selectedEdgeId } = useFlowStore();
  const { mode } = useThemeStore();

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <div className={`h-screen w-screen flex overflow-hidden ${
          mode === 'dark' 
            ? 'bg-arch-bg' 
            : 'bg-arch-bg-light'
        }`}>
          {/* Left Sidebar - Node Library */}
          <Sidebar />

          {/* Main Canvas Area */}
          <Canvas />

          {/* Right Sidebar - Property Panel or Edge Panel */}
          {selectedEdgeId ? <EdgePropertyPanel /> : <PropertyPanel />}

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

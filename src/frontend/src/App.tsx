import { Canvas, ErrorBoundary, PropertyPanel, Sidebar } from '@/components';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from 'reactflow';

/**
 * App Component
 * Main application layout with three-column structure:
 * - Left: Node library sidebar
 * - Center: React Flow canvas
 * - Right: Property panel (visible when node selected)
 */
function App() {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <div className="h-screen w-screen flex bg-arch-bg overflow-hidden">
          {/* Left Sidebar - Node Library */}
          <Sidebar />

          {/* Main Canvas Area */}
          <Canvas />

          {/* Right Sidebar - Property Panel */}
          <PropertyPanel />

          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e1e1e',
                color: '#fff',
                border: '1px solid #333',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#1e1e1e',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1e1e1e',
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

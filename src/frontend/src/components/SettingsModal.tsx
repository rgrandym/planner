import { useCustomNodesStore } from '@/store/customNodesStore';
import { useThemeStore } from '@/store/themeStore';
import { NodeTypeConfig } from '@/types';
import { Moon, Plus, Sun, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { NodeEditor } from './NodeEditor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'custom-nodes';

/**
 * SettingsModal Component
 * Provides access to application settings:
 * - General: Theme switcher, preferences
 * - Custom Nodes: Create and manage custom node types
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeTypeConfig | null>(null);

  const { mode, toggleMode } = useThemeStore();
  const { customNodes, addCustomNode, updateCustomNode, deleteCustomNode, getIconName } =
    useCustomNodesStore();

  if (!isOpen) return null;

  const handleSaveNode = (node: NodeTypeConfig, iconName: string) => {
    if (editingNode) {
      updateCustomNode(editingNode.type, node, iconName);
      toast.success('Node updated successfully');
      setEditingNode(null);
    } else {
      addCustomNode(node, iconName);
      toast.success('Custom node created');
      setIsCreatingNode(false);
    }
  };

  const handleDeleteNode = (type: string) => {
    if (confirm('Are you sure you want to delete this custom node?')) {
      deleteCustomNode(type);
      toast.success('Custom node deleted');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-arch-surface 
                      rounded-xl shadow-2xl border border-arch-border flex flex-col
                      dark:bg-arch-surface dark:border-arch-border
                      light:bg-arch-surface-light-mode light:border-arch-border-light">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-arch-border
                        dark:border-arch-border light:border-arch-border-light">
          <h2 className="text-2xl font-bold text-white dark:text-white light:text-arch-text-light">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-arch-surface-light rounded-lg transition-colors
                       dark:hover:bg-arch-surface-light light:hover:bg-arch-surface-hover-light"
          >
            <X size={20} className="text-gray-400 dark:text-gray-400 light:text-arch-text-secondary-light" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-arch-border px-6 dark:border-arch-border light:border-arch-border-light">
          <button
            onClick={() => setActiveTab('general')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm
              ${
                activeTab === 'general'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('custom-nodes')}
            className={`
              px-4 py-3 border-b-2 transition-colors font-medium text-sm
              ${
                activeTab === 'custom-nodes'
                  ? 'border-arch-primary text-arch-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 light:text-arch-text-secondary-light'
              }
            `}
          >
            Custom Nodes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme Switcher */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 dark:text-white light:text-arch-text-light">
                  Appearance
                </h3>
                <div className="flex items-center justify-between p-4 bg-arch-bg 
                                rounded-lg border border-arch-border
                                dark:bg-arch-bg dark:border-arch-border
                                light:bg-arch-bg-light light:border-arch-border-light">
                  <div className="flex items-center gap-3">
                    {mode === 'dark' ? (
                      <Moon size={20} className="text-arch-primary" />
                    ) : (
                      <Sun size={20} className="text-arch-primary" />
                    )}
                    <div>
                      <p className="font-medium text-white dark:text-white light:text-arch-text-light">
                        Theme Mode
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-arch-text-secondary-light">
                        Currently using {mode} mode
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMode}
                    className="px-4 py-2 bg-arch-primary hover:bg-arch-primary/80
                               text-white rounded-lg transition-colors font-medium"
                  >
                    Switch to {mode === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 dark:text-white light:text-arch-text-light">
                  About
                </h3>
                <div className="p-4 bg-arch-bg rounded-lg border border-arch-border
                                dark:bg-arch-bg dark:border-arch-border
                                light:bg-arch-bg-light light:border-arch-border-light">
                  <p className="text-gray-300 dark:text-gray-300 light:text-arch-text-light">
                    <strong>ArchFlow</strong> - Visual Architecture Designer
                  </p>
                  <p className="text-sm text-gray-400 mt-2 dark:text-gray-400 light:text-arch-text-secondary-light">
                    Create beautiful architecture diagrams with ease
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Nodes Tab */}
          {activeTab === 'custom-nodes' && (
            <div className="space-y-4">
              {!isCreatingNode && !editingNode && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white dark:text-white light:text-arch-text-light">
                        Custom Node Types
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 dark:text-gray-400 light:text-arch-text-secondary-light">
                        Create and manage your custom node types
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreatingNode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-arch-primary 
                                 hover:bg-arch-primary/80 text-white rounded-lg 
                                 transition-colors font-medium"
                    >
                      <Plus size={18} />
                      New Node
                    </button>
                  </div>

                  {/* Custom Nodes List */}
                  {customNodes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-400 light:text-arch-text-secondary-light">
                      <p>No custom nodes yet.</p>
                      <p className="text-sm mt-2">
                        Click "New Node" to create your first custom node type.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {customNodes.map((node) => {
                        const Icon = node.icon;
                        return (
                          <div
                            key={node.type}
                            className="p-4 bg-arch-bg rounded-lg border border-arch-border
                                       hover:border-gray-600 transition-colors group
                                       dark:bg-arch-bg dark:border-arch-border
                                       light:bg-arch-bg-light light:border-arch-border-light"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="p-2 rounded"
                                  style={{ backgroundColor: `${node.color}20` }}
                                >
                                  <Icon size={20} color={node.color} />
                                </div>
                                <div>
                                  <p className="font-medium text-white dark:text-white light:text-arch-text-light">
                                    {node.label}
                                  </p>
                                  {node.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-400 light:text-arch-text-secondary-light">
                                      {node.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingNode(node)}
                                className="flex-1 px-3 py-1.5 bg-arch-surface hover:bg-arch-surface-light
                                           text-white text-sm rounded transition-colors
                                           dark:bg-arch-surface dark:hover:bg-arch-surface-light
                                           light:bg-white light:hover:bg-gray-100 light:text-arch-text-light"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNode(node.type)}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30
                                           text-red-400 text-sm rounded transition-colors
                                           flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Node Editor */}
              {(isCreatingNode || editingNode) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 dark:text-white light:text-arch-text-light">
                    {editingNode ? 'Edit Node Type' : 'Create New Node Type'}
                  </h3>
                  <NodeEditor
                    existingNode={editingNode || undefined}
                    existingIconName={editingNode ? getIconName(editingNode.type) : undefined}
                    onSave={handleSaveNode}
                    onCancel={() => {
                      setIsCreatingNode(false);
                      setEditingNode(null);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

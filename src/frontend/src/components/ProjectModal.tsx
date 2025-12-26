import { hydrateNodeData, useFlowStore } from '@/store/flowStore';
import { SavedProject, useProjectStore } from '@/store/projectStore';
import { ArchNodeData } from '@/types';
import {
    Check,
    Copy,
    Edit2,
    FolderOpen,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Node } from 'reactflow';

/**
 * ProjectModal Component
 * Modal for managing multiple canvases/projects.
 * Features:
 * - Create new projects
 * - Save current canvas to project
 * - Load existing projects
 * - Delete/duplicate projects
 * - Rename projects
 */
export function ProjectModal() {
  const { isProjectModalOpen, setProjectModalOpen, nodes, edges, viewport, loadCanvas, isDirty } =
    useFlowStore();
  const {
    projects,
    activeProjectId,
    createProject,
    saveProject,
    loadProject,
    deleteProject,
    duplicateProject,
    renameProject,
    setHasUnsavedChanges,
  } = useProjectStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isProjectModalOpen) return null;

  /**
   * Create a new project
   */
  const handleCreateProject = () => {
    const name = newProjectName.trim() || `Project ${projects.length + 1}`;
    createProject(name);
    setNewProjectName('');
    toast.success(`Created "${name}"`);
    
    // Load the new empty project
    loadCanvas([], [], { x: 0, y: 0, zoom: 1 });
  };

  /**
   * Save current canvas to active project
   */
  const handleSaveProject = () => {
    if (!activeProjectId) {
      // Create new project with current canvas
      const name = `Project ${projects.length + 1}`;
      const id = createProject(name);
      saveProject(id, nodes, edges, viewport);
      toast.success(`Saved as "${name}"`);
    } else {
      saveProject(activeProjectId, nodes, edges, viewport);
      const project = projects.find((p) => p.id === activeProjectId);
      toast.success(`Saved "${project?.name}"`);
    }
    setHasUnsavedChanges(false);
  };

  /**
   * Load a project
   */
  const handleLoadProject = (id: string) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Load anyway?')) {
        return;
      }
    }

    const project = loadProject(id);
    if (project) {
      // Hydrate nodes with icons
      const hydratedNodes = (project.nodes as unknown as Node<Omit<ArchNodeData, 'icon'>>[]).map(
        (node) => ({
          ...node,
          data: hydrateNodeData(node.data as Omit<ArchNodeData, 'icon'>),
        })
      ) as Node<ArchNodeData>[];

      loadCanvas(hydratedNodes, project.edges, project.viewport);
      toast.success(`Loaded "${project.name}"`);
      setProjectModalOpen(false);
    }
  };

  /**
   * Delete a project
   */
  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
      if (activeProjectId === id) {
        loadCanvas([], [], { x: 0, y: 0, zoom: 1 });
      }
      toast.success(`Deleted "${name}"`);
    }
  };

  /**
   * Start editing a project name
   */
  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  /**
   * Finish editing a project name
   */
  const finishEditing = () => {
    if (editingId && editingName.trim()) {
      renameProject(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  /**
   * Format relative time
   */
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setProjectModalOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-arch-surface border border-arch-border rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-arch-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen size={20} className="text-arch-primary" />
            Projects
          </h2>
          <button
            onClick={() => setProjectModalOpen(false)}
            className="p-1 hover:bg-arch-surface-light rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create New Project */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New project name..."
                className="flex-1 px-4 py-2 bg-arch-bg border border-arch-border rounded-lg
                           text-white text-sm placeholder-gray-500
                           focus:border-arch-primary focus:ring-1 focus:ring-arch-primary outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-arch-primary text-white text-sm font-medium rounded-lg
                           hover:bg-arch-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                New
              </button>
            </div>
          </div>

          {/* Save Current Canvas */}
          {nodes.length > 0 && (
            <div className="mb-6 p-4 bg-arch-bg rounded-lg border border-arch-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">
                    Current Canvas
                    {isDirty && (
                      <span className="ml-2 text-xs text-amber-400">(unsaved)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {nodes.length} nodes, {edges.length} connections
                  </p>
                </div>
                <button
                  onClick={handleSaveProject}
                  className="px-4 py-2 bg-green-500/20 text-green-400 text-sm font-medium rounded-lg
                             hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Project List */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Saved Projects ({projects.length})
            </h3>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen size={40} className="mx-auto mb-3 opacity-50" />
                <p>No saved projects yet</p>
                <p className="text-xs mt-1">Create a new project to get started</p>
              </div>
            ) : (
              projects
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isActive={project.id === activeProjectId}
                    isEditing={editingId === project.id}
                    editingName={editingName}
                    onLoad={() => handleLoadProject(project.id)}
                    onDelete={() => handleDeleteProject(project.id, project.name)}
                    onDuplicate={() => {
                      duplicateProject(project.id);
                      toast.success(`Duplicated "${project.name}"`);
                    }}
                    onStartEdit={() => startEditing(project.id, project.name)}
                    onEditNameChange={setEditingName}
                    onFinishEdit={finishEditing}
                    formatTime={formatRelativeTime}
                  />
                ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-arch-border flex justify-end">
          <button
            onClick={() => setProjectModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual project item component
 */
interface ProjectItemProps {
  project: SavedProject;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartEdit: () => void;
  onEditNameChange: (name: string) => void;
  onFinishEdit: () => void;
  formatTime: (timestamp: number) => string;
}

function ProjectItem({
  project,
  isActive,
  isEditing,
  editingName,
  onLoad,
  onDelete,
  onDuplicate,
  onStartEdit,
  onEditNameChange,
  onFinishEdit,
  formatTime,
}: ProjectItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-colors cursor-pointer group
        ${
          isActive
            ? 'bg-arch-primary/10 border-arch-primary/50'
            : 'bg-arch-bg border-arch-border hover:border-arch-primary/30'
        }`}
      onClick={onLoad}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange(e.target.value)}
                className="px-2 py-1 bg-arch-surface border border-arch-border rounded
                           text-white text-sm focus:border-arch-primary outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onFinishEdit();
                  if (e.key === 'Escape') onFinishEdit();
                }}
                onBlur={onFinishEdit}
              />
              <button
                onClick={onFinishEdit}
                className="p-1 hover:bg-arch-surface-light rounded"
              >
                <Check size={14} className="text-green-400" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-white truncate">{project.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {project.nodes.length} nodes • Updated {formatTime(project.updatedAt)}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onStartEdit}
            className="p-1.5 hover:bg-arch-surface-light rounded transition-colors"
            title="Rename"
          >
            <Edit2 size={14} className="text-gray-400" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-1.5 hover:bg-arch-surface-light rounded transition-colors"
            title="Duplicate"
          >
            <Copy size={14} className="text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { LucideIcon } from 'lucide-react';
import { Edge, Node } from 'reactflow';

/**
 * Node category types for the sidebar palette
 */
export type NodeCategory = 
  | 'ai-ml'
  | 'database'
  | 'storage'
  | 'data-types'
  | 'logic'
  | 'infrastructure'
  | 'integrations'
  | 'communication';

/**
 * Configuration for a node type in the palette
 */
export interface NodeTypeConfig {
  /** Unique identifier for the node type */
  type: string;
  /** Display label for the node */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Category this node belongs to */
  category: NodeCategory;
  /** Color associated with this node type */
  color: string;
  /** Optional description shown in property panel */
  description?: string;
}

/**
 * Data stored within a custom node
 */
export interface ArchNodeData {
  /** Display label */
  label: string;
  /** Node type identifier */
  nodeType: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Primary color for the node */
  color: string;
  /** Category for grouping */
  category: NodeCategory;
  /** User-editable description */
  description?: string;
  /** Optional metadata fields based on node type */
  metadata?: Record<string, string>;
  /** Custom border color override */
  borderColor?: string;
  /** Background opacity (0-100) */
  opacity?: number;
  /** Label font size (12-24) */
  fontSize?: number;
  /** Icon size (12-40) */
  iconSize?: number;
}

/**
 * Custom node type extending React Flow's Node
 */
export type ArchNode = Node<ArchNodeData>;

/**
 * Custom edge type extending React Flow's Edge
 */
export type ArchEdge = Edge & {
  /** Whether the edge is animated */
  animated?: boolean;
  /** Edge style customization */
  style?: React.CSSProperties;
};

/**
 * Graph state for persistence
 */
export interface GraphState {
  nodes: ArchNode[];
  edges: ArchEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

/**
 * Context menu state
 */
export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string | null;
  edgeId: string | null;
}

/**
 * Category configuration for sidebar
 */
export interface CategoryConfig {
  id: NodeCategory;
  label: string;
  color: string;
  nodes: NodeTypeConfig[];
}

/**
 * Mermaid shape function type
 */
export type MermaidShapeFunction = (id: string, label: string) => string;

/**
 * Mermaid export options
 */
export interface MermaidExportOptions {
  /** Direction of the graph (LR, TB, RL, BT) */
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  /** Include style definitions */
  includeStyles?: boolean;
  /** Wrap in Python code for Jupyter */
  wrapForJupyter?: boolean;
}

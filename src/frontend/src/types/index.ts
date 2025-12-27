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
  | 'communication'
  | 'processing'
  | 'memory'
  | 'tools'
  | 'annotations'
  | 'custom';

/**
 * Available node shapes
 */
export type NodeShape = 
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'hexagon'
  | 'rounded';

/**
 * A single line of label text with its own font size
 */
export interface LabelLine {
  /** The text content for this line */
  text: string;
  /** Font size in pixels for this line */
  fontSize: number;
  /** Font weight for this line */
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

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
  /** Optional shape override */
  shape?: NodeShape;
  /** Whether this is a custom user-created node */
  isCustom?: boolean;
  /** Whether this is a text label node (uses TextLabelNode component) */
  isTextLabel?: boolean;
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
  /** Border thickness (1-8) */
  borderWidth?: number;
  /** Background opacity (0-100) */
  opacity?: number;
  /** Label font size (12-24) */
  fontSize?: number;
  /** Icon size (12-40) */
  iconSize?: number;
  /** Node shape */
  shape?: NodeShape;
  /** Custom width (50-400) */
  width?: number;
  /** Custom height (50-400) */
  height?: number;
  /** Multi-line label support - array of lines with individual font sizes */
  labelLines?: LabelLine[];
}

/**
 * Edge line style types
 */
export type EdgeLineStyle = 'solid' | 'dashed' | 'dotted';

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
  /** Edge line style */
  data?: {
    lineStyle?: EdgeLineStyle;
    strokeWidth?: number;
  };
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

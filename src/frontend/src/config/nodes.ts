import { CategoryConfig, NodeCategory, NodeTypeConfig } from '@/types';
import {
    Bot,
    Braces,
    Brain,
    Circle,
    Clock,
    Cloud,
    Cpu,
    Cylinder,
    Database,
    FileCode,
    FileText,
    Filter,
    GitBranch,
    GitMerge,
    Globe,
    HardDrive,
    Hash,
    Image,
    Layers,
    List,
    Mail,
    Map,
    MessageSquare,
    Puzzle,
    RotateCw,
    Server,
    Share2,
    Table,
    ToggleLeft,
    Type,
    User,
    Users,
    Warehouse,
    Webhook,
    Zap,
} from 'lucide-react';

/**
 * Color mapping for each category
 */
export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  'ai-ml': '#8b5cf6',
  'database': '#3b82f6',
  'storage': '#10b981',
  'data-types': '#ef4444',
  'logic': '#f59e0b',
  'infrastructure': '#06b6d4',
  'integrations': '#ec4899',
  'communication': '#14b8a6',
};

/**
 * All available node types organized by category
 */
export const NODE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'ai-ml',
    label: 'AI & ML',
    color: CATEGORY_COLORS['ai-ml'],
    nodes: [
      { type: 'LLM', label: 'LLM', icon: Brain, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'Agent', label: 'AI Agent', icon: Bot, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'VectorDB', label: 'Vector DB', icon: Database, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'ModelTraining', label: 'Model Training', icon: Cpu, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'InferenceAPI', label: 'Inference API', icon: Zap, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'PromptTemplate', label: 'Prompt Template', icon: FileText, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'RAG', label: 'RAG Pipeline', icon: Layers, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
    ],
  },
  {
    id: 'database',
    label: 'Databases',
    color: CATEGORY_COLORS['database'],
    nodes: [
      { type: 'GenericDB', label: 'Generic Database', icon: Database, category: 'database', color: CATEGORY_COLORS['database'] },
      { type: 'PostgreSQL', label: 'PostgreSQL', icon: Database, category: 'database', color: CATEGORY_COLORS['database'] },
      { type: 'MySQL', label: 'MySQL', icon: Cylinder, category: 'database', color: CATEGORY_COLORS['database'] },
      { type: 'MongoDB', label: 'MongoDB', icon: HardDrive, category: 'database', color: CATEGORY_COLORS['database'] },
      { type: 'Redis', label: 'Redis', icon: Circle, category: 'database', color: CATEGORY_COLORS['database'] },
      { type: 'Snowflake', label: 'Snowflake', icon: Warehouse, category: 'database', color: CATEGORY_COLORS['database'] },
      { type: 'SQLite', label: 'SQLite', icon: Cylinder, category: 'database', color: CATEGORY_COLORS['database'] },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    color: CATEGORY_COLORS['integrations'],
    nodes: [
      { type: 'GoogleDrive', label: 'Google Drive', icon: Cloud, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
      { type: 'Dropbox', label: 'Dropbox', icon: Cloud, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
      { type: 'Notion', label: 'Notion', icon: FileCode, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
      { type: 'Slack', label: 'Slack', icon: MessageSquare, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
      { type: 'Zapier', label: 'Zapier', icon: Zap, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
      { type: 'Webhook', label: 'Webhook', icon: Webhook, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
      { type: 'OAuth', label: 'OAuth Provider', icon: User, category: 'integrations', color: CATEGORY_COLORS['integrations'] },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    color: CATEGORY_COLORS['communication'],
    nodes: [
      { type: 'Email', label: 'Email', icon: Mail, category: 'communication', color: CATEGORY_COLORS['communication'] },
      { type: 'SMS', label: 'SMS', icon: MessageSquare, category: 'communication', color: CATEGORY_COLORS['communication'] },
      { type: 'Chat', label: 'Chat', icon: MessageSquare, category: 'communication', color: CATEGORY_COLORS['communication'] },
      { type: 'Website', label: 'Website', icon: Globe, category: 'communication', color: CATEGORY_COLORS['communication'] },
      { type: 'SocialMedia', label: 'Social Media', icon: Share2, category: 'communication', color: CATEGORY_COLORS['communication'] },
      { type: 'Users', label: 'Users/Audience', icon: Users, category: 'communication', color: CATEGORY_COLORS['communication'] },
    ],
  },
  {
    id: 'storage',
    label: 'Storage',
    color: CATEGORY_COLORS['storage'],
    nodes: [
      { type: 'PDF', label: 'PDF', icon: FileText, category: 'storage', color: CATEGORY_COLORS['storage'] },
      { type: 'CSV', label: 'CSV', icon: Table, category: 'storage', color: CATEGORY_COLORS['storage'] },
      { type: 'JSON', label: 'JSON', icon: Braces, category: 'storage', color: CATEGORY_COLORS['storage'] },
      { type: 'ImageFile', label: 'Image', icon: Image, category: 'storage', color: CATEGORY_COLORS['storage'] },
      { type: 'Markdown', label: 'Markdown', icon: FileCode, category: 'storage', color: CATEGORY_COLORS['storage'] },
      { type: 'S3Bucket', label: 'S3 Bucket', icon: Cloud, category: 'storage', color: CATEGORY_COLORS['storage'] },
    ],
  },
  {
    id: 'data-types',
    label: 'Data Types',
    color: CATEGORY_COLORS['data-types'],
    nodes: [
      { type: 'String', label: 'String', icon: Type, category: 'data-types', color: CATEGORY_COLORS['data-types'] },
      { type: 'Integer', label: 'Integer', icon: Hash, category: 'data-types', color: CATEGORY_COLORS['data-types'] },
      { type: 'Boolean', label: 'Boolean', icon: ToggleLeft, category: 'data-types', color: CATEGORY_COLORS['data-types'] },
      { type: 'Array', label: 'Array', icon: List, category: 'data-types', color: CATEGORY_COLORS['data-types'] },
      { type: 'Dictionary', label: 'Dictionary', icon: Map, category: 'data-types', color: CATEGORY_COLORS['data-types'] },
    ],
  },
  {
    id: 'logic',
    label: 'Logic/Flow',
    color: CATEGORY_COLORS['logic'],
    nodes: [
      { type: 'Router', label: 'Router (IF/Else)', icon: GitBranch, category: 'logic', color: CATEGORY_COLORS['logic'] },
      { type: 'Loop', label: 'Loop', icon: RotateCw, category: 'logic', color: CATEGORY_COLORS['logic'] },
      { type: 'Wait', label: 'Wait/Delay', icon: Clock, category: 'logic', color: CATEGORY_COLORS['logic'] },
      { type: 'Filter', label: 'Filter', icon: Filter, category: 'logic', color: CATEGORY_COLORS['logic'] },
      { type: 'Merge', label: 'Merge', icon: GitMerge, category: 'logic', color: CATEGORY_COLORS['logic'] },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    color: CATEGORY_COLORS['infrastructure'],
    nodes: [
      { type: 'WebServer', label: 'Web Server', icon: Server, category: 'infrastructure', color: CATEGORY_COLORS['infrastructure'] },
      { type: 'APIGateway', label: 'API Gateway', icon: Globe, category: 'infrastructure', color: CATEGORY_COLORS['infrastructure'] },
      { type: 'MessageQueue', label: 'Message Queue', icon: MessageSquare, category: 'infrastructure', color: CATEGORY_COLORS['infrastructure'] },
      { type: 'Lambda', label: 'Lambda/Function', icon: Zap, category: 'infrastructure', color: CATEGORY_COLORS['infrastructure'] },
      { type: 'Microservice', label: 'Microservice', icon: Puzzle, category: 'infrastructure', color: CATEGORY_COLORS['infrastructure'] },
      { type: 'LoadBalancer', label: 'Load Balancer', icon: Share2, category: 'infrastructure', color: CATEGORY_COLORS['infrastructure'] },
    ],
  },
];

/**
 * Flat map of all node types for quick lookup
 */
export const NODE_TYPE_MAP: Record<string, NodeTypeConfig> = NODE_CATEGORIES.reduce(
  (acc, category) => {
    category.nodes.forEach((node) => {
      acc[node.type] = node;
    });
    return acc;
  },
  {} as Record<string, NodeTypeConfig>
);

/**
 * Get node configuration by type
 * @param type - The node type identifier
 * @returns NodeTypeConfig or undefined
 */
export function getNodeConfig(type: string): NodeTypeConfig | undefined {
  return NODE_TYPE_MAP[type];
}

/**
 * Get all nodes for a specific category
 * @param category - The category to filter by
 * @returns Array of NodeTypeConfig
 */
export function getNodesByCategory(category: NodeCategory): NodeTypeConfig[] {
  const categoryConfig = NODE_CATEGORIES.find((c) => c.id === category);
  return categoryConfig?.nodes || [];
}

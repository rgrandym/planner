import { CategoryConfig, NodeCategory, NodeTypeConfig } from '@/types';
import {
    Binary,
    Bot,
    Braces,
    Brain,
    Calculator,
    Circle,
    Clock,
    Cloud,
    Cpu,
    Cylinder,
    Database,
    Eye,
    FileCode,
    FileSearch,
    FileText,
    Filter,
    FormInput,
    GitBranch,
    GitMerge,
    Globe,
    Hammer,
    HardDrive,
    Hash,
    Image,
    Layers,
    LayoutGrid,
    List,
    Mail,
    Map,
    MemoryStick,
    MessageSquare,
    Puzzle,
    RotateCw,
    ScanText,
    Server,
    Settings,
    Share2,
    Sigma,
    Sparkles,
    Table,
    Terminal,
    TextCursorInput,
    ToggleLeft,
    Type,
    User,
    Users,
    Video,
    Wand2,
    Warehouse,
    Webhook,
    Wrench,
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
  'processing': '#f97316',
  'memory': '#22d3ee',
  'tools': '#a3e635',
  'custom': '#a855f7',
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
      { type: 'VLM', label: 'Vision LM (VLM)', icon: Eye, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'Embedding', label: 'Embeddings', icon: Binary, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
      { type: 'FineTuning', label: 'Fine-Tuning', icon: Wand2, category: 'ai-ml', color: CATEGORY_COLORS['ai-ml'] },
    ],
  },
  {
    id: 'processing',
    label: 'Processing',
    color: CATEGORY_COLORS['processing'],
    nodes: [
      { type: 'OCR', label: 'OCR', icon: ScanText, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'TextProcessing', label: 'Text Processing', icon: TextCursorInput, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'ImageProcessing', label: 'Image Processing', icon: Sparkles, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'VideoProcessing', label: 'Video Processing', icon: Video, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'TableExtraction', label: 'Table Extraction', icon: LayoutGrid, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'FormulaParser', label: 'Formula Parser', icon: Sigma, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'DataParser', label: 'Data Parser', icon: FileSearch, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'Calculator', label: 'Calculator', icon: Calculator, category: 'processing', color: CATEGORY_COLORS['processing'] },
      { type: 'FormExtraction', label: 'Form Extraction', icon: FormInput, category: 'processing', color: CATEGORY_COLORS['processing'] },
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
  {
    id: 'memory',
    label: 'Memory',
    color: CATEGORY_COLORS['memory'],
    nodes: [
      { type: 'ShortTermMemory', label: 'Short-Term Memory', icon: MemoryStick, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'LongTermMemory', label: 'Long-Term Memory', icon: Database, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'WorkingMemory', label: 'Working Memory', icon: Cpu, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'EpisodicMemory', label: 'Episodic Memory', icon: Clock, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'SemanticMemory', label: 'Semantic Memory', icon: Brain, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'ContextWindow', label: 'Context Window', icon: Layers, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'ConversationBuffer', label: 'Conversation Buffer', icon: MessageSquare, category: 'memory', color: CATEGORY_COLORS['memory'] },
      { type: 'SummaryMemory', label: 'Summary Memory', icon: FileText, category: 'memory', color: CATEGORY_COLORS['memory'] },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Utilities',
    color: CATEGORY_COLORS['tools'],
    nodes: [
      { type: 'SearchTool', label: 'Search Tool', icon: FileSearch, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'CodeExecutor', label: 'Code Executor', icon: Terminal, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'FileManager', label: 'File Manager', icon: FileCode, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'WebBrowser', label: 'Web Browser', icon: Globe, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'Calculator', label: 'Calculator Tool', icon: Calculator, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'APITool', label: 'API Tool', icon: Webhook, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'CustomTool', label: 'Custom Tool', icon: Wrench, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'Retriever', label: 'Retriever', icon: FileSearch, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'Orchestrator', label: 'Orchestrator', icon: Settings, category: 'tools', color: CATEGORY_COLORS['tools'] },
      { type: 'ToolChain', label: 'Tool Chain', icon: Hammer, category: 'tools', color: CATEGORY_COLORS['tools'] },
    ],
  },
];

/**
 * Flat map of all node types for quick lookup
 * Note: Custom nodes are added dynamically via customNodesStore
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
 * Get node configuration by type (including custom nodes)
 * @param type - The node type identifier
 * @param customNodes - Array of custom nodes from store
 * @returns NodeTypeConfig or undefined
 */
export function getNodeConfig(
  type: string,
  customNodes?: NodeTypeConfig[]
): NodeTypeConfig | undefined {
  // First check built-in nodes
  const builtIn = NODE_TYPE_MAP[type];
  if (builtIn) return builtIn;

  // Then check custom nodes
  if (customNodes) {
    return customNodes.find((node) => node.type === type);
  }

  return undefined;
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

// Core Agent Framework Types
export type AgentId = string;
export type TaskId = string;
export type MessageId = string;

// Base interfaces
export interface BaseConfig {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Agent State and Status
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  EXECUTING = 'executing',
  WAITING = 'waiting',
  ERROR = 'error',
  COMPLETED = 'completed'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Message and Communication
export interface Message {
  id: MessageId;
  from: AgentId;
  to: AgentId | 'broadcast';
  content: string;
  type: 'text' | 'task' | 'result' | 'error' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Task Definition
export interface Task {
  id: TaskId;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: AgentId;
  dependencies: TaskId[];
  requiredCapabilities: string[];
  input?: any;
  output?: any;
  error?: string;
  progress: number; // 0-100
  estimatedDuration?: number; // milliseconds
  actualDuration?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

// Agent Capabilities and Skills
export interface Capability {
  name: string;
  description: string;
  version: string;
  parameters?: Record<string, any>;
}

export interface AgentSkills {
  reasoning: number; // 0-1
  creativity: number; // 0-1
  analysis: number; // 0-1
  communication: number; // 0-1
  problemSolving: number; // 0-1
  domainExpertise: Record<string, number>; // domain -> proficiency
}

// LLM Provider Types
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'llama' | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retries?: number;
}

export interface LLMResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

// Agent Configuration
export interface AgentConfig extends BaseConfig {
  type: 'autonomous' | 'reactive' | 'collaborative' | 'specialized';
  capabilities: Capability[];
  skills: AgentSkills;
  llmConfig: LLMConfig;
  memoryConfig: MemoryConfig;
  behaviorConfig: BehaviorConfig;
  constraints?: AgentConstraints;
}

export interface BehaviorConfig {
  autonomyLevel: number; // 0-1
  collaborationStyle: 'competitive' | 'cooperative' | 'neutral';
  communicationFrequency: 'low' | 'medium' | 'high';
  decisionMaking: 'cautious' | 'balanced' | 'aggressive';
  learningRate: number; // 0-1
}

export interface AgentConstraints {
  maxTasksPerHour?: number;
  maxConcurrentTasks?: number;
  allowedOperations?: string[];
  forbiddenOperations?: string[];
  resourceLimits?: {
    memory?: number;
    cpu?: number;
    tokens?: number;
  };
  timeConstraints?: {
    maxTaskDuration?: number;
    workingHours?: { start: string; end: string };
    timezone?: string;
  };
}

// Memory and Context
export interface MemoryConfig {
  type: 'persistent' | 'session' | 'hybrid';
  maxSize?: number;
  retentionPolicy?: 'fifo' | 'lru' | 'priority';
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

export interface MemoryEntry {
  id: string;
  agentId: AgentId;
  type: 'experience' | 'knowledge' | 'context' | 'result';
  content: any;
  importance: number; // 0-1
  accessibility: 'private' | 'shared' | 'public';
  tags: string[];
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Decision Making
export interface DecisionContext {
  currentTask?: Task;
  availableTasks: Task[];
  agentState: AgentStatus;
  resources: ResourceMetrics;
  constraints: AgentConstraints;
  history: DecisionHistory[];
  swarmState?: SwarmState;
}

export interface DecisionHistory {
  id: string;
  timestamp: Date;
  decision: string;
  context: any;
  outcome: 'success' | 'failure' | 'partial';
  score?: number; // 0-1
  learningPoints?: string[];
}

// Swarm Coordination
export interface SwarmConfig {
  id: string;
  name: string;
  topology: 'hierarchical' | 'mesh' | 'ring' | 'star' | 'hybrid';
  coordinationStrategy: 'centralized' | 'distributed' | 'hybrid';
  maxAgents: number;
  communicationProtocol: 'direct' | 'broadcast' | 'gossip';
  consensusAlgorithm?: 'majority' | 'weighted' | 'unanimous';
  loadBalancing: 'round_robin' | 'capability_based' | 'dynamic';
}

export interface SwarmState {
  id: string;
  status: 'initializing' | 'active' | 'degraded' | 'offline';
  agents: AgentId[];
  activeTasks: TaskId[];
  completedTasks: TaskId[];
  metrics: SwarmMetrics;
  coordination: CoordinationState;
}

export interface SwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  tasksCompleted: number;
  averageTaskTime: number;
  successRate: number;
  efficiency: number; // 0-1
  resourceUtilization: ResourceMetrics;
}

export interface CoordinationState {
  leader?: AgentId;
  coordinators: AgentId[];
  communicationGraph: Record<AgentId, AgentId[]>;
  consensusState?: any;
  lastSynchronization: Date;
}

// Resource Management
export interface ResourceMetrics {
  cpu: number; // 0-1
  memory: number; // bytes
  storage: number; // bytes
  network: number; // bytes/second
  tokens: number;
  cost: number; // monetary units
}

// Planning and Strategy
export interface Plan {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  dependencies: Record<TaskId, TaskId[]>;
  estimatedDuration: number;
  requiredResources: ResourceMetrics;
  contingencies: ContingencyPlan[];
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
  createdBy: AgentId;
  createdAt: Date;
}

export interface ContingencyPlan {
  condition: string;
  trigger: any;
  actions: Task[];
  priority: number;
}

// Blockchain and Wallet Integration
export interface BlockchainConfig {
  network: 'mainnet' | 'testnet' | 'localnet';
  rpcUrl: string;
  chainId: number;
  walletConfig: WalletConfig;
}

export interface WalletConfig {
  type: 'evm' | 'cosmos' | 'solana';
  privateKey?: string;
  mnemonic?: string;
  address?: string;
  derivationPath?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockNumber?: number;
}

// Event System
export interface AgentEvent {
  id: string;
  type: string;
  agentId: AgentId;
  data: any;
  timestamp: Date;
  source: string;
}

export type EventHandler<T = any> = (event: AgentEvent & { data: T }) => void | Promise<void>;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Export all types
export * from './agent';
export * from './llm';
export * from './memory';
export * from './swarm';
export * from './blockchain';
import { AgentId, TaskId, MessageId, AgentStatus, Task, Message, LLMConfig, MemoryConfig, BehaviorConfig, AgentConstraints, Capability, AgentSkills, ResourceMetrics, DecisionContext, DecisionHistory } from './index';

// Agent Interface
export interface IAgent {
  readonly id: AgentId;
  readonly config: AgentConfig;
  status: AgentStatus;
  
  // Core Methods
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Task Management
  executeTask(task: Task): Promise<any>;
  canExecuteTask(task: Task): boolean;
  getCurrentTasks(): Task[];
  
  // Communication
  sendMessage(message: Message): Promise<void>;
  receiveMessage(message: Message): Promise<void>;
  
  // Decision Making
  makeDecision(context: DecisionContext): Promise<string>;
  
  // Memory Management
  remember(key: string, value: any, importance?: number): Promise<void>;
  recall(key: string): Promise<any>;
  forget(key: string): Promise<void>;
  
  // Learning and Adaptation
  learn(experience: any): Promise<void>;
  updateSkills(skills: Partial<AgentSkills>): Promise<void>;
  
  // Metrics and Monitoring
  getMetrics(): ResourceMetrics;
  getStatus(): AgentStatus;
}

// Agent Configuration
export interface AgentConfig {
  id: AgentId;
  name: string;
  description?: string;
  type: 'autonomous' | 'reactive' | 'collaborative' | 'specialized';
  capabilities: Capability[];
  skills: AgentSkills;
  llmConfig: LLMConfig;
  memoryConfig: MemoryConfig;
  behaviorConfig: BehaviorConfig;
  constraints?: AgentConstraints;
  createdAt: Date;
  updatedAt: Date;
}

// Agent Factory Configuration
export interface AgentFactoryConfig {
  defaultLLMConfig: LLMConfig;
  defaultMemoryConfig: MemoryConfig;
  defaultBehaviorConfig: BehaviorConfig;
  templates: Record<string, Partial<AgentConfig>>;
}

// Agent Lifecycle Events
export interface AgentLifecycleEvents {
  beforeInitialize?: () => Promise<void>;
  afterInitialize?: () => Promise<void>;
  beforeShutdown?: () => Promise<void>;
  afterShutdown?: () => Promise<void>;
  beforeTaskExecution?: (task: Task) => Promise<void>;
  afterTaskExecution?: (task: Task, result: any) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

// Agent Performance Metrics
export interface AgentPerformanceMetrics {
  tasksCompleted: number;
  tasksSuccessful: number;
  tasksFailed: number;
  averageTaskTime: number;
  totalExecutionTime: number;
  messagesProcessed: number;
  decisionsCorrect: number;
  decisionsIncorrect: number;
  learningRate: number;
  adaptationScore: number;
  collaborationScore: number;
  resourceEfficiency: number;
  costPerTask: number;
  uptime: number;
  errorRate: number;
  memoryUsage: number;
  tokenUsage: number;
  lastActive: Date;
  performanceHistory: PerformanceSnapshot[];
}

export interface PerformanceSnapshot {
  timestamp: Date;
  metrics: Omit<AgentPerformanceMetrics, 'performanceHistory'>;
  context?: any;
}

// Specialized Agent Types
export interface AnalystAgent extends IAgent {
  analyzeData(data: any): Promise<any>;
  generateInsights(data: any): Promise<string[]>;
  createReport(insights: string[]): Promise<string>;
}

export interface CoordinatorAgent extends IAgent {
  assignTask(task: Task, agentId: AgentId): Promise<void>;
  monitorProgress(): Promise<void>;
  resolveConflicts(conflicts: any[]): Promise<void>;
  optimizeWorkload(): Promise<void>;
}

export interface ExecutorAgent extends IAgent {
  executeCommand(command: string): Promise<any>;
  validateResult(result: any): Promise<boolean>;
  rollback(taskId: TaskId): Promise<void>;
}

export interface CommunicatorAgent extends IAgent {
  broadcast(message: string): Promise<void>;
  negotiate(proposal: any): Promise<any>;
  translate(message: string, targetLanguage: string): Promise<string>;
  summarize(content: string): Promise<string>;
}

// Agent Registry
export interface AgentRegistry {
  register(agent: IAgent): Promise<void>;
  unregister(agentId: AgentId): Promise<void>;
  find(agentId: AgentId): Promise<IAgent | null>;
  findByCapability(capability: string): Promise<IAgent[]>;
  findByType(type: string): Promise<IAgent[]>;
  list(): Promise<IAgent[]>;
  count(): Promise<number>;
}

// Agent Network
export interface AgentNetwork {
  addAgent(agent: IAgent): Promise<void>;
  removeAgent(agentId: AgentId): Promise<void>;
  connectAgents(agentId1: AgentId, agentId2: AgentId): Promise<void>;
  disconnectAgents(agentId1: AgentId, agentId2: AgentId): Promise<void>;
  getConnections(agentId: AgentId): Promise<AgentId[]>;
  broadcastMessage(message: Message, exclude?: AgentId[]): Promise<void>;
  routeMessage(message: Message): Promise<void>;
  getNetworkTopology(): Promise<Record<AgentId, AgentId[]>>;
}
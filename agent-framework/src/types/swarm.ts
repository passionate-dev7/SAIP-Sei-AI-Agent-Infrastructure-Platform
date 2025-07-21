import { AgentId, TaskId, MessageId, Task, Message, ResourceMetrics } from './index';

// Swarm Coordination Types
export interface SwarmCoordinator {
  readonly id: string;
  readonly config: SwarmConfig;
  
  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Agent Management
  addAgent(agentId: AgentId): Promise<void>;
  removeAgent(agentId: AgentId): Promise<void>;
  getAgents(): Promise<AgentId[]>;
  getAgentStatus(agentId: AgentId): Promise<AgentSwarmStatus>;
  
  // Task Coordination
  assignTask(task: Task): Promise<AgentId | null>;
  redistributeTasks(): Promise<void>;
  getTaskAssignments(): Promise<Record<TaskId, AgentId>>;
  
  // Communication
  broadcastMessage(message: Message, exclude?: AgentId[]): Promise<void>;
  routeMessage(message: Message): Promise<void>;
  establishConnection(from: AgentId, to: AgentId): Promise<void>;
  
  // Coordination Strategies
  electLeader(): Promise<AgentId>;
  reachConsensus(proposal: any): Promise<boolean>;
  synchronize(): Promise<void>;
  
  // Monitoring
  getSwarmState(): Promise<SwarmState>;
  getMetrics(): Promise<SwarmMetrics>;
  healthCheck(): Promise<HealthStatus>;
}

export interface SwarmConfig {
  id: string;
  name: string;
  description?: string;
  topology: SwarmTopology;
  coordinationStrategy: CoordinationStrategy;
  maxAgents: number;
  minAgents?: number;
  communicationProtocol: CommunicationProtocol;
  consensusAlgorithm?: ConsensusAlgorithm;
  loadBalancing: LoadBalancingStrategy;
  failureHandling: FailureHandlingStrategy;
  scalingPolicy?: ScalingPolicy;
  constraints?: SwarmConstraints;
  createdAt: Date;
  updatedAt: Date;
}

export enum SwarmTopology {
  HIERARCHICAL = 'hierarchical',
  MESH = 'mesh',
  RING = 'ring',
  STAR = 'star',
  TREE = 'tree',
  HYBRID = 'hybrid'
}

export enum CoordinationStrategy {
  CENTRALIZED = 'centralized',
  DISTRIBUTED = 'distributed',
  HIERARCHICAL = 'hierarchical',
  PEER_TO_PEER = 'peer_to_peer',
  HYBRID = 'hybrid'
}

export enum CommunicationProtocol {
  DIRECT = 'direct',
  BROADCAST = 'broadcast',
  MULTICAST = 'multicast',
  GOSSIP = 'gossip',
  FLOODING = 'flooding',
  ROUTING = 'routing'
}

export enum ConsensusAlgorithm {
  MAJORITY = 'majority',
  WEIGHTED = 'weighted',
  UNANIMOUS = 'unanimous',
  RAFT = 'raft',
  PBFT = 'pbft',
  POW = 'pow',
  POS = 'pos'
}

export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  CAPABILITY_BASED = 'capability_based',
  RESOURCE_BASED = 'resource_based',
  DYNAMIC = 'dynamic',
  PREDICTIVE = 'predictive'
}

export enum FailureHandlingStrategy {
  IGNORE = 'ignore',
  RETRY = 'retry',
  REDISTRIBUTE = 'redistribute',
  FAILOVER = 'failover',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
  CIRCUIT_BREAKER = 'circuit_breaker'
}

export interface ScalingPolicy {
  autoScalingEnabled: boolean;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  maxScaleUpRate: number;
  maxScaleDownRate: number;
  targetUtilization: number;
  predictiveScaling?: boolean;
}

export interface SwarmConstraints {
  maxConcurrentTasks?: number;
  maxResourceUsage?: ResourceMetrics;
  allowedOperations?: string[];
  forbiddenOperations?: string[];
  networkConstraints?: {
    maxLatency: number;
    maxBandwidth: number;
    allowedProtocols: string[];
  };
  securityConstraints?: {
    requireAuthentication: boolean;
    requireEncryption: boolean;
    allowedAgentTypes: string[];
  };
}

export interface SwarmState {
  id: string;
  status: SwarmStatus;
  agents: AgentSwarmStatus[];
  activeTasks: TaskId[];
  completedTasks: TaskId[];
  failedTasks: TaskId[];
  metrics: SwarmMetrics;
  coordination: CoordinationState;
  topology: TopologyState;
  resources: SwarmResourceState;
  lastUpdated: Date;
}

export enum SwarmStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  DEGRADED = 'degraded',
  RECOVERING = 'recovering',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

export interface AgentSwarmStatus {
  agentId: AgentId;
  status: 'active' | 'idle' | 'busy' | 'error' | 'offline';
  role?: SwarmRole;
  capabilities: string[];
  currentTasks: TaskId[];
  completedTasks: number;
  failedTasks: number;
  resourceUsage: ResourceMetrics;
  lastHeartbeat: Date;
  connectionQuality: number; // 0-1
  reputation: number; // 0-1
}

export enum SwarmRole {
  LEADER = 'leader',
  COORDINATOR = 'coordinator',
  WORKER = 'worker',
  SPECIALIST = 'specialist',
  BACKUP = 'backup'
}

export interface CoordinationState {
  leader?: AgentId;
  coordinators: AgentId[];
  communicationGraph: Record<AgentId, AgentId[]>;
  consensusState?: any;
  lastSynchronization: Date;
  syncInProgress: boolean;
  pendingDecisions: PendingDecision[];
  votingInProgress: boolean;
}

export interface PendingDecision {
  id: string;
  type: string;
  proposal: any;
  votes: Record<AgentId, boolean>;
  deadline: Date;
  requiredConsensus: number; // 0-1
}

export interface TopologyState {
  type: SwarmTopology;
  connections: Connection[];
  clusters?: Cluster[];
  hierarchy?: HierarchyLevel[];
  routing: RoutingTable;
}

export interface Connection {
  from: AgentId;
  to: AgentId;
  type: 'direct' | 'indirect' | 'virtual';
  quality: number; // 0-1
  latency: number;
  bandwidth: number;
  established: Date;
  lastUsed: Date;
  messageCount: number;
}

export interface Cluster {
  id: string;
  agents: AgentId[];
  coordinator: AgentId;
  purpose: string;
  created: Date;
}

export interface HierarchyLevel {
  level: number;
  agents: AgentId[];
  coordinator: AgentId;
  parentLevel?: number;
  childLevels: number[];
}

export interface RoutingTable {
  routes: Record<AgentId, Route[]>;
  defaultRoute?: Route;
  lastUpdated: Date;
}

export interface Route {
  destination: AgentId;
  nextHop: AgentId;
  cost: number;
  hops: number;
  reliability: number;
}

export interface SwarmResourceState {
  total: ResourceMetrics;
  available: ResourceMetrics;
  allocated: Record<AgentId, ResourceMetrics>;
  utilization: number; // 0-1
  efficiency: number; // 0-1
  bottlenecks: string[];
  predictions: ResourcePrediction[];
}

export interface ResourcePrediction {
  timestamp: Date;
  metric: keyof ResourceMetrics;
  predicted: number;
  confidence: number;
  factors: string[];
}

export interface SwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  busyAgents: number;
  errorAgents: number;
  offlineAgents: number;
  
  tasksCompleted: number;
  tasksFailed: number;
  tasksInProgress: number;
  tasksPending: number;
  
  averageTaskTime: number;
  medianTaskTime: number;
  taskThroughput: number; // tasks per second
  successRate: number;
  failureRate: number;
  
  efficiency: number; // 0-1
  utilization: number; // 0-1
  loadBalance: number; // 0-1 (1 = perfect balance)
  
  communicationStats: CommunicationStats;
  resourceStats: ResourceStats;
  performanceStats: PerformanceStats;
  
  uptime: number;
  availability: number; // 0-1
  reliability: number; // 0-1
  
  lastUpdated: Date;
}

export interface CommunicationStats {
  messagesTotal: number;
  messagesPerSecond: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  messageLoss: number; // 0-1
  protocolDistribution: Record<string, number>;
  bandwidthUsage: number;
}

export interface ResourceStats {
  cpuUsage: number; // 0-1
  memoryUsage: number; // bytes
  storageUsage: number; // bytes
  networkUsage: number; // bytes/second
  tokenUsage: number;
  cost: number;
  efficiency: number; // output per resource unit
}

export interface PerformanceStats {
  responseTime: PerformanceMetric;
  throughput: PerformanceMetric;
  errorRate: PerformanceMetric;
  availability: PerformanceMetric;
}

export interface PerformanceMetric {
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  history: Array<{ timestamp: Date; value: number }>;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'offline';
  components: Record<string, ComponentHealth>;
  issues: HealthIssue[];
  recommendations: string[];
  lastCheck: Date;
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  metric?: number;
  threshold?: number;
  message?: string;
  lastCheck: Date;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  detected: Date;
  resolved?: Date;
}

// Swarm Formation and Evolution
export interface SwarmFormation {
  formSwarm(agents: AgentId[], config: SwarmConfig): Promise<string>;
  disbandSwarm(swarmId: string): Promise<void>;
  mergeSwarms(swarmIds: string[]): Promise<string>;
  splitSwarm(swarmId: string, criteria: any): Promise<string[]>;
  evolveTopology(swarmId: string, targetTopology: SwarmTopology): Promise<void>;
}

export interface SwarmOptimizer {
  optimizeTopology(swarm: SwarmState): Promise<SwarmConfig>;
  optimizeTaskAssignment(tasks: Task[], agents: AgentSwarmStatus[]): Promise<Record<TaskId, AgentId>>;
  optimizeResourceAllocation(swarm: SwarmState): Promise<Record<AgentId, ResourceMetrics>>;
  optimizeCommunication(swarm: SwarmState): Promise<CommunicationOptimization>;
}

export interface CommunicationOptimization {
  recommendedProtocol: CommunicationProtocol;
  routingOptimizations: RoutingOptimization[];
  bandwidthOptimizations: BandwidthOptimization[];
  latencyImprovements: LatencyImprovement[];
}

export interface RoutingOptimization {
  from: AgentId;
  to: AgentId;
  currentPath: AgentId[];
  optimizedPath: AgentId[];
  improvement: number; // cost reduction
}

export interface BandwidthOptimization {
  connection: Connection;
  currentBandwidth: number;
  recommendedBandwidth: number;
  reason: string;
}

export interface LatencyImprovement {
  connection: Connection;
  currentLatency: number;
  targetLatency: number;
  techniques: string[];
}

// Swarm Learning and Adaptation
export interface SwarmLearning {
  learnFromExperience(experience: SwarmExperience): Promise<void>;
  adaptTopology(performance: SwarmMetrics): Promise<SwarmConfig>;
  adaptTaskAssignment(history: TaskAssignmentHistory[]): Promise<LoadBalancingStrategy>;
  shareKnowledge(from: AgentId, to: AgentId[], knowledge: any): Promise<void>;
}

export interface SwarmExperience {
  id: string;
  swarmId: string;
  situation: any;
  action: any;
  outcome: any;
  performance: SwarmMetrics;
  lessons: string[];
  timestamp: Date;
}

export interface TaskAssignmentHistory {
  taskId: TaskId;
  agentId: AgentId;
  assignedAt: Date;
  completedAt?: Date;
  duration?: number;
  success: boolean;
  performance: number;
  resourceUsage: ResourceMetrics;
}
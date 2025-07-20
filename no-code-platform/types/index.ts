// Core types for the no-code platform

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  capabilities: Capability[];
  configuration: AgentConfiguration;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  tags: string[];
  author: string;
  isTemplate: boolean;
  templateId?: string;
  collaborators: string[];
}

export interface AgentConfiguration {
  triggers: Trigger[];
  actions: Action[];
  conditions: Condition[];
  variables: Variable[];
  settings: Record<string, any>;
  integrations: Integration[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  connections: Connection[];
  status: WorkflowStatus;
  deploymentConfig: DeploymentConfig;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  collaborators: string[];
  analytics: WorkflowAnalytics;
}

export interface Connection {
  id: string;
  source: {
    agentId: string;
    outputKey: string;
  };
  target: {
    agentId: string;
    inputKey: string;
  };
  transform?: DataTransform;
  condition?: Condition;
}

export interface Trigger {
  id: string;
  type: TriggerType;
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface Action {
  id: string;
  type: ActionType;
  configuration: Record<string, any>;
  enabled: boolean;
  retryConfig?: RetryConfig;
}

export interface Condition {
  id: string;
  expression: string;
  description: string;
}

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  value: any;
  description: string;
  scope: VariableScope;
}

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
  status: IntegrationStatus;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  examples: CapabilityExample[];
}

export interface CapabilityExample {
  id: string;
  name: string;
  input: any;
  output: any;
  description: string;
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  scaling: ScalingConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetCPU: number;
  targetMemory: number;
  autoScaling: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  alerting: AlertConfig[];
  metrics: MetricConfig[];
}

export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  channels: NotificationChannel[];
}

export interface MetricConfig {
  id: string;
  name: string;
  type: MetricType;
  aggregation: AggregationType;
}

export interface SecurityConfig {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  encryption: EncryptionConfig;
}

export interface WorkflowAnalytics {
  executions: number;
  successRate: number;
  averageExecutionTime: number;
  errorRate: number;
  performance: PerformanceMetrics;
  costs: CostMetrics;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  throughput: number;
  latency: number;
}

export interface CostMetrics {
  totalCost: number;
  costPerExecution: number;
  breakdown: CostBreakdown;
}

export interface CostBreakdown {
  compute: number;
  storage: number;
  network: number;
  thirdParty: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  agent: Agent;
  tags: string[];
  rating: number;
  downloads: number;
  author: string;
  price: number;
  currency: string;
  preview: TemplatePreview;
  documentation: string;
}

export interface TemplatePreview {
  images: string[];
  video?: string;
  demoUrl?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  status: ABTestStatus;
  trafficSplit: Record<string, number>;
  metrics: ABTestMetrics;
  startDate: Date;
  endDate?: Date;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  agent: Agent;
  configuration: AgentConfiguration;
}

export interface ABTestMetrics {
  conversions: number;
  clickThroughRate: number;
  engagementRate: number;
  customMetrics: Record<string, number>;
}

export interface ABTestResults {
  winner?: string;
  confidence: number;
  summary: string;
  recommendations: string[];
}

export interface Collaboration {
  id: string;
  workflowId: string;
  members: CollaborationMember[];
  permissions: CollaborationPermissions;
  comments: Comment[];
  changes: ChangeLog[];
}

export interface CollaborationMember {
  userId: string;
  username: string;
  role: CollaborationRole;
  joinedAt: Date;
  lastActive: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  position?: CommentPosition;
  createdAt: Date;
  replies: Comment[];
}

export interface CommentPosition {
  agentId: string;
  x: number;
  y: number;
}

export interface ChangeLog {
  id: string;
  userId: string;
  action: ChangeAction;
  target: ChangeTarget;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface VersionControl {
  id: string;
  workflowId: string;
  versions: WorkflowVersion[];
  branches: Branch[];
  currentVersion: string;
}

export interface WorkflowVersion {
  id: string;
  version: string;
  description: string;
  author: string;
  createdAt: Date;
  workflow: Workflow;
  changes: VersionChange[];
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: Date;
  baseVersion: string;
  currentVersion: string;
}

export interface VersionChange {
  type: 'added' | 'modified' | 'deleted';
  target: ChangeTarget;
  description: string;
}

export interface MarketplaceItem {
  id: string;
  type: 'agent' | 'workflow' | 'integration';
  name: string;
  description: string;
  author: MarketplaceAuthor;
  price: number;
  currency: string;
  rating: number;
  reviews: Review[];
  downloads: number;
  category: string;
  tags: string[];
  preview: MarketplacePreview;
  lastUpdated: Date;
}

export interface MarketplaceAuthor {
  id: string;
  username: string;
  verified: boolean;
  rating: number;
  totalDownloads: number;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface MarketplacePreview {
  images: string[];
  video?: string;
  demoUrl?: string;
  documentation: string;
}

// Enums and type unions
export type AgentType = 
  | 'researcher' 
  | 'coder' 
  | 'analyst' 
  | 'optimizer' 
  | 'coordinator'
  | 'custom';

export type AgentStatus = 
  | 'draft' 
  | 'active' 
  | 'paused' 
  | 'error' 
  | 'deployed';

export type WorkflowStatus = 
  | 'draft' 
  | 'active' 
  | 'paused' 
  | 'error' 
  | 'deployed';

export type TriggerType = 
  | 'webhook' 
  | 'schedule' 
  | 'event' 
  | 'manual' 
  | 'api';

export type ActionType = 
  | 'api_call' 
  | 'email' 
  | 'webhook' 
  | 'database' 
  | 'ai_prompt'
  | 'custom';

export type VariableType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'array' 
  | 'object';

export type VariableScope = 
  | 'global' 
  | 'workflow' 
  | 'agent';

export type IntegrationType = 
  | 'api' 
  | 'database' 
  | 'cloud' 
  | 'ai_service' 
  | 'custom';

export type IntegrationStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'error' 
  | 'pending';

export type CapabilityCategory = 
  | 'data_processing' 
  | 'communication' 
  | 'ai_ml' 
  | 'automation' 
  | 'integration';

export type TemplateCategory = 
  | 'business' 
  | 'marketing' 
  | 'development' 
  | 'analytics' 
  | 'support';

export type ABTestStatus = 
  | 'draft' 
  | 'running' 
  | 'completed' 
  | 'paused';

export type CollaborationRole = 
  | 'owner' 
  | 'admin' 
  | 'editor' 
  | 'viewer';

export type ChangeAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'move' 
  | 'copy';

export type ChangeTarget = 
  | 'agent' 
  | 'workflow' 
  | 'connection' 
  | 'configuration';

export type MetricType = 
  | 'counter' 
  | 'gauge' 
  | 'histogram' 
  | 'summary';

export type AggregationType = 
  | 'sum' 
  | 'avg' 
  | 'min' 
  | 'max' 
  | 'count';

// Utility types
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  [key: string]: any;
}

export interface DataTransform {
  type: 'map' | 'filter' | 'reduce' | 'custom';
  configuration: Record<string, any>;
}

export interface RetryConfig {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'oauth' | 'jwt';
  configuration: Record<string, any>;
}

export interface AuthorizationConfig {
  type: 'none' | 'rbac' | 'custom';
  configuration: Record<string, any>;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyRotation: boolean;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook';
  configuration: Record<string, any>;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canDeploy: boolean;
  canInvite: boolean;
  canManagePermissions: boolean;
}

// Event types for real-time updates
export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface WorkflowExecutionEvent extends RealtimeEvent {
  type: 'workflow_execution';
  payload: {
    workflowId: string;
    status: 'started' | 'completed' | 'failed';
    duration?: number;
    error?: string;
  };
}

export interface AgentStatusEvent extends RealtimeEvent {
  type: 'agent_status';
  payload: {
    agentId: string;
    status: AgentStatus;
    metrics?: PerformanceMetrics;
  };
}

export interface CollaborationEvent extends RealtimeEvent {
  type: 'collaboration';
  payload: {
    workflowId: string;
    action: 'join' | 'leave' | 'edit' | 'comment';
    details: any;
  };
}
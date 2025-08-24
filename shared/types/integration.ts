// Shared types for Sei blockchain hackathon component integration

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: 'trading' | 'defi' | 'nft' | 'analytics' | 'governance' | 'custom';
  capabilities: string[];
  parameters: Record<string, any>;
  walletConfig: WalletConfig;
  smartContracts?: SmartContractReference[];
  created: Date;
  lastModified: Date;
}

export interface WalletConfig {
  chainId: string;
  network: 'mainnet' | 'testnet' | 'devnet';
  walletProvider: 'metamask' | 'keplr' | 'sei-wallet' | 'goat-sdk';
  address?: string;
  permissions: WalletPermission[];
}

export interface WalletPermission {
  type: 'send' | 'receive' | 'stake' | 'contract_interaction' | 'governance';
  limits?: {
    daily?: number;
    perTransaction?: number;
  };
}

export interface SmartContractReference {
  id: string;
  name: string;
  address?: string;
  network: string;
  type: 'cosmwasm' | 'move' | 'evm';
  abi?: any;
  functions: ContractFunction[];
  deployed: boolean;
}

export interface ContractFunction {
  name: string;
  type: 'query' | 'execute';
  parameters: ContractParameter[];
  description: string;
}

export interface ContractParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface ComponentMessage {
  id: string;
  source: ComponentType;
  target: ComponentType;
  type: MessageType;
  payload: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type ComponentType = 'no-code-platform' | 'agent-framework' | 'smart-contract-copilot' | 'mcp-server' | 'sdk';
export type MessageType = 'agent-deploy' | 'contract-generate' | 'wallet-connect' | 'transaction' | 'status-update' | 'error';

export interface AgentDeploymentRequest {
  agentConfig: AgentConfig;
  deploymentTarget: 'local' | 'testnet' | 'mainnet';
  resourceRequirements: ResourceRequirements;
  monitoring: MonitoringConfig;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  network: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alertThresholds: Record<string, number>;
  webhooks?: string[];
}

export interface IntegrationEvent {
  id: string;
  type: string;
  source: ComponentType;
  data: any;
  timestamp: Date;
  handled: boolean;
}

export interface SystemState {
  agents: Record<string, AgentConfig>;
  deployments: Record<string, AgentDeploymentRequest>;
  contracts: Record<string, SmartContractReference>;
  wallets: Record<string, WalletConfig>;
  events: IntegrationEvent[];
  status: SystemStatus;
}

export interface SystemStatus {
  healthy: boolean;
  components: Record<ComponentType, ComponentStatus>;
  lastCheck: Date;
}

export interface ComponentStatus {
  online: boolean;
  version: string;
  lastHeartbeat: Date;
  errors: string[];
  metrics: Record<string, number>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'heartbeat' | 'event' | 'request' | 'response';
  id: string;
  payload: any;
  timestamp: Date;
}

// Smart Contract Copilot Integration
export interface ContractGenerationRequest {
  agentId: string;
  contractType: 'token' | 'nft' | 'defi' | 'governance' | 'custom';
  requirements: ContractRequirements;
  targetNetwork: string;
}

export interface ContractRequirements {
  name: string;
  symbol?: string;
  functionality: string[];
  security: SecurityRequirement[];
  optimization: OptimizationLevel;
  testing: TestingRequirements;
}

export type SecurityRequirement = 'access-control' | 'reentrancy-guard' | 'pause-mechanism' | 'upgrade-proxy';
export type OptimizationLevel = 'low' | 'medium' | 'high';

export interface TestingRequirements {
  unitTests: boolean;
  integrationTests: boolean;
  fuzzTesting: boolean;
  coverage: number;
}

// MCP Integration
export interface MCPRequest {
  method: string;
  params: any;
  id: string;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// GOAT SDK Integration
export interface GoatTransaction {
  chainId: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface GoatWalletProvider {
  address: string;
  chainId: string;
  connected: boolean;
  balance: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  price?: number;
}
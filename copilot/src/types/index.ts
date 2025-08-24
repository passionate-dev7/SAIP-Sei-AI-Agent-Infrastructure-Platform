export enum ContractLanguage {
  Solidity = 'solidity',
  CosmWasm = 'cosmwasm',
  Move = 'move',
  Rust = 'rust',
  AssemblyScript = 'assemblyscript'
}

export enum ContractType {
  Token = 'token',
  NFT = 'nft',
  DeFi = 'defi',
  DAO = 'dao',
  Marketplace = 'marketplace',
  Staking = 'staking',
  Governance = 'governance',
  Oracle = 'oracle',
  Bridge = 'bridge',
  Custom = 'custom'
}

export interface CopilotConfig {
  anthropicKey?: string;
  openaiKey?: string;
  seiRpcUrl?: string;
  defaultLanguage?: ContractLanguage;
  cacheEnabled?: boolean;
  maxTokens?: number;
}

export interface ContractRequest {
  description: string;
  language?: ContractLanguage;
  type?: ContractType;
  features?: string[];
  autoFix?: boolean;
  autoOptimize?: boolean;
  generateTests?: boolean;
  generateDocs?: boolean;
}

export interface ContractResponse {
  success: boolean;
  contract: string;
  tests?: string;
  documentation?: string;
  securityIssues?: SecurityIssue[];
  optimizations?: OptimizationSuggestion[];
  error?: string;
  metadata?: {
    language: ContractLanguage;
    estimatedGas: number;
    complexity: 'low' | 'medium' | 'high';
    linesOfCode: number;
  };
}

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  description: string;
  location: string;
  line?: number;
  fix?: string;
  reference?: string;
}

export interface OptimizationSuggestion {
  type: 'gas' | 'storage' | 'computation' | 'pattern';
  description: string;
  location: string;
  estimatedSavings?: number;
  implementation?: string;
}

export interface ContractTemplate {
  name: string;
  type: ContractType;
  language: ContractLanguage;
  description: string;
  template: string;
  parameters: TemplateParameter[];
  features: string[];
}

export interface TemplateParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface ParsedRequirements {
  contractType: ContractType;
  features: string[];
  customLogic: string[];
  securityRequirements: string[];
  performanceRequirements: string[];
}
// Blockchain Integration Types
export interface BlockchainProvider {
  readonly name: string;
  readonly chainId: number;
  readonly networkName: string;
  
  // Connection Management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Account Management
  getAccount(): Promise<string>;
  getBalance(address?: string): Promise<string>;
  
  // Transaction Management
  sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
  waitForTransaction(hash: string): Promise<TransactionReceipt>;
  estimateGas(transaction: TransactionRequest): Promise<string>;
  
  // Contract Interaction
  deployContract(bytecode: string, abi: any[], args?: any[]): Promise<string>;
  callContract(address: string, abi: any[], method: string, args?: any[]): Promise<any>;
  
  // Event Monitoring
  subscribeToEvents(address: string, eventName: string, callback: EventCallback): Promise<string>;
  unsubscribeFromEvents(subscriptionId: string): Promise<void>;
  
  // Utility Methods
  getBlockNumber(): Promise<number>;
  getGasPrice(): Promise<string>;
  getNonce(address?: string): Promise<number>;
}

export interface WalletProvider {
  readonly type: WalletType;
  readonly address: string;
  readonly chainId: number;
  
  // Lifecycle
  initialize(config: WalletConfig): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Account Management
  getAccounts(): Promise<string[]>;
  switchAccount(address: string): Promise<void>;
  
  // Signing
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: TransactionRequest): Promise<string>;
  signTypedData(domain: any, types: any, value: any): Promise<string>;
  
  // Network Management
  switchChain(chainId: number): Promise<void>;
  addChain(chainConfig: ChainConfig): Promise<void>;
  
  // Events
  on(event: WalletEvent, callback: (data: any) => void): void;
  off(event: WalletEvent, callback?: (data: any) => void): void;
}

export enum WalletType {
  EVM = 'evm',
  COSMOS = 'cosmos',
  SOLANA = 'solana',
  BITCOIN = 'bitcoin'
}

export enum WalletEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ACCOUNT_CHANGED = 'accountChanged',
  CHAIN_CHANGED = 'chainChanged',
  MESSAGE = 'message'
}

export interface WalletConfig {
  type: WalletType;
  privateKey?: string;
  mnemonic?: string;
  keystore?: any;
  provider?: any;
  rpcUrl?: string;
  chainId?: number;
  derivationPath?: string;
  options?: Record<string, any>;
}

export interface ChainConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

export interface TransactionRequest {
  to?: string;
  from?: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  type?: number;
}

export interface TransactionResponse {
  hash: string;
  to?: string;
  from: string;
  nonce: number;
  gasLimit: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  data: string;
  value: string;
  chainId: number;
  type?: number;
  r?: string;
  s?: string;
  v?: number;
  wait(confirmations?: number): Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
  to?: string;
  from: string;
  contractAddress?: string;
  transactionIndex: number;
  gasUsed: string;
  effectiveGasPrice: string;
  cumulativeGasUsed: string;
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  logs: Log[];
  status?: number;
  confirmations: number;
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}

export type EventCallback = (log: Log) => void;

// Sei Network Specific Types
export interface SeiConfig extends ChainConfig {
  chainId: 1329; // Sei Pacific-1 mainnet
  chainName: 'Sei';
  nativeCurrency: {
    name: 'Sei';
    symbol: 'SEI';
    decimals: 18;
  };
  rpcUrls: string[];
  restUrls: string[];
  cosmosChainId: string;
  bech32Prefix: 'sei';
}

export interface SeiProvider extends BlockchainProvider {
  // Sei-specific methods
  getAccountInfo(address: string): Promise<SeiAccountInfo>;
  queryContract(contractAddress: string, query: any): Promise<any>;
  executeContract(contractAddress: string, msg: any, funds?: Coin[]): Promise<TransactionResponse>;
  
  // Cosmos SDK methods
  getSequence(address: string): Promise<number>;
  simulateTransaction(messages: any[]): Promise<SimulateResponse>;
  broadcastTransaction(signedTx: string): Promise<BroadcastResponse>;
}

export interface SeiAccountInfo {
  address: string;
  accountNumber: number;
  sequence: number;
  pubKey?: any;
  coins: Coin[];
}

export interface Coin {
  denom: string;
  amount: string;
}

export interface SimulateResponse {
  gasUsed: string;
  gasWanted: string;
  events: Event[];
}

export interface BroadcastResponse {
  txhash: string;
  code: number;
  rawLog: string;
  height: string;
  gasUsed: string;
  gasWanted: string;
  events: Event[];
}

export interface Event {
  type: string;
  attributes: Attribute[];
}

export interface Attribute {
  key: string;
  value: string;
}

// GOAT SDK Integration
export interface GOATConfig {
  walletConfig: WalletConfig;
  chainConfig: ChainConfig;
  plugins: GOATPlugin[];
  options?: GOATOptions;
}

export interface GOATOptions {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  timeout?: number;
  retries?: number;
  cacheEnabled?: boolean;
  rateLimitConfig?: RateLimitConfig;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstSize: number;
  cooldownPeriod: number;
}

export interface GOATPlugin {
  name: string;
  version: string;
  initialize(config: any): Promise<void>;
  execute(method: string, params: any[]): Promise<any>;
  shutdown(): Promise<void>;
}

export interface GOATWallet {
  // Standard wallet interface
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: any): Promise<string>;
  
  // GOAT-specific methods
  getTools(): Tool[];
  executeAction(action: WalletAction): Promise<ActionResult>;
  getCapabilities(): WalletCapability[];
  
  // DeFi operations
  swap(tokenIn: string, tokenOut: string, amount: string, slippage?: number): Promise<TransactionResponse>;
  addLiquidity(tokenA: string, tokenB: string, amountA: string, amountB: string): Promise<TransactionResponse>;
  removeLiquidity(lpToken: string, amount: string): Promise<TransactionResponse>;
  
  // Lending operations
  lend(asset: string, amount: string): Promise<TransactionResponse>;
  borrow(asset: string, amount: string, collateral: string): Promise<TransactionResponse>;
  repay(asset: string, amount: string): Promise<TransactionResponse>;
  
  // Staking operations
  stake(validator: string, amount: string): Promise<TransactionResponse>;
  unstake(validator: string, amount: string): Promise<TransactionResponse>;
  claimRewards(validator?: string): Promise<TransactionResponse>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute(params: any): Promise<any>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message?: string;
}

export interface WalletAction {
  type: string;
  parameters: Record<string, any>;
  gasLimit?: string;
  gasPrice?: string;
  value?: string;
}

export interface ActionResult {
  success: boolean;
  transactionHash?: string;
  result?: any;
  error?: string;
  gasUsed?: string;
  cost?: string;
}

export interface WalletCapability {
  name: string;
  description: string;
  supported: boolean;
  version?: string;
  limitations?: string[];
}

// Agent-Blockchain Integration
export interface BlockchainAgent {
  walletProvider: WalletProvider;
  blockchainProvider: BlockchainProvider;
  
  // Wallet operations
  getWalletInfo(): Promise<WalletInfo>;
  checkBalance(token?: string): Promise<string>;
  transferTokens(to: string, amount: string, token?: string): Promise<TransactionResponse>;
  
  // DeFi operations
  performSwap(swapParams: SwapParameters): Promise<TransactionResponse>;
  provideLiquidity(liquidityParams: LiquidityParameters): Promise<TransactionResponse>;
  
  // Contract interaction
  deployContract(contractParams: ContractDeployment): Promise<string>;
  interactWithContract(interaction: ContractInteraction): Promise<any>;
  
  // Monitoring
  monitorTransactions(callback: (tx: TransactionReceipt) => void): void;
  monitorWallet(callback: (event: WalletEvent, data: any) => void): void;
  
  // Analytics
  getTransactionHistory(limit?: number): Promise<TransactionHistory[]>;
  getPortfolioValue(): Promise<PortfolioValue>;
  getYieldMetrics(): Promise<YieldMetrics>;
}

export interface WalletInfo {
  address: string;
  chainId: number;
  network: string;
  type: WalletType;
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
  value?: number;
}

export interface SwapParameters {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  slippage: number;
  deadline?: number;
  recipient?: string;
}

export interface LiquidityParameters {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  minAmountA: string;
  minAmountB: string;
  deadline?: number;
}

export interface ContractDeployment {
  bytecode: string;
  abi: any[];
  constructorArgs?: any[];
  gasLimit?: string;
  gasPrice?: string;
}

export interface ContractInteraction {
  address: string;
  abi: any[];
  method: string;
  args?: any[];
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionHistory {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: Date;
  blockNumber: number;
  status: 'success' | 'failed' | 'pending';
  type: 'transfer' | 'contract' | 'swap' | 'liquidity' | 'stake' | 'other';
  description?: string;
}

export interface PortfolioValue {
  totalValue: number;
  totalValueChange24h: number;
  assets: AssetValue[];
  breakdown: {
    tokens: number;
    liquidity: number;
    staking: number;
    lending: number;
    other: number;
  };
  lastUpdated: Date;
}

export interface AssetValue {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  price: number;
  value: number;
  valueChange24h: number;
  allocation: number; // percentage
}

export interface YieldMetrics {
  totalRewards: number;
  totalRewardsUSD: number;
  stakingRewards: number;
  liquidityRewards: number;
  lendingRewards: number;
  apr: number;
  apy: number;
  yieldSources: YieldSource[];
  lastUpdated: Date;
}

export interface YieldSource {
  protocol: string;
  type: 'staking' | 'liquidity' | 'lending' | 'farming';
  asset: string;
  amount: string;
  rewards: number;
  apr: number;
  risk: 'low' | 'medium' | 'high';
}

// Error Types
export class BlockchainError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}

export class TransactionError extends BlockchainError {
  constructor(
    message: string,
    public transactionHash?: string,
    public gasUsed?: string,
    details?: any
  ) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

export class WalletError extends BlockchainError {
  constructor(message: string, details?: any) {
    super(message, 'WALLET_ERROR', details);
    this.name = 'WalletError';
  }
}

export class ContractError extends BlockchainError {
  constructor(
    message: string,
    public contractAddress?: string,
    public method?: string,
    details?: any
  ) {
    super(message, 'CONTRACT_ERROR', details);
    this.name = 'ContractError';
  }
}
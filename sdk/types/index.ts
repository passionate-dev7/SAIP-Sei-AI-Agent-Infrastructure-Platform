/**
 * Core Sui SDK Types and Interfaces
 * Comprehensive type definitions for the Sui integration layer
 */

import type {
  SuiClient,
  SuiTransactionBlockResponse,
  SuiObjectData,
  SuiMoveObject,
  PaginatedObjectsResponse,
  SuiObjectRef,
  TransactionBlock,
  SuiAddress,
  ObjectId,
  TransactionDigest,
  SuiObjectDataOptions,
  DynamicFieldInfo,
  CoinStruct,
  SuiTransactionBlockResponseOptions,
  DevInspectResults,
  SuiGasData,
  SuiExecuteTransactionRequestType,
} from '@mysten/sui.js/client';

import type {
  Ed25519Keypair,
  Secp256k1Keypair,
  Secp256r1Keypair,
} from '@mysten/sui.js/keypairs';

// Re-export core Sui types
export type {
  SuiClient,
  SuiTransactionBlockResponse,
  SuiObjectData,
  SuiMoveObject,
  PaginatedObjectsResponse,
  SuiObjectRef,
  TransactionBlock,
  SuiAddress,
  ObjectId,
  TransactionDigest,
  SuiObjectDataOptions,
  DynamicFieldInfo,
  CoinStruct,
  SuiTransactionBlockResponseOptions,
  DevInspectResults,
  SuiGasData,
  SuiExecuteTransactionRequestType,
  Ed25519Keypair,
  Secp256k1Keypair,
  Secp256r1Keypair,
};

// Wallet Types
export interface WalletConfig {
  network: 'mainnet' | 'testnet' | 'devnet' | 'localnet';
  rpcUrl?: string;
  wsUrl?: string;
}

export interface WalletInfo {
  address: SuiAddress;
  balance: string;
  objects: number;
  network: string;
}

export type KeypairType = 'ed25519' | 'secp256k1' | 'secp256r1';

export interface WalletKeyPair {
  keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;
  type: KeypairType;
}

// Transaction Types
export interface TransactionOptions {
  gasBudget?: string | number;
  gasPrice?: string | number;
  sender?: SuiAddress;
  sponsor?: SuiAddress;
  gasPayment?: SuiObjectRef[];
}

export interface TransactionResult {
  digest: TransactionDigest;
  response: SuiTransactionBlockResponse;
  effects: any;
  balanceChanges: any[];
  objectChanges: any[];
}

export interface ExecuteTransactionOptions extends TransactionOptions {
  requestType?: SuiExecuteTransactionRequestType;
  showInput?: boolean;
  showRawInput?: boolean;
  showEffects?: boolean;
  showEvents?: boolean;
  showObjectChanges?: boolean;
  showBalanceChanges?: boolean;
}

// Object Types
export interface ObjectFilter {
  owner?: SuiAddress;
  objectType?: string;
  objectIds?: ObjectId[];
  cursor?: string;
  limit?: number;
}

export interface OwnedObject {
  objectId: ObjectId;
  version: string;
  digest: string;
  type: string;
  owner: any;
  content?: SuiMoveObject;
}

export interface ObjectOwnership {
  type: 'AddressOwner' | 'ObjectOwner' | 'Shared' | 'Immutable';
  owner?: SuiAddress;
  objectId?: ObjectId;
  initialSharedVersion?: number;
}

// Coin Types
export interface CoinInfo {
  objectId: ObjectId;
  version: string;
  digest: string;
  balance: string;
  type: string;
}

export interface CoinOperation {
  type: 'split' | 'merge' | 'transfer';
  coins: CoinInfo[];
  amounts?: string[];
  recipient?: SuiAddress;
}

export interface CoinBalance {
  coinType: string;
  totalBalance: string;
  coinObjectCount: number;
  lockedBalance?: {
    epochId?: number;
    number?: string;
  };
}

// PTB Types
export interface PTBCommand {
  kind: string;
  inputs?: any[];
  arguments?: any[];
  target?: string;
  objectType?: string;
}

export interface PTBBuilder {
  commands: PTBCommand[];
  inputs: any[];
  gasConfig?: {
    budget?: string;
    price?: string;
    payment?: SuiObjectRef[];
  };
}

// Module Interaction Types
export interface MoveCallParams {
  target: string; // package::module::function
  arguments?: any[];
  typeArguments?: string[];
}

export interface ModuleFunction {
  package: string;
  module: string;
  function: string;
  parameters: string[];
  returns: string[];
  isEntry: boolean;
  visibility: 'public' | 'private' | 'friend';
}

export interface MoveModule {
  package: ObjectId;
  name: string;
  functions: ModuleFunction[];
  structs: MoveStruct[];
}

export interface MoveStruct {
  name: string;
  abilities: string[];
  fields: MoveField[];
  typeParameters: string[];
}

export interface MoveField {
  name: string;
  type: string;
}

// Gas Types
export interface GasEstimation {
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  totalCost: string;
  gasUsed: string;
}

export interface GasOptimization {
  recommendedBudget: string;
  recommendedPrice: string;
  estimatedCost: string;
  optimizations: string[];
}

export interface GasConfig {
  budget: string;
  price: string;
  payment?: SuiObjectRef[];
  sponsor?: SuiAddress;
}

// Error Types
export interface SuiSDKError {
  code: string;
  message: string;
  details?: any;
  txDigest?: TransactionDigest;
  cause?: Error;
}

export type SuiErrorCode = 
  | 'INSUFFICIENT_GAS'
  | 'INVALID_TRANSACTION'
  | 'OBJECT_NOT_FOUND'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_ADDRESS'
  | 'INVALID_OBJECT_TYPE'
  | 'TRANSACTION_FAILED'
  | 'NETWORK_ERROR'
  | 'WALLET_ERROR'
  | 'MODULE_NOT_FOUND'
  | 'FUNCTION_NOT_FOUND'
  | 'TYPE_ERROR'
  | 'OWNERSHIP_ERROR'
  | 'GAS_ESTIMATION_ERROR';

// Event Types
export interface SuiEventFilter {
  package?: ObjectId;
  module?: string;
  eventType?: string;
  sender?: SuiAddress;
  recipient?: SuiAddress;
  cursor?: string;
  limit?: number;
  descending?: boolean;
}

export interface SuiEvent {
  id: string;
  packageId: ObjectId;
  transactionModule: string;
  sender: SuiAddress;
  type: string;
  parsedJson?: any;
  bcs?: string;
  timestampMs?: string;
}

// Utility Types
export interface PaginationOptions {
  cursor?: string;
  limit?: number;
  descending?: boolean;
}

export interface QueryOptions extends PaginationOptions {
  showType?: boolean;
  showOwner?: boolean;
  showPreviousTransaction?: boolean;
  showDisplay?: boolean;
  showContent?: boolean;
  showBcs?: boolean;
  showStorageRebate?: boolean;
}

// Configuration Types
export interface SuiSDKConfig {
  network: WalletConfig['network'];
  rpcUrl?: string;
  wsUrl?: string;
  timeout?: number;
  retries?: number;
  rateLimitRpm?: number;
}

// Constants
export const SUI_TYPE_ARG = '0x2::sui::SUI';
export const MIST_PER_SUI = 1_000_000_000n;
export const DEFAULT_GAS_BUDGET = '10000000'; // 0.01 SUI
export const MAX_GAS_BUDGET = '50000000000'; // 50 SUI

// Network Endpoints
export const NETWORK_ENDPOINTS = {
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  testnet: 'https://fullnode.testnet.sui.io:443',
  devnet: 'https://fullnode.devnet.sui.io:443',
  localnet: 'http://127.0.0.1:9000',
} as const;

export const NETWORK_WS_ENDPOINTS = {
  mainnet: 'wss://fullnode.mainnet.sui.io:443',
  testnet: 'wss://fullnode.testnet.sui.io:443',
  devnet: 'wss://fullnode.devnet.sui.io:443',
  localnet: 'ws://127.0.0.1:9001',
} as const;
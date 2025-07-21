/**
 * Wallet Connection and Management for Sui SDK
 * Comprehensive wallet utilities with multi-keypair support
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui.js/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui.js/keypairs/secp256r1';
import { fromB64, toB64 } from '@mysten/sui.js/utils';
import type {
  WalletConfig,
  WalletInfo,
  WalletKeyPair,
  KeypairType,
  SuiAddress,
  ObjectId,
  CoinBalance,
  OwnedObject,
  NETWORK_ENDPOINTS,
} from '../types';
import { SuiValidator } from '../utils/validation';
import { SuiErrorFactory } from '../errors/SuiSDKError';

/**
 * Wallet Manager class for handling Sui wallets
 */
export class WalletManager {
  private client: SuiClient;
  private config: WalletConfig;
  private keyPair?: WalletKeyPair;

  constructor(config: WalletConfig) {
    this.config = config;
    const rpcUrl = config.rpcUrl || this.getDefaultRpcUrl(config.network);
    
    this.client = new SuiClient({
      url: rpcUrl,
    });
  }

  /**
   * Create a new wallet manager instance
   */
  static create(config: WalletConfig): WalletManager {
    return new WalletManager(config);
  }

  /**
   * Get default RPC URL for network
   */
  private getDefaultRpcUrl(network: WalletConfig['network']): string {
    switch (network) {
      case 'mainnet':
        return getFullnodeUrl('mainnet');
      case 'testnet':
        return getFullnodeUrl('testnet');
      case 'devnet':
        return getFullnodeUrl('devnet');
      case 'localnet':
        return getFullnodeUrl('localnet');
      default:
        throw SuiErrorFactory.wallet(`Unsupported network: ${network}`);
    }
  }

  /**
   * Generate a new keypair
   */
  generateKeyPair(type: KeypairType = 'ed25519'): WalletKeyPair {
    let keypair: WalletKeyPair['keypair'];

    switch (type) {
      case 'ed25519':
        keypair = new Ed25519Keypair();
        break;
      case 'secp256k1':
        keypair = new Secp256k1Keypair();
        break;
      case 'secp256r1':
        keypair = new Secp256r1Keypair();
        break;
      default:
        throw SuiErrorFactory.wallet(`Unsupported keypair type: ${type}`);
    }

    const walletKeyPair: WalletKeyPair = { keypair, type };
    this.keyPair = walletKeyPair;
    return walletKeyPair;
  }

  /**
   * Import keypair from private key
   */
  importFromPrivateKey(privateKey: string, type: KeypairType = 'ed25519'): WalletKeyPair {
    try {
      let keypair: WalletKeyPair['keypair'];
      const privateKeyBytes = fromB64(privateKey);

      switch (type) {
        case 'ed25519':
          keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          break;
        case 'secp256k1':
          keypair = Secp256k1Keypair.fromSecretKey(privateKeyBytes);
          break;
        case 'secp256r1':
          keypair = Secp256r1Keypair.fromSecretKey(privateKeyBytes);
          break;
        default:
          throw SuiErrorFactory.wallet(`Unsupported keypair type: ${type}`);
      }

      const walletKeyPair: WalletKeyPair = { keypair, type };
      this.keyPair = walletKeyPair;
      return walletKeyPair;
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to import keypair from private key',
        { type, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Import keypair from mnemonic phrase
   */
  importFromMnemonic(mnemonic: string, derivationPath?: string, type: KeypairType = 'ed25519'): WalletKeyPair {
    try {
      let keypair: WalletKeyPair['keypair'];

      switch (type) {
        case 'ed25519':
          keypair = Ed25519Keypair.deriveKeypair(mnemonic, derivationPath);
          break;
        case 'secp256k1':
          keypair = Secp256k1Keypair.deriveKeypair(mnemonic, derivationPath);
          break;
        case 'secp256r1':
          keypair = Secp256r1Keypair.deriveKeypair(mnemonic, derivationPath);
          break;
        default:
          throw SuiErrorFactory.wallet(`Unsupported keypair type: ${type}`);
      }

      const walletKeyPair: WalletKeyPair = { keypair, type };
      this.keyPair = walletKeyPair;
      return walletKeyPair;
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to import keypair from mnemonic',
        { type, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Export private key as base64 string
   */
  exportPrivateKey(): string {
    if (!this.keyPair) {
      throw SuiErrorFactory.wallet('No keypair available to export');
    }

    try {
      return this.keyPair.keypair.export().privateKey;
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to export private key',
        { error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): SuiAddress {
    if (!this.keyPair) {
      throw SuiErrorFactory.wallet('No keypair available');
    }

    return this.keyPair.keypair.getPublicKey().toSuiAddress();
  }

  /**
   * Get public key as base64 string
   */
  getPublicKey(): string {
    if (!this.keyPair) {
      throw SuiErrorFactory.wallet('No keypair available');
    }

    return this.keyPair.keypair.getPublicKey().toBase64();
  }

  /**
   * Get comprehensive wallet information
   */
  async getWalletInfo(): Promise<WalletInfo> {
    if (!this.keyPair) {
      throw SuiErrorFactory.wallet('No keypair available');
    }

    const address = this.getAddress();

    try {
      // Get balance
      const balance = await this.client.getBalance({
        owner: address,
      });

      // Get owned objects count
      const objects = await this.client.getOwnedObjects({
        owner: address,
        options: { showType: true },
      });

      return {
        address,
        balance: balance.totalBalance,
        objects: objects.data.length,
        network: this.config.network,
      };
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to get wallet information',
        { address, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get SUI balance
   */
  async getBalance(): Promise<string> {
    const address = this.getAddress();

    try {
      const balance = await this.client.getBalance({
        owner: address,
      });
      return balance.totalBalance;
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to get balance',
        { address, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get all coin balances
   */
  async getAllBalances(): Promise<CoinBalance[]> {
    const address = this.getAddress();

    try {
      const balances = await this.client.getAllBalances({
        owner: address,
      });

      return balances.map(balance => ({
        coinType: balance.coinType,
        totalBalance: balance.totalBalance,
        coinObjectCount: balance.coinObjectCount,
        lockedBalance: balance.lockedBalance,
      }));
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to get all balances',
        { address, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get coins of a specific type
   */
  async getCoins(coinType: string = '0x2::sui::SUI'): Promise<OwnedObject[]> {
    const address = this.getAddress();

    try {
      const coins = await this.client.getCoins({
        owner: address,
        coinType,
      });

      return coins.data.map(coin => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
        type: coinType,
        owner: { AddressOwner: address },
        content: {
          dataType: 'moveObject',
          type: coinType,
          hasPublicTransfer: true,
          fields: {
            balance: coin.balance,
            id: { id: coin.coinObjectId },
          },
        },
      }));
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to get coins',
        { address, coinType, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get owned objects
   */
  async getOwnedObjects(options: {
    objectType?: string;
    cursor?: string;
    limit?: number;
  } = {}): Promise<{
    objects: OwnedObject[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    const address = this.getAddress();

    try {
      const result = await this.client.getOwnedObjects({
        owner: address,
        filter: options.objectType ? { StructType: options.objectType } : undefined,
        cursor: options.cursor,
        limit: options.limit,
        options: {
          showType: true,
          showOwner: true,
          showContent: true,
          showDisplay: false,
          showBcs: false,
          showStorageRebate: false,
        },
      });

      const objects: OwnedObject[] = result.data
        .filter(item => item.data)
        .map(item => {
          const data = item.data!;
          return {
            objectId: data.objectId,
            version: data.version,
            digest: data.digest,
            type: data.type || 'unknown',
            owner: data.owner,
            content: data.content,
          };
        });

      return {
        objects,
        nextCursor: result.nextCursor || undefined,
        hasNextPage: result.hasNextPage,
      };
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to get owned objects',
        { address, options, error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Request SUI from faucet (testnet/devnet only)
   */
  async requestFromFaucet(): Promise<{ success: boolean; message: string }> {
    if (this.config.network === 'mainnet') {
      throw SuiErrorFactory.wallet('Faucet not available on mainnet');
    }

    const address = this.getAddress();

    try {
      // Note: The actual faucet implementation depends on the network
      // This is a placeholder implementation
      const faucetUrl = this.getFaucetUrl();
      
      const response = await fetch(faucetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: address,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Faucet request failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'SUI requested from faucet successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown faucet error',
      };
    }
  }

  /**
   * Get faucet URL for the current network
   */
  private getFaucetUrl(): string {
    switch (this.config.network) {
      case 'testnet':
        return 'https://faucet.testnet.sui.io/gas';
      case 'devnet':
        return 'https://faucet.devnet.sui.io/gas';
      case 'localnet':
        return 'http://127.0.0.1:9123/gas';
      default:
        throw SuiErrorFactory.wallet(`No faucet available for network: ${this.config.network}`);
    }
  }

  /**
   * Get the Sui client instance
   */
  getClient(): SuiClient {
    return this.client;
  }

  /**
   * Get the current keypair
   */
  getKeyPair(): WalletKeyPair | undefined {
    return this.keyPair;
  }

  /**
   * Check if wallet has a keypair
   */
  hasKeyPair(): boolean {
    return !!this.keyPair;
  }

  /**
   * Get network configuration
   */
  getConfig(): WalletConfig {
    return { ...this.config };
  }

  /**
   * Update network configuration
   */
  updateNetwork(network: WalletConfig['network'], rpcUrl?: string): void {
    this.config = {
      ...this.config,
      network,
      rpcUrl: rpcUrl || this.getDefaultRpcUrl(network),
    };

    // Create new client with updated configuration
    this.client = new SuiClient({
      url: this.config.rpcUrl!,
    });
  }

  /**
   * Sign arbitrary data
   */
  async signData(data: Uint8Array): Promise<string> {
    if (!this.keyPair) {
      throw SuiErrorFactory.wallet('No keypair available for signing');
    }

    try {
      const signature = await this.keyPair.keypair.signData(data);
      return toB64(signature);
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to sign data',
        { error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Verify signature
   */
  async verifySignature(data: Uint8Array, signature: string): Promise<boolean> {
    if (!this.keyPair) {
      throw SuiErrorFactory.wallet('No keypair available for verification');
    }

    try {
      const signatureBytes = fromB64(signature);
      return await this.keyPair.keypair.getPublicKey().verifyData(data, signatureBytes);
    } catch (error) {
      throw SuiErrorFactory.wallet(
        'Failed to verify signature',
        { error: error instanceof Error ? error.message : error },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Clear wallet data (for security)
   */
  clear(): void {
    this.keyPair = undefined;
  }
}
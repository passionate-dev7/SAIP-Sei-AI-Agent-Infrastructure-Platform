// GOAT SDK Integration for wallet interactions

import axios from 'axios';
import { INTEGRATION_CONFIG } from '../config/integration';
import { 
  GoatTransaction, 
  GoatWalletProvider, 
  TokenBalance, 
  WalletConfig, 
  ApiResponse 
} from '../types/integration';
import { EventPublisher } from '../events/EventBus';

export interface WalletConnectionRequest {
  provider: 'metamask' | 'keplr' | 'sei-wallet' | 'goat-sdk';
  chainId: string;
  network: 'mainnet' | 'testnet' | 'devnet';
}

export interface TransactionRequest {
  from: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  chainId: string;
}

export class GoatSDKIntegration {
  private sdkUrl: string;
  private eventPublisher: EventPublisher;
  private connectedWallets: Map<string, GoatWalletProvider> = new Map();

  constructor() {
    this.sdkUrl = INTEGRATION_CONFIG.components.sdk.url;
    this.eventPublisher = new EventPublisher();
  }

  // Wallet connection methods
  async connectWallet(request: WalletConnectionRequest): Promise<ApiResponse<GoatWalletProvider>> {
    try {
      console.log('[GOAT SDK Integration] Connecting wallet:', request);

      const response = await axios.post(`${this.sdkUrl}/api/wallet/connect`, {
        provider: request.provider,
        chainId: request.chainId,
        network: request.network,
        options: {
          autoConnect: true,
          persistent: true,
        },
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'integration-layer',
        },
      });

      const walletProvider: GoatWalletProvider = response.data;
      
      // Store connected wallet
      this.connectedWallets.set(walletProvider.address, walletProvider);

      // Publish wallet connected event
      this.eventPublisher.publishWalletConnected('sdk', {
        address: walletProvider.address,
        chainId: walletProvider.chainId,
        provider: request.provider,
        balance: walletProvider.balance,
      });

      return {
        success: true,
        data: walletProvider,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[GOAT SDK Integration] Wallet connection failed:', error);

      return {
        success: false,
        error: {
          code: 'WALLET_CONNECTION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async disconnectWallet(address: string): Promise<ApiResponse<boolean>> {
    try {
      await axios.post(`${this.sdkUrl}/api/wallet/disconnect`, {
        address,
      });

      // Remove from connected wallets
      this.connectedWallets.delete(address);

      // Publish disconnection event
      this.eventPublisher.publishWalletConnected('sdk', {
        address,
        action: 'disconnected',
      });

      return {
        success: true,
        data: true,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WALLET_DISCONNECTION_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async getWalletBalance(address: string, chainId: string): Promise<ApiResponse<TokenBalance[]>> {
    try {
      const response = await axios.get(`${this.sdkUrl}/api/wallet/${address}/balance`, {
        params: { chainId },
      });

      return {
        success: true,
        data: response.data.balances,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BALANCE_FETCH_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Transaction methods
  async sendTransaction(request: TransactionRequest): Promise<ApiResponse<any>> {
    try {
      console.log('[GOAT SDK Integration] Sending transaction:', request);

      // Validate wallet is connected
      const wallet = this.connectedWallets.get(request.from);
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      const response = await axios.post(`${this.sdkUrl}/api/transaction/send`, {
        from: request.from,
        to: request.to,
        value: request.value,
        data: request.data,
        gasLimit: request.gasLimit,
        gasPrice: request.gasPrice,
        chainId: request.chainId,
      }, {
        timeout: 60000, // 1 minute timeout for transactions
      });

      const transactionResult = response.data;

      // Publish transaction event
      this.eventPublisher.publishTransaction('sdk', {
        from: request.from,
        to: request.to,
        value: request.value,
        hash: transactionResult.hash,
        status: 'pending',
        chainId: request.chainId,
      });

      return {
        success: true,
        data: transactionResult,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[GOAT SDK Integration] Transaction failed:', error);

      return {
        success: false,
        error: {
          code: 'TRANSACTION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async estimateGas(request: TransactionRequest): Promise<ApiResponse<string>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/transaction/estimate-gas`, {
        from: request.from,
        to: request.to,
        value: request.value,
        data: request.data,
        chainId: request.chainId,
      });

      return {
        success: true,
        data: response.data.gasEstimate,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GAS_ESTIMATION_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async getTransactionStatus(txHash: string, chainId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${this.sdkUrl}/api/transaction/${txHash}/status`, {
        params: { chainId },
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TRANSACTION_STATUS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Smart contract interaction methods
  async callContractMethod(params: {
    contractAddress: string;
    abi: any;
    methodName: string;
    parameters: any[];
    from: string;
    chainId: string;
    value?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/contract/call`, {
        contractAddress: params.contractAddress,
        abi: params.abi,
        methodName: params.methodName,
        parameters: params.parameters,
        from: params.from,
        chainId: params.chainId,
        value: params.value || '0',
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTRACT_CALL_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async queryContractMethod(params: {
    contractAddress: string;
    abi: any;
    methodName: string;
    parameters: any[];
    chainId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/contract/query`, {
        contractAddress: params.contractAddress,
        abi: params.abi,
        methodName: params.methodName,
        parameters: params.parameters,
        chainId: params.chainId,
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTRACT_QUERY_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // DeFi integration methods
  async swapTokens(params: {
    from: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippage: number;
    chainId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/defi/swap`, params);

      // Publish swap event
      this.eventPublisher.publishTransaction('sdk', {
        type: 'token_swap',
        from: params.from,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        result: response.data,
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TOKEN_SWAP_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async stakeTokens(params: {
    from: string;
    validator: string;
    amount: string;
    chainId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/defi/stake`, params);

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TOKEN_STAKING_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // NFT methods
  async mintNFT(params: {
    from: string;
    contractAddress: string;
    tokenURI: string;
    chainId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/nft/mint`, params);

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NFT_MINT_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async transferNFT(params: {
    from: string;
    to: string;
    contractAddress: string;
    tokenId: string;
    chainId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.sdkUrl}/api/nft/transfer`, params);

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NFT_TRANSFER_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Utility methods
  getConnectedWallets(): GoatWalletProvider[] {
    return Array.from(this.connectedWallets.values());
  }

  isWalletConnected(address: string): boolean {
    return this.connectedWallets.has(address);
  }

  async getSupportedChains(): Promise<ApiResponse<string[]>> {
    try {
      const response = await axios.get(`${this.sdkUrl}/api/chains/supported`);

      return {
        success: true,
        data: response.data.chains,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUPPORTED_CHAINS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Create wallet configuration for agents
  createWalletConfig(walletProvider: GoatWalletProvider, permissions: string[]): WalletConfig {
    return {
      chainId: walletProvider.chainId,
      network: walletProvider.chainId.includes('testnet') ? 'testnet' : 'mainnet',
      walletProvider: 'goat-sdk',
      address: walletProvider.address,
      permissions: permissions.map(perm => ({
        type: perm as any,
        limits: {
          daily: 1000,
          perTransaction: 100,
        },
      })),
    };
  }
}

export default GoatSDKIntegration;
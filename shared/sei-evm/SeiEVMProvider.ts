import { ethers } from 'ethers'
import { SeiEVMConfig, EVM_RPC_ENDPOINTS, EVM_WS_ENDPOINTS, POINTER_PRECOMPILE_ADDRESS } from './config'

export type NetworkType = 'mainnet' | 'testnet' | 'devnet'

/**
 * Sei EVM Provider - Handles all EVM interactions on Sei
 */
export class SeiEVMProvider {
  private provider: ethers.JsonRpcProvider
  private wsProvider?: ethers.WebSocketProvider
  private network: NetworkType
  private signer?: ethers.Signer

  constructor(network: NetworkType = 'mainnet', privateKey?: string) {
    this.network = network
    this.provider = new ethers.JsonRpcProvider(EVM_RPC_ENDPOINTS[network])
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider)
    }
  }

  /**
   * Connect WebSocket provider for real-time updates
   */
  async connectWebSocket(): Promise<void> {
    const wsUrl = EVM_WS_ENDPOINTS[this.network]
    this.wsProvider = new ethers.WebSocketProvider(wsUrl)
  }

  /**
   * Get the current provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider
  }

  /**
   * Get WebSocket provider
   */
  getWsProvider(): ethers.WebSocketProvider | undefined {
    return this.wsProvider
  }

  /**
   * Connect a wallet using private key
   */
  connectWallet(privateKey: string): ethers.Wallet {
    const wallet = new ethers.Wallet(privateKey, this.provider)
    this.signer = wallet
    return wallet
  }

  /**
   * Get connected signer
   */
  getSigner(): ethers.Signer | undefined {
    return this.signer
  }

  /**
   * Get chain configuration
   */
  getChainConfig() {
    return SeiEVMConfig[this.network]
  }

  /**
   * Switch network
   */
  async switchNetwork(network: NetworkType): Promise<void> {
    this.network = network
    this.provider = new ethers.JsonRpcProvider(EVM_RPC_ENDPOINTS[network])
    
    if (this.signer && 'privateKey' in this.signer) {
      const privateKey = (this.signer as ethers.Wallet).privateKey
      this.signer = new ethers.Wallet(privateKey, this.provider)
    }
  }

  /**
   * Get balance of an address
   */
  async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address)
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber()
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.getTransactionReceipt(txHash)
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(tx)
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    return await this.provider.getFeeData().then(data => data.gasPrice || 0n)
  }

  /**
   * Send transaction
   */
  async sendTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer connected')
    }
    return await this.signer.sendTransaction(tx)
  }

  /**
   * Call a contract method (read-only)
   */
  async call(tx: ethers.TransactionRequest): Promise<string> {
    return await this.provider.call(tx)
  }

  /**
   * Get pointer address for a Cosmos address using precompile
   * This allows interaction between Cosmos and EVM
   */
  async getPointerAddress(cosmosAddress: string): Promise<string> {
    const iface = new ethers.Interface([
      'function getEvmAddr(string) view returns (address)'
    ])
    
    const data = iface.encodeFunctionData('getEvmAddr', [cosmosAddress])
    
    const result = await this.provider.call({
      to: POINTER_PRECOMPILE_ADDRESS,
      data
    })
    
    return iface.decodeFunctionResult('getEvmAddr', result)[0]
  }

  /**
   * Get Cosmos address from EVM address using precompile
   */
  async getCosmosAddress(evmAddress: string): Promise<string> {
    const iface = new ethers.Interface([
      'function getSeiAddr(address) view returns (string)'
    ])
    
    const data = iface.encodeFunctionData('getSeiAddr', [evmAddress])
    
    const result = await this.provider.call({
      to: POINTER_PRECOMPILE_ADDRESS,
      data
    })
    
    return iface.decodeFunctionResult('getSeiAddr', result)[0]
  }

  /**
   * Subscribe to new blocks
   */
  onBlock(callback: (blockNumber: number) => void): void {
    if (this.wsProvider) {
      this.wsProvider.on('block', callback)
    } else {
      this.provider.on('block', callback)
    }
  }

  /**
   * Subscribe to pending transactions
   */
  onPendingTransaction(callback: (txHash: string) => void): void {
    if (this.wsProvider) {
      this.wsProvider.on('pending', callback)
    }
  }

  /**
   * Cleanup providers
   */
  async disconnect(): Promise<void> {
    if (this.wsProvider) {
      await this.wsProvider.destroy()
    }
    this.provider.removeAllListeners()
  }
}
import { BaseAgent } from '../../agents/BaseAgent'
import { SeiEVMProvider, NetworkType } from '../../../../shared/sei-evm/SeiEVMProvider'
import { SeiERC20Contract, SeiERC721Contract } from '../../../../shared/sei-evm/contracts/SeiEVMContract'
import { ethers } from 'ethers'

export interface SeiEVMAgentConfig {
  network: NetworkType
  privateKey?: string
  rpcUrl?: string
  enableWebSocket?: boolean
}

/**
 * Sei EVM Agent - Handles all EVM interactions on Sei blockchain
 */
export class SeiEVMAgent extends BaseAgent {
  private provider: SeiEVMProvider
  private config: SeiEVMAgentConfig
  private wallet?: ethers.Wallet

  constructor(config: SeiEVMAgentConfig) {
    super({
      id: `sei-evm-agent-${Date.now()}`,
      name: 'Sei EVM Agent',
      type: 'blockchain',
      capabilities: ['evm-transactions', 'smart-contracts', 'token-operations', 'nft-operations']
    })
    
    this.config = config
    this.provider = new SeiEVMProvider(config.network, config.privateKey)
    
    if (config.privateKey) {
      this.wallet = this.provider.connectWallet(config.privateKey)
    }
  }

  async initialize(): Promise<void> {
    await super.initialize()
    
    if (this.config.enableWebSocket) {
      await this.provider.connectWebSocket()
      console.log(`WebSocket connected to Sei ${this.config.network}`)
    }
    
    // Subscribe to blocks if WebSocket is enabled
    if (this.config.enableWebSocket) {
      this.provider.onBlock((blockNumber) => {
        this.emit('block', { blockNumber })
      })
    }
    
    console.log(`Sei EVM Agent initialized on ${this.config.network}`)
  }

  /**
   * Get wallet address
   */
  async getAddress(): Promise<string | undefined> {
    return this.wallet?.address
  }

  /**
   * Get SEI balance
   */
  async getBalance(address?: string): Promise<string> {
    const addr = address || this.wallet?.address
    if (!addr) throw new Error('No address provided')
    
    const balance = await this.provider.getBalance(addr)
    return ethers.formatEther(balance)
  }

  /**
   * Send SEI to another address
   */
  async sendSEI(to: string, amount: string): Promise<string> {
    if (!this.wallet) throw new Error('No wallet connected')
    
    const tx = await this.provider.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    })
    
    await tx.wait()
    return tx.hash
  }

  /**
   * Deploy a smart contract
   */
  async deployContract(
    abi: any[],
    bytecode: string,
    ...args: any[]
  ): Promise<string> {
    if (!this.wallet) throw new Error('No wallet connected')
    
    const factory = new ethers.ContractFactory(abi, bytecode, this.wallet)
    const contract = await factory.deploy(...args)
    await contract.waitForDeployment()
    
    const address = await contract.getAddress()
    console.log(`Contract deployed at: ${address}`)
    return address
  }

  /**
   * Interact with ERC20 token
   */
  async getERC20Token(address: string): Promise<SeiERC20Contract> {
    return new SeiERC20Contract(address, this.provider)
  }

  /**
   * Interact with ERC721 NFT
   */
  async getERC721NFT(address: string): Promise<SeiERC721Contract> {
    return new SeiERC721Contract(address, this.provider)
  }

  /**
   * Transfer ERC20 tokens
   */
  async transferERC20(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number = 18
  ): Promise<string> {
    const token = await this.getERC20Token(tokenAddress)
    const amountWei = ethers.parseUnits(amount, decimals)
    
    const tx = await token.transfer(to, amountWei)
    await tx.wait()
    return tx.hash
  }

  /**
   * Get ERC20 token balance
   */
  async getERC20Balance(
    tokenAddress: string,
    address?: string
  ): Promise<string> {
    const addr = address || this.wallet?.address
    if (!addr) throw new Error('No address provided')
    
    const token = await this.getERC20Token(tokenAddress)
    const balance = await token.balanceOf(addr)
    const decimals = await token.decimals()
    
    return ethers.formatUnits(balance, decimals)
  }

  /**
   * Approve ERC20 spending
   */
  async approveERC20(
    tokenAddress: string,
    spender: string,
    amount: string,
    decimals: number = 18
  ): Promise<string> {
    const token = await this.getERC20Token(tokenAddress)
    const amountWei = ethers.parseUnits(amount, decimals)
    
    const tx = await token.approve(spender, amountWei)
    await tx.wait()
    return tx.hash
  }

  /**
   * Transfer NFT
   */
  async transferNFT(
    nftAddress: string,
    to: string,
    tokenId: bigint
  ): Promise<string> {
    const nft = await this.getERC721NFT(nftAddress)
    const tx = await nft.transferFrom(this.wallet!.address, to, tokenId)
    await tx.wait()
    return tx.hash
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(nftAddress: string, tokenId: bigint): Promise<string> {
    const nft = await this.getERC721NFT(nftAddress)
    return await nft.ownerOf(tokenId)
  }

  /**
   * Convert Cosmos address to EVM address
   */
  async cosmosToEVM(cosmosAddress: string): Promise<string> {
    return await this.provider.getPointerAddress(cosmosAddress)
  }

  /**
   * Convert EVM address to Cosmos address
   */
  async evmToCosmos(evmAddress: string): Promise<string> {
    return await this.provider.getCosmosAddress(evmAddress)
  }

  /**
   * Monitor mempool for pending transactions
   */
  async monitorMempool(callback: (txHash: string) => void): Promise<void> {
    this.provider.onPendingTransaction(callback)
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
  async estimateGas(tx: ethers.TransactionRequest): Promise<string> {
    const gas = await this.provider.estimateGas(tx)
    return gas.toString()
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getGasPrice()
    return ethers.formatUnits(gasPrice, 'gwei')
  }

  /**
   * Switch network
   */
  async switchNetwork(network: NetworkType): Promise<void> {
    await this.provider.switchNetwork(network)
    this.config.network = network
    console.log(`Switched to Sei ${network}`)
  }

  async shutdown(): Promise<void> {
    await this.provider.disconnect()
    await super.shutdown()
  }

  async performTask(task: any): Promise<any> {
    switch (task.type) {
      case 'send-sei':
        return await this.sendSEI(task.to, task.amount)
      case 'get-balance':
        return await this.getBalance(task.address)
      case 'deploy-contract':
        return await this.deployContract(task.abi, task.bytecode, ...task.args)
      case 'transfer-erc20':
        return await this.transferERC20(task.tokenAddress, task.to, task.amount, task.decimals)
      case 'transfer-nft':
        return await this.transferNFT(task.nftAddress, task.to, task.tokenId)
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }
}
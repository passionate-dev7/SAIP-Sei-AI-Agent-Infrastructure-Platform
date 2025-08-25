import { ethers } from 'ethers'
import { SeiEVMProvider } from '../SeiEVMProvider'

/**
 * Base class for Sei EVM smart contract interactions
 */
export class SeiEVMContract {
  protected contract: ethers.Contract
  protected provider: SeiEVMProvider

  constructor(
    address: string,
    abi: any[],
    provider: SeiEVMProvider
  ) {
    this.provider = provider
    const ethersProvider = provider.getProvider()
    const signer = provider.getSigner()
    
    this.contract = new ethers.Contract(
      address,
      abi,
      signer || ethersProvider
    )
  }

  /**
   * Get contract address
   */
  getAddress(): string {
    return this.contract.target as string
  }

  /**
   * Call a read-only method
   */
  async call(method: string, ...args: any[]): Promise<any> {
    return await this.contract[method](...args)
  }

  /**
   * Send a transaction to the contract
   */
  async send(method: string, ...args: any[]): Promise<ethers.TransactionResponse> {
    if (!this.provider.getSigner()) {
      throw new Error('No signer connected to send transactions')
    }
    return await this.contract[method](...args)
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(method: string, ...args: any[]): Promise<bigint> {
    return await this.contract[method].estimateGas(...args)
  }

  /**
   * Encode function data
   */
  encodeFunctionData(method: string, args: any[]): string {
    return this.contract.interface.encodeFunctionData(method, args)
  }

  /**
   * Decode function result
   */
  decodeFunctionResult(method: string, data: string): any {
    return this.contract.interface.decodeFunctionResult(method, data)
  }

  /**
   * Listen to contract events
   */
  on(event: string, callback: (...args: any[]) => void): void {
    this.contract.on(event, callback)
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    this.contract.off(event, callback)
  }

  /**
   * Query past events
   */
  async queryFilter(
    event: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    const filter = this.contract.filters[event]()
    return await this.contract.queryFilter(filter, fromBlock, toBlock)
  }
}

/**
 * ERC20 Token Contract Interface for Sei EVM
 */
export class SeiERC20Contract extends SeiEVMContract {
  private static readonly ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ]

  constructor(address: string, provider: SeiEVMProvider) {
    super(address, SeiERC20Contract.ABI, provider)
  }

  async name(): Promise<string> {
    return await this.call('name')
  }

  async symbol(): Promise<string> {
    return await this.call('symbol')
  }

  async decimals(): Promise<number> {
    return await this.call('decimals')
  }

  async totalSupply(): Promise<bigint> {
    return await this.call('totalSupply')
  }

  async balanceOf(address: string): Promise<bigint> {
    return await this.call('balanceOf', address)
  }

  async transfer(to: string, amount: bigint): Promise<ethers.TransactionResponse> {
    return await this.send('transfer', to, amount)
  }

  async approve(spender: string, amount: bigint): Promise<ethers.TransactionResponse> {
    return await this.send('approve', spender, amount)
  }

  async allowance(owner: string, spender: string): Promise<bigint> {
    return await this.call('allowance', owner, spender)
  }

  async transferFrom(
    from: string,
    to: string,
    amount: bigint
  ): Promise<ethers.TransactionResponse> {
    return await this.send('transferFrom', from, to, amount)
  }
}

/**
 * ERC721 NFT Contract Interface for Sei EVM
 */
export class SeiERC721Contract extends SeiEVMContract {
  private static readonly ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function safeTransferFrom(address from, address to, uint256 tokenId)',
    'function transferFrom(address from, address to, uint256 tokenId)',
    'function approve(address to, uint256 tokenId)',
    'function getApproved(uint256 tokenId) view returns (address)',
    'function setApprovalForAll(address operator, bool approved)',
    'function isApprovedForAll(address owner, address operator) view returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'
  ]

  constructor(address: string, provider: SeiEVMProvider) {
    super(address, SeiERC721Contract.ABI, provider)
  }

  async name(): Promise<string> {
    return await this.call('name')
  }

  async symbol(): Promise<string> {
    return await this.call('symbol')
  }

  async tokenURI(tokenId: bigint): Promise<string> {
    return await this.call('tokenURI', tokenId)
  }

  async balanceOf(owner: string): Promise<bigint> {
    return await this.call('balanceOf', owner)
  }

  async ownerOf(tokenId: bigint): Promise<string> {
    return await this.call('ownerOf', tokenId)
  }

  async transferFrom(
    from: string,
    to: string,
    tokenId: bigint
  ): Promise<ethers.TransactionResponse> {
    return await this.send('transferFrom', from, to, tokenId)
  }

  async safeTransferFrom(
    from: string,
    to: string,
    tokenId: bigint
  ): Promise<ethers.TransactionResponse> {
    return await this.send('safeTransferFrom', from, to, tokenId)
  }

  async approve(to: string, tokenId: bigint): Promise<ethers.TransactionResponse> {
    return await this.send('approve', to, tokenId)
  }

  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<ethers.TransactionResponse> {
    return await this.send('setApprovalForAll', operator, approved)
  }
}
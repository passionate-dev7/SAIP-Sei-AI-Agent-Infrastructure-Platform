import { ethers } from 'ethers';
import { 
  BlockchainProvider,
  TransactionRequest,
  TransactionResponse,
  TransactionReceipt,
  EventCallback
} from '../../types/blockchain';

/**
 * EVM-compatible blockchain provider
 */
export class EVMProvider implements BlockchainProvider {
  readonly name = 'evm';
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  
  constructor(
    private rpcUrl: string,
    public readonly chainId: number,
    public readonly networkName: string,
    private privateKey?: string
  ) {}
  
  async connect(): Promise<void> {
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    
    if (this.privateKey) {
      this.signer = new ethers.Wallet(this.privateKey, this.provider);
    }
    
    // Verify connection
    await this.provider.getNetwork();
  }
  
  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }
  
  isConnected(): boolean {
    return this.provider !== null;
  }
  
  async getAccount(): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }
    
    return await this.signer.getAddress();
  }
  
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const addr = address || await this.getAccount();
    const balance = await this.provider.getBalance(addr);
    
    return ethers.formatEther(balance);
  }
  
  async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available');
    }
    
    const tx = await this.signer.sendTransaction({
      to: transaction.to,
      value: transaction.value ? ethers.parseEther(transaction.value) : 0,
      data: transaction.data || '0x',
      gasLimit: transaction.gasLimit,
      gasPrice: transaction.gasPrice,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      nonce: transaction.nonce,
      type: transaction.type
    });
    
    return {
      hash: tx.hash,
      to: tx.to || undefined,
      from: tx.from,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice?.toString(),
      maxFeePerGas: tx.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
      data: tx.data,
      value: tx.value.toString(),
      chainId: tx.chainId,
      type: tx.type || undefined,
      wait: async (confirmations?: number) => {
        const receipt = await tx.wait(confirmations);
        if (!receipt) {
          throw new Error('Transaction receipt not available');
        }
        
        return {
          to: receipt.to || undefined,
          from: receipt.from,
          contractAddress: receipt.contractAddress || undefined,
          transactionIndex: receipt.index,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.gasPrice.toString(),
          cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
          blockHash: receipt.blockHash,
          blockNumber: receipt.blockNumber,
          transactionHash: receipt.hash,
          logs: receipt.logs.map(log => ({
            address: log.address,
            topics: log.topics,
            data: log.data,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            transactionIndex: log.transactionIndex,
            blockHash: log.blockHash,
            logIndex: log.index,
            removed: log.removed
          })),
          status: receipt.status || undefined,
          confirmations: await receipt.confirmations()
        };
      }
    };
  }
  
  async waitForTransaction(hash: string): Promise<TransactionReceipt> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const receipt = await this.provider.waitForTransaction(hash);
    if (!receipt) {
      throw new Error('Transaction not found or failed');
    }
    
    return {
      to: receipt.to || undefined,
      from: receipt.from,
      contractAddress: receipt.contractAddress || undefined,
      transactionIndex: receipt.index,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.gasPrice.toString(),
      cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
      blockHash: receipt.blockHash,
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.hash,
      logs: receipt.logs.map(log => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        transactionIndex: log.transactionIndex,
        blockHash: log.blockHash,
        logIndex: log.index,
        removed: log.removed
      })),
      status: receipt.status || undefined,
      confirmations: await receipt.confirmations()
    };
  }
  
  async estimateGas(transaction: TransactionRequest): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const gasEstimate = await this.provider.estimateGas({
      to: transaction.to,
      value: transaction.value ? ethers.parseEther(transaction.value) : 0,
      data: transaction.data || '0x',
      from: transaction.from
    });
    
    return gasEstimate.toString();
  }
  
  async deployContract(bytecode: string, abi: any[], args: any[] = []): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }
    
    const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    
    return await contract.getAddress();
  }
  
  async callContract(address: string, abi: any[], method: string, args: any[] = []): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const contract = new ethers.Contract(address, abi, this.signer || this.provider);
    return await contract[method](...args);
  }
  
  async subscribeToEvents(address: string, eventName: string, callback: EventCallback): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const filter = {
      address,
      topics: [ethers.id(eventName)]
    };
    
    this.provider.on(filter, callback);
    
    return `${address}-${eventName}`;
  }
  
  async unsubscribeFromEvents(subscriptionId: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    // Remove all listeners for now - in production you'd want more specific cleanup
    this.provider.removeAllListeners();
  }
  
  async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    return await this.provider.getBlockNumber();
  }
  
  async getGasPrice(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice?.toString() || '0';
  }
  
  async getNonce(address?: string): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    
    const addr = address || await this.getAccount();
    return await this.provider.getTransactionCount(addr);
  }
}
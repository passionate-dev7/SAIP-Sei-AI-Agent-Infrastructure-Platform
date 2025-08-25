import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from '../../agents/BaseAgent';
import { 
  AgentConfig, 
  Task, 
  Message,
  ResourceMetrics
} from '../../types';
import { 
  BlockchainAgent as IBlockchainAgent,
  WalletProvider,
  BlockchainProvider,
  WalletInfo,
  TransactionResponse,
  TransactionHistory,
  PortfolioValue,
  YieldMetrics,
  SwapParameters,
  LiquidityParameters,
  ContractDeployment,
  ContractInteraction,
  WalletEvent
} from '../../types/blockchain';
import { LLMProvider } from '../../lib/llm/LLMProvider';
import { MemorySystem } from '../../lib/memory/MemorySystem';
import { DecisionEngine } from '../../lib/decision/DecisionEngine';
import { RuleBasedDecisionEngine } from '../../lib/decision/RuleBasedDecisionEngine';
import { LLMProviderFactory } from '../../lib/llm/ProviderFactory';
import { InMemoryStorage } from '../../lib/memory/InMemoryStorage';
import { GOATWallet } from '../wallets/GOATWallet';
import { EVMProvider } from '../providers/EVMProvider';

/**
 * Blockchain-enabled agent with DeFi and wallet capabilities
 */
export class BlockchainAgent extends BaseAgent implements IBlockchainAgent {
  walletProvider: WalletProvider;
  blockchainProvider: BlockchainProvider;
  
  private transactionHistory: TransactionHistory[] = [];
  private monitoringActive = false;
  
  constructor(config: BlockchainAgentConfig) {
    super(config);
    
    // Initialize blockchain components
    this.blockchainProvider = new EVMProvider(
      config.blockchainConfig.rpcUrl,
      config.blockchainConfig.chainId,
      config.blockchainConfig.network || 'Unknown',
      config.blockchainConfig.walletConfig.privateKey
    );
    
    this.walletProvider = new GOATWallet(config.blockchainConfig.walletConfig) as any;
  }
  
  protected async createLLMProvider(): Promise<LLMProvider> {
    const factory = LLMProviderFactory.getInstance();
    return await factory.createProvider(this.config.llmConfig);
  }
  
  protected async createMemorySystem(): Promise<MemorySystem> {
    return new MemorySystem(this.config.memoryConfig, new InMemoryStorage());
  }
  
  protected async createDecisionEngine(): Promise<DecisionEngine> {
    return new RuleBasedDecisionEngine();
  }
  
  protected async onInitialize(): Promise<void> {
    await super.onInitialize();
    
    // Connect to blockchain
    await this.blockchainProvider.connect();
    
    // Start monitoring if enabled
    if (this.config.blockchainConfig.monitoringEnabled) {
      this.startMonitoring();
    }
    
    // Store initial wallet info in memory
    const walletInfo = await this.getWalletInfo();
    await this.remember('wallet_info', walletInfo, 0.9);
  }
  
  protected async onShutdown(): Promise<void> {
    this.stopMonitoring();
    await this.blockchainProvider.disconnect();
    await super.onShutdown();
  }
  
  protected async performTask(task: Task): Promise<any> {
    const taskType = task.metadata?.type || 'general';
    
    switch (taskType) {
      case 'wallet_operation':
        return await this.performWalletOperation(task);
      case 'defi_operation':
        return await this.performDefiOperation(task);
      case 'contract_interaction':
        return await this.performContractInteraction(task);
      case 'blockchain_analysis':
        return await this.performBlockchainAnalysis(task);
      default:
        return await this.performGeneralTask(task);
    }
  }
  
  protected async processMessage(message: Message): Promise<void> {
    // Handle blockchain-specific messages
    if (message.type === 'blockchain_request') {
      await this.handleBlockchainRequest(message);
    } else {
      // Handle general messages with blockchain context
      await this.handleGeneralMessage(message);
    }
  }
  
  // IBlockchainAgent implementation
  async getWalletInfo(): Promise<WalletInfo> {
    const address = await this.walletProvider.getAddress();
    const balance = await this.blockchainProvider.getBalance(address);
    
    return {
      address,
      chainId: this.blockchainProvider.chainId,
      network: this.blockchainProvider.networkName,
      type: 'evm',
      connected: this.blockchainProvider.isConnected(),
      balance,
      tokens: [] // Would populate with actual token balances
    };
  }
  
  async checkBalance(token?: string): Promise<string> {
    if (token && token !== 'native') {
      // Check ERC-20 token balance (placeholder)
      return '0';
    } else {
      const address = await this.walletProvider.getAddress();
      return await this.blockchainProvider.getBalance(address);
    }
  }
  
  async transferTokens(to: string, amount: string, token?: string): Promise<TransactionResponse> {
    const tx = await this.blockchainProvider.sendTransaction({
      to,
      value: token ? '0' : amount,
      data: token ? '0x' : '0x' // Would contain token transfer data
    });
    
    // Record transaction
    await this.recordTransaction({
      hash: tx.hash,
      from: await this.walletProvider.getAddress(),
      to,
      value: amount,
      gasUsed: '0', // Would be filled after confirmation
      gasPrice: '0',
      timestamp: new Date(),
      blockNumber: 0,
      status: 'pending',
      type: 'transfer',
      description: `Transfer ${amount} ${token || 'native'} to ${to}`
    });
    
    return tx;
  }
  
  async performSwap(swapParams: SwapParameters): Promise<TransactionResponse> {
    // Use GOAT wallet for DeFi operations
    const result = await this.walletProvider.executeAction({
      type: 'swap',
      parameters: swapParams
    });
    
    if (!result.success || !result.transactionHash) {
      throw new Error(result.error || 'Swap failed');
    }
    
    // Wait for transaction and return response
    return await this.blockchainProvider.waitForTransaction(result.transactionHash);
  }
  
  async provideLiquidity(liquidityParams: LiquidityParameters): Promise<TransactionResponse> {
    const result = await this.walletProvider.executeAction({
      type: 'addLiquidity',
      parameters: liquidityParams
    });
    
    if (!result.success || !result.transactionHash) {
      throw new Error(result.error || 'Liquidity provision failed');
    }
    
    return await this.blockchainProvider.waitForTransaction(result.transactionHash);
  }
  
  async deployContract(contractParams: ContractDeployment): Promise<string> {
    return await this.blockchainProvider.deployContract(
      contractParams.bytecode,
      contractParams.abi,
      contractParams.constructorArgs
    );
  }
  
  async interactWithContract(interaction: ContractInteraction): Promise<any> {
    return await this.blockchainProvider.callContract(
      interaction.address,
      interaction.abi,
      interaction.method,
      interaction.args
    );
  }
  
  monitorTransactions(callback: (tx: any) => void): void {
    // Set up transaction monitoring
    this.on('transactionConfirmed', callback);
  }
  
  monitorWallet(callback: (event: WalletEvent, data: any) => void): void {
    // Set up wallet monitoring
    this.on('walletEvent', (data) => callback(data.event, data.data));
  }
  
  async getTransactionHistory(limit = 100): Promise<TransactionHistory[]> {
    return this.transactionHistory.slice(0, limit);
  }
  
  async getPortfolioValue(): Promise<PortfolioValue> {
    const walletInfo = await this.getWalletInfo();
    
    // Placeholder portfolio calculation
    return {
      totalValue: parseFloat(walletInfo.balance),
      totalValueChange24h: 0,
      assets: [{
        address: 'native',
        symbol: 'SEI',
        name: 'Sei',
        balance: walletInfo.balance,
        price: 1, // Would fetch from price oracle
        value: parseFloat(walletInfo.balance),
        valueChange24h: 0,
        allocation: 100
      }],
      breakdown: {
        tokens: parseFloat(walletInfo.balance),
        liquidity: 0,
        staking: 0,
        lending: 0,
        other: 0
      },
      lastUpdated: new Date()
    };
  }
  
  async getYieldMetrics(): Promise<YieldMetrics> {
    // Placeholder yield calculation
    return {
      totalRewards: 0,
      totalRewardsUSD: 0,
      stakingRewards: 0,
      liquidityRewards: 0,
      lendingRewards: 0,
      apr: 0,
      apy: 0,
      yieldSources: [],
      lastUpdated: new Date()
    };
  }
  
  // Private methods
  private async performWalletOperation(task: Task): Promise<any> {
    const operation = task.input?.operation;
    
    switch (operation) {
      case 'transfer':
        return await this.transferTokens(
          task.input.to,
          task.input.amount,
          task.input.token
        );
      case 'balance':
        return await this.checkBalance(task.input.token);
      case 'info':
        return await this.getWalletInfo();
      default:
        throw new Error(`Unknown wallet operation: ${operation}`);
    }
  }
  
  private async performDefiOperation(task: Task): Promise<any> {
    const operation = task.input?.operation;
    
    switch (operation) {
      case 'swap':
        return await this.performSwap(task.input);
      case 'add_liquidity':
        return await this.provideLiquidity(task.input);
      case 'stake':
        return await this.walletProvider.executeAction({
          type: 'stake',
          parameters: task.input
        });
      default:
        throw new Error(`Unknown DeFi operation: ${operation}`);
    }
  }
  
  private async performContractInteraction(task: Task): Promise<any> {
    if (task.input?.deploy) {
      return await this.deployContract(task.input);
    } else {
      return await this.interactWithContract(task.input);
    }
  }
  
  private async performBlockchainAnalysis(task: Task): Promise<any> {
    // Use LLM to analyze blockchain data
    const prompt = `Analyze the following blockchain data and provide insights:\n${JSON.stringify(task.input, null, 2)}`;
    
    const response = await this.llmProvider.generateText(prompt, {
      maxTokens: 500,
      temperature: 0.3
    });
    
    return {
      analysis: response.content,
      data: task.input,
      timestamp: new Date()
    };
  }
  
  private async performGeneralTask(task: Task): Promise<any> {
    // Use LLM to process general tasks with blockchain context
    const walletInfo = await this.getWalletInfo();
    const portfolio = await this.getPortfolioValue();
    
    const prompt = `As a blockchain-enabled AI agent with the following context:
Wallet: ${walletInfo.address} on ${walletInfo.network}
Balance: ${walletInfo.balance}
Portfolio Value: $${portfolio.totalValue}

Task: ${task.description}
${task.input ? `Input: ${JSON.stringify(task.input)}` : ''}

Please process this task and provide a response.`;
    
    const response = await this.llmProvider.generateText(prompt, {
      maxTokens: 1000,
      temperature: 0.7
    });
    
    return response.content;
  }
  
  private async handleBlockchainRequest(message: Message): Promise<void> {
    try {
      const request = JSON.parse(message.content);
      const result = await this.performTask({
        id: `msg-${message.id}`,
        title: 'Blockchain Request',
        description: request.operation || 'blockchain operation',
        priority: 'medium',
        status: 'pending',
        dependencies: [],
        requiredCapabilities: ['blockchain'],
        input: request,
        progress: 0,
        createdAt: new Date()
      });
      
      await this.sendMessage({
        id: uuidv4(),
        from: this.id,
        to: message.from,
        content: JSON.stringify(result),
        type: 'blockchain_response',
        timestamp: new Date()
      });
      
    } catch (error) {
      await this.sendMessage({
        id: uuidv4(),
        from: this.id,
        to: message.from,
        content: JSON.stringify({ error: error.message }),
        type: 'blockchain_error',
        timestamp: new Date()
      });
    }
  }
  
  private async handleGeneralMessage(message: Message): Promise<void> {
    // Process message with blockchain context
    const walletInfo = await this.getWalletInfo();
    
    const prompt = `As a blockchain agent with wallet ${walletInfo.address}, respond to this message:
From: ${message.from}
Content: ${message.content}
Type: ${message.type}

Provide a helpful response considering my blockchain capabilities.`;
    
    const response = await this.llmProvider.generateText(prompt, {
      maxTokens: 300,
      temperature: 0.7
    });
    
    await this.sendMessage({
      id: uuidv4(),
      from: this.id,
      to: message.from,
      content: response.content,
      type: 'text',
      timestamp: new Date()
    });
  }
  
  private async recordTransaction(tx: TransactionHistory): Promise<void> {
    this.transactionHistory.unshift(tx);
    
    // Keep only last 1000 transactions
    if (this.transactionHistory.length > 1000) {
      this.transactionHistory = this.transactionHistory.slice(0, 1000);
    }
    
    // Store in memory
    await this.remember(`transaction_${tx.hash}`, tx, 0.8);
    
    this.emit('transactionRecorded', { transaction: tx });
  }
  
  private startMonitoring(): void {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    
    // Monitor for new blocks and transactions
    setInterval(async () => {
      try {
        const currentBlock = await this.blockchainProvider.getBlockNumber();
        const lastKnownBlock = await this.recall('last_block') || 0;
        
        if (currentBlock > lastKnownBlock) {
          await this.remember('last_block', currentBlock);
          this.emit('newBlock', { blockNumber: currentBlock });
        }
      } catch (error) {
        console.warn('Block monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }
  
  private stopMonitoring(): void {
    this.monitoringActive = false;
    // Clear intervals would be handled here in production
  }
  
  // Override getMetrics to include blockchain metrics
  getMetrics(): ResourceMetrics {
    const baseMetrics = super.getMetrics();
    
    return {
      ...baseMetrics,
      // Add blockchain-specific metrics
      cost: baseMetrics.cost + this.calculateTransactionCosts()
    };
  }
  
  private calculateTransactionCosts(): number {
    return this.transactionHistory.reduce((total, tx) => {
      const gasPrice = parseFloat(tx.gasPrice) || 0;
      const gasUsed = parseFloat(tx.gasUsed) || 0;
      return total + (gasPrice * gasUsed);
    }, 0);
  }
}

// Configuration interface
export interface BlockchainAgentConfig extends AgentConfig {
  blockchainConfig: {
    rpcUrl: string;
    chainId: number;
    network?: string;
    walletConfig: {
      privateKey?: string;
      mnemonic?: string;
    };
    monitoringEnabled?: boolean;
  };
}
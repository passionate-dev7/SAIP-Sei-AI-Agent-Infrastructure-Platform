/**
 * Transaction Builder Utilities for Sui SDK
 * Comprehensive transaction building with PTB support and optimization
 */

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import type {
  SuiAddress,
  ObjectId,
  TransactionOptions,
  TransactionResult,
  ExecuteTransactionOptions,
  MoveCallParams,
  SuiTransactionBlockResponse,
  SuiExecuteTransactionRequestType,
} from '../types';
import { SuiValidator } from '../utils/validation';
import { SuiErrorFactory } from '../errors/SuiSDKError';

/**
 * Main transaction builder class
 */
export class TransactionBuilder {
  private client: SuiClient;
  private txb: TransactionBlock;
  private sender?: SuiAddress;

  constructor(client: SuiClient, sender?: SuiAddress) {
    this.client = client;
    this.txb = new TransactionBlock();
    if (sender) {
      this.sender = SuiValidator.address.validate(sender);
      this.txb.setSender(this.sender);
    }
  }

  /**
   * Create a new transaction builder instance
   */
  static create(client: SuiClient, sender?: SuiAddress): TransactionBuilder {
    return new TransactionBuilder(client, sender);
  }

  /**
   * Set the sender of the transaction
   */
  setSender(sender: SuiAddress): this {
    this.sender = SuiValidator.address.validate(sender);
    this.txb.setSender(this.sender);
    return this;
  }

  /**
   * Set gas configuration
   */
  setGasConfig(options: {
    budget?: string | number;
    price?: string | number;
    payment?: ObjectId[];
  }): this {
    if (options.budget) {
      const budget = SuiValidator.gas.validateBudget(options.budget);
      this.txb.setGasBudget(budget);
    }

    if (options.price) {
      const price = SuiValidator.gas.validatePrice(options.price);
      this.txb.setGasPrice(price);
    }

    if (options.payment) {
      const validPayment = SuiValidator.objectId.validateMany(options.payment);
      this.txb.setGasPayment(validPayment.map(id => ({ objectId: id, version: '0', digest: '' })));
    }

    return this;
  }

  /**
   * Add a Move call to the transaction
   */
  moveCall(params: MoveCallParams): this {
    const { package: pkg, module, function: func } = SuiValidator.moveCall.validateTarget(params.target);
    
    const typeArguments = params.typeArguments 
      ? SuiValidator.moveCall.validateTypeArguments(params.typeArguments)
      : [];

    this.txb.moveCall({
      target: `${pkg}::${module}::${func}`,
      arguments: params.arguments || [],
      typeArguments,
    });

    return this;
  }

  /**
   * Transfer SUI to a recipient
   */
  transferSui(recipient: SuiAddress, amount: string | number): this {
    const validRecipient = SuiValidator.address.validate(recipient);
    const validAmount = SuiValidator.amount.validatePositive(amount);

    const coin = this.txb.splitCoins(this.txb.gas, [this.txb.pure(validAmount)]);
    this.txb.transferObjects([coin], this.txb.pure(validRecipient));

    return this;
  }

  /**
   * Transfer an object to a recipient
   */
  transferObject(objectId: ObjectId, recipient: SuiAddress): this {
    const validObjectId = SuiValidator.objectId.validate(objectId);
    const validRecipient = SuiValidator.address.validate(recipient);

    const object = this.txb.object(validObjectId);
    this.txb.transferObjects([object], this.txb.pure(validRecipient));

    return this;
  }

  /**
   * Split coins into specified amounts
   */
  splitCoins(coinId: ObjectId, amounts: (string | number)[]): this {
    const validCoinId = SuiValidator.objectId.validate(coinId);
    const validAmounts = SuiValidator.amount.validateAmounts(amounts);

    const coin = this.txb.object(validCoinId);
    const amountArgs = validAmounts.map(amount => this.txb.pure(amount));
    this.txb.splitCoins(coin, amountArgs);

    return this;
  }

  /**
   * Merge coins together
   */
  mergeCoins(primaryCoinId: ObjectId, coinIds: ObjectId[]): this {
    const validPrimaryCoinId = SuiValidator.objectId.validate(primaryCoinId);
    const validCoinIds = SuiValidator.objectId.validateMany(coinIds);

    const primaryCoin = this.txb.object(validPrimaryCoinId);
    const coins = validCoinIds.map(id => this.txb.object(id));
    this.txb.mergeCoins(primaryCoin, coins);

    return this;
  }

  /**
   * Make an object shared
   */
  shareObject(objectId: ObjectId): this {
    const validObjectId = SuiValidator.objectId.validate(objectId);
    const object = this.txb.object(validObjectId);
    this.txb.moveCall({
      target: '0x2::transfer::share_object',
      arguments: [object],
    });

    return this;
  }

  /**
   * Make an object immutable
   */
  freezeObject(objectId: ObjectId): this {
    const validObjectId = SuiValidator.objectId.validate(objectId);
    const object = this.txb.object(validObjectId);
    this.txb.moveCall({
      target: '0x2::transfer::freeze_object',
      arguments: [object],
    });

    return this;
  }

  /**
   * Add pure data to the transaction
   */
  pure(data: any): any {
    return this.txb.pure(data);
  }

  /**
   * Add an object reference to the transaction
   */
  object(objectId: ObjectId): any {
    const validObjectId = SuiValidator.objectId.validate(objectId);
    return this.txb.object(validObjectId);
  }

  /**
   * Build the transaction block without executing
   */
  build(): TransactionBlock {
    return this.txb;
  }

  /**
   * Get the transaction block data as bytes
   */
  async getTransactionData(): Promise<Uint8Array> {
    try {
      return await this.txb.build({
        client: this.client,
      });
    } catch (error) {
      throw SuiErrorFactory.transaction(
        'Failed to build transaction data',
        { error: error instanceof Error ? error.message : error },
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Dry run the transaction to estimate gas and check for errors
   */
  async dryRun(): Promise<{
    gasUsed: string;
    effects: any;
    events: any[];
    status: 'success' | 'failure';
  }> {
    if (!this.sender) {
      throw SuiErrorFactory.transaction('Sender must be set for dry run');
    }

    try {
      const result = await this.client.dryRunTransactionBlock({
        transactionBlock: await this.getTransactionData(),
      });

      return {
        gasUsed: result.effects.gasUsed.computationCost,
        effects: result.effects,
        events: result.events,
        status: result.effects.status?.status || 'failure',
      };
    } catch (error) {
      throw SuiErrorFactory.transaction(
        'Failed to dry run transaction',
        { error: error instanceof Error ? error.message : error },
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute the transaction
   */
  async execute(
    signer: any,
    options: ExecuteTransactionOptions = {}
  ): Promise<TransactionResult> {
    if (!signer) {
      throw SuiErrorFactory.transaction('Signer is required to execute transaction');
    }

    // Set gas configuration if provided
    if (options.gasBudget || options.gasPrice || options.gasPayment) {
      this.setGasConfig({
        budget: options.gasBudget,
        price: options.gasPrice,
        payment: options.gasPayment,
      });
    }

    try {
      const response = await this.client.signAndExecuteTransactionBlock({
        signer,
        transactionBlock: this.txb,
        options: {
          showInput: options.showInput,
          showRawInput: options.showRawInput,
          showEffects: options.showEffects ?? true,
          showEvents: options.showEvents ?? true,
          showObjectChanges: options.showObjectChanges ?? true,
          showBalanceChanges: options.showBalanceChanges ?? true,
        },
        requestType: options.requestType || 'WaitForLocalExecution',
      });

      return {
        digest: response.digest,
        response,
        effects: response.effects,
        balanceChanges: response.balanceChanges || [],
        objectChanges: response.objectChanges || [],
      };
    } catch (error) {
      throw SuiErrorFactory.transaction(
        'Transaction execution failed',
        { 
          error: error instanceof Error ? error.message : error,
          sender: this.sender,
        },
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sign the transaction without executing
   */
  async sign(signer: any): Promise<{
    transactionBlockBytes: string;
    signature: string;
  }> {
    if (!signer) {
      throw SuiErrorFactory.transaction('Signer is required to sign transaction');
    }

    try {
      return await this.client.signTransactionBlock({
        signer,
        transactionBlock: this.txb,
      });
    } catch (error) {
      throw SuiErrorFactory.transaction(
        'Transaction signing failed',
        { error: error instanceof Error ? error.message : error },
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute a signed transaction
   */
  async executeSignedTransaction(
    transactionBlockBytes: string,
    signature: string,
    options: ExecuteTransactionOptions = {}
  ): Promise<TransactionResult> {
    try {
      const response = await this.client.executeTransactionBlock({
        transactionBlock: transactionBlockBytes,
        signature,
        options: {
          showInput: options.showInput,
          showRawInput: options.showRawInput,
          showEffects: options.showEffects ?? true,
          showEvents: options.showEvents ?? true,
          showObjectChanges: options.showObjectChanges ?? true,
          showBalanceChanges: options.showBalanceChanges ?? true,
        },
        requestType: options.requestType || 'WaitForLocalExecution',
      });

      return {
        digest: response.digest,
        response,
        effects: response.effects,
        balanceChanges: response.balanceChanges || [],
        objectChanges: response.objectChanges || [],
      };
    } catch (error) {
      throw SuiErrorFactory.transaction(
        'Signed transaction execution failed',
        { error: error instanceof Error ? error.message : error },
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Clone the transaction builder
   */
  clone(): TransactionBuilder {
    const cloned = new TransactionBuilder(this.client, this.sender);
    // Note: TransactionBlock doesn't have a built-in clone method
    // This is a simplified clone that creates a new instance
    return cloned;
  }

  /**
   * Reset the transaction builder to start fresh
   */
  reset(): this {
    this.txb = new TransactionBlock();
    if (this.sender) {
      this.txb.setSender(this.sender);
    }
    return this;
  }

  /**
   * Get transaction summary for debugging
   */
  getSummary(): {
    sender?: SuiAddress;
    commandCount: number;
    gasConfig: {
      budget?: string;
      price?: string;
    };
  } {
    return {
      sender: this.sender,
      commandCount: (this.txb as any).blockData?.transactions?.length || 0,
      gasConfig: {
        budget: (this.txb as any).blockData?.gasConfig?.budget,
        price: (this.txb as any).blockData?.gasConfig?.price,
      },
    };
  }
}
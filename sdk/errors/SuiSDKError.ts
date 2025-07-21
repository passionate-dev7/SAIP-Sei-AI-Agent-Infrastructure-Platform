/**
 * Custom Error Classes for Sui SDK Integration
 * Comprehensive error handling with detailed context
 */

import type { SuiErrorCode, SuiSDKError, TransactionDigest } from '../types';

/**
 * Base error class for all Sui SDK operations
 */
export class BaseSuiSDKError extends Error implements SuiSDKError {
  public readonly code: SuiErrorCode;
  public readonly details?: any;
  public readonly txDigest?: TransactionDigest;
  public readonly cause?: Error;

  constructor(
    code: SuiErrorCode,
    message: string,
    details?: any,
    txDigest?: TransactionDigest,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.txDigest = txDigest;
    this.cause = cause;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, BaseSuiSDKError.prototype);
  }

  /**
   * Convert error to a plain object for serialization
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      txDigest: this.txDigest,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }
}

/**
 * Transaction-related errors
 */
export class TransactionError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    txDigest?: TransactionDigest,
    cause?: Error
  ) {
    super('TRANSACTION_FAILED', message, details, txDigest, cause);
  }
}

/**
 * Gas-related errors
 */
export class GasError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('INSUFFICIENT_GAS', message, details, undefined, cause);
  }
}

/**
 * Object-related errors
 */
export class ObjectError extends BaseSuiSDKError {
  constructor(
    code: 'OBJECT_NOT_FOUND' | 'INVALID_OBJECT_TYPE' | 'OWNERSHIP_ERROR',
    message: string,
    details?: any,
    cause?: Error
  ) {
    super(code, message, details, undefined, cause);
  }
}

/**
 * Wallet-related errors
 */
export class WalletError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('WALLET_ERROR', message, details, undefined, cause);
  }
}

/**
 * Balance-related errors
 */
export class BalanceError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('INSUFFICIENT_BALANCE', message, details, undefined, cause);
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('NETWORK_ERROR', message, details, undefined, cause);
  }
}

/**
 * Module interaction errors
 */
export class ModuleError extends BaseSuiSDKError {
  constructor(
    code: 'MODULE_NOT_FOUND' | 'FUNCTION_NOT_FOUND',
    message: string,
    details?: any,
    cause?: Error
  ) {
    super(code, message, details, undefined, cause);
  }
}

/**
 * Type validation errors
 */
export class TypeError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('TYPE_ERROR', message, details, undefined, cause);
  }
}

/**
 * Address validation errors
 */
export class AddressError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('INVALID_ADDRESS', message, details, undefined, cause);
  }
}

/**
 * Gas estimation errors
 */
export class GasEstimationError extends BaseSuiSDKError {
  constructor(
    message: string,
    details?: any,
    cause?: Error
  ) {
    super('GAS_ESTIMATION_ERROR', message, details, undefined, cause);
  }
}

/**
 * Error factory for creating specific error types
 */
export class SuiErrorFactory {
  static transaction(message: string, details?: any, txDigest?: TransactionDigest, cause?: Error): TransactionError {
    return new TransactionError(message, details, txDigest, cause);
  }

  static gas(message: string, details?: any, cause?: Error): GasError {
    return new GasError(message, details, cause);
  }

  static objectNotFound(objectId: string, cause?: Error): ObjectError {
    return new ObjectError(
      'OBJECT_NOT_FOUND',
      `Object not found: ${objectId}`,
      { objectId },
      cause
    );
  }

  static invalidObjectType(objectId: string, expectedType: string, actualType: string, cause?: Error): ObjectError {
    return new ObjectError(
      'INVALID_OBJECT_TYPE',
      `Invalid object type for ${objectId}. Expected: ${expectedType}, Got: ${actualType}`,
      { objectId, expectedType, actualType },
      cause
    );
  }

  static ownership(message: string, details?: any, cause?: Error): ObjectError {
    return new ObjectError('OWNERSHIP_ERROR', message, details, cause);
  }

  static wallet(message: string, details?: any, cause?: Error): WalletError {
    return new WalletError(message, details, cause);
  }

  static balance(required: string, available: string, coinType: string = 'SUI', cause?: Error): BalanceError {
    return new BalanceError(
      `Insufficient balance. Required: ${required} ${coinType}, Available: ${available} ${coinType}`,
      { required, available, coinType },
      cause
    );
  }

  static network(message: string, details?: any, cause?: Error): NetworkError {
    return new NetworkError(message, details, cause);
  }

  static moduleNotFound(packageId: string, moduleName: string, cause?: Error): ModuleError {
    return new ModuleError(
      'MODULE_NOT_FOUND',
      `Module not found: ${packageId}::${moduleName}`,
      { packageId, moduleName },
      cause
    );
  }

  static functionNotFound(target: string, cause?: Error): ModuleError {
    return new ModuleError(
      'FUNCTION_NOT_FOUND',
      `Function not found: ${target}`,
      { target },
      cause
    );
  }

  static type(message: string, details?: any, cause?: Error): TypeError {
    return new TypeError(message, details, cause);
  }

  static address(address: string, cause?: Error): AddressError {
    return new AddressError(
      `Invalid Sui address: ${address}`,
      { address },
      cause
    );
  }

  static gasEstimation(message: string, details?: any, cause?: Error): GasEstimationError {
    return new GasEstimationError(message, details, cause);
  }
}

/**
 * Utility functions for error handling
 */
export class ErrorUtils {
  /**
   * Check if an error is a Sui SDK error
   */
  static isSuiSDKError(error: any): error is BaseSuiSDKError {
    return error instanceof BaseSuiSDKError;
  }

  /**
   * Extract error details from various error types
   */
  static extractErrorDetails(error: any): { code: string; message: string; details?: any } {
    if (this.isSuiSDKError(error)) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: { stack: error.stack },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
    };
  }

  /**
   * Create a user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    if (this.isSuiSDKError(error)) {
      switch (error.code) {
        case 'INSUFFICIENT_GAS':
          return 'Not enough gas to complete the transaction. Please increase your gas budget.';
        case 'INSUFFICIENT_BALANCE':
          return 'Insufficient balance to complete this operation.';
        case 'OBJECT_NOT_FOUND':
          return 'The requested object could not be found.';
        case 'INVALID_ADDRESS':
          return 'The provided address is not valid.';
        case 'NETWORK_ERROR':
          return 'Network connection error. Please try again.';
        case 'TRANSACTION_FAILED':
          return 'Transaction failed to execute. Please check your inputs and try again.';
        default:
          return error.message;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Wrap an unknown error in a Sui SDK error
   */
  static wrap(error: any, code: SuiErrorCode = 'NETWORK_ERROR', message?: string): BaseSuiSDKError {
    if (this.isSuiSDKError(error)) {
      return error;
    }

    return new BaseSuiSDKError(
      code,
      message || (error instanceof Error ? error.message : String(error)),
      undefined,
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}
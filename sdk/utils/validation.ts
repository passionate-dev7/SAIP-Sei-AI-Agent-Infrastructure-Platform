/**
 * Validation Utilities for Sui SDK
 * Comprehensive validation functions for addresses, objects, transactions, etc.
 */

import { isValidSuiAddress, isValidSuiObjectId, normalizeSuiAddress } from '@mysten/sui.js/utils';
import type { SuiAddress, ObjectId, TransactionDigest } from '../types';
import { SuiErrorFactory } from '../errors/SuiSDKError';

/**
 * Address validation utilities
 */
export class AddressValidator {
  /**
   * Validate and normalize a Sui address
   */
  static validate(address: string): SuiAddress {
    if (!address || typeof address !== 'string') {
      throw SuiErrorFactory.address('Address must be a non-empty string');
    }

    if (!isValidSuiAddress(address)) {
      throw SuiErrorFactory.address(address);
    }

    return normalizeSuiAddress(address) as SuiAddress;
  }

  /**
   * Check if an address is valid without throwing
   */
  static isValid(address: string): boolean {
    try {
      return isValidSuiAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Normalize an address if valid, otherwise return null
   */
  static tryNormalize(address: string): SuiAddress | null {
    try {
      return this.validate(address);
    } catch {
      return null;
    }
  }
}

/**
 * Object ID validation utilities
 */
export class ObjectIdValidator {
  /**
   * Validate a Sui object ID
   */
  static validate(objectId: string): ObjectId {
    if (!objectId || typeof objectId !== 'string') {
      throw SuiErrorFactory.type('Object ID must be a non-empty string', { objectId });
    }

    if (!isValidSuiObjectId(objectId)) {
      throw SuiErrorFactory.type('Invalid Sui object ID format', { objectId });
    }

    return objectId as ObjectId;
  }

  /**
   * Check if an object ID is valid without throwing
   */
  static isValid(objectId: string): boolean {
    try {
      return isValidSuiObjectId(objectId);
    } catch {
      return false;
    }
  }

  /**
   * Validate multiple object IDs
   */
  static validateMany(objectIds: string[]): ObjectId[] {
    return objectIds.map((id, index) => {
      try {
        return this.validate(id);
      } catch (error) {
        throw SuiErrorFactory.type(`Invalid object ID at index ${index}`, { objectId: id, index });
      }
    });
  }
}

/**
 * Transaction digest validation
 */
export class TransactionDigestValidator {
  private static readonly DIGEST_LENGTH = 44; // Base58 encoded 32-byte hash
  private static readonly BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

  /**
   * Validate a transaction digest
   */
  static validate(digest: string): TransactionDigest {
    if (!digest || typeof digest !== 'string') {
      throw SuiErrorFactory.type('Transaction digest must be a non-empty string', { digest });
    }

    if (digest.length !== this.DIGEST_LENGTH) {
      throw SuiErrorFactory.type(
        `Transaction digest must be ${this.DIGEST_LENGTH} characters long`,
        { digest, actualLength: digest.length }
      );
    }

    if (!this.BASE58_REGEX.test(digest)) {
      throw SuiErrorFactory.type('Transaction digest must be a valid base58 string', { digest });
    }

    return digest as TransactionDigest;
  }

  /**
   * Check if a transaction digest is valid without throwing
   */
  static isValid(digest: string): boolean {
    try {
      this.validate(digest);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Amount validation utilities
 */
export class AmountValidator {
  /**
   * Validate a positive amount string or number
   */
  static validatePositive(amount: string | number, fieldName: string = 'amount'): string {
    const amountStr = String(amount);
    
    if (!amountStr || amountStr === '0') {
      throw SuiErrorFactory.type(`${fieldName} must be greater than 0`, { amount: amountStr });
    }

    // Check if it's a valid number
    const numAmount = Number(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw SuiErrorFactory.type(`${fieldName} must be a positive number`, { amount: amountStr });
    }

    // Check for decimal places (Sui uses integers in MIST)
    if (amountStr.includes('.')) {
      throw SuiErrorFactory.type(`${fieldName} must be an integer (no decimal places)`, { amount: amountStr });
    }

    return amountStr;
  }

  /**
   * Validate a non-negative amount
   */
  static validateNonNegative(amount: string | number, fieldName: string = 'amount'): string {
    const amountStr = String(amount);
    
    const numAmount = Number(amountStr);
    if (isNaN(numAmount) || numAmount < 0) {
      throw SuiErrorFactory.type(`${fieldName} must be non-negative`, { amount: amountStr });
    }

    if (amountStr.includes('.')) {
      throw SuiErrorFactory.type(`${fieldName} must be an integer (no decimal places)`, { amount: amountStr });
    }

    return amountStr;
  }

  /**
   * Validate amounts array for coin splitting
   */
  static validateAmounts(amounts: (string | number)[]): string[] {
    if (!Array.isArray(amounts) || amounts.length === 0) {
      throw SuiErrorFactory.type('Amounts must be a non-empty array');
    }

    return amounts.map((amount, index) => {
      try {
        return this.validatePositive(amount, `amount[${index}]`);
      } catch (error) {
        throw SuiErrorFactory.type(`Invalid amount at index ${index}`, { amount, index });
      }
    });
  }
}

/**
 * Move call target validation
 */
export class MoveCallValidator {
  private static readonly TARGET_REGEX = /^(0x[a-fA-F0-9]+)::([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)$/;

  /**
   * Validate a Move call target (package::module::function)
   */
  static validateTarget(target: string): { package: string; module: string; function: string } {
    if (!target || typeof target !== 'string') {
      throw SuiErrorFactory.type('Move call target must be a non-empty string', { target });
    }

    const match = target.match(this.TARGET_REGEX);
    if (!match) {
      throw SuiErrorFactory.type(
        'Move call target must be in format "package::module::function"',
        { target }
      );
    }

    const [, packageId, moduleName, functionName] = match;

    // Validate package ID
    ObjectIdValidator.validate(packageId);

    return {
      package: packageId,
      module: moduleName,
      function: functionName,
    };
  }

  /**
   * Validate type arguments
   */
  static validateTypeArguments(typeArgs: string[]): string[] {
    if (!Array.isArray(typeArgs)) {
      throw SuiErrorFactory.type('Type arguments must be an array');
    }

    return typeArgs.map((typeArg, index) => {
      if (!typeArg || typeof typeArg !== 'string') {
        throw SuiErrorFactory.type(`Type argument at index ${index} must be a non-empty string`, {
          typeArg,
          index,
        });
      }
      return typeArg;
    });
  }
}

/**
 * Gas configuration validation
 */
export class GasValidator {
  private static readonly MIN_GAS_BUDGET = BigInt(1000000); // 0.001 SUI
  private static readonly MAX_GAS_BUDGET = BigInt(50000000000); // 50 SUI

  /**
   * Validate gas budget
   */
  static validateBudget(budget: string | number): string {
    const budgetStr = AmountValidator.validatePositive(budget, 'gas budget');
    const budgetBigInt = BigInt(budgetStr);

    if (budgetBigInt < this.MIN_GAS_BUDGET) {
      throw SuiErrorFactory.gas(
        `Gas budget too low. Minimum: ${this.MIN_GAS_BUDGET}, provided: ${budgetBigInt}`,
        { budget: budgetStr, minimum: this.MIN_GAS_BUDGET.toString() }
      );
    }

    if (budgetBigInt > this.MAX_GAS_BUDGET) {
      throw SuiErrorFactory.gas(
        `Gas budget too high. Maximum: ${this.MAX_GAS_BUDGET}, provided: ${budgetBigInt}`,
        { budget: budgetStr, maximum: this.MAX_GAS_BUDGET.toString() }
      );
    }

    return budgetStr;
  }

  /**
   * Validate gas price
   */
  static validatePrice(price: string | number): string {
    return AmountValidator.validatePositive(price, 'gas price');
  }
}

/**
 * Generic validation utilities
 */
export class ValidationUtils {
  /**
   * Validate that a value is not null or undefined
   */
  static required<T>(value: T | null | undefined, fieldName: string): T {
    if (value === null || value === undefined) {
      throw SuiErrorFactory.type(`${fieldName} is required`);
    }
    return value;
  }

  /**
   * Validate array is not empty
   */
  static nonEmptyArray<T>(array: T[], fieldName: string): T[] {
    if (!Array.isArray(array) || array.length === 0) {
      throw SuiErrorFactory.type(`${fieldName} must be a non-empty array`);
    }
    return array;
  }

  /**
   * Validate string is not empty
   */
  static nonEmptyString(value: string, fieldName: string): string {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw SuiErrorFactory.type(`${fieldName} must be a non-empty string`);
    }
    return value.trim();
  }

  /**
   * Validate object has required properties
   */
  static hasProperties<T>(obj: any, properties: (keyof T)[], objName: string): T {
    if (!obj || typeof obj !== 'object') {
      throw SuiErrorFactory.type(`${objName} must be an object`);
    }

    for (const prop of properties) {
      if (!(prop in obj)) {
        throw SuiErrorFactory.type(`${objName} must have property: ${String(prop)}`);
      }
    }

    return obj as T;
  }

  /**
   * Validate enum value
   */
  static validateEnum<T>(value: any, enumValues: T[], fieldName: string): T {
    if (!enumValues.includes(value)) {
      throw SuiErrorFactory.type(
        `${fieldName} must be one of: ${enumValues.join(', ')}`,
        { value, validValues: enumValues }
      );
    }
    return value;
  }
}

/**
 * Main validator class that combines all validators
 */
export class SuiValidator {
  static address = AddressValidator;
  static objectId = ObjectIdValidator;
  static transactionDigest = TransactionDigestValidator;
  static amount = AmountValidator;
  static moveCall = MoveCallValidator;
  static gas = GasValidator;
  static utils = ValidationUtils;
}
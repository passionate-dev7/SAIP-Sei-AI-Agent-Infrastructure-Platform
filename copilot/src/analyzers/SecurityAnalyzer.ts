import { SecurityIssue, ContractLanguage } from '../types';

export class SecurityAnalyzer {
  constructor(private config: any) {}

  async analyze(contract: string): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    
    // Check for reentrancy vulnerabilities
    if (this.hasReentrancyVulnerability(contract)) {
      issues.push({
        severity: 'critical',
        type: 'reentrancy',
        description: 'Potential reentrancy vulnerability detected',
        location: 'transfer function',
        fix: 'Use checks-effects-interactions pattern or reentrancy guard'
      });
    }
    
    // Check for integer overflow/underflow
    if (this.hasIntegerOverflow(contract)) {
      issues.push({
        severity: 'high',
        type: 'integer-overflow',
        description: 'Potential integer overflow/underflow',
        location: 'arithmetic operations',
        fix: 'Use SafeMath library or Solidity 0.8+ with built-in overflow checks'
      });
    }
    
    // Check for unchecked external calls
    if (this.hasUncheckedExternalCalls(contract)) {
      issues.push({
        severity: 'high',
        type: 'unchecked-call',
        description: 'External call return value not checked',
        location: 'external function calls',
        fix: 'Always check return values of external calls'
      });
    }
    
    // Check for access control issues
    if (this.hasAccessControlIssues(contract)) {
      issues.push({
        severity: 'medium',
        type: 'access-control',
        description: 'Missing or weak access control',
        location: 'critical functions',
        fix: 'Implement proper access control modifiers'
      });
    }
    
    // Check for front-running vulnerabilities
    if (this.hasFrontRunningVulnerability(contract)) {
      issues.push({
        severity: 'medium',
        type: 'front-running',
        description: 'Potential front-running vulnerability',
        location: 'price-sensitive operations',
        fix: 'Implement commit-reveal scheme or use flashloan protection'
      });
    }
    
    return issues;
  }

  private hasReentrancyVulnerability(contract: string): boolean {
    // Check for state changes after external calls
    const hasExternalCall = contract.includes('.call') || contract.includes('.transfer');
    const hasStateChange = contract.includes('=') && contract.includes('storage');
    return hasExternalCall && hasStateChange;
  }

  private hasIntegerOverflow(contract: string): boolean {
    // Check for arithmetic without SafeMath
    const hasArithmetic = /[\+\-\*\/]/.test(contract);
    const hasSafeMath = contract.includes('SafeMath') || contract.includes('pragma solidity ^0.8');
    return hasArithmetic && !hasSafeMath;
  }

  private hasUncheckedExternalCalls(contract: string): boolean {
    // Check for calls without require or assert
    const hasCall = contract.includes('.call(') || contract.includes('.delegatecall(');
    const hasCheck = contract.includes('require(') || contract.includes('assert(');
    return hasCall && !hasCheck;
  }

  private hasAccessControlIssues(contract: string): boolean {
    // Check for missing modifiers on critical functions
    const hasCriticalFunction = contract.includes('mint') || contract.includes('burn') || 
                                contract.includes('withdraw') || contract.includes('pause');
    const hasModifier = contract.includes('onlyOwner') || contract.includes('onlyRole');
    return hasCriticalFunction && !hasModifier;
  }

  private hasFrontRunningVulnerability(contract: string): boolean {
    // Check for price-sensitive operations without protection
    const hasPriceSensitive = contract.includes('swap') || contract.includes('trade') || 
                              contract.includes('buy') || contract.includes('sell');
    const hasProtection = contract.includes('commit') || contract.includes('reveal') || 
                         contract.includes('flashloan');
    return hasPriceSensitive && !hasProtection;
  }
}
import { DecisionContext } from '../../types';

/**
 * Abstract base class for decision engines
 */
export abstract class DecisionEngine {
  /**
   * Make a decision based on the given context
   */
  abstract makeDecision(context: DecisionContext): Promise<string>;
  
  /**
   * Evaluate the quality of a decision
   */
  abstract evaluateDecision(decision: string, context: DecisionContext, outcome: any): Promise<number>;
  
  /**
   * Learn from decision outcomes to improve future decisions
   */
  abstract learn(decision: string, context: DecisionContext, outcome: any): Promise<void>;
  
  /**
   * Get decision confidence score (0-1)
   */
  abstract getConfidence(decision: string, context: DecisionContext): Promise<number>;
}
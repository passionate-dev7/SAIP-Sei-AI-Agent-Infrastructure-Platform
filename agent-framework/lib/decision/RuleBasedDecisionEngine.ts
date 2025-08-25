import { DecisionContext } from '../../types';
import { DecisionEngine } from './DecisionEngine';

export interface DecisionRule {
  id: string;
  condition: (context: DecisionContext) => boolean;
  action: string;
  priority: number;
  confidence: number;
}

/**
 * Rule-based decision engine implementation
 */
export class RuleBasedDecisionEngine extends DecisionEngine {
  private rules: DecisionRule[] = [];
  private decisionHistory: Array<{
    decision: string;
    context: DecisionContext;
    outcome: any;
    timestamp: Date;
  }> = [];
  
  constructor() {
    super();
    this.initializeDefaultRules();
  }
  
  addRule(rule: DecisionRule): void {
    this.rules.push(rule);
    this.sortRulesByPriority();
  }
  
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }
  
  async makeDecision(context: DecisionContext): Promise<string> {
    // Find the first rule that matches the context
    for (const rule of this.rules) {
      try {
        if (rule.condition(context)) {
          return rule.action;
        }
      } catch (error) {
        console.warn(`Error evaluating rule ${rule.id}:`, error);
      }
    }
    
    // Default decision if no rules match
    return this.getDefaultDecision(context);
  }
  
  async evaluateDecision(decision: string, context: DecisionContext, outcome: any): Promise<number> {
    // Simple evaluation based on outcome type
    if (outcome === 'success' || outcome?.success === true) {
      return 1.0;
    } else if (outcome === 'failure' || outcome?.success === false) {
      return 0.0;
    } else if (outcome === 'partial' || outcome?.partial === true) {
      return 0.5;
    }
    
    // Try to extract score from outcome
    if (typeof outcome === 'number' && outcome >= 0 && outcome <= 1) {
      return outcome;
    }
    
    if (outcome?.score && typeof outcome.score === 'number') {
      return Math.max(0, Math.min(1, outcome.score));
    }
    
    // Default neutral score
    return 0.5;
  }
  
  async learn(decision: string, context: DecisionContext, outcome: any): Promise<void> {
    // Record the decision and outcome
    this.decisionHistory.push({
      decision,
      context,
      outcome,
      timestamp: new Date()
    });
    
    // Limit history size
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory = this.decisionHistory.slice(-1000);
    }
    
    // Analyze patterns and adjust rule priorities
    await this.adjustRulePriorities();
  }
  
  async getConfidence(decision: string, context: DecisionContext): Promise<number> {
    // Find the rule that would make this decision
    const matchingRule = this.rules.find(rule => {
      try {
        return rule.condition(context) && rule.action === decision;
      } catch {
        return false;
      }
    });
    
    if (matchingRule) {
      // Base confidence on rule confidence and historical success
      const historicalSuccess = this.getHistoricalSuccessRate(decision, context);
      return (matchingRule.confidence + historicalSuccess) / 2;
    }
    
    // Low confidence for decisions without matching rules
    return 0.3;
  }
  
  private initializeDefaultRules(): void {
    this.addRule({
      id: 'high-priority-task',
      condition: (context) => context.currentTask?.priority === 'urgent',
      action: 'execute_immediately',
      priority: 100,
      confidence: 0.9
    });
    
    this.addRule({
      id: 'low-resources',
      condition: (context) => context.resources.cpu > 0.8 || context.resources.memory > 0.9,
      action: 'defer_task',
      priority: 90,
      confidence: 0.8
    });
    
    this.addRule({
      id: 'has-dependencies',
      condition: (context) => context.currentTask?.dependencies.length > 0,
      action: 'wait_for_dependencies',
      priority: 80,
      confidence: 0.7
    });
    
    this.addRule({
      id: 'available-tasks',
      condition: (context) => context.availableTasks.length > 0,
      action: 'select_best_task',
      priority: 50,
      confidence: 0.6
    });
    
    this.addRule({
      id: 'idle-state',
      condition: (context) => context.agentState === 'idle',
      action: 'wait_for_task',
      priority: 10,
      confidence: 0.9
    });
  }
  
  private sortRulesByPriority(): void {
    this.rules.sort((a, b) => b.priority - a.priority);
  }
  
  private getDefaultDecision(context: DecisionContext): string {
    if (context.availableTasks.length > 0) {
      return 'select_first_available_task';
    }
    
    return 'wait';
  }
  
  private getHistoricalSuccessRate(decision: string, context: DecisionContext): number {
    const relevantDecisions = this.decisionHistory.filter(
      record => record.decision === decision
    );
    
    if (relevantDecisions.length === 0) {
      return 0.5; // Neutral success rate for unknown decisions
    }
    
    let totalScore = 0;
    for (const record of relevantDecisions) {
      const score = this.evaluateDecisionOutcome(record.outcome);
      totalScore += score;
    }
    
    return totalScore / relevantDecisions.length;
  }
  
  private evaluateDecisionOutcome(outcome: any): number {
    if (outcome === 'success' || outcome?.success === true) {
      return 1.0;
    } else if (outcome === 'failure' || outcome?.success === false) {
      return 0.0;
    } else if (outcome === 'partial') {
      return 0.5;
    }
    
    if (typeof outcome === 'number' && outcome >= 0 && outcome <= 1) {
      return outcome;
    }
    
    return 0.5;
  }
  
  private async adjustRulePriorities(): Promise<void> {
    // Analyze recent decision history to adjust rule priorities
    const recentDecisions = this.decisionHistory.slice(-100);
    
    for (const rule of this.rules) {
      const ruleDecisions = recentDecisions.filter(
        record => record.decision === rule.action
      );
      
      if (ruleDecisions.length > 0) {
        const successRate = ruleDecisions
          .map(record => this.evaluateDecisionOutcome(record.outcome))
          .reduce((sum, score) => sum + score, 0) / ruleDecisions.length;
        
        // Adjust priority based on success rate
        const adjustment = (successRate - 0.5) * 10; // -5 to +5 adjustment
        rule.priority = Math.max(1, rule.priority + adjustment);
        
        // Adjust confidence based on success rate
        rule.confidence = Math.max(0.1, Math.min(0.95, successRate));
      }
    }
    
    this.sortRulesByPriority();
  }
}
import { DecisionContext } from '../../types';
import { DecisionEngine } from './DecisionEngine';
import { LLMProvider } from '../llm/LLMProvider';

/**
 * LLM-powered decision engine that uses language models for decision making
 */
export class LLMDecisionEngine extends DecisionEngine {
  private decisionHistory: Array<{
    decision: string;
    context: DecisionContext;
    outcome: any;
    timestamp: Date;
    score?: number;
  }> = [];
  
  constructor(private llmProvider: LLMProvider) {
    super();
  }
  
  async makeDecision(context: DecisionContext): Promise<string> {
    const prompt = this.buildDecisionPrompt(context);
    
    try {
      const response = await this.llmProvider.generateText(prompt, {
        maxTokens: 150,
        temperature: 0.3 // Lower temperature for more consistent decisions
      });
      
      return this.extractDecision(response.content);
      
    } catch (error) {
      console.warn('LLM decision making failed, using fallback:', error);
      return this.getFallbackDecision(context);
    }
  }
  
  async evaluateDecision(decision: string, context: DecisionContext, outcome: any): Promise<number> {
    const prompt = this.buildEvaluationPrompt(decision, context, outcome);
    
    try {
      const response = await this.llmProvider.generateText(prompt, {
        maxTokens: 50,
        temperature: 0.1
      });
      
      const score = this.extractScore(response.content);
      return Math.max(0, Math.min(1, score));
      
    } catch (error) {
      console.warn('LLM evaluation failed, using fallback:', error);
      return this.getFallbackEvaluation(outcome);
    }
  }
  
  async learn(decision: string, context: DecisionContext, outcome: any): Promise<void> {
    const score = await this.evaluateDecision(decision, context, outcome);
    
    this.decisionHistory.push({
      decision,
      context,
      outcome,
      timestamp: new Date(),
      score
    });
    
    // Limit history size
    if (this.decisionHistory.length > 500) {
      this.decisionHistory = this.decisionHistory.slice(-500);
    }
  }
  
  async getConfidence(decision: string, context: DecisionContext): Promise<number> {
    const prompt = this.buildConfidencePrompt(decision, context);
    
    try {
      const response = await this.llmProvider.generateText(prompt, {
        maxTokens: 50,
        temperature: 0.1
      });
      
      const confidence = this.extractScore(response.content);
      return Math.max(0, Math.min(1, confidence));
      
    } catch (error) {
      console.warn('LLM confidence estimation failed:', error);
      return 0.5; // Default moderate confidence
    }
  }
  
  private buildDecisionPrompt(context: DecisionContext): string {
    const historicalContext = this.getRelevantHistoricalContext();
    
    return `You are an AI agent decision engine. Based on the following context, decide what action to take.

Current Context:
- Agent State: ${context.agentState}
- Current Task: ${context.currentTask ? `${context.currentTask.title} (Priority: ${context.currentTask.priority})` : 'None'}
- Available Tasks: ${context.availableTasks.length} tasks
- Resource Usage: CPU ${Math.round(context.resources.cpu * 100)}%, Memory ${Math.round(context.resources.memory / 1024 / 1024)}MB
- Constraints: ${JSON.stringify(context.constraints || {})}

${historicalContext}

Based on this context, what should the agent do next? Provide a clear, actionable decision in 1-2 sentences.

Decision:`;
  }
  
  private buildEvaluationPrompt(decision: string, context: DecisionContext, outcome: any): string {
    return `Evaluate the quality of this decision:

Decision Made: ${decision}
Context: Agent was ${context.agentState} with ${context.availableTasks.length} available tasks
Outcome: ${JSON.stringify(outcome)}

Rate the decision quality from 0.0 (very poor) to 1.0 (excellent) based on:
- How well the decision matched the context
- The outcome achieved
- Resource efficiency
- Goal alignment

Score (0.0-1.0):`;
  }
  
  private buildConfidencePrompt(decision: string, context: DecisionContext): string {
    const historicalSuccess = this.getHistoricalSuccessRate(decision);
    
    return `Rate your confidence in this decision:

Decision: ${decision}
Context: Agent state is ${context.agentState}, ${context.availableTasks.length} available tasks
Historical success rate for similar decisions: ${Math.round(historicalSuccess * 100)}%

How confident are you that this is the right decision? Rate from 0.0 (no confidence) to 1.0 (very confident).

Confidence (0.0-1.0):`;
  }
  
  private extractDecision(text: string): string {
    // Clean up the response and extract the main decision
    const lines = text.trim().split('\n');
    const decisionLine = lines.find(line => 
      line.toLowerCase().includes('decision') || 
      line.toLowerCase().includes('should') ||
      line.toLowerCase().includes('action')
    ) || lines[0];
    
    return decisionLine.replace(/^(Decision|Action):\s*/i, '').trim();
  }
  
  private extractScore(text: string): number {
    // Extract numeric score from text
    const matches = text.match(/(\d+\.?\d*)/);
    if (matches) {
      const score = parseFloat(matches[1]);
      // If score is > 1, assume it's a percentage
      return score > 1 ? score / 100 : score;
    }
    
    // Fallback: look for qualitative indicators
    const lowerText = text.toLowerCase();
    if (lowerText.includes('excellent') || lowerText.includes('very good')) return 0.9;
    if (lowerText.includes('good') || lowerText.includes('successful')) return 0.7;
    if (lowerText.includes('average') || lowerText.includes('okay')) return 0.5;
    if (lowerText.includes('poor') || lowerText.includes('bad')) return 0.3;
    if (lowerText.includes('very poor') || lowerText.includes('terrible')) return 0.1;
    
    return 0.5; // Default neutral score
  }
  
  private getFallbackDecision(context: DecisionContext): string {
    if (context.currentTask) {
      return 'continue_current_task';
    }
    
    if (context.availableTasks.length > 0) {
      const highPriorityTasks = context.availableTasks.filter(
        task => task.priority === 'urgent' || task.priority === 'high'
      );
      
      if (highPriorityTasks.length > 0) {
        return 'execute_high_priority_task';
      }
      
      return 'execute_next_available_task';
    }
    
    return 'wait_for_tasks';
  }
  
  private getFallbackEvaluation(outcome: any): number {
    if (outcome === 'success' || outcome?.success === true) {
      return 0.8;
    } else if (outcome === 'failure' || outcome?.success === false) {
      return 0.2;
    } else if (outcome === 'partial') {
      return 0.5;
    }
    
    if (typeof outcome === 'number' && outcome >= 0 && outcome <= 1) {
      return outcome;
    }
    
    return 0.5;
  }
  
  private getRelevantHistoricalContext(): string {
    if (this.decisionHistory.length === 0) {
      return '';
    }
    
    const recentDecisions = this.decisionHistory.slice(-10);
    const successfulDecisions = recentDecisions.filter(record => 
      (record.score || 0) > 0.6
    );
    
    if (successfulDecisions.length === 0) {
      return '';
    }
    
    return `\nRecent Successful Decisions:\n${
      successfulDecisions.map(record => 
        `- ${record.decision} (Score: ${record.score?.toFixed(2)})`
      ).join('\n')
    }`;
  }
  
  private getHistoricalSuccessRate(decision: string): number {
    const relevantDecisions = this.decisionHistory.filter(
      record => record.decision.toLowerCase().includes(decision.toLowerCase()) ||
                decision.toLowerCase().includes(record.decision.toLowerCase())
    );
    
    if (relevantDecisions.length === 0) {
      return 0.5;
    }
    
    const totalScore = relevantDecisions.reduce(
      (sum, record) => sum + (record.score || 0.5), 
      0
    );
    
    return totalScore / relevantDecisions.length;
  }
}
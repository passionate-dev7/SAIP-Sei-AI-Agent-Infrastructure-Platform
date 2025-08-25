import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  IAgent, 
  AgentId, 
  TaskId, 
  MessageId, 
  AgentStatus, 
  TaskStatus,
  Task, 
  Message, 
  AgentConfig,
  AgentSkills,
  ResourceMetrics,
  DecisionContext,
  AgentPerformanceMetrics
} from '../types';
import { MemoryEntry, MemoryType, MemoryAccessibility } from '../types/memory';
import { LLMProvider } from '../lib/llm';
import { MemorySystem } from '../lib/memory';
import { DecisionEngine } from '../lib/decision';

/**
 * Base Agent implementation providing core functionality for autonomous agents
 */
export abstract class BaseAgent extends EventEmitter implements IAgent {
  readonly id: AgentId;
  readonly config: AgentConfig;
  
  protected _status: AgentStatus = AgentStatus.IDLE;
  protected _currentTasks: Task[] = [];
  protected _metrics: AgentPerformanceMetrics;
  
  protected llmProvider!: LLMProvider;
  protected memorySystem!: MemorySystem;
  protected decisionEngine!: DecisionEngine;
  
  private _initialized = false;
  private _shutdownRequested = false;
  
  constructor(config: AgentConfig) {
    super();
    
    this.id = config.id;
    this.config = { ...config };
    
    // Initialize metrics
    this._metrics = {
      tasksCompleted: 0,
      tasksSuccessful: 0,
      tasksFailed: 0,
      averageTaskTime: 0,
      totalExecutionTime: 0,
      messagesProcessed: 0,
      decisionsCorrect: 0,
      decisionsIncorrect: 0,
      learningRate: config.behaviorConfig.learningRate,
      adaptationScore: 0,
      collaborationScore: 0,
      resourceEfficiency: 0,
      costPerTask: 0,
      uptime: 0,
      errorRate: 0,
      memoryUsage: 0,
      tokenUsage: 0,
      lastActive: new Date(),
      performanceHistory: []
    };
    
    this.setupEventHandlers();
  }
  
  get status(): AgentStatus {
    return this._status;
  }
  
  protected setStatus(status: AgentStatus): void {
    const oldStatus = this._status;
    this._status = status;
    
    this.emit('statusChanged', { oldStatus, newStatus: status, timestamp: new Date() });
    
    if (status === AgentStatus.ERROR) {
      this.emit('error', new Error(`Agent ${this.id} entered error state`));
    }
  }
  
  async initialize(): Promise<void> {
    if (this._initialized) {
      throw new Error(`Agent ${this.id} is already initialized`);
    }
    
    try {
      this.setStatus(AgentStatus.THINKING);
      
      // Initialize LLM provider
      this.llmProvider = await this.createLLMProvider();
      await this.llmProvider.initialize(this.config.llmConfig);
      
      // Initialize memory system
      this.memorySystem = await this.createMemorySystem();
      await this.memorySystem.initialize();
      
      // Initialize decision engine
      this.decisionEngine = await this.createDecisionEngine();
      
      // Perform agent-specific initialization
      await this.onInitialize();
      
      this._initialized = true;
      this.setStatus(AgentStatus.IDLE);
      
      this.emit('initialized', { timestamp: new Date() });
      
    } catch (error) {
      this.setStatus(AgentStatus.ERROR);
      throw new Error(`Failed to initialize agent ${this.id}: ${error}`);
    }
  }
  
  async shutdown(): Promise<void> {
    if (!this._initialized || this._shutdownRequested) {
      return;
    }
    
    this._shutdownRequested = true;
    
    try {
      // Cancel all current tasks
      for (const task of this._currentTasks) {
        await this.cancelTask(task.id);
      }
      
      // Perform agent-specific shutdown
      await this.onShutdown();
      
      // Shutdown components
      if (this.memorySystem) {
        await this.memorySystem.shutdown();
      }
      
      if (this.llmProvider) {
        await this.llmProvider.shutdown();
      }
      
      this.setStatus(AgentStatus.IDLE);
      this.emit('shutdown', { timestamp: new Date() });
      
      // Remove all listeners
      this.removeAllListeners();
      
    } catch (error) {
      this.emit('error', new Error(`Error during shutdown: ${error}`));
    }
  }
  
  async executeTask(task: Task): Promise<any> {
    if (!this.canExecuteTask(task)) {
      throw new Error(`Agent ${this.id} cannot execute task ${task.id}`);
    }
    
    const startTime = Date.now();
    this._currentTasks.push(task);
    this.setStatus(AgentStatus.EXECUTING);
    
    try {
      this.emit('taskStarted', { task, timestamp: new Date() });
      
      // Update task status
      task.status = TaskStatus.IN_PROGRESS;
      task.startedAt = new Date();
      task.assignedTo = this.id;
      
      // Execute the task
      const result = await this.performTask(task);
      
      // Update task completion
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.actualDuration = duration;
      task.output = result;
      task.progress = 100;
      
      // Update metrics
      this._metrics.tasksCompleted++;
      this._metrics.tasksSuccessful++;
      this._metrics.totalExecutionTime += duration;
      this._metrics.averageTaskTime = this._metrics.totalExecutionTime / this._metrics.tasksCompleted;
      this._metrics.lastActive = new Date();
      
      // Remove from current tasks
      this._currentTasks = this._currentTasks.filter(t => t.id !== task.id);
      
      // Learn from the experience
      await this.learnFromTask(task, result, true);
      
      this.setStatus(this._currentTasks.length > 0 ? AgentStatus.EXECUTING : AgentStatus.IDLE);
      this.emit('taskCompleted', { task, result, duration, timestamp: new Date() });
      
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Update task failure
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      task.actualDuration = duration;
      
      // Update metrics
      this._metrics.tasksFailed++;
      this._metrics.errorRate = this._metrics.tasksFailed / (this._metrics.tasksCompleted + this._metrics.tasksFailed);
      this._metrics.lastActive = new Date();
      
      // Remove from current tasks
      this._currentTasks = this._currentTasks.filter(t => t.id !== task.id);
      
      // Learn from the failure
      await this.learnFromTask(task, null, false);
      
      this.setStatus(this._currentTasks.length > 0 ? AgentStatus.EXECUTING : AgentStatus.ERROR);
      this.emit('taskFailed', { task, error, duration, timestamp: new Date() });
      
      throw error;
    }
  }
  
  canExecuteTask(task: Task): boolean {
    // Check if agent has required capabilities
    const hasRequiredCapabilities = task.requiredCapabilities.every(capability =>
      this.config.capabilities.some(agentCap => agentCap.name === capability)
    );
    
    if (!hasRequiredCapabilities) {
      return false;
    }
    
    // Check constraints
    if (this.config.constraints?.maxConcurrentTasks &&
        this._currentTasks.length >= this.config.constraints.maxConcurrentTasks) {
      return false;
    }
    
    // Check if agent is available
    if (this._status === AgentStatus.ERROR || this._shutdownRequested) {
      return false;
    }
    
    return true;
  }
  
  getCurrentTasks(): Task[] {
    return [...this._currentTasks];
  }
  
  async sendMessage(message: Message): Promise<void> {
    this.emit('messageSent', { message, timestamp: new Date() });
  }
  
  async receiveMessage(message: Message): Promise<void> {
    this._metrics.messagesProcessed++;
    
    try {
      await this.processMessage(message);
      this.emit('messageReceived', { message, timestamp: new Date() });
    } catch (error) {
      this.emit('error', new Error(`Failed to process message: ${error}`));
    }
  }
  
  async makeDecision(context: DecisionContext): Promise<string> {
    try {
      const decision = await this.decisionEngine.makeDecision(context);
      
      // Remember this decision for future learning
      await this.remember(`decision_${uuidv4()}`, {
        context,
        decision,
        timestamp: new Date()
      }, 0.7);
      
      return decision;
    } catch (error) {
      throw new Error(`Decision making failed: ${error}`);
    }
  }
  
  async remember(key: string, value: any, importance = 0.5): Promise<void> {
    const entry: MemoryEntry = {
      id: uuidv4(),
      agentId: this.id,
      type: MemoryType.EXPERIENCE,
      content: value,
      importance,
      confidence: 1.0,
      accessibility: MemoryAccessibility.PRIVATE,
      tags: [key],
      metadata: {
        source: 'agent_memory',
        category: 'general',
        context: { agentId: this.id }
      },
      timestamp: new Date(),
      accessCount: 0,
      version: 1
    };
    
    await this.memorySystem.store(entry);
  }
  
  async recall(key: string): Promise<any> {
    const entries = await this.memorySystem.getByTag(key);
    return entries.length > 0 ? entries[0].content : null;
  }
  
  async forget(key: string): Promise<void> {
    const entries = await this.memorySystem.getByTag(key);
    for (const entry of entries) {
      await this.memorySystem.delete(entry.id);
    }
  }
  
  async learn(experience: any): Promise<void> {
    await this.remember(`learning_${uuidv4()}`, experience, 0.8);
    
    // Update learning metrics
    this._metrics.adaptationScore = Math.min(1.0, this._metrics.adaptationScore + 0.01);
    
    this.emit('learned', { experience, timestamp: new Date() });
  }
  
  async updateSkills(skills: Partial<AgentSkills>): Promise<void> {
    Object.assign(this.config.skills, skills);
    
    await this.remember(`skill_update_${uuidv4()}`, {
      oldSkills: this.config.skills,
      newSkills: skills,
      timestamp: new Date()
    }, 0.9);
    
    this.emit('skillsUpdated', { skills, timestamp: new Date() });
  }
  
  getMetrics(): ResourceMetrics {
    return {
      cpu: 0.5, // Placeholder - would be calculated based on actual usage
      memory: this._metrics.memoryUsage,
      storage: 0,
      network: 0,
      tokens: this._metrics.tokenUsage,
      cost: this._metrics.costPerTask * this._metrics.tasksCompleted
    };
  }
  
  getStatus(): AgentStatus {
    return this._status;
  }
  
  getPerformanceMetrics(): AgentPerformanceMetrics {
    return { ...this._metrics };
  }
  
  // Abstract methods to be implemented by specific agent types
  protected abstract createLLMProvider(): Promise<LLMProvider>;
  protected abstract createMemorySystem(): Promise<MemorySystem>;
  protected abstract createDecisionEngine(): Promise<DecisionEngine>;
  protected abstract performTask(task: Task): Promise<any>;
  protected abstract processMessage(message: Message): Promise<void>;
  
  // Lifecycle hooks
  protected async onInitialize(): Promise<void> {
    // Override in subclasses
  }
  
  protected async onShutdown(): Promise<void> {
    // Override in subclasses
  }
  
  // Private methods
  private async cancelTask(taskId: TaskId): Promise<void> {
    const taskIndex = this._currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      const task = this._currentTasks[taskIndex];
      task.status = TaskStatus.CANCELLED;
      this._currentTasks.splice(taskIndex, 1);
      
      this.emit('taskCancelled', { task, timestamp: new Date() });
    }
  }
  
  private async learnFromTask(task: Task, result: any, success: boolean): Promise<void> {
    const experience = {
      taskId: task.id,
      taskType: task.title,
      success,
      result,
      duration: task.actualDuration,
      timestamp: new Date()
    };
    
    await this.learn(experience);
    
    if (success) {
      this._metrics.decisionsCorrect++;
    } else {
      this._metrics.decisionsIncorrect++;
    }
  }
  
  private setupEventHandlers(): void {
    this.on('error', (error) => {
      console.error(`Agent ${this.id} error:`, error);
      this.setStatus(AgentStatus.ERROR);
    });
    
    this.on('taskStarted', (data) => {
      console.log(`Agent ${this.id} started task: ${data.task.title}`);
    });
    
    this.on('taskCompleted', (data) => {
      console.log(`Agent ${this.id} completed task: ${data.task.title} in ${data.duration}ms`);
    });
    
    this.on('taskFailed', (data) => {
      console.error(`Agent ${this.id} failed task: ${data.task.title}`, data.error);
    });
  }
}
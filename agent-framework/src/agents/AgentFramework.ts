import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  IAgent,
  AgentId,
  TaskId,
  MessageId,
  Task,
  Message,
  AgentConfig,
  AgentRegistry,
  AgentNetwork,
  SwarmCoordinator,
  SwarmConfig,
  SwarmState,
  TaskStatus,
  TaskPriority,
  AgentFactoryConfig
} from '../types';
import { BaseAgent } from './BaseAgent';
import { TaskScheduler } from '../lib/scheduling';
import { MessageRouter } from '../lib/communication';
import { SwarmManager } from '../lib/swarm';
import { MetricsCollector } from '../lib/metrics';

/**
 * Main Agent Framework class that manages agents, tasks, and coordination
 */
export class AgentFramework extends EventEmitter {
  private readonly _agents: Map<AgentId, IAgent> = new Map();
  private readonly _tasks: Map<TaskId, Task> = new Map();
  private readonly _messages: Map<MessageId, Message> = new Map();
  
  private readonly taskScheduler: TaskScheduler;
  private readonly messageRouter: MessageRouter;
  private readonly swarmManager: SwarmManager;
  private readonly metricsCollector: MetricsCollector;
  
  private _initialized = false;
  private _running = false;
  
  constructor(
    private readonly config: AgentFrameworkConfig = {}
  ) {
    super();
    
    this.taskScheduler = new TaskScheduler(config.schedulerConfig);
    this.messageRouter = new MessageRouter(config.routerConfig);
    this.swarmManager = new SwarmManager(config.swarmConfig);
    this.metricsCollector = new MetricsCollector(config.metricsConfig);
    
    this.setupEventHandlers();
  }
  
  async initialize(): Promise<void> {
    if (this._initialized) {
      throw new Error('AgentFramework is already initialized');
    }
    
    try {
      // Initialize components
      await this.taskScheduler.initialize();
      await this.messageRouter.initialize();
      await this.swarmManager.initialize();
      await this.metricsCollector.initialize();
      
      this._initialized = true;
      this.emit('initialized', { timestamp: new Date() });
      
    } catch (error) {
      throw new Error(`Failed to initialize AgentFramework: ${error}`);
    }
  }
  
  async start(): Promise<void> {
    if (!this._initialized) {
      await this.initialize();
    }
    
    if (this._running) {
      return;
    }
    
    try {
      // Start components
      await this.taskScheduler.start();
      await this.messageRouter.start();
      await this.swarmManager.start();
      await this.metricsCollector.start();
      
      this._running = true;
      this.emit('started', { timestamp: new Date() });
      
    } catch (error) {
      throw new Error(`Failed to start AgentFramework: ${error}`);
    }
  }
  
  async stop(): Promise<void> {
    if (!this._running) {
      return;
    }
    
    try {
      // Stop all agents
      for (const agent of this._agents.values()) {
        await agent.shutdown();
      }
      
      // Stop components
      await this.taskScheduler.stop();
      await this.messageRouter.stop();
      await this.swarmManager.stop();
      await this.metricsCollector.stop();
      
      this._running = false;
      this.emit('stopped', { timestamp: new Date() });
      
    } catch (error) {
      throw new Error(`Failed to stop AgentFramework: ${error}`);
    }
  }
  
  // Agent Management
  async registerAgent(agent: IAgent): Promise<void> {
    if (this._agents.has(agent.id)) {
      throw new Error(`Agent with id ${agent.id} is already registered`);
    }
    
    // Initialize agent if not already initialized
    if (agent.status === 'idle') {
      await agent.initialize();
    }
    
    this._agents.set(agent.id, agent);
    
    // Setup agent event handlers
    this.setupAgentEventHandlers(agent);
    
    // Register with swarm manager
    await this.swarmManager.registerAgent(agent);
    
    this.emit('agentRegistered', { agentId: agent.id, timestamp: new Date() });
  }
  
  async unregisterAgent(agentId: AgentId): Promise<void> {
    const agent = this._agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with id ${agentId} is not registered`);
    }
    
    // Shutdown agent
    await agent.shutdown();
    
    // Unregister from swarm manager
    await this.swarmManager.unregisterAgent(agentId);
    
    this._agents.delete(agentId);
    
    this.emit('agentUnregistered', { agentId, timestamp: new Date() });
  }
  
  getAgent(agentId: AgentId): IAgent | undefined {
    return this._agents.get(agentId);
  }
  
  getAgents(): IAgent[] {
    return Array.from(this._agents.values());
  }
  
  getAgentsByCapability(capability: string): IAgent[] {
    return this.getAgents().filter(agent =>
      agent.config.capabilities.some(cap => cap.name === capability)
    );
  }
  
  getAgentsByType(type: string): IAgent[] {
    return this.getAgents().filter(agent => agent.config.type === type);
  }
  
  // Task Management
  async createTask(taskConfig: CreateTaskConfig): Promise<Task> {
    const task: Task = {
      id: taskConfig.id || uuidv4(),
      title: taskConfig.title,
      description: taskConfig.description,
      priority: taskConfig.priority || TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dependencies: taskConfig.dependencies || [],
      requiredCapabilities: taskConfig.requiredCapabilities || [],
      input: taskConfig.input,
      progress: 0,
      estimatedDuration: taskConfig.estimatedDuration,
      createdAt: new Date(),
      metadata: taskConfig.metadata || {}
    };
    
    this._tasks.set(task.id, task);
    
    // Schedule the task
    await this.taskScheduler.scheduleTask(task);
    
    this.emit('taskCreated', { task, timestamp: new Date() });
    
    return task;
  }
  
  async assignTask(taskId: TaskId, agentId?: AgentId): Promise<void> {
    const task = this._tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    let targetAgent: IAgent | undefined;
    
    if (agentId) {
      targetAgent = this._agents.get(agentId);
      if (!targetAgent) {
        throw new Error(`Agent with id ${agentId} not found`);
      }
    } else {
      // Find best agent for the task
      targetAgent = await this.findBestAgentForTask(task);
    }
    
    if (!targetAgent) {
      throw new Error('No suitable agent found for task');
    }
    
    if (!targetAgent.canExecuteTask(task)) {
      throw new Error(`Agent ${targetAgent.id} cannot execute task ${taskId}`);
    }
    
    task.assignedTo = targetAgent.id;
    task.status = TaskStatus.IN_PROGRESS;
    
    // Execute task asynchronously
    this.executeTaskAsync(task, targetAgent);
    
    this.emit('taskAssigned', { taskId, agentId: targetAgent.id, timestamp: new Date() });
  }
  
  getTasks(status?: TaskStatus): Task[] {
    const tasks = Array.from(this._tasks.values());
    return status ? tasks.filter(task => task.status === status) : tasks;
  }
  
  getTask(taskId: TaskId): Task | undefined {
    return this._tasks.get(taskId);
  }
  
  // Private methods
  private async findBestAgentForTask(task: Task): Promise<IAgent | undefined> {
    const availableAgents = Array.from(this._agents.values()).filter(agent =>
      agent.canExecuteTask(task)
    );
    
    if (availableAgents.length === 0) {
      return undefined;
    }
    
    // Simple scoring based on capabilities and current load
    let bestAgent = availableAgents[0];
    let bestScore = -1;
    
    for (const agent of availableAgents) {
      const currentTasks = agent.getCurrentTasks().length;
      const capabilityMatch = task.requiredCapabilities.length > 0 ? 
        task.requiredCapabilities.filter(cap => 
          agent.config.capabilities.some(agentCap => agentCap.name === cap)
        ).length / task.requiredCapabilities.length : 1;
      
      // Score: higher capability match, lower current load
      const score = capabilityMatch * (1 - currentTasks * 0.1);
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }
  
  private async executeTaskAsync(task: Task, agent: IAgent): Promise<void> {
    try {
      const result = await agent.executeTask(task);
      task.status = TaskStatus.COMPLETED;
      task.output = result;
      task.completedAt = new Date();
      
      this.emit('taskCompleted', { task, result, timestamp: new Date() });
      
    } catch (error) {
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      
      this.emit('taskFailed', { task, error, timestamp: new Date() });
    }
  }
  
  private setupEventHandlers(): void {
    this.taskScheduler.on('taskReady', async (task: Task) => {
      await this.assignTask(task.id);
    });
  }
  
  private setupAgentEventHandlers(agent: IAgent): void {
    agent.on('error', (error: Error) => {
      this.emit('agentError', { agentId: agent.id, error, timestamp: new Date() });
    });
  }
  
  // Swarm management
  async createSwarm(config: SwarmConfig): Promise<string> {
    return await this.swarmManager.createSwarm(config);
  }
  
  async getFrameworkMetrics(): Promise<FrameworkMetrics> {
    return {
      timestamp: new Date(),
      agents: {
        total: this._agents.size,
        active: this.getAgents().filter(a => a.status !== 'idle').length,
        metrics: []
      },
      tasks: {
        total: this._tasks.size,
        pending: this.getTasks(TaskStatus.PENDING).length,
        inProgress: this.getTasks(TaskStatus.IN_PROGRESS).length,
        completed: this.getTasks(TaskStatus.COMPLETED).length,
        failed: this.getTasks(TaskStatus.FAILED).length,
        cancelled: this.getTasks(TaskStatus.CANCELLED).length
      },
      messages: {
        total: this._messages.size
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }
}

// Configuration interfaces
export interface AgentFrameworkConfig {
  schedulerConfig?: any;
  routerConfig?: any;
  swarmConfig?: any;
  metricsConfig?: any;
}

export interface CreateTaskConfig {
  id?: TaskId;
  title: string;
  description: string;
  priority?: TaskPriority;
  dependencies?: TaskId[];
  requiredCapabilities?: string[];
  input?: any;
  estimatedDuration?: number;
  metadata?: Record<string, any>;
}

export interface FrameworkMetrics {
  timestamp: Date;
  agents: {
    total: number;
    active: number;
    metrics: Array<{
      agentId: AgentId;
      status: string;
      metrics: any;
    }>;
  };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  messages: {
    total: number;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}
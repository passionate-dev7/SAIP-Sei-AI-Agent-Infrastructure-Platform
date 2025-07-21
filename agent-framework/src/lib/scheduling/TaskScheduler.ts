import { EventEmitter } from 'events';
import { Task, TaskId, TaskStatus, TaskPriority } from '../../types';

/**
 * Task scheduler for managing task execution order and timing
 */
export class TaskScheduler extends EventEmitter {
  private taskQueue: Task[] = [];
  private activeTasks: Map<TaskId, Task> = new Map();
  private completedTasks: Map<TaskId, Task> = new Map();
  private schedulerInterval: NodeJS.Timer | null = null;
  private running = false;
  
  constructor(private config: TaskSchedulerConfig = {}) {
    super();
    this.config = {
      maxConcurrentTasks: 10,
      schedulingInterval: 1000,
      priorityWeights: {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1
      },
      ...config
    };
  }
  
  async initialize(): Promise<void> {
    // Initialization logic if needed
  }
  
  async start(): Promise<void> {
    if (this.running) {
      return;
    }
    
    this.running = true;
    this.schedulerInterval = setInterval(() => {
      this.processTaskQueue();
    }, this.config.schedulingInterval);
    
    this.emit('started');
  }
  
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }
    
    this.running = false;
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    
    this.emit('stopped');
  }
  
  async scheduleTask(task: Task): Promise<void> {
    // Validate task
    if (!task.id || !task.title) {
      throw new Error('Task must have id and title');
    }
    
    // Check if task already exists
    if (this.taskQueue.find(t => t.id === task.id) ||
        this.activeTasks.has(task.id) ||
        this.completedTasks.has(task.id)) {
      throw new Error(`Task with id ${task.id} already exists`);
    }
    
    // Add to queue
    task.status = TaskStatus.PENDING;
    this.taskQueue.push(task);
    
    // Sort queue by priority and dependencies
    this.sortTaskQueue();
    
    this.emit('taskScheduled', { task });
  }
  
  async cancelTask(taskId: TaskId): Promise<void> {
    // Remove from queue
    this.taskQueue = this.taskQueue.filter(task => {
      if (task.id === taskId) {
        task.status = TaskStatus.CANCELLED;
        this.emit('taskCancelled', { task });
        return false;
      }
      return true;
    });
    
    // Remove from active tasks
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) {
      activeTask.status = TaskStatus.CANCELLED;
      this.activeTasks.delete(taskId);
      this.emit('taskCancelled', { task: activeTask });
    }
  }
  
  async rescheduleTask(taskId: TaskId, newPriority?: TaskPriority): Promise<void> {
    // Find task in queue
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      if (newPriority) {
        task.priority = newPriority;
      }
      this.sortTaskQueue();
      this.emit('taskRescheduled', { task });
    }
  }
  
  getQueuedTasks(): Task[] {
    return [...this.taskQueue];
  }
  
  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }
  
  getCompletedTasks(): Task[] {
    return Array.from(this.completedTasks.values());
  }
  
  getTask(taskId: TaskId): Task | undefined {
    return this.taskQueue.find(t => t.id === taskId) ||
           this.activeTasks.get(taskId) ||
           this.completedTasks.get(taskId);
  }
  
  getQueueStats(): TaskQueueStats {
    const queuedByPriority = this.groupTasksByPriority(this.taskQueue);
    const activeByPriority = this.groupTasksByPriority(Array.from(this.activeTasks.values()));
    
    return {
      queued: {
        total: this.taskQueue.length,
        byPriority: queuedByPriority
      },
      active: {
        total: this.activeTasks.size,
        byPriority: activeByPriority
      },
      completed: this.completedTasks.size,
      avgWaitTime: this.calculateAverageWaitTime()
    };
  }
  
  // Task completion callback
  async onTaskCompleted(taskId: TaskId, success: boolean): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return;
    }
    
    task.status = success ? TaskStatus.COMPLETED : TaskStatus.FAILED;
    task.completedAt = new Date();
    
    this.activeTasks.delete(taskId);
    this.completedTasks.set(taskId, task);
    
    this.emit('taskFinished', { task, success });
    
    // Check if any queued tasks now have their dependencies satisfied
    this.checkDependencies();
  }
  
  private processTaskQueue(): void {
    if (!this.running) {
      return;
    }
    
    // Check how many tasks we can start
    const availableSlots = this.config.maxConcurrentTasks! - this.activeTasks.size;
    if (availableSlots <= 0) {
      return;
    }
    
    // Get ready tasks (those with satisfied dependencies)
    const readyTasks = this.getReadyTasks();
    
    // Start as many tasks as we have slots for
    const tasksToStart = readyTasks.slice(0, availableSlots);
    
    for (const task of tasksToStart) {
      this.startTask(task);
    }
  }
  
  private getReadyTasks(): Task[] {
    return this.taskQueue.filter(task => {
      // Check if all dependencies are completed
      return task.dependencies.every(depId => {
        const depTask = this.completedTasks.get(depId);
        return depTask && depTask.status === TaskStatus.COMPLETED;
      });
    });
  }
  
  private startTask(task: Task): void {
    // Remove from queue
    this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
    
    // Mark as active
    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = new Date();
    this.activeTasks.set(task.id, task);
    
    this.emit('taskReady', task);
  }
  
  private sortTaskQueue(): void {
    this.taskQueue.sort((a, b) => {
      // First, sort by dependencies (tasks with no dependencies first)
      const aDepsCount = a.dependencies.length;
      const bDepsCount = b.dependencies.length;
      
      if (aDepsCount !== bDepsCount) {
        return aDepsCount - bDepsCount;
      }
      
      // Then sort by priority
      const aPriorityWeight = this.config.priorityWeights![a.priority] || 1;
      const bPriorityWeight = this.config.priorityWeights![b.priority] || 1;
      
      if (aPriorityWeight !== bPriorityWeight) {
        return bPriorityWeight - aPriorityWeight; // Higher priority first
      }
      
      // Finally, sort by creation time (FIFO for same priority)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }
  
  private checkDependencies(): void {
    // Emit events for tasks that now have satisfied dependencies
    const previouslyBlockedTasks = this.taskQueue.filter(task =>
      task.dependencies.length > 0 &&
      task.dependencies.every(depId => {
        const depTask = this.completedTasks.get(depId);
        return depTask && depTask.status === TaskStatus.COMPLETED;
      })
    );
    
    for (const task of previouslyBlockedTasks) {
      this.emit('dependenciesSatisfied', { task });
    }
  }
  
  private groupTasksByPriority(tasks: Task[]): Record<string, number> {
    const groups: Record<string, number> = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    for (const task of tasks) {
      groups[task.priority] = (groups[task.priority] || 0) + 1;
    }
    
    return groups;
  }
  
  private calculateAverageWaitTime(): number {
    const completedTasks = Array.from(this.completedTasks.values());
    
    if (completedTasks.length === 0) {
      return 0;
    }
    
    const totalWaitTime = completedTasks.reduce((sum, task) => {
      if (task.startedAt && task.createdAt) {
        return sum + (task.startedAt.getTime() - task.createdAt.getTime());
      }
      return sum;
    }, 0);
    
    return totalWaitTime / completedTasks.length;
  }
}

export interface TaskSchedulerConfig {
  maxConcurrentTasks?: number;
  schedulingInterval?: number; // milliseconds
  priorityWeights?: Record<string, number>;
}

export interface TaskQueueStats {
  queued: {
    total: number;
    byPriority: Record<string, number>;
  };
  active: {
    total: number;
    byPriority: Record<string, number>;
  };
  completed: number;
  avgWaitTime: number; // milliseconds
}
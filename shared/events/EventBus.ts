// Event bus for cross-component communication

import { EventEmitter } from 'events';
import { IntegrationEvent, ComponentType } from '../types/integration';

export class IntegrationEventBus extends EventEmitter {
  private static instance: IntegrationEventBus;
  private eventHistory: IntegrationEvent[] = [];
  private maxHistorySize = 1000;

  private constructor() {
    super();
    this.setMaxListeners(50); // Allow more listeners for multiple components
  }

  static getInstance(): IntegrationEventBus {
    if (!IntegrationEventBus.instance) {
      IntegrationEventBus.instance = new IntegrationEventBus();
    }
    return IntegrationEventBus.instance;
  }

  // Publish an event to the bus
  publish(type: string, source: ComponentType, data: any, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const event: IntegrationEvent = {
      id: this.generateId(),
      type,
      source,
      data,
      timestamp: new Date(),
      handled: false,
    };

    // Store in history
    this.addToHistory(event);

    // Emit the event
    this.emit(type, event);
    this.emit('*', event); // Wildcard listener

    console.log(`[EventBus] Published event: ${type} from ${source}`, { eventId: event.id, priority });
  }

  // Subscribe to specific event types
  subscribe(eventType: string, handler: (event: IntegrationEvent) => void): () => void {
    this.on(eventType, handler);
    
    // Return unsubscribe function
    return () => {
      this.off(eventType, handler);
    };
  }

  // Subscribe to all events
  subscribeToAll(handler: (event: IntegrationEvent) => void): () => void {
    this.on('*', handler);
    
    return () => {
      this.off('*', handler);
    };
  }

  // Mark event as handled
  markHandled(eventId: string): void {
    const event = this.eventHistory.find(e => e.id === eventId);
    if (event) {
      event.handled = true;
    }
  }

  // Get event history
  getEventHistory(limit = 100): IntegrationEvent[] {
    return this.eventHistory.slice(-limit);
  }

  // Get unhandled events
  getUnhandledEvents(): IntegrationEvent[] {
    return this.eventHistory.filter(e => !e.handled);
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
  }

  private addToHistory(event: IntegrationEvent): void {
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Event type constants
export const EventTypes = {
  // Agent events
  AGENT_CREATED: 'agent:created',
  AGENT_DEPLOYED: 'agent:deployed',
  AGENT_STARTED: 'agent:started',
  AGENT_STOPPED: 'agent:stopped',
  AGENT_ERROR: 'agent:error',
  AGENT_UPDATED: 'agent:updated',

  // Contract events
  CONTRACT_GENERATION_STARTED: 'contract:generation:started',
  CONTRACT_GENERATED: 'contract:generated',
  CONTRACT_DEPLOYED: 'contract:deployed',
  CONTRACT_VERIFIED: 'contract:verified',
  CONTRACT_ERROR: 'contract:error',

  // Wallet events
  WALLET_CONNECTED: 'wallet:connected',
  WALLET_DISCONNECTED: 'wallet:disconnected',
  WALLET_TRANSACTION: 'wallet:transaction',
  WALLET_BALANCE_UPDATED: 'wallet:balance:updated',

  // System events
  COMPONENT_STARTED: 'system:component:started',
  COMPONENT_STOPPED: 'system:component:stopped',
  COMPONENT_ERROR: 'system:component:error',
  HEALTH_CHECK: 'system:health:check',
  CONFIG_UPDATED: 'system:config:updated',

  // Integration events
  INTEGRATION_REQUEST: 'integration:request',
  INTEGRATION_RESPONSE: 'integration:response',
  INTEGRATION_ERROR: 'integration:error',

  // Real-time events
  REALTIME_UPDATE: 'realtime:update',
  REALTIME_NOTIFICATION: 'realtime:notification',
} as const;

// Convenience methods for common events
export class EventPublisher {
  private eventBus: IntegrationEventBus;

  constructor() {
    this.eventBus = IntegrationEventBus.getInstance();
  }

  // Agent events
  publishAgentCreated(source: ComponentType, agentData: any): void {
    this.eventBus.publish(EventTypes.AGENT_CREATED, source, agentData, 'medium');
  }

  publishAgentDeployed(source: ComponentType, deploymentData: any): void {
    this.eventBus.publish(EventTypes.AGENT_DEPLOYED, source, deploymentData, 'high');
  }

  publishAgentError(source: ComponentType, errorData: any): void {
    this.eventBus.publish(EventTypes.AGENT_ERROR, source, errorData, 'critical');
  }

  // Contract events
  publishContractGenerated(source: ComponentType, contractData: any): void {
    this.eventBus.publish(EventTypes.CONTRACT_GENERATED, source, contractData, 'medium');
  }

  publishContractDeployed(source: ComponentType, deploymentData: any): void {
    this.eventBus.publish(EventTypes.CONTRACT_DEPLOYED, source, deploymentData, 'high');
  }

  // Wallet events
  publishWalletConnected(source: ComponentType, walletData: any): void {
    this.eventBus.publish(EventTypes.WALLET_CONNECTED, source, walletData, 'medium');
  }

  publishTransaction(source: ComponentType, transactionData: any): void {
    this.eventBus.publish(EventTypes.WALLET_TRANSACTION, source, transactionData, 'high');
  }

  // System events
  publishComponentStatus(source: ComponentType, statusData: any): void {
    this.eventBus.publish(EventTypes.COMPONENT_STARTED, source, statusData, 'low');
  }

  publishHealthCheck(source: ComponentType, healthData: any): void {
    this.eventBus.publish(EventTypes.HEALTH_CHECK, source, healthData, 'low');
  }

  // Real-time events
  publishRealtimeUpdate(source: ComponentType, updateData: any): void {
    this.eventBus.publish(EventTypes.REALTIME_UPDATE, source, updateData, 'medium');
  }
}

export default IntegrationEventBus;
// WebSocket server for real-time communication between components

import WebSocket from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import { INTEGRATION_CONFIG } from '../config/integration';
import { WebSocketMessage, ComponentType } from '../types/integration';
import { IntegrationEventBus, EventPublisher } from '../events/EventBus';

export interface ClientInfo {
  id: string;
  componentType: ComponentType;
  connected: Date;
  lastHeartbeat: Date;
  subscriptions: Set<string>;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, { ws: WebSocket; info: ClientInfo }> = new Map();
  private eventBus: IntegrationEventBus;
  private eventPublisher: EventPublisher;
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server?: Server) {
    this.eventBus = IntegrationEventBus.getInstance();
    this.eventPublisher = new EventPublisher();

    // Create WebSocket server
    this.wss = new WebSocket.Server({
      server,
      port: server ? undefined : INTEGRATION_CONFIG.websocket.port,
      path: INTEGRATION_CONFIG.websocket.path,
    });

    this.setupEventHandlers();
    this.startHeartbeat();
    
    console.log(`[WebSocket Server] Started on ${INTEGRATION_CONFIG.websocket.path}:${INTEGRATION_CONFIG.websocket.port}`);
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // Subscribe to integration events to broadcast to clients
    this.eventBus.subscribeToAll((event) => {
      this.broadcastEvent(event);
    });
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    const clientId = this.generateClientId();
    const clientInfo: ClientInfo = {
      id: clientId,
      componentType: 'no-code-platform', // Default, will be updated on authentication
      connected: new Date(),
      lastHeartbeat: new Date(),
      subscriptions: new Set(),
    };

    this.clients.set(clientId, { ws, info: clientInfo });

    console.log(`[WebSocket Server] Client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'response',
      id: 'welcome',
      payload: {
        clientId,
        serverTime: new Date(),
        config: {
          heartbeatInterval: INTEGRATION_CONFIG.websocket.heartbeatInterval,
        },
      },
      timestamp: new Date(),
    });

    // Set up message handlers
    ws.on('message', (data: WebSocket.Data) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error: Error) => {
      console.error(`[WebSocket Server] Client error ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Publish connection event
    this.eventPublisher.publishComponentStatus('websocket-server' as ComponentType, {
      event: 'client_connected',
      clientId,
      totalClients: this.clients.size,
    });
  }

  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        console.error(`[WebSocket Server] Message from unknown client: ${clientId}`);
        return;
      }

      console.log(`[WebSocket Server] Received message from ${clientId}:`, message.type);

      switch (message.type) {
        case 'heartbeat':
          this.handleHeartbeat(clientId, message);
          break;
        
        case 'request':
          this.handleRequest(clientId, message);
          break;
        
        case 'event':
          this.handleEvent(clientId, message);
          break;
        
        default:
          console.warn(`[WebSocket Server] Unknown message type: ${message.type}`);
      }

    } catch (error) {
      console.error(`[WebSocket Server] Error parsing message from ${clientId}:`, error);
      this.sendError(clientId, 'PARSE_ERROR', 'Invalid message format');
    }
  }

  private handleHeartbeat(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.info.lastHeartbeat = new Date();
      
      // Send heartbeat response
      this.sendToClient(clientId, {
        type: 'heartbeat',
        id: message.id,
        payload: {
          serverTime: new Date(),
          clientTime: message.payload?.clientTime,
        },
        timestamp: new Date(),
      });
    }
  }

  private handleRequest(clientId: string, message: WebSocketMessage): void {
    const { type, payload } = message;

    switch (payload?.action) {
      case 'authenticate':
        this.handleAuthentication(clientId, message);
        break;
      
      case 'subscribe':
        this.handleSubscription(clientId, message);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscription(clientId, message);
        break;
      
      case 'get_status':
        this.handleStatusRequest(clientId, message);
        break;
      
      default:
        this.sendError(clientId, 'UNKNOWN_REQUEST', `Unknown request action: ${payload?.action}`);
    }
  }

  private handleAuthentication(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { componentType, apiKey } = message.payload;

    // TODO: Add proper authentication logic here
    // For now, just validate component type
    if (!componentType || !Object.values(INTEGRATION_CONFIG.components).some(c => c.url.includes(componentType))) {
      this.sendError(clientId, 'AUTH_FAILED', 'Invalid component type');
      return;
    }

    client.info.componentType = componentType;

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: {
        authenticated: true,
        componentType,
        permissions: ['read', 'write', 'subscribe'],
      },
      timestamp: new Date(),
    });

    console.log(`[WebSocket Server] Client authenticated: ${clientId} as ${componentType}`);
  }

  private handleSubscription(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { eventTypes } = message.payload;

    if (Array.isArray(eventTypes)) {
      eventTypes.forEach((eventType: string) => {
        client.info.subscriptions.add(eventType);
      });
    }

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: {
        subscribed: eventTypes,
        totalSubscriptions: client.info.subscriptions.size,
      },
      timestamp: new Date(),
    });
  }

  private handleUnsubscription(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { eventTypes } = message.payload;

    if (Array.isArray(eventTypes)) {
      eventTypes.forEach((eventType: string) => {
        client.info.subscriptions.delete(eventType);
      });
    }

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: {
        unsubscribed: eventTypes,
        totalSubscriptions: client.info.subscriptions.size,
      },
      timestamp: new Date(),
    });
  }

  private handleStatusRequest(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const status = {
      clientInfo: client.info,
      serverStats: {
        totalClients: this.clients.size,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      eventHistory: this.eventBus.getEventHistory(5),
    };

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: status,
      timestamp: new Date(),
    });
  }

  private handleEvent(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Publish event to the event bus
    this.eventBus.publish(
      message.payload.eventType,
      client.info.componentType,
      message.payload.data
    );
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`[WebSocket Server] Client disconnected: ${clientId}`);
      this.clients.delete(clientId);

      // Publish disconnection event
      this.eventPublisher.publishComponentStatus('websocket-server' as ComponentType, {
        event: 'client_disconnected',
        clientId,
        totalClients: this.clients.size,
      });
    }
  }

  private broadcastEvent(event: any): void {
    const message: WebSocketMessage = {
      type: 'event',
      id: event.id,
      payload: event,
      timestamp: new Date(),
    };

    this.clients.forEach((client, clientId) => {
      // Check if client is subscribed to this event type
      if (client.info.subscriptions.has(event.type) || client.info.subscriptions.has('*')) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`[WebSocket Server] Error sending to client ${clientId}:`, error);
        this.handleDisconnection(clientId);
      }
    }
  }

  private sendError(clientId: string, code: string, message: string): void {
    this.sendToClient(clientId, {
      type: 'response',
      id: 'error',
      payload: {
        error: {
          code,
          message,
        },
      },
      timestamp: new Date(),
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = INTEGRATION_CONFIG.websocket.heartbeatInterval * 2; // Allow 2x heartbeat interval

      this.clients.forEach((client, clientId) => {
        const timeSinceLastHeartbeat = now.getTime() - client.info.lastHeartbeat.getTime();
        
        if (timeSinceLastHeartbeat > timeout) {
          console.log(`[WebSocket Server] Client timeout: ${clientId}`);
          client.ws.terminate();
          this.handleDisconnection(clientId);
        }
      });
    }, INTEGRATION_CONFIG.websocket.heartbeatInterval);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  public broadcast(message: WebSocketMessage): void {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  public sendToComponent(componentType: ComponentType, message: WebSocketMessage): void {
    this.clients.forEach((client, clientId) => {
      if (client.info.componentType === componentType) {
        this.sendToClient(clientId, message);
      }
    });
  }

  public getConnectedClients(): ClientInfo[] {
    return Array.from(this.clients.values()).map(client => client.info);
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close();
    });

    this.wss.close();
    console.log('[WebSocket Server] Closed');
  }
}

export default WebSocketServer;
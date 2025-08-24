// Main integration server that coordinates all components

import http from 'http';
import express from 'express';
import { ApiGateway } from './api/ApiGateway';
import { WebSocketServer } from './websocket/WebSocketServer';
import { INTEGRATION_CONFIG, validateEnvironment } from './config/integration';
import { IntegrationEventBus, EventPublisher } from './events/EventBus';
import { MCPIntegration } from './api/MCPIntegration';
import { GoatSDKIntegration } from './api/GoatSDKIntegration';
import { CopilotIntegration } from './api/CopilotIntegration';
import { AgentDeploymentPipeline } from './api/AgentDeploymentPipeline';

export class IntegrationServer {
  private server: http.Server;
  private apiGateway: ApiGateway;
  private wsServer: WebSocketServer;
  private eventBus: IntegrationEventBus;
  private eventPublisher: EventPublisher;
  
  // Integration services
  private mcpIntegration: MCPIntegration;
  private goatIntegration: GoatSDKIntegration;
  private copilotIntegration: CopilotIntegration;
  private deploymentPipeline: AgentDeploymentPipeline;

  private isShuttingDown = false;

  constructor() {
    // Validate environment
    validateEnvironment();

    // Initialize event system
    this.eventBus = IntegrationEventBus.getInstance();
    this.eventPublisher = new EventPublisher();

    // Initialize integration services
    this.mcpIntegration = new MCPIntegration();
    this.goatIntegration = new GoatSDKIntegration();
    this.copilotIntegration = new CopilotIntegration();
    this.deploymentPipeline = new AgentDeploymentPipeline();

    // Initialize API gateway
    this.apiGateway = new ApiGateway();
    const app = this.apiGateway.getApp();

    // Create HTTP server
    this.server = http.createServer(app);

    // Initialize WebSocket server
    this.wsServer = new WebSocketServer(this.server);

    this.setupEventHandlers();
    this.setupGracefulShutdown();
  }

  private setupEventHandlers(): void {
    console.log('[Integration Server] Setting up event handlers...');

    // Handle agent deployment events
    this.eventBus.subscribe('agent:created', async (event) => {
      try {
        console.log('[Integration Server] Agent creation event received:', event.data);
        
        // Orchestrate deployment through MCP
        const orchestrationResult = await this.mcpIntegration.orchestrateAgentDeployment(event.data);
        
        if (orchestrationResult.success) {
          this.eventPublisher.publishAgentDeployed('integration-server' as any, {
            agentId: event.data.agentId,
            orchestrationId: orchestrationResult.data.id,
          });
        } else {
          this.eventPublisher.publishAgentError('integration-server' as any, {
            agentId: event.data.agentId,
            error: orchestrationResult.error,
          });
        }
      } catch (error) {
        console.error('[Integration Server] Error handling agent creation:', error);
      }
    });

    // Handle contract deployment events
    this.eventBus.subscribe('contract:generated', async (event) => {
      try {
        console.log('[Integration Server] Contract generation event received:', event.data);

        if (event.data.phase === 'generation_completed') {
          // Broadcast to connected clients
          this.wsServer.broadcast({
            type: 'event',
            id: event.id,
            payload: {
              type: 'contract_ready_for_deployment',
              contractId: event.data.contractId,
              agentId: event.data.agentId,
            },
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('[Integration Server] Error handling contract generation:', error);
      }
    });

    // Handle wallet connection events
    this.eventBus.subscribe('wallet:connected', async (event) => {
      try {
        console.log('[Integration Server] Wallet connection event received:', event.data);

        // Notify all components about wallet connection
        this.wsServer.broadcast({
          type: 'event',
          id: event.id,
          payload: {
            type: 'wallet_connected',
            address: event.data.address,
            chainId: event.data.chainId,
          },
          timestamp: new Date(),
        });

        // Update system state if needed
        await this.mcpIntegration.callTool('update_wallet_state', {
          address: event.data.address,
          chainId: event.data.chainId,
          status: 'connected',
        });
      } catch (error) {
        console.error('[Integration Server] Error handling wallet connection:', error);
      }
    });

    // Handle system health events
    this.eventBus.subscribe('system:health:check', async (event) => {
      try {
        // Get comprehensive system health
        const healthData = {
          components: event.data.components,
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            connections: this.wsServer.getClientCount(),
          },
          integrations: {
            mcp: 'connected', // This would be actual status
            goat: 'connected',
            copilot: 'connected',
          },
        };

        // Broadcast health update
        this.wsServer.broadcast({
          type: 'event',
          id: event.id,
          payload: {
            type: 'system_health_update',
            data: healthData,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('[Integration Server] Error handling health check:', error);
      }
    });

    // Handle real-time updates
    this.eventBus.subscribe('realtime:update', async (event) => {
      // Forward all real-time updates to WebSocket clients
      this.wsServer.broadcast({
        type: 'event',
        id: event.id,
        payload: event.data,
        timestamp: new Date(),
      });
    });

    console.log('[Integration Server] Event handlers configured');
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log(`[Integration Server] Received ${signal}, shutting down gracefully...`);

      try {
        // Close WebSocket server
        this.wsServer.close();

        // Close MCP connection
        this.mcpIntegration.close();

        // Close HTTP server
        this.server.close((err) => {
          if (err) {
            console.error('[Integration Server] Error closing server:', err);
            process.exit(1);
          }
          
          console.log('[Integration Server] Server closed successfully');
          process.exit(0);
        });

        // Force exit after 10 seconds
        setTimeout(() => {
          console.error('[Integration Server] Forced shutdown');
          process.exit(1);
        }, 10000);

      } catch (error) {
        console.error('[Integration Server] Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      console.error('[Integration Server] Uncaught exception:', error);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Integration Server] Unhandled rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const port = INTEGRATION_CONFIG.api.port;
        
        this.server.listen(port, () => {
          console.log(`[Integration Server] Started on port ${port}`);
          console.log(`[Integration Server] WebSocket endpoint: ws://localhost:${port}/ws`);
          console.log(`[Integration Server] API Gateway: http://localhost:${port}/api`);
          console.log(`[Integration Server] Health check: http://localhost:${port}/health`);

          // Publish server started event
          this.eventPublisher.publishComponentStatus('integration-server' as any, {
            status: 'started',
            port,
            timestamp: new Date(),
          });

          resolve();
        });

        this.server.on('error', (error) => {
          console.error('[Integration Server] Server error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('[Integration Server] Failed to start:', error);
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isShuttingDown) {
        resolve();
        return;
      }

      this.isShuttingDown = true;

      try {
        // Close all connections
        this.wsServer.close();
        this.mcpIntegration.close();

        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('[Integration Server] Stopped successfully');
            resolve();
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Utility methods
  public getStats() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: this.wsServer.getClientCount(),
      connectedClients: this.wsServer.getConnectedClients(),
      activePipelines: this.deploymentPipeline.getAllPipelines().length,
      eventHistory: this.eventBus.getEventHistory(10),
    };
  }

  public getIntegrationServices() {
    return {
      mcp: this.mcpIntegration,
      goat: this.goatIntegration,
      copilot: this.copilotIntegration,
      deployment: this.deploymentPipeline,
    };
  }
}

// Main entry point
if (require.main === module) {
  const server = new IntegrationServer();
  
  server.start().then(() => {
    console.log('[Integration Server] Successfully started all services');
  }).catch((error) => {
    console.error('[Integration Server] Failed to start:', error);
    process.exit(1);
  });
}

export default IntegrationServer;
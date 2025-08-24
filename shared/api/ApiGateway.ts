// API Gateway for routing requests between components

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import axios, { AxiosResponse } from 'axios';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { INTEGRATION_CONFIG } from '../config/integration';
import { ComponentType, ApiResponse } from '../types/integration';
import { IntegrationEventBus, EventPublisher, EventTypes } from '../events/EventBus';

export class ApiGateway {
  private app: Application;
  private eventBus: IntegrationEventBus;
  private eventPublisher: EventPublisher;
  private componentHealth: Map<ComponentType, boolean> = new Map();

  constructor() {
    this.app = express();
    this.eventBus = IntegrationEventBus.getInstance();
    this.eventPublisher = new EventPublisher();
    this.setupMiddleware();
    this.setupRoutes();
    this.startHealthChecks();
  }

  private setupMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: INTEGRATION_CONFIG.security.corsOrigins,
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit(INTEGRATION_CONFIG.security.rateLimiting);
    this.app.use('/api/', limiter);

    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[API Gateway] ${req.method} ${req.path}`, {
        headers: req.headers,
        query: req.query,
        body: req.body,
      });
      next();
    });

    // Error handling
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('[API Gateway] Error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        },
        timestamp: new Date(),
      } as ApiResponse);
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const healthStatus = {
        gateway: 'healthy',
        components: Object.fromEntries(this.componentHealth),
        timestamp: new Date(),
      };

      res.json({
        success: true,
        data: healthStatus,
        timestamp: new Date(),
      } as ApiResponse);
    });

    // Component proxy routes
    this.setupComponentProxies();

    // Integration-specific routes
    this.setupIntegrationRoutes();
  }

  private setupComponentProxies(): void {
    // No-code platform proxy
    this.app.use('/api/no-code-platform', 
      this.createComponentProxy('no-code-platform')
    );

    // Agent framework proxy
    this.app.use('/api/agent-framework', 
      this.createComponentProxy('agent-framework')
    );

    // Smart contract copilot proxy
    this.app.use('/api/copilot', 
      this.createComponentProxy('smart-contract-copilot')
    );

    // MCP server proxy
    this.app.use('/api/mcp', 
      this.createComponentProxy('mcp-server')
    );

    // SDK proxy
    this.app.use('/api/sdk', 
      this.createComponentProxy('sdk')
    );
  }

  private createComponentProxy(componentType: ComponentType): any {
    const componentConfig = INTEGRATION_CONFIG.components[componentType];
    
    const proxyOptions: Options = {
      target: componentConfig.url,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/${componentType}`]: '',
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add component identification header
        proxyReq.setHeader('X-Gateway-Component', componentType);
        proxyReq.setHeader('X-Gateway-Request-Id', this.generateRequestId());
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log proxy responses
        console.log(`[API Gateway] Proxy response from ${componentType}:`, proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error(`[API Gateway] Proxy error for ${componentType}:`, err);
        this.componentHealth.set(componentType, false);
        
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Component ${componentType} is unavailable`,
            details: err.message,
          },
          timestamp: new Date(),
        } as ApiResponse);
      },
    };

    return createProxyMiddleware(proxyOptions);
  }

  private setupIntegrationRoutes(): void {
    // Agent deployment endpoint
    this.app.post('/api/integration/deploy-agent', async (req: Request, res: Response) => {
      try {
        const { agentConfig, deploymentTarget } = req.body;
        
        // Publish event
        this.eventPublisher.publishAgentCreated('api-gateway' as ComponentType, {
          agentConfig,
          deploymentTarget,
          requestId: this.generateRequestId(),
        });

        // Forward to agent framework
        const response = await this.forwardRequest('agent-framework', 'POST', '/deploy', req.body);
        
        res.json(response.data);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'DEPLOYMENT_FAILED',
            message: 'Agent deployment failed',
            details: error.message,
          },
          timestamp: new Date(),
        } as ApiResponse);
      }
    });

    // Contract generation endpoint
    this.app.post('/api/integration/generate-contract', async (req: Request, res: Response) => {
      try {
        const contractRequest = req.body;
        
        // Forward to copilot
        const response = await this.forwardRequest('smart-contract-copilot', 'POST', '/generate', contractRequest);
        
        this.eventPublisher.publishContractGenerated('api-gateway' as ComponentType, response.data);
        
        res.json(response.data);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'CONTRACT_GENERATION_FAILED',
            message: 'Contract generation failed',
            details: error.message,
          },
          timestamp: new Date(),
        } as ApiResponse);
      }
    });

    // Wallet connection endpoint
    this.app.post('/api/integration/connect-wallet', async (req: Request, res: Response) => {
      try {
        const walletRequest = req.body;
        
        // Forward to SDK
        const response = await this.forwardRequest('sdk', 'POST', '/wallet/connect', walletRequest);
        
        this.eventPublisher.publishWalletConnected('api-gateway' as ComponentType, response.data);
        
        res.json(response.data);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'WALLET_CONNECTION_FAILED',
            message: 'Wallet connection failed',
            details: error.message,
          },
          timestamp: new Date(),
        } as ApiResponse);
      }
    });

    // System status endpoint
    this.app.get('/api/integration/status', async (req: Request, res: Response) => {
      const componentStatuses = await this.checkAllComponentHealth();
      
      res.json({
        success: true,
        data: {
          components: componentStatuses,
          eventHistory: this.eventBus.getEventHistory(10),
          timestamp: new Date(),
        },
        timestamp: new Date(),
      } as ApiResponse);
    });

    // Event stream endpoint (Server-Sent Events)
    this.app.get('/api/integration/events', (req: Request, res: Response) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Send initial connection event
      res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

      // Subscribe to all events
      const unsubscribe = this.eventBus.subscribeToAll((event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      });

      // Handle client disconnect
      req.on('close', () => {
        unsubscribe();
      });
    });
  }

  private async forwardRequest(component: ComponentType, method: string, path: string, data?: any): Promise<AxiosResponse> {
    const componentConfig = INTEGRATION_CONFIG.components[component];
    const url = `${componentConfig.url}${path}`;
    
    const config = {
      method: method.toLowerCase(),
      url,
      data,
      timeout: INTEGRATION_CONFIG.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Component': component,
      },
    };

    return axios(config);
  }

  private async checkAllComponentHealth(): Promise<Record<ComponentType, boolean>> {
    const healthPromises = Object.entries(INTEGRATION_CONFIG.components).map(
      async ([componentType, config]) => {
        try {
          await axios.get(`${config.url}${config.healthCheck}`, { timeout: 5000 });
          this.componentHealth.set(componentType as ComponentType, true);
          return [componentType, true];
        } catch (error) {
          this.componentHealth.set(componentType as ComponentType, false);
          return [componentType, false];
        }
      }
    );

    const results = await Promise.allSettled(healthPromises);
    return Object.fromEntries(
      results.map((result, index) => 
        result.status === 'fulfilled' 
          ? result.value 
          : [Object.keys(INTEGRATION_CONFIG.components)[index], false]
      )
    ) as Record<ComponentType, boolean>;
  }

  private startHealthChecks(): void {
    // Initial health check
    this.checkAllComponentHealth();

    // Periodic health checks
    setInterval(() => {
      this.checkAllComponentHealth().then(() => {
        this.eventPublisher.publishHealthCheck('api-gateway' as ComponentType, {
          components: Object.fromEntries(this.componentHealth),
        });
      });
    }, 30000); // Check every 30 seconds
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public start(): void {
    const port = INTEGRATION_CONFIG.api.port;
    this.app.listen(port, () => {
      console.log(`[API Gateway] Started on port ${port}`);
      this.eventPublisher.publishComponentStatus('api-gateway' as ComponentType, {
        status: 'started',
        port,
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default ApiGateway;
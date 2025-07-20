import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Server, 
  Globe, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Rocket
} from 'lucide-react';
import { Workflow, DeploymentConfig } from '../../types';
import { useWorkflowStore } from '../../store';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import DeploymentWizard from './DeploymentWizard';
import CloudProviderSelector from './CloudProviderSelector';
import DeploymentMonitor from './DeploymentMonitor';

interface DeploymentCenterProps {
  workflow: Workflow | null;
}

interface DeploymentStatus {
  id: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'stopped';
  environment: 'development' | 'staging' | 'production';
  url?: string;
  lastDeployed?: Date;
  health: 'healthy' | 'warning' | 'critical';
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    requests: number;
  };
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = ({ workflow }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'development' | 'staging' | 'production'>('development');
  const [deploymentStatuses, setDeploymentStatuses] = useState<DeploymentStatus[]>([
    {
      id: 'dev',
      status: 'deployed',
      environment: 'development',
      url: 'https://dev.example.com',
      lastDeployed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      health: 'healthy',
      metrics: {
        uptime: 99.9,
        responseTime: 245,
        errorRate: 0.02,
        requests: 1250,
      }
    },
    {
      id: 'staging',
      status: 'deployed',
      environment: 'staging',
      url: 'https://staging.example.com',
      lastDeployed: new Date(Date.now() - 4 * 60 * 60 * 1000),
      health: 'warning',
      metrics: {
        uptime: 98.5,
        responseTime: 320,
        errorRate: 0.15,
        requests: 890,
      }
    },
    {
      id: 'prod',
      status: 'stopped',
      environment: 'production',
      health: 'critical',
      metrics: {
        uptime: 0,
        responseTime: 0,
        errorRate: 0,
        requests: 0,
      }
    }
  ]);

  const { updateWorkflow } = useWorkflowStore();

  const getStatusIcon = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deploying':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'stopped':
        return <Pause className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getHealthColor = (health: DeploymentStatus['health']) => {
    switch (health) {
      case 'healthy':
        return 'text-green-500 bg-green-50';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50';
      case 'critical':
        return 'text-red-500 bg-red-50';
    }
  };

  const handleDeploy = async (environment: string) => {
    if (!workflow) return;

    const deploymentId = environment;
    
    // Update status to deploying
    setDeploymentStatuses(prev => 
      prev.map(deployment => 
        deployment.id === deploymentId
          ? { ...deployment, status: 'deploying' as const }
          : deployment
      )
    );

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update status to deployed
      setDeploymentStatuses(prev => 
        prev.map(deployment => 
          deployment.id === deploymentId
            ? { 
                ...deployment, 
                status: 'deployed' as const,
                lastDeployed: new Date(),
                url: `https://${environment}.example.com`,
                health: 'healthy' as const
              }
            : deployment
        )
      );

      // Update workflow status
      if (workflow) {
        const updatedWorkflow = {
          ...workflow,
          status: 'deployed' as const,
        };
        updateWorkflow(workflow.id, updatedWorkflow);
      }
    } catch (error) {
      // Update status to failed
      setDeploymentStatuses(prev => 
        prev.map(deployment => 
          deployment.id === deploymentId
            ? { ...deployment, status: 'failed' as const }
            : deployment
        )
      );
    }
  };

  const handleStop = (environment: string) => {
    const deploymentId = environment;
    
    setDeploymentStatuses(prev => 
      prev.map(deployment => 
        deployment.id === deploymentId
          ? { 
              ...deployment, 
              status: 'stopped' as const,
              health: 'critical' as const,
              metrics: {
                ...deployment.metrics,
                uptime: 0,
                responseTime: 0,
                requests: 0,
              }
            }
          : deployment
      )
    );
  };

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No workflow selected</h3>
          <p className="text-muted-foreground">Select a workflow to manage deployments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment Center</h2>
          <p className="text-muted-foreground">Deploy and manage your workflow across environments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWizard(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Rocket className="w-4 h-4 mr-2" />
            Quick Deploy
          </Button>
        </div>
      </div>

      {/* Workflow Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{workflow.name}</h3>
              <p className="text-muted-foreground">{workflow.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{workflow.agents.length} agents</Badge>
                <Badge variant="outline">{workflow.connections.length} connections</Badge>
                <Badge variant={workflow.status === 'deployed' ? 'success' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deploymentStatuses.map((deployment) => (
          <motion.div
            key={deployment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {deployment.environment === 'development' && <Zap className="w-4 h-4" />}
                    {deployment.environment === 'staging' && <Server className="w-4 h-4" />}
                    {deployment.environment === 'production' && <Cloud className="w-4 h-4" />}
                    {deployment.environment}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deployment.status)}
                    <Badge className={getHealthColor(deployment.health)}>
                      {deployment.health}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URL */}
                {deployment.url && (
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <div className="mt-1">
                      <a 
                        href={deployment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {deployment.url}
                      </a>
                    </div>
                  </div>
                )}

                {/* Last Deployed */}
                {deployment.lastDeployed && (
                  <div>
                    <label className="text-sm font-medium">Last Deployed</label>
                    <div className="text-sm text-muted-foreground">
                      {deployment.lastDeployed.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metrics (24h)</label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="font-medium">{deployment.metrics.uptime}%</div>
                      <div className="text-muted-foreground">Uptime</div>
                    </div>
                    <div>
                      <div className="font-medium">{deployment.metrics.responseTime}ms</div>
                      <div className="text-muted-foreground">Response</div>
                    </div>
                    <div>
                      <div className="font-medium">{deployment.metrics.errorRate}%</div>
                      <div className="text-muted-foreground">Error Rate</div>
                    </div>
                    <div>
                      <div className="font-medium">{deployment.metrics.requests}</div>
                      <div className="text-muted-foreground">Requests</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {deployment.status === 'deployed' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStop(deployment.environment)}
                        className="flex-1"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeploy(deployment.environment)}
                        className="flex-1"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Redeploy
                      </Button>
                    </>
                  ) : deployment.status === 'deploying' ? (
                    <Button disabled size="sm" className="flex-1">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Deploying...
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleDeploy(deployment.environment)}
                      className="flex-1"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Deploy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { environment: 'production', version: '1.2.0', status: 'success', time: '2 hours ago', user: 'John Doe' },
              { environment: 'staging', version: '1.1.9', status: 'success', time: '4 hours ago', user: 'Jane Smith' },
              { environment: 'development', version: '1.1.8', status: 'failed', time: '6 hours ago', user: 'Mike Johnson' },
            ].map((deployment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {deployment.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {deployment.environment} • v{deployment.version}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      by {deployment.user} • {deployment.time}
                    </div>
                  </div>
                </div>
                <Badge variant={deployment.status === 'success' ? 'success' : 'destructive'}>
                  {deployment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Wizard */}
      {showWizard && (
        <DeploymentWizard
          workflow={workflow}
          onClose={() => setShowWizard(false)}
          onDeploy={(config) => {
            console.log('Deploy with config:', config);
            setShowWizard(false);
          }}
        />
      )}
    </div>
  );
};

export default DeploymentCenter;
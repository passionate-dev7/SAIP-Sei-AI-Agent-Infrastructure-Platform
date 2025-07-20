import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Cloud, Server, Settings, Zap, CheckCircle } from 'lucide-react';
import { Workflow, DeploymentConfig } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface DeploymentWizardProps {
  workflow: Workflow;
  onClose: () => void;
  onDeploy: (config: DeploymentConfig) => void;
}

type Step = 'provider' | 'environment' | 'configuration' | 'review';

const DeploymentWizard: React.FC<DeploymentWizardProps> = ({ workflow, onClose, onDeploy }) => {
  const [currentStep, setCurrentStep] = useState<Step>('provider');
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    environment: 'development',
    scaling: {
      minInstances: 1,
      maxInstances: 3,
      targetCPU: 70,
      targetMemory: 80,
      autoScaling: true,
    },
    monitoring: {
      enabled: true,
      alerting: [],
      metrics: [],
    },
    security: {
      authentication: { type: 'none', configuration: {} },
      authorization: { type: 'none', configuration: {} },
      encryption: { enabled: false, algorithm: 'AES-256', keyRotation: false },
    },
  });
  
  const [selectedProvider, setSelectedProvider] = useState<string>('aws');
  const [isDeploying, setIsDeploying] = useState(false);

  const steps: Array<{ id: Step; title: string; icon: React.ComponentType<any> }> = [
    { id: 'provider', title: 'Cloud Provider', icon: Cloud },
    { id: 'environment', title: 'Environment', icon: Server },
    { id: 'configuration', title: 'Configuration', icon: Settings },
    { id: 'review', title: 'Review & Deploy', icon: Zap },
  ];

  const cloudProviders = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      description: 'Deploy to AWS with Lambda, ECS, or EC2',
      icon: '🟧',
      features: ['Auto-scaling', 'Lambda support', 'Global regions'],
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Deploy to Azure with Functions or Container Apps',
      icon: '🔷',
      features: ['Container Apps', 'Functions', 'AI integration'],
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      description: 'Deploy to GCP with Cloud Run or Functions',
      icon: '🟦',
      features: ['Cloud Run', 'Serverless', 'AI/ML services'],
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Fast deployment with edge functions',
      icon: '⚫',
      features: ['Edge functions', 'Fast deployment', 'CDN'],
    },
  ];

  const environments = [
    {
      id: 'development',
      name: 'Development',
      description: 'For testing and development',
      cost: 'Low',
      resources: 'Minimal',
    },
    {
      id: 'staging',
      name: 'Staging',
      description: 'Pre-production testing',
      cost: 'Medium',
      resources: 'Standard',
    },
    {
      id: 'production',
      name: 'Production',
      description: 'Live environment',
      cost: 'High',
      resources: 'Optimized',
    },
  ];

  const handleNext = () => {
    const stepOrder: Step[] = ['provider', 'environment', 'configuration', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ['provider', 'environment', 'configuration', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate deployment
      onDeploy(deploymentConfig);
    } finally {
      setIsDeploying(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'provider':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Cloud Provider</h3>
              <p className="text-muted-foreground mb-4">
                Select where you want to deploy your workflow
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cloudProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{provider.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{provider.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {provider.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {provider.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedProvider === provider.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'environment':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Environment Settings</h3>
              <p className="text-muted-foreground mb-4">
                Choose the environment for your deployment
              </p>
            </div>
            <div className="space-y-3">
              {environments.map((env) => (
                <Card
                  key={env.id}
                  className={`cursor-pointer transition-all ${
                    deploymentConfig.environment === env.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() =>
                    setDeploymentConfig(prev => ({
                      ...prev,
                      environment: env.id as any,
                    }))
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{env.name}</h4>
                        <p className="text-sm text-muted-foreground">{env.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {env.cost} cost
                        </Badge>
                        <div className="text-xs text-muted-foreground">{env.resources} resources</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'configuration':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Deployment Configuration</h3>
              <p className="text-muted-foreground mb-4">
                Configure scaling, monitoring, and security settings
              </p>
            </div>

            {/* Scaling Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Auto Scaling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Instances</label>
                    <Input
                      type="number"
                      min="1"
                      value={deploymentConfig.scaling.minInstances}
                      onChange={(e) =>
                        setDeploymentConfig(prev => ({
                          ...prev,
                          scaling: {
                            ...prev.scaling,
                            minInstances: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Instances</label>
                    <Input
                      type="number"
                      min="1"
                      value={deploymentConfig.scaling.maxInstances}
                      onChange={(e) =>
                        setDeploymentConfig(prev => ({
                          ...prev,
                          scaling: {
                            ...prev.scaling,
                            maxInstances: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Target CPU (%)</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={deploymentConfig.scaling.targetCPU}
                      onChange={(e) =>
                        setDeploymentConfig(prev => ({
                          ...prev,
                          scaling: {
                            ...prev.scaling,
                            targetCPU: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Memory (%)</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={deploymentConfig.scaling.targetMemory}
                      onChange={(e) =>
                        setDeploymentConfig(prev => ({
                          ...prev,
                          scaling: {
                            ...prev.scaling,
                            targetMemory: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoScaling"
                    checked={deploymentConfig.scaling.autoScaling}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({
                        ...prev,
                        scaling: {
                          ...prev.scaling,
                          autoScaling: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-input"
                  />
                  <label htmlFor="autoScaling" className="text-sm font-medium">
                    Enable Auto Scaling
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Monitoring Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monitoring & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="monitoring"
                    checked={deploymentConfig.monitoring.enabled}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({
                        ...prev,
                        monitoring: {
                          ...prev.monitoring,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-input"
                  />
                  <label htmlFor="monitoring" className="text-sm font-medium">
                    Enable Monitoring
                  </label>
                </div>
                {deploymentConfig.monitoring.enabled && (
                  <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                    <div>• Performance metrics</div>
                    <div>• Error tracking</div>
                    <div>• Uptime monitoring</div>
                    <div>• Custom dashboards</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Authentication</label>
                  <select
                    className="w-full mt-1 px-3 py-2 text-sm border border-input rounded-md bg-background"
                    value={deploymentConfig.security.authentication.type}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          authentication: {
                            type: e.target.value as any,
                            configuration: {},
                          },
                        },
                      }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="api_key">API Key</option>
                    <option value="oauth">OAuth</option>
                    <option value="jwt">JWT</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="encryption"
                    checked={deploymentConfig.security.encryption.enabled}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          encryption: {
                            ...prev.security.encryption,
                            enabled: e.target.checked,
                          },
                        },
                      }))
                    }
                    className="rounded border-input"
                  />
                  <label htmlFor="encryption" className="text-sm font-medium">
                    Enable End-to-End Encryption
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review & Deploy</h3>
              <p className="text-muted-foreground mb-4">
                Review your configuration before deployment
              </p>
            </div>

            {/* Workflow Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span>{workflow.agents.length} agents</span>
                  <span>{workflow.connections.length} connections</span>
                  <Badge variant="outline">v{workflow.version}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deployment Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Provider:</span>
                  <Badge variant="outline">
                    {cloudProviders.find(p => p.id === selectedProvider)?.name}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Environment:</span>
                  <Badge variant="outline" className="capitalize">
                    {deploymentConfig.environment}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Auto Scaling:</span>
                  <Badge variant={deploymentConfig.scaling.autoScaling ? 'success' : 'secondary'}>
                    {deploymentConfig.scaling.autoScaling ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Instances:</span>
                  <span className="text-sm">
                    {deploymentConfig.scaling.minInstances} - {deploymentConfig.scaling.maxInstances}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monitoring:</span>
                  <Badge variant={deploymentConfig.monitoring.enabled ? 'success' : 'secondary'}>
                    {deploymentConfig.monitoring.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Authentication:</span>
                  <Badge variant="outline" className="capitalize">
                    {deploymentConfig.security.authentication.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Cost */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estimated Monthly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compute:</span>
                    <span>$45.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage:</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network:</span>
                    <span>$8.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monitoring:</span>
                    <span>$12.00</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>$70.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Deploy Workflow</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-4 mt-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : steps.indexOf(steps.find(s => s.id === currentStep)!) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {steps.indexOf(steps.find(s => s.id === currentStep)!) > index ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'provider'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                {currentStep === 'review' ? (
                  <Button onClick={handleDeploy} loading={isDeploying}>
                    <Zap className="w-4 h-4 mr-2" />
                    {isDeploying ? 'Deploying...' : 'Deploy Now'}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeploymentWizard;
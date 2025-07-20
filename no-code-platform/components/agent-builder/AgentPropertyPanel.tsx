import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Code, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AgentPropertyPanelProps {
  component?: any;
  agent?: Agent;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const AgentPropertyPanel: React.FC<AgentPropertyPanelProps> = ({
  component,
  agent,
  onUpdate,
  onClose,
}) => {
  const [localComponent, setLocalComponent] = useState(component);
  const [activeTab, setActiveTab] = useState<'general' | 'configuration' | 'advanced'>('general');

  const handleChange = (field: string, value: any) => {
    setLocalComponent((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfigurationChange = (key: string, value: any) => {
    setLocalComponent((prev: any) => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onUpdate(localComponent);
  };

  const renderGeneralTab = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Name</label>
        <Input
          value={localComponent.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Component name"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <textarea
          className="w-full h-20 px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          value={localComponent.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Component description"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={localComponent.enabled || false}
          onChange={(e) => handleChange('enabled', e.target.checked)}
          className="rounded border-input"
        />
        <label htmlFor="enabled" className="text-sm font-medium">
          Enabled
        </label>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {(localComponent.tags || []).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
              <button
                onClick={() => {
                  const newTags = localComponent.tags.filter((_: any, i: number) => i !== index);
                  handleChange('tags', newTags);
                }}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Add tag and press Enter"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              const newTags = [...(localComponent.tags || []), e.currentTarget.value];
              handleChange('tags', newTags);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );

  const renderConfigurationTab = () => {
    const componentTypeConfigs = {
      trigger: {
        webhook: [
          { key: 'url', label: 'Webhook URL', type: 'url' },
          { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
          { key: 'headers', label: 'Headers', type: 'json' },
        ],
        schedule: [
          { key: 'cron', label: 'Cron Expression', type: 'text' },
          { key: 'timezone', label: 'Timezone', type: 'text' },
          { key: 'enabled', label: 'Enabled', type: 'boolean' },
        ],
        event: [
          { key: 'eventType', label: 'Event Type', type: 'text' },
          { key: 'filter', label: 'Filter Expression', type: 'text' },
        ],
      },
      action: {
        api_call: [
          { key: 'url', label: 'API URL', type: 'url' },
          { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
          { key: 'headers', label: 'Headers', type: 'json' },
          { key: 'body', label: 'Request Body', type: 'json' },
        ],
        email: [
          { key: 'to', label: 'To Email', type: 'email' },
          { key: 'subject', label: 'Subject', type: 'text' },
          { key: 'template', label: 'Email Template', type: 'textarea' },
        ],
        ai_prompt: [
          { key: 'model', label: 'AI Model', type: 'select', options: ['gpt-3.5-turbo', 'gpt-4', 'claude-3'] },
          { key: 'prompt', label: 'Prompt Template', type: 'textarea' },
          { key: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 2, step: 0.1 },
        ],
      },
    };

    const configs = componentTypeConfigs[localComponent.componentType as keyof typeof componentTypeConfigs]?.[localComponent.id as any] || [];

    return (
      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.key}>
            <label className="text-sm font-medium mb-2 block">{config.label}</label>
            {config.type === 'select' ? (
              <select
                className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background"
                value={localComponent.configuration?.[config.key] || ''}
                onChange={(e) => handleConfigurationChange(config.key, e.target.value)}
              >
                <option value="">Select {config.label}</option>
                {config.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : config.type === 'textarea' ? (
              <textarea
                className="w-full h-20 px-3 py-2 text-sm border border-input rounded-md bg-background resize-none"
                value={localComponent.configuration?.[config.key] || ''}
                onChange={(e) => handleConfigurationChange(config.key, e.target.value)}
                placeholder={`Enter ${config.label.toLowerCase()}`}
              />
            ) : config.type === 'json' ? (
              <textarea
                className="w-full h-20 px-3 py-2 text-sm border border-input rounded-md bg-background resize-none font-mono"
                value={JSON.stringify(localComponent.configuration?.[config.key] || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleConfigurationChange(config.key, parsed);
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder="Enter JSON"
              />
            ) : config.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localComponent.configuration?.[config.key] || false}
                  onChange={(e) => handleConfigurationChange(config.key, e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm">Enable {config.label}</span>
              </div>
            ) : config.type === 'number' ? (
              <Input
                type="number"
                min={config.min}
                max={config.max}
                step={config.step}
                value={localComponent.configuration?.[config.key] || ''}
                onChange={(e) => handleConfigurationChange(config.key, parseFloat(e.target.value))}
                placeholder={`Enter ${config.label.toLowerCase()}`}
              />
            ) : (
              <Input
                type={config.type}
                value={localComponent.configuration?.[config.key] || ''}
                onChange={(e) => handleConfigurationChange(config.key, e.target.value)}
                placeholder={`Enter ${config.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}

        {configs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No configuration options available for this component type.</p>
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Retry Configuration</label>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Max Retries"
            value={localComponent.retryConfig?.maxRetries || ''}
            onChange={(e) =>
              handleChange('retryConfig', {
                ...localComponent.retryConfig,
                maxRetries: parseInt(e.target.value),
              })
            }
          />
          <select
            className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background"
            value={localComponent.retryConfig?.backoffStrategy || ''}
            onChange={(e) =>
              handleChange('retryConfig', {
                ...localComponent.retryConfig,
                backoffStrategy: e.target.value,
              })
            }
          >
            <option value="">Select Backoff Strategy</option>
            <option value="linear">Linear</option>
            <option value="exponential">Exponential</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Error Handling</label>
        <textarea
          className="w-full h-20 px-3 py-2 text-sm border border-input rounded-md bg-background resize-none"
          placeholder="Error handling configuration"
          value={localComponent.errorHandling || ''}
          onChange={(e) => handleChange('errorHandling', e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Custom Code</label>
        <div className="border border-input rounded-md">
          <textarea
            className="w-full h-40 px-3 py-2 text-sm bg-background resize-none font-mono"
            placeholder="// Custom JavaScript code"
            value={localComponent.customCode || ''}
            onChange={(e) => handleChange('customCode', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Environment Variables</label>
        <div className="space-y-2">
          {Object.entries(localComponent.envVars || {}).map(([key, value], index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Variable name"
                value={key}
                onChange={(e) => {
                  const newEnvVars = { ...localComponent.envVars };
                  delete newEnvVars[key];
                  newEnvVars[e.target.value] = value;
                  handleChange('envVars', newEnvVars);
                }}
              />
              <Input
                placeholder="Variable value"
                value={value as string}
                onChange={(e) => {
                  handleChange('envVars', {
                    ...localComponent.envVars,
                    [key]: e.target.value,
                  });
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newEnvVars = { ...localComponent.envVars };
                  delete newEnvVars[key];
                  handleChange('envVars', newEnvVars);
                }}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleChange('envVars', {
                ...localComponent.envVars,
                [`VAR_${Date.now()}`]: '',
              });
            }}
          >
            Add Variable
          </Button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'configuration', label: 'Configuration', icon: Code },
    { id: 'advanced', label: 'Advanced', icon: Code },
  ];

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="h-full flex flex-col bg-background"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{component.name}</h3>
          <p className="text-sm text-muted-foreground">{component.componentType}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'configuration' && renderConfigurationTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentPropertyPanel;
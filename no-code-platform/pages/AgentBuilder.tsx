import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Play, Eye, Bot } from 'lucide-react';
import { Agent } from '../types';
import { useAgentStore } from '../store';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import AgentCanvas from '../components/agent-builder/AgentCanvas';

const AgentBuilder: React.FC = () => {
  const { agents, selectedAgent, setSelectedAgent, addAgent, updateAgent } = useAgentStore();
  const [isCreating, setIsCreating] = useState(false);

  const createNewAgent = () => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: 'New Agent',
      description: 'A new agent ready to be configured',
      type: 'custom',
      capabilities: [],
      configuration: {
        triggers: [],
        actions: [],
        conditions: [],
        variables: [],
        settings: {},
        integrations: [],
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      tags: [],
      author: 'current-user',
      isTemplate: false,
      collaborators: [],
    };

    addAgent(newAgent);
    setSelectedAgent(newAgent);
  };

  const handleAgentChange = (updatedAgent: Agent) => {
    updateAgent(updatedAgent.id, updatedAgent);
    setSelectedAgent(updatedAgent);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Builder</h1>
            <p className="text-muted-foreground">
              Design and configure your AI agents with drag-and-drop interface
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!selectedAgent && (
              <Button onClick={createNewAgent}>
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </Button>
            )}
            {selectedAgent && (
              <>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Test Run
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {selectedAgent ? (
          <AgentCanvas
            agent={selectedAgent}
            onAgentChange={handleAgentChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Bot className="w-12 h-12 text-primary" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">Start Building Your Agent</h2>
              <p className="text-muted-foreground mb-6">
                Create a new agent or select an existing one from your library to start building.
              </p>
              <div className="space-y-3">
                <Button onClick={createNewAgent} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Agent
                </Button>
                {agents.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Or choose from your existing agents:
                    </p>
                    <div className="space-y-2">
                      {agents.slice(0, 3).map((agent) => (
                        <Button
                          key={agent.id}
                          variant="outline"
                          onClick={() => setSelectedAgent(agent)}
                          className="w-full justify-start"
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          {agent.name}
                        </Button>
                      ))}
                      {agents.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{agents.length - 3} more agents
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentBuilder;
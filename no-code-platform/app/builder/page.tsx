'use client'

import { useState, useEffect } from 'react'
import AgentCanvas from '../../components/agent-builder/AgentCanvas'
import AgentPropertyPanel from '../../components/agent-builder/AgentPropertyPanel'
import AIAssistant from '../../components/agent-builder/AIAssistant'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { Agent } from '../../types'

export default function AgentBuilderPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null)

  // Initialize with a default agent
  useEffect(() => {
    const defaultAgent: Agent = {
      id: crypto.randomUUID(),
      name: 'New Sei Agent',
      description: 'AI agent for Sei blockchain operations',
      type: 'assistant' as any,
      status: 'draft',
      capabilities: [],
      configuration: {
        triggers: [],
        actions: [],
        environment: {},
        schedule: null
      },
      version: '1.0.0',
      owner: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setCurrentAgent(defaultAgent)
    setAgents([defaultAgent])
  }, [])

  const handleAgentUpdate = (updatedAgent: Agent) => {
    setAgents(prev => 
      prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent)
    )
    setSelectedAgent(updatedAgent)
  }

  const handleAgentDelete = (agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId))
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null)
    }
  }

  const handleAgentCreate = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Agent Builder" 
          onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
        />
        
        <div className="flex-1 flex relative">
          {/* Main Canvas */}
          <div className="flex-1">
            <AgentCanvas
              agent={currentAgent}
              agents={agents}
              selectedAgent={selectedAgent}
              onAgentSelect={setSelectedAgent}
              onAgentChange={(updatedAgent) => {
                setCurrentAgent(updatedAgent)
                handleAgentUpdate(updatedAgent)
              }}
              onAgentUpdate={handleAgentUpdate}
              onAgentDelete={handleAgentDelete}
              onAgentCreate={handleAgentCreate}
            />
          </div>

          {/* Property Panel */}
          {selectedAgent && (
            <div className="w-96 border-l border-gray-200 bg-white">
              <AgentPropertyPanel
                agent={selectedAgent}
                onUpdate={handleAgentUpdate}
                onClose={() => setSelectedAgent(null)}
              />
            </div>
          )}

          {/* AI Assistant */}
          {showAIAssistant && (
            <div className="absolute bottom-4 right-4 w-96 h-96">
              <AIAssistant
                onClose={() => setShowAIAssistant(false)}
                onSuggestion={(suggestion) => {
                  // Handle AI suggestions
                  console.log('AI Suggestion:', suggestion)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
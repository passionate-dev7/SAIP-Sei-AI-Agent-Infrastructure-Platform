'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../components/layout/Header'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { 
  Workflow, 
  GitBranch, 
  Zap,
  Code,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react'

const workflowOptions = [
  {
    id: 'n8n',
    name: 'n8n Professional Workflows',
    description: 'Enterprise-grade workflow automation with 400+ integrations',
    icon: Workflow,
    features: [
      '400+ pre-built integrations',
      'Advanced workflow logic',
      'Webhook support',
      'API integrations',
      'Scheduled workflows'
    ],
    status: 'active',
    recommended: true,
    path: '/workflow/n8n'
  },
  {
    id: 'custom',
    name: 'Custom Workflow Builder',
    description: 'Lightweight drag-and-drop workflow designer for Sei operations',
    icon: GitBranch,
    features: [
      'Sei-specific nodes',
      'Smart contract integration',
      'NFT operations',
      'DeFi automations',
      'Visual programming'
    ],
    status: 'active',
    recommended: false,
    path: '/workflow'
  },
  {
    id: 'agent',
    name: 'AI Agent Orchestration',
    description: 'Build complex multi-agent workflows with AI coordination',
    icon: Sparkles,
    features: [
      'Multi-agent coordination',
      'AI decision making',
      'Autonomous operations',
      'Memory management',
      'Learning capabilities'
    ],
    status: 'active',
    recommended: false,
    path: '/builder'
  }
]

export default function WorkflowSelectPage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSelect = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Choose Your Workflow Builder" />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-3">Select Your Workflow Builder</h1>
              <p className="text-muted-foreground text-lg">
                Choose the best tool for your automation needs
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {workflowOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`relative hover:shadow-lg transition-all cursor-pointer ${
                    selectedOption === option.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {option.recommended && (
                    <div className="absolute -top-3 -right-3">
                      <Badge className="bg-green-500 text-white">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant={option.status === 'active' ? 'success' : 'secondary'}>
                        {option.status}
                      </Badge>
                    </div>
                    <CardTitle>{option.name}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {option.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant={selectedOption === option.id ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(option.path)
                      }}
                    >
                      {selectedOption === option.id ? 'Launch' : 'Select'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      n8n Professional
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Best for: Complex integrations with external services, enterprise workflows, and when you need pre-built connectors.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Custom Builder
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Best for: Sei-specific operations, smart contract interactions, and lightweight automation without external dependencies.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Agent Orchestration
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Best for: Complex AI-driven workflows, multi-agent systems, and autonomous decision-making processes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/templates')}>
                Browse Templates
              </Button>
              <Button variant="outline" onClick={() => window.open('https://docs.n8n.io', '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
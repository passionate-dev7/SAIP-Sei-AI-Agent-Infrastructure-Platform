'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Brain, 
  Zap, 
  Shield, 
  Network, 
  Coins, 
  ChevronRight,
  Play,
  Pause,
  Activity,
  TrendingUp,
  Users,
  Wallet,
  Code,
  Settings
} from 'lucide-react';

export default function HomePage() {
  const [agentsActive, setAgentsActive] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [networkHealth, setNetworkHealth] = useState(98);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Simulate live metrics
    const interval = setInterval(() => {
      if (isRunning) {
        setAgentsActive(prev => Math.min(prev + Math.random() > 0.7 ? 1 : 0, 12));
        setTasksCompleted(prev => prev + Math.floor(Math.random() * 3));
        setNetworkHealth(prev => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "Autonomous Agents",
      description: "Self-directing AI agents with advanced reasoning and decision-making capabilities",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Multi-LLM Support", 
      description: "Seamlessly integrate OpenAI, Anthropic, Llama, and custom language models",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Network className="h-8 w-8" />,
      title: "Swarm Intelligence",
      description: "Coordinated multi-agent systems with hierarchical and mesh topologies",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Blockchain Integration",
      description: "Native Sei Network support with GOAT SDK for DeFi operations",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Processing",
      description: "High-performance task scheduling and parallel execution",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Ready",
      description: "Production-grade security, monitoring, and scalability features",
      color: "from-gray-500 to-slate-500"
    }
  ];

  const demoScenarios = [
    {
      title: "DeFi Trading Bot",
      description: "Automated token swapping and liquidity management on Sei",
      status: "Ready",
      agents: 3
    },
    {
      title: "Code Review Swarm",
      description: "Multi-agent collaborative code analysis and optimization",
      status: "Active", 
      agents: 5
    },
    {
      title: "Research Network",
      description: "Distributed information gathering and synthesis",
      status: "Ready",
      agents: 8
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Agent Framework</h1>
                <p className="text-sm text-gray-500">v1.0.0</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#demos" className="text-gray-600 hover:text-gray-900 transition-colors">Demos</a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Next-Generation
              <br />
              AI Agent Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Build autonomous AI agents with advanced swarm intelligence, blockchain integration, 
              and multi-LLM support. Production-ready TypeScript framework for the future of AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 ${
                  isRunning 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                <span>{isRunning ? 'Stop Demo' : 'Start Demo'}</span>
              </button>
              <button className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>View Code</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics */}
      <section className="py-12 px-6 bg-white/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Active Agents</p>
                  <p className="text-3xl font-bold text-gray-900">{agentsActive}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Tasks Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{tasksCompleted}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Network Health</p>
                  <p className="text-3xl font-bold text-gray-900">{networkHealth.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Sei Integration</p>
                  <p className="text-lg font-semibold text-green-600">Connected</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100">
                  <Wallet className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, deploy, and scale intelligent agent systems
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border hover:shadow-xl transition-shadow">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Scenarios */}
      <section id="demos" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Interactive Demos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of multi-agent systems in action
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {demoScenarios.map((scenario, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                    <p className="text-gray-600">{scenario.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    scenario.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {scenario.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{scenario.agents} agents</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold">
                    Launch Demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
            Modern Architecture
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl border max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-600" />
                  Agent Layer
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Autonomous Decision Making</li>
                  <li>• Memory Management</li>
                  <li>• Skill Learning</li>
                  <li>• Task Execution</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Network className="h-5 w-5 mr-2 text-purple-600" />
                  Coordination Layer
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Swarm Intelligence</li>
                  <li>• Load Balancing</li>
                  <li>• Consensus Algorithms</li>
                  <li>• Message Routing</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-orange-600" />
                  Blockchain Layer
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sei Network Integration</li>
                  <li>• DeFi Operations</li>
                  <li>• Smart Contract Interaction</li>
                  <li>• Wallet Management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Agent Framework</span>
              </div>
              <p className="text-gray-400">
                Next-generation AI agent platform with blockchain integration
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Quick Start</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Agent Framework v2. Built with Next.js, TypeScript, and the power of AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
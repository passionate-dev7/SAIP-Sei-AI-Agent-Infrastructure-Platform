'use client'

import { useState, useEffect } from 'react'
import { Activity, Users, CheckCircle, Wifi, Play, Code } from 'lucide-react'

export default function Home() {
  const [activeAgents, setActiveAgents] = useState(0)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [networkHealth, setNetworkHealth] = useState(98.0)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveAgents(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)))
      setTasksCompleted(prev => prev + Math.floor(Math.random() * 2))
      setNetworkHealth(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.5) * 2)))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Agent Framework</h1>
              <p className="text-gray-400">v1.0.0</p>
            </div>
          </div>
          
          <nav className="flex gap-4 mb-8">
            <a href="#features" className="text-blue-400 hover:text-blue-300">Features</a>
            <a href="#demos" className="text-blue-400 hover:text-blue-300">Demos</a>
            <a href="#docs" className="text-blue-400 hover:text-blue-300">Docs</a>
            <a href="#" className="text-blue-400 hover:text-blue-300">Get Started</a>
          </nav>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Next-Generation AI Agent Platform</h2>
            <p className="text-gray-300 max-w-3xl">
              Build autonomous AI agents with advanced swarm intelligence, blockchain integration, 
              and multi-LLM support. Production-ready TypeScript framework for the future of AI.
            </p>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Play className="w-5 h-5" />
              Start Demo
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Code className="w-5 h-5" />
              View Code
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">{activeAgents}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Active Agents</h3>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold">{tasksCompleted}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Tasks Completed</h3>
            <Activity className="w-5 h-5 text-green-400 mt-2" />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold">{networkHealth.toFixed(1)}%</span>
            </div>
            <h3 className="text-gray-400 text-sm">Network Health</h3>
            <Wifi className="w-5 h-5 text-yellow-400 mt-2" />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Wifi className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-green-400">Connected</span>
            </div>
            <h3 className="text-gray-400 text-sm">Sei Integration</h3>
            <div className="w-6 h-6 bg-green-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Powerful Features</h2>
          <p className="text-gray-300 mb-8">
            Everything you need to build, deploy, and scale intelligent agent systems
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">🤖 Multi-Agent Swarms</h3>
              <p className="text-gray-400">
                Coordinate multiple AI agents working together with advanced swarm intelligence algorithms
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">🔗 Blockchain Integration</h3>
              <p className="text-gray-400">
                Native Sei blockchain support with smart contract interactions and wallet management
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">🧠 Multi-LLM Support</h3>
              <p className="text-gray-400">
                Seamlessly switch between OpenAI, Anthropic, Llama, and other LLM providers
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">💾 Memory Systems</h3>
              <p className="text-gray-400">
                Persistent and vector-based memory storage for long-term agent learning
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">📊 Real-time Metrics</h3>
              <p className="text-gray-400">
                Comprehensive monitoring and analytics for agent performance and health
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">🚀 Production Ready</h3>
              <p className="text-gray-400">
                Enterprise-grade TypeScript framework with comprehensive testing and documentation
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
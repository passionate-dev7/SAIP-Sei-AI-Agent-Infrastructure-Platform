import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { 
  Bot, 
  Workflow, 
  Code, 
  Users, 
  BarChart, 
  Package,
  Rocket,
  Shield
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Sei No-Code Agent Platform
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Build, deploy, and manage AI agents on Sei blockchain without writing a single line of code
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/builder">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Rocket className="mr-2 h-5 w-5" />
                Start Building
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="text-white border-white">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <Bot className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              AI Agent Builder
            </h3>
            <p className="text-gray-300">
              Drag-and-drop interface to create powerful AI agents
            </p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <Workflow className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Visual Workflows
            </h3>
            <p className="text-gray-300">
              Design complex agent workflows with our visual designer
            </p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <Code className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Contracts
            </h3>
            <p className="text-gray-300">
              Auto-generate and deploy smart contracts on Sei
            </p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <Shield className="h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Secure by Design
            </h3>
            <p className="text-gray-300">
              Built-in security features and audit capabilities
            </p>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/builder" className="group">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400">
                Agent Builder
              </h2>
              <p className="text-gray-300">
                Create AI agents with our intuitive visual builder
              </p>
            </Card>
          </Link>

          <Link href="/workflow" className="group">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400">
                Workflow Designer
              </h2>
              <p className="text-gray-300">
                Design and automate complex agent workflows
              </p>
            </Card>
          </Link>

          <Link href="/dashboard" className="group">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400">
                Dashboard
              </h2>
              <p className="text-gray-300">
                Monitor and manage your deployed agents
              </p>
            </Card>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-white">10x</div>
              <div className="text-gray-300">Faster Development</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">70%</div>
              <div className="text-gray-300">Gas Savings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">Zero</div>
              <div className="text-gray-300">Code Required</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
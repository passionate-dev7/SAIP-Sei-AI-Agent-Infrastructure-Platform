'use client'

import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  Bot,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data
const performanceData = [
  { time: '00:00', transactions: 120, gasUsed: 45000 },
  { time: '04:00', transactions: 98, gasUsed: 38000 },
  { time: '08:00', transactions: 186, gasUsed: 72000 },
  { time: '12:00', transactions: 220, gasUsed: 85000 },
  { time: '16:00', transactions: 195, gasUsed: 75000 },
  { time: '20:00', transactions: 165, gasUsed: 63000 },
  { time: '24:00', transactions: 143, gasUsed: 55000 },
]

const agentStats = [
  { name: 'Active', value: 12, color: '#10b981' },
  { name: 'Paused', value: 3, color: '#f59e0b' },
  { name: 'Error', value: 1, color: '#ef4444' },
  { name: 'Idle', value: 4, color: '#6b7280' },
]

const recentActivity = [
  { id: 1, agent: 'Trading Bot Alpha', action: 'Executed swap', status: 'success', time: '2 min ago' },
  { id: 2, agent: 'Data Collector', action: 'Fetched prices', status: 'success', time: '5 min ago' },
  { id: 3, agent: 'Liquidity Provider', action: 'Added liquidity', status: 'success', time: '12 min ago' },
  { id: 4, agent: 'Risk Manager', action: 'Risk check failed', status: 'error', time: '15 min ago' },
  { id: 5, agent: 'Arbitrage Bot', action: 'Found opportunity', status: 'success', time: '18 min ago' },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('24h')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" />
        
        <div className="flex-1 p-6 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  12%
                </span>
              </div>
              <div className="text-2xl font-bold">20</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-green-600" />
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  8%
                </span>
              </div>
              <div className="text-2xl font-bold">1,127</div>
              <div className="text-sm text-gray-600">Transactions Today</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
                <span className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  3%
                </span>
              </div>
              <div className="text-2xl font-bold">433K</div>
              <div className="text-sm text-gray-600">Gas Used</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-purple-600" />
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  25%
                </span>
              </div>
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-gray-600">Collaborations</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Performance Overview</h2>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gasUsed" 
                    stroke="#10b981" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Agent Status Pie Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Agent Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={agentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {agentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {agentStats.map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: stat.color }}
                      />
                      <span>{stat.name}</span>
                    </div>
                    <span className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{activity.agent}</div>
                      <div className="text-sm text-gray-600">{activity.action}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
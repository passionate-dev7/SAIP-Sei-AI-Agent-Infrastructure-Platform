import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  GitBranch,
  TrendingUp,
  Users,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Agents',
      value: '24',
      change: '+12%',
      icon: Bot,
      color: 'text-blue-600',
      trend: 'up',
    },
    {
      title: 'Active Workflows',
      value: '8',
      change: '+4%',
      icon: GitBranch,
      color: 'text-green-600',
      trend: 'up',
    },
    {
      title: 'Executions Today',
      value: '1,247',
      change: '+23%',
      icon: Activity,
      color: 'text-purple-600',
      trend: 'up',
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      change: '+0.3%',
      icon: TrendingUp,
      color: 'text-green-600',
      trend: 'up',
    },
  ];

  const recentActivity = [
    {
      type: 'deployment',
      message: 'Customer Support Bot deployed to production',
      time: '2 minutes ago',
      status: 'success',
    },
    {
      type: 'execution',
      message: 'Lead Generation workflow completed successfully',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      type: 'error',
      message: 'Data Processing agent encountered an error',
      time: '12 minutes ago',
      status: 'error',
    },
    {
      type: 'creation',
      message: 'New agent "Email Automation" created',
      time: '1 hour ago',
      status: 'info',
    },
  ];

  const topPerforming = [
    {
      name: 'Customer Support Bot',
      executions: 2450,
      successRate: 99.2,
      avgTime: '1.2s',
    },
    {
      name: 'Lead Generation',
      executions: 1880,
      successRate: 97.8,
      avgTime: '2.1s',
    },
    {
      name: 'Data Processor',
      executions: 1560,
      successRate: 98.5,
      avgTime: '3.4s',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your agents and workflows at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Last 24 hours
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp
                        className={`w-3 h-3 ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                      <span
                        className={
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success'
                      ? 'bg-green-500'
                      : activity.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge
                  variant={
                    activity.status === 'success'
                      ? 'success'
                      : activity.status === 'error'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {activity.status}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerforming.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {agent.executions} executions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{agent.successRate}%</div>
                  <div className="text-xs text-muted-foreground">
                    {agent.avgTime} avg
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Bot className="w-6 h-6" />
              <span>Create Agent</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <GitBranch className="w-6 h-6" />
              <span>Design Workflow</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Invite Team</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div>
                <p className="font-medium text-green-800">API Services</p>
                <p className="text-sm text-green-600">All operational</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div>
                <p className="font-medium text-green-800">Deployment</p>
                <p className="text-sm text-green-600">All operational</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-800">Monitoring</p>
                <p className="text-sm text-yellow-600">Minor issues</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
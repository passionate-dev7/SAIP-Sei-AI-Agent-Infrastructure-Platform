import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  GitBranch,
  BookTemplate,
  Store,
  BarChart3,
  FlaskConical,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { Badge } from '../ui/Badge';

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useAppStore();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and metrics',
    },
    {
      name: 'Agent Builder',
      href: '/builder',
      icon: Bot,
      description: 'Create AI agents',
      badge: 'New',
    },
    {
      name: 'Workflows',
      href: '/workflows',
      icon: GitBranch,
      description: 'Design workflows',
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: BookTemplate,
      description: 'Pre-built solutions',
    },
    {
      name: 'Marketplace',
      href: '/marketplace',
      icon: Store,
      description: 'Browse & sell agents',
      badge: 'Hot',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Performance insights',
    },
    {
      name: 'A/B Testing',
      href: '/testing',
      icon: FlaskConical,
      description: 'Optimize strategies',
      badge: 'Pro',
    },
    {
      name: 'Collaboration',
      href: '/collaboration',
      icon: Users,
      description: 'Team features',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Configure platform',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-muted/30 w-64">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">NoCode AI</h1>
            <p className="text-xs text-muted-foreground">Agent Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group relative text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <item.icon className="w-4 h-4" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-4"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs opacity-60 group-hover:opacity-80">
                  {item.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">John Doe</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
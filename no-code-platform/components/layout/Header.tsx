import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
  Plus,
  Play,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  title?: string;
  onToggleAI?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleAI }) => {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useAppStore();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Search */}
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, workflows..."
              className="pl-9 h-9 bg-muted/30"
            />
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-2">
          <motion.div
            className="hidden lg:flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              All systems operational
            </Badge>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-1">
            <Button size="sm" className="h-8" onClick={() => router.push('/builder')}>
              <Plus className="w-3 h-3 mr-1" />
              New Agent
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push('/dashboard')}>
              <Play className="w-3 h-3 mr-1" />
              Deploy
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={cycleTheme}>
            <ThemeIcon className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm">
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-2 pl-2 ml-2 border-l border-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
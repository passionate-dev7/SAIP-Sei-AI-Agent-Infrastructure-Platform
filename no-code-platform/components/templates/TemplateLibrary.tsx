import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Download, Eye, Heart, ShoppingCart } from 'lucide-react';
import { Template, Agent } from '../../types';
import { useAgentStore } from '../../store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';
import TemplateFilters from './TemplateFilters';

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'recent' | 'name'>('popularity');
  const [loading, setLoading] = useState(true);

  const { agentTemplates } = useAgentStore();

  // Simulate loading templates
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      
      // Mock template data
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Customer Support Bot',
          description: 'AI-powered customer support agent with FAQ handling, ticket routing, and escalation logic',
          category: 'business',
          agent: {
            id: '1',
            name: 'Customer Support Bot',
            description: 'Handles customer inquiries and support tickets',
            type: 'coordinator',
            capabilities: [
              {
                id: '1',
                name: 'FAQ Answering',
                description: 'Answer frequently asked questions',
                category: 'communication',
                inputSchema: { type: 'string' },
                outputSchema: { type: 'string' },
                examples: []
              }
            ],
            configuration: {
              triggers: [
                {
                  id: '1',
                  type: 'webhook',
                  configuration: { endpoint: '/support' },
                  enabled: true
                }
              ],
              actions: [
                {
                  id: '1',
                  type: 'ai_prompt',
                  configuration: { model: 'gpt-3.5-turbo' },
                  enabled: true
                }
              ],
              conditions: [],
              variables: [],
              settings: {},
              integrations: []
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            tags: ['customer-service', 'support', 'chatbot'],
            author: 'template-author',
            isTemplate: true,
            collaborators: []
          },
          tags: ['customer-service', 'support', 'ai', 'chatbot'],
          rating: 4.8,
          downloads: 1240,
          author: 'NoCode Team',
          price: 0,
          currency: 'USD',
          preview: {
            images: ['/templates/customer-support-1.png', '/templates/customer-support-2.png'],
            demoUrl: 'https://demo.example.com/customer-support'
          },
          documentation: '# Customer Support Bot\n\nThis template provides a complete customer support solution...'
        },
        {
          id: '2',
          name: 'Lead Generation Assistant',
          description: 'Automatically qualify leads, schedule meetings, and update CRM systems',
          category: 'marketing',
          agent: {
            id: '2',
            name: 'Lead Generation Assistant',
            description: 'Qualifies leads and manages sales pipeline',
            type: 'analyst',
            capabilities: [],
            configuration: {
              triggers: [],
              actions: [],
              conditions: [],
              variables: [],
              settings: {},
              integrations: []
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.2.0',
            tags: ['sales', 'crm', 'lead-qualification'],
            author: 'template-author',
            isTemplate: true,
            collaborators: []
          },
          tags: ['sales', 'marketing', 'crm', 'automation'],
          rating: 4.6,
          downloads: 890,
          author: 'Sales Pro',
          price: 49,
          currency: 'USD',
          preview: {
            images: ['/templates/lead-gen-1.png'],
            video: 'https://youtube.com/watch?v=example'
          },
          documentation: '# Lead Generation Assistant\n\nAutomate your lead qualification process...'
        },
        {
          id: '3',
          name: 'Code Review Assistant',
          description: 'Automated code review with best practice suggestions and security scanning',
          category: 'development',
          agent: {
            id: '3',
            name: 'Code Review Assistant',
            description: 'Performs automated code reviews',
            type: 'coder',
            capabilities: [],
            configuration: {
              triggers: [],
              actions: [],
              conditions: [],
              variables: [],
              settings: {},
              integrations: []
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '2.0.0',
            tags: ['code-review', 'development', 'quality'],
            author: 'template-author',
            isTemplate: true,
            collaborators: []
          },
          tags: ['development', 'code-review', 'automation', 'quality'],
          rating: 4.9,
          downloads: 2150,
          author: 'DevTools Inc',
          price: 29,
          currency: 'USD',
          preview: {
            images: ['/templates/code-review-1.png', '/templates/code-review-2.png'],
            demoUrl: 'https://demo.example.com/code-review'
          },
          documentation: '# Code Review Assistant\n\nStreamline your development workflow...'
        },
        {
          id: '4',
          name: 'Social Media Manager',
          description: 'Schedule posts, respond to mentions, and analyze engagement across platforms',
          category: 'marketing',
          agent: {
            id: '4',
            name: 'Social Media Manager',
            description: 'Manages social media presence',
            type: 'coordinator',
            capabilities: [],
            configuration: {
              triggers: [],
              actions: [],
              conditions: [],
              variables: [],
              settings: {},
              integrations: []
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.3.0',
            tags: ['social-media', 'marketing', 'automation'],
            author: 'template-author',
            isTemplate: true,
            collaborators: []
          },
          tags: ['social-media', 'marketing', 'content', 'analytics'],
          rating: 4.7,
          downloads: 680,
          author: 'Social Experts',
          price: 39,
          currency: 'USD',
          preview: {
            images: ['/templates/social-1.png'],
          },
          documentation: '# Social Media Manager\n\nAutomate your social media workflow...'
        },
        {
          id: '5',
          name: 'Data Analytics Dashboard',
          description: 'Real-time data processing, visualization, and automated reporting',
          category: 'analytics',
          agent: {
            id: '5',
            name: 'Data Analytics Dashboard',
            description: 'Processes and visualizes data',
            type: 'analyst',
            capabilities: [],
            configuration: {
              triggers: [],
              actions: [],
              conditions: [],
              variables: [],
              settings: {},
              integrations: []
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.1.0',
            tags: ['analytics', 'data', 'visualization'],
            author: 'template-author',
            isTemplate: true,
            collaborators: []
          },
          tags: ['analytics', 'data', 'visualization', 'reporting'],
          rating: 4.5,
          downloads: 520,
          author: 'DataViz Pro',
          price: 79,
          currency: 'USD',
          preview: {
            images: ['/templates/analytics-1.png', '/templates/analytics-2.png'],
            demoUrl: 'https://demo.example.com/analytics'
          },
          documentation: '# Data Analytics Dashboard\n\nBuild powerful analytics dashboards...'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplates(mockTemplates);
      setLoading(false);
    };

    loadTemplates();
  }, []);

  // Filter and sort templates
  useEffect(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.agent.updatedAt).getTime() - new Date(a.agent.updatedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, sortBy]);

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template);
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'development', name: 'Development' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'support', name: 'Support' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Library</h2>
          <p className="text-muted-foreground">Choose from our collection of pre-built agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredTemplates.length} templates</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 text-sm border border-input rounded-md bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 text-sm border border-input rounded-md bg-background"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="recent">Most Recent</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TemplateCard
                template={template}
                onPreview={() => handlePreviewTemplate(template)}
                onUse={() => handleUseTemplate(template)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
          onUse={() => {
            handleUseTemplate(selectedTemplate);
            setShowPreview(false);
          }}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;
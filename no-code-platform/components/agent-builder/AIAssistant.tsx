import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, Lightbulb, Wand2, Zap } from 'lucide-react';
import { Agent } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AIAssistantProps {
  agent?: Agent | null;
  onSuggestion?: (suggestion: AISuggestion) => void;
  onClose: () => void;
}

interface AISuggestion {
  type: 'component' | 'optimization' | 'pattern' | 'integration';
  title: string;
  description: string;
  action: any;
  confidence: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ agent, onSuggestion, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you build better agents by analyzing your current setup and suggesting improvements. What would you like to work on?",
      timestamp: new Date(),
      suggestions: [
        {
          type: 'pattern',
          title: 'Add Error Handling',
          description: 'Implement retry logic and error handling for more robust agents',
          action: { type: 'add_error_handling' },
          confidence: 0.9
        },
        {
          type: 'optimization',
          title: 'Optimize Performance',
          description: 'Add caching and batch processing to improve agent performance',
          action: { type: 'optimize_performance' },
          confidence: 0.85
        },
        {
          type: 'integration',
          title: 'Add Monitoring',
          description: 'Set up monitoring and alerting for your agent',
          action: { type: 'add_monitoring' },
          confidence: 0.8
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = [
      {
        content: "Based on your agent configuration, I notice you could benefit from adding some automation triggers. Here are my recommendations:",
        suggestions: [
          {
            type: 'component' as const,
            title: 'Schedule Trigger',
            description: 'Add a scheduled trigger to run your agent automatically',
            action: { type: 'add_component', component: 'schedule_trigger' },
            confidence: 0.95
          },
          {
            type: 'component' as const,
            title: 'Webhook Trigger',
            description: 'Add a webhook to trigger your agent from external systems',
            action: { type: 'add_component', component: 'webhook_trigger' },
            confidence: 0.8
          }
        ]
      },
      {
        content: "I can help you optimize your agent's workflow. Let me analyze the current setup and suggest improvements:",
        suggestions: [
          {
            type: 'optimization' as const,
            title: 'Parallel Processing',
            description: 'Execute multiple actions in parallel for better performance',
            action: { type: 'optimize_parallel' },
            confidence: 0.9
          },
          {
            type: 'pattern' as const,
            title: 'Circuit Breaker Pattern',
            description: 'Add circuit breaker pattern for better fault tolerance',
            action: { type: 'add_circuit_breaker' },
            confidence: 0.85
          }
        ]
      },
      {
        content: "Great question! For your use case, I'd recommend implementing these patterns:",
        suggestions: [
          {
            type: 'integration' as const,
            title: 'Database Integration',
            description: 'Connect to a database for persistent data storage',
            action: { type: 'add_database_integration' },
            confidence: 0.88
          },
          {
            type: 'component' as const,
            title: 'Email Notifications',
            description: 'Add email notifications for important events',
            action: { type: 'add_email_notifications' },
            confidence: 0.82
          }
        ]
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: crypto.randomUUID(),
      type: 'assistant',
      content: randomResponse.content,
      timestamp: new Date(),
      suggestions: randomResponse.suggestions
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const aiResponse = await generateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    onSuggestion?.(suggestion);
  };

  const quickActions = [
    { icon: Zap, text: 'Optimize my agent', action: 'optimize' },
    { icon: Brain, text: 'Add AI capabilities', action: 'add_ai' },
    { icon: Lightbulb, text: 'Suggest improvements', action: 'suggest' },
    { icon: Wand2, text: 'Fix issues', action: 'fix' },
  ];

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-4 top-4 bottom-4 w-96 z-50"
    >
      <Card className="h-full flex flex-col shadow-xl">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {suggestion.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(suggestion.confidence * 100)}%
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {suggestion.type}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setInput(action.text);
                    handleSendMessage();
                  }}
                >
                  <action.icon className="w-3 h-3 mr-2" />
                  <span className="text-xs">{action.text}</span>
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your agent..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isThinking}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isThinking}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIAssistant;
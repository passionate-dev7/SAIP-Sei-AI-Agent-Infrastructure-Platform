import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Star, Download, Heart, Share2, Code, Settings, Eye } from 'lucide-react';
import { Template } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onUse: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose, onUse }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'documentation' | 'reviews'>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'demo', label: 'Demo', icon: Play },
    { id: 'documentation', label: 'Documentation', icon: Code },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  const mockReviews = [
    {
      id: '1',
      author: 'John Doe',
      rating: 5,
      comment: 'Excellent template! Saved me hours of development time.',
      date: '2024-01-15',
    },
    {
      id: '2',
      author: 'Jane Smith',
      rating: 4,
      comment: 'Great starting point, easy to customize.',
      date: '2024-01-10',
    },
    {
      id: '3',
      author: 'Mike Johnson',
      rating: 5,
      comment: 'Perfect for our customer support needs!',
      date: '2024-01-05',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{template.name}</h2>
                  <div className="flex items-center gap-2">
                    {template.price === 0 ? (
                      <Badge className="bg-green-500">Free</Badge>
                    ) : (
                      <Badge variant="outline">${template.price}</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">{template.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Images */}
                {template.preview.images && template.preview.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={template.preview.images[currentImageIndex]}
                        alt={`${template.name} preview ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE5NVYxNDVIMTc1VjEyNVoiIGZpbGw9IiM5Q0ExQTciLz4KPHA+CiAgPHRleHQgeD0iMjAwIiB5PSIxODAiIGZpbGw9IiM5Q0ExQTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+UHJldmlldyBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3A+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                    {template.preview.images.length > 1 && (
                      <div className="flex gap-2">
                        {template.preview.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-16 h-12 rounded border-2 overflow-hidden ${
                              currentImageIndex === index ? 'border-primary' : 'border-border'
                            }`}
                          >
                            <img
                              src={template.preview.images![index]}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stats and Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{template.downloads}</div>
                      <div className="text-sm text-muted-foreground">Downloads</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{template.rating}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{template.agent.version}</div>
                      <div className="text-sm text-muted-foreground">Version</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{template.agent.capabilities.length}</div>
                      <div className="text-sm text-muted-foreground">Capabilities</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Configuration Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Agent Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{template.agent.configuration.triggers.length}</div>
                        <div className="text-sm text-muted-foreground">Triggers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{template.agent.configuration.actions.length}</div>
                        <div className="text-sm text-muted-foreground">Actions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{template.agent.configuration.integrations.length}</div>
                        <div className="text-sm text-muted-foreground">Integrations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'demo' && (
              <div className="p-6">
                {template.preview.demoUrl ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Live Demo</h3>
                    <div className="aspect-video rounded-lg overflow-hidden border">
                      <iframe
                        src={template.preview.demoUrl}
                        className="w-full h-full"
                        title={`${template.name} Demo`}
                      />
                    </div>
                  </div>
                ) : template.preview.video ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Video Demo</h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      {/* Video player would go here */}
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Play className="w-12 h-12 mx-auto mb-2" />
                          <p>Video demo available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No demo available</h3>
                    <p className="text-muted-foreground">This template doesn't have a demo yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documentation' && (
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {template.documentation}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="p-6 space-y-4">
                {mockReviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {review.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.author}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-sm mt-1">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                by {template.author} • Updated {new Date(template.agent.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onUse}>
                  {template.price === 0 ? (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Use Template
                    </>
                  ) : (
                    <>
                      Buy for ${template.price}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplatePreview;
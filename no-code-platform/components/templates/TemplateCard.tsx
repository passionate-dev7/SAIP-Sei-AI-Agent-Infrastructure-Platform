import React from 'react';
import { motion } from 'framer-motion';
import { Star, Download, Eye, Heart, ShoppingCart, Crown, Zap } from 'lucide-react';
import { Template } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TemplateCardProps {
  template: Template;
  onPreview: () => void;
  onUse: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview, onUse }) => {
  const isPremium = template.price > 0;
  const isFree = template.price === 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
              {template.rating >= 4.8 && <Zap className="w-4 h-4 text-blue-500" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
          {template.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Template Preview Image */}
        <div className="relative rounded-lg overflow-hidden bg-muted/30 mb-4 h-32">
          {template.preview.images && template.preview.images.length > 0 ? (
            <img
              src={template.preview.images[0]}
              alt={template.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient background
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-muted-foreground text-sm">Preview</div>
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            {isFree && (
              <Badge className="text-xs bg-green-500 text-white">
                Free
              </Badge>
            )}
            {template.rating >= 4.8 && (
              <Badge className="text-xs bg-blue-500 text-white">
                Popular
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{template.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{template.downloads.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium text-foreground">
              {isFree ? 'Free' : `$${template.price}`}
            </div>
            <div className="text-xs">by {template.author}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button
            onClick={onUse}
            size="sm"
            className="flex-1"
          >
            {isPremium ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy
              </>
            ) : (
              <>
                <Download className="w-3 h-3 mr-1" />
                Use
              </>
            )}
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex justify-center mt-2">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Heart className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
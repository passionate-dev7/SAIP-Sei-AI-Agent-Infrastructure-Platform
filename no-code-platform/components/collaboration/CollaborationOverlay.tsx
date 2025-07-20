import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface CollaborationOverlayProps {
  workflowId: string;
  onClose: () => void;
}

const CollaborationOverlay: React.FC<CollaborationOverlayProps> = ({ workflowId, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <Card className="w-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Collaboration
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Collaboration features coming soon! Share workflows, leave comments, and work together with your team.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CollaborationOverlay;
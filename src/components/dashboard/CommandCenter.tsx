import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';

const CommandCenter = () => {
  return (
    <div className="bg-card border rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Command Center</h2>
          <p className="text-muted-foreground mt-1">Real-time insights and campaign management</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter; 
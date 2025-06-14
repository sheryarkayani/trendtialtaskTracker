
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

const CampaignPipelineWidget = () => {
  const { tasks, updateTaskStatus } = useTasks();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const stages = [
    { id: 'todo', title: 'Content Brief', color: 'bg-gray-100 border-gray-300' },
    { id: 'in-progress', title: 'Creating', color: 'bg-blue-50 border-blue-300' },
    { id: 'review', title: 'Review', color: 'bg-yellow-50 border-yellow-300' },
    { id: 'completed', title: 'Published', color: 'bg-green-50 border-green-300' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    if (draggedTask) {
      try {
        await updateTaskStatus(draggedTask, targetStatus as any);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
    
    setDraggedTask(null);
  };

  const getTotalTasks = () => tasks.length;
  const getBottlenecks = () => {
    const reviewTasks = getTasksByStatus('review').length;
    const inProgressTasks = getTasksByStatus('in-progress').length;
    
    if (reviewTasks > inProgressTasks * 0.8) return 'Review stage has high volume';
    if (inProgressTasks > getTotalTasks() * 0.6) return 'Creation stage bottleneck detected';
    return 'Pipeline flowing smoothly';
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>Campaign Pipeline</span>
          </CardTitle>
          <Button size="sm" variant="outline" className="text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Add Campaign
          </Button>
        </div>
        <p className="text-xs text-gray-500">{getBottlenecks()}</p>
      </CardHeader>

      <CardContent>
        {/* Pipeline Visualization */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {stages.map((stage, index) => {
            const stageTasks = getTasksByStatus(stage.id);
            const isBottleneck = stageTasks.length > getTotalTasks() * 0.4;

            return (
              <div
                key={stage.id}
                className={cn(
                  "p-3 rounded-lg border-2 border-dashed transition-all duration-200 min-h-[120px]",
                  stage.color,
                  draggedTask && "border-solid",
                  isBottleneck && "ring-2 ring-yellow-400 ring-opacity-50"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-xs text-gray-700">{stage.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {stageTasks.length}
                  </Badge>
                </div>

                <div className="space-y-1">
                  {stageTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={cn(
                        "p-2 bg-white rounded border text-xs cursor-move hover:shadow-sm transition-all",
                        draggedTask === task.id && "opacity-50 scale-95"
                      )}
                    >
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-gray-500 truncate">{task.platform || 'General'}</p>
                    </div>
                  ))}
                  
                  {stageTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{stageTasks.length - 3} more
                    </div>
                  )}
                </div>

                {index < stages.length - 1 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-2 h-2 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pipeline Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{getTotalTasks()}</p>
            <p className="text-xs text-gray-500">Total Campaigns</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{getTasksByStatus('in-progress').length}</p>
            <p className="text-xs text-gray-500">In Production</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{getTasksByStatus('completed').length}</p>
            <p className="text-xs text-gray-500">Published</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignPipelineWidget;

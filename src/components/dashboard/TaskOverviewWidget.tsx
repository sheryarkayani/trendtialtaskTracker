
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Clock, User, ArrowRight, Play, Pause } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const TaskOverviewWidget = () => {
  const { tasks, updateTaskStatus, updateTask } = useTasks();
  const { user } = useAuth();
  const [updatingTasks, setUpdatingTasks] = useState<string[]>([]);

  // Filter user's tasks
  const myTasks = tasks
    .filter(task => task.assignee_id === user?.id)
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  const handleStatusUpdate = async (taskId: string, newStatus: any) => {
    setUpdatingTasks(prev => [...prev, taskId]);
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const toggleTimer = async (taskId: string, isRunning: boolean) => {
    setUpdatingTasks(prev => [...prev, taskId]);
    try {
      await updateTask(taskId, {
        is_timer_running: !isRunning,
        timer_started_at: !isRunning ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error toggling timer:', error);
    } finally {
      setUpdatingTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'review':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getProgress = (task: any) => {
    if (task.subtasks_total === 0) return 0;
    return Math.round((task.subtasks_completed / task.subtasks_total) * 100);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>My Tasks</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {myTasks.length} of {tasks.filter(t => t.assignee_id === user?.id).length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {myTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No tasks assigned</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <>
            {myTasks.map((task) => {
              const isUpdating = updatingTasks.includes(task.id);
              const progress = getProgress(task);
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 rounded-lg border bg-white hover:shadow-sm transition-all duration-200",
                    isOverdue && task.status !== 'completed' && "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                        {task.title}
                      </h4>
                      {task.due_date && (
                        <p className={cn(
                          "text-xs",
                          isOverdue && task.status !== 'completed' 
                            ? "text-red-600 font-medium" 
                            : "text-gray-500"
                        )}>
                          {formatDueDate(task.due_date)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  {task.subtasks_total > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{task.subtasks_completed}/{task.subtasks_total}</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                        disabled={isUpdating}
                        className={cn(
                          "text-xs px-2 py-1 rounded border text-center cursor-pointer",
                          getStatusColor(task.status),
                          isUpdating && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTimer(task.id, task.is_timer_running)}
                        disabled={isUpdating}
                        className="h-6 w-6 p-0"
                      >
                        {task.is_timer_running ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/tasks'}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => window.location.href = '/tasks'}
            >
              View All My Tasks
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskOverviewWidget;

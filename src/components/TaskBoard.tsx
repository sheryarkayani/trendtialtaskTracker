
import React, { useState } from 'react';
import { Plus, Filter, MoreHorizontal, Calendar, User, Clock, MessageCircle, Paperclip, Edit, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskDialog from './CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TaskBoard = () => {
  const { tasks, loading, refetch, updateTaskStatus } = useTasks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const columns = [
    {
      id: 'todo', 
      title: 'Content Brief',
      color: 'bg-gray-100',
      description: 'New campaigns & content ideas'
    },
    {
      id: 'in-progress',
      title: 'Creating', 
      color: 'bg-blue-100',
      description: 'Content in production'
    },
    {
      id: 'review',
      title: 'Client Review',
      color: 'bg-yellow-100',
      description: 'Pending client approval'
    },
    {
      id: 'completed',
      title: 'Published',
      color: 'bg-green-100',
      description: 'Live content'
    }
  ];

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter(task => task.status === columnId);
  };

  const handleTaskUpdate = async () => {
    await refetch();
  };

  const handleTaskCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Enhanced Board Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Pipeline</h2>
            <p className="text-gray-500">Track your social media content from brief to publication</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Active: {getTasksForColumn('in-progress').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">In Review: {getTasksForColumn('review').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Published: {getTasksForColumn('completed').length}</span>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.id);
            return (
              <div key={column.id} className="bg-gray-50 rounded-xl p-4">
                {/* Enhanced Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                      <p className="text-xs text-gray-500">{column.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  {columnTasks.map((task) => (
                    <EnhancedTaskCard 
                      key={task.id} 
                      task={task} 
                      onUpdate={handleTaskUpdate}
                      updateTaskStatus={updateTaskStatus}
                    />
                  ))}
                  
                  {/* Add Task Button */}
                  <button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {column.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateTaskDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
};

// Enhanced TaskCard component that can handle status updates
const EnhancedTaskCard = ({ task, onUpdate, updateTaskStatus }) => {
  const [isLoading, setIsLoading] = useState(false);

  const priorityColors = {
    high: 'bg-red-100 text-red-600 border-red-200',
    medium: 'bg-yellow-100 text-yellow-600 border-yellow-200', 
    low: 'bg-green-100 text-green-600 border-green-200'
  };

  const platformColors = {
    instagram: 'bg-pink-500',
    facebook: 'bg-blue-600',
    tiktok: 'bg-black',
    linkedin: 'bg-blue-700',
    twitter: 'bg-sky-500'
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      console.log('Moving task to status:', newStatus);
      await updateTaskStatus(task.id, newStatus);
      await onUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (task.assignee?.first_name || task.assignee?.last_name) {
      return `${task.assignee.first_name || ''} ${task.assignee.last_name || ''}`.trim();
    }
    return 'Unassigned';
  };

  const formatDueDate = () => {
    if (!task.due_date) return 'No due date';
    return format(new Date(task.due_date), 'MMM dd');
  };
  
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group",
      isLoading && "opacity-50"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {task.platform && (
            <div className={cn("w-3 h-3 rounded-full", platformColors[task.platform])} />
          )}
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {task.platform || 'General'}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
              Move to Content Brief
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
              Move to Creating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('review')}>
              Move to Client Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              Move to Published
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Campaign
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Priority Badge */}
      <div className="mb-4">
        <span className={cn(
          "inline-flex px-3 py-1 rounded-full text-xs font-medium border",
          priorityColors[task.priority || 'medium']
        )}>
          {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-600">{getDisplayName()}</span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center space-x-3 text-gray-400">
          {(task.comments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{task.comments_count}</span>
            </div>
          )}
          {(task.attachments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{task.attachments_count}</span>
            </div>
          )}
          <div className={cn(
            "flex items-center space-x-1",
            isOverdue && "text-red-500"
          )}>
            <Clock className="w-4 h-4" />
            <span className="text-xs">{formatDueDate()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;

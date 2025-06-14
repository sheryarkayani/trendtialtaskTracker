
import React, { useState } from 'react';
import { Plus, Filter, MoreHorizontal, Move, CheckSquare } from 'lucide-react';
import EnhancedTaskCard from './EnhancedTaskCard';
import TaskDetailModal from './TaskDetailModal';
import CreateTaskDialog from './CreateTaskDialog';
import EnhancedTaskFilters from './EnhancedTaskFilters';
import BulkTaskActions from './BulkTaskActions';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { useClients } from '@/hooks/useClients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';

const TaskBoard = () => {
  const { tasks, loading, refetch, updateTaskStatus, updateTask, deleteTask } = useTasks();
  const { teamMembers } = useTeam();
  const { clients } = useClients();
  
  // UI State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Column Configuration
  const columns = [
    {
      id: 'todo', 
      title: 'Content Brief',
      color: 'bg-gray-100',
      borderColor: 'border-gray-300',
      description: 'New campaigns & content ideas',
      collapsed: false
    },
    {
      id: 'in-progress',
      title: 'Creating', 
      color: 'bg-blue-50',
      borderColor: 'border-blue-300',
      description: 'Content in production',
      collapsed: false
    },
    {
      id: 'review',
      title: 'Client Review',
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      description: 'Pending client approval',
      collapsed: false
    },
    {
      id: 'completed',
      title: 'Published',
      color: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'Live content',
      collapsed: false
    }
  ];

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesPlatform = platformFilter === 'all' || task.platform === platformFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee_id === assigneeFilter;
    const matchesClient = clientFilter === 'all' || task.client_id === clientFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesPlatform && matchesAssignee && matchesClient;
  });

  const getTasksForColumn = (columnId: string) => {
    return filteredTasks.filter(task => task.status === columnId);
  };

  const handleTaskUpdate = async () => {
    await refetch();
  };

  const handleTaskCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setPlatformFilter('all');
    setAssigneeFilter('all');
    setClientFilter('all');
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { taskId, currentStatus } = data;
      
      if (currentStatus !== targetStatus) {
        console.log('Dropping task:', taskId, 'to status:', targetStatus);
        await updateTaskStatus(taskId, targetStatus as any);
        await handleTaskUpdate();
      }
    } catch (error) {
      console.error('Error dropping task:', error);
    }
    
    setDraggedTask(null);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // Task Selection
  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  const handleSelectAll = (columnId: string) => {
    const columnTaskIds = getTasksForColumn(columnId).map(task => task.id);
    const allSelected = columnTaskIds.every(id => selectedTasks.includes(id));
    
    if (allSelected) {
      setSelectedTasks(prev => prev.filter(id => !columnTaskIds.includes(id)));
    } else {
      setSelectedTasks(prev => [...new Set([...prev, ...columnTaskIds])]);
    }
  };

  const handleClearSelection = () => {
    setSelectedTasks([]);
  };

  // Task Detail Modal
  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
    setIsDetailModalOpen(false);
  };

  // Bulk Operations
  const handleBulkAssign = async (assigneeId: string) => {
    for (const taskId of selectedTasks) {
      await updateTask(taskId, { assignee_id: assigneeId === 'unassign' ? null : assigneeId });
    }
    setSelectedTasks([]);
    await handleTaskUpdate();
  };

  const handleBulkStatusChange = async (status: string) => {
    for (const taskId of selectedTasks) {
      await updateTaskStatus(taskId, status as Task['status']);
    }
    setSelectedTasks([]);
    await handleTaskUpdate();
  };

  const handleBulkPriorityChange = async (priority: string) => {
    for (const taskId of selectedTasks) {
      await updateTask(taskId, { priority: priority as Task['priority'] });
    }
    setSelectedTasks([]);
    await handleTaskUpdate();
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      for (const taskId of selectedTasks) {
        await deleteTask(taskId);
      }
      setSelectedTasks([]);
      await handleTaskUpdate();
    }
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
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <EnhancedTaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        teamMembers={teamMembers}
        clients={clients}
        onClearFilters={handleClearFilters}
        filteredCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      {/* Enhanced Board */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Enhanced Board Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Pipeline</h2>
              <p className="text-gray-500">Track your social media content from brief to publication</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </Button>
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
            {selectedTasks.length > 0 && (
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-3 h-3 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">{selectedTasks.length} selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board Columns */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => {
              const columnTasks = getTasksForColumn(column.id);
              const selectedInColumn = columnTasks.filter(task => selectedTasks.includes(task.id)).length;
              const allSelectedInColumn = columnTasks.length > 0 && selectedInColumn === columnTasks.length;
              
              return (
                <div 
                  key={column.id} 
                  className={cn(
                    "rounded-xl p-4 min-h-[500px] transition-all duration-200",
                    column.color,
                    draggedTask && "border-2 border-dashed",
                    draggedTask ? column.borderColor : "border-transparent"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Enhanced Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-50', '-500').replace('-100', '-500')}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{column.title}</h3>
                        <p className="text-xs text-gray-500">{column.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                      {columnTasks.length > 0 && (
                        <button
                          onClick={() => handleSelectAll(column.id)}
                          className={cn(
                            "w-4 h-4 border-2 rounded flex items-center justify-center",
                            allSelectedInColumn 
                              ? "bg-blue-500 border-blue-500" 
                              : selectedInColumn > 0
                              ? "bg-blue-200 border-blue-500"
                              : "border-gray-300 hover:border-blue-400"
                          )}
                        >
                          {allSelectedInColumn && <CheckSquare className="w-3 h-3 text-white" />}
                          {selectedInColumn > 0 && !allSelectedInColumn && (
                            <div className="w-2 h-2 bg-blue-500 rounded" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-4">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <EnhancedTaskCard 
                          task={task} 
                          onUpdate={handleTaskUpdate}
                          updateTaskStatus={updateTaskStatus}
                          isDragging={draggedTask === task.id}
                          isSelected={selectedTasks.includes(task.id)}
                          onSelect={(selected) => handleTaskSelect(task.id, selected)}
                          onOpenDetail={() => handleOpenTaskDetail(task)}
                        />
                      </div>
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
      </div>

      {/* Bulk Actions Bar */}
      <BulkTaskActions
        selectedTasks={selectedTasks}
        onClearSelection={handleClearSelection}
        onBulkAssign={handleBulkAssign}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkPriorityChange={handleBulkPriorityChange}
        onBulkDelete={handleBulkDelete}
        teamMembers={teamMembers}
        isVisible={selectedTasks.length > 0}
      />

      {/* Dialogs */}
      <CreateTaskDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleTaskCreated}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={handleCloseTaskDetail}
        onUpdate={updateTask}
        onDelete={deleteTask}
        teamMembers={teamMembers}
        clients={clients}
      />
    </div>
  );
};

export default TaskBoard;

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
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import TaskCard from './TaskCard';
import { TeamMember } from '@/hooks/useTeam';

interface TaskBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskUpdate: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, teamMembers, onTaskUpdate }) => {
  const { loading, refetch, updateTaskStatus, updateTask, deleteTask } = useTasks();
  const { clients } = useClients();
  
  // UI State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
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

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    await handleTaskUpdate();
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  // Task Updates
  const handleTaskUpdate = async () => {
    await onTaskUpdate();
  };

  const handleTaskDetailUpdate = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    await handleTaskUpdate();
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

  const handleFiltersChange = (filters: any) => {
    setSearchTerm(filters.search || '');
    setStatusFilter(filters.status || 'all');
    setPriorityFilter(filters.priority || 'all');
    setPlatformFilter(filters.platform || 'all');
    setAssigneeFilter(filters.assignee || 'all');
    setClientFilter(filters.client || 'all');
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
  const handleTaskSelect = (selected: boolean, taskId?: string) => {
    if (!taskId) return;
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

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    try {
      await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', draggableId);
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <BulkTaskActions
          selectedTasks={selectedTasks}
          onClearSelection={() => setSelectedTasks([])}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkPriorityChange={handleBulkPriorityChange}
          onBulkDelete={handleBulkDelete}
          teamMembers={teamMembers}
          isVisible={true}
        />
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-4 px-4 pb-4 min-w-[1000px]">
          <DragDropContext onDragEnd={handleDragEnd}>
            {columns.map(column => (
              <div
                key={column.id}
                className={cn(
                  "flex-1 min-w-[300px] rounded-lg overflow-hidden",
                  column.color,
                  !column.collapsed && "border",
                  column.borderColor
                )}
              >
                {/* Column Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{column.title}</h3>
                      <Badge variant="secondary">
                        {getTasksForColumn(column.id).length}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {column.description}
                    </p>
                  </div>
                </div>

                {/* Tasks Container */}
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="px-4 pb-4 space-y-4 min-h-[200px]"
                    >
                      {getTasksForColumn(column.id).map((task) => (
                        <EnhancedTaskCard
                          key={task.id}
                          task={task}
                          isSelected={selectedTasks.includes(task.id)}
                          onSelect={(selected) => handleTaskSelect(selected, task.id)}
                          onOpenDetail={() => handleOpenTaskDetail(task)}
                          isDragging={draggedTask === task.id}
                          onUpdate={handleTaskUpdate}
                          updateTaskStatus={updateTaskStatus}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>
        </div>
      </div>

      {/* Modals and Dialogs */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleTaskUpdate}
      />

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

      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          task={selectedTask}
          onUpdate={handleTaskDetailUpdate}
          onDelete={handleTaskDelete}
          teamMembers={teamMembers}
          clients={clients}
        />
      )}
    </div>
  );
};

export default TaskBoard;

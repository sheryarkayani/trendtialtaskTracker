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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
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
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Column Configuration with enhanced colors
  const columns = [
    {
      id: 'todo', 
      title: 'Content Brief',
      color: 'bg-gradient-to-br from-slate-50 to-gray-100',
      borderColor: 'border-slate-200',
      glowColor: 'shadow-slate-200/50',
      description: 'New campaigns & content ideas',
      collapsed: false
    },
    {
      id: 'in-progress',
      title: 'Creating', 
      color: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      borderColor: 'border-blue-200',
      glowColor: 'shadow-blue-200/50',
      description: 'Content in production',
      collapsed: false
    },
    {
      id: 'review',
      title: 'Client Review',
      color: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      borderColor: 'border-amber-200',
      glowColor: 'shadow-amber-200/50',
      description: 'Pending client approval',
      collapsed: false
    },
    {
      id: 'completed',
      title: 'Published',
      color: 'bg-gradient-to-br from-emerald-50 to-green-100',
      borderColor: 'border-emerald-200',
      glowColor: 'shadow-emerald-200/50',
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

  // Enhanced drag and drop with smooth animations
  const onDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(event.active.id as string);
    // Add subtle haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveId(null);
    
    const { active, over } = event;

    // If dropped outside a valid droppable area
    if (!over) {
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the task to get its current status
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // If dropped in the same column
    if (task.status === newStatus) {
      return;
    }

    try {
      console.log('Moving task:', taskId, 'from', task.status, 'to', newStatus);
      
      // Haptic feedback on successful drop
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      
      // Update task status in database
      await updateTaskStatus(taskId, newStatus as Task['status']);
      
      // Refresh the task list
      await handleTaskUpdate();
      
      console.log('Task moved successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      // Error feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  // SortableTaskCard component for drag and drop
  const SortableTaskCard: React.FC<{
    task: Task;
    teamMembers: TeamMember[];
    onTaskSelect: (selected: boolean, taskId?: string) => void;
    onOpenTaskDetail: (task: Task) => void;
    selectedTasks: string[];
  }> = ({ task, teamMembers, onTaskSelect, onOpenTaskDetail, selectedTasks }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "transition-all duration-300 ease-out cursor-grab active:cursor-grabbing",
          isDragging && [
            "rotate-3 scale-105 z-50",
            "shadow-2xl ring-2 ring-blue-400 ring-opacity-50",
            "bg-white/95 backdrop-blur-sm"
          ]
        )}
      >
        <TaskCard
          task={task}
          teamMembers={teamMembers}
          onTaskSelect={onTaskSelect}
          onTaskClick={onOpenTaskDetail}
          isSelected={selectedTasks.includes(task.id)}
        />
      </div>
    );
  };

  // Droppable Column component
  const DroppableColumn: React.FC<{
    column: any;
    tasks: Task[];
    teamMembers: TeamMember[];
    onTaskSelect: (selected: boolean, taskId?: string) => void;
    onOpenTaskDetail: (task: Task) => void;
    selectedTasks: string[];
    isDragging: boolean;
  }> = ({ column, tasks, teamMembers, onTaskSelect, onOpenTaskDetail, selectedTasks, isDragging }) => {
    const {
      setNodeRef,
      isOver,
    } = useDroppable({ id: column.id });

    return (
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-w-[300px] rounded-2xl overflow-hidden border-2 transition-all duration-500 ease-out transform",
          column.color,
          column.borderColor,
          isDragging ? "shadow-2xl scale-[1.02]" : "shadow-lg hover:shadow-xl",
          column.glowColor,
          isOver && [
            "bg-white/30 backdrop-blur-sm",
            "ring-2 ring-blue-400 ring-opacity-50",
            "transform scale-[1.02]"
          ]
        )}
        style={{
          background: isOver 
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            : undefined
        }}
      >
        {/* Column Header */}
        <div className="px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-white/20">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-gray-800">{column.title}</h3>
              <Badge 
                variant="secondary" 
                className="bg-white/80 text-gray-700 font-semibold px-3 py-1 rounded-full transition-all duration-300 hover:scale-110"
              >
                {tasks.length}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {column.description}
            </p>
          </div>
        </div>

        {/* Tasks Container */}
        <div className="px-4 pb-6 space-y-4 min-h-[300px] transition-all duration-300 ease-out">
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                onTaskSelect={onTaskSelect}
                onOpenTaskDetail={onOpenTaskDetail}
                selectedTasks={selectedTasks}
              />
            ))}
          </SortableContext>
          
          {/* Empty state with animation */}
          {tasks.length === 0 && (
            <div className={cn(
              "text-center py-12 transition-all duration-300",
              isOver && "py-16"
            )}>
              <div className="text-gray-400 text-sm">
                {isOver ? (
                  <div className="animate-bounce">
                    <div className="text-blue-500 font-medium">Drop here</div>
                    <div className="text-xs mt-1">Release to move task</div>
                  </div>
                ) : (
                  "No tasks yet"
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
        <div className="animate-in slide-in-from-top-2 duration-300">
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
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full md:w-auto group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
            New Campaign
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="w-full md:w-auto group border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
          >
            <Filter className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-300" />
            Filters
          </Button>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex-1 overflow-x-auto">
        <div className={cn(
          "flex h-full gap-6 px-4 pb-4 min-w-[1200px] transition-all duration-300",
          isDragging && "gap-8"
        )}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          >
            <SortableContext
              items={columns.map(column => column.id)}
              strategy={verticalListSortingStrategy}
            >
              {columns.map((column, columnIndex) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={getTasksForColumn(column.id)}
                  teamMembers={teamMembers}
                  onTaskSelect={handleTaskSelect}
                  onOpenTaskDetail={handleOpenTaskDetail}
                  selectedTasks={selectedTasks}
                  isDragging={isDragging}
                />
              ))}
            </SortableContext>
            
            <DragOverlay>
              {activeId ? (
                <div className="rotate-3 scale-105 shadow-2xl ring-2 ring-blue-400 ring-opacity-50 bg-white/95 backdrop-blur-sm rounded-xl">
                  <TaskCard
                    task={tasks.find(task => task.id === activeId)!}
                    teamMembers={teamMembers}
                    onTaskSelect={() => {}}
                    onTaskClick={() => {}}
                    isSelected={false}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
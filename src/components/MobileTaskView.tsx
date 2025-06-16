import React from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedTaskCard from './EnhancedTaskCard';
import { useTasks } from '@/hooks/useTasks';

interface MobileTaskViewProps {
  tasks: Task[];
  teamMembers: any[]; // Adjust the type as necessary
  currentStatus: string;
  onStatusChange: (status: string) => void;
  onCreateTask: () => void;
  onShowFilters: () => void;
  onTaskClick: (task: Task) => void;
}

const statuses = [
  { value: 'todo', label: 'Content Brief', description: 'New campaigns & content ideas' },
  { value: 'in-progress', label: 'Creating', description: 'Content in production' },
  { value: 'review', label: 'Client Review', description: 'Pending client approval' },
  { value: 'completed', label: 'Published', description: 'Live content' },
];

const MobileTaskView: React.FC<MobileTaskViewProps> = ({
  tasks,
  teamMembers,
  currentStatus,
  onStatusChange,
  onCreateTask,
  onShowFilters,
  onTaskClick,
}) => {
  const { updateTask, updateTaskStatus } = useTasks();
  const filteredTasks = tasks.filter(task => task.status === currentStatus);
  const currentStatusInfo = statuses.find(s => s.value === currentStatus);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Mobile Header */}
      <motion.div 
        className="px-4 py-4 bg-white border-b"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Campaigns</h1>
            <p className="text-sm text-muted-foreground">Manage your content</p>
          </div>
          <div className="flex gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowFilters}
                className="h-9"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={onCreateTask}
                className="h-9"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Status Selector */}
        <Select value={currentStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center justify-between">
              <SelectValue />
              <Badge variant="secondary">{filteredTasks.length}</Badge>
            </div>
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex flex-col">
                  <span>{status.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {status.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tasks List */}
      <ScrollArea className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="text-muted-foreground mb-4">
                No tasks in {currentStatusInfo?.label.toLowerCase()}
              </div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button onClick={onCreateTask} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4"
            >
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: index * 0.05,
                        duration: 0.2
                      }
                    }
                  }}
                  layoutId={task.id}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card 
                      className="touch-manipulation transition-all"
                      onClick={() => onTaskClick(task)}
                    >
                      <EnhancedTaskCard
                        task={task}
                        isDragging={false}
                        teamMembers={teamMembers}
                        onUpdate={updateTask}
                        updateTaskStatus={updateTaskStatus}
                      />
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default MobileTaskView;

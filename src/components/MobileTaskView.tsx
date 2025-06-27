import React, { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Filter, RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import EnhancedTaskCard from './EnhancedTaskCard';
import { useTasks } from '@/hooks/useTasks';

interface MobileTaskViewProps {
  tasks: Task[];
  teamMembers: any[];
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
  const { updateTask, updateTaskStatus, refetch, loading } = useTasks();
  const { toast } = useToast();
  
  // Enhanced state management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => task.status === currentStatus);
  const currentStatusInfo = statuses.find(s => s.value === currentStatus);

  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "🟢 Back Online",
        description: "Connection restored. Syncing data...",
        duration: 2000,
      });
      handleRefresh();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "🔴 Offline",
        description: "You're working offline. Changes will sync when reconnected.",
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced refresh with error handling
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      await refetch();
      setLastRefresh(new Date());
      
      if (!isOffline) {
        toast({
          title: "✅ Refreshed",
          description: "Tasks updated successfully",
          duration: 1500,
        });
      }
    } catch (err) {
      setError('Failed to refresh tasks. Please try again.');
      toast({
        title: "❌ Refresh Failed",
        description: "Unable to update tasks. Check your connection.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch, isOffline, toast]);

  // Pull-to-refresh implementation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
      // Store initial touch position
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPulling && window.scrollY === 0) {
      const touch = e.touches[0];
      const distance = Math.max(0, Math.min(touch.clientY - 60, 100));
      setPullDistance(distance);
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (isPulling) {
      setIsPulling(false);
      if (pullDistance > 60) {
        handleRefresh();
      }
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, handleRefresh]);

  return (
    <div 
      className="flex flex-col h-[calc(100vh-4rem)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-gradient-to-b from-blue-50 to-transparent"
          >
            <motion.div
              animate={{ rotate: pullDistance > 60 ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <RefreshCw className={`w-5 h-5 ${pullDistance > 60 ? 'text-blue-600' : 'text-gray-400'}`} />
            </motion.div>
            <span className="ml-2 text-sm text-gray-600">
              {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Mobile Header */}
      <motion.div 
        className="px-4 py-4 bg-white border-b relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Online/Offline indicator */}
        <div className="absolute top-2 right-4 flex items-center">
          {isOffline ? (
            <div className="flex items-center text-red-500">
              <WifiOff className="w-4 h-4 mr-1" />
              <span className="text-xs">Offline</span>
            </div>
          ) : (
            <div className="flex items-center text-green-500">
              <Wifi className="w-4 h-4 mr-1" />
              <span className="text-xs">Online</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Campaigns</h1>
            <p className="text-sm text-muted-foreground">
              Manage your content
              {lastRefresh && (
                <span className="ml-2 text-xs opacity-60">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowFilters}
                className="h-9"
                disabled={loading}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={handleRefresh}
                className="h-9 mr-2"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={onCreateTask}
                className="h-9"
                disabled={isOffline}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Status Selector */}
        <Select value={currentStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center justify-between">
              <SelectValue />
              <Badge variant="secondary" className="ml-2">
                {filteredTasks.length}
              </Badge>
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

      {/* Enhanced Tasks List */}
      <ScrollArea className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">
          {loading && !isRefreshing ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">Loading campaigns...</p>
            </motion.div>
          ) : filteredTasks.length === 0 ? (
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
                <Button 
                  onClick={onCreateTask} 
                  variant="outline" 
                  size="sm"
                  disabled={isOffline}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </motion.div>
              {isOffline && (
                <p className="text-xs text-orange-600 mt-2">
                  Create tasks when back online
                </p>
              )}
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
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <Card 
                      className="touch-manipulation transition-all relative"
                      onClick={() => onTaskClick(task)}
                    >
                      <EnhancedTaskCard
                        task={task}
                        isDragging={false}
                        teamMembers={teamMembers}
                        onUpdate={() => Promise.resolve()}
                        updateTaskStatus={updateTaskStatus}
                      />
                      {/* Offline indicator for individual tasks */}
                      {isOffline && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
                      )}
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

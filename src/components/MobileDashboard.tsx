import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  BarChart3,
  Calendar,
  Bell,
  RefreshCw,
  ChevronRight,
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { Task } from '@/types/task';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description?: string;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description, 
  trend 
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white rounded-lg p-4 shadow-sm border"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-center mt-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span className={`ml-2 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  badge?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick, 
  badge 
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer relative"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} mr-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex items-center">
        {badge && badge > 0 && (
          <Badge variant="destructive" className="mr-2">
            {badge}
          </Badge>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  </motion.div>
);

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const CompactTaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    review: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="bg-white rounded-lg p-3 shadow-sm border cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
          {task.title}
        </h4>
        <Badge className={`ml-2 text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
          {task.priority}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
            {task.status}
          </Badge>
          {task.due_date && (
            <span className={isToday(parseISO(task.due_date)) ? 'text-red-600 font-medium' : ''}>
              Due {format(parseISO(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MobileDashboard: React.FC = () => {
  const { tasks, loading, refetch } = useTasks();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [currentSection, setCurrentSection] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Calculate stats
  const myTasks = tasks.filter(task => task.assignee_id === user?.id);
  const overdueTasks = tasks.filter(task => 
    task.due_date && 
    parseISO(task.due_date) < new Date() && 
    task.status !== 'completed'
  );
  const todayTasks = tasks.filter(task => 
    task.due_date && isToday(parseISO(task.due_date))
  );
  const weekTasks = tasks.filter(task => 
    task.due_date && isThisWeek(parseISO(task.due_date))
  );
  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  );

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "🟢 Back Online",
        description: "Connection restored",
        duration: 2000,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "🔴 Offline",
        description: "Working offline",
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
      setLastRefresh(new Date());
      toast({
        title: "✅ Refreshed",
        description: "Dashboard updated",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "❌ Refresh Failed",
        description: "Check your connection",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch, toast]);

  const handleSwipe = useCallback((info: PanInfo) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && currentSection > 0) {
        setCurrentSection(currentSection - 1);
      } else if (info.offset.x < 0 && currentSection < 2) {
        setCurrentSection(currentSection + 1);
      }
    }
  }, [currentSection]);

  const sections = [
    {
      title: 'Overview',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="My Tasks"
              value={myTasks.length}
              icon={CheckCircle2}
              color="bg-blue-500"
              description="Assigned to me"
            />
            <StatsCard
              title="Overdue"
              value={overdueTasks.length}
              icon={AlertTriangle}
              color="bg-red-500"
              description="Need attention"
            />
            <StatsCard
              title="Due Today"
              value={todayTasks.length}
              icon={Clock}
              color="bg-orange-500"
              description="Today's deadline"
            />
            <StatsCard
              title="This Week"
              value={weekTasks.length}
              icon={Calendar}
              color="bg-green-500"
              description="Due this week"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Quick Actions',
      content: (
        <div className="space-y-3">
          <QuickAction
            title="Create Campaign"
            description="Start a new campaign"
            icon={Plus}
            color="bg-blue-500"
            onClick={() => {/* Navigate to create task */}}
          />
          <QuickAction
            title="High Priority Tasks"
            description="Review urgent items"
            icon={AlertTriangle}
            color="bg-red-500"
            onClick={() => {/* Navigate to high priority */}}
            badge={highPriorityTasks.length}
          />
          <QuickAction
            title="Team Overview"
            description="Check team progress"
            icon={Users}
            color="bg-green-500"
            onClick={() => {/* Navigate to team */}}
          />
          <QuickAction
            title="Analytics"
            description="View performance metrics"
            icon={BarChart3}
            color="bg-purple-500"
            onClick={() => {/* Navigate to analytics */}}
          />
        </div>
      )
    },
    {
      title: 'Recent Tasks',
      content: (
        <div className="space-y-3">
          {myTasks.slice(0, 5).map(task => (
            <CompactTaskCard
              key={task.id}
              task={task}
              onClick={() => {/* Navigate to task detail */}}
            />
          ))}
          {myTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tasks assigned</p>
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {profile?.first_name || 'User'}
            </h1>
            <p className="text-sm text-gray-600">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Online/Offline indicator */}
            <div className="flex items-center">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-500" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex space-x-1">
          {sections.map((section, index) => (
            <button
              key={section.title}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                currentSection === index
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="px-4 py-6"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => handleSwipe(info)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {sections[currentSection].content}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Section Indicators */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sections.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSection === index ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileDashboard; 
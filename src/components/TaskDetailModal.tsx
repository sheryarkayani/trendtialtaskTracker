import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TimeLog } from '@/types/task';
import { TeamMember } from '@/hooks/useTeam';
import { Client } from '@/types/client';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  X,
  Edit2,
  Save,
  Trash2,
  Play,
  Pause,
  Plus,
  Clock,
  MessageCircle,
  FileText,
  BarChart3,
  CheckSquare
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  teamMembers: TeamMember[];
  clients: Client[];
}

const priorityOptions = [
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const statusOptions = [
  { value: 'todo', label: 'Content Brief', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'in-progress', label: 'Creating', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'review', label: 'Client Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'completed', label: 'Published', color: 'bg-green-100 text-green-700 border-green-200' },
];

const platformOptions = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
];

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  teamMembers,
  clients
}) => {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setIsTimerRunning(task.is_timer_running || false);
      setTimeSpent(task.time_spent || 0);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    try {
      await onUpdate(task.id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const toggleTimer = async () => {
    if (!task) return;
    const now = new Date().toISOString();
    const updates: Partial<Task> = {
      is_timer_running: !isTimerRunning,
      timer_started_at: !isTimerRunning ? now : null,
      time_spent: timeSpent + (isTimerRunning ? Math.floor((Date.now() - new Date(task.timer_started_at || 0).getTime()) / 60000) : 0)
    };
    
    try {
      await onUpdate(task.id, updates);
      setIsTimerRunning(!isTimerRunning);
    } catch (error) {
      console.error('Failed to toggle timer:', error);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-3xl h-[90vh] flex flex-col p-0",
        "transition-all duration-300 ease-out",
        isMobile && [
          "w-full h-full max-h-none rounded-none",
          "data-[state=open]:animate-slide-up",
          "data-[state=closed]:animate-slide-down",
        ],
        !isMobile && [
          "data-[state=open]:animate-scale-up",
          "data-[state=closed]:animate-scale-down"
        ]
      )}>
        {/* Header */}
        <DialogHeader className={cn(
          "p-6 border-b sticky top-0 bg-white z-10",
          "transition-transform duration-200",
          isMobile && "active:scale-[0.99]"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              {isEditing ? (
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-semibold mb-2"
                />
              ) : (
                <DialogTitle className="text-xl font-semibold mb-2">{task.title}</DialogTitle>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{task.status}</Badge>
                <Badge>{task.platform}</Badge>
                <Badge variant="secondary">{task.priority} priority</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start px-6 border-b rounded-none">
              <TabsTrigger value="overview" className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Time
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Files
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview" className="m-0">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    {isEditing ? (
                      <Textarea
                        value={editedTask.description || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        placeholder="Add a description..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {task.description || 'No description provided'}
                      </p>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                      {isEditing ? (
                        <Select
                          value={editedTask.client_id || ''}
                          onValueChange={(value) => setEditedTask({ ...editedTask, client_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : task.client ? (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: task.client.brand_color || '#3B82F6' }}
                          />
                          <span>{task.client.name}</span>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No client assigned</p>
                      )}
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                      {isEditing ? (
                        <Select
                          value={editedTask.assignee_id || ''}
                          onValueChange={(value) => setEditedTask({ ...editedTask, assignee_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : task.assignee ? (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={task.assignee.avatar_url} />
                            <AvatarFallback>
                              {task.assignee.first_name?.charAt(0)}
                              {task.assignee.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {task.assignee.first_name} {task.assignee.last_name}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Unassigned</p>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      {isEditing ? (
                        <Input
                          type="datetime-local"
                          value={editedTask.due_date || ''}
                          onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-600">
                          {task.due_date ? format(new Date(task.due_date), 'PPP') : 'No due date'}
                        </p>
                      )}
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      {isEditing ? (
                        <Select
                          value={editedTask.platform || ''}
                          onValueChange={(value) => setEditedTask({ ...editedTask, platform: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{task.platform || 'No platform'}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="time" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Total Time Spent</p>
                        <p className="text-2xl font-mono">{Math.floor(timeSpent / 60)}h {timeSpent % 60}m</p>
                      </div>
                      <Button
                        variant={isTimerRunning ? "destructive" : "default"}
                        onClick={toggleTimer}
                        className="px-6"
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-center py-4">Coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-center py-4">Coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t p-4 sticky bottom-0 bg-white mt-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="min-w-[100px]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {isEditing && (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;

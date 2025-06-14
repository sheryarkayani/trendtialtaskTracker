
import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Trash2, Play, Pause, Plus, Upload, Download, Clock, MessageCircle, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TimeLog } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  teamMembers: any[];
  clients: any[];
}

const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  teamMembers,
  clients 
}: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [manualTimeEntry, setManualTimeEntry] = useState({ duration: '', description: '' });

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setIsTimerRunning(task.is_timer_running || false);
      setTimeSpent(task.time_spent || 0);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'bg-blue-100 text-blue-700' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-700' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'Content Brief' },
    { value: 'in-progress', label: 'Creating' },
    { value: 'review', label: 'Client Review' },
    { value: 'completed', label: 'Published' }
  ];

  const platformOptions = [
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' }
  ];

  const handleSave = async () => {
    try {
      await onUpdate(task.id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete(task.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    // Here you would implement the actual timer logic
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    // Here you would implement comment creation
    setNewComment('');
  };

  const addManualTime = () => {
    if (!manualTimeEntry.duration) return;
    // Here you would implement manual time entry
    setManualTimeEntry({ duration: '', description: '' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Slide-out Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-semibold border-none p-0 focus:ring-0"
                  placeholder="Task title..."
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              {isEditing ? (
                <Select 
                  value={editedTask.priority || 'medium'} 
                  onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityOptions.find(p => p.value === task.priority)?.color}>
                  {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {isEditing ? (
                <Select 
                  value={editedTask.status || 'todo'} 
                  onValueChange={(value) => setEditedTask({ ...editedTask, status: value as Task['status'] })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">
                  {statusOptions.find(s => s.value === task.status)?.label}
                </Badge>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center space-x-2 ml-auto">
              <Button
                size="sm"
                variant={isTimerRunning ? "destructive" : "default"}
                onClick={toggleTimer}
              >
                {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isTimerRunning ? 'Stop' : 'Start'}
              </Button>
              <span className="text-sm font-mono text-gray-600">
                {formatTime(timeSpent)}
              </span>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Files</span>
                </TabsTrigger>
                <TabsTrigger value="time" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Time</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    {isEditing ? (
                      <Textarea
                        value={editedTask.description || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        placeholder="Task description..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {task.description || 'No description provided'}
                      </p>
                    )}
                  </div>

                  {/* Client & Platform */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                      {task.client ? (
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      {isEditing ? (
                        <Select 
                          value={editedTask.platform || ''} 
                          onValueChange={(value) => setEditedTask({ ...editedTask, platform: value as Task['platform'] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {platformOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.icon} {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          {task.platform && (
                            <>
                              <span>{platformOptions.find(p => p.value === task.platform)?.icon}</span>
                              <span>{platformOptions.find(p => p.value === task.platform)?.label}</span>
                            </>
                          )}
                          {!task.platform && <span className="text-gray-500 italic">No platform selected</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned to</label>
                    {task.assignee ? (
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={task.assignee.avatar_url} />
                          <AvatarFallback>
                            {task.assignee.first_name?.charAt(0)}{task.assignee.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {task.assignee.first_name} {task.assignee.last_name}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No assignee</p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editedTask.due_date ? format(new Date(editedTask.due_date), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {task.due_date ? format(new Date(task.due_date), 'PPP p') : 'No due date set'}
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments" className="space-y-4 mt-0">
                  {/* New Comment */}
                  <div className="flex space-x-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No comments yet</p>
                    ) : (
                      comments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">User</span>
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(comment.created_at), 'PPp')}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files" className="space-y-4 mt-0">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>

                  {/* Files List */}
                  <div className="space-y-2">
                    <p className="text-gray-500 text-center py-8">No files attached</p>
                  </div>
                </TabsContent>

                {/* Time Tab */}
                <TabsContent value="time" className="space-y-6 mt-0">
                  {/* Timer Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>Time Tracking</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Total Time Spent</p>
                          <p className="text-2xl font-mono">{formatTime(timeSpent)}</p>
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

                  {/* Manual Time Entry */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Manual Time Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                          <Input
                            type="number"
                            value={manualTimeEntry.duration}
                            onChange={(e) => setManualTimeEntry({ ...manualTimeEntry, duration: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addManualTime} disabled={!manualTimeEntry.duration}>
                            Add Entry
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                        <Input
                          value={manualTimeEntry.description}
                          onChange={(e) => setManualTimeEntry({ ...manualTimeEntry, description: e.target.value })}
                          placeholder="What did you work on?"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Log History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Time Log History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {timeLogs.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No time entries yet</p>
                      ) : (
                        <div className="space-y-2">
                          {timeLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{formatTime(log.duration || 0)}</p>
                                {log.description && <p className="text-sm text-gray-600">{log.description}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {format(new Date(log.start_time), 'MMM dd, yyyy')}
                                </p>
                                {log.is_manual_entry && (
                                  <Badge variant="outline" className="text-xs">Manual</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
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
      </div>
    </div>
  );
};

export default TaskDetailModal;

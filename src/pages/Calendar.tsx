
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const Calendar = () => {
  const { tasks } = useTasks();
  const { teamMembers } = useTeam();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterPlatform, setFilterPlatform] = useState('all');

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), date);
    }).filter(task => {
      if (filterPlatform === 'all') return true;
      return task.platform === filterPlatform;
    });
  };

  // Get tasks for selected date
  const selectedDateTasks = getTasksForDate(selectedDate);

  // Get all days in current month with their tasks
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📸',
      facebook: '📘',
      tiktok: '🎵',
      linkedin: '💼',
      twitter: '🐦'
    };
    return icons[platform] || '📱';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Calendar
            </h1>
            <p className="text-gray-600">Schedule and track your social media tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="text-xs"
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="text-xs"
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="text-xs"
              >
                Day
              </Button>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mini Calendar & Filters */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border-0 p-0"
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <Badge variant="secondary">{tasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <Badge variant="secondary">
                    {tasks.filter(task => {
                      if (!task.due_date) return false;
                      const taskDate = parseISO(task.due_date);
                      return taskDate.getMonth() === currentMonth.getMonth() && 
                             taskDate.getFullYear() === currentMonth.getFullYear();
                    }).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <Badge variant="destructive">
                    {tasks.filter(task => {
                      if (!task.due_date || task.status === 'completed') return false;
                      return parseISO(task.due_date) < new Date();
                    }).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <Badge variant="default">
                    {tasks.filter(task => task.status === 'completed').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {viewMode === 'month' && format(currentMonth, 'MMMM yyyy')}
                    {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === 'month' && (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Week headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {monthDays.map((day) => {
                      const dayTasks = getTasksForDate(day);
                      const isSelected = isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            min-h-[80px] p-1 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                            ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                            ${isToday ? 'bg-yellow-50 border-yellow-200' : ''}
                          `}
                        >
                          <div className={`
                            text-sm font-medium mb-1
                            ${isToday ? 'text-yellow-700' : ''}
                            ${isSelected ? 'text-blue-700' : 'text-gray-700'}
                          `}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayTasks.slice(0, 2).map((task) => (
                              <div
                                key={task.id}
                                className={`
                                  text-xs px-1 py-0.5 rounded truncate
                                  ${getStatusColor(task.status)}
                                `}
                                title={task.title}
                              >
                                {getPlatformIcon(task.platform || '')} {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-gray-500 px-1">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'day' && (
                  <div className="space-y-4">
                    {selectedDateTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No tasks scheduled for this day</p>
                      </div>
                    ) : (
                      selectedDateTasks.map((task) => {
                        const assignee = teamMembers.find(member => member.id === task.assignee_id);
                        return (
                          <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                                <h3 className="font-medium text-gray-900">{task.title}</h3>
                                {task.platform && (
                                  <Badge variant="outline" className="text-xs">
                                    {getPlatformIcon(task.platform)} {task.platform}
                                  </Badge>
                                )}
                              </div>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {task.due_date && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{format(parseISO(task.due_date), 'h:mm a')}</span>
                                </div>
                              )}
                              {assignee && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{assignee.first_name} {assignee.last_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Details Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No tasks for this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task) => {
                      const assignee = teamMembers.find(member => member.id === task.assignee_id);
                      return (
                        <div key={task.id} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            <h4 className="font-medium text-sm text-gray-900 truncate">{task.title}</h4>
                          </div>
                          {task.platform && (
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-xs">{getPlatformIcon(task.platform)}</span>
                              <span className="text-xs text-gray-600 capitalize">{task.platform}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge size="sm" className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            {assignee && (
                              <span className="text-xs text-gray-500 truncate">
                                {assignee.first_name}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks
                    .filter(task => {
                      if (!task.due_date || task.status === 'completed') return false;
                      const taskDate = parseISO(task.due_date);
                      return taskDate > selectedDate;
                    })
                    .slice(0, 5)
                    .map((task) => (
                      <div key={task.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            {task.due_date && format(parseISO(task.due_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

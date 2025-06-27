import React, { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, MapPin, Play, Square, Coffee, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { format, isToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { 
    todayAttendance, 
    attendanceRecords, 
    attendanceStats, 
    loading, 
    checkIn, 
    checkOut, 
    startBreak, 
    endBreak 
  } = useAttendance();
  const { teamMembers } = useTeam();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('Checked in successfully!');
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success('Checked out successfully!');
    } catch (error) {
      toast.error('Failed to check out');
    }
  };

  const handleStartBreak = async () => {
    try {
      await startBreak();
      toast.success('Break started');
    } catch (error) {
      toast.error('Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreak();
      toast.success('Break ended');
    } catch (error) {
      toast.error('Failed to end break');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
      case 'on_break':
        return <Badge className="bg-yellow-100 text-yellow-800">On Break</Badge>;
      case 'checked_out':
        return <Badge className="bg-gray-100 text-gray-800">Checked Out</Badge>;
      default:
        return <Badge variant="outline">Not Checked In</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getFilteredRecords = () => {
    const now = new Date();
    const start = selectedPeriod === 'week' ? startOfWeek(now) : startOfMonth(now);
    const end = selectedPeriod === 'week' ? endOfWeek(now) : endOfMonth(now);
    
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    });
  };

  const filteredRecords = getFilteredRecords();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Track your work hours and manage attendance</p>
      </div>

      {/* Current Status and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Status
            </CardTitle>
            <CardDescription>
              {format(currentTime, 'EEEE, MMMM d, yyyy - HH:mm:ss')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                {getStatusBadge(todayAttendance?.status || 'not_checked_in')}
              </div>
              {todayAttendance?.check_in_time && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Checked in at</p>
                  <p className="font-medium">{format(new Date(todayAttendance.check_in_time), 'HH:mm')}</p>
                </div>
              )}
              {todayAttendance?.total_hours && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hours worked</p>
                  <p className="font-medium">{formatDuration(todayAttendance.total_hours)}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!todayAttendance || todayAttendance.status === 'checked_out' ? (
                <Button onClick={handleCheckIn} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Check In
                </Button>
              ) : (
                <>
                  {todayAttendance.status === 'checked_in' && (
                    <>
                      <Button onClick={handleStartBreak} variant="outline" className="flex items-center gap-2">
                        <Coffee className="w-4 h-4" />
                        Start Break
                      </Button>
                      <Button onClick={handleCheckOut} variant="destructive" className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Check Out
                      </Button>
                    </>
                  )}
                  {todayAttendance.status === 'on_break' && (
                    <>
                      <Button onClick={handleEndBreak} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        End Break
                      </Button>
                      <Button onClick={handleCheckOut} variant="destructive" className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Check Out
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{formatDuration(attendanceStats?.total_hours_this_week || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Worked</p>
                <p className="text-2xl font-bold">{attendanceStats?.days_worked_this_week || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Daily</p>
                <p className="text-2xl font-bold">{formatDuration(attendanceStats?.average_daily_hours || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="my-attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-attendance">My Attendance</TabsTrigger>
          {(user?.role === 'team_lead' || user?.role === 'superadmin') && (
            <TabsTrigger value="team-attendance">Team Attendance</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-attendance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Your attendance records and work hours</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('week')}
                  >
                    This Week
                  </Button>
                  <Button
                    variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('month')}
                  >
                    This Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Break Time</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No attendance records found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(record.date), 'MMM d, yyyy')}
                            {isToday(new Date(record.date)) && (
                              <Badge variant="outline" className="text-xs">Today</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>{formatDuration(record.break_duration || 0)}</TableCell>
                        <TableCell className="font-medium">
                          {formatDuration(record.total_hours || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {(user?.role === 'team_lead' || user?.role === 'superadmin') && (
          <TabsContent value="team-attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Attendance Overview
                </CardTitle>
                <CardDescription>Monitor team attendance and work hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check In Time</TableHead>
                      <TableHead>Hours Today</TableHead>
                      <TableHead>This Week</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => {
                      // In a real implementation, you'd fetch each member's attendance
                      // For now, we'll show placeholder data
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                {member.full_name?.charAt(0) || member.email.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{member.full_name || member.email}</p>
                                <p className="text-sm text-gray-500">{member.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge('checked_in')}</TableCell>
                          <TableCell>09:15</TableCell>
                          <TableCell>6h 45m</TableCell>
                          <TableCell>34h 20m</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              Office
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Attendance; 
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'] & {
  employee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export const useAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceRecords = async (employeeId?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching today attendance for:', user.id, 'on date:', today);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .eq('employee_id', user.id)
        .eq('date', today)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today attendance:', error);
        throw error;
      }
      
      setTodayAttendance(data || null);
    } catch (err: any) {
      console.error('Error in fetchTodayAttendance:', err);
      setError(err.message);
    }
  };

  const checkIn = async (location?: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      // Get user's IP address (simplified - in production you'd use a proper IP service)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const attendanceData = {
        employee_id: user?.id,
        organization_id: profile?.organization_id,
        date: today,
        check_in_time: now,
        status: 'present',
        location: location || 'Office',
        ip_address: ip,
      };

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(attendanceData, { onConflict: 'employee_id,date' })
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setTodayAttendance(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const checkOut = async () => {
    try {
      if (!todayAttendance) {
        throw new Error('No check-in record found for today');
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ check_out_time: now })
        .eq('id', todayAttendance.id)
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setTodayAttendance(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const startBreak = async () => {
    try {
      if (!todayAttendance) {
        throw new Error('No check-in record found for today');
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ break_start_time: now })
        .eq('id', todayAttendance.id)
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setTodayAttendance(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const endBreak = async () => {
    try {
      if (!todayAttendance) {
        throw new Error('No check-in record found for today');
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ break_end_time: now })
        .eq('id', todayAttendance.id)
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setTodayAttendance(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateAttendanceStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ status, notes })
        .eq('id', id)
        .select(`
          *,
          employee:profiles!attendance_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setAttendanceRecords(prev => prev.map(record => record.id === id ? data : record));
      if (todayAttendance?.id === id) {
        setTodayAttendance(data);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getAttendanceStats = (records: AttendanceRecord[]) => {
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const totalHours = records.reduce((sum, r) => sum + (r.total_hours || 0), 0);
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    };
  };

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      // For regular users, fetch their own records
      if (user.role === 'team_member') {
        fetchAttendanceRecords(user.id);
      } else {
        // For team leads and superadmins, fetch all records
        fetchAttendanceRecords();
      }
    }
  }, [user]);

  return {
    attendanceRecords,
    todayAttendance,
    loading,
    error,
    checkIn,
    checkOut,
    startBreak,
    endBreak,
    updateAttendanceStatus,
    getAttendanceStats,
    refreshAttendance: fetchAttendanceRecords,
    refreshTodayAttendance: fetchTodayAttendance,
  };
}; 
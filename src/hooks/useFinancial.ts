import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type SalaryRecord = Database['public']['Tables']['salary_records']['Row'] & {
  employee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

type SalarySettings = Database['public']['Tables']['salary_settings']['Row'] & {
  employee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export const useFinancial = () => {
  const { user } = useAuth();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [salarySettings, setSalarySettings] = useState<SalarySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaryRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salary_records')
        .select(`
          *,
          employee:profiles!salary_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalaryRecords(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalarySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_settings')
        .select(`
          *,
          employee:profiles!salary_settings_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalarySettings(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createSalaryRecord = async (recordData: {
    employee_id: string;
    base_salary: number;
    bonus?: number;
    deductions?: number;
    pay_period_start: string;
    pay_period_end: string;
    pay_date: string;
    notes?: string;
  }) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('salary_records')
        .insert({
          ...recordData,
          organization_id: profile?.organization_id,
          created_by: user?.id,
        })
        .select(`
          *,
          employee:profiles!salary_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setSalaryRecords(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateSalaryRecord = async (id: string, updates: Partial<SalaryRecord>) => {
    try {
      const { data, error } = await supabase
        .from('salary_records')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          employee:profiles!salary_records_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setSalaryRecords(prev => prev.map(record => record.id === id ? data : record));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createOrUpdateSalarySettings = async (settingsData: {
    employee_id: string;
    base_salary: number;
    pay_frequency: 'weekly' | 'biweekly' | 'monthly';
    currency?: string;
    effective_date: string;
  }) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      // First, deactivate existing settings
      await supabase
        .from('salary_settings')
        .update({ is_active: false })
        .eq('employee_id', settingsData.employee_id);

      const { data, error } = await supabase
        .from('salary_settings')
        .insert({
          ...settingsData,
          organization_id: profile?.organization_id,
          created_by: user?.id,
          is_active: true,
        })
        .select(`
          *,
          employee:profiles!salary_settings_employee_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      setSalarySettings(prev => prev.map(setting => 
        setting.employee_id === settingsData.employee_id 
          ? { ...setting, is_active: false }
          : setting
      ).concat(data));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSalaryRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSalaryRecords(prev => prev.filter(record => record.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchSalaryRecords();
      fetchSalarySettings();
    }
  }, [user]);

  return {
    salaryRecords,
    salarySettings,
    loading,
    error,
    createSalaryRecord,
    updateSalaryRecord,
    createOrUpdateSalarySettings,
    deleteSalaryRecord,
    refreshSalaryRecords: fetchSalaryRecords,
    refreshSalarySettings: fetchSalarySettings,
  };
}; 
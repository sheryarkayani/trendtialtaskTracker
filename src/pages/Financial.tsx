import React, { useState } from 'react';
import { useFinancial } from '@/hooks/useFinancial';
import { useTeam } from '@/hooks/useTeam';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Plus, Edit, Trash2, Calendar, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Financial: React.FC = () => {
  const { profile } = useProfile();
  const { 
    salaryRecords, 
    salarySettings, 
    loading, 
    createSalaryRecord, 
    updateSalaryRecord, 
    createOrUpdateSalarySettings, 
    deleteSalaryRecord 
  } = useFinancial();
  const { teamMembers } = useTeam();
  
  const [isCreateRecordOpen, setIsCreateRecordOpen] = useState(false);
  const [isCreateSettingsOpen, setIsCreateSettingsOpen] = useState(false);
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // Form states
  const [recordForm, setRecordForm] = useState({
    employee_id: '',
    base_salary: '',
    bonus: '',
    deductions: '',
    pay_period_start: '',
    pay_period_end: '',
    pay_date: '',
    notes: '',
    status: 'pending'
  });

  const [settingsForm, setSettingsForm] = useState({
    employee_id: '',
    base_salary: '',
    pay_frequency: 'monthly',
    currency: 'USD',
    effective_date: '',
  });

  // Redirect if not superadmin or team_lead
  if (profile?.role !== 'superadmin' && profile?.role !== 'team_lead') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the financial management system.
              Only team leads and super administrators can access this section.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSalaryRecord({
        employee_id: recordForm.employee_id,
        base_salary: parseFloat(recordForm.base_salary),
        bonus: recordForm.bonus ? parseFloat(recordForm.bonus) : 0,
        deductions: recordForm.deductions ? parseFloat(recordForm.deductions) : 0,
        pay_period_start: recordForm.pay_period_start,
        pay_period_end: recordForm.pay_period_end,
        pay_date: recordForm.pay_date,
        notes: recordForm.notes,
      });
      
      toast.success('Salary record created successfully');
      setIsCreateRecordOpen(false);
      setRecordForm({
        employee_id: '',
        base_salary: '',
        bonus: '',
        deductions: '',
        pay_period_start: '',
        pay_period_end: '',
        pay_date: '',
        notes: '',
        status: 'pending'
      });
    } catch (error) {
      toast.error('Failed to create salary record');
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    
    try {
      await updateSalaryRecord(editingRecord.id, {
        base_salary: parseFloat(recordForm.base_salary),
        bonus: recordForm.bonus ? parseFloat(recordForm.bonus) : 0,
        deductions: recordForm.deductions ? parseFloat(recordForm.deductions) : 0,
        pay_period_start: recordForm.pay_period_start,
        pay_period_end: recordForm.pay_period_end,
        pay_date: recordForm.pay_date,
        notes: recordForm.notes,
        status: recordForm.status,
      });
      
      toast.success('Salary record updated successfully');
      setIsEditRecordOpen(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error('Failed to update salary record');
    }
  };

  const handleCreateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrUpdateSalarySettings({
        employee_id: settingsForm.employee_id,
        base_salary: parseFloat(settingsForm.base_salary),
        pay_frequency: settingsForm.pay_frequency as 'weekly' | 'biweekly' | 'monthly',
        currency: settingsForm.currency,
        effective_date: settingsForm.effective_date,
      });
      
      toast.success('Salary settings updated successfully');
      setIsCreateSettingsOpen(false);
      setSettingsForm({
        employee_id: '',
        base_salary: '',
        pay_frequency: 'monthly',
        currency: 'USD',
        effective_date: '',
      });
    } catch (error) {
      toast.error('Failed to update salary settings');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm('Are you sure you want to delete this salary record?')) {
      try {
        await deleteSalaryRecord(id);
        toast.success('Salary record deleted successfully');
      } catch (error) {
        toast.error('Failed to delete salary record');
      }
    }
  };

  const openEditRecord = (record: any) => {
    setEditingRecord(record);
    setRecordForm({
      employee_id: record.employee_id,
      base_salary: record.base_salary.toString(),
      bonus: record.bonus?.toString() || '',
      deductions: record.deductions?.toString() || '',
      pay_period_start: record.pay_period_start,
      pay_period_end: record.pay_period_end,
      pay_date: record.pay_date,
      notes: record.notes || '',
      status: record.status,
    });
    setIsEditRecordOpen(true);
  };

  // Calculate statistics
  const totalPaidThisMonth = salaryRecords
    .filter(record => {
      const payDate = new Date(record.pay_date);
      const now = new Date();
      return payDate.getMonth() === now.getMonth() && 
             payDate.getFullYear() === now.getFullYear() &&
             record.status === 'paid';
    })
    .reduce((sum, record) => sum + record.net_salary, 0);

  const pendingPayments = salaryRecords.filter(record => record.status === 'pending').length;
  const activeEmployees = salarySettings.filter(setting => setting.is_active).length;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Management</h1>
        <p className="text-gray-600">Manage employee salaries, payroll, and financial records</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaidThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Require processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              With salary settings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeEmployees > 0 ? Math.round(salarySettings.reduce((sum, s) => sum + s.base_salary, 0) / activeEmployees).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records">Salary Records</TabsTrigger>
          <TabsTrigger value="settings">Employee Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Salary Records</CardTitle>
                  <CardDescription>
                    View and manage salary payments and records
                  </CardDescription>
                </div>
                <Dialog open={isCreateRecordOpen} onOpenChange={setIsCreateRecordOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Salary Record</DialogTitle>
                      <DialogDescription>
                        Create a new salary record for an employee
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRecord} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="employee">Employee</Label>
                          <Select value={recordForm.employee_id} onValueChange={(value) => setRecordForm(prev => ({ ...prev, employee_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.first_name} {member.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="base_salary">Base Salary</Label>
                          <Input
                            id="base_salary"
                            type="number"
                            step="0.01"
                            value={recordForm.base_salary}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, base_salary: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bonus">Bonus</Label>
                          <Input
                            id="bonus"
                            type="number"
                            step="0.01"
                            value={recordForm.bonus}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, bonus: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="deductions">Deductions</Label>
                          <Input
                            id="deductions"
                            type="number"
                            step="0.01"
                            value={recordForm.deductions}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, deductions: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="pay_period_start">Pay Period Start</Label>
                          <Input
                            id="pay_period_start"
                            type="date"
                            value={recordForm.pay_period_start}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, pay_period_start: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pay_period_end">Pay Period End</Label>
                          <Input
                            id="pay_period_end"
                            type="date"
                            value={recordForm.pay_period_end}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, pay_period_end: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pay_date">Pay Date</Label>
                          <Input
                            id="pay_date"
                            type="date"
                            value={recordForm.pay_date}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, pay_date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={recordForm.notes}
                          onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Optional notes about this salary record"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateRecordOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Record</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>${record.base_salary.toLocaleString()}</TableCell>
                      <TableCell>${record.bonus?.toLocaleString() || 0}</TableCell>
                      <TableCell>${record.deductions?.toLocaleString() || 0}</TableCell>
                      <TableCell className="font-semibold">${record.net_salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'paid' ? 'default' : 
                          record.status === 'processed' ? 'secondary' : 
                          'outline'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(record.pay_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Employee Salary Settings</CardTitle>
                  <CardDescription>
                    Configure salary settings for each employee
                  </CardDescription>
                </div>
                <Dialog open={isCreateSettingsOpen} onOpenChange={setIsCreateSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Employee Salary Settings</DialogTitle>
                      <DialogDescription>
                        Configure salary settings for an employee
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSettings} className="space-y-4">
                      <div>
                        <Label htmlFor="employee">Employee</Label>
                        <Select value={settingsForm.employee_id} onValueChange={(value) => setSettingsForm(prev => ({ ...prev, employee_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="base_salary">Base Salary</Label>
                          <Input
                            id="base_salary"
                            type="number"
                            step="0.01"
                            value={settingsForm.base_salary}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, base_salary: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pay_frequency">Pay Frequency</Label>
                          <Select value={settingsForm.pay_frequency} onValueChange={(value) => setSettingsForm(prev => ({ ...prev, pay_frequency: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={settingsForm.currency} onValueChange={(value) => setSettingsForm(prev => ({ ...prev, currency: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="effective_date">Effective Date</Label>
                          <Input
                            id="effective_date"
                            type="date"
                            value={settingsForm.effective_date}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, effective_date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateSettingsOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Save Settings</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Pay Frequency</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salarySettings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>
                        {setting.employee ? `${setting.employee.first_name} ${setting.employee.last_name}` : 'Unknown'}
                      </TableCell>
                      <TableCell>${setting.base_salary.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{setting.pay_frequency}</TableCell>
                      <TableCell>{setting.currency}</TableCell>
                      <TableCell>{format(new Date(setting.effective_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                          {setting.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Record Dialog */}
      <Dialog open={isEditRecordOpen} onOpenChange={setIsEditRecordOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Salary Record</DialogTitle>
            <DialogDescription>
              Update the salary record details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_salary">Base Salary</Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  value={recordForm.base_salary}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, base_salary: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={recordForm.status} onValueChange={(value) => setRecordForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  value={recordForm.bonus}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, bonus: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  id="deductions"
                  type="number"
                  step="0.01"
                  value={recordForm.deductions}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, deductions: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pay_period_start">Pay Period Start</Label>
                <Input
                  id="pay_period_start"
                  type="date"
                  value={recordForm.pay_period_start}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, pay_period_start: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pay_period_end">Pay Period End</Label>
                <Input
                  id="pay_period_end"
                  type="date"
                  value={recordForm.pay_period_end}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, pay_period_end: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pay_date">Pay Date</Label>
                <Input
                  id="pay_date"
                  type="date"
                  value={recordForm.pay_date}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, pay_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about this salary record"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditRecordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Record</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financial; 
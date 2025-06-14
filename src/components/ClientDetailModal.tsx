
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Mail, Phone, Building2, MapPin, DollarSign, Users, FileText, MessageSquare, Plus, Upload } from 'lucide-react';
import { Client, ClientCommunication, ClientFile } from '@/types/client';
import { Task } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ClientDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onUpdate: (clientId: string, updates: Partial<Client>) => void;
}

const ClientDetailModal = ({ open, onOpenChange, client, onUpdate }: ClientDetailModalProps) => {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    type: 'note' as const,
    subject: '',
    content: '',
    priority: 'normal' as const
  });

  useEffect(() => {
    if (client && open) {
      fetchCommunications();
      fetchFiles();
    }
  }, [client, open]);

  const fetchCommunications = async () => {
    if (!client) return;
    
    const { data, error } = await supabase
      .from('client_communications')
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching communications:', error);
    } else {
      setCommunications(data || []);
    }
  };

  const fetchFiles = async () => {
    if (!client) return;
    
    const { data, error } = await supabase
      .from('client_files')
      .select(`
        *,
        uploader:profiles(first_name, last_name)
      `)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data || []);
    }
  };

  const addCommunication = async () => {
    if (!client || !user || !newCommunication.content) return;

    setLoading(true);
    const { error } = await supabase
      .from('client_communications')
      .insert([{
        client_id: client.id,
        user_id: user.id,
        ...newCommunication
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add communication",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Communication logged successfully"
      });
      setNewCommunication({
        type: 'note',
        subject: '',
        content: '',
        priority: 'normal'
      });
      fetchCommunications();
    }
    setLoading(false);
  };

  if (!client) return null;

  const clientTasks = tasks.filter(task => task.client_id === client.id);
  const activeCampaigns = clientTasks.filter(task => task.status !== 'completed').length;
  const completedCampaigns = clientTasks.filter(task => task.status === 'completed').length;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-100';
      case 'issues': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={client.logo_url || ''} alt={client.name} />
              <AvatarFallback className="text-lg font-semibold">
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{client.name}</DialogTitle>
              {client.company && (
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {client.company}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
                <Badge className={getHealthColor(client.health_status)}>
                  {client.health_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{client.address}</span>
                    </div>
                  )}
                  {client.preferred_communication && (
                    <div className="text-sm">
                      <span className="text-gray-500">Preferred: </span>
                      <span className="capitalize">{client.preferred_communication}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.contract_start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Started: {new Date(client.contract_start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {client.contract_end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Ends: {new Date(client.contract_end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {client.monthly_retainer && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>${client.monthly_retainer}/month</span>
                    </div>
                  )}
                  {client.client_size && (
                    <div className="text-sm">
                      <span className="text-gray-500">Size: </span>
                      <span className="capitalize">{client.client_size}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {client.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{client.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeCampaigns}</div>
                  <div className="text-sm text-gray-600">Active Campaigns</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{completedCampaigns}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{clientTasks.length}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {clientTasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {clientTasks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No campaigns found for this client
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={newCommunication.type} onValueChange={(value: any) => 
                      setNewCommunication(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newCommunication.priority} onValueChange={(value: any) => 
                      setNewCommunication(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newCommunication.subject}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Communication subject"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newCommunication.content}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Communication details..."
                    rows={3}
                  />
                </div>
                <Button onClick={addCommunication} disabled={loading || !newCommunication.content}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Communication
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {communications.map(comm => (
                <Card key={comm.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {comm.type}
                          </Badge>
                          <Badge variant={comm.priority === 'high' ? 'destructive' : 'secondary'}>
                            {comm.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comm.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {comm.subject && (
                          <h4 className="font-medium mb-1">{comm.subject}</h4>
                        )}
                        <p className="text-gray-700">{comm.content}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        by {comm.user?.first_name} {comm.user?.last_name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {communications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No communications logged yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Drag and drop files here, or click to select</p>
                  <Button variant="outline" className="mt-2">
                    Select Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {files.map(file => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{file.file_name}</div>
                          <div className="text-sm text-gray-500">
                            {file.file_size && `${(file.file_size / 1024).toFixed(1)} KB`} • 
                            Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {files.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No files uploaded yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;

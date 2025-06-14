
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, ClientCommunication } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign,
  MessageSquare,
  FileText,
  Edit2,
  Save,
  X,
  Plus,
  User,
  Target
} from 'lucide-react';

interface ClientDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onUpdate: (clientId: string, updates: Partial<Client>) => Promise<void>;
}

const ClientDetailModal = ({ isOpen, onOpenChange, client, onUpdate }: ClientDetailModalProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<Client>>({});
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [newCommunication, setNewCommunication] = useState({
    type: 'note' as 'email' | 'phone' | 'meeting' | 'note',
    subject: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && client.id) {
      fetchCommunications();
    }
  }, [isOpen, client.id]);

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('client_communications')
        .select(`
          *,
          user:profiles(first_name, last_name)
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion to handle the database response
      const typedCommunications: ClientCommunication[] = (data || []).map(comm => ({
        id: comm.id,
        client_id: comm.client_id,
        user_id: comm.user_id,
        type: comm.type as 'email' | 'phone' | 'meeting' | 'note',
        subject: comm.subject,
        content: comm.content,
        priority: (comm.priority as 'low' | 'normal' | 'high') || 'normal',
        follow_up_date: comm.follow_up_date,
        created_at: comm.created_at,
        user: comm.user
      }));

      setCommunications(typedCommunications);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(client.id, editedClient);
      setIsEditing(false);
      setEditedClient({});
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommunication = async () => {
    if (!newCommunication.content.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('client_communications')
        .insert({
          client_id: client.id,
          user_id: user.id,
          type: newCommunication.type,
          subject: newCommunication.subject || null,
          content: newCommunication.content,
          priority: newCommunication.priority
        });

      if (error) throw error;

      setNewCommunication({
        type: 'note',
        subject: '',
        content: '',
        priority: 'normal'
      });
      
      await fetchCommunications();
    } catch (error) {
      console.error('Error adding communication:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-100';
      case 'issues': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white"
                style={{ backgroundColor: client.brand_color || '#3B82F6' }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    value={editedClient.name || client.name}
                    onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                    className="text-lg font-semibold"
                  />
                ) : (
                  <DialogTitle className="text-lg">{client.name}</DialogTitle>
                )}
                {client.company && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {client.company}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getHealthColor(client.health_status)}>
                {client.health_status}
              </Badge>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{client.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{client.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{client.address || 'No address provided'}</span>
                  </div>
                  {client.account_manager && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{client.account_manager.first_name} {client.account_manager.last_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contract Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Start: {formatDate(client.contract_start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>End: {formatDate(client.contract_end_date)}</span>
                  </div>
                  {client.monthly_retainer && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>${client.monthly_retainer}/month</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {client.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-600">{client.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Campaigns</h3>
              <Button size="sm">
                <Plus className="w-3 h-3 mr-1" />
                New Campaign
              </Button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns found for this client</p>
              <p className="text-sm">Create a new campaign to get started</p>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Add Communication</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <Select value={newCommunication.type} onValueChange={(value: 'email' | 'phone' | 'meeting' | 'note') => 
                    setNewCommunication({ ...newCommunication, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Subject (optional)"
                    value={newCommunication.subject}
                    onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                  />
                  
                  <Select value={newCommunication.priority} onValueChange={(value: 'low' | 'normal' | 'high') => 
                    setNewCommunication({ ...newCommunication, priority: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Communication details..."
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
                  className="mb-3"
                />
                
                <Button onClick={handleAddCommunication} disabled={!newCommunication.content.trim()}>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Add Communication
                </Button>
              </div>

              <div className="space-y-3">
                {communications.map((comm) => (
                  <div key={comm.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={comm.priority === 'high' ? 'destructive' : comm.priority === 'low' ? 'secondary' : 'default'}>
                          {comm.type}
                        </Badge>
                        {comm.subject && <span className="font-medium">{comm.subject}</span>}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{comm.content}</p>
                    <p className="text-xs text-gray-500">
                      By {comm.user?.first_name} {comm.user?.last_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Files</h3>
              <Button size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Upload File
              </Button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded for this client</p>
              <p className="text-sm">Upload files to share with your team</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;

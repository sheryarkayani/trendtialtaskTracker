import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Client, ClientCommunication } from '@/types/client';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Send,
  X
} from 'lucide-react';

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (clientId: string, updates: Partial<Client>) => void;
}

const ClientDetailModal = ({ client, isOpen, onClose, onUpdate }: ClientDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    type: 'note' as 'email' | 'phone' | 'meeting' | 'note',
    subject: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });

  useEffect(() => {
    if (client && isOpen) {
      fetchCommunications();
    }
  }, [client?.id, isOpen]);

  const fetchCommunications = async () => {
    if (!client) return;
    
    try {
      const { data, error } = await supabase
        .from('client_communications')
        .select(`
          *,
          user:profiles!client_communications_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe conversion
      const typedCommunications: ClientCommunication[] = (data || []).map(comm => ({
        ...comm,
        type: comm.type as 'email' | 'phone' | 'meeting' | 'note'
      }));
      
      setCommunications(typedCommunications);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const addCommunication = async () => {
    if (!client || !user || !newCommunication.content.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_communications')
        .insert([{
          client_id: client.id,
          user_id: user.id,
          type: newCommunication.type,
          subject: newCommunication.subject || null,
          content: newCommunication.content,
          priority: newCommunication.priority
        }]);

      if (error) throw error;

      await fetchCommunications();
      setNewCommunication({
        type: 'note',
        subject: '',
        content: '',
        priority: 'normal'
      });

      toast({
        title: "Communication logged",
        description: "Successfully added communication entry.",
      });
    } catch (error) {
      console.error('Error adding communication:', error);
      toast({
        title: "Error",
        description: "Failed to add communication entry.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!client) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-100';
      case 'issues': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCommunicationType = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'phone': return 'Phone Call';
      case 'meeting': return 'Meeting';
      case 'note': return 'Note';
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl font-semibold">
                  {client.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">{client.name}</DialogTitle>
                {client.company && (
                  <p className="text-gray-600">{client.company}</p>
                )}
                <Badge className={`mt-1 ${getHealthColor(client.health_status)}`}>
                  {client.health_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
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

          <TabsContent value="overview" className="space-y-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-3">
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contract Details</h3>
                <div className="space-y-3">
                  {client.contract_start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Start: {new Date(client.contract_start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {client.contract_end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>End: {new Date(client.contract_end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {client.monthly_retainer && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>Monthly: ${client.monthly_retainer}</span>
                    </div>
                  )}
                  {client.account_manager && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Manager: {client.account_manager.first_name} {client.account_manager.last_name}</span>
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

          <TabsContent value="campaigns" className="max-h-96 overflow-y-auto">
            <div className="text-center py-8 text-gray-500">
              <p>Campaign management coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Add Communication</h4>
              <div className="grid grid-cols-3 gap-4">
                <Select value={newCommunication.type} onValueChange={(value: 'email' | 'phone' | 'meeting' | 'note') => setNewCommunication(prev => ({ ...prev, type: value }))}>
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
                <Select value={newCommunication.priority} onValueChange={(value: 'low' | 'normal' | 'high') => setNewCommunication(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Subject (optional)"
                  value={newCommunication.subject}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <Textarea
                placeholder="Communication details..."
                value={newCommunication.content}
                onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
              />
              <Button onClick={addCommunication} disabled={isLoading || !newCommunication.content.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Communication History</h4>
              {communications.map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{formatCommunicationType(comm.type)}</Badge>
                      {comm.priority === 'high' && <Badge variant="destructive">High Priority</Badge>}
                      {comm.subject && <span className="font-medium">{comm.subject}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{comm.user?.first_name} {comm.user?.last_name}</span>
                      <Clock className="w-4 h-4" />
                      <span>{new Date(comm.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{comm.content}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="max-h-96 overflow-y-auto">
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>File management coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateClientDialog = ({ open, onOpenChange, onSuccess }: CreateClientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    description: '',
    brand_color: '#3B82F6'
  });
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create client directly in the clients table
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.name,
          email: formData.email || null,
          company: formData.company || null,
          description: formData.description || null,
          brand_color: formData.brand_color,
          organization_id: '00000000-0000-0000-0000-000000000001',
          status: 'active'
        });

      if (clientError) {
        throw clientError;
      }

      // If creating account is requested and email/password are provided
      if (createAccount && formData.email && formData.password) {
        try {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                first_name: formData.name.split(' ')[0] || formData.name,
                last_name: formData.name.split(' ').slice(1).join(' ') || '',
                role: 'client',
                organization_id: '00000000-0000-0000-0000-000000000001'
              },
              emailRedirectTo: undefined // Don't send email verification
            }
          });

          if (signUpError) {
            console.log('Client account creation failed:', signUpError);
            // Don't throw here as the client was still created successfully
          } else if (authData.user) {
            // Create profile for the client
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: formData.email,
                first_name: formData.name.split(' ')[0] || formData.name,
                last_name: formData.name.split(' ').slice(1).join(' ') || '',
                role: 'client',
                organization_id: '00000000-0000-0000-0000-000000000001'
              });

            if (profileError) {
              console.error('Error creating client profile:', profileError);
            }
          }
        } catch (accountError) {
          console.log('Client account creation failed:', accountError);
          // Don't throw here as the client was still created successfully
        }
      }

      toast({
        title: "Client created",
        description: `${formData.name} has been added successfully.${createAccount && formData.email && formData.password ? ' Account created - they can now log in.' : ''}`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        company: '',
        description: '',
        brand_color: '#3B82F6'
      });
      setCreateAccount(false);

      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="client@company.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="createAccount" 
              checked={createAccount}
              onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
            />
            <Label htmlFor="createAccount" className="text-sm">
              Create login account for this client
            </Label>
          </div>

          {createAccount && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required={createAccount}
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">They can log in immediately with email and password</p>
            </div>
          )}

          <div>
            <Label htmlFor="brand_color">Brand Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="brand_color"
                type="color"
                value={formData.brand_color}
                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={formData.brand_color}
                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description about the client"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;

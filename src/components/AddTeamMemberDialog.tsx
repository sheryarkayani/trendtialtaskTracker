
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddTeamMemberDialog = ({ open, onOpenChange, onSuccess }: AddTeamMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'team_member' as 'team_lead' | 'team_member' | 'client',
    bio: '',
    skills: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if a profile already exists for this email
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', formData.email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProfile) {
        toast({
          title: "User already exists",
          description: `A team member with email ${formData.email} already exists in the system.`,
          variant: "destructive",
        });
        return;
      }

      // Create a placeholder profile that will be linked when the user signs up
      // We'll use a temporary UUID that will be replaced when they authenticate
      const tempId = crypto.randomUUID();

      // First, send the invitation via Supabase Auth
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(formData.email, {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          bio: formData.bio || null,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
          organization_id: '00000000-0000-0000-0000-000000000001',
          temp_profile_id: tempId
        },
        redirectTo: `${window.location.origin}/auth`
      });

      if (inviteError) {
        console.log('Invitation error:', inviteError);
        // If we can't send via admin (likely due to permissions), try the regular invite
        const { error: regularInviteError } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            shouldCreateUser: true,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: formData.role,
              bio: formData.bio || null,
              skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
              organization_id: '00000000-0000-0000-0000-000000000001'
            }
          }
        });

        if (regularInviteError) {
          throw regularInviteError;
        }
      }

      toast({
        title: "Invitation sent",
        description: `${formData.firstName} has been invited to join the team! They will receive an email to set up their account.`,
      });

      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'team_member',
        bio: '',
        skills: ''
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite team member. Please try again.",
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
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• An invitation email will be sent to the team member</li>
            <li>• They'll receive a link to join your organization</li>
            <li>• Their profile will be created when they accept the invitation</li>
            <li>• You can update their details anytime from the team page</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
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
              required
            />
            <p className="text-sm text-gray-500 mt-1">They will receive an invitation email at this address</p>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief description about the team member..."
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills (Optional)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Comma-separated skills (e.g., React, Design, Marketing)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberDialog;

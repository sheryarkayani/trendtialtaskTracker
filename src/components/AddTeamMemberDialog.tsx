
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
    password: '',
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
      console.log('Starting team member creation process...');
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get current user's organization first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const organizationId = currentUserProfile?.organization_id || '00000000-0000-0000-0000-000000000001';
      console.log('Using organization ID:', organizationId);
      
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

      // Create the user account with Supabase Auth
      console.log('Creating user account...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            bio: formData.bio || null,
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
            organization_id: organizationId
          },
          emailRedirectTo: undefined // Don't send email verification
        }
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        throw signUpError;
      }

      console.log('User created successfully:', authData.user?.id);

      // Create profile immediately after user creation
      if (authData.user) {
        console.log('Creating profile for user:', authData.user.id);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            bio: formData.bio || null,
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
            organization_id: organizationId
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try to update if insert failed (user might exist)
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: formData.role,
              bio: formData.bio || null,
              skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
              organization_id: organizationId
            })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError);
            toast({
              title: "Warning",
              description: "User account created but profile setup had issues. The user may need to complete their profile.",
              variant: "destructive",
            });
          } else {
            console.log('Profile updated successfully');
          }
        } else {
          console.log('Profile created successfully');
        }

        // Wait a moment then verify the profile was created
        setTimeout(async () => {
          const { data: verifyProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          
          console.log('Profile verification:', verifyProfile);
        }, 1000);
      }

      toast({
        title: "Team member created successfully!",
        description: `${formData.firstName} has been added to the team. They can now log in with their email and password.`,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
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
        description: error.message || "Failed to create team member. Please try again.",
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
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Direct Account Creation:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• The team member account will be created immediately</li>
            <li>• They can log in right away with their email and password</li>
            <li>• No email verification required</li>
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
            <p className="text-sm text-gray-500 mt-1">This will be their login email</p>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
            <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
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
              {loading ? 'Creating Account...' : 'Create Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberDialog;

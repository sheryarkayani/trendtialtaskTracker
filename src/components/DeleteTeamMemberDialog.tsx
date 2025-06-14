
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from '@/hooks/useTeam';
import { AlertTriangle } from 'lucide-react';

interface DeleteTeamMemberDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteTeamMemberDialog = ({ member, open, onOpenChange, onSuccess }: DeleteTeamMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!member) return;
    
    setLoading(true);

    try {
      // First, reassign or delete their tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ assignee_id: null })
        .eq('assignee_id', member.id);

      if (tasksError) throw tasksError;

      // Delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', member.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Team member removed successfully!",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  const displayName = member.first_name && member.last_name 
    ? `${member.first_name} ${member.last_name}`
    : member.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Remove Team Member</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{displayName}</strong> from the team? 
            This action cannot be undone. Their tasks will be unassigned.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={loading}
            variant="destructive"
          >
            {loading ? 'Removing...' : 'Remove Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamMemberDialog;

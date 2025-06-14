
export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  logo_url: string | null;
  brand_color: string | null;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  phone: string | null;
  address: string | null;
  industry: string | null;
  client_size: 'small' | 'medium' | 'large' | 'enterprise' | null;
  preferred_communication: 'email' | 'phone' | 'slack' | 'teams' | null;
  time_zone: string | null;
  account_manager_id: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  monthly_retainer: number | null;
  last_contact_date: string | null;
  health_status: 'healthy' | 'needs_attention' | 'issues';
  account_manager?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface ClientTeamAssignment {
  id: string;
  client_id: string | null;
  team_member_id: string | null;
  role: 'account_manager' | 'creative_lead' | 'team_member';
  created_at: string;
  client?: Client;
  team_member?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ClientCommunication {
  id: string;
  client_id: string;
  user_id: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string | null;
  content: string;
  priority: 'low' | 'normal' | 'high';
  follow_up_date: string | null;
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ClientFile {
  id: string;
  client_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  uploader?: {
    first_name: string | null;
    last_name: string | null;
  };
}

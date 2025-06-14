
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

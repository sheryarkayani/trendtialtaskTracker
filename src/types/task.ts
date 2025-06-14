
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  platform: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter' | null;
  assignee_id: string | null;
  project_id: string | null;
  organization_id: string | null;
  client_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    first_name: string | null;
    last_name: string | null;
  };
  client?: {
    id: string;
    name: string;
    company: string | null;
    brand_color: string | null;
  };
  comments_count?: number;
  attachments_count?: number;
}

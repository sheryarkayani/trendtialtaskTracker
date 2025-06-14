
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#3B82F6',
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add client_id column to tasks table
ALTER TABLE public.tasks ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Create client_team_assignments table for assigning team members to specific clients
CREATE TABLE public.client_team_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'team_member' CHECK (role IN ('account_manager', 'creative_lead', 'team_member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, team_member_id)
);

-- Enable RLS on new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_team_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients table
CREATE POLICY "Users can view clients in their organization" 
  ON public.clients 
  FOR SELECT 
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Team leads can manage clients" 
  ON public.clients 
  FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) 
    AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'team_lead'
  );

-- RLS policies for client_team_assignments table
CREATE POLICY "Users can view client assignments in their organization" 
  ON public.client_team_assignments 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Team leads can manage client assignments" 
  ON public.client_team_assignments 
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
    AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'team_lead'
  );

-- Insert sample clients data
INSERT INTO public.clients (name, email, company, description, organization_id) VALUES
('TechCorp Solutions', 'contact@techcorp.com', 'TechCorp Inc.', 'Leading technology solutions provider', '00000000-0000-0000-0000-000000000001'),
('FashionForward', 'hello@fashionforward.com', 'Fashion Forward Ltd.', 'Trendy fashion and lifestyle brand', '00000000-0000-0000-0000-000000000001'),
('GreenEarth Co.', 'info@greenearth.com', 'GreenEarth Corporation', 'Sustainable products and eco-friendly solutions', '00000000-0000-0000-0000-000000000001');

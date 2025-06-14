
-- Add new fields to clients table for enhanced functionality
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS client_size TEXT CHECK (client_size IN ('small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS preferred_communication TEXT CHECK (preferred_communication IN ('email', 'phone', 'slack', 'teams')),
ADD COLUMN IF NOT EXISTS time_zone TEXT,
ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS monthly_retainer DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'issues'));

-- Create client_communications table for communication history
CREATE TABLE IF NOT EXISTS client_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'meeting', 'note')),
  subject TEXT,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_files table for file attachments
CREATE TABLE IF NOT EXISTS client_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_communications
CREATE POLICY "Users can view communications for clients in their org" ON client_communications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_communications.client_id 
      AND c.organization_id = get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can create communications for clients in their org" ON client_communications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_communications.client_id 
      AND c.organization_id = get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can update their own communications" ON client_communications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own communications" ON client_communications
  FOR DELETE USING (user_id = auth.uid());

-- RLS policies for client_files
CREATE POLICY "Users can view files for clients in their org" ON client_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_files.client_id 
      AND c.organization_id = get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can upload files for clients in their org" ON client_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_files.client_id 
      AND c.organization_id = get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can delete files they uploaded" ON client_files
  FOR DELETE USING (uploaded_by = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_user_id ON client_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_health_status ON clients(health_status);
CREATE INDEX IF NOT EXISTS idx_clients_contract_end_date ON clients(contract_end_date);

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE client_communications;
ALTER PUBLICATION supabase_realtime ADD TABLE client_files;

-- Function to update client health status based on various factors
CREATE OR REPLACE FUNCTION update_client_health_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple health status logic based on last contact and contract status
  IF NEW.last_contact_date IS NULL OR NEW.last_contact_date < NOW() - INTERVAL '30 days' THEN
    NEW.health_status = 'issues';
  ELSIF NEW.last_contact_date < NOW() - INTERVAL '14 days' OR 
        (NEW.contract_end_date IS NOT NULL AND NEW.contract_end_date < NOW() + INTERVAL '30 days') THEN
    NEW.health_status = 'needs_attention';
  ELSE
    NEW.health_status = 'healthy';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update health status
CREATE TRIGGER trigger_update_client_health_status
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_client_health_status();

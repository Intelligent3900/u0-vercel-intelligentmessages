-- Enable Row Level Security on communities table
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow API key-based access to communities
CREATE POLICY "Allow API key access to communities" ON communities 
FOR SELECT 
USING (true); -- Allow read access for API key validation

-- Enable Row Level Security on messages table  
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow API access to messages
CREATE POLICY "Allow API access to messages" ON messages 
FOR ALL 
USING (true); -- Allow full access for API operations

-- Create policy to allow message status updates
CREATE POLICY "Allow message status updates" ON messages 
FOR UPDATE 
USING (true);

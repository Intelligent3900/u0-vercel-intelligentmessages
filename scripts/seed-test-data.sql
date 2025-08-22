-- Insert a test community with a known API key
INSERT INTO communities (name, api_key, created_at, updated_at) 
VALUES (
  'Test Community', 
  'test-api-key-12345', 
  NOW(), 
  NOW()
) ON CONFLICT (api_key) DO NOTHING;

-- Get the community ID for inserting messages
DO $$
DECLARE
    community_uuid UUID;
BEGIN
    SELECT id INTO community_uuid FROM communities WHERE api_key = 'test-api-key-12345';
    
    -- Insert some test messages with "sent" status
    INSERT INTO messages (community_id, content, recipient_phone, sender_name, status, created_at, updated_at) VALUES
    (community_uuid, 'Welcome to our community!', '+1234567890', 'Admin', 'sent', NOW(), NOW()),
    (community_uuid, 'Your membership has been approved.', '+1234567891', 'Support Team', 'sent', NOW(), NOW()),
    (community_uuid, 'Don''t forget about tonight''s meeting at 7 PM.', '+1234567892', 'Event Coordinator', 'sent', NOW(), NOW());
END $$;

-- Create a function to check if a user is a participant in a chat room
CREATE OR REPLACE FUNCTION is_chat_participant(room_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_participants
    WHERE room_id = room_id_param AND user_id = user_id_param
  );
$$;

-- Drop existing policies to redefine them
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON "public"."chat_messages";
DROP POLICY IF EXISTS "Users can send messages in their rooms" ON "public"."chat_messages";
DROP POLICY IF EXISTS "Users can view participants of their own rooms" ON "public"."chat_participants";

-- RLS policy for selecting messages
CREATE POLICY "Users can view messages in rooms they are in"
ON public.chat_messages
FOR SELECT
USING ( is_chat_participant(room_id, auth.uid()) );

-- RLS policy for inserting messages
CREATE POLICY "Users can send messages in rooms they are in"
ON public.chat_messages
FOR INSERT
WITH CHECK ( sender_id = auth.uid() AND is_chat_participant(room_id, auth.uid()) );

-- RLS policy for viewing chat participants
CREATE POLICY "Users can view participants of rooms they are in"
ON public.chat_participants
FOR SELECT
USING ( is_chat_participant(room_id, auth.uid()) ); 
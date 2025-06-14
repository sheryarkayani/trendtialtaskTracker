DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in rooms they participate in" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in rooms they are in" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in rooms they are in" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in rooms they participate in" ON public.chat_messages; 
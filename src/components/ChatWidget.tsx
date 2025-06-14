import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Users, Bell, BellOff, Minimize2, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const initializeWidget = async () => {
      // Get user's rooms
      const { data: participantRooms } = await supabase
        .from('chat_participants')
        .select(`
          room_id,
          chat_rooms(*)
        `)
        .eq('user_id', user.id);

      if (participantRooms && participantRooms.length > 0) {
        const roomId = participantRooms[0].room_id;
        setCurrentRoom(roomId);

        // Fetch recent messages from the first room
        const { data: messages } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:profiles!chat_messages_sender_id_fkey(id, first_name, last_name, email, avatar_url)
          `)
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (messages) {
          setRecentMessages(messages.reverse());
          if (messages.length > 0) {
            setLastMessageId(messages[0].id);
          }
        }
      }
    };

    initializeWidget();
  }, [user]);

  useEffect(() => {
    if (!currentRoom || !user) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel(`widget:${currentRoom}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${currentRoom}` },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Fetch sender details
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender = { ...newMessage, sender };
          
          // Update recent messages
          setRecentMessages(prev => {
            const updated = [...prev, messageWithSender].slice(-3);
            return updated;
          });

          // Update unread count if widget is closed and message is from another user
          if (!isOpen && newMessage.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if enabled
            if (isNotificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
              const senderName = sender?.first_name && sender?.last_name 
                ? `${sender.first_name} ${sender.last_name}`
                : sender?.email || 'Someone';
                
              new Notification(`New message from ${senderName}`, {
                body: newMessage.content.slice(0, 100),
                icon: '/favicon.ico',
                tag: 'chat-notification'
              });
            }
          }

          setLastMessageId(newMessage.id);
        }
      )
      .subscribe();

    // Subscribe to presence for online count
    const presenceChannel = supabase.channel(`widget-presence-${currentRoom}`, {
      config: { presence: { key: user?.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, () => {
        setOnlineCount(prev => prev + 1);
      })
      .on('presence', { event: 'leave' }, () => {
        setOnlineCount(prev => Math.max(0, prev - 1));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await presenceChannel.track({
            user_id: user.id,
            user_name: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, isOpen, isNotificationEnabled, currentRoom]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread count when opening
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleNotifications = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
  };

  const getUserDisplayName = (message: ChatMessage) => {
    if (message.sender?.first_name && message.sender?.last_name) {
      return `${message.sender.first_name} ${message.sender.last_name}`;
    }
    return message.sender?.email || 'Unknown User';
  };

  const getUserInitials = (message: ChatMessage) => {
    if (message.sender?.first_name && message.sender?.last_name) {
      return `${message.sender.first_name[0]}${message.sender.last_name[0]}`.toUpperCase();
    }
    return message.sender?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  if (isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        <Card className="w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageSquare className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold">Team Chat</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {onlineCount} online
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotifications}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isNotificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 flex flex-col">
              {/* Recent Messages Preview */}
              <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Recent messages</p>
                </div>
                
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                      {getUserInitials(message)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {getUserDisplayName(message)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No messages yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Start a conversation!</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <Link to="/chat" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                    Open Full Chat
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 group"
    >
      <div className="relative">
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Online indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-3 -right-3 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold animate-bounce"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {onlineCount > 0 ? `${onlineCount} team members online` : 'Open team chat'}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
      </div>
    </Button>
  );
};

export default ChatWidget;
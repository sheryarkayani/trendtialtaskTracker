import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, Smile, Paperclip, Users, Search, MoreVertical, Phone, Video, Clock, CheckCheck, Image, FileText, X, Edit3, Reply, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['chat_messages']['Row'] & {
  user_name: string;
  reactions: MessageReaction[];
  profiles: {
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};
type MessageReaction = Database['public']['Tables']['message_reactions']['Row'];


interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: number;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '👏', '💯', '🎉'];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles (avatar_url, first_name, last_name),
          reactions:message_reactions(*)
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data?.map(m => ({
            ...m, 
            reactions: (m.reactions as any) || [], 
            user_name: `${m.profiles?.first_name} ${m.profiles?.last_name}`.trim() || 'Unknown User'
        })) || []);
      }
    };

    fetchMessages();

    const messageSubscription = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
            const { data: profile, error } = await supabase.from('profiles').select('avatar_url, first_name, last_name').eq('id', (payload.new as Message).sender_id).single();
            if(error) console.error("Error fetching profile for new message", error);

            const newMessage = {
                ...payload.new,
                profiles: profile,
                user_name: `${profile?.first_name} ${profile?.last_name}`.trim() || 'Unknown User',
                reactions: [],
            }
            setMessages((prev) => [...prev, newMessage as Message]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) =>
            prev.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } as Message : msg)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => prev.filter(msg => msg.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    const typingChannel = supabase.channel('typing-indicators');

    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, user_name, isTyping } = payload.payload;
        if (user_id !== user?.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== user_id);
            return isTyping
              ? [...filtered, { user_id, user_name, timestamp: Date.now() }]
              : filtered;
          });
        }
      })
      .subscribe();

    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: user?.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => new Set([...prev, key]));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user?.id,
            user_name: user?.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev =>
        prev.filter(u => Date.now() - u.timestamp < 3000)
      );
    }, 1000);

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(presenceChannel);
      clearInterval(cleanupInterval);
    };
  }, [user]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel('typing-indicators').send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, user_name: user?.email, isTyping: true }
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      supabase.channel('typing-indicators').send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, user_name: user?.email, isTyping: false }
      });
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const tempId = `temp-${Date.now()}`;
    const sentAt = new Date().toISOString();

    const optimisticMessage: Message = {
      id: tempId,
      created_at: sentAt,
      sender_id: user.id,
      content: newMessage,
      message_type: 'text',
      reply_to: replyingTo?.id || null,
      room_id: '8a15df0f-f8b6-41f0-8bee-4c500dd21e34', // This should be dynamic
      user_name: `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim() || 'You',
      profiles: {
        avatar_url: user.user_metadata.avatar_url || null,
        first_name: user.user_metadata.first_name || null,
        last_name: user.user_metadata.last_name || null,
      },
      reactions: [],
      updated_at: null,
      file_url: null,
      file_name: null,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setReplyingTo(null);

    const messageData = {
      content: newMessage,
      sender_id: user.id,
      message_type: 'text' as const,
      reply_to: replyingTo?.id || null,
      room_id: '8a15df0f-f8b6-41f0-8bee-4c500dd21e34', // This should be dynamic based on the selected chat room
    };

    const { data, error } = await supabase.from('chat_messages').insert(messageData).select(`
        *,
        profiles (avatar_url, first_name, last_name),
        reactions:message_reactions(*)
      `).single();


    if (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (data) {
        const finalMessage = {
          ...data,
          reactions: (data.reactions as any) || [],
          user_name: `${data.profiles?.first_name} ${data.profiles?.last_name}`.trim() || 'Unknown User'
        };
        setMessages(prev => prev.map(m => m.id === tempId ? finalMessage as Message : m));
    }
    
    if (isTyping) {
      setIsTyping(false);
      supabase.channel('typing-indicators').send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, user_name: user?.email, isTyping: false }
      });
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .update({
        content: editText,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (!error) {
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    const { data: existingReaction, error: existingReactionError } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single();

    if (existingReactionError && existingReactionError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("Error checking reaction", existingReactionError);
      return;
    }

    if (existingReaction) {
      await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);
    } else {
      await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji
        });
    }

    setShowEmojiPicker(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat-files/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    const messageData = {
      content: `Shared a file: ${file.name}`,
      sender_id: user.id,
      message_type: file.type.startsWith('image/') ? 'image' : 'file',
      file_url: publicUrl,
      file_name: file.name,
      room_id: '8a15df0f-f8b6-41f0-8bee-4c500dd21e34', // This should be dynamic
    };

    await supabase.from('chat_messages').insert([messageData]);
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReplyMessage = (replyId: string) => {
    return messages.find(msg => msg.id === replyId);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                  {onlineUsers.size}
                </Badge>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Team Chat</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {onlineUsers.size} members online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm"
                />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 hover:text-green-600">
                    <Phone className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice Call</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600">
                    <Video className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video Call</TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      Mute notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Clear chat history
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Export chat
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredMessages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const replyMessage = message.reply_to ? getReplyMessage(message.reply_to) : null;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <Avatar className="w-8 h-8 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {message.user_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : ''}`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {message.user_name}
                        </span>
                        {onlineUsers.has(message.sender_id) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    )}

                    <div className="relative group">
                      {replyMessage && (
                        <div className={`mb-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-l-4 ${isOwn ? 'border-blue-500' : 'border-green-500'}`}>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Replying to {replyMessage.user_name}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                            {replyMessage.content}
                          </p>
                        </div>
                      )}

                      <div
                        className={`relative p-3 rounded-2xl shadow-md backdrop-blur-sm ${
                          isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                        } ${editingMessage === message.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        {editingMessage === message.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="bg-transparent border-none p-0 text-inherit"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditMessage(message.id);
                                if (e.key === 'Escape') setEditingMessage(null);
                              }}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEditMessage(message.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingMessage(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {message.message_type === 'image' && (
                              <img
                                src={message.file_url ?? ''}
                                alt={message.file_name ?? ''}
                                className="max-w-full h-auto rounded-lg mb-2"
                              />
                            )}

                            {message.message_type === 'file' && (
                              <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mb-2">
                                <FileText className="w-5 h-5" />
                                <span className="text-sm">{message.file_name}</span>
                              </div>
                            )}

                            <p className="whitespace-pre-wrap break-words">{message.content}</p>

                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(
                                  message.reactions.reduce((acc: Record<string, number>, reaction) => {
                                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                    return acc;
                                  }, {})
                                ).map(([emoji, count]) => (
                                  <Button
                                    key={emoji}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                    onClick={() => handleReaction(message.id, emoji)}
                                  >
                                    {emoji} {count}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        <div className={`absolute top-1 ${isOwn ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full shadow-lg p-1">
                            <Popover open={showEmojiPicker === message.id} onOpenChange={(open) => setShowEmojiPicker(open ? message.id : null)}>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Smile className="w-3 h-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <div className="grid grid-cols-5 gap-1">
                                  {EMOJI_LIST.map((emoji) => (
                                    <Button
                                      key={emoji}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleReaction(message.id, emoji)}
                                    >
                                      {emoji}
                                    </Button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="w-3 h-3" />
                            </Button>

                            {isOwn && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setEditingMessage(message.id);
                                    setEditText(message.content);
                                  }}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteMessage(message.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${isOwn ? 'justify-end' : ''}`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(message.created_at)}</span>
                        {message.updated_at && message.created_at !== message.updated_at &&(
                          <span className="text-slate-400">(edited)</span>
                        )}
                        {isOwn && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>

                  {isOwn && (
                    <Avatar className="w-8 h-8 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                        {user?.email?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>
                  {typingUsers.map(u => u.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {replyingTo && (
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Replying to {replyingTo.user_name}: {replyingTo.content.slice(0, 50)}...
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-600 hover:text-blue-600"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="pr-20 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-full"
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="grid grid-cols-5 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setNewMessage(prev => prev + emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Chat; 
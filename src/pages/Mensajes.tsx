import React, { useEffect, useMemo, useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type UserMini = { full_name?: string | null; email?: string | null };

type MessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender?: UserMini | null;
  receiver?: UserMini | null;
};

type Conversation = {
  otherUserId: string;
  name: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

export default function Mensajes() {
  const { isAuthenticated, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);

  const myId = userProfile?.id;

  const loadMessages = async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id,sender_id,receiver_id,subject,content,read,created_at,sender:sender_id(full_name,email),receiver:receiver_id(full_name,email)')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setRows((data || []) as any);
      // Auto-seleccionar conversación más reciente
      if (!selectedOtherUserId) {
        const last = (data || []).slice().sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1))[0];
        if (last) {
          const other = last.sender_id === myId ? last.receiver_id : last.sender_id;
          setSelectedOtherUserId(other);
        }
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!myId) return;
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const conversations = useMemo<Conversation[]>(() => {
    if (!myId) return [];
    const map = new Map<string, Conversation>();
    for (const m of rows) {
      const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
      const otherName =
        (m.sender_id === otherId ? m.sender?.full_name || m.sender?.email : m.receiver?.full_name || m.receiver?.email) ||
        'Usuario';

      const existing = map.get(otherId);
      const unread = m.receiver_id === myId && m.sender_id === otherId && !m.read ? 1 : 0;
      if (!existing) {
        map.set(otherId, {
          otherUserId: otherId,
          name: otherName,
          lastMessage: m.content,
          lastAt: m.created_at,
          unread,
        });
      } else {
        // last message
        if (m.created_at >= existing.lastAt) {
          existing.lastAt = m.created_at;
          existing.lastMessage = m.content;
        }
        existing.unread += unread;
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.lastAt > b.lastAt ? -1 : 1));
  }, [rows, myId]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  const currentMessages = useMemo(() => {
    if (!myId || !selectedOtherUserId) return [];
    return rows.filter(
      (m) =>
        (m.sender_id === myId && m.receiver_id === selectedOtherUserId) ||
        (m.sender_id === selectedOtherUserId && m.receiver_id === myId)
    );
  }, [rows, myId, selectedOtherUserId]);

  const currentConversation = useMemo(() => {
    if (!selectedOtherUserId) return null;
    return conversations.find((c) => c.otherUserId === selectedOtherUserId) || null;
  }, [conversations, selectedOtherUserId]);

  // Marcar como leídos los mensajes entrantes del otro usuario al abrir conversación
  useEffect(() => {
    const markRead = async () => {
      if (!myId || !selectedOtherUserId) return;
      const unreadIds = currentMessages
        .filter((m) => m.receiver_id === myId && m.sender_id === selectedOtherUserId && !m.read)
        .map((m) => m.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase.from('messages').update({ read: true }).in('id', unreadIds);
      if (!error) {
        setRows((prev) => prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read: true } : m)));
      }
    };
    markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOtherUserId]);

  const handleSendMessage = async () => {
    if (!myId || !selectedOtherUserId) return;
    if (!messageInput.trim()) return;
    const content = messageInput.trim();
    setMessageInput('');
    const { error } = await supabase.from('messages').insert({
      sender_id: myId,
      receiver_id: selectedOtherUserId,
      content,
      subject: null,
      read: false,
    });
    if (error) {
      alert(error.message || 'Error enviando mensaje');
      return;
    }
    await loadMessages();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">💬 Mensajes</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-6">
        {/* Chat List */}
        <div className="w-full md:w-80 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-emerald-200 dark:border-emerald-700">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
                Cargando...
              </div>
            ) : (
              filteredConversations.map((conversation) => (
              <button
                key={conversation.otherUserId}
                onClick={() => setSelectedOtherUserId(conversation.otherUserId)}
                className={`w-full px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 ${
                  selectedOtherUserId === conversation.otherUserId
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-600'
                    : ''
                }`}
              >
                {/* Avatar with Online Status */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {(conversation.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                </div>

                {/* Message Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{conversation.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {new Date(conversation.lastAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conversation.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {conversation.unread > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                    {conversation.unread}
                  </div>
                )}
              </button>
            ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        {currentConversation && (
          <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {(currentConversation.name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{currentConversation.name}</h3>
                  <p className="text-xs text-emerald-100">Conversación</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-700/50">
              {currentMessages.map((message) => {
                const isOwn = message.sender_id === myId;
                return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )})}
            </div>

            {/* Input Area */}
            <div className="border-t border-emerald-200 dark:border-emerald-700 p-4 flex gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


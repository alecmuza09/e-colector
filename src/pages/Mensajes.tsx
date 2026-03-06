import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Send, Loader, MessageCircle, ArrowLeft, Handshake, CheckCircle } from 'lucide-react';
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
  product_id?: string | null;
  sender?: UserMini | null;
  receiver?: UserMini | null;
};

type Conversation = {
  otherUserId: string;
  name: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  subject?: string | null;
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

export default function Mensajes() {
  const { isAuthenticated, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myId = userProfile?.id;
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [tradeSending, setTradeSending] = useState(false);

  const handleConfirmTrade = async () => {
    if (!myId || !selectedOtherUserId || tradeSending) return;
    setTradeSending(true);
    try {
      await supabase.from('trade_connections').insert({
        buyer_id: myId,
        seller_id: selectedOtherUserId,
        status: 'acordado',
        notes: `Acuerdo confirmado desde chat con ${currentConversation?.name || selectedOtherUserId}`,
      });
      setTradeSuccess(true);
      setTimeout(() => setTradeSuccess(false), 4000);
    } catch (e) {
      console.error('Error registrando acuerdo:', e);
    }
    setTradeSending(false);
  };

  const loadMessages = async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id,sender_id,receiver_id,subject,content,read,created_at,product_id,sender:sender_id(full_name,email),receiver:receiver_id(full_name,email)')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setRows((data || []) as any);
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
  }, [myId]);

  // ── Suscripción Realtime ─────────────────────────────────────────────────
  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel(`messages-inbox-${myId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${myId}` },
        () => { loadMessages(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${myId}` },
        () => { loadMessages(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myId]);

  // ── Auto-scroll al último mensaje ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedOtherUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [rows.length]);

  // ── Conversaciones agrupadas ─────────────────────────────────────────────
  const conversations = useMemo<Conversation[]>(() => {
    if (!myId) return [];
    const map = new Map<string, Conversation>();
    for (const m of rows) {
      const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
      const other = m.sender_id === otherId ? m.sender : m.receiver;
      const otherName = other?.full_name || other?.email || 'Usuario';
      const unread = m.receiver_id === myId && m.sender_id === otherId && !m.read ? 1 : 0;
      const existing = map.get(otherId);
      if (!existing) {
        map.set(otherId, { otherUserId: otherId, name: otherName, lastMessage: m.content, lastAt: m.created_at, unread, subject: m.subject });
      } else {
        if (m.created_at >= existing.lastAt) {
          existing.lastAt = m.created_at;
          existing.lastMessage = m.content;
          existing.subject = m.subject;
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

  const currentConversation = useMemo(
    () => conversations.find((c) => c.otherUserId === selectedOtherUserId) || null,
    [conversations, selectedOtherUserId]
  );

  // ── Marcar como leídos ───────────────────────────────────────────────────
  useEffect(() => {
    const markRead = async () => {
      if (!myId || !selectedOtherUserId) return;
      const unreadIds = currentMessages
        .filter((m) => m.receiver_id === myId && m.sender_id === selectedOtherUserId && !m.read)
        .map((m) => m.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase.from('messages').update({ read: true }).in('id', unreadIds);
      if (!error) setRows((prev) => prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read: true } : m)));
    };
    markRead();
  }, [selectedOtherUserId]);

  // ── Enviar mensaje ───────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!myId || !selectedOtherUserId || !messageInput.trim() || sending) return;
    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: myId,
      receiver_id: selectedOtherUserId,
      content,
      subject: null,
      read: false,
    });
    setSending(false);
    if (error) {
      console.error('Error enviando mensaje:', error);
      setMessageInput(content);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tus mensajes.</p>
          <Link to="/login" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Ir a login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-emerald-600" />
        <h1 className="text-lg font-bold text-gray-900">Mensajes</h1>
        {conversations.some(c => c.unread > 0) && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {conversations.reduce((acc, c) => acc + c.unread, 0)} nuevos
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Lista de conversaciones ── */}
        <div className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-200
          ${selectedOtherUserId ? 'hidden md:flex md:w-80' : 'flex w-full md:w-80'}`}>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
                <p className="text-sm">Cargando...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">Sin conversaciones</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tus mensajes aparecerán aquí cuando alguien te contacte o hagas una oferta.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.otherUserId}
                  onClick={() => setSelectedOtherUserId(conv.otherUserId)}
                  className={`w-full px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left
                    ${selectedOtherUserId === conv.otherUserId ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${conv.unread > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {(conv.name || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {conv.name}
                      </p>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{timeAgo(conv.lastAt)}</span>
                    </div>
                    {conv.subject && (
                      <p className="text-xs text-emerald-600 font-medium truncate mb-0.5">{conv.subject}</p>
                    )}
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Ventana de chat ── */}
        {selectedOtherUserId && currentConversation ? (
          <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
            {/* Chat header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setSelectedOtherUserId(null)}
                className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {currentConversation.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{currentConversation.name}</p>
                {currentConversation.subject && (
                  <p className="text-xs text-emerald-600 truncate">{currentConversation.subject}</p>
                )}
              </div>

              {/* Botón Confirmar acuerdo */}
              {tradeSuccess ? (
                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5" /> ¡Acuerdo registrado!
                </div>
              ) : (
                <button
                  onClick={handleConfirmTrade}
                  disabled={tradeSending}
                  title="Registrar un acuerdo comercial con este contacto"
                  className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {tradeSending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Handshake className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Confirmar acuerdo</span>
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-gray-400">
                  <div>
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm">Inicia la conversación</p>
                  </div>
                </div>
              ) : (
                currentMessages.map((message) => {
                  const isOwn = message.sender_id === myId;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-sm lg:max-w-md space-y-1`}>
                        {/* Subject banner (for system notifications) */}
                        {message.subject && (
                          <p className={`text-xs font-semibold px-1 ${isOwn ? 'text-right text-emerald-400' : 'text-emerald-600'}`}>
                            {message.subject}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                            ${isOwn
                              ? 'bg-emerald-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                            }`}
                        >
                          {message.content}
                        </div>
                        <p className={`text-xs px-1 text-gray-400 ${isOwn ? 'text-right' : ''}`}>
                          {new Date(message.created_at).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                          {isOwn && (
                            <span className="ml-1">{message.read ? ' ✓✓' : ' ✓'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 items-end">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Escribe un mensaje... (Enter para enviar)"
                rows={1}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sending}
                className="flex-shrink-0 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 text-center text-gray-400 p-8">
            <div>
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">Selecciona una conversación</p>
              <p className="text-sm mt-1">o espera a que alguien te contacte</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

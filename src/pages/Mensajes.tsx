import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Send, Loader, MessageCircle, ArrowLeft, Handshake, CheckCircle, PackageCheck, X, Tag, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { createReview, getReviewedProductIds } from '../services/reviews';
import { StarRating } from '../components/StarRating';

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
  hasSoldProduct?: boolean;
};

type ProductMini = {
  id: string;
  title: string;
  category: string;
  status: string;
  image_url: string | null;
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

  // ── Marcar como vendido ───────────────────────────────────────────────────
  const [myProductsInConv, setMyProductsInConv] = useState<ProductMini[]>([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedProductToSell, setSelectedProductToSell] = useState<ProductMini | null>(null);
  const [markingSold, setMarkingSold] = useState(false);
  const [soldSuccess, setSoldSuccess] = useState(false);

  // ── Calificar transacción ─────────────────────────────────────────────────
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingTargetUserId, setRatingTargetUserId] = useState<string | null>(null);
  const [ratingProductId, setRatingProductId] = useState<string | null>(null);
  const [ratingTargetName, setRatingTargetName] = useState('');
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());

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

  // IDs de productos mencionados en la conversación actual
  const productIdsInConv = useMemo(() => {
    const ids = currentMessages.map(m => m.product_id).filter(Boolean) as string[];
    return [...new Set(ids)];
  }, [currentMessages]);

  // Cargar productos ya calificados en esta conversación
  useEffect(() => {
    const loadReviewed = async () => {
      if (!myId || !selectedOtherUserId) { setReviewedProductIds(new Set()); return; }
      const ids = await getReviewedProductIds(myId, selectedOtherUserId);
      setReviewedProductIds(ids);
    };
    loadReviewed();
  }, [myId, selectedOtherUserId]);

  // Cargar los productos de esa conversación que le pertenecen al usuario actual
  useEffect(() => {
    const loadMyProducts = async () => {
      if (!myId || productIdsInConv.length === 0) {
        setMyProductsInConv([]);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('id, title, category, status, image_url')
        .in('id', productIdsInConv)
        .eq('user_id', myId);
      setMyProductsInConv((data || []) as ProductMini[]);
    };
    loadMyProducts();
  }, [productIdsInConv.join(','), myId]);

  // Productos activos (no vendidos aún) que el usuario puede marcar como vendidos
  const activeMyProducts = useMemo(
    () => myProductsInConv.filter(p => p.status === 'activo'),
    [myProductsInConv]
  );

  const handleMarkAsSold = async () => {
    if (!selectedProductToSell || !myId || !selectedOtherUserId || markingSold) return;
    setMarkingSold(true);
    try {
      // 1. Actualizar status del producto a 'vendido'
      const { error } = await supabase
        .from('products')
        .update({ status: 'vendido', updated_at: new Date().toISOString() })
        .eq('id', selectedProductToSell.id)
        .eq('user_id', myId);

      if (error) throw error;

      // 2. Enviar mensaje automático en el chat
      await supabase.from('messages').insert({
        sender_id: myId,
        receiver_id: selectedOtherUserId,
        content: `He marcado "${selectedProductToSell.title}" como vendido. ¡Gracias por concretar esta transacción! 🎉`,
        subject: '🏷️ Artículo vendido',
        product_id: selectedProductToSell.id,
        read: false,
      });

      // 3. Actualizar estado local
      setMyProductsInConv(prev =>
        prev.map(p => p.id === selectedProductToSell.id ? { ...p, status: 'vendido' } : p)
      );

      setSoldSuccess(true);
      setShowSoldModal(false);

      // Abrir modal de calificación para que el vendedor califique al comprador
      setRatingTargetUserId(selectedOtherUserId);
      setRatingProductId(selectedProductToSell.id);
      setRatingTargetName(currentConversation?.name || 'el comprador');
      setRatingValue(0);
      setRatingComment('');
      setRatingError(null);
      setShowRatingModal(true);

      setSelectedProductToSell(null);
      setTimeout(() => setSoldSuccess(false), 5000);
    } catch (e) {
      console.error('Error al marcar como vendido:', e);
    }
    setMarkingSold(false);
  };

  const handleOpenRatingForBuyer = (msg: MessageRow) => {
    if (!selectedOtherUserId) return;
    setRatingTargetUserId(msg.sender_id);
    setRatingProductId(msg.product_id ?? null);
    setRatingTargetName(currentConversation?.name || 'el vendedor');
    setRatingValue(0);
    setRatingComment('');
    setRatingError(null);
    setShowRatingModal(true);
  };

  const handleSubmitReview = async () => {
    if (!myId || !ratingTargetUserId || ratingValue === 0 || ratingLoading) return;
    setRatingLoading(true);
    setRatingError(null);
    const result = await createReview({
      reviewer_id: myId,
      reviewed_user_id: ratingTargetUserId,
      product_id: ratingProductId,
      rating: ratingValue,
      comment: ratingComment.trim() || null,
    });
    setRatingLoading(false);
    if (!result.success) {
      setRatingError(result.error || 'Error al guardar la calificación.');
      return;
    }
    if (ratingProductId) {
      setReviewedProductIds(prev => new Set([...prev, ratingProductId!]));
    }
    setShowRatingModal(false);
    setRatingValue(0);
    setRatingComment('');
  };

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

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {conv.unread > 0 && (
                      <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                    {/* Badge "Vendido" si el último mensaje es de venta */}
                    {rows.some(m =>
                      ((m.sender_id === myId && m.receiver_id === conv.otherUserId) ||
                       (m.sender_id === conv.otherUserId && m.receiver_id === myId)) &&
                      m.subject === '🏷️ Artículo vendido'
                    ) && (
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> Vendido
                      </span>
                    )}
                  </div>
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

              {/* Botones de acción */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Botón Marcar como vendido (solo para el dueño del producto) */}
                {activeMyProducts.length > 0 && (
                  soldSuccess ? (
                    <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                      <Tag className="w-3.5 h-3.5" /> ¡Marcado como vendido!
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProductToSell(activeMyProducts.length === 1 ? activeMyProducts[0] : null);
                        setShowSoldModal(true);
                      }}
                      title="Marcar artículo como vendido"
                      className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Artículo vendido</span>
                    </button>
                  )
                )}

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
                    className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {tradeSending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Handshake className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Confirmar acuerdo</span>
                  </button>
                )}
              </div>
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
                  const isSoldNotice = message.subject === '🏷️ Artículo vendido';

                  // Mensaje especial de venta (centrado, estilo distintivo)
                  if (isSoldNotice) {
                    const canRate =
                      message.sender_id !== myId &&
                      message.product_id &&
                      !reviewedProductIds.has(message.product_id);
                    return (
                      <div key={message.id} className="flex justify-center py-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 max-w-sm text-center shadow-sm">
                          <p className="text-xs font-bold text-blue-600 mb-1 flex items-center justify-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            {message.subject}
                          </p>
                          <p className="text-sm text-blue-800 leading-relaxed">{message.content}</p>
                          <p className="text-xs text-blue-400 mt-1.5">
                            {new Date(message.created_at).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                          </p>
                          {canRate && (
                            <button
                              onClick={() => handleOpenRatingForBuyer(message)}
                              className="mt-2.5 flex items-center gap-1.5 mx-auto bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                              Calificar esta transacción
                            </button>
                          )}
                          {message.sender_id !== myId && message.product_id && reviewedProductIds.has(message.product_id) && (
                            <p className="mt-2 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Ya calificaste esta transacción
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

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

      {/* ── Modal: Marcar como vendido ── */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Marcar como vendido</h2>
              </div>
              <button
                onClick={() => { setShowSoldModal(false); setSelectedProductToSell(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Si hay múltiples productos activos, mostrar selector */}
              {activeMyProducts.length > 1 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ¿Cuál artículo vendiste?
                  </p>
                  <div className="space-y-2">
                    {activeMyProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProductToSell(product)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selectedProductToSell?.id === product.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">♻️</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{product.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                        </div>
                        {selectedProductToSell?.id === product.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista previa del producto seleccionado (cuando solo hay 1) */}
              {activeMyProducts.length === 1 && selectedProductToSell && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  {selectedProductToSell.image_url ? (
                    <img src={selectedProductToSell.image_url} alt={selectedProductToSell.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">♻️</div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedProductToSell.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProductToSell.category}</p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>¿Qué pasa al confirmar?</strong> La publicación se marcará como <strong>Vendida</strong> y dejará de aparecer en búsquedas y el mapa. Podrás verla en tu panel de publicaciones como vendida.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowSoldModal(false); setSelectedProductToSell(null); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkAsSold}
                  disabled={!selectedProductToSell || markingSold}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {markingSold ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    <><PackageCheck className="w-4 h-4" /> Confirmar venta</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Calificar transacción ── */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    ¿Cómo fue la transacción?
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Califica tu experiencia con{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{ratingTargetName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowRatingModal(false); setRatingValue(0); setRatingComment(''); setRatingError(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Selector de estrellas */}
              <div className="flex flex-col items-center gap-3 py-2">
                <StarRating value={ratingValue} onChange={setRatingValue} size="lg" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ratingValue === 0 && 'Toca una estrella para calificar'}
                  {ratingValue === 1 && '😞 Muy mala experiencia'}
                  {ratingValue === 2 && '😕 Mala experiencia'}
                  {ratingValue === 3 && '😐 Experiencia regular'}
                  {ratingValue === 4 && '😊 Buena experiencia'}
                  {ratingValue === 5 && '🌟 ¡Excelente experiencia!'}
                </p>
              </div>

              {/* Comentario opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Comentario <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  placeholder="Cuéntanos cómo fue la transacción, puntualidad, estado del material, trato recibido..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm resize-none bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{ratingComment.length}/500</p>
              </div>

              {ratingError && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{ratingError}</p>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowRatingModal(false); setRatingValue(0); setRatingComment(''); setRatingError(null); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Omitir por ahora
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={ratingValue === 0 || ratingLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {ratingLoading ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Publicando...</>
                  ) : (
                    <><Star className="w-4 h-4 fill-white" /> Publicar reseña</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Home,
  Map,
  Plus,
  MessageCircle,
  User,
  Heart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Search,
  X,
} from 'lucide-react';

type NotifItem = {
  id: string;
  sender_id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender?: { full_name?: string | null; email?: string | null } | null;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, isAuthenticated, userProfile, userName } = useAuth();

  const navItems = [
    { label: 'Inicio', icon: Home, path: '/' },
    { label: 'Explorar Mapa', icon: Map, path: '/explorar' },
    { label: 'Publicar', icon: Plus, path: '/publicar' },
    { label: 'Mensajes', icon: MessageCircle, path: '/mensajes', badge: unreadMessages },
    { label: 'Favoritos', icon: Heart, path: '/favoritos', badge: favoritesCount },
  ];

  const secondaryItems = [
    { label: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
    { label: 'Perfil', icon: User, path: '/perfil' },
    { label: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const closeMobile = () => setIsMobileOpen(false);
  const handleLinkClick = () => closeMobile();

  // ── Cargar notificaciones recientes ─────────────────────────────────────
  const fetchNotifications = async () => {
    if (!userProfile?.id) return;
    const { data } = await supabase
      .from('messages')
      .select('id,sender_id,subject,content,read,created_at,sender:sender_id(full_name,email)')
      .eq('receiver_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data || []) as any);
    const unread = (data || []).filter((m: any) => !m.read).length;
    setUnreadMessages(unread);
  };

  // ── Cargar favoritos ─────────────────────────────────────────────────────
  const fetchFavorites = async () => {
    if (!userProfile?.id) return;
    const { count } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userProfile.id);
    setFavoritesCount(count || 0);
  };

  // ── Carga inicial + Realtime en mensajes ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.id) {
      setUnreadMessages(0);
      setFavoritesCount(0);
      setNotifications([]);
      return;
    }

    fetchNotifications();
    fetchFavorites();

    const channel = supabase
      .channel(`sidebar-notifs-${userProfile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userProfile.id}` },
        () => { fetchNotifications(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userProfile.id}` },
        () => { fetchNotifications(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, userProfile?.id]);

  // ── Cerrar panel al hacer click fuera ───────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Marcar todas como leídas ─────────────────────────────────────────────
  const markAllRead = async () => {
    if (!userProfile?.id) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('messages').update({ read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadMessages(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`);
      closeMobile();
    }
  };

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/'); }
  };

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMobile} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-0 h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900
          text-white transition-all duration-300 z-50 flex flex-col
          ${isMobileOpen ? 'left-0' : '-left-full md:left-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-emerald-700 flex items-center justify-between flex-shrink-0">
          {!isCollapsed ? (
            <Link to="/" onClick={handleLinkClick} className="hover:opacity-80 transition-opacity">
              <img src="/assets/images/logo-full.png" alt="e-colector" className="h-10 object-contain brightness-0 invert" />
            </Link>
          ) : (
            <Link to="/" onClick={handleLinkClick} className="mx-auto hover:opacity-80 transition-opacity">
              <img src="/assets/images/logo-icon.png" alt="e-colector" className="h-10 w-10 object-contain" />
            </Link>
          )}
          <button
            onClick={() => { if (window.innerWidth < 768) closeMobile(); else setIsCollapsed(v => !v); }}
            className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Info usuario + campana */}
        {!isCollapsed && userName && (
          <div className="px-4 py-3 border-b border-emerald-700 flex items-center gap-3 flex-shrink-0 relative" ref={notifRef}>
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-emerald-300 capitalize">{userRole || 'usuario'}</p>
            </div>

            {/* Campana de notificaciones */}
            <button
              onClick={() => setShowNotifPanel(v => !v)}
              className="relative p-1.5 hover:bg-emerald-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>

            {/* Panel de notificaciones */}
            {showNotifPanel && (
              <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 text-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="font-semibold text-sm text-gray-800">Notificaciones</span>
                  <div className="flex items-center gap-2">
                    {unreadNotifs.length > 0 && (
                      <button onClick={markAllRead} className="text-xs text-emerald-600 hover:underline">
                        Marcar leídas
                      </button>
                    )}
                    <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                      Sin notificaciones
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <Link
                        key={n.id}
                        to="/mensajes"
                        onClick={() => { setShowNotifPanel(false); handleLinkClick(); }}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors
                          ${!n.read ? 'bg-emerald-50/60' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${!n.read ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {(n.sender?.full_name || n.sender?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-xs truncate ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {n.sender?.full_name || n.sender?.email || 'Usuario'}
                            </p>
                            <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{timeAgo(n.created_at)}</span>
                          </div>
                          {n.subject && (
                            <p className="text-[11px] text-emerald-600 font-medium truncate">{n.subject}</p>
                          )}
                          <p className="text-[11px] text-gray-500 truncate">{n.content}</p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </Link>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                  <Link
                    to="/mensajes"
                    onClick={() => { setShowNotifPanel(false); handleLinkClick(); }}
                    className="text-xs text-emerald-600 font-medium hover:underline"
                  >
                    Ver todos los mensajes →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campana colapsada (solo icono) */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-emerald-700 flex-shrink-0">
            <Link to="/mensajes" className="relative p-2 hover:bg-emerald-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Búsqueda */}
        {!isCollapsed && (
          <form onSubmit={handleSearch} className="px-4 py-3 border-b border-emerald-700 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar material..."
                className="w-full pl-9 pr-4 py-2 bg-emerald-700/50 border border-emerald-600 rounded-lg text-sm text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </form>
        )}

        {/* Nav principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                ${isActive(item.path) ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <item.icon className="w-5 h-5" />
                {/* Badge en modo colapsado */}
                {isCollapsed && item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Divisor */}
        <div className="px-4"><div className="h-px bg-emerald-700" /></div>

        {/* Nav secundaria */}
        <nav className="px-3 py-3 space-y-1 flex-shrink-0">
          {secondaryItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm
                ${isActive(item.path) ? 'bg-white/20 text-white font-semibold' : 'text-emerald-200 hover:bg-emerald-700/50 hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className={`p-3 border-t border-emerald-700 flex-shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm
              ${isCollapsed ? 'p-2' : 'w-full justify-center px-4 py-2'}`}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

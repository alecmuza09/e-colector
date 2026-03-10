import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Home,
  LayoutDashboard,
  Map,
  Plus,
  MessageCircle,
  User,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Store,
} from 'lucide-react';


const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, isAuthenticated, userProfile, userName } = useAuth();

  const navItems = [
    { label: 'Inicio', icon: Home, path: '/', roles: null },
    { label: 'Mi Panel', icon: LayoutDashboard, path: '/dashboard', roles: null },
    { label: 'Explorar Mapa', icon: Map, path: '/explorar', roles: null },
    { label: 'Publicar', icon: Plus, path: '/publicar', roles: ['seller', 'collector', 'admin'] },
    { label: 'Stocks Recolectores', icon: Store, path: '/mercado-recolectores', roles: ['buyer', 'admin'] },
    { label: 'Mensajes', icon: MessageCircle, path: '/mensajes', badge: unreadMessages, roles: null },
  ].filter(item => !item.roles || !userRole || item.roles.includes(userRole));

  const secondaryItems = [
    { label: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
    { label: 'Perfil', icon: User, path: '/perfil' },
    { label: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const closeMobile = () => setIsMobileOpen(false);
  const handleLinkClick = () => closeMobile();

  // ── Cargar contador de mensajes no leídos ────────────────────────────────
  const fetchNotifications = async () => {
    if (!userProfile?.id) return;
    const { data } = await supabase
      .from('messages')
      .select('id,read')
      .eq('receiver_id', userProfile.id);
    const unread = (data || []).filter((m: any) => !m.read).length;
    setUnreadMessages(unread);
  };

  // ── Carga inicial + Realtime en mensajes ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.id) {
      setUnreadMessages(0);
      return;
    }

    fetchNotifications();

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

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[1002] p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[1000]" onClick={closeMobile} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-0 h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900
          text-white transition-all duration-300 z-[1001] flex flex-col
          ${isMobileOpen ? 'left-0' : '-left-full md:left-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-emerald-700 flex items-center justify-between flex-shrink-0">
          {!isCollapsed ? (
            <Link to="/" onClick={handleLinkClick} className="hover:opacity-80 transition-opacity">
              <img src="/assets/images/logo-full.png" alt="e-colector" className="h-10 object-contain mix-blend-screen" />
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

        {/* Info usuario */}
        {!isCollapsed && userName && (
          <div className="px-4 py-3 border-b border-emerald-700 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-emerald-300 capitalize">{userRole || 'usuario'}</p>
            </div>
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

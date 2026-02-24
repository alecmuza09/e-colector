import React, { useState } from 'react';
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
  X,
  Bell,
  Search,
  Instagram,
  Youtube,
} from 'lucide-react';

const Sidebar = () => {
  // Empieza cerrado en móvil, abierto en escritorio
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, isAuthenticated, userProfile, userName } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [newMaterials, setNewMaterials] = useState<number>(0);

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

  const handleLinkClick = () => {
    closeMobile();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`);
      closeMobile();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/');
    }
  };

  React.useEffect(() => {
    const loadCounts = async () => {
      if (!isAuthenticated || !userProfile) {
        setUnreadMessages(0);
        setFavoritesCount(0);
        setNewMaterials(0);
        return;
      }
      try {
        const { count: msgCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', userProfile.id)
          .eq('read', false);
        setUnreadMessages(msgCount || 0);

        const { count: favCount } = await supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id);
        setFavoritesCount(favCount || 0);

        if (userProfile.city) {
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count: prodCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'activo')
            .gte('created_at', since)
            .eq('municipality', userProfile.city);
          setNewMaterials(prodCount || 0);
        } else {
          setNewMaterials(0);
        }
      } catch (e) {
        console.error('Error loading sidebar counts:', e);
      }
    };

    loadCounts();
  }, [isAuthenticated, userProfile?.id, userProfile?.city]);

  return (
    <>
      {/* Botón hamburguesa - solo móvil, fijo arriba a la izquierda */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay móvil - cierra al hacer click */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky md:top-0 h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900
          text-white transition-all duration-300 z-50 flex flex-col
          ${isMobileOpen ? 'left-0' : '-left-full md:left-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header del sidebar */}
        <div className="p-4 border-b border-emerald-700 flex items-center justify-between flex-shrink-0">
          {!isCollapsed && (
            <Link to="/" onClick={handleLinkClick} className="hover:opacity-80 transition-opacity">
              <img src="/assets/images/logo-full.png" alt="e-colector" className="h-10 object-contain brightness-0 invert" />
            </Link>
          )}
          {isCollapsed && (
            <Link to="/" onClick={handleLinkClick} className="mx-auto hover:opacity-80 transition-opacity">
              <img src="/assets/images/logo-icon.png" alt="e-colector" className="h-10 w-10 object-contain" />
            </Link>
          )}
          {/* Cerrar en móvil / colapsar en escritorio */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                closeMobile();
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors flex-shrink-0"
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Info del usuario */}
        {!isCollapsed && userName && (
          <div className="px-4 py-3 border-b border-emerald-700 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
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

        {/* Badge nuevos materiales */}
        {!isCollapsed && newMaterials > 0 && (
          <div className="mx-4 mt-3 p-3 bg-emerald-700/50 rounded-lg border border-emerald-600 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{newMaterials} nuevos</p>
              <p className="text-xs text-emerald-200">materiales en tu zona</p>
            </div>
          </div>
        )}

        {/* Navegación principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                ${isActive(item.path)
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Divisor */}
        <div className="px-4">
          <div className="h-px bg-emerald-700" />
        </div>

        {/* Navegación secundaria */}
        <nav className="px-3 py-3 space-y-1 flex-shrink-0">
          {secondaryItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm
                ${isActive(item.path)
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-emerald-200 hover:bg-emerald-700/50 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Redes sociales */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-emerald-700 flex items-center gap-3 flex-shrink-0">
            <a
              href="https://www.instagram.com/ecolector62"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-emerald-300 hover:text-white transition-colors rounded"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.youtube.com/@e-colector"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-emerald-300 hover:text-white transition-colors rounded"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Cerrar sesión */}
        <div className={`p-3 border-t border-emerald-700 flex-shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm
              ${isCollapsed ? 'p-2' : 'w-full justify-center px-4 py-2'}
            `}
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

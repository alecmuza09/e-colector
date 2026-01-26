import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, isAuthenticated } = useAuth();
  const isAdmin = userRole === 'admin';

  const navItems = [
    { label: 'Inicio', icon: Home, path: '/' },
    { label: 'Explorar Mapa', icon: Map, path: '/explorar' },
    { label: 'Publicar', icon: Plus, path: '/publicar' },
    { label: 'Mensajes', icon: MessageCircle, path: '/mensajes' },
    { label: 'Favoritos', icon: Heart, path: '/favoritos' },
  ];

  const secondaryItems = [
    ...(isAdmin ? [{ label: 'Administración', icon: Shield, path: '/perfil' }] : []),
    { label: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
    { label: 'Perfil', icon: User, path: '/perfil' },
    { label: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Toggle Button - Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay - Mobile (No se cierra al click) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky md:top-0 h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white transition-all duration-300 z-40 flex flex-col
          ${isOpen ? 'left-0' : '-left-full md:left-0'}
          ${isCollapsed ? 'w-24' : 'w-64 md:w-80'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-emerald-700 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {/* Logo Image */}
              <img src="/assets/images/logo.svg" alt="e-colector" className="w-12 h-12 object-contain" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-1 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-b border-emerald-700">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-emerald-300" />
              <input
                type="text"
                placeholder="Buscar material..."
                className="w-full pl-10 pr-4 py-2 bg-emerald-700/50 border border-emerald-600 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Notifications Badge */}
        {!isCollapsed && (
          <div className="mx-6 mt-4 p-3 bg-emerald-700/50 rounded-lg border border-emerald-600 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">3 nuevos</p>
              <p className="text-xs text-emerald-200">materiales en tu zona</p>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-emerald-600 shadow-lg scale-105'
                  : 'hover:bg-emerald-700/50 text-emerald-100'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.label === 'Mensajes' && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      2
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="px-4">
          <div className="h-px bg-emerald-700"></div>
        </div>

        {/* Secondary Navigation */}
        <nav className="px-4 py-4 space-y-2">
          {secondaryItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                ${isActive(item.path)
                  ? 'bg-emerald-600'
                  : 'hover:bg-emerald-700/50 text-emerald-200'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-emerald-700 space-y-3">
            <div className="bg-emerald-700/50 rounded-lg p-3">
              <p className="text-xs text-emerald-200 mb-2">Impacto Ambiental</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-emerald-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 w-3/4"></div>
                </div>
                <span className="text-xs font-bold text-emerald-300">75%</span>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await logout();
                } finally {
                  navigate('/login');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className="p-4 flex justify-center">
            <button
              onClick={async () => {
                try {
                  await logout();
                } finally {
                  navigate('/login');
                }
              }}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;


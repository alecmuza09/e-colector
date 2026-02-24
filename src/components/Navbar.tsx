import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, Bell, Menu, X, User, LogOut, LogIn, UserPlus, LayoutDashboard, Heart, MapPin, Plus, Search, Instagram, Youtube } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, logout, userName } = useAuth();
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: "Nueva oferta", message: "Oferta por PET recibida", time: "5m", unread: true },
    { id: 2, title: "Mensaje", message: "Juan te envió un mensaje", time: "1h", unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-white via-white to-emerald-50 border-b border-gray-200 sticky top-0 z-50 shadow-sm dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">♻️</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:inline">e-colector</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            <Link 
              to="/explorar" 
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <MapPin size={18} />
              <span>Explorar</span>
            </Link>
            
            <Link 
              to="/publicar" 
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus size={18} />
              <span>Publicar</span>
            </Link>
          </div>

          {/* Social Links */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="https://www.instagram.com/ecolector62"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
              title="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.youtube.com/@e-colector"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Favoritos */}
                <Link 
                  to="/favoritos"
                  className="relative text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Mis favoritos"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Notificaciones */}
                <div className="relative">
                  <button 
                    className="relative text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notificaciones"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notificaciones</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notification => (
                          <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${notification.unread ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{notification.title}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notification.message}</p>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">{notification.time}</span>
                            </div>
                          </div>
                        )) : <p className="text-xs text-gray-500 dark:text-gray-400 px-4 py-4 text-center">Sin notificaciones</p>}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                        <Link to="/" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold" onClick={() => setShowNotifications(false)}>
                          Ver todas →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel */}
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  title="Mi panel"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>

                {/* Perfil */}
                <div className="relative group border-l border-gray-300 dark:border-gray-700 pl-3">
                  <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">{userName || 'Usuario'}</span>
                  </button>
                  <div className="absolute right-0 w-56 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName || 'Usuario'}</p>
                    </div>
                    <Link to="/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      👤 Mi Perfil
                    </Link>
                    <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      📊 Mi Panel
                    </Link>
                    <Link to="/favoritos" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      ❤️ Favoritos
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link 
              to="/publicar"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
              title="Publicar"
            >
              <Plus className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700 space-y-2 px-2">
            <Link to="/explorar" className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
              🗺️ Explorar Mapa
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <a href="https://www.instagram.com/ecolector62" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-pink-500 text-sm font-medium">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <a href="https://www.youtube.com/@e-colector" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 text-sm font-medium">
                <Youtube className="h-4 w-4" /> YouTube
              </a>
            </div>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
                  📊 Mi Panel
                </Link>
                <Link to="/perfil" className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
                  👤 Mi Perfil
                </Link>
                <Link to="/favoritos" className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
                  ❤️ Favoritos
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm">
                  🚪 Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="block w-full px-3 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm text-center" onClick={() => setIsMenuOpen(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
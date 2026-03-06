import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Zap,
  Moon,
  Globe,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  CheckCircle,
  X,
  Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminConsole from './admin/AdminConsole';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types/user';
import { Link } from 'react-router-dom';

export default function Configuracion() {
  const { userRole, userProfile, refreshProfile, isAuthenticated, loading, user } = useAuth();

  // Panel administrativo SOLO para admin
  if (userRole === UserRole.ADMIN) {
    return <AdminConsole />;
  }

  // Si está autenticado pero no existe perfil en public.users
  if (!loading && isAuthenticated && !userProfile) {
    const isAdminEmail = (user?.email || '').toLowerCase() === 'alec.muza@capacit.io';
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Configuración no disponible</h1>
          <p className="text-gray-600 mt-2">
            Tu sesión está iniciada, pero no existe tu fila en <code>public.users</code>. Sin perfil no podemos cargar tus ajustes.
          </p>
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-semibold">Email:</span> {user?.email || '—'}
            </div>
            <div>
              <span className="font-semibold">Auth UID:</span> {user?.id || '—'}
            </div>
          </div>
          {isAdminEmail && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm">
              Ejecuta <code>supabase-create-admin.sql</code> en Supabase para crear/actualizar tu perfil admin.
            </div>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={refreshProfile} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Reintentar
            </button>
            <Link to="/perfil" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-center">
              Ir a Perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [saveLocation, setSaveLocation] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  useEffect(() => {
    if (!userProfile) return;
    setFormData((prev) => ({
      ...prev,
      name: userProfile.full_name || '',
      email: userProfile.email || '',
      phone: userProfile.phone_number || '',
      location: userProfile.city || '',
    }));
    // Perfil privado = public_profile false
    setPrivateProfile(userProfile.public_profile === false);
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.name,
        phone_number: formData.phone || null,
        city: formData.location || null,
        public_profile: !privateProfile,
      })
      .eq('id', userProfile.id);
    if (error) {
      alert(error.message || 'Error guardando cambios');
      return;
    }
    await refreshProfile();
    alert('Cambios guardados');
  };

  const notificationSettings = [
    {
      icon: Mail,
      title: 'Notificaciones por Email',
      description: 'Recibe actualizaciones por correo electrónico',
      enabled: emailNotifications,
      toggle: setEmailNotifications,
    },
    {
      icon: Bell,
      title: 'Notificaciones Push',
      description: 'Alertas en tiempo real en tu navegador',
      enabled: pushNotifications,
      toggle: setPushNotifications,
    },
    {
      icon: Lock,
      title: 'Perfil Privado',
      description: 'Solo usuarios verificados pueden ver tu perfil',
      enabled: privateProfile,
      toggle: setPrivateProfile,
    },
    {
      icon: MapPin,
      title: 'Guardar Ubicación',
      description: 'Permitir acceso a tu ubicación para mejorar búsquedas',
      enabled: saveLocation,
      toggle: setSaveLocation,
    },
  ];

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setPwError(null);
    if (pwForm.newPassword.length < 8) {
      setPwError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Las contraseñas no coinciden.');
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    setPwLoading(false);
    if (error) {
      setPwError(error.message || 'Error al cambiar la contraseña.');
      return;
    }
    setPwSuccess(true);
    setPwForm({ newPassword: '', confirmPassword: '' });
    setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false); }, 3000);
  };

  const preferences = [
    {
      icon: Moon,
      title: 'Tema Oscuro',
      description: 'Usar tema oscuro en toda la aplicación',
      enabled: darkMode,
      toggle: setDarkMode,
    },
    {
      icon: Globe,
      title: 'Idioma',
      description: 'Español',
      action: 'Cambiar',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-emerald-600" />
          Configuración
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">👤 Perfil</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full md:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Notificaciones y Privacidad
          </h2>

          <div className="space-y-4">
            {notificationSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div
                  key={setting.title}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{setting.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setting.toggle(!setting.enabled)}
                    className={`transition-colors ${
                      setting.enabled ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {setting.enabled ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-600" />
            Seguridad
          </h2>

          <div className="space-y-3">
            {/* Cambiar contraseña */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Contraseña</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cambiar tu contraseña de acceso</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPasswordForm(v => !v); setPwError(null); setPwSuccess(false); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {showPasswordForm ? 'Cancelar' : 'Cambiar'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-4 space-y-3">
                  {pwSuccess ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Contraseña actualizada correctamente.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nueva contraseña</label>
                        <div className="relative">
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            value={pwForm.newPassword}
                            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button type="button" onClick={() => setShowNewPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirmar nueva contraseña</label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? 'text' : 'password'}
                            value={pwForm.confirmPassword}
                            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                            placeholder="Repite la nueva contraseña"
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {pwError && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs">
                          <X className="w-3.5 h-3.5 flex-shrink-0" /> {pwError}
                        </div>
                      )}
                      <button
                        onClick={handleChangePassword}
                        disabled={pwLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        {pwLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {pwLoading ? 'Guardando...' : 'Guardar contraseña'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sesiones activas — placeholder */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sesiones Activas</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Administra tus dispositivos conectados</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 italic">Próximamente</span>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600" />
            Preferencias
          </h2>

          <div className="space-y-3">
            {preferences.map((pref) => {
              const Icon = pref.icon;
              return (
                <div
                  key={pref.title}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{pref.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pref.description}
                      </p>
                    </div>
                  </div>
                  {pref.enabled !== undefined ? (
                    <button
                      onClick={() => pref.toggle && pref.toggle(!pref.enabled)}
                      className={`transition-colors ${
                        pref.enabled ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {pref.enabled ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                      {pref.action}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
            ⚠️ Zona de Peligro
          </h2>

          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Borrar Todos mis Datos
            </button>
            <button className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Desactivar Cuenta
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
            Estas acciones no se pueden deshacer. Por favor, ten cuidado.
          </p>
        </div>
      </div>
    </div>
  );
}


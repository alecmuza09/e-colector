import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Zap,
  Moon,
  Globe,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminConsole from './admin/AdminConsole';
import { supabase } from '../lib/supabase';

export default function Configuracion() {
  const { userRole, userProfile, refreshProfile } = useAuth();

  // Panel administrativo SOLO para admin
  if (userRole === 'admin') {
    return <AdminConsole />;
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

  const securityOptions = [
    {
      icon: Lock,
      title: 'Contraseña',
      description: 'Cambiar tu contraseña',
      action: 'Cambiar',
    },
    {
      icon: Zap,
      title: 'Autenticación de Dos Factores',
      description: 'Añade una capa extra de seguridad',
      action: 'Configurar',
    },
    {
      icon: Eye,
      title: 'Sesiones Activas',
      description: 'Administra tus dispositivos conectados',
      action: 'Ver',
    },
  ];

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
            {securityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.title}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{option.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                    {option.action}
                  </button>
                </div>
              );
            })}
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


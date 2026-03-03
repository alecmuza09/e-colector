import { useAuth } from '../../context/AuthContext';
import { Shield, Settings, CheckCircle, UserCog, LayoutDashboard, Users, Award, Boxes, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { to: '/configuracion', icon: LayoutDashboard, label: 'Dashboard',      desc: 'Resumen general de la plataforma',      color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'     },
  { to: '/configuracion', icon: Users,           label: 'Usuarios',       desc: 'Gestionar y crear cuentas',             color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'  },
  { to: '/configuracion', icon: Boxes,           label: 'Contenido',      desc: 'Publicaciones y actividad reciente',    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
  { to: '/configuracion', icon: TrendingUp,      label: 'Estadísticas',   desc: 'Crecimiento de los últimos 14 días',    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'   },
  { to: '/configuracion', icon: Award,           label: 'Recompensas',    desc: 'Configurar puntos y niveles',           color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'       },
];

export default function AdminProfile() {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-7">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <p className="text-red-200 text-sm font-medium uppercase tracking-wide">Super Administrador</p>
            <h1 className="text-2xl font-bold mt-0.5">{userProfile?.full_name || 'Administrador'}</h1>
            <p className="text-red-200 text-sm mt-1">{userProfile?.email}</p>
          </div>
          {userProfile?.is_verified && (
            <div className="ml-auto flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" /> Verificado
            </div>
          )}
        </div>
      </div>

      {/* Info de cuenta */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
          <UserCog className="w-4 h-4 text-red-600" /> Información de cuenta
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: 'Nombre completo', value: userProfile?.full_name },
            { label: 'Email',           value: userProfile?.email     },
            { label: 'Teléfono',        value: userProfile?.phone_number },
            { label: 'Ciudad',          value: userProfile?.city      },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{value || <span className="text-gray-400">—</span>}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos al panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-red-600" /> Panel de administración
          </h2>
          <Link
            to="/configuracion"
            className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Abrir panel completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${color}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs opacity-75 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

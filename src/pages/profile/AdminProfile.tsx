import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Settings, CheckCircle, UserCog, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import RewardRulesAdmin from '../../components/admin/RewardRulesAdmin';

export default function AdminProfile() {
  const { userProfile } = useAuth();
  const [showRewards, setShowRewards] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Perfil de Super Admin</h1>
            <p className="text-red-100 mt-1">{userProfile?.full_name || 'Administrador'}</p>
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
        <p className="text-gray-700">
          <strong>🛡️ Rol: Super Administrador</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Para el panel administrativo completo (usuarios y métricas) entra a{' '}
          <Link to="/configuracion" className="text-red-700 font-semibold hover:underline">
            Configuración
          </Link>
          .
        </p>
      </div>

      {/* Info de cuenta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-red-600" /> Información de cuenta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Nombre</div>
            <div className="font-medium text-gray-900">{userProfile?.full_name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium text-gray-900">{userProfile?.email || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Teléfono</div>
            <div className="font-medium text-gray-900">{userProfile?.phone_number || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Ciudad</div>
            <div className="font-medium text-gray-900">{userProfile?.city || '—'}</div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-5 h-5 ${userProfile?.is_verified ? 'text-green-600' : 'text-gray-300'}`} />
            <span className="text-sm text-gray-700">
              {userProfile?.is_verified ? 'Cuenta verificada' : 'Cuenta no verificada'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Accesos rápidos</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/configuracion"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              <Settings className="w-4 h-4" /> Abrir panel administrativo
            </Link>
          </div>
        </div>
      </div>

      {/* Sistema de Puntos y Recompensas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowRewards((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Sistema de Puntos y Recompensas
          </span>
          {showRewards ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showRewards && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mt-4 mb-6">
              Configura cuántos puntos gana cada usuario por cada acción, y los umbrales de cada nivel.
              Los cambios se aplican de inmediato a todos los usuarios en la sección de Estadísticas.
            </p>
            <RewardRulesAdmin />
          </div>
        )}
      </div>
    </div>
  );
}

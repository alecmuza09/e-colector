import { useAuth } from '../../context/AuthContext';
import { Shield, Settings, CheckCircle, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminProfile() {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 mb-6">
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

      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
        <p className="text-gray-700">
          <strong>🛡️ Rol: Super Administrador</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Aquí ves tu información de cuenta. Para el panel administrativo (usuarios y métricas) entra a{' '}
          <Link to="/configuracion" className="text-red-700 font-semibold hover:underline">
            Configuración
          </Link>
          .
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
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
            <span className="text-sm text-gray-700">{userProfile?.is_verified ? 'Cuenta verificada' : 'Cuenta no verificada'}</span>
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
    </div>
  );
}

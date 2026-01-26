import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import BuyerProfile from './profile/BuyerProfile';
import SellerProfile from './profile/SellerProfile';
import CollectorProfile from './profile/CollectorProfile';
import AdminProfile from './profile/AdminProfile';
import { Link } from 'react-router-dom';

function Profile() {
  const { userRole, isAuthenticated, loading, userProfile, user, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Por favor inicia sesión para ver tu perfil.</p>
      </div>
    );
  }

  // Si el usuario está autenticado pero no existe su fila en public.users
  if (!userProfile) {
    const isAdminEmail = (user?.email || '').toLowerCase() === 'alec.muza@capacit.io';
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Perfil no encontrado</h1>
          <p className="text-gray-600 mt-2">
            Tu sesión está iniciada, pero **no existe tu perfil** en la tabla <code>public.users</code>. Sin ese registro,
            la app no puede saber tu rol (admin/comprador/vendedor/recolector).
          </p>

          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-semibold">Email:</span> {user?.email || '—'}
            </div>
            <div>
              <span className="font-semibold">Auth UID:</span> {user?.id || '—'}
            </div>
          </div>

          {isAdminEmail ? (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm">
              <div className="font-semibold mb-1">Para tu Super Admin</div>
              Ejecuta el script <code>supabase-create-admin.sql</code> en el SQL Editor de Supabase (esto crea/actualiza tu fila
              en <code>public.users</code> con <code>role='admin'</code>).
            </div>
          ) : (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm">
              Si tu cuenta se creó fuera del formulario de registro, debes crear tu fila en <code>public.users</code>. Si eres un
              usuario normal, lo más fácil es registrarte desde la app.
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={refreshProfile}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Reintentar cargar perfil
            </button>
            <Link
              to="/registro"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-center"
            >
              Ir a registro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar perfil según el rol
  switch (userRole) {
    case UserRole.BUYER:
      return <BuyerProfile />;
    case UserRole.SELLER:
      return <SellerProfile />;
    case UserRole.COLLECTOR:
      return <CollectorProfile />;
    case UserRole.ADMIN:
      return <AdminProfile />;
    default:
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Rol de usuario no reconocido</h1>
            <p className="text-gray-600 mt-2">
              Se cargó tu perfil, pero el rol no coincide con los valores permitidos. Revisa el campo <code>public.users.role</code>.
            </p>
            <div className="mt-4 text-sm text-gray-700">
              <span className="font-semibold">role:</span> {(userProfile as any)?.role || '—'}
            </div>
          </div>
        </div>
      );
  }
}

export default Profile; 
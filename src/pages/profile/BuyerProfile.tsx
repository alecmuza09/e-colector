import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingCart, Bell, MapPin, Building2, CheckCircle } from 'lucide-react';

const BuyerProfile = () => {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Comprador de Materiales</h1>
            <p className="text-blue-100 mt-1">Perfil de {userProfile?.full_name || 'Usuario'}</p>
          </div>
        </div>
      </div>

      {/* Descripción del Rol */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <p className="text-gray-700">
          <strong>🏭 Comprador de Materiales</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Busco comprar materiales reciclables a granel o en pequeñas cantidades para mi proceso industrial o comercial.
        </p>
      </div>

      {/* Información del Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Información Personal
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Nombre</label>
              <p className="font-medium">{userProfile?.full_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{userProfile?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Teléfono</label>
              <p className="font-medium">{userProfile?.phone_number || 'No proporcionado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Ciudad</label>
              <p className="font-medium">{userProfile?.city || 'No especificada'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Preferencias de Compra
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Categorías de Interés</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile?.profile_data?.materialCategoriesOfInterest?.map((cat: string, idx: number) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {cat}
                  </span>
                )) || <p className="text-gray-400">No especificadas</p>}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Volumen Preferido</label>
              <p className="font-medium">
                {userProfile?.profile_data?.purchaseVolumePreference === 'bulk' ? 'Granel' : 'Pequeñas cantidades'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Frecuencia</label>
              <p className="font-medium">
                {userProfile?.profile_data?.purchaseFrequency === 'regular' ? 'Regular' : 'Ocasional'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Estado de la Cuenta
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Compras Realizadas</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Ofertas Enviadas</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Materiales Favoritos</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded">
            {userProfile?.isVerified ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Verificado</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">-</div>
                <div className="text-sm text-gray-600">No Verificado</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Trash2, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';

const SellerProfile = () => {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Vendedor / Generador de Residuos</h1>
            <p className="text-emerald-100 mt-1">Perfil de {userProfile?.full_name || 'Usuario'}</p>
          </div>
        </div>
      </div>

      {/* Descripción del Rol */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded">
        <p className="text-gray-700">
          <strong>🏭 Vendedor / Generador de Residuos</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Genero residuos reciclables (plástico, cartón, metal, etc.) en mi hogar, negocio o industria y busco venderlos o que los recolecten.
        </p>
      </div>

      {/* Información del Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
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
            <Trash2 className="w-5 h-5 text-emerald-600" />
            Información de Generación
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Tipo de Generador</label>
              <p className="font-medium">
                {userProfile?.profile_data?.locationType === 'residential' ? 'Hogar' :
                 userProfile?.profile_data?.locationType === 'commercial' ? 'Negocio' :
                 userProfile?.profile_data?.locationType === 'industrial' ? 'Industria' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Materiales Generados</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile?.profile_data?.materialTypesGenerated?.map((mat: string, idx: number) => (
                  <span key={idx} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    {mat}
                  </span>
                )) || <p className="text-gray-400">No especificados</p>}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Frecuencia de Generación</label>
              <p className="font-medium">{userProfile?.profile_data?.generationFrequency || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Volumen Mensual Estimado</label>
              <p className="font-medium">
                {userProfile?.profile_data?.estimatedMonthlyVolumeKg 
                  ? `${userProfile.profile_data.estimatedMonthlyVolumeKg} kg`
                  : 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Estado de la Cuenta
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded">
            <div className="text-2xl font-bold text-emerald-600">0</div>
            <div className="text-sm text-gray-600">Publicaciones Activas</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded">
            <div className="text-2xl font-bold text-emerald-600">0</div>
            <div className="text-sm text-gray-600">Materiales Vendidos</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded">
            <div className="text-2xl font-bold text-emerald-600">0</div>
            <div className="text-sm text-gray-600">Ofertas Recibidas</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded">
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

export default SellerProfile;

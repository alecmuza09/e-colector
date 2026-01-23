import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Truck, MapPin, Clock, Shield, CheckCircle } from 'lucide-react';

const CollectorProfile = () => {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Recolector / Empresa de Reciclaje</h1>
            <p className="text-purple-100 mt-1">Perfil de {userProfile?.full_name || 'Usuario'}</p>
          </div>
        </div>
      </div>

      {/* Descripción del Rol */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded">
        <p className="text-gray-700">
          <strong>🚚 Recolector / Empresa de Reciclaje</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Ofrezco servicios de recolección, compra o procesamiento de materiales reciclables para particulares o empresas.
        </p>
      </div>

      {/* Información del Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Información de la Empresa
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
            <div>
              <label className="text-sm text-gray-500">Tipo de Negocio</label>
              <p className="font-medium">
                {userProfile?.profile_data?.businessType === 'independent' ? 'Recolector Independiente' :
                 userProfile?.profile_data?.businessType === 'company' ? 'Empresa Recicladora' :
                 userProfile?.profile_data?.businessType === 'collection_center' ? 'Centro de Acopio' : 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            Servicios Ofrecidos
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Materiales que Manejo</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile?.profile_data?.materialsHandled?.map((mat: string, idx: number) => (
                  <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {mat}
                  </span>
                )) || <p className="text-gray-400">No especificados</p>}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Zonas de Cobertura</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile?.profile_data?.serviceCoverageAreas?.map((zone: string, idx: number) => (
                  <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {zone}
                  </span>
                )) || <p className="text-gray-400">No especificadas</p>}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Horario de Operación</label>
              <p className="font-medium">{userProfile?.profile_data?.operatingSchedule || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Certificaciones</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile?.profile_data?.certifications?.map((cert: string, idx: number) => (
                  <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {cert}
                  </span>
                )) || <p className="text-gray-400">No especificadas</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Estado de la Cuenta
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Recolecciones Realizadas</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Clientes Activos</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Materiales Procesados</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
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

export default CollectorProfile;

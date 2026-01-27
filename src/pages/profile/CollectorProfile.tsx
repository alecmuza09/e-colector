import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Truck, Shield, CheckCircle, Loader, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { Product } from '../../data/mockProducts';

const CollectorProfile = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      setLoading(true);
      setProductsError(null);
      try {
        // Compatibilidad: si la columna image_urls no existe en tu DB aún, reintentamos sin ella
        const selectWithImages =
          'id,title,description,price,currency,location,municipality,address,category,tags,image_url,image_urls,latitude,longitude,verified,type,created_at,status,user_id';
        const selectWithoutImages =
          'id,title,description,price,currency,location,municipality,address,category,tags,image_url,latitude,longitude,verified,type,created_at,status,user_id';

        let data: any[] | null = null;
        let error: any = null;
        {
          const r = await supabase
            .from('products')
            .select(selectWithImages)
            .eq('user_id', userProfile.id)
            .order('created_at', { ascending: false })
            .limit(20);
          data = r.data as any;
          error = r.error;
        }
        if (error && String(error.message || '').toLowerCase().includes('image_urls')) {
          const r2 = await supabase
            .from('products')
            .select(selectWithoutImages)
            .eq('user_id', userProfile.id)
            .order('created_at', { ascending: false })
            .limit(20);
          data = r2.data as any;
          error = r2.error;
        }
        if (error) throw error;

        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          title: p.title,
          description: p.description,
          price: Number(p.price),
          currency: p.currency || 'MXN',
          location: p.location || '',
          municipality: (p.municipality as any) || 'Monterrey',
          address: p.address || '',
          category: (p.category as any) || 'Otros',
          tags: p.tags || [],
          imageUrl: (p.image_urls && p.image_urls[0]) || p.image_url || '',
          imageUrls: p.image_urls || (p.image_url ? [p.image_url] : []),
          latitude: p.latitude || 25.6866,
          longitude: p.longitude || -100.3161,
          verified: !!p.verified,
          type: p.type,
          createdAt: p.created_at,
          status: p.status,
        })) as Product[];
        setMyProducts(mapped);
      } catch (e) {
        console.error('Error loading collector products:', e);
        setProductsError('No se pudieron cargar tus publicaciones. Revisa que tu tabla `products` tenga la columna `image_urls` o ejecuta el update de schema.');
        setMyProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userProfile?.id]);

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

      {/* Mis publicaciones */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Mis publicaciones
          </h2>
          <Link
            to="/publicar"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium"
          >
            Publicar material
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
            Cargando publicaciones...
          </div>
        ) : productsError ? (
          <div className="py-6 text-center">
            <div className="inline-block text-left bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded-lg text-sm">
              {productsError}
            </div>
          </div>
        ) : myProducts.length === 0 ? (
          <div className="py-8 text-center text-gray-600">
            Aún no tienes publicaciones. <Link to="/publicar" className="text-purple-700 font-semibold hover:underline">Crea la primera</Link>.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myProducts.map((p) => (
              <div key={p.id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/listado/${p.id}`} className="font-semibold text-gray-900 hover:underline">
                    {p.title}
                  </Link>
                  <div className="text-sm text-gray-600 flex flex-wrap gap-3 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {p.municipality}
                    </span>
                    <span className="text-gray-500">{p.status}</span>
                    {p.createdAt && <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString('es-MX')}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-purple-700 font-bold">
                    {p.type === 'donacion' || p.price === 0 ? 'Gratis' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: p.currency }).format(p.price)}
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-1">
                    <Link to={`/listado/${p.id}`} className="text-sm text-purple-700 hover:underline">
                      Ver ficha
                    </Link>
                    <Link to={`/publicar/${p.id}`} className="text-sm text-purple-700 hover:underline font-semibold">
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorProfile;

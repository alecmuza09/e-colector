import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Trash2, MapPin, DollarSign, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { Product } from '../../data/mockProducts';

const SellerProfile = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [offersReceivedCount, setOffersReceivedCount] = useState(0);

  const productIds = useMemo(() => myProducts.map((p) => p.id), [myProducts]);

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const { count: cActive } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id)
          .eq('status', 'activo');
        setActiveCount(cActive || 0);

        const { count: cSold } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id)
          .eq('status', 'vendido');
        setSoldCount(cSold || 0);

        const { data: products, error: prodErr } = await supabase
          .from('products')
          .select('id,title,description,price,currency,location,municipality,address,category,tags,image_url,image_urls,latitude,longitude,verified,type,created_at,status,user_id')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (prodErr) throw prodErr;
        const mapped = (products || []).map((p: any) => ({
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
          imageUrls: p.image_urls || [],
          latitude: p.latitude || 25.6866,
          longitude: p.longitude || -100.3161,
          verified: !!p.verified,
          type: p.type,
          createdAt: p.created_at,
          status: p.status,
        })) as Product[];
        setMyProducts(mapped);

        if (mapped.length > 0) {
          const ids = mapped.map((x) => x.id);
          const { count: cOffers } = await supabase
            .from('offers')
            .select('id', { count: 'exact', head: true })
            .in('product_id', ids);
          setOffersReceivedCount(cOffers || 0);
        } else {
          setOffersReceivedCount(0);
        }
      } catch (e) {
        console.error('Error loading seller profile stats:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userProfile?.id]);

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
            <div className="text-2xl font-bold text-emerald-600">{loading ? '—' : activeCount}</div>
            <div className="text-sm text-gray-600">Publicaciones Activas</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded">
            <div className="text-2xl font-bold text-emerald-600">{loading ? '—' : soldCount}</div>
            <div className="text-sm text-gray-600">Materiales Vendidos</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded">
            <div className="text-2xl font-bold text-emerald-600">{loading ? '—' : offersReceivedCount}</div>
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

      {/* Mis publicaciones */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Mis publicaciones
          </h2>
          <Link
            to="/publicar"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium"
          >
            Publicar material
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
            Cargando publicaciones...
          </div>
        ) : myProducts.length === 0 ? (
          <div className="py-8 text-center text-gray-600">
            Aún no tienes publicaciones. <Link to="/publicar" className="text-emerald-700 font-semibold hover:underline">Crea la primera</Link>.
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
                  <div className="text-emerald-700 font-bold">
                    {p.type === 'donacion' || p.price === 0 ? 'Gratis' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: p.currency }).format(p.price)}
                  </div>
                  <Link to={`/listado/${p.id}`} className="text-sm text-emerald-700 hover:underline">
                    Ver ficha
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;

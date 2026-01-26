import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Users, Package, Calendar, MessageCircle, Heart, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

type TimeRange = 'mes' | 'trimestre' | 'año';

type ProductMini = {
  id: string;
  category: string;
  created_at: string;
  status: string;
};

export default function Estadisticas() {
  const { isAuthenticated, userProfile, userRole } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('mes');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<ProductMini[]>([]);
  const [offersCount, setOffersCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const startDate = useMemo(() => {
    const now = new Date();
    const d = new Date(now);
    if (timeRange === 'mes') d.setDate(now.getDate() - 30);
    if (timeRange === 'trimestre') d.setDate(now.getDate() - 90);
    if (timeRange === 'año') d.setDate(now.getDate() - 365);
    return d.toISOString();
  }, [timeRange]);

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        // Productos: para vendedor/collector/admin se muestran los suyos (admin ve global por RLS policy)
        if (userRole === 'seller' || userRole === 'collector' || userRole === 'admin') {
          let q = supabase.from('products').select('id,category,created_at,status').gte('created_at', startDate);
          if (userRole !== 'admin') q = q.eq('user_id', userProfile.id);
          const { data, error } = await q;
          if (error) throw error;
          setProducts((data || []) as any);
        } else {
          setProducts([]);
        }

        // Favoritos (siempre del usuario)
        const { count: favCount, error: favErr } = await supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id);
        if (favErr) throw favErr;
        setFavoritesCount(favCount || 0);

        // Mensajes (siempre del usuario)
        const { count: msgCount, error: msgErr } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .or(`sender_id.eq.${userProfile.id},receiver_id.eq.${userProfile.id}`)
          .gte('created_at', startDate);
        if (msgErr) throw msgErr;
        setMessagesCount(msgCount || 0);

        // Ofertas: buyer = propias, seller/admin = las visibles por RLS (seller ve ofertas de sus productos)
        let offersQ = supabase.from('offers').select('id', { count: 'exact', head: true }).gte('created_at', startDate);
        if (userRole === 'buyer') offersQ = offersQ.eq('buyer_id', userProfile.id);
        const { count: offCount, error: offErr } = await offersQ;
        if (offErr) throw offErr;
        setOffersCount(offCount || 0);
      } catch (e) {
        console.error('Error loading stats:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userProfile?.id, userRole, startDate, userProfile]);

  const publicationsCount = products.length;
  const activePublicationsCount = products.filter((p) => p.status === 'activo').length;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) || 0) + 1);
    return Array.from(map.entries())
      .map(([name, publications]) => ({ name, publications }))
      .sort((a, b) => b.publications - a.publications);
  }, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">📊 Estadísticas</h1>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['mes', 'trimestre', 'año'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {range === 'mes' ? 'Este Mes' : range === 'trimestre' ? 'Este Trimestre' : 'Este Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm text-center">
            <h2 className="text-xl font-bold text-gray-900">Estadísticas</h2>
            <p className="text-gray-600 mt-2">Inicia sesión para ver estadísticas.</p>
            <Link to="/login" className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Ir a Login
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* KPIs reales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Publicaciones</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{publicationsCount}</p>
                    <p className="text-sm text-gray-500 mt-2">Activas: {activePublicationsCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ofertas</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{offersCount}</p>
                    <p className="text-sm text-gray-500 mt-2">En el período seleccionado</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                    <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mensajes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{messagesCount}</p>
                    <p className="text-sm text-gray-500 mt-2">En el período seleccionado</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Favoritos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{favoritesCount}</p>
                    <p className="text-sm text-gray-500 mt-2">Total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Publicaciones por categoría (real) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
                Publicaciones por Categoría
              </h2>

              {byCategory.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No hay publicaciones en este período.</p>
              ) : (
                <div className="space-y-4">
                  {byCategory.map((cat) => {
                    const max = Math.max(...byCategory.map((c) => c.publications), 1);
                    return (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                              {cat.publications} publicaciones
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            style={{ width: `${(cat.publications / max) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nota de datos */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                Nota
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Estas estadísticas se calculan en tiempo real desde Supabase. Métricas como “vistas” o “contactos” requieren un sistema de tracking adicional
                (aún no implementado).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


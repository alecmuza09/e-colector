import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Truck, CheckCircle, ShieldCheck, MessageSquare,
  Package, Loader, AlertCircle, Calendar, Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getMyCollectorStocks } from '../../services/products';
import { Product } from '../../data/mockProducts';

interface CollectorUser {
  id: string;
  full_name: string;
  email: string;
  city: string | null;
  is_verified: boolean;
  created_at: string;
  profile_picture_url: string | null;
  profile_data: {
    bio?: string;
    zones?: string[];
    vehicle?: string;
    materials?: string[];
  } | null;
}

const categoryEmoji: Record<string, string> = {
  PET: '♳', Cartón: '📦', Metal: '🔩', Vidrio: '🍶',
  Electrónicos: '💻', Papel: '📄', HDPE: '♴', Otros: '♻️',
};

const RecolectorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collector, setCollector] = useState<CollectorUser | null>(null);
  const [stocks, setStocks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email, city, is_verified, created_at, profile_picture_url, profile_data')
        .eq('id', id)
        .eq('role', 'collector')
        .single();

      if (userError || !data) {
        setError('Perfil de recolector no encontrado.');
        setLoading(false);
        return;
      }

      setCollector(data as CollectorUser);
      const stocksData = await getMyCollectorStocks(data.id);
      setStocks(stocksData);
    } catch {
      setError('Error al cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error || !collector) {
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{error || 'Perfil no encontrado.'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 hover:underline">← Volver</button>
      </div>
    );
  }

  const pd = collector.profile_data || {};
  const initials = collector.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tarjeta principal del perfil */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
          {collector.profile_picture_url ? (
            <img
              src={collector.profile_picture_url}
              alt={collector.full_name}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-emerald-200"
            />
          ) : (
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-grow">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{collector.full_name}</h1>
              {collector.is_verified && (
                <ShieldCheck className="w-5 h-5 text-blue-500" title="Recolector verificado" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              {collector.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {collector.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Desde {new Date(collector.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
              </span>
              {collector.is_verified && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Verificado
                </span>
              )}
            </div>
          </div>
          <Link
            to="/mensajes"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            Contactar
          </Link>
        </div>

        {pd.bio && (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
            {pd.bio}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {pd.zones && pd.zones.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Zonas de operación
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {pd.zones.map((zone: string) => (
                  <span key={zone} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs">
                    {zone}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pd.materials && pd.materials.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                Materiales
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {pd.materials.map((mat: string) => (
                  <span key={mat} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs">
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pd.vehicle && (
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-500" />
                Vehículo
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{pd.vehicle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stocks disponibles */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-500" />
          Stocks disponibles ({stocks.length})
        </h2>

        {stocks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
            <Package className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Este recolector no tiene stocks publicados actualmente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map(stock => (
              <Link
                key={stock.id}
                to={`/listado/${stock.id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryEmoji[stock.category] || '♻️'}</span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{stock.category}</p>
                      {stock.municipality && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {stock.municipality}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{stock.title}</p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {stock.price > 0 ? `$${stock.price.toFixed(2)} MXN` : 'A negociar'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecolectorProfile;

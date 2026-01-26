import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MapPin, Clock, Shield, Trash2, Grid2X2, List, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

type FavoriteRow = {
  id: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    category: string;
    price: number;
    currency: string;
    location: string | null;
    image_url: string | null;
    verified: boolean;
    type: 'venta' | 'donacion';
  } | null;
};

const categoryEmoji: Record<string, string> = {
  PET: '🧴',
  Cartón: '📦',
  Vidrio: '🍾',
  Metal: '🥫',
  Electrónicos: '💻',
  Papel: '📄',
  HDPE: '🧼',
  Otros: '♻️',
};

export default function Favoritos() {
  const { userProfile, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'fecha' | 'precio' | 'nombre'>('fecha');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);

  const loadFavorites = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id,created_at,product:product_id(id,title,category,price,currency,location,image_url,verified,type)')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFavorites((data || []) as any);
    } catch (e) {
      console.error('Error loading favorites:', e);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userProfile) return;
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const f of favorites) {
      if (f.product?.category) cats.add(f.product.category);
    }
    return ['todos', ...Array.from(cats)];
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    const items = favorites
      .filter((fav) => fav.product)
      .filter((fav) => filterCategory === 'todos' || fav.product?.category === filterCategory)
      .sort((a, b) => {
        const ap = a.product!;
        const bp = b.product!;
        if (sortBy === 'precio') return Number(ap.price) - Number(bp.price);
        if (sortBy === 'nombre') return ap.title.localeCompare(bp.title);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    return items;
  }, [favorites, filterCategory, sortBy]);

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
    if (error) {
      alert(error.message || 'No se pudo eliminar de favoritos');
      return;
    }
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold text-gray-900">Favoritos</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para ver tus favoritos.</p>
          <Link to="/login" className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            Ir a Login
          </Link>
        </div>
      </div>
    );
  }

  const ProductCard = ({ fav }: { fav: FavoriteRow }) => {
    const product = fav.product!;
    const emoji = categoryEmoji[product.category] || '♻️';
    const priceText =
      product.type === 'donacion' || Number(product.price) === 0 ? 'Gratis' : `$${Number(product.price).toFixed(2)} ${product.currency || 'MXN'}`;
    return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="relative h-24 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center overflow-hidden">
        <button
          onClick={() => removeFavorite(fav.id)}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
          title="Quitar de favoritos"
        >
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </button>
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{product.title}</h3>
          <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
            {product.category}
          </span>
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{priceText}</div>

        {/* Info */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{product.location || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(fav.created_at).toLocaleDateString('es-MX')}</span>
          </div>
          {product.verified && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Verificado</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link
            to={`/listado/${product.id}`}
            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm text-center"
          >
            Ver detalle
          </Link>
          <button
            onClick={() => removeFavorite(fav.id)}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
            title="Quitar de favoritos"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">❤️ Favoritos</h1>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {filteredFavorites.length} productos
          </span>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-emerald-200 dark:border-emerald-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'todos' ? 'Todas' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="fecha">Más recientes</option>
              <option value="precio">Precio (menor a mayor)</option>
              <option value="nombre">Nombre (A-Z)</option>
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vista
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Grid2X2 className="w-5 h-5 mx-auto text-emerald-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                  viewMode === 'list'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <List className="w-5 h-5 mx-auto text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Loader className="w-6 h-6 animate-spin text-emerald-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Cargando favoritos...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No hay favoritos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Agrega productos a favoritos para verlos aquí
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredFavorites.map((fav) => (
              viewMode === 'grid' ? (
                <ProductCard key={fav.id} fav={fav} />
              ) : (
                <div
                  key={fav.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-700 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{categoryEmoji[fav.product!.category] || '♻️'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{fav.product!.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                          {fav.product!.category}
                        </span>
                        <MapPin className="w-4 h-4" />
                        <span>{fav.product!.location || '—'}</span>
                        {fav.product!.verified && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Shield className="w-4 h-4" />
                            Verificado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {fav.product!.type === 'donacion' || Number(fav.product!.price) === 0
                        ? 'Gratis'
                        : `$${Number(fav.product!.price).toFixed(2)}`}
                    </div>
                    <Link
                      to={`/listado/${fav.product!.id}`}
                      className="mt-2 inline-block px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


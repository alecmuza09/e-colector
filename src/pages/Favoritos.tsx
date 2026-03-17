import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, MapPin, DollarSign, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFavorite } from '../services/favorites';
import { Product } from '../data/mockProducts';

const categoryEmoji: Record<string, string> = {
  PET: '♳', Cartón: '📦', Metal: '🔩', Vidrio: '🍶',
  Electrónicos: '💻', Papel: '📄', HDPE: '♴', Otros: '♻️',
};

export default function Favoritos() {
  const { userProfile, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userProfile?.id) {
      setLoading(false);
      return;
    }
    loadFavorites();
  }, [isAuthenticated, userProfile?.id]);

  const loadFavorites = async () => {
    setLoading(true);
    const data = await getFavorites(userProfile!.id);
    setFavorites(data);
    setLoading(false);
  };

  const handleRemove = async (productId: string) => {
    if (!userProfile?.id) return;
    setRemovingId(productId);
    await removeFavorite(userProfile.id, productId);
    setFavorites(prev => prev.filter(p => p.id !== productId));
    setRemovingId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Heart className="h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Inicia sesión para ver tus favoritos</h2>
        <Link to="/login" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Favoritos</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Listings guardados para acceder rápidamente.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Cargando favoritos...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin favoritos todavía</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
            Guarda publicaciones que te interesen tocando el botón ❤️ en cualquier listing.
          </p>
          <Link
            to="/explorar"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
          >
            Explorar materiales
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{favorites.length}</span> publicación{favorites.length !== 1 ? 'es' : ''} guardada{favorites.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map(product => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 dark:bg-gray-900/80 text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 dark:text-gray-200">
                      {categoryEmoji[product.category] || '♻️'} {product.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(product.id)}
                    disabled={removingId === product.id}
                    title="Quitar de favoritos"
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-900/80 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {removingId === product.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{product.municipality || product.location || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm mb-4">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {product.type === 'donacion' || product.price === 0
                        ? 'Gratis / Donación'
                        : `$${product.price.toFixed(2)} MXN`}
                    </span>
                  </div>
                  <Link
                    to={`/listado/${product.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    Ver publicación
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

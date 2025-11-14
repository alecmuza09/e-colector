import React, { useState } from 'react';
import { Heart, MapPin, Clock, Shield, Trash2, Grid2X2, List } from 'lucide-react';

interface FavoriteProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  seller: string;
  image: string;
  verified: boolean;
  addedDate: string;
  emoji: string;
}

export default function Favoritos() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'fecha' | 'precio' | 'nombre'>('fecha');
  const [filterCategory, setFilterCategory] = useState<string>('todos');

  const favorites: FavoriteProduct[] = [
    {
      id: '1',
      title: 'Botellas PET Premium',
      category: 'PET',
      price: 2.5,
      location: 'Monterrey',
      seller: 'Juan García',
      image: '🧴',
      verified: true,
      addedDate: '2025-11-13',
      emoji: '🧴',
    },
    {
      id: '2',
      title: 'Cartón ondulado',
      category: 'Cartón',
      price: 1.8,
      location: 'San Nicolás',
      seller: 'María López',
      image: '📦',
      verified: true,
      addedDate: '2025-11-12',
      emoji: '📦',
    },
    {
      id: '3',
      title: 'Latas de aluminio',
      category: 'Metal',
      price: 8.5,
      location: 'Apodaca',
      seller: 'Carlos Ruiz',
      image: '🥫',
      verified: false,
      addedDate: '2025-11-10',
      emoji: '🥫',
    },
    {
      id: '4',
      title: 'Vidrio transparente',
      category: 'Vidrio',
      price: 0.5,
      location: 'Guadalupe',
      seller: 'Ana Martínez',
      image: '🫙',
      verified: true,
      addedDate: '2025-11-09',
      emoji: '🫙',
    },
    {
      id: '5',
      title: 'Periódico y papel',
      category: 'Papel',
      price: 0.3,
      location: 'Escobedo',
      seller: 'Pedro González',
      image: '📰',
      verified: true,
      addedDate: '2025-11-08',
      emoji: '📰',
    },
    {
      id: '6',
      title: 'Componentes electrónicos',
      category: 'Electrónicos',
      price: 15.0,
      location: 'San Pedro',
      seller: 'Laura Sánchez',
      image: '💻',
      verified: true,
      addedDate: '2025-11-07',
      emoji: '💻',
    },
  ];

  const categories = ['todos', ...new Set(favorites.map(f => f.category))];

  const filteredFavorites = favorites
    .filter(fav => filterCategory === 'todos' || fav.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'precio') return a.price - b.price;
      if (sortBy === 'nombre') return a.title.localeCompare(b.title);
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    });

  const ProductCard = ({ product }: { product: FavoriteProduct }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="relative h-24 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center overflow-hidden">
        <button className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </button>
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{product.emoji}</div>
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
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          ${product.price.toFixed(2)} MXN
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{product.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(product.addedDate).toLocaleDateString('es-MX')}</span>
          </div>
          {product.verified && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Verificado</span>
            </div>
          )}
        </div>

        {/* Seller */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Vendedor:</span> {product.seller}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm">
            Contactar
          </button>
          <button className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

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
        {filteredFavorites.length === 0 ? (
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
            {filteredFavorites.map((product) => (
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-700 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{product.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                          {product.category}
                        </span>
                        <MapPin className="w-4 h-4" />
                        <span>{product.location}</span>
                        {product.verified && (
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
                      ${product.price.toFixed(2)}
                    </div>
                    <button className="mt-2 px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Contactar
                    </button>
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


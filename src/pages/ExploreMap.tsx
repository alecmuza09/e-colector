import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Product } from '../data/mockProducts';
import { getProducts } from '../services/products';
import { Filter, Search, X, MapPin, DollarSign, CheckCircle, Heart, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

// Coordenadas aproximadas del centro del Área Metropolitana de Monterrey
const MONTERREY_CENTER: L.LatLngExpression = [25.6866, -100.3161];

// Mapeo de categorías a colores con emojis
const categoryColors: Record<Product['category'], { color: string; emoji: string }> = {
  'PET': { color: '#3B82F6', emoji: '🧴' },
  'Cartón': { color: '#ca8a04', emoji: '📦' },
  'Vidrio': { color: '#10B981', emoji: '🍾' },
  'Metal': { color: '#EF4444', emoji: '🥫' },
  'Electrónicos': { color: '#6B7280', emoji: '💻' },
  'Papel': { color: '#4B5563', emoji: '📂' },
  'HDPE': { color: '#0284C7', emoji: '🧼' },
  'Otros': { color: '#A855F7', emoji: '📌' }
};
const CATEGORIES = ['Todos', ...Object.keys(categoryColors)] as const;

// Función para crear iconos de marcador personalizados SVG
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    html: `<div class="flex flex-col items-center">
      <div style="background-color: ${color}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 20px; border: 3px solid white;">
        ${emoji}
      </div>
      <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid ${color}; margin-top: -2px;"></div>
    </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48]
  });
};

// Componente para ajustar límites del mapa
function ChangeView({ markers }: { markers: Product[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      try {
        const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        } else {
          console.warn("Bounds no válidas generadas para los marcadores");
          map.setView(MONTERREY_CENTER, 12);
        }
      } catch (error) {
        console.error("Error calculando o ajustando bounds:", error);
        map.setView(MONTERREY_CENTER, 12);
      }
    } else {
      map.setView(MONTERREY_CENTER, 12);
    }
  }, [markers, map]);
  return null;
}

// Componente para ProductCard mejorado
const ProductCard: React.FC<{ product: Product; isFavorite: boolean; onFavorite: () => void }> = ({ product, isFavorite, onFavorite }) => {
  const category = categoryColors[product.category];
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
      {/* Imagen con overlay */}
      <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-40">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {product.verified && (
            <div className="bg-emerald-500 rounded-full p-1 shadow-md" title="Verificado">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={onFavorite}
            className={`rounded-full p-1.5 shadow-md transition-colors ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white'
            }`}
            title="Agregar a favoritos"
          >
            <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
          {product.type === 'venta' ? '💰 Venta' : '🎁 Donación'}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-3 space-y-2">
        {/* Categoría con emoji */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{category.emoji}</span>
          <span 
            className="text-xs font-semibold px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: category.color }}
          >
            {product.category}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-sm dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400">
          {product.title}
        </h3>

        {/* Precio */}
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
          <DollarSign className="w-4 h-4" />
          {formatPrice(product.price, product.currency)}
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{product.location}</span>
        </div>

        {/* Botón CTA */}
        <Link
          to={`/listado/${product.id}`}
          className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 text-center text-sm mt-2 block"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
};

const ExploreMapLeaflet = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['Todos']);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar productos desde Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Filtrado mejorado
  const filteredProducts = useMemo(() => {
    let results = products;

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      results = results.filter(p => p.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return results;
  }, [products, selectedCategory, searchTerm]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(price);
  };

  const handleResetFilters = () => {
    setSelectedCategory('Todos');
    setSearchTerm('');
    setActiveFilters(['Todos']);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full bg-gray-100 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Panel de Búsqueda y Filtros - MEJORADO */}
      <div className="sticky top-0 lg:relative w-full lg:w-96 bg-white dark:bg-gray-800 shadow-lg lg:shadow-lg lg:h-full lg:overflow-y-auto z-50 lg:z-40 border-b lg:border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-4">
          {/* Header del panel */}
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="font-bold text-lg dark:text-white">Filtros</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Buscador Destacado */}
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar material, ubicación, empresa…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 transition-all text-sm font-medium"
            />
          </div>

          {/* Filtros Activos (Chips) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Categorías
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveFilters([cat]);
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-white shadow-md scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat !== 'Todos' && <span>{categoryColors[cat as keyof typeof categoryColors]?.emoji}</span>}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</label>
            <div className="flex gap-2">
              {(['venta', 'donacion'] as const).map(type => (
                <button
                  key={type}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-medium transition-all hover:border-emerald-500 dark:hover:border-emerald-500 dark:text-white"
                >
                  {type === 'venta' ? '💰 Venta' : '🎁 Donación'}
                </button>
              ))}
            </div>
          </div>

          {/* Información de Resultados */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              <span className="text-lg font-bold">{filteredProducts.length}</span> resultado{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
              {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
            </p>
          </div>

          {/* Botón Resetear Filtros */}
          {(searchTerm || selectedCategory !== 'Todos') && (
            <button
              onClick={handleResetFilters}
              className="w-full py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}

          {/* Selector de Vista - Móvil */}
          <div className="lg:hidden flex gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🗺️ Mapa
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              📋 Lista
            </button>
          </div>

          {/* Lista de Productos - Solo en móvil o vista lista */}
          {(viewMode === 'list' || window.innerWidth >= 1024) && (
            <div className="hidden lg:block space-y-3 pt-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Productos encontrados</h3>
              <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.slice(0, 5).map(product => (
                    <Link
                      key={product.id}
                      to={`/listado/${product.id}`}
                      className="block p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors group"
                    >
                      <div className="flex gap-2">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {product.title}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatPrice(product.price, product.currency)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center py-4">Sin resultados</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mapa o Lista */}
      <div className="flex-1 relative">
        {(viewMode === 'map' || window.innerWidth >= 1024) && (
          <MapContainer
            center={MONTERREY_CENTER}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredProducts.map((product) => {
              if (!categoryColors[product.category]) return null;

              const { color, emoji } = categoryColors[product.category];
              const customIcon = createCustomIcon(color, emoji);

              if (isNaN(product.latitude) || isNaN(product.longitude)) {
                console.warn(`Posición inválida para producto ${product.id}`);
                return null;
              }

              return (
                <Marker
                  key={product.id}
                  position={[product.latitude, product.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => toggleSelectProduct(product.id)
                  }}
                >
                  <Popup minWidth={280}>
                    <div className="text-sm space-y-2">
                      <img src={product.imageUrl} alt={product.title} className="w-full h-32 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold text-base text-gray-900">{product.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-600 font-bold text-lg">{formatPrice(product.price, product.currency)}</span>
                        {product.verified && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verificado</span>}
                      </div>
                      <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {product.location}</p>
                      {product.address && (
                        <p className="text-gray-500 text-xs">
                          {product.address}
                        </p>
                      )}
                      <Link to={`/listado/${product.id}`} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-center block text-xs">
                        Ver detalles completos
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            <ChangeView markers={filteredProducts} />
          </MapContainer>
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && window.innerWidth < 1024 && (
          <div className="p-4 space-y-3 overflow-y-auto h-full">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favorites.has(product.id)}
                    onFavorite={() => toggleFavorite(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Sin resultados</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Prueba con diferentes filtros</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón Favoritos Sticky - Desktop */}
      {favorites.size > 0 && window.innerWidth >= 1024 && (
        <button className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 z-40">
          <Heart className="w-5 h-5" fill="currentColor" />
          {favorites.size}
        </button>
      )}
    </div>
  );
};

export default ExploreMapLeaflet; 
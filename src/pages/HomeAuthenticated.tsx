import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Product } from '../data/mockProducts';
import { getProducts } from '../services/products';
import { MapPin, Zap, TrendingUp, Heart, MessageCircle, Clock, Shield, Search, Loader, Package, PlusCircle } from 'lucide-react';

const MONTERREY_CENTER: L.LatLngExpression = [25.6866, -100.3161];

const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width:24px; height:24px; drop-shadow(0 1px 1px rgba(0,0,0,0.4));"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const categoryColors: Record<Product['category'], string> = {
  'PET': '#3B82F6',
  'Cartón': '#ca8a04',
  'Vidrio': '#10B981',
  'Metal': '#EF4444',
  'Electrónicos': '#9333ea',
  'Papel': '#8B5CF6',
  'HDPE': '#06B6D4',
  'Otros': '#6B7280'
};

export default function HomeAuthenticated() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Productos más cercanos/recientes
  const nearbyProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
      .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 6);
  }, [products, selectedCategory, searchTerm]);

  // Estadísticas rápidas
  const stats = [
    { icon: Package, label: 'Productos Cercanos', value: nearbyProducts.length, color: 'emerald' },
    { icon: TrendingUp, label: 'Activos Hoy', value: products.length.toString(), color: 'teal' },
    { icon: Clock, label: 'Últimas 24h', value: products.length.toString(), color: 'blue' },
    { icon: Shield, label: 'Verificados', value: nearbyProducts.length > 0 ? `${Math.floor(nearbyProducts.filter(p => p.verified).length / nearbyProducts.length * 100)}%` : '0%', color: 'green' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Quick Stats + Publicar */}
      <div className="bg-white dark:bg-gray-800 border-b border-emerald-200 dark:border-emerald-700 sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorBg = {
              emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
              teal: 'bg-teal-100 dark:bg-teal-900/30',
              blue: 'bg-blue-100 dark:bg-blue-900/30',
              green: 'bg-green-100 dark:bg-green-900/30',
            }[stat.color];

            const colorText = {
              emerald: 'text-emerald-600',
              teal: 'text-teal-600',
              blue: 'text-blue-600',
              green: 'text-green-600',
            }[stat.color];

            return (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorBg}`}>
                  <Icon className={`w-5 h-5 ${colorText}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{stat.value}</p>
                </div>
              </div>
            );
          })}
          </div>
          <Link
            to="/publicar"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Publicar
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar Material
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar PET, Cartón, Metal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Todos">Todas</option>
                {Object.keys(categoryColors).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 overflow-hidden shadow-lg">
          <div className="h-96 md:h-[500px]">
            <MapContainer center={MONTERREY_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {nearbyProducts.map((product) => (
                <Marker
                  key={product.id}
                  position={[product.latitude, product.longitude]}
                  icon={createCustomIcon(categoryColors[product.category])}
                >
                  <Popup>
                    <div className="text-sm font-semibold">{product.title}</div>
                    <div className="text-xs text-gray-600">{product.municipality}</div>
                    <div className="text-sm font-bold text-emerald-600 mt-1">${product.price}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📍 Productos Cercanos ({nearbyProducts.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No hay productos disponibles en esta búsqueda</p>
              </div>
            ) : (
              nearbyProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="relative h-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center overflow-hidden">
                    <button className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {product.category === 'PET' && '🧴'}
                      {product.category === 'Cartón' && '📦'}
                      {product.category === 'Vidrio' && '🫙'}
                      {product.category === 'Metal' && '🥫'}
                      {product.category === 'Electrónicos' && '💻'}
                      {product.category === 'Papel' && '📰'}
                      {product.category === 'HDPE' && '🪣'}
                      {product.category === 'Otros' && '♻️'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{product.title}</h3>
                      <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                        {product.category}
                      </span>
                    </div>

                    {/* Price & Status */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.verified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Shield className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Verificado</span>
                        </div>
                      )}
                    </div>

                    {/* Location & Info */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{product.municipality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{product.quantity} unidades</span>
                      </div>
                    </div>

                    {/* Seller & Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Vendedor:</span> {product.seller}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/listado/${product.id}`)}
                          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          Contactar
                        </button>
                        <button
                          onClick={() => navigate(`/listado/${product.id}`)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              {[
                { time: 'Hace 5 min', action: '📍 Nuevo PET publicado en Monterrey', user: 'Juan G.' },
                { time: 'Hace 15 min', action: '💬 Recibiste un mensaje', user: 'María L.' },
                { time: 'Hace 1h', action: '✅ Transacción completada', user: 'Sistema' },
                { time: 'Hace 3h', action: '❤️ Alguien guardó tu producto', user: 'Anónimo' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="pt-1">
                    <span className="text-lg">{item.action.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {item.time} • {item.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tu Actividad
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Publicaciones Este Mes', value: '12', icon: '📝' },
                { label: 'Mensajes Sin Leer', value: '3', icon: '💬' },
                { label: 'Contactos Recibidos', value: '8', icon: '👥' },
                { label: 'Impacto Ambiental', value: '2.4T', icon: '🌍' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.label}</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for Package icon
function Package(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m0 0C5.306 7.867 3.75 9.233 3.75 10.5m16.5-4.125C18.694 7.867 20.25 9.233 20.25 10.5" />
    </svg>
  );
}


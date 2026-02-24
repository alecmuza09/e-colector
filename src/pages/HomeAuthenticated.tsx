import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Product } from '../data/mockProducts';
import { getProducts } from '../services/products';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, TrendingUp, Heart, MessageCircle, Clock, Shield,
  Search, Loader, PlusCircle, Package, Filter, ArrowRight,
  Tag, CheckCircle,
} from 'lucide-react';

const MEXICO_CENTER: L.LatLngExpression = [25.6866, -100.3161];

const createCustomIcon = (color: string) =>
  L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width:22px;height:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4))"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  });

const categoryColors: Record<Product['category'], string> = {
  PET: '#3B82F6', Cartón: '#ca8a04', Vidrio: '#10B981',
  Metal: '#EF4444', Electrónicos: '#9333ea', Papel: '#8B5CF6',
  HDPE: '#06B6D4', Otros: '#6B7280',
};

const categoryEmoji: Record<string, string> = {
  PET: '🧴', Cartón: '📦', Vidrio: '🫙', Metal: '🥫',
  Electrónicos: '💻', Papel: '📰', HDPE: '🪣', Otros: '♻️',
};

const formatPrice = (price: number, type: string) => {
  if (type === 'donacion' || price === 0) return 'Gratis';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
};

export default function HomeAuthenticated() {
  const { userName, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then(data => { setProducts(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return products
      .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
      .filter(p =>
        !searchTerm ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.municipality.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, selectedCategory, searchTerm]);

  const stats = useMemo(() => [
    { label: 'Disponibles', value: products.length, icon: Package, color: 'emerald' },
    { label: 'Verificados', value: products.filter(p => p.verified).length, icon: CheckCircle, color: 'green' },
    { label: 'Donaciones', value: products.filter(p => p.type === 'donacion').length, icon: Heart, color: 'pink' },
    { label: 'Categorías', value: Object.keys(categoryColors).length, icon: Tag, color: 'blue' },
  ], [products]);

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    green:   'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    pink:    'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── WELCOME BANNER ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900 dark:to-teal-900 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              ¡Hola, {userName || 'bienvenido'}! 👋
            </h1>
            <p className="text-emerald-100 mt-1 text-sm md:text-base">
              Hay <strong>{products.length}</strong> materiales disponibles en la plataforma ahora mismo.
            </p>
          </div>
          <Link
            to="/publicar"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 font-semibold rounded-xl shadow-md hover:bg-emerald-50 transition-all duration-200 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Publicar Material
          </Link>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── BÚSQUEDA Y FILTROS ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por material, categoría o municipio..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="Todos">Todas las categorías</option>
                {Object.keys(categoryColors).map(c => (
                  <option key={c} value={c}>{categoryEmoji[c]} {c}</option>
                ))}
              </select>
            </div>
          </div>
          {(searchTerm || selectedCategory !== 'Todos') && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <span><strong>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
                className="text-emerald-600 hover:underline text-xs"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* ── MAPA ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Mapa de materiales
            </h2>
            <Link to="/explorar" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              Ver mapa completo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-72 md:h-96">
            <MapContainer center={MEXICO_CENTER} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {filtered.map(p =>
                !isNaN(p.latitude) && !isNaN(p.longitude) ? (
                  <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={createCustomIcon(categoryColors[p.category] || '#6B7280')}
                    eventHandlers={{ click: () => navigate(`/listado/${p.id}`) }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.municipality} · {p.category}</p>
                        <p className="text-emerald-700 font-bold mt-1">{formatPrice(p.price, p.type)}</p>
                        <button
                          onClick={() => navigate(`/listado/${p.id}`)}
                          className="mt-2 w-full text-xs bg-emerald-600 text-white py-1 rounded hover:bg-emerald-700 transition"
                        >
                          Ver detalle →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </div>

        {/* ── CATEGORÍAS RÁPIDAS ── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Explorar por categoría</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {Object.keys(categoryColors).map(cat => {
              const count = products.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'Todos' : cat)}
                  className={`flex flex-col items-center p-3 rounded-xl text-center transition-all duration-150 border
                    ${selectedCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                >
                  <span className="text-xl mb-0.5">{categoryEmoji[cat]}</span>
                  <span className="text-xs font-medium truncate w-full">{cat}</span>
                  <span className={`text-xs mt-0.5 ${selectedCategory === cat ? 'text-emerald-100' : 'text-gray-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GRID DE PRODUCTOS ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Materiales disponibles
              <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length})</span>
            </h2>
            <Link to="/explorar" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sin resultados para los filtros aplicados.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.slice(0, 12).map(product => (
                <Link
                  key={product.id}
                  to={`/listado/${product.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all duration-200 group flex flex-col"
                >
                  {/* Imagen / ícono */}
                  <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                    {product.imageUrl && !product.imageUrl.includes('placehold') ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {categoryEmoji[product.category] || '♻️'}
                      </span>
                    )}
                    {product.verified && (
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verificado
                      </span>
                    )}
                    <span
                      className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: (categoryColors[product.category] || '#6B7280') + '20', color: categoryColors[product.category] || '#6B7280' }}
                    >
                      {product.category}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{product.municipality}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3">
                      <span className={`text-lg font-bold ${product.type === 'donacion' ? 'text-green-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {formatPrice(product.price, product.type)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.type === 'donacion' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {product.type === 'donacion' ? 'Donación' : 'Venta'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length > 12 && (
            <div className="text-center mt-6">
              <Link
                to="/explorar"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md"
              >
                Ver los {filtered.length - 12} materiales restantes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* ── ACCIONES RÁPIDAS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6">
          {[
            { to: '/publicar', emoji: '📦', title: 'Publicar material', desc: 'Comparte lo que tienes disponible para venta o donación.', cta: 'Publicar ahora' },
            { to: '/explorar', emoji: '🗺️', title: 'Explorar el mapa', desc: 'Encuentra materiales cerca de ti con el mapa interactivo.', cta: 'Abrir mapa' },
            { to: '/mensajes', emoji: '💬', title: 'Mis mensajes', desc: 'Revisa tus conversaciones y ofertas recibidas.', cta: 'Ver mensajes' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{item.desc}</p>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                {item.cta} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

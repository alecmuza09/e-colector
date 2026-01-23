import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L, { Layer, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Product } from '../data/mockProducts';
import { getProducts } from '../services/products';
import { Filter, MapPin, Package, Search, CheckCircle, Layers, Info, Eye } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import HomeAuthenticated from './HomeAuthenticated';

// --- Constantes y Funciones de Utilidad --- //
const MONTERREY_CENTER: L.LatLngExpression = [25.6866, -100.3161];
const categoryColors: Record<Product['category'], string> = {
  'PET': '#3B82F6', 'Cartón': '#ca8a04', 'Vidrio': '#10B981', 
  'Metal': '#EF4444', 'Electrónicos': '#9333ea', 'Otros': '#6B7280' // Ajustar colores si es necesario
};
const CATEGORIES = ['Todos', ...Object.keys(categoryColors)] as const;

// Municipios del área metropolitana
const MUNICIPALITIES = [
    'Todos', 'Monterrey', 'San Nicolás de los Garza', 'San Pedro Garza García',
    'Guadalupe', 'Apodaca', 'Escobedo', 'Santa Catarina'
] as const;
type Municipality = typeof MUNICIPALITIES[number];

// --- PLACEHOLDER GeoJSON Data --- 
// ¡REEMPLAZAR CON DATOS GEOJSON REALES DE LOS MUNICIPIOS!
const geoJsonData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // Ejemplo Monterrey (Coordenadas FALSAS - solo un cuadrado pequeño)
    { type: 'Feature', properties: { name: 'Monterrey' }, geometry: { type: 'Polygon', coordinates: [[[-100.30, 25.67], [-100.32, 25.67], [-100.32, 25.69], [-100.30, 25.69], [-100.30, 25.67]]] } },
    // Ejemplo San Nicolás (Coordenadas FALSAS)
    { type: 'Feature', properties: { name: 'San Nicolás de los Garza' }, geometry: { type: 'Polygon', coordinates: [[[-100.28, 25.72], [-100.30, 25.72], [-100.30, 25.74], [-100.28, 25.74], [-100.28, 25.72]]] } },
     // Ejemplo San Pedro (Coordenadas FALSAS)
    { type: 'Feature', properties: { name: 'San Pedro Garza García' }, geometry: { type: 'Polygon', coordinates: [[[-100.35, 25.65], [-100.37, 25.65], [-100.37, 25.67], [-100.35, 25.67], [-100.35, 25.65]]] } },
    // Añadir placeholders similares para Guadalupe, Apodaca, Escobedo, Santa Catarina
     { type: 'Feature', properties: { name: 'Guadalupe' }, geometry: { type: 'Polygon', coordinates: [[[-100.23, 25.69], [-100.25, 25.69], [-100.25, 25.71], [-100.23, 25.71], [-100.23, 25.69]]] } },
     { type: 'Feature', properties: { name: 'Apodaca' }, geometry: { type: 'Polygon', coordinates: [[[-100.18, 25.77], [-100.20, 25.77], [-100.20, 25.79], [-100.18, 25.79], [-100.18, 25.77]]] } },
     { type: 'Feature', properties: { name: 'Escobedo' }, geometry: { type: 'Polygon', coordinates: [[[-100.31, 25.79], [-100.33, 25.79], [-100.33, 25.81], [-100.31, 25.81], [-100.31, 25.79]]] } },
     { type: 'Feature', properties: { name: 'Santa Catarina' }, geometry: { type: 'Polygon', coordinates: [[[-100.44, 25.66], [-100.46, 25.66], [-100.46, 25.68], [-100.44, 25.68], [-100.44, 25.66]]] } },
  ]
};
// --- Fin Placeholders GeoJSON ---

const createCustomIcon = (color: string, isHovered: boolean) => {
  const scale = isHovered ? 1.3 : 1; // Ajustar escala si se desea
  const shadow = isHovered ? 'drop-shadow(0 0 4px rgba(0,0,0,0.6))' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))';
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width:${20*scale}px; height:${20*scale}px; filter:${shadow}; transition: all 0.2s ease;"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`,
    className: 'custom-leaflet-icon-small', // Clase diferente para posible tamaño distinto
    iconSize: [20 * scale, 20 * scale],
    iconAnchor: [10 * scale, 20 * scale],
    popupAnchor: [0, -20 * scale]
  });
};

const formatPrice = (price: number, currency: string, type: Product['type']) => {
    if (type === 'donacion' || price === 0) {
        return <span className="text-green-600 font-semibold">Gratis</span>;
    }
    // Forzar MXN ya que los datos son de MTY
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
};

// --- Componente Tarjeta de Producto (Sin cambios importantes) --- //
const ProductCard = ({ product, isHovered, onHover }: { 
    product: Product; 
    isHovered: boolean;
    onHover: (id: string | null) => void;
}) => {
    const categoryColor = categoryColors[product.category] || '#6B7280';
    const priceDisplay = formatPrice(product.price, product.currency, product.type);

    return (
        <Link 
            to={`/listado/${product.id}`} 
            className={`bg-white rounded-lg shadow overflow-hidden group transition-all duration-200 ease-in-out hover:shadow-xl flex flex-col ${isHovered ? 'ring-2 ring-emerald-400' : 'border border-gray-100'}`}
            onMouseEnter={() => onHover(product.id)}
            onMouseLeave={() => onHover(null)}
        >
             <div className="relative">
                <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: categoryColor + '20', color: categoryColor }}>{product.category}</span>
                {product.verified && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={12}/> Verificado</span>
                )}
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-semibold text-base text-gray-800 mb-1 group-hover:text-emerald-600 truncate" title={product.title}>{product.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />{product.location} {/* Usar location que es más descriptivo */} 
                </div>
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                    <span className="text-base font-bold text-emerald-700">{priceDisplay}</span>
                    <span className="text-xs text-gray-500 uppercase font-medium">{product.type === 'donacion' ? 'Donación' : 'Venta'}</span>
                </div>
                 <div className="mt-2">
                     <span className="block w-full text-center bg-gray-100 text-gray-700 py-1.5 rounded text-xs font-medium group-hover:bg-emerald-50 group-hover:text-emerald-700 transition">Ver detalles</span>
                </div>
            </div>
        </Link>
    );
};

// --- Componente Mapa con Ajuste de Vista y GeoJSON --- //
function MapViewUpdater({ markers, hoveredMarkerId, setMapInstance, selectedCity }: { 
    markers: Product[]; 
    hoveredMarkerId: string | null; 
    setMapInstance: React.Dispatch<React.SetStateAction<L.Map | null>>;
    selectedCity: Municipality;
}) {
    const map = useMap();
    
    // Llamar a setMapInstance solo una vez cuando el mapa esté disponible
    useEffect(() => { 
        if (map) { 
            setMapInstance(map); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [map]); // Quitar setMapInstance de las dependencias para evitar bucles

    // Ajustar bounds
    useEffect(() => {
        // Asegurarse de que map esté definido antes de usarlo
        if (!map) return; 
        
        if (markers.length > 0) {
            try {
                const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds.pad(0.1), { animate: true, maxZoom: 15 });
                } else {
                    map.setView(MONTERREY_CENTER, 11, { animate: true });
                }
            } catch (error) {
                console.error("Error ajustando bounds:", error);
                map.setView(MONTERREY_CENTER, 11, { animate: true });
            }
        } else {
             // Si no hay marcadores pero hay ciudad seleccionada, intentar hacer zoom a la ciudad
            if (selectedCity !== 'Todos' && map.eachLayer) {
                 let cityFound = false;
                 map.eachLayer(layer => {
                     // Asumimos que las capas GeoJSON tienen la propiedad feature y getBounds
                     const feature = (layer as any).feature;
                     // Comprobar si es una capa con feature, nombre coincide y tiene getBounds
                     if (feature && feature.properties && feature.properties.name === selectedCity && typeof (layer as any).getBounds === 'function') {
                         // Usar aserción de tipo para getBounds
                         map.fitBounds((layer as L.FeatureGroup).getBounds().pad(0.1), { animate: true });
                         cityFound = true;
                     }
                 });
                 if (!cityFound) map.setView(MONTERREY_CENTER, 11, { animate: true });
            } else {
                 map.setView(MONTERREY_CENTER, 11, { animate: true });
            }
        }
    }, [markers, map, selectedCity]); 

    return null;
}

// --- Componente Leyenda --- //
const Legend = () => (
    <div className="absolute bottom-2 right-2 z-[1000] bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs">
        <h4 className="font-semibold mb-2 text-center">Categorías</h4>
        <ul className="space-y-1">
            {Object.entries(categoryColors).map(([category, color]) => (
                <li key={category} className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                    {category}
                </li>
            ))}
        </ul>
    </div>
);

// --- Componente Principal Home --- //
const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedCity, setSelectedCity] = useState<Municipality>('Todos'); // Estado para ciudad seleccionada
    const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null); 
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [hoveredCity, setHoveredCity] = useState<string | null>(null); // Estado para ciudad en hover
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Filtrar productos basado en categoría, ciudad y búsqueda
    const filteredListings = useMemo(() => {
        let processedListings = [...products];

        if (selectedCategory !== 'Todos') {
            processedListings = processedListings.filter(p => p.category === selectedCategory);
        }
        if (selectedCity !== 'Todos') {
            processedListings = processedListings.filter(p => p.municipality === selectedCity);
        }
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            processedListings = processedListings.filter(p => 
                p.title.toLowerCase().includes(lowerSearch) ||
                p.location.toLowerCase().includes(lowerSearch) ||
                p.address.toLowerCase().includes(lowerSearch) ||
                p.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
            );
        }
        return processedListings;
    }, [products, selectedCategory, selectedCity, searchTerm]);
    
    const handleCardHover = (productId: string | null) => {
        setHoveredMarkerId(productId);
    };

    // --- Funciones para GeoJSON --- //
    const geoJsonStyle = (feature?: GeoJSON.Feature): L.PathOptions => {
        const isHovered = feature?.properties?.name === hoveredCity;
        const isSelected = feature?.properties?.name === selectedCity;
        return {
            fillColor: isSelected ? '#a7f3d0' : isHovered ? '#d1fae5' : '#e5e7eb',
            weight: isSelected ? 2 : 1,
            opacity: 1,
            color: isSelected ? '#059669' : isHovered ? '#10b981' : '#9ca3af',
            fillOpacity: isHovered || isSelected ? 0.6 : 0.3
        };
    };

    const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
        if (feature.properties && feature.properties.name) {
            const cityName = feature.properties.name as Municipality;
            layer.bindTooltip(cityName, { sticky: true, direction: 'top', opacity: 0.8 });
            
            layer.on({
                mouseover: (e: LeafletMouseEvent) => {
                    setHoveredCity(cityName);
                    const targetLayer = e.target as L.Path;
                    if (targetLayer.setStyle) targetLayer.setStyle({ weight: 2 }); // Resaltar borde en hover
                    // L.DomUtil.addClass(targetLayer._path, 'geojson-hover');
                },
                mouseout: (e: LeafletMouseEvent) => {
                    setHoveredCity(null);
                    const targetLayer = e.target as L.Path;
                     // Resetear estilo usando GeoJSON component (que re-evalúa geoJsonStyle)
                     // OJO: Esto podría no ser suficiente si el estilo base no se reaplica solo.
                     // Una forma más robusta sería guardar la instancia de GeoJSON y usar resetStyle(layer).
                    if (targetLayer.setStyle && feature.properties?.name !== selectedCity) { 
                        targetLayer.setStyle({ weight: 1 }); 
                    }
                    // L.DomUtil.removeClass(targetLayer._path, 'geojson-hover');
                },
                click: () => {
                    setSelectedCity(cityName);
                    // Asegurar que la capa tiene getBounds antes de llamarlo
                    if (typeof (layer as any).getBounds === 'function') {
                        mapInstance?.fitBounds((layer as L.FeatureGroup).getBounds().pad(0.1), { animate: true });
                    } else {
                         console.warn('La capa clickeada no tiene getBounds');
                         mapInstance?.setView(MONTERREY_CENTER, 12, {animate: true}); // Fallback
                    }
                }
            });
        }
    };

  const { isAuthenticated } = useAuth();

  // Si el usuario está autenticado, mostrar vista de dashboard
  if (isAuthenticated) {
    return <HomeAuthenticated />;
  }

  // Mostrar loading mientras se cargan los productos
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar la home pública
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <TopBar />
      
      <div className="bg-gradient-to-b from-emerald-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-900 dark:to-emerald-800 text-white pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="text-sm font-semibold">🌱 Conectando el futuro sostenible</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Marketplace de<br />Materiales <span className="text-emerald-100">Reciclables</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-2xl mx-auto leading-relaxed">
              Conecta recolectores, generadores y empresas recicladoras. Formaliza el comercio de materiales reciclables en el Área Metropolitana de Monterrey.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/publicar"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Package className="w-5 h-5" />
                Publicar Material Ahora
              </Link>
              <Link 
                to="/explorar"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/30"
              >
                <MapPin className="w-5 h-5" />
                Explorar Mapa Interactivo
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-16 pt-8 border-t border-white/20">
            {[
              { number: '7+', label: 'Municipios' },
              { number: '8', label: 'Categorías' },
              { number: `${products.length}`, label: 'Listados' },
              { number: '100%', label: 'Gratis' },
              { number: '24/7', label: 'Disponible' },
              { number: '♻️', label: 'Sostenible' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-xs md:text-sm text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BÚSQUEDA MEJORADA ============ */}
      <section className="relative -mt-8 mb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Buscar Material</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ej: PET, Cartón, Metal..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 transition-all text-base font-medium"
                  />
                </div>
              </div>

              {/* Filtro Ciudad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <select 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value as Municipality)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 appearance-none transition-all font-medium"
                  >
                    {MUNICIPALITIES.map(city => (
                      <option key={city} value={city}>{city === 'Todos' ? '📍 Todas las ciudades' : city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtro Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 appearance-none transition-all font-medium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags de resultados */}
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                📊 <strong>{filteredListings.length}</strong> resultado{filteredListings.length !== 1 ? 's' : ''} encontrado{filteredListings.length !== 1 ? 's' : ''}
              </span>
              {(searchTerm || selectedCity !== 'Todos' || selectedCategory !== 'Todos') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('Todos');
                    setSelectedCategory('Todos');
                  }}
                  className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============ MAPA INTERACTIVO ============ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🗺️ Explora por Región</h2>
            <p className="text-gray-600 dark:text-gray-400">Haz clic en cualquier municipio para ver los materiales disponibles</p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-200 dark:border-emerald-900/50 h-[50vh] md:h-[60vh]">
            <MapContainer 
              center={MONTERREY_CENTER}
              zoom={11} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON 
                key={selectedCity + hoveredCity} 
                data={geoJsonData} 
                style={geoJsonStyle} 
                onEachFeature={onEachFeature} 
              />
              {filteredListings.map((product) => {
                if (isNaN(product.latitude) || isNaN(product.longitude)) return null;
                const isHovered = hoveredMarkerId === product.id;
                const icon = createCustomIcon(categoryColors[product.category] || '#6B7280', isHovered);
                
                return (
                  <Marker
                    key={product.id}
                    position={[product.latitude, product.longitude]}
                    icon={icon}
                    zIndexOffset={isHovered ? 1000 : 0}
                    eventHandlers={{
                      mouseover: () => setHoveredMarkerId(product.id),
                      mouseout: () => setHoveredMarkerId(null),
                    }}
                  >
                    <Popup minWidth={280}>
                      <div className="space-y-2">
                        <img src={product.imageUrl} alt={product.title} className="w-full h-24 object-cover rounded"/>
                        <div>
                          <h3 className="font-bold text-sm mb-0.5 text-gray-900">{product.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-t border-gray-200">
                          <span className="text-emerald-700 font-bold">{formatPrice(product.price, product.currency, product.type)}</span>
                          {product.verified && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">✓ Verificado</span>}
                        </div>
                        <Link to={`/listado/${product.id}`} className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-center text-xs transition-colors">
                          Ver detalles completos →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
              <Legend />
              <MapViewUpdater markers={filteredListings} hoveredMarkerId={hoveredMarkerId} setMapInstance={setMapInstance} selectedCity={selectedCity} /> 
            </MapContainer>
          </div>
        </section>

        {/* ============ SECCIÓN DESTACADA: CATEGORÍAS ============ */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📦 Categorías Populares</h2>
            <p className="text-gray-600 dark:text-gray-400">Explora nuestras principales categorías de materiales reciclables</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
            {Object.entries(categoryColors).map(([category, color]) => {
              const categoryEmojis: Record<string, string> = {
                'PET': '🧴', 'Cartón': '📦', 'Vidrio': '🍾', 'Metal': '🥫',
                'Electrónicos': '💻', 'Papel': '📂', 'HDPE': '🧼', 'Otros': '📌'
              };
              const count = products.filter(p => p.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg ring-2 ring-offset-2 ring-emerald-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{categoryEmojis[category]}</div>
                  <div className="text-xs font-bold truncate">{category}</div>
                  <div className="text-xs opacity-75">{count}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============ GRID DE PRODUCTOS ============ */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">🏪 Listados Disponibles</h2>
              <p className="text-gray-600 dark:text-gray-400">Descubre miles de oportunidades en el Área Metropolitana</p>
            </div>
            <Link 
              to="/explorar"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Ver todo →
            </Link>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
              {filteredListings.slice(0, 8).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isHovered={hoveredMarkerId === product.id}
                  onHover={handleCardHover}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Search size={48} className="mx-auto mb-4 text-gray-400"/>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sin resultados</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Intenta con otros filtros o categorías</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('Todos');
                  setSelectedCategory('Todos');
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* ============ SECCIÓN CTA: BENEFICIOS ============ */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900 dark:to-teal-900 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-block mb-4 p-3 bg-white/20 rounded-full">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Visibilidad Total</h3>
                <p className="text-emerald-100">Alcanza a miles de compradores interesados en todo el Área Metropolitana</p>
              </div>
              <div className="text-center">
                <div className="inline-block mb-4 p-3 bg-white/20 rounded-full">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">100% Seguro</h3>
                <p className="text-emerald-100">Perfiles verificados y transacciones protegidas para tu tranquilidad</p>
              </div>
              <div className="text-center">
                <div className="inline-block mb-4 p-3 bg-white/20 rounded-full">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fácil de Usar</h3>
                <p className="text-emerald-100">Interfaz intuitiva para publicar, buscar y conectar con otros usuarios</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ INFORMACIÓN ÚTIL ============ */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">❓ Preguntas Frecuentes</h2>
            <p className="text-gray-600 dark:text-gray-400">Resuelve tus dudas en segundos</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: '¿Cómo publico un material?',
                a: 'Es simple: haz clic en "Publicar Material" en el navbar, completa los datos y ¡listo! Tu listado será visible en minutos.'
              },
              {
                q: '¿Es gratis usar la plataforma?',
                a: 'Sí, 100% gratis. No hay comisiones ni tarifas ocultas. Conecta directamente con otros usuarios.'
              },
              {
                q: '¿Cómo sé si un usuario es confiable?',
                a: 'Los perfiles verificados tienen un ✓ visible. Además puedes ver la historia y calificaciones de cada usuario.'
              },
              {
                q: '¿Puedo negociar precios?',
                a: 'Absolutamente. Los precios son sugerencias. Contacta directamente con el vendedor para llegar a un acuerdo.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default Home;
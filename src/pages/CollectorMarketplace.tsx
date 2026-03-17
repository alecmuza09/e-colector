import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCollectorStocks } from '../services/products';
import { createRequest } from '../services/requests';
import { Product } from '../data/mockProducts';
import { useAuth } from '../context/AuthContext';
import {
  Search, Package, MapPin, DollarSign, CheckCircle,
  Loader, Filter, X, MessageSquare, Store, SlidersHorizontal,
  Plus, ClipboardList,
} from 'lucide-react';

const CATEGORIES = ['Todos', 'PET', 'Cartón', 'Vidrio', 'Metal', 'Electrónicos', 'Papel', 'HDPE', 'Otros'];
const MATERIAL_OPTIONS = ['PET', 'Cartón', 'Vidrio', 'Metal', 'Electrónicos', 'Papel', 'HDPE', 'Otros'];
const MUNICIPALITIES = [
  'Todos', 'Monterrey', 'San Nicolás de los Garza', 'San Pedro Garza García',
  'Guadalupe', 'Apodaca', 'Escobedo', 'Santa Catarina', 'García',
];

const categoryEmoji: Record<string, string> = {
  PET: '♳', Cartón: '📦', Metal: '🔩', Vidrio: '🍶',
  Electrónicos: '💻', Papel: '📄', HDPE: '♴', Otros: '♻️',
};

type StockWithCollector = Product & {
  collectorName?: string;
  collectorVerified?: boolean;
  notes?: string;
};

export default function CollectorMarketplace() {
  const { isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState<StockWithCollector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [municipalityFilter, setMunicipalityFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  // Modal de solicitud de recolección
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    material: '', quantity: '', price: '', municipality: '', location: '', description: '',
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError(null);
    try {
      await createRequest({
        material: requestForm.material,
        quantity: requestForm.quantity || undefined,
        price: requestForm.price || undefined,
        municipality: requestForm.municipality || undefined,
        location: requestForm.location || undefined,
        description: requestForm.description || undefined,
      });
      setRequestSuccess(true);
      setRequestForm({ material: '', quantity: '', price: '', municipality: '', location: '', description: '' });
      setTimeout(() => { setShowRequestModal(false); setRequestSuccess(false); }, 2000);
    } catch {
      setRequestError('Error al crear la solicitud. Intenta de nuevo.');
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const products = await getCollectorStocks();

      // Enriquecer con datos del recolector
      const enriched: StockWithCollector[] = [];
      for (const p of products) {
        if (!p.userId) { enriched.push(p); continue; }
        const { data: user } = await supabase
          .from('users')
          .select('full_name, is_verified')
          .eq('id', p.userId)
          .single();
        enriched.push({
          ...p,
          collectorName: user?.full_name || 'Recolector',
          collectorVerified: user?.is_verified || false,
          notes: (p as any).notes,
        });
      }
      setStocks(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = stocks;
    if (categoryFilter !== 'Todos') result = result.filter(s => s.category === categoryFilter);
    if (municipalityFilter !== 'Todos') result = result.filter(s => s.municipality === municipalityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.category.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.collectorName || '').toLowerCase().includes(q) ||
        (s.municipality || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [stocks, categoryFilter, municipalityFilter, search]);

  const activeFilters = (categoryFilter !== 'Todos' ? 1 : 0) + (municipalityFilter !== 'Todos' ? 1 : 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">🏭 Comprador / Reciclador</span>
            <h1 className="text-2xl font-bold mt-2">Stocks de Recolectores</h1>
            <p className="text-blue-100 text-sm mt-1">
              Materiales disponibles en volumen publicados por recolectores verificados.
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Solicitar Recolección
              </button>
            )}
          </div>
          <Store className="w-12 h-12 text-white/30 flex-shrink-0 hidden sm:block" />
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar material, recolector, municipio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
              showFilters || activeFilters > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilters > 0 && (
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Categoría
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      categoryFilter === c
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {c !== 'Todos' && categoryEmoji[c]} {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Municipio
              </p>
              <div className="flex flex-wrap gap-2">
                {MUNICIPALITIES.map(m => (
                  <button key={m} onClick={() => setMunicipalityFilter(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      municipalityFilter === m
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => { setCategoryFilter('Todos'); setMunicipalityFilter('Todos'); }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Contador de resultados */}
        {!loading && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{filtered.length}</span> stock{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            {search && ` para "${search}"`}
          </p>
        )}
      </div>

      {/* Grid de stocks */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Cargando inventarios disponibles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="w-12 h-12 mb-3 text-gray-200" />
          <p className="text-base font-medium text-gray-500">No hay stocks disponibles</p>
          <p className="text-sm mt-1">
            {search || activeFilters > 0
              ? 'Intenta con otros filtros o términos de búsqueda.'
              : 'Los recolectores aún no han publicado inventario disponible.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(stock => (
            <div key={stock.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">

              {/* Header de la card */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">
                      {categoryEmoji[stock.category] || '♻️'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{stock.category}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-500">{stock.collectorName || 'Recolector'}</p>
                        {stock.collectorVerified && (
                          <CheckCircle className="w-3 h-3 text-emerald-500" title="Recolector verificado" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    Disponible
                  </span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-5 space-y-3">
                {/* Cantidad */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Cantidad disponible</p>
                    <p className="text-sm font-semibold">
                      {(stock as any).quantity
                        ? `${(stock as any).quantity} ${(stock as any).unit || 'kg'}`
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Precio por {(stock as any).unit || 'kg'}</p>
                    <p className="text-sm font-semibold text-emerald-600">
                      {stock.price > 0 ? `$${stock.price.toFixed(2)} MXN` : 'A negociar'}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{stock.municipality || '—'}</span>
                </div>

                {/* Notas */}
                {stock.notes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-blue-700 leading-relaxed">{stock.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer con CTA */}
              <div className="px-5 pb-5">
                <Link
                  to="/mensajes"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contactar recolector
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Solicitar Recolección */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Solicitar Recolección</h2>
              </div>
              <button
                onClick={() => { setShowRequestModal(false); setRequestError(null); setRequestSuccess(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">¡Solicitud enviada!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Los recolectores podrán ver tu solicitud y enviarte ofertas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={requestForm.material}
                    onChange={e => setRequestForm(p => ({ ...p, material: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar material...</option>
                    {MATERIAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Cantidad estimada
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 500 kg"
                      value={requestForm.quantity}
                      onChange={e => setRequestForm(p => ({ ...p, quantity: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Precio ofrecido
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: $8/kg"
                      value={requestForm.price}
                      onChange={e => setRequestForm(p => ({ ...p, price: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Municipio
                    </label>
                    <select
                      value={requestForm.municipality}
                      onChange={e => setRequestForm(p => ({ ...p, municipality: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {['Monterrey', 'San Nicolás de los Garza', 'San Pedro Garza García', 'Guadalupe', 'Apodaca', 'Escobedo', 'Santa Catarina', 'García'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Ubicación / Referencia
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Zona Contry"
                      value={requestForm.location}
                      onChange={e => setRequestForm(p => ({ ...p, location: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Descripción adicional
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe el estado del material, condiciones de recolección, etc."
                    value={requestForm.description}
                    onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {requestError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{requestError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowRequestModal(false); setRequestError(null); }}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    {requestLoading ? 'Enviando...' : 'Publicar solicitud'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

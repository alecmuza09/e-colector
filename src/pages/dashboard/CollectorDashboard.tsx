import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { createProduct, updateProduct, getMyCollectorStocks } from '../../services/products';
import { Product } from '../../data/mockProducts';
import {
  Truck, Package, Leaf, Plus, Trash2, BarChart3,
  MapPin, Clock, CheckCircle, Loader, ChevronRight,
  Droplets, Zap, Wind, Trees, Scale, MessageSquare,
  Store, Edit2, X, DollarSign, AlertCircle,
} from 'lucide-react';

// ─── Factores de impacto por kg ─────────────────────────────────────────────
const MATERIALS = [
  { key: 'PET',            label: 'Plástico PET',      emoji: '♳', co2: 3.75, water: 13,  energy: 0.24  },
  { key: 'HDPE',           label: 'Plástico HDPE',     emoji: '♴', co2: 1.70, water: 9,   energy: 0.30  },
  { key: 'Plástico mixto', label: 'Plástico mixto',    emoji: '♷', co2: 1.50, water: 8,   energy: 0.25  },
  { key: 'Cartón / Papel', label: 'Cartón / Papel',    emoji: '📦', co2: 1.10, water: 17,  energy: 0.20  },
  { key: 'Metales',        label: 'Metales / Acero',   emoji: '🔩', co2: 4.50, water: 25,  energy: 10.00 },
  { key: 'Aluminio',       label: 'Aluminio',          emoji: '🥫', co2: 9.10, water: 17,  energy: 14.00 },
  { key: 'Vidrio',         label: 'Vidrio',            emoji: '🍶', co2: 0.30, water: 1.5, energy: 0.05  },
  { key: 'Electrónicos',   label: 'Electrónicos RAEE', emoji: '💻', co2: 20.0, water: 50,  energy: 25.00 },
  { key: 'Textiles',       label: 'Textiles',          emoji: '👕', co2: 3.60, water: 100, energy: 2.50  },
  { key: 'Orgánico',       label: 'Orgánico',          emoji: '🌿', co2: 0.55, water: 5,   energy: 0.10  },
];

const CATEGORIES = ['PET', 'Cartón', 'Vidrio', 'Metal', 'Electrónicos', 'Papel', 'HDPE', 'Otros'];
const MUNICIPALITIES = [
  'Monterrey', 'San Nicolás de los Garza', 'San Pedro Garza García', 'Guadalupe',
  'Apodaca', 'Escobedo', 'Santa Catarina', 'García',
];

type ImpactEntry = {
  id: string;
  material: string;
  quantity_kg: number;
  date: string;
  source?: string;
};

type OfferRow = {
  id: string; price: number; quantity: string | null; status: string;
  created_at: string;
  product?: { title?: string; category?: string; municipality?: string } | null;
};

// ─── Subcomponentes ──────────────────────────────────────────────────────────

const Tab = ({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: React.ElementType; label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
      active ? 'bg-white text-emerald-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const ImpactCard = ({ icon: Icon, value, unit, label, bg, text }: {
  icon: React.ElementType; value: string; unit: string; label: string; bg: string; text: string;
}) => (
  <div className={`rounded-2xl p-5 ${bg}`}>
    <Icon className={`w-6 h-6 ${text} mb-3`} />
    <p className={`text-3xl font-bold ${text}`}>{value}</p>
    <p className={`text-sm font-medium ${text} opacity-80`}>{unit}</p>
    <p className="text-xs text-gray-600 mt-2 leading-snug">{label}</p>
  </div>
);

// ─── Dashboard principal ─────────────────────────────────────────────────────

export default function CollectorDashboard() {
  const { userName, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'resumen' | 'residuos' | 'impacto' | 'stocks'>('resumen');

  // Ofertas
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Impacto verde (Supabase)
  const [entries, setEntries] = useState<ImpactEntry[]>([]);
  const [loadingImpact, setLoadingImpact] = useState(true);
  const [impactForm, setImpactForm] = useState({
    material: '', quantity: '', date: new Date().toISOString().slice(0, 10), source: '',
  });
  const [impactFormError, setImpactFormError] = useState('');
  const [savingImpact, setSavingImpact] = useState(false);

  // Stocks del recolector
  const [stocks, setStocks] = useState<Product[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState({
    category: '', quantity: '', unit: 'kg', price: '', municipality: '', notes: '', description: '',
  });
  const [savingStock, setSavingStock] = useState(false);
  const [stockError, setStockError] = useState('');

  // ── Carga inicial ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile?.id) return;

    // Ofertas
    (async () => {
      setLoadingOffers(true);
      const { data } = await supabase
        .from('offers')
        .select('id,price,quantity,status,created_at,product:product_id(title,category,municipality)')
        .eq('buyer_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setOffers((data || []) as any);
      setLoadingOffers(false);
    })();

    // Impacto verde desde Supabase
    fetchImpactEntries();

    // Stocks del recolector
    fetchStocks();
  }, [userProfile?.id]);

  const fetchImpactEntries = async () => {
    if (!userProfile?.id) return;
    setLoadingImpact(true);
    const { data } = await supabase
      .from('green_impact_log')
      .select('*')
      .eq('collector_id', userProfile.id)
      .order('date', { ascending: false });
    setEntries((data || []).map((r: any) => ({
      id: r.id,
      material: r.material,
      quantity_kg: Number(r.quantity_kg),
      date: r.date,
      source: r.source,
    })));
    setLoadingImpact(false);
  };

  const fetchStocks = async () => {
    if (!userProfile?.id) return;
    setLoadingStocks(true);
    const data = await getMyCollectorStocks(userProfile.id);
    setStocks(data);
    setLoadingStocks(false);
  };

  // ── Impacto: agregar entrada ────────────────────────────────────────────────
  const handleAddImpact = async () => {
    if (!impactForm.material) return setImpactFormError('Selecciona un material.');
    const qty = parseFloat(impactForm.quantity);
    if (!qty || qty <= 0) return setImpactFormError('Introduce una cantidad válida.');
    if (!userProfile?.id) return;
    setImpactFormError('');
    setSavingImpact(true);
    const { data, error } = await supabase
      .from('green_impact_log')
      .insert({
        collector_id: userProfile.id,
        material: impactForm.material,
        quantity_kg: qty,
        date: impactForm.date,
        source: impactForm.source || null,
      })
      .select()
      .single();
    setSavingImpact(false);
    if (error) {
      console.error('Supabase error al guardar impacto:', error);
      setImpactFormError(`Error al guardar: ${error.message || 'Intenta de nuevo.'}`);
      return;
    }
    setEntries(prev => [{
      id: data.id, material: data.material, quantity_kg: Number(data.quantity_kg),
      date: data.date, source: data.source,
    }, ...prev]);
    setImpactForm(f => ({ ...f, material: '', quantity: '', source: '' }));
  };

  // ── Impacto: eliminar entrada ───────────────────────────────────────────────
  const handleRemoveImpact = async (id: string) => {
    await supabase.from('green_impact_log').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // ── Stocks: abrir formulario de creación ───────────────────────────────────
  const openNewStockForm = () => {
    setEditingStock(null);
    setStockForm({ category: '', quantity: '', unit: 'kg', price: '', municipality: '', notes: '', description: '' });
    setStockError('');
    setShowStockForm(true);
  };

  // ── Stocks: abrir formulario de edición ────────────────────────────────────
  const openEditStockForm = (stock: Product) => {
    setEditingStock(stock);
    setStockForm({
      category: stock.category,
      quantity: String((stock as any).quantity || ''),
      unit: (stock as any).unit || 'kg',
      price: String(stock.price),
      municipality: stock.municipality || '',
      notes: (stock as any).notes || '',
      description: stock.description || '',
    });
    setStockError('');
    setShowStockForm(true);
  };

  // ── Stocks: guardar (crear o editar) ───────────────────────────────────────
  const handleSaveStock = async () => {
    if (!stockForm.category) return setStockError('Selecciona una categoría.');
    if (!stockForm.quantity || Number(stockForm.quantity) <= 0) return setStockError('Introduce una cantidad válida.');
    if (!stockForm.municipality) return setStockError('Selecciona un municipio.');
    setStockError('');
    setSavingStock(true);

    const qty = parseFloat(stockForm.quantity);
    const price = parseFloat(stockForm.price) || 0;
    const unit = stockForm.unit as 'kg' | 'Ton';
    const title = `${stockForm.category} disponible (${qty} ${unit})`;

    try {
      if (editingStock) {
        await updateProduct(editingStock.id, {
          category: stockForm.category,
          quantity: qty,
          unit,
          price,
          municipality: stockForm.municipality,
          notes: stockForm.notes,
          description: stockForm.description || `Stock disponible de ${stockForm.category}`,
        });
      } else {
        await createProduct({
          title,
          description: stockForm.description || `Stock disponible de ${stockForm.category}`,
          price,
          category: stockForm.category,
          quantity: qty,
          unit,
          municipality: stockForm.municipality,
          type: 'stock_recolector',
          notes: stockForm.notes,
        });
      }
      await fetchStocks();
      setShowStockForm(false);
    } catch {
      setStockError('Error al guardar el stock. Intenta de nuevo.');
    }
    setSavingStock(false);
  };

  // ── Stocks: cambiar estado ──────────────────────────────────────────────────
  const handleToggleStockStatus = async (stock: Product) => {
    const newStatus = stock.status === 'activo' ? 'vendido' : 'activo';
    await updateProduct(stock.id, { status: newStatus as any });
    await fetchStocks();
  };

  // ── Cálculo de impacto ──────────────────────────────────────────────────────
  const impact = useMemo(() => {
    let co2 = 0, water = 0, energy = 0, totalKg = 0;
    for (const e of entries) {
      const f = MATERIALS.find(m => m.key === e.material);
      if (f) { co2 += f.co2 * e.quantity_kg; water += f.water * e.quantity_kg; energy += f.energy * e.quantity_kg; totalKg += e.quantity_kg; }
    }
    return { co2, water, energy, totalKg };
  }, [entries]);

  const byMaterial = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) map.set(e.material, (map.get(e.material) || 0) + e.quantity_kg);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const totalCollected = entries.reduce((s, e) => s + e.quantity_kg, 0);
  const acceptedOffers = offers.filter(o => o.status === 'aceptada').length;
  const pendingOffers  = offers.filter(o => o.status === 'pendiente').length;
  const activeStocks   = stocks.filter(s => s.status === 'activo').length;

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-700', aceptada: 'bg-emerald-100 text-emerald-700',
      rechazada: 'bg-red-100 text-red-700', activo: 'bg-emerald-100 text-emerald-700',
      vendido: 'bg-gray-100 text-gray-600',
    };
    const label: Record<string, string> = {
      pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada',
      activo: 'Activo', vendido: 'Vendido',
    };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m[s] || 'bg-gray-100 text-gray-600'}`}>{label[s] || s}</span>;
  };

  const categoryEmoji: Record<string, string> = {
    PET: '♳', Cartón: '📦', Metal: '🔩', Vidrio: '🍶',
    Electrónicos: '💻', Papel: '📄', HDPE: '♴', Otros: '♻️',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">🚚 Recolector / Empresa</span>
            <h1 className="text-2xl font-bold mt-2">¡Hola, {userName || 'Recolector'}!</h1>
            <p className="text-teal-100 text-sm mt-1">Gestiona tus recolecciones, impacto ambiental e inventario disponible.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/explorar"
              className="flex items-center gap-1.5 bg-white text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">
              <Package className="w-4 h-4" /> Buscar materiales
            </Link>
            <button
              onClick={() => setActiveTab('stocks')}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Store className="w-4 h-4" /> Mis Stocks
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ofertas aceptadas"  value={acceptedOffers}          icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Ofertas pendientes" value={pendingOffers}           icon={Clock}       color="bg-yellow-100 text-yellow-600" />
        <StatCard label="Kg registrados"     value={totalCollected.toFixed(0)} icon={Scale}     color="bg-teal-100 text-teal-600" />
        <StatCard label="Stocks activos"     value={activeStocks}            icon={Store}       color="bg-blue-100 text-blue-600" />
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-2xl p-1 flex gap-1 w-fit overflow-x-auto">
        <Tab active={activeTab === 'resumen'}  onClick={() => setActiveTab('resumen')}  icon={BarChart3}     label="Resumen" />
        <Tab active={activeTab === 'residuos'} onClick={() => setActiveTab('residuos')} icon={Truck}         label="Gestión de Residuos" />
        <Tab active={activeTab === 'impacto'}  onClick={() => setActiveTab('impacto')}  icon={Leaf}          label="Impacto Verde" />
        <Tab active={activeTab === 'stocks'}   onClick={() => setActiveTab('stocks')}   icon={Store}         label="Mis Stocks" />
      </div>

      {/* ── TAB: RESUMEN ──────────────────────────────────────────────────── */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ofertas realizadas */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-500" /> Mis ofertas de recolección
              </h2>
              <Link to="/explorar" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                Buscar más <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loadingOffers ? (
              <div className="p-6 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
            ) : offers.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Aún no has hecho ofertas.
                <br />
                <Link to="/explorar" className="text-teal-600 hover:underline mt-1 inline-block">Explorar materiales →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {offers.slice(0, 8).map(o => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{(o.product as any)?.title || 'Material'}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{(o.product as any)?.municipality || '—'}
                        {' · '}<span className="text-emerald-600">${Number(o.price).toFixed(2)}</span>
                      </p>
                    </div>
                    {statusBadge(o.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de residuos */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-500" /> Residuos registrados por material
              </h2>
              <button onClick={() => setActiveTab('residuos')} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                Gestionar <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {loadingImpact ? (
              <div className="p-6 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
            ) : byMaterial.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Aún no hay residuos registrados.{' '}
                <button onClick={() => setActiveTab('residuos')} className="text-teal-600 hover:underline">Registrar ahora →</button>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {byMaterial.map(([mat, kg]) => {
                  const f = MATERIALS.find(m => m.key === mat);
                  const pct = totalCollected > 0 ? (kg / totalCollected) * 100 : 0;
                  return (
                    <div key={mat}>
                      <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                        <span className="font-medium">{f?.emoji} {mat}</span>
                        <span>{kg.toFixed(1)} kg ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-semibold text-gray-700">
                  <span>Total</span><span>{totalCollected.toFixed(1)} kg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: GESTIÓN DE RESIDUOS ──────────────────────────────────────── */}
      {activeTab === 'residuos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-500" /> Registrar material recolectado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Material *</label>
                <select value={impactForm.material} onChange={e => setImpactForm(f => ({ ...f, material: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Selecciona...</option>
                  {MATERIALS.map(m => <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Cantidad (kg) *</label>
                <input type="number" min="0.1" step="0.1" value={impactForm.quantity}
                  onChange={e => setImpactForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="Ej: 50"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha</label>
                <input type="date" value={impactForm.date} onChange={e => setImpactForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fuente / Cliente</label>
                <input type="text" value={impactForm.source} onChange={e => setImpactForm(f => ({ ...f, source: e.target.value }))}
                  placeholder="Ej: Empresa XYZ"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            {impactFormError && <p className="text-red-500 text-xs mt-2">{impactFormError}</p>}
            <button onClick={handleAddImpact} disabled={savingImpact}
              className="mt-4 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              {savingImpact ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar registro
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Historial de recolecciones</h2>
              {entries.length > 0 && (
                <span className="text-xs text-gray-500">{entries.length} registros · {totalCollected.toFixed(1)} kg total</span>
              )}
            </div>
            {loadingImpact ? (
              <div className="p-8 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Truck className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-500 font-medium">Sin registros aún</p>
                <p className="text-xs mt-1">Agrega tus primeras recolecciones para calcular tu impacto.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fuente</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">CO₂ evitado</th>
                      <th className="px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {entries.map(e => {
                      const f = MATERIALS.find(m => m.key === e.material);
                      const co2saved = f ? (f.co2 * e.quantity_kg).toFixed(2) : '—';
                      return (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-800">{f?.emoji} {e.material}</td>
                          <td className="px-5 py-3 text-gray-600">{e.quantity_kg} kg</td>
                          <td className="px-5 py-3 text-gray-500">{new Date(e.date).toLocaleDateString('es-MX')}</td>
                          <td className="px-5 py-3 text-gray-500">{e.source || '—'}</td>
                          <td className="px-5 py-3"><span className="text-emerald-600 font-semibold">{co2saved} kg</span></td>
                          <td className="px-2 py-3">
                            <button onClick={() => handleRemoveImpact(e.id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: IMPACTO VERDE ───────────────────────────────────────────── */}
      {activeTab === 'impacto' && (
        <div className="space-y-6">
          {loadingImpact ? (
            <div className="p-12 text-center"><Loader className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-emerald-300 p-10 text-center">
              <Leaf className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Aún no hay datos de impacto</p>
              <p className="text-sm text-gray-500 mb-4">Registra los materiales que has recolectado para ver tu huella ambiental positiva.</p>
              <button onClick={() => setActiveTab('residuos')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Registrar mis recolecciones
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Leaf className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Tu Impacto Verde Acumulado</h2>
                </div>
                <p className="text-emerald-100 text-sm">
                  Calculado con base en <strong>{entries.length} registros</strong> y{' '}
                  <strong>{impact.totalKg.toFixed(1)} kg</strong> de materiales recolectados.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ImpactCard icon={Wind}
                  value={impact.co2 >= 1000 ? (impact.co2 / 1000).toFixed(2) : impact.co2.toFixed(1)}
                  unit={impact.co2 >= 1000 ? 'ton CO₂ evitadas' : 'kg CO₂ evitados'}
                  label="Equivalente a no conducir varios cientos de km"
                  bg="bg-emerald-50 border border-emerald-200" text="text-emerald-700" />
                <ImpactCard icon={Droplets}
                  value={impact.water >= 1000 ? (impact.water / 1000).toFixed(1) : impact.water.toFixed(0)}
                  unit={impact.water >= 1000 ? 'm³ de agua' : 'litros de agua'}
                  label="Agua conservada en procesos industriales"
                  bg="bg-blue-50 border border-blue-200" text="text-blue-700" />
                <ImpactCard icon={Zap}
                  value={impact.energy >= 1000 ? (impact.energy / 1000).toFixed(1) : impact.energy.toFixed(1)}
                  unit={impact.energy >= 1000 ? 'MWh ahorrados' : 'kWh ahorrados'}
                  label="Energía equivalente a hogares alimentados"
                  bg="bg-yellow-50 border border-yellow-200" text="text-yellow-700" />
                <ImpactCard icon={Trees}
                  value={Math.round(impact.co2 / 21).toString()}
                  unit="árboles equivalentes"
                  label="Árboles que absorberían el mismo CO₂ en un año"
                  bg="bg-teal-50 border border-teal-200" text="text-teal-700" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Desglose por material</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {byMaterial.map(([mat, kg]) => {
                    const f = MATERIALS.find(m => m.key === mat);
                    if (!f) return null;
                    return (
                      <div key={mat} className="flex items-center gap-4 px-5 py-3">
                        <span className="text-2xl w-8 flex-shrink-0">{f.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{mat}</p>
                          <p className="text-xs text-gray-400">{kg.toFixed(1)} kg recolectados</p>
                        </div>
                        <div className="hidden sm:flex gap-4 text-xs text-right">
                          <div><p className="font-semibold text-emerald-600">{(f.co2 * kg).toFixed(2)} kg</p><p className="text-gray-400">CO₂</p></div>
                          <div><p className="font-semibold text-blue-600">{(f.water * kg).toFixed(0)} L</p><p className="text-gray-400">Agua</p></div>
                          <div><p className="font-semibold text-yellow-600">{(f.energy * kg).toFixed(2)} kWh</p><p className="text-gray-400">Energía</p></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-xs text-gray-500">
                <p className="font-medium text-gray-600 mb-1">Sobre los cálculos</p>
                <p>Los factores de impacto se basan en datos de la EPA (EE.UU.), WRAP (Reino Unido) y la Fundación Ellen MacArthur. Los valores representan el impacto ambiental evitado al reciclar en lugar de producir con materias primas vírgenes.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: MIS STOCKS ─────────────────────────────────────────────── */}
      {activeTab === 'stocks' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mi inventario disponible</h2>
              <p className="text-sm text-gray-500 mt-0.5">Publica los materiales que tienes disponibles para que los compradores puedan contactarte.</p>
            </div>
            <button onClick={openNewStockForm}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Publicar Stock
            </button>
          </div>

          {/* Formulario de stock */}
          {showStockForm && (
            <div className="bg-white rounded-2xl border border-teal-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-teal-50">
                <h3 className="font-semibold text-teal-800">
                  {editingStock ? 'Editar stock' : 'Nuevo stock disponible'}
                </h3>
                <button onClick={() => setShowStockForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Categoría *</label>
                    <select value={stockForm.category} onChange={e => setStockForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Selecciona...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c] || '♻️'} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Cantidad *</label>
                    <div className="flex gap-2">
                      <input type="number" min="0.1" step="0.1" value={stockForm.quantity}
                        onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))}
                        placeholder="Ej: 500"
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      <select value={stockForm.unit} onChange={e => setStockForm(f => ({ ...f, unit: e.target.value }))}
                        className="w-20 px-2 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="kg">kg</option>
                        <option value="Ton">Ton</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Precio por unidad (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="number" min="0" step="0.01" value={stockForm.price}
                        onChange={e => setStockForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Municipio *</label>
                    <select value={stockForm.municipality} onChange={e => setStockForm(f => ({ ...f, municipality: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Selecciona...</option>
                      {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Notas adicionales</label>
                    <input type="text" value={stockForm.notes}
                      onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Ej: Material limpio y clasificado, disponible para entrega inmediata"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
                    <input type="text" value={stockForm.description}
                      onChange={e => setStockForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe brevemente el material disponible"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
                {stockError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {stockError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={handleSaveStock} disabled={savingStock}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    {savingStock ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {editingStock ? 'Guardar cambios' : 'Publicar stock'}
                  </button>
                  <button onClick={() => setShowStockForm(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de stocks */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mis publicaciones de stock</h3>
              {stocks.length > 0 && <span className="text-xs text-gray-500">{activeStocks} activos</span>}
            </div>
            {loadingStocks ? (
              <div className="p-8 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
            ) : stocks.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Store className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">Aún no tienes stocks publicados</p>
                <p className="text-xs mt-1 mb-4">Publica tu inventario disponible para que los compradores puedan contactarte.</p>
                <button onClick={openNewStockForm}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" /> Publicar primer stock
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Municipio</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</th>
                      <th className="px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stocks.map(s => (
                      <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${s.status !== 'activo' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {categoryEmoji[s.category] || '♻️'} {s.category}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {(s as any).quantity ? `${(s as any).quantity} ${(s as any).unit || 'kg'}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-emerald-600 font-semibold">
                          {s.price > 0 ? `$${s.price.toFixed(2)}` : 'A negociar'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.municipality || '—'}
                        </td>
                        <td className="px-5 py-3">{statusBadge(s.status || 'activo')}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs max-w-[180px] truncate">
                          {(s as any).notes || '—'}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditStockForm(s)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Editar">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleToggleStockStatus(s)}
                              className={`p-1.5 rounded-lg transition-colors text-xs font-medium ${s.status === 'activo' ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              title={s.status === 'activo' ? 'Marcar como vendido' : 'Reactivar'}>
                              {s.status === 'activo' ? <X className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

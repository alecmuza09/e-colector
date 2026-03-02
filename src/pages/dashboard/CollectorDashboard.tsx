import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Truck, Package, Leaf, Plus, Trash2, BarChart3,
  MapPin, Clock, CheckCircle, Loader, ChevronRight,
  Droplets, Zap, Wind, Trees, Scale, MessageSquare,
} from 'lucide-react';

// ─── Factores de impacto por kg ────────────────────────────────────────────
// Fuentes: EPA, WRAP, Fundación Ellen MacArthur
const MATERIALS = [
  { key: 'PET',            label: 'Plástico PET',      emoji: '♳', co2: 3.75, water: 13,  energy: 0.24,  color: 'blue' },
  { key: 'HDPE',           label: 'Plástico HDPE',     emoji: '♴', co2: 1.70, water: 9,   energy: 0.30,  color: 'blue' },
  { key: 'Plástico mixto', label: 'Plástico mixto',    emoji: '♷', co2: 1.50, water: 8,   energy: 0.25,  color: 'blue' },
  { key: 'Cartón / Papel', label: 'Cartón / Papel',    emoji: '📦', co2: 1.10, water: 17,  energy: 0.20,  color: 'yellow' },
  { key: 'Metales',        label: 'Metales / Acero',   emoji: '🔩', co2: 4.50, water: 25,  energy: 10.00, color: 'slate' },
  { key: 'Aluminio',       label: 'Aluminio',          emoji: '🥫', co2: 9.10, water: 17,  energy: 14.00, color: 'gray' },
  { key: 'Vidrio',         label: 'Vidrio',            emoji: '🍶', co2: 0.30, water: 1.5, energy: 0.05,  color: 'green' },
  { key: 'Electrónicos',   label: 'Electrónicos RAEE', emoji: '💻', co2: 20.0, water: 50,  energy: 25.00, color: 'purple' },
  { key: 'Textiles',       label: 'Textiles',          emoji: '👕', co2: 3.60, water: 100, energy: 2.50,  color: 'pink' },
  { key: 'Orgánico',       label: 'Orgánico',          emoji: '🌿', co2: 0.55, water: 5,   energy: 0.10,  color: 'emerald' },
];

type CollectedEntry = {
  id: string;
  material: string;
  quantity: number;
  date: string;
  source?: string;
};

type OfferRow = {
  id: string; price: number; quantity: string | null; status: string;
  created_at: string;
  product?: { title?: string; category?: string; municipality?: string } | null;
};

const STORAGE_KEY = 'ecolector_residuos_v1';

const loadEntries = (): CollectedEntry[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveEntries = (entries: CollectedEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// ─── Subcomponentes ────────────────────────────────────────────────────────

const Tab = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
      active ? 'bg-white text-emerald-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) => (
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

// ─── Dashboard principal ───────────────────────────────────────────────────

export default function CollectorDashboard() {
  const { userName, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'resumen' | 'residuos' | 'impacto'>('resumen');
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Gestión de residuos
  const [entries, setEntries] = useState<CollectedEntry[]>(loadEntries);
  const [form, setForm] = useState({ material: '', quantity: '', date: new Date().toISOString().slice(0, 10), source: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!userProfile?.id) return;
    const fetch = async () => {
      setLoadingOffers(true);
      const { data } = await supabase
        .from('offers')
        .select('id,price,quantity,status,created_at,product:product_id(title,category,municipality)')
        .eq('buyer_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setOffers((data || []) as any);
      setLoadingOffers(false);
    };
    fetch();
  }, [userProfile?.id]);

  // ── Impacto calculado ────────────────────────────────────────────────────
  const impact = useMemo(() => {
    let co2 = 0, water = 0, energy = 0, totalKg = 0;
    for (const e of entries) {
      const f = MATERIALS.find(m => m.key === e.material);
      if (f) {
        co2    += f.co2    * e.quantity;
        water  += f.water  * e.quantity;
        energy += f.energy * e.quantity;
        totalKg += e.quantity;
      }
    }
    return { co2, water, energy, totalKg };
  }, [entries]);

  const byMaterial = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.material, (map.get(e.material) || 0) + e.quantity);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // ── Añadir entrada de residuo ────────────────────────────────────────────
  const handleAddEntry = () => {
    if (!form.material) return setFormError('Selecciona un material.');
    const qty = parseFloat(form.quantity);
    if (!qty || qty <= 0) return setFormError('Introduce una cantidad válida.');
    setFormError('');
    const entry: CollectedEntry = {
      id: `${Date.now()}`,
      material: form.material,
      quantity: qty,
      date: form.date,
      source: form.source || undefined,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setForm(f => ({ ...f, material: '', quantity: '', source: '' }));
  };

  const handleRemoveEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  // ── Resumen stats ────────────────────────────────────────────────────────
  const acceptedOffers = offers.filter(o => o.status === 'aceptada').length;
  const pendingOffers  = offers.filter(o => o.status === 'pendiente').length;
  const totalCollected = entries.reduce((s, e) => s + e.quantity, 0);

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-700', aceptada: 'bg-emerald-100 text-emerald-700', rechazada: 'bg-red-100 text-red-700',
    };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">🚚 Recolector / Empresa</span>
            <h1 className="text-2xl font-bold mt-2">¡Hola, {userName || 'Recolector'}!</h1>
            <p className="text-teal-100 text-sm mt-1">Gestiona tus recolecciones y mide tu impacto ambiental.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/explorar"
              className="flex items-center gap-1.5 bg-white text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">
              <Package className="w-4 h-4" /> Buscar materiales
            </Link>
            <button
              onClick={() => setActiveTab('impacto')}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Leaf className="w-4 h-4" /> Mi impacto verde
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Ofertas aceptadas"  value={acceptedOffers}                icon={CheckCircle}  color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Ofertas pendientes" value={pendingOffers}                 icon={Clock}        color="bg-yellow-100 text-yellow-600" />
        <StatCard label="Kg registrados"     value={totalCollected.toFixed(0)}     icon={Scale}        color="bg-teal-100 text-teal-600" />
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-2xl p-1 flex gap-1 w-fit">
        <Tab active={activeTab === 'resumen'}  onClick={() => setActiveTab('resumen')}  icon={BarChart3}  label="Resumen" />
        <Tab active={activeTab === 'residuos'} onClick={() => setActiveTab('residuos')} icon={Truck}      label="Gestión de Residuos" />
        <Tab active={activeTab === 'impacto'}  onClick={() => setActiveTab('impacto')}  icon={Leaf}       label="Impacto Verde" />
      </div>

      {/* ── TAB: RESUMEN ─────────────────────────────────────────────────── */}
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
                Aún no has hecho ofertas. Explora el mapa para encontrar materiales.
                <br />
                <Link to="/explorar" className="text-teal-600 hover:underline mt-1 inline-block">Explorar materiales →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {offers.slice(0, 8).map(o => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {(o.product as any)?.title || 'Material'}
                      </p>
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

          {/* Resumen de residuos registrados */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-500" /> Residuos registrados por material
              </h2>
              <button onClick={() => setActiveTab('residuos')} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                Gestionar <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {byMaterial.length === 0 ? (
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
                  <span>Total</span>
                  <span>{totalCollected.toFixed(1)} kg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: GESTIÓN DE RESIDUOS ─────────────────────────────────────── */}
      {activeTab === 'residuos' && (
        <div className="space-y-6">
          {/* Formulario de registro */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-500" /> Registrar material recolectado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Material *</label>
                <select
                  value={form.material}
                  onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Selecciona...</option>
                  {MATERIALS.map(m => (
                    <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Cantidad (kg) *</label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="Ej: 50"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fuente / Cliente</label>
                <input
                  type="text"
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  placeholder="Ej: Empresa XYZ"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
            <button
              onClick={handleAddEntry}
              className="mt-4 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar registro
            </button>
          </div>

          {/* Historial */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Historial de recolecciones</h2>
              {entries.length > 0 && (
                <span className="text-xs text-gray-500">{entries.length} registros · {totalCollected.toFixed(1)} kg total</span>
              )}
            </div>
            {entries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Truck className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-500 font-medium">Sin registros aún</p>
                <p className="text-xs mt-1">Agrega tus primeras recolecciones para ver el historial y calcular tu impacto.</p>
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
                      const co2saved = f ? (f.co2 * e.quantity).toFixed(2) : '—';
                      return (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-800">
                            {f?.emoji} {e.material}
                          </td>
                          <td className="px-5 py-3 text-gray-600">{e.quantity} kg</td>
                          <td className="px-5 py-3 text-gray-500">{new Date(e.date).toLocaleDateString('es-MX')}</td>
                          <td className="px-5 py-3 text-gray-500">{e.source || '—'}</td>
                          <td className="px-5 py-3">
                            <span className="text-emerald-600 font-semibold">{co2saved} kg</span>
                          </td>
                          <td className="px-2 py-3">
                            <button
                              onClick={() => handleRemoveEntry(e.id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
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
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-emerald-300 p-10 text-center">
              <Leaf className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Aún no hay datos de impacto</p>
              <p className="text-sm text-gray-500 mb-4">
                Registra los materiales que has recolectado para ver tu huella ambiental positiva.
              </p>
              <button
                onClick={() => setActiveTab('residuos')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Registrar mis recolecciones
              </button>
            </div>
          ) : (
            <>
              {/* Banner de impacto */}
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

              {/* Cards de impacto */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ImpactCard
                  icon={Wind}
                  value={impact.co2 >= 1000 ? (impact.co2 / 1000).toFixed(2) : impact.co2.toFixed(1)}
                  unit={impact.co2 >= 1000 ? 'ton CO₂ evitadas' : 'kg CO₂ evitados'}
                  label="Equivalente a no conducir varios cientos de km"
                  bg="bg-emerald-50 border border-emerald-200"
                  text="text-emerald-700"
                />
                <ImpactCard
                  icon={Droplets}
                  value={impact.water >= 1000 ? (impact.water / 1000).toFixed(1) : impact.water.toFixed(0)}
                  unit={impact.water >= 1000 ? 'm³ de agua' : 'litros de agua'}
                  label="Agua conservada en procesos industriales"
                  bg="bg-blue-50 border border-blue-200"
                  text="text-blue-700"
                />
                <ImpactCard
                  icon={Zap}
                  value={impact.energy >= 1000 ? (impact.energy / 1000).toFixed(1) : impact.energy.toFixed(1)}
                  unit={impact.energy >= 1000 ? 'MWh ahorrados' : 'kWh ahorrados'}
                  label="Energía equivalente a hogares alimentados"
                  bg="bg-yellow-50 border border-yellow-200"
                  text="text-yellow-700"
                />
                <ImpactCard
                  icon={Trees}
                  value={Math.round(impact.co2 / 21).toString()}
                  unit="árboles equivalentes"
                  label="Árboles que absorberían el mismo CO₂ en un año"
                  bg="bg-teal-50 border border-teal-200"
                  text="text-teal-700"
                />
              </div>

              {/* Desglose por material */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Desglose por material</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {byMaterial.map(([mat, kg]) => {
                    const f = MATERIALS.find(m => m.key === mat);
                    if (!f) return null;
                    const co2 = (f.co2 * kg).toFixed(2);
                    const water = (f.water * kg).toFixed(0);
                    const energy = (f.energy * kg).toFixed(2);
                    return (
                      <div key={mat} className="flex items-center gap-4 px-5 py-3">
                        <span className="text-2xl w-8 flex-shrink-0">{f.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{mat}</p>
                          <p className="text-xs text-gray-400">{kg.toFixed(1)} kg recolectados</p>
                        </div>
                        <div className="hidden sm:flex gap-4 text-xs text-right">
                          <div>
                            <p className="font-semibold text-emerald-600">{co2} kg</p>
                            <p className="text-gray-400">CO₂</p>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-600">{water} L</p>
                            <p className="text-gray-400">Agua</p>
                          </div>
                          <div>
                            <p className="font-semibold text-yellow-600">{energy} kWh</p>
                            <p className="text-gray-400">Energía</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nota metodológica */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-xs text-gray-500">
                <p className="font-medium text-gray-600 mb-1">Sobre los cálculos</p>
                <p>Los factores de impacto se basan en datos de la EPA (EE.UU.), WRAP (Reino Unido) y la Fundación Ellen MacArthur. Los valores representan el impacto ambiental evitado al reciclar en lugar de producir con materias primas vírgenes. Los resultados son estimaciones referenciales.</p>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}

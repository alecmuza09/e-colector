import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Package, MapPin, CheckCircle, Loader,
  Pencil, X, Save, Recycle, Building, BarChart2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { Product } from '../../data/mockProducts';
import { useProfileUpdate, toggleChip, MATERIAL_CHIPS } from '../../hooks/useProfileUpdate';

const LOCATION_TYPES = [
  { val: 'residential', label: '🏠 Hogar / Residencial' },
  { val: 'commercial',  label: '🏪 Negocio / Comercio' },
  { val: 'industrial',  label: '🏭 Industria / Empresa' },
];
const FREQUENCIES = ['Diario', 'Semanal', 'Quincenal', 'Mensual', 'Bajo demanda'];

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white';

const ChipSelector: React.FC<{ options: string[]; selected: string[]; onChange: (v: string[]) => void }> = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-1.5 mt-1">
    {options.map((opt) => {
      const active = selected.includes(opt);
      return (
        <button key={opt} type="button" onClick={() => onChange(toggleChip(selected, opt))}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'}`}>
          {opt}
        </button>
      );
    })}
  </div>
);

const Field: React.FC<{ label: string; value: string; editing: boolean; children: React.ReactNode }> = ({ label, value, editing, children }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    {editing ? children : <p className="font-medium text-sm">{value || <span className="text-gray-400 italic text-xs">No especificado</span>}</p>}
  </div>
);

const SaveBar: React.FC<{ saving: boolean; msg: any; onSave: () => void; onCancel: () => void }> = ({ saving, msg, onSave, onCancel }) => (
  <div className="mt-4 space-y-2">
    {msg && <p className={`text-sm rounded-xl px-4 py-2 ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
    <div className="flex gap-2">
      <button onClick={onCancel} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
      <button onClick={onSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
        {saving ? <><Loader className="w-4 h-4 animate-spin" />Guardando…</> : <><Save className="w-4 h-4" />Guardar</>}
      </button>
    </div>
  </div>
);

const SellerProfile = () => {
  const { userProfile } = useAuth();
  const { save } = useProfileUpdate();

  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);

  // Info edit
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ full_name: '', phone_number: '', city: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<any>(null);

  // Generation edit
  const [editingGen, setEditingGen] = useState(false);
  const [genForm, setGenForm] = useState({ locationType: '', materialTypesGenerated: [] as string[], generationFrequency: '', estimatedMonthlyVolumeKg: '' });
  const [genSaving, setGenSaving] = useState(false);
  const [genMsg, setGenMsg] = useState<any>(null);

  const productIds = useMemo(() => myProducts.map((p) => p.id), [myProducts]);

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const [activeRes, soldRes, prodsRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userProfile.id).eq('status', 'activo'),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userProfile.id).eq('status', 'vendido'),
          supabase.from('products').select('id,title,price,currency,municipality,type,created_at,status,user_id,image_url,image_urls,address').eq('user_id', userProfile.id).order('created_at', { ascending: false }).limit(20),
        ]);
        setActiveCount(activeRes.count || 0);
        setSoldCount(soldRes.count || 0);
        const mapped = ((prodsRes.data || []) as any[]).map((p) => ({
          id: p.id, userId: p.user_id, title: p.title, price: Number(p.price), currency: p.currency || 'MXN',
          municipality: p.municipality || '', address: p.address || '', imageUrl: (p.image_urls?.[0]) || p.image_url || '',
          imageUrls: p.image_urls || [], type: p.type, createdAt: p.created_at, status: p.status,
          description: '', category: 'Otros', tags: [], location: '', latitude: 25.6866, longitude: -100.3161, verified: false,
        }));
        setMyProducts(mapped as any);
        if (mapped.length > 0) {
          const { count } = await supabase.from('offers').select('id', { count: 'exact', head: true }).in('product_id', mapped.map((p) => p.id));
          setOffersCount(count || 0);
        }
      } finally { setLoading(false); }
    };
    load();
  }, [userProfile?.id]);

  useEffect(() => {
    if (!userProfile) return;
    setInfoForm({ full_name: userProfile.full_name || '', phone_number: userProfile.phone_number || '', city: userProfile.city || '' });
    const pd = userProfile.profile_data || {};
    setGenForm({ locationType: pd.locationType || '', materialTypesGenerated: pd.materialTypesGenerated || [], generationFrequency: pd.generationFrequency || '', estimatedMonthlyVolumeKg: pd.estimatedMonthlyVolumeKg ? String(pd.estimatedMonthlyVolumeKg) : '' });
  }, [userProfile?.id]);

  const saveInfo = async () => {
    setInfoSaving(true); setInfoMsg(null);
    await save({ full_name: infoForm.full_name, phone_number: infoForm.phone_number, city: infoForm.city });
    setInfoSaving(false); setEditingInfo(false); setInfoMsg({ type: 'ok', text: 'Información actualizada.' });
    setTimeout(() => setInfoMsg(null), 3000);
  };

  const saveGen = async () => {
    setGenSaving(true); setGenMsg(null);
    await save(undefined, { locationType: genForm.locationType, materialTypesGenerated: genForm.materialTypesGenerated, generationFrequency: genForm.generationFrequency, estimatedMonthlyVolumeKg: genForm.estimatedMonthlyVolumeKg ? Number(genForm.estimatedMonthlyVolumeKg) : null });
    setGenSaving(false); setEditingGen(false); setGenMsg({ type: 'ok', text: 'Información de generación actualizada.' });
    setTimeout(() => setGenMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {(userProfile?.full_name || 'G').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile?.full_name || 'Generador'}</h1>
            <p className="text-emerald-200 text-sm mt-0.5">Generador / Vendedor de materiales</p>
            {userProfile?.isVerified && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-white/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Verificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Publicaciones activas', val: loading ? '—' : activeCount, color: 'emerald' },
          { label: 'Materiales vendidos',   val: loading ? '—' : soldCount,   color: 'emerald' },
          { label: 'Ofertas recibidas',     val: loading ? '—' : offersCount, color: 'emerald' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <div className={`text-2xl font-bold text-${color}-600`}>{val}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Info + Generation grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Información personal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" />Información personal</h2>
            {!editingInfo
              ? <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-medium"><Pencil className="w-3.5 h-3.5" />Editar</button>
              : <button onClick={() => setEditingInfo(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            }
          </div>
          <div className="space-y-4">
            <Field label="Nombre completo" value={infoForm.full_name} editing={editingInfo}>
              <input value={infoForm.full_name} onChange={(e) => setInfoForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Email" value={userProfile?.email || ''} editing={false}><></></Field>
            <Field label="Teléfono" value={infoForm.phone_number} editing={editingInfo}>
              <input value={infoForm.phone_number} onChange={(e) => setInfoForm((f) => ({ ...f, phone_number: e.target.value }))} className={inputCls} placeholder="Ej: 81 1234 5678" />
            </Field>
            <Field label="Ciudad" value={infoForm.city} editing={editingInfo}>
              <input value={infoForm.city} onChange={(e) => setInfoForm((f) => ({ ...f, city: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          {editingInfo && <SaveBar saving={infoSaving} msg={infoMsg} onSave={saveInfo} onCancel={() => setEditingInfo(false)} />}
          {!editingInfo && infoMsg && <p className="mt-3 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">{infoMsg.text}</p>}
        </div>

        {/* Información de generación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Recycle className="w-4 h-4 text-emerald-600" />Generación de residuos</h2>
            {!editingGen
              ? <button onClick={() => setEditingGen(true)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-medium"><Pencil className="w-3.5 h-3.5" />Editar</button>
              : <button onClick={() => setEditingGen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            }
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Building className="w-3 h-3" />Tipo de generador</p>
              {editingGen ? (
                <select value={genForm.locationType} onChange={(e) => setGenForm((f) => ({ ...f, locationType: e.target.value }))} className={inputCls}>
                  <option value="">Seleccionar…</option>
                  {LOCATION_TYPES.map((t) => <option key={t.val} value={t.val}>{t.label}</option>)}
                </select>
              ) : <p className="font-medium">{LOCATION_TYPES.find((t) => t.val === genForm.locationType)?.label || <span className="text-gray-400 italic text-xs">No especificado</span>}</p>}
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Materiales generados</p>
              {editingGen ? (
                <ChipSelector options={MATERIAL_CHIPS} selected={genForm.materialTypesGenerated} onChange={(v) => setGenForm((f) => ({ ...f, materialTypesGenerated: v }))} />
              ) : genForm.materialTypesGenerated.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{genForm.materialTypesGenerated.map((m) => <span key={m} className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs">{m}</span>)}</div>
              ) : <span className="text-gray-400 text-xs italic">No especificados</span>}
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><BarChart2 className="w-3 h-3" />Frecuencia de generación</p>
              {editingGen ? (
                <select value={genForm.generationFrequency} onChange={(e) => setGenForm((f) => ({ ...f, generationFrequency: e.target.value }))} className={inputCls}>
                  <option value="">Seleccionar…</option>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              ) : <p className="font-medium">{genForm.generationFrequency || <span className="text-gray-400 italic text-xs">No especificada</span>}</p>}
            </div>
            <Field label="Volumen mensual estimado (kg)" value={genForm.estimatedMonthlyVolumeKg ? `${genForm.estimatedMonthlyVolumeKg} kg` : ''} editing={editingGen}>
              <input type="number" value={genForm.estimatedMonthlyVolumeKg} onChange={(e) => setGenForm((f) => ({ ...f, estimatedMonthlyVolumeKg: e.target.value }))} className={inputCls} placeholder="Ej: 50" min="0" />
            </Field>
          </div>
          {editingGen && <SaveBar saving={genSaving} msg={genMsg} onSave={saveGen} onCancel={() => setEditingGen(false)} />}
          {!editingGen && genMsg && <p className="mt-3 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">{genMsg.text}</p>}
        </div>
      </div>

      {/* Mis publicaciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" />Mis publicaciones</h2>
          <Link to="/publicar" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium transition">Publicar material</Link>
        </div>
        {loading ? (
          <div className="py-10 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
        ) : myProducts.length === 0 ? (
          <p className="py-8 text-center text-gray-400 text-sm">Sin publicaciones. <Link to="/publicar" className="text-emerald-700 font-semibold hover:underline">Crear la primera</Link>.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {myProducts.map((p: any) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/listado/${p.id}`} className="font-medium text-sm text-gray-900 hover:underline">{p.title}</Link>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" />{p.municipality} · {p.status} · {new Date(p.createdAt).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-emerald-700 font-bold text-sm">{p.type === 'donacion' || p.price === 0 ? 'Gratis' : `$${p.price}`}</span>
                  <Link to={`/publicar/${p.id}`} className="text-xs text-emerald-600 hover:underline font-medium">Editar</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;

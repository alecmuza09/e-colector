import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Package, Truck, Shield, CheckCircle, Loader, MapPin,
  Bell, BellOff, Save, ChevronDown, ChevronUp, Search,
  Pencil, X, Phone, Building2, Clock, Award,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Product } from '../../data/mockProducts';
import type { CollectorPunto, CollectorPuntos } from '../../services/collectors';
import {
  useProfileUpdate, toggleChip,
  MATERIAL_CHIPS, COVERAGE_CHIPS, CERT_CHIPS,
} from '../../hooks/useProfileUpdate';

// ─── Fix Leaflet default icons ────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MONTERREY = { lat: 25.6866, lng: -100.3161 };
const DEFAULT_PUNTO: CollectorPunto = { lat: MONTERREY.lat, lng: MONTERREY.lng, address: '' };
type PuntoKey = 'publicar' | 'buscar' | 'acopio';

const PUNTO_CONFIG: Record<PuntoKey, { label: string; emoji: string; description: string }> = {
  publicar: { label: 'Publicar material', emoji: '📦', description: 'Donde tienes material listo para entregar o donar' },
  buscar:   { label: 'Buscar materiales', emoji: '🔍', description: 'Zona de operación — se usa para calcular tu proximidad a nuevas publicaciones' },
  acopio:   { label: 'Centro de acopio', emoji: '♻️', description: 'Planta, almacén o centro de reciclaje' },
};

const BUSINESS_TYPES = [
  { val: 'independent', label: 'Recolector independiente' },
  { val: 'company',     label: 'Empresa recicladora' },
  { val: 'collection_center', label: 'Centro de acopio' },
];

// ─── Chip selector ────────────────────────────────────────────────────────────
const ChipSelector: React.FC<{
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  color?: string;
}> = ({ options, selected, onChange, color = 'purple' }) => (
  <div className="flex flex-wrap gap-1.5 mt-1">
    {options.map((opt) => {
      const active = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(toggleChip(selected, opt))}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
            active
              ? `bg-${color}-600 text-white border-${color}-600`
              : `bg-white text-gray-600 border-gray-200 hover:border-${color}-400 hover:text-${color}-700`
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// ─── Input field ──────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; value: string; editing: boolean; children: React.ReactNode }> = ({
  label, value, editing, children,
}) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    {editing ? children : <p className="font-medium text-sm">{value || <span className="text-gray-400 italic">No especificado</span>}</p>}
  </div>
);

// ─── Map Components ───────────────────────────────────────────────────────────
const MapClickHandler: React.FC<{ onMove: (lat: number, lng: number) => void }> = ({ onMove }) => {
  useMapEvents({ click: (e) => onMove(e.latlng.lat, e.latlng.lng) });
  return null;
};
const DraggableMarker: React.FC<{ position: { lat: number; lng: number }; onDrag: (lat: number, lng: number) => void }> = ({ position, onDrag }) => {
  const ref = useRef<L.Marker>(null);
  return (
    <Marker position={[position.lat, position.lng]} draggable ref={ref}
      eventHandlers={{ dragend: () => { const m = ref.current; if (m) { const p = m.getLatLng(); onDrag(p.lat, p.lng); } } }}
    />
  );
};

const LocationPickerPanel: React.FC<{ puntoKey: PuntoKey; value: CollectorPunto; onChange: (p: CollectorPunto) => void }> = ({ puntoKey, value, onChange }) => {
  const [query, setQuery] = useState(value.address);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [searching, setSearching] = useState(false);
  const timeout = useRef<number>();
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => { setQuery(value.address); }, [value.address]);

  const flyTo = (lat: number, lng: number) => mapRef.current?.flyTo([lat, lng], 15, { duration: 0.6 });

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    clearTimeout(timeout.current);
    if (q.length < 4) { setSuggestions([]); setShowSug(false); return; }
    timeout.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('limit', '5');
        url.searchParams.set('q', `${q}, Nuevo León, México`);
        const res = await fetch(url.toString(), { headers: { 'Accept-Language': 'es' } });
        const json = await res.json();
        setSuggestions((json || []).map((r: any) => ({ display_name: r.display_name, lat: r.lat, lon: r.lon })));
        setShowSug(true);
      } finally { setSearching(false); }
    }, 420);
  }, []);

  const select = (s: any) => {
    const lat = parseFloat(s.lat); const lng = parseFloat(s.lon);
    onChange({ lat, lng, address: s.display_name });
    setQuery(s.display_name); setShowSug(false); flyTo(lat, lng);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query} onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSug(true)}
          placeholder="Buscar dirección…"
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {searching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-44 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i} onMouseDown={() => select(s)} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 cursor-pointer">
                <MapPin className="inline w-3 h-3 mr-1 text-purple-500" />{s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {value.address && <p className="text-xs text-gray-500 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 text-purple-500 shrink-0" /><span className="line-clamp-2">{value.address}</span></p>}
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 200 }}>
        <MapContainer center={[value.lat || MONTERREY.lat, value.lng || MONTERREY.lng]} zoom={14} style={{ width: '100%', height: '100%' }} ref={mapRef as any}>
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onMove={(lat, lng) => onChange({ lat, lng, address: value.address })} />
          <DraggableMarker position={{ lat: value.lat || MONTERREY.lat, lng: value.lng || MONTERREY.lng }} onDrag={(lat, lng) => onChange({ lat, lng, address: value.address })} />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 text-center">Clic en el mapa o arrastra el marcador para ajustar</p>
    </div>
  );
};

// ─── SaveBar ──────────────────────────────────────────────────────────────────
const SaveBar: React.FC<{ saving: boolean; msg: any; onSave: () => void; onCancel: () => void }> = ({ saving, msg, onSave, onCancel }) => (
  <div className="mt-4 space-y-2">
    {msg && <p className={`text-sm rounded-xl px-4 py-2 ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
    <div className="flex gap-2">
      <button onClick={onCancel} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
      <button onClick={onSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
        {saving ? <><Loader className="w-4 h-4 animate-spin" />Guardando…</> : <><Save className="w-4 h-4" />Guardar</>}
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CollectorProfile = () => {
  const { userProfile } = useAuth();
  const { save, saving, saveMsg, setSaveMsg } = useProfileUpdate();

  // — Products —
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  // — Info edit state —
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ full_name: '', phone_number: '', city: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<any>(null);

  // — Services edit state —
  const [editingServices, setEditingServices] = useState(false);
  const [svcForm, setSvcForm] = useState({
    businessType: '',
    materialsHandled: [] as string[],
    serviceCoverageAreas: [] as string[],
    operatingSchedule: '',
    certifications: [] as string[],
  });
  const [svcSaving, setSvcSaving] = useState(false);
  const [svcMsg, setSvcMsg] = useState<any>(null);

  // — Notification settings —
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState<1 | 3 | 5>(3);
  const [puntos, setPuntos] = useState<CollectorPuntos>({ publicar: { ...DEFAULT_PUNTO }, buscar: { ...DEFAULT_PUNTO }, acopio: { ...DEFAULT_PUNTO } });
  const [activePunto, setActivePunto] = useState<PuntoKey>('buscar');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState<any>(null);

  // Load products
  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const { data } = await supabase.from('products').select('id,title,price,currency,municipality,type,created_at,status,user_id,image_url,image_urls,address').eq('user_id', userProfile.id).order('created_at', { ascending: false }).limit(20);
        setMyProducts((data || []).map((p: any) => ({
          id: p.id, userId: p.user_id, title: p.title, price: Number(p.price), currency: p.currency || 'MXN',
          municipality: p.municipality || '', address: p.address || '', imageUrl: (p.image_urls?.[0]) || p.image_url || '',
          imageUrls: p.image_urls || [], type: p.type, createdAt: p.created_at, status: p.status,
          description: '', category: 'Otros', tags: [], location: '', latitude: 25.6866, longitude: -100.3161, verified: false,
        })) as any);
      } finally { setLoading(false); }
    };
    load();
  }, [userProfile?.id]);

  // Sync forms from profile
  useEffect(() => {
    if (!userProfile) return;
    setInfoForm({ full_name: userProfile.full_name || '', phone_number: userProfile.phone_number || '', city: userProfile.city || '' });
    const pd = userProfile.profile_data || {};
    setSvcForm({ businessType: pd.businessType || '', materialsHandled: pd.materialsHandled || [], serviceCoverageAreas: pd.serviceCoverageAreas || [], operatingSchedule: pd.operatingSchedule || '', certifications: pd.certifications || [] });
    setNotifEnabled(!!pd.notificaciones_activas);
    setRadiusKm(pd.radio_notificaciones_km || 3);
    const p: CollectorPuntos = pd.puntos || {};
    setPuntos({ publicar: p.publicar ? { ...p.publicar } : { ...DEFAULT_PUNTO }, buscar: p.buscar ? { ...p.buscar } : { ...DEFAULT_PUNTO }, acopio: p.acopio ? { ...p.acopio } : { ...DEFAULT_PUNTO } });
  }, [userProfile?.id]);

  const saveInfo = async () => {
    setInfoSaving(true); setInfoMsg(null);
    await save({ full_name: infoForm.full_name, phone_number: infoForm.phone_number, city: infoForm.city });
    setInfoSaving(false); setEditingInfo(false); setInfoMsg({ type: 'ok', text: 'Información actualizada.' });
    setTimeout(() => setInfoMsg(null), 3000);
  };

  const saveServices = async () => {
    setSvcSaving(true); setSvcMsg(null);
    await save(undefined, { businessType: svcForm.businessType, materialsHandled: svcForm.materialsHandled, serviceCoverageAreas: svcForm.serviceCoverageAreas, operatingSchedule: svcForm.operatingSchedule, certifications: svcForm.certifications });
    setSvcSaving(false); setEditingServices(false); setSvcMsg({ type: 'ok', text: 'Servicios actualizados.' });
    setTimeout(() => setSvcMsg(null), 3000);
  };

  const saveNotifs = async () => {
    if (!userProfile?.id) return;
    setNotifSaving(true); setNotifMsg(null);
    try {
      const newPd = { ...(userProfile.profile_data || {}), notificaciones_activas: notifEnabled, radio_notificaciones_km: radiusKm, puntos };
      const { error } = await supabase.from('users').update({ profile_data: newPd }).eq('id', userProfile.id);
      if (error) throw error;
      setNotifMsg({ type: 'ok', text: 'Configuración guardada.' });
    } catch (e: any) { setNotifMsg({ type: 'err', text: e?.message }); }
    finally { setNotifSaving(false); setTimeout(() => setNotifMsg(null), 3000); }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {(userProfile?.full_name || 'R').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile?.full_name || 'Recolector'}</h1>
            <p className="text-purple-200 text-sm mt-0.5">Recolector / Empresa de Reciclaje</p>
            {userProfile?.isVerified && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-white/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Verificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info + Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Información de la empresa */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-600" />Información</h2>
            {!editingInfo
              ? <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium"><Pencil className="w-3.5 h-3.5" />Editar</button>
              : <button onClick={() => setEditingInfo(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            }
          </div>
          <div className="space-y-4">
            <Field label="Nombre completo" value={infoForm.full_name} editing={editingInfo}>
              <input value={infoForm.full_name} onChange={(e) => setInfoForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} placeholder="Nombre de la empresa o persona" />
            </Field>
            <Field label="Email" value={userProfile?.email || ''} editing={false}><></></Field>
            <Field label="Teléfono" value={infoForm.phone_number} editing={editingInfo}>
              <input value={infoForm.phone_number} onChange={(e) => setInfoForm((f) => ({ ...f, phone_number: e.target.value }))} className={inputCls} placeholder="Ej: 81 1234 5678" />
            </Field>
            <Field label="Ciudad" value={infoForm.city} editing={editingInfo}>
              <input value={infoForm.city} onChange={(e) => setInfoForm((f) => ({ ...f, city: e.target.value }))} className={inputCls} placeholder="Ciudad" />
            </Field>
          </div>
          {editingInfo && <SaveBar saving={infoSaving} msg={infoMsg} onSave={saveInfo} onCancel={() => setEditingInfo(false)} />}
          {!editingInfo && infoMsg && <p className="mt-3 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">{infoMsg.text}</p>}
        </div>

        {/* Servicios ofrecidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Truck className="w-4 h-4 text-purple-600" />Servicios</h2>
            {!editingServices
              ? <button onClick={() => setEditingServices(true)} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium"><Pencil className="w-3.5 h-3.5" />Editar</button>
              : <button onClick={() => setEditingServices(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            }
          </div>
          <div className="space-y-4 text-sm">
            {/* Tipo de negocio */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Tipo de negocio</p>
              {editingServices ? (
                <select value={svcForm.businessType} onChange={(e) => setSvcForm((f) => ({ ...f, businessType: e.target.value }))} className={inputCls}>
                  <option value="">Seleccionar…</option>
                  {BUSINESS_TYPES.map((b) => <option key={b.val} value={b.val}>{b.label}</option>)}
                </select>
              ) : (
                <p className="font-medium">{BUSINESS_TYPES.find((b) => b.val === svcForm.businessType)?.label || <span className="text-gray-400 italic">No especificado</span>}</p>
              )}
            </div>
            {/* Materiales */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Materiales que manejo</p>
              {editingServices ? (
                <ChipSelector options={MATERIAL_CHIPS} selected={svcForm.materialsHandled} onChange={(v) => setSvcForm((f) => ({ ...f, materialsHandled: v }))} />
              ) : svcForm.materialsHandled.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{svcForm.materialsHandled.map((m) => <span key={m} className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs">{m}</span>)}</div>
              ) : <span className="text-gray-400 text-xs italic">No especificados</span>}
            </div>
            {/* Zonas */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Zonas de cobertura</p>
              {editingServices ? (
                <ChipSelector options={COVERAGE_CHIPS} selected={svcForm.serviceCoverageAreas} onChange={(v) => setSvcForm((f) => ({ ...f, serviceCoverageAreas: v }))} />
              ) : svcForm.serviceCoverageAreas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{svcForm.serviceCoverageAreas.map((z) => <span key={z} className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs">{z}</span>)}</div>
              ) : <span className="text-gray-400 text-xs italic">No especificadas</span>}
            </div>
            {/* Horario */}
            <div>
              <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Horario</p>
              {editingServices ? (
                <input value={svcForm.operatingSchedule} onChange={(e) => setSvcForm((f) => ({ ...f, operatingSchedule: e.target.value }))} className={inputCls} placeholder="Ej: Lun–Vie 8am–6pm" />
              ) : <p className="font-medium">{svcForm.operatingSchedule || <span className="text-gray-400 italic">No especificado</span>}</p>}
            </div>
            {/* Certificaciones */}
            <div>
              <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Award className="w-3 h-3" />Certificaciones</p>
              {editingServices ? (
                <ChipSelector options={CERT_CHIPS} selected={svcForm.certifications} onChange={(v) => setSvcForm((f) => ({ ...f, certifications: v }))} />
              ) : svcForm.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{svcForm.certifications.map((c) => <span key={c} className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs">{c}</span>)}</div>
              ) : <span className="text-gray-400 text-xs italic">No especificadas</span>}
            </div>
          </div>
          {editingServices && <SaveBar saving={svcSaving} msg={svcMsg} onSave={saveServices} onCancel={() => setEditingServices(false)} />}
          {!editingServices && svcMsg && <p className="mt-3 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">{svcMsg.text}</p>}
        </div>
      </div>

      {/* ═══ NOTIFICACIONES DE PROXIMIDAD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition" onClick={() => setSettingsOpen((v) => !v)}>
          <div className="flex items-center gap-3">
            {notifEnabled ? <Bell className="w-5 h-5 text-purple-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
            <div className="text-left">
              <p className="font-semibold text-gray-800">Notificaciones de proximidad</p>
              <p className="text-xs text-gray-500 mt-0.5">{notifEnabled ? `Activadas · Radio de ${radiusKm} km` : 'Desactivadas'}</p>
            </div>
          </div>
          {settingsOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {settingsOpen && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800 text-sm">Activar notificaciones por email</p>
                <p className="text-xs text-gray-500 mt-0.5">Te avisaremos cuando se publique material dentro de tu radio configurado.</p>
              </div>
              <button onClick={() => setNotifEnabled((v) => !v)} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${notifEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${notifEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {notifEnabled && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Radio de notificación</p>
                  <div className="flex gap-3">
                    {([1, 3, 5] as const).map((km) => (
                      <button key={km} onClick={() => setRadiusKm(km)} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${radiusKm === km ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-400'}`}>{km} km</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Puntos de referencia</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(Object.keys(PUNTO_CONFIG) as PuntoKey[]).map((key) => (
                      <button key={key} onClick={() => setActivePunto(key)} className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition ${activePunto === key ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                        <span className="text-xl">{PUNTO_CONFIG[key].emoji}</span>
                        <span className="text-xs font-medium leading-tight">{PUNTO_CONFIG[key].label}</span>
                        {puntos[key]?.address && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg px-3 py-2">{PUNTO_CONFIG[activePunto].emoji} <strong>{PUNTO_CONFIG[activePunto].label}:</strong> {PUNTO_CONFIG[activePunto].description}</p>
                  <LocationPickerPanel key={activePunto} puntoKey={activePunto} value={puntos[activePunto] || { ...DEFAULT_PUNTO }} onChange={(p) => setPuntos((prev) => ({ ...prev, [activePunto]: p }))} />
                </div>
              </>
            )}
            {notifMsg && <p className={`text-sm rounded-xl px-4 py-2.5 ${notifMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{notifMsg.text}</p>}
            <button onClick={saveNotifs} disabled={notifSaving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60 transition">
              {notifSaving ? <><Loader className="w-4 h-4 animate-spin" />Guardando…</> : <><Save className="w-4 h-4" />Guardar configuración</>}
            </button>
          </div>
        )}
      </div>

      {/* Estado de la cuenta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-600" />Estado de la cuenta</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: 'Recolecciones', val: '0' }, { label: 'Clientes', val: '0' }, { label: 'Materiales', val: '0' }].map(({ label, val }) => (
            <div key={label} className="text-center p-4 bg-purple-50 rounded-xl"><div className="text-2xl font-bold text-purple-600">{val}</div><div className="text-xs text-gray-500 mt-0.5">{label}</div></div>
          ))}
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            {userProfile?.isVerified ? <><CheckCircle className="w-7 h-7 text-green-600 mx-auto" /><div className="text-xs text-gray-500 mt-1">Verificado</div></> : <><div className="text-2xl font-bold text-gray-400">—</div><div className="text-xs text-gray-500 mt-0.5">Sin verificar</div></>}
          </div>
        </div>
      </div>

      {/* Mis publicaciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Package className="w-4 h-4 text-purple-600" />Mis publicaciones</h2>
          <Link to="/publicar" className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium transition">Publicar</Link>
        </div>
        {loading ? (
          <div className="py-10 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
        ) : myProducts.length === 0 ? (
          <p className="py-8 text-center text-gray-400 text-sm">Sin publicaciones aún. <Link to="/publicar" className="text-purple-700 font-semibold hover:underline">Crea la primera</Link>.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {myProducts.map((p: any) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/listado/${p.id}`} className="font-medium text-sm text-gray-900 hover:underline">{p.title}</Link>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" />{p.municipality} · {p.status} · {new Date(p.createdAt).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-purple-700 font-bold text-sm">{p.type === 'donacion' || p.price === 0 ? 'Gratis' : `$${p.price}`}</span>
                  <Link to={`/publicar/${p.id}`} className="text-xs text-purple-600 hover:underline font-medium">Editar</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorProfile;

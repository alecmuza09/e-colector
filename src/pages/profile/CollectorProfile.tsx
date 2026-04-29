import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Package, Truck, Shield, CheckCircle, Loader, MapPin,
  Bell, BellOff, Save, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Product } from '../../data/mockProducts';
import type { CollectorPunto, CollectorPuntos } from '../../services/collectors';

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

const PUNTO_CONFIG: Record<PuntoKey, { label: string; emoji: string; description: string; color: string }> = {
  publicar: {
    label: 'Publicar material',
    emoji: '📦',
    description: 'Donde tienes material listo para entregar o donar',
    color: 'bg-blue-600',
  },
  buscar: {
    label: 'Buscar materiales',
    emoji: '🔍',
    description: 'Zona de operación donde vas a recolectar — se usa para calcular tu proximidad a nuevas publicaciones',
    color: 'bg-purple-600',
  },
  acopio: {
    label: 'Centro de acopio',
    emoji: '♻️',
    description: 'Tu planta, almacén o centro de reciclaje donde llevas el material',
    color: 'bg-emerald-600',
  },
};

// ─── MapClickHandler ──────────────────────────────────────────────────────────
const MapClickHandler: React.FC<{ onMove: (lat: number, lng: number) => void }> = ({ onMove }) => {
  useMapEvents({ click: (e) => onMove(e.latlng.lat, e.latlng.lng) });
  return null;
};

// ─── DraggableMarker ─────────────────────────────────────────────────────────
const DraggableMarker: React.FC<{
  position: { lat: number; lng: number };
  onDrag: (lat: number, lng: number) => void;
}> = ({ position, onDrag }) => {
  const markerRef = useRef<L.Marker>(null);
  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const m = markerRef.current;
          if (m) { const p = m.getLatLng(); onDrag(p.lat, p.lng); }
        },
      }}
    />
  );
};

// ─── LocationPickerPanel ──────────────────────────────────────────────────────
const LocationPickerPanel: React.FC<{
  puntoKey: PuntoKey;
  value: CollectorPunto;
  onChange: (p: CollectorPunto) => void;
}> = ({ puntoKey, value, onChange }) => {
  const cfg = PUNTO_CONFIG[puntoKey];
  const [query, setQuery] = useState(value.address);
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef<number>();
  const mapRef = useRef<L.Map | null>(null);

  // Sync query when value.address changes from outside
  useEffect(() => { setQuery(value.address); }, [value.address]);

  // Fly map to new position
  const flyTo = (lat: number, lng: number) => {
    if (mapRef.current) mapRef.current.flyTo([lat, lng], 15, { duration: 0.6 });
  };

  const handleAddressChange = useCallback((q: string) => {
    setQuery(q);
    clearTimeout(timeoutRef.current);
    if (q.length < 4) { setSuggestions([]); setShowSug(false); return; }
    timeoutRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('limit', '5');
        url.searchParams.set('q', `${q}, Nuevo León, México`);
        const res = await fetch(url.toString(), { headers: { 'Accept-Language': 'es' } });
        const json = await res.json();
        const items = (json || []).map((r: any) => ({
          display_name: r.display_name,
          lat: r.lat,
          lon: r.lon,
        }));
        setSuggestions(items);
        setShowSug(items.length > 0);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 420);
  }, []);

  const selectSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    onChange({ lat, lng, address: s.display_name });
    setQuery(s.display_name);
    setShowSug(false);
    flyTo(lat, lng);
  };

  const handleMapMove = (lat: number, lng: number) => {
    onChange({ lat, lng, address: value.address });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSug(true)}
            placeholder="Buscar dirección..."
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searching && (
            <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 cursor-pointer"
                onMouseDown={() => selectSuggestion(s)}
              >
                <MapPin className="inline w-3 h-3 mr-1 text-purple-500" />
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {value.address && (
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-purple-500" />
          <span className="line-clamp-2">{value.address}</span>
        </p>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
        <MapContainer
          center={[value.lat || MONTERREY.lat, value.lng || MONTERREY.lng]}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef as any}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMove={handleMapMove} />
          <DraggableMarker position={{ lat: value.lat || MONTERREY.lat, lng: value.lng || MONTERREY.lng }} onDrag={handleMapMove} />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Haz clic en el mapa o arrastra el marcador para ajustar el punto exacto
      </p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CollectorProfile = () => {
  const { userProfile, refreshProfile } = useAuth() as any;

  // — Products —
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);

  // — Notification settings —
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState<1 | 3 | 5>(3);
  const [puntos, setPuntos] = useState<CollectorPuntos>({
    publicar: { ...DEFAULT_PUNTO },
    buscar:   { ...DEFAULT_PUNTO },
    acopio:   { ...DEFAULT_PUNTO },
  });
  const [activePunto, setActivePunto] = useState<PuntoKey>('buscar');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Load products
  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      setLoading(true);
      setProductsError(null);
      try {
        const selectWithImages =
          'id,title,description,price,currency,location,municipality,address,category,tags,image_url,image_urls,latitude,longitude,verified,type,created_at,status,user_id';
        const selectWithoutImages =
          'id,title,description,price,currency,location,municipality,address,category,tags,image_url,latitude,longitude,verified,type,created_at,status,user_id';

        let data: any[] | null = null;
        let error: any = null;
        {
          const r = await supabase
            .from('products')
            .select(selectWithImages)
            .eq('user_id', userProfile.id)
            .order('created_at', { ascending: false })
            .limit(20);
          data = r.data as any;
          error = r.error;
        }
        if (error && String(error.message || '').toLowerCase().includes('image_urls')) {
          const r2 = await supabase
            .from('products')
            .select(selectWithoutImages)
            .eq('user_id', userProfile.id)
            .order('created_at', { ascending: false })
            .limit(20);
          data = r2.data as any;
          error = r2.error;
        }
        if (error) throw error;

        setMyProducts(
          (data || []).map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            title: p.title,
            description: p.description,
            price: Number(p.price),
            currency: p.currency || 'MXN',
            location: p.location || '',
            municipality: p.municipality || 'Monterrey',
            address: p.address || '',
            category: p.category || 'Otros',
            tags: p.tags || [],
            imageUrl: (p.image_urls && p.image_urls[0]) || p.image_url || '',
            imageUrls: p.image_urls || (p.image_url ? [p.image_url] : []),
            latitude: p.latitude || MONTERREY.lat,
            longitude: p.longitude || MONTERREY.lng,
            verified: !!p.verified,
            type: p.type,
            createdAt: p.created_at,
            status: p.status,
          })) as Product[]
        );
      } catch (e) {
        console.error('Error loading collector products:', e);
        setProductsError('No se pudieron cargar tus publicaciones.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userProfile?.id]);

  // Load notification settings from profile_data
  useEffect(() => {
    const pd = userProfile?.profile_data;
    if (!pd) return;
    setNotifEnabled(!!pd.notificaciones_activas);
    setRadiusKm(pd.radio_notificaciones_km || 3);
    const p: CollectorPuntos = pd.puntos || {};
    setPuntos({
      publicar: p.publicar ? { ...p.publicar } : { ...DEFAULT_PUNTO },
      buscar:   p.buscar   ? { ...p.buscar }   : { ...DEFAULT_PUNTO },
      acopio:   p.acopio   ? { ...p.acopio }   : { ...DEFAULT_PUNTO },
    });
  }, [userProfile?.id]);

  const handleSaveSettings = async () => {
    if (!userProfile?.id) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const newProfileData = {
        ...(userProfile.profile_data || {}),
        notificaciones_activas: notifEnabled,
        radio_notificaciones_km: radiusKm,
        puntos,
      };
      const { error } = await supabase
        .from('users')
        .update({ profile_data: newProfileData })
        .eq('id', userProfile.id);
      if (error) throw error;
      if (refreshProfile) await refreshProfile();
      setSaveMsg({ type: 'ok', text: 'Configuración guardada correctamente.' });
    } catch (e: any) {
      setSaveMsg({ type: 'err', text: e?.message || 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Recolector / Empresa de Reciclaje</h1>
            <p className="text-purple-100 mt-1">Perfil de {userProfile?.full_name || 'Usuario'}</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl">
        <p className="text-gray-700 font-semibold">🚚 Recolector / Empresa de Reciclaje</p>
        <p className="text-gray-600 mt-1 text-sm">
          Ofrezco servicios de recolección, compra o procesamiento de materiales reciclables para particulares o empresas.
        </p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Información de la Empresa
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Nombre', val: userProfile?.full_name },
              { label: 'Email', val: userProfile?.email },
              { label: 'Teléfono', val: userProfile?.phone_number || 'No proporcionado' },
              { label: 'Ciudad', val: userProfile?.city || 'No especificada' },
              {
                label: 'Tipo de Negocio',
                val: userProfile?.profile_data?.businessType === 'independent' ? 'Recolector Independiente'
                  : userProfile?.profile_data?.businessType === 'company' ? 'Empresa Recicladora'
                  : userProfile?.profile_data?.businessType === 'collection_center' ? 'Centro de Acopio'
                  : 'No especificado',
              },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="font-medium">{val || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            Servicios Ofrecidos
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Materiales que manejo</p>
              <div className="flex flex-wrap gap-1.5">
                {userProfile?.profile_data?.materialsHandled?.map((m: string, i: number) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs">{m}</span>
                )) || <span className="text-gray-400 text-xs">No especificados</span>}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Zonas de cobertura</p>
              <div className="flex flex-wrap gap-1.5">
                {userProfile?.profile_data?.serviceCoverageAreas?.map((z: string, i: number) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs">{z}</span>
                )) || <span className="text-gray-400 text-xs">No especificadas</span>}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Horario</p>
              <p className="font-medium">{userProfile?.profile_data?.operatingSchedule || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ NOTIFICACIONES DE PROXIMIDAD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header del acordeón */}
        <button
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition"
          onClick={() => setSettingsOpen((v) => !v)}
        >
          <div className="flex items-center gap-3">
            {notifEnabled
              ? <Bell className="w-5 h-5 text-purple-600" />
              : <BellOff className="w-5 h-5 text-gray-400" />
            }
            <div className="text-left">
              <p className="font-semibold text-gray-800">Notificaciones de proximidad</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {notifEnabled
                  ? `Activadas · Radio de ${radiusKm} km`
                  : 'Desactivadas — actívalas para recibir alertas de material cerca de ti'}
              </p>
            </div>
          </div>
          {settingsOpen
            ? <ChevronUp className="w-5 h-5 text-gray-400" />
            : <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </button>

        {settingsOpen && (
          <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-5">

            {/* Toggle consentimiento */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800 text-sm">Activar notificaciones por email</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Te avisaremos cuando se publique material reciclable dentro de tu radio configurado.
                  Puedes desactivar esto en cualquier momento.
                </p>
              </div>
              <button
                onClick={() => setNotifEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${notifEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 mt-0.5 ${notifEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            {notifEnabled && (
              <>
                {/* Radio selector */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Radio de notificación</p>
                  <div className="flex gap-3">
                    {([1, 3, 5] as const).map((km) => (
                      <button
                        key={km}
                        onClick={() => setRadiusKm(km)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                          radiusKm === km
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-700'
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Se calculará desde tu punto de <strong>búsqueda de materiales</strong>
                  </p>
                </div>

                {/* Selector de tipo de punto */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Puntos de referencia</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(Object.keys(PUNTO_CONFIG) as PuntoKey[]).map((key) => {
                      const cfg = PUNTO_CONFIG[key];
                      const hasPoint = puntos[key]?.address;
                      return (
                        <button
                          key={key}
                          onClick={() => setActivePunto(key)}
                          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition ${
                            activePunto === key
                              ? 'border-purple-600 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          <span className="text-xl">{cfg.emoji}</span>
                          <span className="text-xs font-medium leading-tight">{cfg.label}</span>
                          {hasPoint && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Punto guardado" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Description of active punto */}
                  <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                    <strong>{PUNTO_CONFIG[activePunto].emoji} {PUNTO_CONFIG[activePunto].label}:</strong>{' '}
                    {PUNTO_CONFIG[activePunto].description}
                  </p>

                  {/* Mini map picker */}
                  <LocationPickerPanel
                    key={activePunto}
                    puntoKey={activePunto}
                    value={puntos[activePunto] || { ...DEFAULT_PUNTO }}
                    onChange={(p) => setPuntos((prev) => ({ ...prev, [activePunto]: p }))}
                  />
                </div>
              </>
            )}

            {/* Save button */}
            {saveMsg && (
              <p className={`text-sm rounded-xl px-4 py-2.5 ${saveMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {saveMsg.text}
              </p>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60 transition"
            >
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>
        )}
      </div>

      {/* Estado de la cuenta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Estado de la Cuenta
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Recolecciones', val: '0' },
            { label: 'Clientes activos', val: '0' },
            { label: 'Materiales procesados', val: '0' },
          ].map(({ label, val }) => (
            <div key={label} className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{val}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            {userProfile?.isVerified ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                <div className="text-xs text-gray-600 mt-1">Verificado</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <div className="text-xs text-gray-600 mt-0.5">No verificado</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mis publicaciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Mis publicaciones
          </h2>
          <Link
            to="/publicar"
            className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium transition"
          >
            Publicar material
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
            Cargando publicaciones…
          </div>
        ) : productsError ? (
          <div className="py-6 text-center">
            <p className="inline-block text-left bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded-xl text-sm">
              {productsError}
            </p>
          </div>
        ) : myProducts.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Aún no tienes publicaciones.{' '}
            <Link to="/publicar" className="text-purple-700 font-semibold hover:underline">Crea la primera</Link>.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myProducts.map((p) => (
              <div key={p.id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/listado/${p.id}`} className="font-semibold text-gray-900 hover:underline">
                    {p.title}
                  </Link>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {p.municipality}
                    </span>
                    <span>{p.status}</span>
                    {p.createdAt && <span>{new Date(p.createdAt).toLocaleDateString('es-MX')}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-purple-700 font-bold text-sm">
                    {p.type === 'donacion' || p.price === 0
                      ? 'Gratis'
                      : new Intl.NumberFormat('es-MX', { style: 'currency', currency: p.currency }).format(p.price)}
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-1">
                    <Link to={`/listado/${p.id}`} className="text-xs text-purple-700 hover:underline">Ver ficha</Link>
                    <Link to={`/publicar/${p.id}`} className="text-xs text-purple-700 hover:underline font-semibold">Editar</Link>
                  </div>
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

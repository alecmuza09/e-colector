import React, { useEffect, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { MUNICIPALITY_NAMES } from '../../config/municipalities';

export interface MunicipalityAddressFieldsProps {
  municipality: string;
  address: string;
  onMunicipalityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  /** Si el usuario elige una sugerencia Nominatim, aquí van lat/lng; null si escribe a mano o cambia municipio. */
  onCoordinatesChange?: (coords: { lat: number; lng: number } | null) => void;
  municipalityError?: string;
  addressError?: string;
}

/**
 * Misma lógica que Publicar material: municipio (lista AMM) + dirección con autocompletado Nominatim.
 */
export function MunicipalityAddressFields({
  municipality,
  address,
  onMunicipalityChange,
  onAddressChange,
  onCoordinatesChange,
  municipalityError,
  addressError,
}: MunicipalityAddressFieldsProps) {
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const qRaw = address?.trim();
    if (!qRaw || qRaw.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      setAddressSearchError(null);
      return;
    }

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        setAddressLoading(true);
        setAddressSearchError(null);

        const locationHint = municipality
          ? `${municipality}, Nuevo León, México`
          : 'Monterrey, Nuevo León, México';
        const q = `${qRaw}, ${locationHint}`;

        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '8');
        url.searchParams.set('q', q);

        const res = await fetch(url.toString(), {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept-Language': 'es' },
        });
        if (!res.ok) throw new Error('No se pudo buscar la dirección');
        const json = (await res.json()) as any[];
        const items = (json || []).map((r) => ({
          display_name: String(r.display_name || ''),
          lat: String(r.lat || ''),
          lon: String(r.lon || ''),
        }));
        setSuggestions(items.filter((x) => x.display_name && x.lat && x.lon));
        setShowSuggestions(true);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setAddressSearchError(e?.message || 'Error buscando la dirección');
      } finally {
        setAddressLoading(false);
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [address, municipality]);

  const selectCls = `w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
    municipalityError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;

  const inputCls = `w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
    addressError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;

  const pickSuggestion = (item: { display_name: string; lat: string; lon: string }) => {
    onAddressChange(item.display_name);
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (onCoordinatesChange && Number.isFinite(lat) && Number.isFinite(lng)) {
      onCoordinatesChange({ lat, lng });
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="sm:col-span-2 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reg-municipality" className="block text-sm font-medium text-gray-700 mb-1.5">
            Municipio <span className="text-red-500">*</span>
          </label>
          <select
            id="reg-municipality"
            value={municipality}
            onChange={(e) => {
              onMunicipalityChange(e.target.value);
              onAddressChange('');
              onCoordinatesChange?.(null);
            }}
            className={selectCls}
            required
          >
            <option value="" disabled>
              Selecciona un municipio
            </option>
            {MUNICIPALITY_NAMES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {municipalityError && <p className="text-xs text-red-500 mt-1">{municipalityError}</p>}
        </div>

        <div className="relative">
          <label htmlFor="reg-address" className="block text-sm font-medium text-gray-700 mb-1.5">
            Dirección o zona <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              id="reg-address"
              type="text"
              value={address}
              onChange={(e) => {
                onAddressChange(e.target.value);
                onCoordinatesChange?.(null);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              disabled={!municipality}
              placeholder={municipality ? 'Escribe colonia, calle o punto de referencia…' : 'Primero elige municipio'}
              className={inputCls}
              autoComplete="off"
            />
            {addressLoading && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
          {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
          {addressSearchError && <p className="text-xs text-amber-600 mt-1">{addressSearchError}</p>}

          {showSuggestions && suggestions.length > 0 && municipality && (
            <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
              {suggestions.map((s, idx) => (
                <li
                  key={`${s.lat}-${s.lon}-${idx}`}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0"
                  onMouseDown={() => pickSuggestion(s)}
                >
                  <span className="text-emerald-600 mr-1">📍</span>
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 flex items-start gap-1.5">
        <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-600" />
        Mismo criterio que al <strong className="font-semibold text-gray-700">publicar material</strong>: municipio del Área Metropolitana y dirección con sugerencias de OpenStreetMap al escribir.
      </p>
    </div>
  );
}

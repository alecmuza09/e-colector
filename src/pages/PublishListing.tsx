import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle, Loader, MapPin } from 'lucide-react';
import { createProduct } from '../services/products';
import { useAuth } from '../context/AuthContext';
import { MUNICIPALITY_NAMES, getMunicipalityByName, getRandomCoordinates } from '../config/municipalities';
import { uploadProductImages } from '../services/storage';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

// Interfaz simplificada para los datos del formulario
interface ListingFormData {
  title: string; 
  category: string;
  price: string; // Usar string para manejar input, convertir a número al enviar
  description: string;
  quantity: string; // Nuevo campo para cantidad
  unit: 'kg' | 'Ton' | ''; // Nuevo campo para unidad
  municipality: string; // Municipio
  address: string; // Dirección específica
  type: 'venta' | 'donacion' | ''; // Tipo de publicación
}

// Interfaz para los errores de validación
interface FormErrors {
  title?: string;
  category?: string;
  price?: string;
  description?: string;
  quantity?: string; // Error para cantidad
  unit?: string; // Error para unidad
  municipality?: string;
  address?: string;
  type?: string;
  general?: string; // Para errores generales
}

// Opciones de categoría
// Debe coincidir con el CHECK constraint en public.products.category
const CATEGORIES = ['PET', 'Cartón', 'Vidrio', 'Metal', 'Papel', 'Electrónicos', 'HDPE', 'Otros'];
const UNITS = ['kg', 'Ton'];

const PublishListing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    category: '',
    price: '',
    description: '',
    quantity: '', // Inicializar nuevo campo
    unit: '', // Inicializar nuevo campo
    municipality: '',
    address: '',
    type: 'venta',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(() => ({
    latitude: 25.6866,
    longitude: -100.3161,
  }));
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const previewUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => {
      // liberar blobs
      for (const url of previewUrls) URL.revokeObjectURL(url);
    };
  }, [previewUrls]);

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Ajusta coordenadas base al seleccionar municipio (el usuario puede afinar en el mapa)
  React.useEffect(() => {
    if (!formData.municipality) return;
    const municipality = getMunicipalityByName(formData.municipality);
    const c = municipality ? getRandomCoordinates(municipality) : { latitude: 25.6866, longitude: -100.3161 };
    setCoords({ latitude: c.latitude, longitude: c.longitude });
  }, [formData.municipality]);

  // Autocompletado/búsqueda de dirección (OpenStreetMap Nominatim)
  useEffect(() => {
    const qRaw = formData.address?.trim();
    if (!qRaw || qRaw.length < 4) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setAddressError(null);
      return;
    }

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        setAddressLoading(true);
        setAddressError(null);

        const locationHint = formData.municipality
          ? `${formData.municipality}, Nuevo León, México`
          : 'Monterrey, Nuevo León, México';
        const q = `${qRaw}, ${locationHint}`;

        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '6');
        url.searchParams.set('q', q);

        const res = await fetch(url.toString(), {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept-Language': 'es',
          },
        });
        if (!res.ok) throw new Error('No se pudo buscar la dirección');
        const json = (await res.json()) as any[];
        const items = (json || []).map((r) => ({
          display_name: String(r.display_name || ''),
          lat: String(r.lat || ''),
          lon: String(r.lon || ''),
        }));
        setAddressSuggestions(items.filter((x) => x.display_name && x.lat && x.lon));
        setShowAddressSuggestions(true);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setAddressError(e?.message || 'Error buscando la dirección');
      } finally {
        setAddressLoading(false);
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [formData.address, formData.municipality]);

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
  };

  const MapPicker = () => {
    useMapEvents({
      click(e) {
        setCoords({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });
    return null;
  };

  const MapRecenter = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latitude, longitude]);
    return null;
  };

  const markerIcon = useMemo(() => {
    return L.divIcon({
      html: `<div style="background:#10B981;border:3px solid white;border-radius:9999px;width:18px;height:18px;box-shadow:0 4px 10px rgba(0,0,0,0.25)"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }, []);

  // --- Handlers --- //
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error específico al empezar a corregir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const applyAddressSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    setFormData((prev) => ({ ...prev, address: s.display_name }));
    setCoords({ latitude: Number(s.lat), longitude: Number(s.lon) });
    setShowAddressSuggestions(false);
  };

  // --- Validación --- //
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título del material es obligatorio.';
    if (!formData.category) newErrors.category = 'Selecciona una categoría.';
    if (formData.type === 'venta' && (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      newErrors.price = 'Introduce un precio válido mayor que 0.';
    }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
        newErrors.quantity = 'Introduce una cantidad válida mayor que 0.';
    }
    if (!formData.unit) {
        newErrors.unit = 'Selecciona una unidad.';
    }
    if (!formData.municipality) {
      newErrors.municipality = 'Selecciona un municipio.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Ingresa una dirección.';
    }
    if (formData.description.trim().length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Acciones --- //
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrors({}); // Limpiar errores generales

    try {
      // Combinar título, cantidad y unidad
      const combinedTitle = `${formData.title.trim()} (${formData.quantity} ${formData.unit})`;

      // Subir fotos a Supabase Storage (si el usuario adjuntó)
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const authUserId = (await supabase.auth.getUser()).data.user?.id;
        if (!authUserId) throw new Error('Usuario no autenticado para subir imágenes');
        imageUrls = await uploadProductImages({
          files,
          authUserId,
          productTempKey: `${Date.now()}-${formData.title.trim()}`,
        });
      }

      // Crear nueva publicación en Supabase
      const newProduct = await createProduct({
        title: combinedTitle,
        category: formData.category,
        price: formData.type === 'venta' ? Number(formData.price) : 0,
        description: formData.description.trim(),
        quantity: Number(formData.quantity),
        unit: formData.unit as 'kg' | 'Ton',
        location: `📍 ${formData.municipality}`,
        municipality: formData.municipality,
        address: formData.address.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        tags: [formData.category.toLowerCase(), 'nuevo'],
        image_url: imageUrls[0] || `https://placehold.co/400x300/cccccc/666666?text=${encodeURIComponent(formData.title)}`,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        type: formData.type as 'venta' | 'donacion',
      });

      console.log('Publicación guardada en Supabase:', newProduct);

      // Notificar a usuarios interesados (in-app vía messages)
      try {
        if (newProduct?.id && userProfile?.id) {
          const categoryToInterest: Record<string, string[]> = {
            PET: ['Plástico'],
            HDPE: ['Plástico'],
            Cartón: ['Cartón / Papel'],
            Papel: ['Cartón / Papel'],
            Metal: ['Metales'],
            Electrónicos: ['Electrónicos'],
            Vidrio: ['Vidrio'],
          };
          const interests = categoryToInterest[formData.category] || [];
          if (interests.length > 0) {
            const { data: buyers, error: buyersErr } = await supabase
              .from('users')
              .select('id,profile_data')
              .eq('role', 'buyer')
              .limit(500);
            if (!buyersErr && buyers) {
              const recipients = buyers
                .filter((u: any) => u.id !== userProfile.id)
                .filter((u: any) => {
                  const pd = u.profile_data || {};
                  const wantsAlerts = pd?.recibirAlertas === true || pd?.notificationPreferences?.newListings === true;
                  if (!wantsAlerts) return false;
                  const arr =
                    pd?.materialesInteres ||
                    pd?.materialCategoriesOfInterest ||
                    [];
                  if (!Array.isArray(arr)) return false;
                  return interests.some((x) => arr.includes(x));
                })
                .slice(0, 50);

              if (recipients.length > 0) {
                await supabase.from('messages').insert(
                  recipients.map((r: any) => ({
                    sender_id: userProfile.id,
                    receiver_id: r.id,
                    product_id: newProduct.id,
                    subject: 'Nueva publicación que podría interesarte',
                    content: `Nueva publicación: ${newProduct.title}\nCategoría: ${formData.category}\nMunicipio: ${formData.municipality}\n\nVer ficha: /listado/${newProduct.id}`,
                    read: false,
                  }))
                );
              }
            }
          }
        }
      } catch (notifyErr) {
        console.warn('No se pudieron enviar notificaciones:', notifyErr);
      }

      setSubmissionStatus('success');
      
      // Limpiar formulario y redirigir después de un momento
      setFormData({ title: '', category: '', price: '', description: '', quantity: '', unit: '', municipality: '', address: '', type: 'venta' });
      setFiles([]);
      setTimeout(() => {
          navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error al guardar en Supabase:', error);
      setSubmissionStatus('error');
      setErrors({ general: error.message || 'Error al guardar la publicación. Inténtalo de nuevo.' });
      setIsSubmitting(false);
    }
  };

  // --- Renderizado --- //

  if (submissionStatus === 'success') {
     return (
       <div className="container mx-auto px-4 py-12 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4"/>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">¡Publicación Guardada!</h1>
            <p className="text-gray-600 mb-6">Tu material ha sido publicado correctamente. Serás redirigido al dashboard...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Publicar Nuevo Material</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
          
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título del Material <span className="text-red-500">*</span> </label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Ej: Botellas PET Cristal"
                   className={`w-full p-2 border rounded-lg shadow-sm ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Cantidad y Unidad */} 
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad <span className="text-red-500">*</span></label>
                <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="Ej: 50"
                       min="0.1" step="any" // Permitir decimales y valor mínimo pequeño
                       className={`w-full p-2 border rounded-lg shadow-sm ${errors.quantity ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`} />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
             </div>
             <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unidad <span className="text-red-500">*</span></label>
                 <select id="unit" name="unit" value={formData.unit} onChange={handleChange} required
                        className={`w-full p-2 border rounded-lg shadow-sm bg-white ${errors.unit ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500 h-[42px]`}> {/* Ajustar altura */} 
                  <option value="" disabled>-- Unidad --</option>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                 </select>
                {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
             </div>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} required
                    className={`w-full p-2 border rounded-lg shadow-sm bg-white ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`}>
              <option value="" disabled>-- Selecciona una categoría --</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Tipo de publicación */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Publicación <span className="text-red-500">*</span></label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} required
                    className={`w-full p-2 border rounded-lg shadow-sm bg-white ${errors.type ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`}>
              <option value="venta">💰 Venta</option>
              <option value="donacion">🎁 Donación</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* Precio - Solo mostrar si es venta */}
          {formData.type === 'venta' && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio por Unidad Seleccionada ($) <span className="text-red-500">*</span></label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required placeholder="Ej: 8.50"
                     min="0.01" step="0.01"
                     className={`w-full p-2 border rounded-lg shadow-sm ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          )}
          
          {/* Municipio */}
          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">Municipio <span className="text-red-500">*</span></label>
            <select id="municipality" name="municipality" value={formData.municipality} onChange={handleChange} required
                    className={`w-full p-2 border rounded-lg shadow-sm bg-white ${errors.municipality ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`}>
              <option value="" disabled>-- Selecciona un municipio --</option>
              {MUNICIPALITY_NAMES.map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
            {errors.municipality && <p className="text-red-500 text-xs mt-1">{errors.municipality}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => {
                  handleChange(e);
                  setShowAddressSuggestions(true);
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0) setShowAddressSuggestions(true);
                }}
                required
                placeholder="Ej: Av. Revolución 123, Col. Centro"
                   className={`w-full p-2 border rounded-lg shadow-sm ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 flex items-center gap-2">
                {addressLoading ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              </div>
            </div>
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            {addressError && <p className="text-red-500 text-xs mt-1">{addressError}</p>}
            {showAddressSuggestions && addressSuggestions.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                {addressSuggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={`${s.lat}-${s.lon}-${idx}`}
                    onClick={() => applyAddressSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Sugerencias de dirección por OpenStreetMap. Al elegir una, el mapa coloca un punto estimado.
            </p>
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotografías (opcional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {previewUrls.slice(0, 6).map((src, idx) => (
                  <img key={idx} src={src} className="h-20 w-full object-cover rounded border" alt={`preview-${idx}`} />
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Las fotos se suben a Supabase Storage (bucket <code>product-images</code>).
            </p>
          </div>

          {/* Ubicación en mapa (pin) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación en el mapa</label>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={[coords.latitude, coords.longitude]}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: 240, width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter latitude={coords.latitude} longitude={coords.longitude} />
                <MapPicker />
                <Marker
                  position={[coords.latitude, coords.longitude]}
                  icon={markerIcon}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const latlng = (e.target as any).getLatLng();
                      setCoords({ latitude: latlng.lat, longitude: latlng.lng });
                    },
                  }}
                />
              </MapContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Puedes mover el pin para ajustar la ubicación exacta (clic en el mapa o arrastrar el marcador).
            </p>
          </div>
          
          {/* Descripción */}
          <div>
             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Mínimo 20 caracteres)</span></label>
             <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4}
                       placeholder="Describe el material, su estado (limpio, sucio, etc.), y cualquier detalle relevante para el comprador o recolector."
                       className={`w-full p-2 border rounded-lg shadow-sm ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`}></textarea>
             {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

           {/* Error General */} 
           {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold"><AlertCircle size={16} className="inline mr-2"/> Error: </strong>
              <span className="block sm:inline">{errors.general}</span>
            </div>
           )}

          {/* Botón de Envío */} 
          <div className="pt-4 border-t border-gray-200">
            <button type="submit" disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? 'Publicando...' : <><Save size={18}/> Publicar Material</>}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default PublishListing; 
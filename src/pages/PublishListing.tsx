import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle, Loader, MapPin, Pencil } from 'lucide-react';
import { createProduct, updateProduct } from '../services/products';
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
  const { id: editingId } = useParams<{ id: string }>();
  const isEditing = Boolean(editingId);
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
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
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

  const stripQtySuffix = (title: string, quantity?: number | null, unit?: string | null) => {
    const t = String(title || '').trim();
    const q = quantity != null ? String(quantity) : null;
    const u = unit ? String(unit) : null;
    // Caso ideal: coincide con " ... (q u)"
    if (q && u && t.endsWith(`(${q} ${u})`)) {
      return t.slice(0, t.lastIndexOf('(')).trim();
    }
    // Fallback: regex de último paréntesis
    const m = t.match(/\s*\(([\d.,]+)\s+(kg|Ton)\)\s*$/);
    if (m) return t.replace(/\s*\(([\d.,]+)\s+(kg|Ton)\)\s*$/, '').trim();
    return t;
  };

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Precargar publicación si estamos editando
  useEffect(() => {
    const loadExisting = async () => {
      if (!isEditing || !editingId || !userProfile) return;
      setLoadingExisting(true);
      try {
        // Compatibilidad: si image_urls no existe, reintentamos sin esa columna
        const selectWithImages =
          'id,user_id,title,description,price,currency,category,quantity,unit,municipality,address,latitude,longitude,image_url,image_urls,type,status';
        const selectWithoutImages =
          'id,user_id,title,description,price,currency,category,quantity,unit,municipality,address,latitude,longitude,image_url,type,status';

        let data: any = null;
        let error: any = null;
        {
          const r = await supabase.from('products').select(selectWithImages).eq('id', editingId).single();
          data = r.data as any;
          error = r.error as any;
        }

        if (error && String(error.message || '').toLowerCase().includes('image_urls')) {
          const r2 = await supabase.from('products').select(selectWithoutImages).eq('id', editingId).single();
          data = r2.data as any;
          error = r2.error as any;
        }

        if (error) throw error;
        if (!data) throw new Error('Publicación no encontrada');

        if (data.user_id !== userProfile.id) {
          throw new Error('No tienes permisos para editar esta publicación.');
        }

        const qty = data.quantity != null ? Number(data.quantity) : null;
        const unit = data.unit ? String(data.unit) : '';
        const titleClean = stripQtySuffix(String(data.title || ''), qty, unit);

        setFormData({
          title: titleClean,
          category: String(data.category || ''),
          price: String(data.type === 'donacion' ? '' : Number(data.price || 0)),
          description: String(data.description || ''),
          quantity: qty != null ? String(qty) : '',
          unit: (unit as any) || '',
          municipality: String(data.municipality || ''),
          address: String(data.address || ''),
          type: (data.type as any) || 'venta',
        });
        setCoords({
          latitude: Number(data.latitude || 25.6866),
          longitude: Number(data.longitude || -100.3161),
        });

        const urls = ((data.image_urls as any) || []).filter(Boolean);
        const legacy = data.image_url ? [String(data.image_url)] : [];
        setExistingImageUrls(urls.length > 0 ? urls : legacy);
      } catch (e: any) {
        console.error('Error loading listing for edit:', e);
        setErrors({ general: e?.message || 'No se pudo cargar la publicación para editar.' });
      } finally {
        setLoadingExisting(false);
      }
    };
    loadExisting();
  }, [isEditing, editingId, userProfile?.id]);

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
      let newImageUrls: string[] = [];
      if (files.length > 0) {
        const authUserId = (await supabase.auth.getUser()).data.user?.id;
        if (!authUserId) throw new Error('Usuario no autenticado para subir imágenes');
        newImageUrls = await uploadProductImages({
          files,
          authUserId,
          productTempKey: `${Date.now()}-${formData.title.trim()}`,
        });
      }

      const finalImageUrls = [...existingImageUrls, ...newImageUrls].filter(Boolean).slice(0, 10);
      const primaryImage =
        finalImageUrls[0] || `https://placehold.co/400x300/cccccc/666666?text=${encodeURIComponent(formData.title)}`;

      const payload = {
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
        image_url: primaryImage,
        image_urls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        type: formData.type as 'venta' | 'donacion',
      };

      // Crear o actualizar en Supabase
      const newProduct = isEditing && editingId ? await updateProduct(editingId, payload) : await createProduct(payload);

      console.log('Publicación guardada en Supabase:', newProduct);

      // Notificar a usuarios interesados (in-app vía messages)
      try {
        // Solo notificar cuando se crea (no al editar)
        if (!isEditing && newProduct?.id && userProfile?.id) {
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
      setTimeout(() => {
          if (isEditing && newProduct?.id) {
            navigate(`/listado/${newProduct.id}`);
            return;
          }
          setFormData({ title: '', category: '', price: '', description: '', quantity: '', unit: '', municipality: '', address: '', type: 'venta' });
          setFiles([]);
          setExistingImageUrls([]);
          navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error al guardar en Supabase:', error);
      setSubmissionStatus('error');
      setErrors({ general: error.message || 'Error al guardar la publicación. Inténtalo de nuevo.' });
      setIsSubmitting(false);
    }
  };

  const categoryEmoji: Record<string, string> = {
    PET: '🧴', Cartón: '📦', Vidrio: '🫙', Metal: '🥫',
    Electrónicos: '💻', Papel: '📰', HDPE: '🪣', Otros: '♻️',
  };

  const inputCls = (hasError?: string) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-emerald-500 transition
    ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`;

  const labelCls = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

  // --- Renderizado --- //
  if (submissionStatus === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditing ? '¡Cambios guardados!' : '¡Material publicado!'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isEditing
              ? 'Tu publicación se actualizó correctamente. Redirigiendo...'
              : 'Tu material ya está visible en la plataforma. Redirigiendo...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de página */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isEditing ? <Pencil className="w-6 h-6 text-emerald-600" /> : <span className="text-2xl">📦</span>}
            {isEditing ? 'Editar publicación' : 'Publicar nuevo material'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing
              ? 'Actualiza los datos de tu publicación.'
              : 'Comparte el material que tienes disponible para venta o donación.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingExisting && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Loader className="w-4 h-4 animate-spin text-emerald-600" /> Cargando publicación...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── COLUMNA PRINCIPAL ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Sección 1: Información básica */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs flex items-center justify-center font-bold">1</span>
                  Información del material
                </h2>

                <div className="space-y-4">
                  {/* Título */}
                  <div>
                    <label htmlFor="title" className={labelCls}>
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                      placeholder="Ej: Botellas PET Cristal" className={inputCls(errors.title)} />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  {/* Categoría */}
                  <div>
                    <label htmlFor="category" className={labelCls}>
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setFormData(p => ({ ...p, category: cat })); setErrors(p => ({ ...p, category: undefined })); }}
                          className={`flex flex-col items-center py-2.5 px-1 rounded-xl border text-xs font-medium transition-all
                            ${formData.category === cat
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                            }`}
                        >
                          <span className="text-lg mb-0.5">{categoryEmoji[cat]}</span>
                          <span className="truncate w-full text-center">{cat}</span>
                        </button>
                      ))}
                    </div>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className={labelCls}>Tipo de publicación <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {([['venta', '💰', 'Venta', 'El comprador paga un precio acordado.'],
                         ['donacion', '🎁', 'Donación', 'Entregas el material sin costo.']] as const).map(([val, emoji, label, desc]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, type: val, price: val === 'donacion' ? '' : p.price }))}
                          className={`p-3 rounded-xl border text-left transition-all
                            ${formData.type === val
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-emerald-400'
                            }`}
                        >
                          <div className="text-lg mb-0.5">{emoji}</div>
                          <div className={`text-sm font-semibold ${formData.type === val ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Cantidad y precio */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                  Cantidad {formData.type === 'venta' && 'y precio'}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className={labelCls}>Cantidad <span className="text-red-500">*</span></label>
                    <input type="number" id="quantity" name="quantity" value={formData.quantity}
                      onChange={handleChange} placeholder="Ej: 50" min="0.1" step="any" className={inputCls(errors.quantity)} />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label htmlFor="unit" className={labelCls}>Unidad <span className="text-red-500">*</span></label>
                    <select id="unit" name="unit" value={formData.unit} onChange={handleChange}
                      className={inputCls(errors.unit)}>
                      <option value="" disabled>Selecciona</option>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                  </div>
                </div>

                {formData.type === 'venta' && (
                  <div className="mt-4">
                    <label htmlFor="price" className={labelCls}>
                      Precio por unidad (MXN) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                      <input type="number" id="price" name="price" value={formData.price}
                        onChange={handleChange} placeholder="0.00" min="0.01" step="0.01"
                        className={`${inputCls(errors.price)} pl-7`} />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                )}
              </div>

              {/* Sección 3: Ubicación */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs flex items-center justify-center font-bold">3</span>
                  Ubicación
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="municipality" className={labelCls}>Municipio <span className="text-red-500">*</span></label>
                    <select id="municipality" name="municipality" value={formData.municipality}
                      onChange={handleChange} className={inputCls(errors.municipality)}>
                      <option value="" disabled>Selecciona un municipio</option>
                      {MUNICIPALITY_NAMES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {errors.municipality && <p className="text-red-500 text-xs mt-1">{errors.municipality}</p>}
                  </div>

                  <div>
                    <label htmlFor="address" className={labelCls}>Dirección <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" id="address" name="address" value={formData.address}
                        onChange={e => { handleChange(e); setShowAddressSuggestions(true); }}
                        onFocus={() => { if (addressSuggestions.length > 0) setShowAddressSuggestions(true); }}
                        placeholder="Ej: Av. Revolución 123, Col. Centro" className={inputCls(errors.address)} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {addressLoading ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      </div>
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    {addressError && <p className="text-orange-500 text-xs mt-1">{addressError}</p>}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg z-10 relative">
                        {addressSuggestions.map((s, idx) => (
                          <button type="button" key={`${s.lat}-${s.lon}-${idx}`}
                            onClick={() => applyAddressSuggestion(s)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 text-gray-700">
                            📍 {s.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Sugerencias vía OpenStreetMap. Al elegir una, el mapa se centra automáticamente.</p>
                  </div>

                  {/* Mapa */}
                  <div>
                    <p className={labelCls}>Ajustar pin en el mapa</p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                      <MapContainer center={[coords.latitude, coords.longitude]} zoom={14}
                        scrollWheelZoom={true} style={{ height: 220, width: '100%' }}>
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapRecenter latitude={coords.latitude} longitude={coords.longitude} />
                        <MapPicker />
                        <Marker position={[coords.latitude, coords.longitude]} icon={markerIcon} draggable
                          eventHandlers={{ dragend: e => { const ll = (e.target as any).getLatLng(); setCoords({ latitude: ll.lat, longitude: ll.lng }); } }}
                        />
                      </MapContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Haz clic en el mapa o arrastra el pin para ajustar la ubicación exacta.</p>
                  </div>
                </div>
              </div>

              {/* Sección 4: Fotografías */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs flex items-center justify-center font-bold">4</span>
                  Fotografías <span className="text-xs font-normal text-gray-400 ml-1">(opcional)</span>
                </h2>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecciona o arrastra tus fotos aquí</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Máx. 10 imágenes</span>
                  <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                </label>

                {(existingImageUrls.length > 0 || previewUrls.length > 0) && (
                  <div className="mt-3">
                    {existingImageUrls.length > 0 && (
                      <>
                        <p className="text-xs text-gray-500 mb-2 font-medium">Fotos actuales</p>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {existingImageUrls.slice(0, 8).map((src, idx) => (
                            <img key={`e-${idx}`} src={src} className="h-20 w-full object-cover rounded-lg border border-gray-200" alt="" />
                          ))}
                        </div>
                      </>
                    )}
                    {previewUrls.length > 0 && (
                      <>
                        <p className="text-xs text-gray-500 mb-2 font-medium">Nuevas fotos ({previewUrls.length})</p>
                        <div className="grid grid-cols-4 gap-2">
                          {previewUrls.slice(0, 8).map((src, idx) => (
                            <img key={`p-${idx}`} src={src} className="h-20 w-full object-cover rounded-lg border border-emerald-300" alt="" />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Sección 5: Descripción */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs flex items-center justify-center font-bold">5</span>
                  Descripción <span className="text-red-500 font-normal text-sm">*</span>
                </h2>
                <textarea id="description" name="description" value={formData.description}
                  onChange={handleChange} rows={4}
                  placeholder="Describe el estado del material (limpio, prensado, sin impurezas…), condiciones de entrega, disponibilidad, etc."
                  className={inputCls(errors.description)} />
                <div className="flex justify-between items-center mt-1">
                  {errors.description
                    ? <p className="text-red-500 text-xs">{errors.description}</p>
                    : <p className="text-xs text-gray-400">Mínimo 20 caracteres</p>
                  }
                  <span className={`text-xs ${formData.description.length < 20 ? 'text-gray-400' : 'text-emerald-600'}`}>
                    {formData.description.length} car.
                  </span>
                </div>
              </div>

              {/* Error general */}
              {errors.general && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg text-sm">
                {isSubmitting
                  ? <><Loader className="w-4 h-4 animate-spin" /> {isEditing ? 'Guardando...' : 'Publicando...'}</>
                  : <><Save className="w-4 h-4" /> {isEditing ? 'Guardar cambios' : 'Publicar material'}</>
                }
              </button>
            </div>

            {/* ── SIDEBAR DERECHO ── */}
            <div className="space-y-4">

              {/* Previsualización */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Vista previa</h3>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-28 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
                    {previewUrls[0] || existingImageUrls[0]
                      ? <img src={previewUrls[0] || existingImageUrls[0]} className="h-full w-full object-cover" alt="" />
                      : <span className="text-5xl">{formData.category ? categoryEmoji[formData.category] : '♻️'}</span>
                    }
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {formData.title || 'Título del material'}
                      {formData.quantity && formData.unit ? ` (${formData.quantity} ${formData.unit})` : ''}
                    </p>
                    {formData.category && (
                      <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-1">
                        {formData.category}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                        {formData.type === 'donacion'
                          ? 'Gratis'
                          : formData.price
                            ? `$${Number(formData.price).toFixed(2)}`
                            : '$0.00'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${formData.type === 'donacion' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {formData.type === 'donacion' ? 'Donación' : 'Venta'}
                      </span>
                    </div>
                    {formData.municipality && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {formData.municipality}
                      </p>
                    )}
                  </div>
                </div>

                {/* Consejos */}
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Consejos</h3>
                  {[
                    '📸 Las fotos aumentan las respuestas x3.',
                    '📝 Una buena descripción genera más confianza.',
                    '📍 Una ubicación precisa ayuda a encontrarte.',
                    '💰 El precio sugerido es flexible.',
                  ].map((tip, i) => (
                    <p key={i} className="text-xs text-gray-500 dark:text-gray-400">{tip}</p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishListing; 
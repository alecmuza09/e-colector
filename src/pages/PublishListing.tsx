import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Product } from '../data/mockProducts'; // Corregir ruta de importación

// Interfaz simplificada para los datos del formulario
interface ListingFormData {
  title: string; 
  category: string;
  price: string; // Usar string para manejar input, convertir a número al enviar
  description: string;
  quantity: string; // Nuevo campo para cantidad
  unit: 'kg' | 'Ton' | ''; // Nuevo campo para unidad
}

// Interfaz para los errores de validación
interface FormErrors {
  title?: string;
  category?: string;
  price?: string;
  description?: string;
  quantity?: string; // Error para cantidad
  unit?: string; // Error para unidad
  general?: string; // Para errores generales
}

// Opciones de categoría
const CATEGORIES = ['PET', 'Cartón', 'Vidrio', 'Metal', 'Papel', 'Plástico (Otros)', 'Electrónicos', 'Otros'];
const UNITS = ['kg', 'Ton'];

const PublishListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    category: '',
    price: '',
    description: '',
    quantity: '', // Inicializar nuevo campo
    unit: '', // Inicializar nuevo campo
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // --- Handlers --- //
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error específico al empezar a corregir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // --- Validación --- //
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título del material es obligatorio.';
    // Eliminar validación de cantidad en título
    if (!formData.category) newErrors.category = 'Selecciona una categoría.';
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Introduce un precio por kg válido mayor que 0.';
    }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) { // Validar cantidad
        newErrors.quantity = 'Introduce una cantidad válida mayor que 0.';
    }
    if (!formData.unit) { // Validar unidad
        newErrors.unit = 'Selecciona una unidad.';
    }
    if (formData.description.trim().length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Acciones --- //
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrors({}); // Limpiar errores generales

    try {
      // Leer publicaciones existentes de localStorage
      const storedListingsRaw = localStorage.getItem('userListings');
      const existingListings: Product[] = storedListingsRaw ? JSON.parse(storedListingsRaw) : [];
      
      // Combinar título, cantidad y unidad
      const combinedTitle = `${formData.title.trim()} (${formData.quantity} ${formData.unit})`;

      // Crear nueva publicación
      const newListing: Product & { status: 'activo' } = {
        id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`, // ID único simple
        title: combinedTitle, // Usar título combinado
        category: formData.category as any, // Usar aserción de tipo para compatibilidad
        price: Number(formData.price), // Convertir a número
        description: formData.description.trim(),
        imageUrl: `/api/placeholder/400/300/${formData.category.toLowerCase()}`, // Placeholder image URL
        location: 'Ubicación Simulada', // Dato simulado
        currency: 'MXN', 
        municipality: 'Monterrey', // Simular municipio
        address: 'Dirección Simulada', // Simular dirección
        tags: [formData.category.toLowerCase(), 'nuevo'], // Tags simulados
        latitude: 25.6751, // Simular coordenadas
        longitude: -100.3185, // Simular coordenadas
        verified: false, // Nuevas publicaciones no verificadas por defecto
        type: 'venta', // Asumir venta por defecto
        status: 'activo', // Nueva publicación siempre activa
      };

      // Añadir y guardar en localStorage
      const updatedListings = [...existingListings, newListing];
      localStorage.setItem('userListings', JSON.stringify(updatedListings));

      console.log('Publicación guardada en localStorage:', newListing);
      setSubmissionStatus('success');
      
      // Limpiar formulario y redirigir después de un momento
      setFormData({ title: '', category: '', price: '', description: '', quantity: '', unit: '' }); // Limpiar nuevos campos
      setTimeout(() => {
          navigate('/dashboard'); // Redirigir al dashboard del vendedor
      }, 1500); // Espera 1.5 segundos para mostrar mensaje de éxito

    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      setSubmissionStatus('error');
      setErrors({ general: 'Error al guardar la publicación. Inténtalo de nuevo.' });
    } finally {
      // Mantener isSubmitting en true durante el timeout para evitar doble submit
       if (submissionStatus !== 'success') {
            setIsSubmitting(false);
       } 
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

          {/* Precio */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio por Unidad Seleccionada ($) <span className="text-red-500">*</span></label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required placeholder="Ej: 8.50"
                   min="0.01" step="0.01"
                   className={`w-full p-2 border rounded-lg shadow-sm ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:ring-emerald-500 focus:border-emerald-500`} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
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
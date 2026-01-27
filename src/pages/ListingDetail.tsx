import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, CheckCircle, AlertCircle, ArrowLeft, Loader, User, MessageSquare } from 'lucide-react';
import { Product } from '../data/mockProducts';
import { getProductById } from '../services/products';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type OfferRow = {
  id: string;
  price: number;
  quantity: string | null;
  message: string | null;
  status: string;
  created_at: string;
  buyer?: { full_name?: string | null; email?: string | null } | null;
};

const formatPrice = (price: number, currency: string, type: Product['type']) => {
  if (type === 'donacion' || price === 0) {
    return <span className="text-green-600 font-semibold">Gratis / Donación</span>;
  }
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency }).format(price);
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, userProfile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerQuantity, setOfferQuantity] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [offerDate, setOfferDate] = useState<string>('');
  const [offerTime, setOfferTime] = useState<string>('');

  const [owner, setOwner] = useState<{ id: string; full_name: string; email: string; city: string | null; is_verified: boolean } | null>(null);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        if (data) setOfferPrice(data.type === 'venta' ? data.price : 0);
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const isOwner = useMemo(() => {
    if (!product?.userId || !userProfile?.id) return false;
    return product.userId === userProfile.id;
  }, [product?.userId, userProfile?.id]);

  useEffect(() => {
    const loadOwner = async () => {
      if (!product?.userId) return;
      const { data, error } = await supabase
        .from('users')
        .select('id,full_name,email,city,is_verified')
        .eq('id', product.userId)
        .single();
      if (!error && data) {
        setOwner(data as any);
      }
    };
    loadOwner();
  }, [product?.userId]);

  useEffect(() => {
    const loadOffers = async () => {
      if (!product?.id) return;
      if (!isAuthenticated || !userProfile) return;
      setOffersLoading(true);
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('id,price,quantity,message,status,created_at,buyer:buyer_id(full_name,email)')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOffers((data || []) as any);
      } catch (e) {
        console.error('Error loading offers:', e);
      } finally {
        setOffersLoading(false);
      }
    };
    loadOffers();
  }, [product?.id, isAuthenticated, userProfile?.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader className="animate-spin h-8 w-8 mx-auto text-emerald-600" />
        <p className="mt-4 text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">¡Error!</h1>
        <p className="text-gray-600">No se encontró el listado solicitado.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-emerald-600 hover:underline">
          <ArrowLeft size={16}/> Volver al inicio
        </Link>
      </div>
    );
  }

  const images = (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl]).filter(Boolean);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError(null);
    setOfferSuccess(null);
    if (!isAuthenticated || !userProfile) {
      setOfferError('Debes iniciar sesión para enviar una oferta.');
      return;
    }
    if (!product.userId) {
      setOfferError('No se encontró el dueño de la publicación.');
      return;
    }
    if (isOwner) {
      setOfferError('No puedes enviar una oferta a tu propia publicación.');
      return;
    }
    if (!userProfile.is_verified) {
      setOfferError('Para ofertar necesitas ser un usuario verificado.');
      return;
    }

    const priceToSend = product.type === 'donacion' ? 0 : Number(offerPrice || 0);
    if (product.type === 'venta' && (!priceToSend || priceToSend <= 0)) {
      setOfferError('Introduce un precio válido.');
      return;
    }

    setOfferLoading(true);
    try {
      const composedMessage = [
        offerMessage?.trim() ? offerMessage.trim() : null,
        offerDate ? `Fecha sugerida: ${offerDate}` : null,
        offerTime ? `Hora sugerida: ${offerTime}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const { data: createdOffer, error } = await supabase
        .from('offers')
        .insert({
          product_id: product.id,
          buyer_id: userProfile.id,
          price: priceToSend,
          quantity: offerQuantity?.trim() || null,
          message: composedMessage || null,
          status: 'pendiente',
        })
        .select('id')
        .single();
      if (error) throw error;

      // Notificar al dueño del producto (mensaje in-app)
      await supabase.from('messages').insert({
        sender_id: userProfile.id,
        receiver_id: product.userId,
        product_id: product.id,
        subject: 'Nueva oferta',
        content: `Recibiste una oferta para: ${product.title}\n\nPrecio: ${priceToSend} ${product.currency}\nCantidad: ${offerQuantity || '—'}\n\n${composedMessage || ''}`.trim(),
        read: false,
      });

      setOfferSuccess('Oferta enviada. El vendedor/recolector fue notificado.');

      // refrescar lista
      if (createdOffer?.id) {
        const { data: refreshed } = await supabase
          .from('offers')
          .select('id,price,quantity,message,status,created_at,buyer:buyer_id(full_name,email)')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });
        setOffers((refreshed || []) as any);
      }
    } catch (e: any) {
      console.error('Error creating offer:', e);
      setOfferError(e?.message || 'No se pudo enviar la oferta.');
    } finally {
      setOfferLoading(false);
    }
  };

  const getStatusBadge = () => {
    return (
      <span className={`bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium`}>
        Disponible
      </span>
    );
  };
  
  const priceDisplay = formatPrice(product.price, product.currency, product.type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-96">
          <img
            src={images[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                  onClick={handlePrevImage}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  →
                </button>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {product.location.replace('📍 ', '')}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.category === 'PET' ? 'bg-blue-100 text-blue-700' : product.category === 'Cartón' ? 'bg-yellow-100 text-yellow-700' : product.category === 'Vidrio' ? 'bg-green-100 text-green-700' : product.category === 'Metal' ? 'bg-red-100 text-red-700' : product.category === 'Electrónicos' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                  {product.category}
                </span>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
               <div>
                  <h2 className="text-lg font-semibold mb-2">Descripción detallada</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Información Adicional</h2>
                   <dl className="space-y-1 text-sm">
                     <div className="flex">
                       <dt className="w-28 flex-shrink-0 text-gray-500">Municipio:</dt>
                       <dd>{product.municipality}</dd>
                     </div>
                     <div className="flex">
                       <dt className="w-28 flex-shrink-0 text-gray-500">Dirección aprox.:</dt>
                       <dd>{product.address}</dd> 
                     </div>
                     <div className="flex">
                       <dt className="w-28 flex-shrink-0 text-gray-500">Tipo:</dt>
                       <dd className={`font-medium ${product.type === 'donacion' ? 'text-green-600' : 'text-blue-600'}`}>{product.type === 'donacion' ? 'Donación' : 'Venta'}</dd>
                     </div>
                   </dl>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2">Publicado por</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-500">
                      {(owner?.full_name || product.municipality).charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{owner?.full_name || `Usuario de ${product.municipality}`}</p>
                      {owner?.city && <p className="text-sm text-gray-600">{owner.city}</p>}
                      {product.createdAt && (
                        <p className="text-sm text-gray-500">Publicado el {new Date(product.createdAt).toLocaleString('es-MX')}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {(owner?.is_verified || product.verified) && (
                          <span className="flex items-center text-sm text-emerald-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ofertas (solo si eres dueño o si eres quien ofertó / estás autenticado) */}
                {isAuthenticated && userProfile && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Ofertas
                    </h2>
                    {offersLoading ? (
                      <div className="text-sm text-gray-500">Cargando ofertas...</div>
                    ) : offers.length === 0 ? (
                      <div className="text-sm text-gray-500">Aún no hay ofertas para esta publicación.</div>
                    ) : (
                      <div className="space-y-3">
                        {(isOwner ? offers : offers.filter((o) => o.buyer?.email === userProfile.email)).slice(0, 10).map((o) => (
                          <div key={o.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: product.currency }).format(Number(o.price))}
                              </div>
                              <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString('es-MX')}</div>
                            </div>
                            {isOwner && (
                              <div className="text-sm text-gray-700 mt-1">
                                {o.buyer?.full_name || o.buyer?.email || 'Usuario'} · {o.quantity || '—'}
                              </div>
                            )}
                            {o.message && <pre className="text-xs text-gray-600 whitespace-pre-wrap mt-2">{o.message}</pre>}
                            <div className="text-xs text-gray-500 mt-2">Estatus: {o.status}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-5 sticky top-24">
                <h2 className="text-xl font-bold mb-1 text-center">{product.type === 'donacion' ? 'Solicitar Donación' : 'Hacer una Oferta'}</h2>
                <p className="text-2xl font-bold text-emerald-700 mb-4 text-center">
                  {priceDisplay}
                   {product.type === 'venta' && <span className="text-sm font-normal text-gray-500"> / kg</span>} 
                </p>
                
                {!isAuthenticated ? (
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                     Inicia sesión para enviar una oferta. <Link to="/login" className="underline ml-1">Ir a login</Link>
                   </div>
                ) : !userProfile?.is_verified ? (
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                     <div className="flex items-start gap-3">
                       <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                       <div>
                         <h3 className="font-medium text-yellow-800">Verificación requerida</h3>
                         <p className="text-sm text-yellow-700 mt-1">
                           Para ofertar o solicitar necesitas ser un usuario verificado.
                           <Link to="/perfil" className="text-yellow-800 underline ml-1">
                             Verificar mi cuenta
                           </Link>
                         </p>
                       </div>
                     </div>
                   </div>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    {product.type === 'venta' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio ofertado (MXN/kg)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="number"
                            step="0.50"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(parseFloat(e.target.value))}
                            className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder={product.price.toFixed(2)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad (opcional)
                      </label>
                      <input
                        type="text"
                        value={offerQuantity}
                        onChange={(e) => setOfferQuantity(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ej: 50 kg / 2 ton"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {product.type === 'donacion' ? 'Fecha sugerida de recolección (opcional)' : 'Fecha sugerida (opcional)'}
                      </label>
                      <input
                        type="date"
                        value={offerDate}
                        onChange={(e) => setOfferDate(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora sugerida (opcional)
                      </label>
                      <input
                        type="time"
                        value={offerTime}
                        onChange={(e) => setOfferTime(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje (opcional)
                      </label>
                      <textarea
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        rows={3}
                        placeholder="Escribe un mensaje para el vendedor/recolector..."
                      />
                    </div>

                    {offerError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                        {offerError}
                      </div>
                    )}
                    {offerSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded text-sm">
                        {offerSuccess}
                      </div>
                    )}
                    <button 
                      type="submit"
                      disabled={offerLoading || isOwner}
                      className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition font-medium">
                       {offerLoading ? 'Enviando...' : product.type === 'donacion' ? 'Solicitar Recolección' : 'Enviar Oferta'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
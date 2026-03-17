import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Clock, MessageSquare, CheckCircle, XCircle, Ban, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOfferById, updateOfferStatus, OfferWithDetails } from '../../services/offers';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  aceptada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rechazada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelada: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const OfertaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [offer, setOffer] = useState<OfferWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadOffer();
  }, [id]);

  const loadOffer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOfferById(id!);
      if (!data) setError('Oferta no encontrada.');
      else setOffer(data);
    } catch {
      setError('Error al cargar la oferta.');
    } finally {
      setLoading(false);
    }
  };

  const isBuyer = userProfile?.id === offer?.buyer_id;
  const isSeller = userProfile?.id === offer?.product?.user_id;

  const handleAction = async (action: 'aceptada' | 'rechazada' | 'cancelada') => {
    if (!offer) return;
    setActionLoading(true);
    const ok = await updateOfferStatus(offer.id, action);
    if (ok) {
      setOffer(prev => prev ? { ...prev, status: action } : prev);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{error || 'Oferta no encontrada.'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  const productImage =
    offer.product?.image_urls?.[0] || offer.product?.image_url ||
    `https://placehold.co/400x300/cccccc/666666?text=${encodeURIComponent(offer.product?.title || 'Material')}`;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detalle de Oferta</h1>

      {/* Tarjeta principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        {/* Header con producto */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100 dark:border-gray-700">
          <img
            src={productImage}
            alt={offer.product?.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
              {offer.product?.category}
            </p>
            <h2 className="font-bold text-gray-900 dark:text-white truncate">
              {offer.product?.title || 'Material'}
            </h2>
            <Link
              to={`/listado/${offer.product_id}`}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ver publicación →
            </Link>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLES[offer.status]}`}>
            {STATUS_LABELS[offer.status]}
          </span>
        </div>

        {/* Detalles de la oferta */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad ofertada</p>
              <p className="font-semibold text-gray-900 dark:text-white">{offer.quantity || 'No especificada'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold text-lg mt-0.5 flex-shrink-0">$</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Precio ofertado</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                ${Number(offer.price).toFixed(2)} MXN/kg
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isBuyer ? 'Vendedor' : 'Comprador'}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {isBuyer
                  ? offer.seller?.full_name || 'Vendedor'
                  : offer.buyer?.full_name || 'Comprador'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de envío</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(offer.created_at).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        {offer.message && (
          <div className="px-6 pb-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Mensaje</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl leading-relaxed">
                  {offer.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de acciones según rol y estado */}
      {offer.status === 'pendiente' && isSeller && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Responder oferta</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleAction('aceptada')}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Aceptar oferta
            </button>
            <button
              onClick={() => handleAction('rechazada')}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Rechazar oferta
            </button>
            <Link
              to={`/mensajes`}
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Contactar comprador
            </Link>
          </div>
        </div>
      )}

      {offer.status === 'pendiente' && isBuyer && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Acciones</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleAction('cancelada')}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              <Ban className="h-4 w-4" />
              Retirar oferta
            </button>
            <Link
              to="/mensajes"
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Contactar vendedor
            </Link>
          </div>
        </div>
      )}

      {offer.status === 'aceptada' && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800 dark:text-green-300 mb-1">¡Oferta Aceptada!</p>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                Coordina los detalles de entrega o recolección con la otra parte.
              </p>
              <Link
                to="/mensajes"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Abrir chat
              </Link>
            </div>
          </div>
        </div>
      )}

      {offer.status === 'rechazada' && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-300 mb-1">Oferta Rechazada</p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                Puedes buscar otros materiales disponibles en la plataforma.
              </p>
              <Link
                to="/explorar"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Buscar materiales
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfertaDetail;

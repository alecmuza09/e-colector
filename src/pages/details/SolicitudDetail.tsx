import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, Clock, FileText, CheckCircle,
  XCircle, PauseCircle, MessageSquare, AlertCircle, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRequestById, updateRequestStatus, RequestWithUser } from '../../services/requests';
import { getOffersByRequest, updateOfferStatus, OfferWithDetails } from '../../services/offers';

const STATUS_LABELS: Record<string, string> = {
  activa: 'Activa',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const STATUS_STYLES: Record<string, string> = {
  activa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelada: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

const SolicitudDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [solicitud, setSolicitud] = useState<RequestWithUser | null>(null);
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqData, offersData] = await Promise.all([
        getRequestById(id!),
        getOffersByRequest(id!),
      ]);
      if (!reqData) setError('Solicitud no encontrada.');
      else setSolicitud(reqData);
      setOffers(offersData);
    } catch {
      setError('Error al cargar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = userProfile?.id === solicitud?.user_id;

  const handleStatusChange = async (newStatus: 'activa' | 'completada' | 'cancelada') => {
    if (!solicitud) return;
    setActionLoading('status');
    const ok = await updateRequestStatus(solicitud.id, newStatus);
    if (ok) setSolicitud(prev => prev ? { ...prev, status: newStatus } : prev);
    setActionLoading(null);
  };

  const handleOfferAction = async (offerId: string, action: 'aceptada' | 'rechazada') => {
    setActionLoading(offerId);
    const ok = await updateOfferStatus(offerId, action);
    if (ok) {
      setOffers(prev =>
        prev.map(o => o.id === offerId ? { ...o, status: action } : o)
      );
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{error || 'Solicitud no encontrada.'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

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

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Solicitud: {solicitud.material}
        </h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLES[solicitud.status]}`}>
          {STATUS_LABELS[solicitud.status]}
        </span>
      </div>

      {/* Tarjeta de detalles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Material</p>
            <p className="font-semibold text-gray-900 dark:text-white">{solicitud.material}</p>
          </div>
        </div>

        {solicitud.quantity && (
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold text-lg mt-0.5 flex-shrink-0">#</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad estimada</p>
              <p className="font-semibold text-gray-900 dark:text-white">{solicitud.quantity}</p>
            </div>
          </div>
        )}

        {solicitud.price && (
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold text-lg mt-0.5 flex-shrink-0">$</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Precio ofrecido</p>
              <p className="font-semibold text-gray-900 dark:text-white">{solicitud.price}</p>
            </div>
          </div>
        )}

        {solicitud.municipality && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Municipio</p>
              <p className="font-semibold text-gray-900 dark:text-white">{solicitud.municipality}</p>
            </div>
          </div>
        )}

        {solicitud.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
              <p className="font-semibold text-gray-900 dark:text-white">{solicitud.location}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Publicado el</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(solicitud.created_at).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {solicitud.user && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Solicitante</p>
              <p className="font-semibold text-gray-900 dark:text-white">{solicitud.user.full_name}</p>
              {solicitud.user.is_verified && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Verificado</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Descripción */}
      {solicitud.description && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Descripción</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {solicitud.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ofertas recibidas */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Ofertas de recolectores ({offers.length})
        </h3>
        {offers.length > 0 ? (
          <div className="space-y-3">
            {offers.map(offer => (
              <div
                key={offer.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {offer.buyer?.full_name || 'Recolector'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Precio ofertado: <span className="font-semibold">${Number(offer.price).toFixed(2)}/kg</span>
                    {offer.quantity && ` · ${offer.quantity}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(offer.created_at).toLocaleDateString('es-MX')}
                  </p>
                  {offer.message && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                      "{offer.message}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    offer.status === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : offer.status === 'aceptada'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {OFFER_STATUS_LABELS[offer.status]}
                  </span>
                  {isOwner && offer.status === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleOfferAction(offer.id, 'aceptada')}
                        disabled={actionLoading === offer.id}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleOfferAction(offer.id, 'rechazada')}
                        disabled={actionLoading === offer.id}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rechazar
                      </button>
                    </>
                  )}
                  <Link
                    to="/mensajes"
                    className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Contactar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
            <Package className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Aún no hay ofertas de recolectores para esta solicitud.
            </p>
          </div>
        )}
      </div>

      {/* Acciones del dueño */}
      {isOwner && solicitud.status === 'activa' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex gap-3 flex-wrap">
          <button
            onClick={() => handleStatusChange('cancelada')}
            disabled={actionLoading === 'status'}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
          >
            <PauseCircle className="h-4 w-4" />
            Cancelar solicitud
          </button>
          <button
            onClick={() => handleStatusChange('completada')}
            disabled={actionLoading === 'status'}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Marcar como completada
          </button>
        </div>
      )}
    </div>
  );
};

export default SolicitudDetail;

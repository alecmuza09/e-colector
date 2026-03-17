import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingCart, CheckCircle, Heart, Clock, TrendingUp, Loader, ArrowRight } from 'lucide-react';
import { getOffersByBuyer, OfferWithDetails } from '../../services/offers';
import { getFavorites } from '../../services/favorites';
import { Product } from '../../data/mockProducts';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  aceptada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-500',
};

const BuyerProfile = () => {
  const { userProfile } = useAuth();
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;
    const load = async () => {
      setLoading(true);
      const [offersData, favsData] = await Promise.all([
        getOffersByBuyer(userProfile.id),
        getFavorites(userProfile.id),
      ]);
      setOffers(offersData);
      setFavorites(favsData);
      setLoading(false);
    };
    load();
  }, [userProfile?.id]);

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter(o => o.status === 'aceptada').length;
  const pendingOffers = offers.filter(o => o.status === 'pendiente').length;
  const rejectedOffers = offers.filter(o => o.status === 'rechazada').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile?.full_name || 'Comprador'}</h1>
            <p className="text-blue-100 mt-1 text-sm">Comprador de materiales reciclables</p>
            {userProfile?.isVerified && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-white/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Cuenta verificada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas reales */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin h-7 w-7 text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalOffers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ofertas enviadas</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedOffers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aceptadas</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingOffers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pendientes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">{rejectedOffers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rechazadas</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información personal */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Información
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userProfile?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Teléfono</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userProfile?.phone_number || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Ciudad</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userProfile?.city || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Preferencias de compra */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Preferencias
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1.5">Categorías de interés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile?.profile_data?.materialCategoriesOfInterest?.length > 0
                      ? userProfile.profile_data.materialCategoriesOfInterest.map((cat: string, i: number) => (
                        <span key={i} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs">
                          {cat}
                        </span>
                      ))
                      : <p className="text-gray-400 dark:text-gray-500 text-xs">No especificadas</p>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Volumen preferido</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userProfile?.profile_data?.purchaseVolumePreference === 'bulk' ? 'Granel' : 'Pequeñas cantidades'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Últimas ofertas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Mis últimas ofertas
              </h2>
              <Link to="/dashboard" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {offers.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">
                Aún no has enviado ninguna oferta.
              </p>
            ) : (
              <div className="space-y-3">
                {offers.slice(0, 5).map(offer => (
                  <Link
                    key={offer.id}
                    to={`/oferta/${offer.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {offer.product?.title || 'Material'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${Number(offer.price).toFixed(2)} MXN
                        {offer.quantity && ` · ${offer.quantity}`}
                        {' · '}{new Date(offer.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[offer.status]}`}>
                      {STATUS_LABELS[offer.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Favoritos recientes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                Favoritos guardados
              </h2>
              <Link to="/favoritos" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {favorites.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">
                No tienes publicaciones guardadas aún.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {favorites.slice(0, 6).map(product => (
                  <Link
                    key={product.id}
                    to={`/listado/${product.id}`}
                    className="group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{product.title}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {product.price === 0 ? 'Gratis' : `$${product.price.toFixed(2)}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerProfile;

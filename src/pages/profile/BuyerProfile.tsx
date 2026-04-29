import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingCart, CheckCircle, Heart, Clock, TrendingUp, Loader, ArrowRight, Star, Pencil, X, Save } from 'lucide-react';
import { getOffersByBuyer, OfferWithDetails } from '../../services/offers';
import { getFavorites } from '../../services/favorites';
import { getReviewsForUser, getUserRating, Review, UserRating } from '../../services/reviews';
import { StarRating } from '../../components/StarRating';
import { Product } from '../../data/mockProducts';
import { useProfileUpdate, toggleChip, MATERIAL_CHIPS } from '../../hooks/useProfileUpdate';

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

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

const ChipSelector: React.FC<{ options: string[]; selected: string[]; onChange: (v: string[]) => void }> = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-1.5 mt-1">
    {options.map((opt) => {
      const active = selected.includes(opt);
      return (
        <button key={opt} type="button" onClick={() => onChange(toggleChip(selected, opt))}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700'}`}>
          {opt}
        </button>
      );
    })}
  </div>
);

const BuyerProfile = () => {
  const { userProfile } = useAuth();
  const { save } = useProfileUpdate();
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<UserRating>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ full_name: '', phone_number: '', city: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<any>(null);

  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefsForm, setPrefsForm] = useState({ materialCategoriesOfInterest: [] as string[], purchaseVolumePreference: '' });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<any>(null);

  useEffect(() => {
    if (!userProfile?.id) return;
    const load = async () => {
      setLoading(true);
      const [offersData, favsData, reviewsData, ratingData] = await Promise.all([
        getOffersByBuyer(userProfile.id),
        getFavorites(userProfile.id),
        getReviewsForUser(userProfile.id),
        getUserRating(userProfile.id),
      ]);
      setOffers(offersData);
      setFavorites(favsData);
      setReviews(reviewsData);
      setRating(ratingData);
      setLoading(false);
    };
    load();
  }, [userProfile?.id]);

  useEffect(() => {
    if (!userProfile) return;
    setInfoForm({ full_name: userProfile.full_name || '', phone_number: userProfile.phone_number || '', city: userProfile.city || '' });
    const pd = userProfile.profile_data || {};
    setPrefsForm({
      materialCategoriesOfInterest: pd.materialCategoriesOfInterest || pd.materialesInteres || [],
      purchaseVolumePreference: pd.purchaseVolumePreference || '',
    });
  }, [userProfile?.id]);

  const saveInfo = async () => {
    setInfoSaving(true);
    await save({ full_name: infoForm.full_name, phone_number: infoForm.phone_number, city: infoForm.city });
    setInfoSaving(false); setEditingInfo(false);
    setInfoMsg({ type: 'ok', text: 'Información actualizada.' });
    setTimeout(() => setInfoMsg(null), 3000);
  };

  const savePrefs = async () => {
    setPrefsSaving(true);
    await save(undefined, { materialCategoriesOfInterest: prefsForm.materialCategoriesOfInterest, purchaseVolumePreference: prefsForm.purchaseVolumePreference });
    setPrefsSaving(false); setEditingPrefs(false);
    setPrefsMsg({ type: 'ok', text: 'Preferencias actualizadas.' });
    setTimeout(() => setPrefsMsg(null), 3000);
  };

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
            {rating.count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={rating.average} readonly size="sm" showValue count={rating.count} />
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" />Información</h2>
                {!editingInfo
                  ? <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"><Pencil className="w-3.5 h-3.5" />Editar</button>
                  : <button onClick={() => setEditingInfo(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                }
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Nombre</p>
                  {editingInfo ? <input value={infoForm.full_name} onChange={(e) => setInfoForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} /> : <p className="font-medium">{infoForm.full_name || '—'}</p>}
                </div>
                <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{userProfile?.email || '—'}</p></div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Teléfono</p>
                  {editingInfo ? <input value={infoForm.phone_number} onChange={(e) => setInfoForm((f) => ({ ...f, phone_number: e.target.value }))} className={inputCls} placeholder="Ej: 81 1234 5678" /> : <p className="font-medium">{infoForm.phone_number || <span className="text-gray-400 italic text-xs">No proporcionado</span>}</p>}
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Ciudad</p>
                  {editingInfo ? <input value={infoForm.city} onChange={(e) => setInfoForm((f) => ({ ...f, city: e.target.value }))} className={inputCls} /> : <p className="font-medium">{infoForm.city || <span className="text-gray-400 italic text-xs">No especificada</span>}</p>}
                </div>
              </div>
              {editingInfo && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditingInfo(false)} disabled={infoSaving} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancelar</button>
                  <button onClick={saveInfo} disabled={infoSaving} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5">
                    {infoSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Guardar
                  </button>
                </div>
              )}
              {!editingInfo && infoMsg && <p className="mt-2 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">{infoMsg.text}</p>}
            </div>

            {/* Preferencias de compra */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" />Preferencias</h2>
                {!editingPrefs
                  ? <button onClick={() => setEditingPrefs(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"><Pencil className="w-3.5 h-3.5" />Editar</button>
                  : <button onClick={() => setEditingPrefs(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                }
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Categorías de interés</p>
                  {editingPrefs ? (
                    <ChipSelector options={MATERIAL_CHIPS} selected={prefsForm.materialCategoriesOfInterest} onChange={(v) => setPrefsForm((f) => ({ ...f, materialCategoriesOfInterest: v }))} />
                  ) : prefsForm.materialCategoriesOfInterest.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">{prefsForm.materialCategoriesOfInterest.map((c, i) => <span key={i} className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs">{c}</span>)}</div>
                  ) : <span className="text-gray-400 text-xs italic">No especificadas</span>}
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Volumen de compra</p>
                  {editingPrefs ? (
                    <select value={prefsForm.purchaseVolumePreference} onChange={(e) => setPrefsForm((f) => ({ ...f, purchaseVolumePreference: e.target.value }))} className={inputCls}>
                      <option value="">Seleccionar…</option>
                      <option value="bulk">Granel (grandes cantidades)</option>
                      <option value="small">Pequeñas cantidades</option>
                    </select>
                  ) : <p className="font-medium">{prefsForm.purchaseVolumePreference === 'bulk' ? 'Granel' : prefsForm.purchaseVolumePreference === 'small' ? 'Pequeñas cantidades' : <span className="text-gray-400 italic text-xs">No especificado</span>}</p>}
                </div>
              </div>
              {editingPrefs && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditingPrefs(false)} disabled={prefsSaving} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancelar</button>
                  <button onClick={savePrefs} disabled={prefsSaving} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5">
                    {prefsSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Guardar
                  </button>
                </div>
              )}
              {!editingPrefs && prefsMsg && <p className="mt-2 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">{prefsMsg.text}</p>}
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

          {/* Reseñas recibidas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Mis reseñas ({rating.count})
              {rating.count > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                  · Promedio {rating.average.toFixed(1)} / 5
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">
                Aún no tienes reseñas. Completa transacciones para recibir calificaciones.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 5).map(rev => {
                  const initials = (rev.reviewer?.full_name || rev.reviewer?.email || '?')
                    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={rev.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {rev.reviewer?.full_name || rev.reviewer?.email || 'Usuario'}
                          </p>
                          <StarRating value={rev.rating} readonly size="xs" />
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                            {new Date(rev.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {rev.comment && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{rev.comment}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerProfile;

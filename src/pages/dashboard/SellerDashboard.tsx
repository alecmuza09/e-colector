import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Package, PlusCircle, DollarSign, Clock, CheckCircle, MapPin,
  Edit, Trash2, Loader, ChevronRight, TrendingUp, MessageSquare, ExternalLink, AlertTriangle
} from 'lucide-react';

type UserProduct = {
  id: string; title: string; category: string; price: number;
  type: string; municipality: string; status: string; image_url: string | null;
  created_at: string;
};
type OfferRow = {
  id: string; price: number; quantity: string | null; status: string;
  created_at: string;
  product?: { title?: string } | null;
  buyer?: { full_name?: string; email?: string } | null;
};

const statusBadge = (s: string) => {
  const styles: Record<string, string> = {
    activo:    'bg-emerald-100 text-emerald-700',
    pausado:   'bg-yellow-100 text-yellow-700',
    vendido:   'bg-blue-100 text-blue-700',
    expirado:  'bg-gray-100 text-gray-500',
    pendiente: 'bg-yellow-100 text-yellow-700',
    aceptada:  'bg-emerald-100 text-emerald-700',
    rechazada: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    activo: 'Activo', pausado: 'Pausado', vendido: 'Vendido', expirado: 'Expirado',
    pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[s] || 'bg-gray-100 text-gray-600'}`}>
      {labels[s] || s}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const categoryEmoji: Record<string, string> = {
  PET: '♳', Cartón: '📦', Metal: '🔩', Vidrio: '🍶',
  Electrónicos: '💻', Textiles: '👕', Plástico: '♴', Orgánico: '🌿',
};

export default function SellerDashboard() {
  const { userName, userProfile } = useAuth();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data } = await supabase
        .from('products')
        .select('id,title,category,price,type,municipality,status,image_url,created_at')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
      setProducts((data || []) as any);
      setLoadingProducts(false);

      // Cargar ofertas para mis publicaciones
      if (data && data.length > 0) {
        const productIds = (data as any[]).map(p => p.id);
        setLoadingOffers(true);
        const { data: offersData } = await supabase
          .from('offers')
          .select('id,price,quantity,status,created_at,product:product_id(title),buyer:buyer_id(full_name,email)')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
          .limit(15);
        setOffers((offersData || []) as any);
        setLoadingOffers(false);
      } else {
        setLoadingOffers(false);
      }
    };

    fetchProducts();
  }, [userProfile?.id]);

  const activeProducts  = products.filter(p => p.status === 'activo').length;
  const pendingOffers   = offers.filter(o => o.status === 'pendiente').length;
  const acceptedOffers  = offers.filter(o => o.status === 'aceptada').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Banner: cuenta en verificación */}
      {userProfile && !(userProfile as any).is_verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Cuenta en verificación</p>
            <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
              Tu cuenta está siendo revisada por nuestro equipo. Recibirás una notificación cuando sea aprobada.
              Mientras tanto puedes explorar la plataforma.
            </p>
          </div>
        </div>
      )}

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">♻️ Vendedor / Generador</span>
            <h1 className="text-2xl font-bold mt-2">¡Hola, {userName || 'Vendedor'}!</h1>
            <p className="text-emerald-100 text-sm mt-1">Gestiona tus publicaciones y las ofertas recibidas.</p>
          </div>
          <Link to="/publicar"
            className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors self-start sm:self-auto">
            <PlusCircle className="w-4 h-4" /> Publicar material
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Publicaciones activas" value={activeProducts}  icon={Package}      color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Ofertas pendientes"     value={pendingOffers}  icon={Clock}        color="bg-yellow-100 text-yellow-600" />
        <StatCard label="Ofertas aceptadas"      value={acceptedOffers} icon={CheckCircle}  color="bg-blue-100 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Mis publicaciones */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" /> Mis publicaciones
            </h2>
            <Link to="/publicar" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              Nueva <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingProducts ? (
            <div className="p-6 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">Sin publicaciones aún</p>
              <Link to="/publicar" className="mt-2 inline-flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                <PlusCircle className="w-4 h-4" /> Publicar mi primer material
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {products.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 group">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">{categoryEmoji[p.category] || '♻️'}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.municipality}</span>
                      <span className="text-xs text-emerald-600 font-medium">
                        {p.type === 'donacion' ? 'Donación' : `$${p.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusBadge(p.status)}
                    <Link to={`/publicar/${p.id}`} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ofertas recibidas */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Ofertas recibidas
            </h2>
            <Link to="/mensajes" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              Ver mensajes <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingOffers ? (
            <div className="p-6 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
          ) : offers.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              Aún no tienes ofertas. Las ofertas a tus publicaciones aparecerán aquí.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {offers.slice(0, 8).map(o => (
                <div key={o.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {(o.product as any)?.title || 'Material'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        De: {(o.buyer as any)?.full_name || (o.buyer as any)?.email || 'Usuario'} ·{' '}
                        <span className="text-emerald-600 font-medium">${Number(o.price).toFixed(2)}</span>
                        {o.quantity && ` · ${o.quantity}`}
                      </p>
                    </div>
                    {statusBadge(o.status)}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(o.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/publicar',  icon: PlusCircle,    label: 'Publicar material',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { to: '/explorar',  icon: MapPin,         label: 'Explorar el mapa',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { to: '/mensajes',  icon: MessageSquare,  label: 'Mis mensajes',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { to: '/favoritos', icon: TrendingUp,     label: 'Mis favoritos',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center hover:shadow-sm transition-shadow ${a.color}`}>
            <a.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

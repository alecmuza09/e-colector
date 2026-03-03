import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Search, Package, MessageSquare, ShoppingCart, MapPin,
  Clock, CheckCircle, XCircle, TrendingUp, ExternalLink, Loader, ChevronRight
} from 'lucide-react';

type OfferRow = {
  id: string;
  price: number;
  quantity: string | null;
  status: string;
  created_at: string;
  product?: { title?: string; category?: string; municipality?: string } | null;
};

type ProductRow = {
  id: string;
  title: string;
  category: string;
  price: number;
  type: string;
  municipality: string;
  image_url: string | null;
};

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    aceptada:  'bg-emerald-100 text-emerald-700',
    rechazada: 'bg-red-100 text-red-700',
  };
  const label: Record<string, string> = {
    pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m[s] || 'bg-gray-100 text-gray-600'}`}>
      {label[s] || s}
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

export default function BuyerDashboard() {
  const { userName, userProfile } = useAuth();
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;

    // Cargar mis ofertas enviadas
    const fetchOffers = async () => {
      setLoadingOffers(true);
      const { data } = await supabase
        .from('offers')
        .select('id,price,quantity,status,created_at,product:product_id(title,category,municipality)')
        .eq('buyer_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setOffers((data || []) as any);
      setLoadingOffers(false);
    };

    // Cargar materiales disponibles
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data } = await supabase
        .from('products')
        .select('id,title,category,price,type,municipality,image_url')
        .eq('status', 'activo')
        .neq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(6);
      setProducts((data || []) as any);
      setLoadingProducts(false);
    };

    fetchOffers();
    fetchProducts();
  }, [userProfile?.id]);

  const totalOffers   = offers.length;
  const accepted      = offers.filter(o => o.status === 'aceptada').length;
  const pending       = offers.filter(o => o.status === 'pendiente').length;

  const categoryEmoji: Record<string, string> = {
    PET: '♳', Cartón: '📦', Metal: '🔩', Vidrio: '🍶',
    Electrónicos: '💻', Textiles: '👕', Plástico: '♴', Orgánico: '🌿',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">🏢 Comprador</span>
            <h1 className="text-2xl font-bold mt-2">¡Hola, {userName || 'Comprador'}!</h1>
            <p className="text-blue-100 text-sm mt-1">Encuentra materiales reciclables y gestiona tus compras.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/explorar"
              className="flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              <Search className="w-4 h-4" /> Explorar materiales
            </Link>
            <Link to="/mensajes"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <MessageSquare className="w-4 h-4" /> Mensajes
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Ofertas enviadas"  value={totalOffers} icon={ShoppingCart}   color="bg-blue-100 text-blue-600" />
        <StatCard label="Aceptadas"          value={accepted}    icon={CheckCircle}    color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Pendientes"         value={pending}     icon={Clock}          color="bg-yellow-100 text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Mis ofertas enviadas */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-500" /> Mis ofertas enviadas
            </h2>
            <Link to="/mensajes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver mensajes <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loadingOffers ? (
              <div className="p-6 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
            ) : offers.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Aún no has enviado ofertas.
                <br />
                <Link to="/explorar" className="text-blue-600 hover:underline mt-1 inline-block">Explorar materiales →</Link>
              </div>
            ) : (
              offers.slice(0, 6).map(o => (
                <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="text-2xl w-8 flex-shrink-0">
                    {categoryEmoji[(o.product as any)?.category] || '♻️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {(o.product as any)?.title || 'Material'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{(o.product as any)?.municipality || '—'}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">${Number(o.price).toFixed(2)}</span>
                    </div>
                  </div>
                  {statusBadge(o.status)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Materiales disponibles */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> Materiales disponibles
            </h2>
            <Link to="/explorar" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver mapa <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loadingProducts ? (
              <div className="p-6 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No hay materiales disponibles en este momento.</div>
            ) : (
              products.map(p => (
                <Link key={p.id} to={`/listado/${p.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">{categoryEmoji[p.category] || '♻️'}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.municipality}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.type === 'donacion' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.type === 'donacion' ? 'Donación' : `$${p.price}`}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/explorar', icon: Search,       label: 'Explorar materiales', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { to: '/mensajes', icon: MessageSquare, label: 'Mis mensajes',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { to: '/perfil',   icon: XCircle,       label: 'Mi perfil',           color: 'bg-purple-50 text-purple-700 border-purple-200' },
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

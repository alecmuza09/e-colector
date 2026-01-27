import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Clock, Loader, MessageSquare, Package, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const BentoCard: React.FC<BentoCardProps> = ({ title, children, className = '', hover = true }) => (
  <div
    className={`bg-gradient-to-br from-white via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm ${
      hover ? 'hover:shadow-lg hover:border-emerald-400 transition-all duration-300' : ''
    } ${className}`}
  >
    {title && <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 uppercase tracking-wider">{title}</h3>}
    {children}
  </div>
);

type ActivityItem =
  | { id: string; created_at: string; label: string; icon: string; href?: string }
  | { id: string; created_at: string; label: string; icon: string; href?: string };

export function BentoDashboard() {
  const { isAuthenticated, userProfile, userRole } = useAuth();
  const [loading, setLoading] = useState(true);

  const [publicationsThisMonth, setPublicationsThisMonth] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [contactsThisMonth, setContactsThisMonth] = useState(0);
  const [impactKg, setImpactKg] = useState(0);

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topCategories, setTopCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [topMunicipalities, setTopMunicipalities] = useState<Array<{ name: string; count: number }>>([]);

  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }, []);

  const formatRelative = (iso: string) => {
    const then = new Date(iso).getTime();
    const diffMs = Date.now() - then;
    const mins = Math.max(1, Math.round(diffMs / 60000));
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `Hace ${hrs} h`;
    const days = Math.round(hrs / 24);
    return `Hace ${days} d`;
  };

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !userProfile) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Mensajes sin leer (siempre del usuario)
        const { count: unread, error: unreadErr } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', userProfile.id)
          .eq('read', false);
        if (unreadErr) throw unreadErr;
        setUnreadMessages(unread || 0);

        // Publicaciones del mes + breakdown por categoría/municipio (seller/collector/admin)
        const role = String(userRole || '');
        const isPublisherRole = role === 'seller' || role === 'collector' || role === 'admin';

        let productsMini: Array<{ id: string; title: string; category: string; municipality: string | null; created_at: string; quantity: number | null; unit: string | null }> = [];

        if (isPublisherRole) {
          let q = supabase
            .from('products')
            .select('id,title,category,municipality,created_at,quantity,unit')
            .gte('created_at', startDate)
            .order('created_at', { ascending: false })
            .limit(200);
          if (role !== 'admin') q = q.eq('user_id', userProfile.id);
          const { data: prods, error: prodErr } = await q;
          if (prodErr) throw prodErr;
          productsMini = (prods || []) as any;
          setPublicationsThisMonth(productsMini.length);

          // Impacto (kg equivalentes) basado en quantity+unit del mes
          let sumKg = 0;
          for (const p of productsMini) {
            const qn = p.quantity != null ? Number(p.quantity) : 0;
            const unit = (p.unit || 'kg').toLowerCase();
            sumKg += unit === 'ton' ? qn * 1000 : qn;
          }
          setImpactKg(Math.round(sumKg));

          // Top categorías
          const catMap = new Map<string, number>();
          for (const p of productsMini) catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
          setTopCategories(
            Array.from(catMap.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
          );

          // Municipios
          const munMap = new Map<string, number>();
          for (const p of productsMini) {
            const m = p.municipality || 'Sin municipio';
            munMap.set(m, (munMap.get(m) || 0) + 1);
          }
          setTopMunicipalities(
            Array.from(munMap.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
          );
        } else {
          setPublicationsThisMonth(0);
          setImpactKg(0);
          setTopCategories([]);
          setTopMunicipalities([]);
        }

        // Contactos del mes (aprox = ofertas)
        if (role === 'buyer') {
          const { count: offersSent, error: offErr } = await supabase
            .from('offers')
            .select('id', { count: 'exact', head: true })
            .eq('buyer_id', userProfile.id)
            .gte('created_at', startDate);
          if (offErr) throw offErr;
          setContactsThisMonth(offersSent || 0);
        } else {
          // seller/collector/admin: contar ofertas visibles por RLS en el período
          const { count: offersVisible, error: offErr } = await supabase
            .from('offers')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', startDate);
          if (offErr) throw offErr;
          setContactsThisMonth(offersVisible || 0);
        }

        // Actividad reciente: mezcla de publicaciones (si aplica), mensajes recibidos y ofertas recientes
        const events: ActivityItem[] = [];

        if (String(userRole || '') === 'seller' || String(userRole || '') === 'collector' || String(userRole || '') === 'admin') {
          const qProd = String(userRole || '') === 'admin'
            ? supabase.from('products').select('id,title,created_at').order('created_at', { ascending: false }).limit(3)
            : supabase.from('products').select('id,title,created_at').eq('user_id', userProfile.id).order('created_at', { ascending: false }).limit(3);
          const { data: pRows } = await qProd;
          for (const p of (pRows || []) as any[]) {
            events.push({
              id: `p-${p.id}`,
              created_at: p.created_at,
              icon: '📍',
              label: `Nueva publicación: ${p.title}`,
              href: `/listado/${p.id}`,
            });
          }
        }

        const { data: mRows } = await supabase
          .from('messages')
          .select('id,subject,created_at,product_id')
          .eq('receiver_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(3);
        for (const m of (mRows || []) as any[]) {
          events.push({
            id: `m-${m.id}`,
            created_at: m.created_at,
            icon: '💬',
            label: `Recibiste un mensaje: ${m.subject || 'Mensaje'}`,
            href: '/mensajes',
          });
        }

        if (String(userRole || '') === 'buyer') {
          const { data: oRows } = await supabase
            .from('offers')
            .select('id,created_at,price,product:product_id(title)')
            .eq('buyer_id', userProfile.id)
            .order('created_at', { ascending: false })
            .limit(3);
          for (const o of (oRows || []) as any[]) {
            const title = o.product?.title || 'publicación';
            events.push({
              id: `o-${o.id}`,
              created_at: o.created_at,
              icon: '✅',
              label: `Enviaste una oferta para: ${title}`,
              href: '/mensajes',
            });
          }
        } else {
          const { data: oRows } = await supabase
            .from('offers')
            .select('id,created_at,price,product:product_id(title)')
            .order('created_at', { ascending: false })
            .limit(3);
          for (const o of (oRows || []) as any[]) {
            const title = o.product?.title || 'tu publicación';
            events.push({
              id: `o-${o.id}`,
              created_at: o.created_at,
              icon: '✅',
              label: `Nueva oferta para: ${title}`,
              href: `/mensajes`,
            });
          }
        }

        setRecentActivity(
          events
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );
      } catch (e) {
        console.error('Error loading dashboard stats:', e);
        // Mantener UI con ceros pero sin romper
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, userProfile?.id, userRole, startDate]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm">
        <p className="text-gray-700">Inicia sesión para ver tu actividad.</p>
        <Link to="/login" className="inline-block mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
          Ir a Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen (datos reales) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{publicationsThisMonth}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Publicaciones (30 días)</p>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{unreadMessages}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mensajes sin leer</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-teal-600">{contactsThisMonth}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ofertas/Contactos (30 días)</p>
            </div>
            <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{impactKg.toLocaleString('es-MX')} kg</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Impacto (30 días)</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Actividad reciente + categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BentoCard className="lg:col-span-2" title="Categorías (30 días)">
          {topCategories.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat) => {
                const max = Math.max(...topCategories.map((c) => c.count), 1);
                const pct = Math.round((cat.count / max) * 100);
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-28">{cat.name}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #34d399, #10b981)' }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{cat.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </BentoCard>

        <BentoCard title="Actividad Reciente">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Sin actividad aún.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <span className="text-lg">{a.icon}</span>
                  <div className="min-w-0">
                    {a.href ? (
                      <Link to={a.href} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline">
                        {a.label}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{a.label}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatRelative(a.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BentoCard>
      </div>

      {/* Municipios (solo si hay datos) */}
      {topMunicipalities.length > 0 && (
        <BentoCard title="Municipios (30 días)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topMunicipalities.map((m) => (
              <div
                key={m.name}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{m.name}</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">{m.count}</p>
              </div>
            ))}
          </div>
        </BentoCard>
      )}
    </div>
  );
}


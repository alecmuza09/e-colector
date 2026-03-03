import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Shield,
  Users,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Boxes,
  MessageSquare,
  FileText,
  RefreshCw,
  UserPlus,
  Save,
  TrendingUp,
  Package,
  Award,
  Activity,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RewardRulesAdmin from '../../components/admin/RewardRulesAdmin';

interface UserRow {
  id: string;
  auth_user_id: string;
  role: string;
  full_name: string;
  email: string;
  phone_number?: string;
  city?: string;
  is_verified: boolean;
  created_at: string;
}

type AdminTab = 'resumen' | 'estadisticas' | 'usuarios' | 'contenido' | 'recompensas';

type PlatformStats = {
  usersTotal: number;
  buyers: number;
  sellers: number;
  collectors: number;
  admins: number;
  productsActive: number;
  productsTotal: number;
  offersTotal: number;
  requestsTotal: number;
  messagesTotal: number;
};

type ProductRow = {
  id: string;
  title: string;
  status: string;
  type: string;
  category: string;
  created_at: string;
};

type CreateUserForm = {
  full_name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'collector' | 'admin';
  phone_number: string;
  city: string;
  is_verified: boolean;
  email_confirm: boolean;
};

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'resumen',      label: 'Resumen',      icon: LayoutDashboard },
  { id: 'estadisticas', label: 'Estadísticas', icon: TrendingUp       },
  { id: 'usuarios',     label: 'Usuarios',     icon: Users            },
  { id: 'contenido',    label: 'Contenido',    icon: Boxes            },
  { id: 'recompensas',  label: 'Recompensas',  icon: Award            },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function GrowthChart({
  data,
}: {
  data: Array<{ day: string; users: number; products: number; offers: number }>;
}) {
  const [metric, setMetric] = useState<'users' | 'products' | 'offers'>('users');
  const maxVal = Math.max(...data.map((d) => d[metric]), 1);

  const colors: Record<typeof metric, string> = {
    users:    'bg-blue-500',
    products: 'bg-emerald-500',
    offers:   'bg-amber-500',
  };
  const labels: Record<typeof metric, string> = {
    users:    'Usuarios',
    products: 'Publicaciones',
    offers:   'Ofertas',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(['users', 'products', 'offers'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              metric === m
                ? m === 'users'
                  ? 'bg-blue-500 text-white'
                  : m === 'products'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {labels[m]}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-1 h-36">
        {data.map((d) => {
          const h = maxVal > 0 ? Math.max((d[metric] / maxVal) * 100, d[metric] > 0 ? 8 : 0) : 0;
          const date = new Date(d.day);
          const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex flex-col justify-end" style={{ height: '120px' }}>
                {d[metric] > 0 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {d[metric]}
                  </div>
                )}
                <div
                  className={`w-full rounded-t ${colors[metric]} transition-all`}
                  style={{ height: `${h}%`, minHeight: d[metric] > 0 ? '4px' : '0px' }}
                />
              </div>
              <span className="text-[10px] text-gray-400 leading-none">{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ROLES_LABELS: Record<string, string> = {
  admin: 'Admin', buyer: 'Comprador', seller: 'Vendedor', collector: 'Recolector',
};
const ROLES_COLORS: Record<string, string> = {
  admin:     'bg-red-100 text-red-700',
  buyer:     'bg-blue-100 text-blue-700',
  seller:    'bg-emerald-100 text-emerald-700',
  collector: 'bg-purple-100 text-purple-700',
};

const USERS_PER_PAGE = 12;

export default function AdminConsole() {
  const { userProfile } = useAuth();
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage]             = useState(1);
  const [activeTab, setActiveTab]   = useState<AdminTab>('resumen');
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    usersTotal: 0, buyers: 0, sellers: 0, collectors: 0, admins: 0,
    productsActive: 0, productsTotal: 0, offersTotal: 0,
    requestsTotal: 0, messagesTotal: 0,
  });
  const [recentProducts, setRecentProducts] = useState<ProductRow[]>([]);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [growth, setGrowth] = useState<Array<{ day: string; users: number; products: number; offers: number }>>([]);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [creatingUser, setCreatingUser]     = useState(false);
  const [createError, setCreateError]       = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    full_name: '', email: '', password: '', role: 'buyer',
    phone_number: '', city: '', is_verified: false, email_confirm: true,
  });

  useEffect(() => {
    loadUsers();
    loadStatsAndRecent();
    loadGrowth();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers((data || []) as any);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !term || u.full_name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      const matchesRole   = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalPages  = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const pagedUsers  = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  useEffect(() => { setPage(1); }, [searchTerm, roleFilter]);

  const loadStatsAndRecent = async () => {
    setStatsLoading(true);
    try {
      const count = async (table: string, filters?: Array<{ col: string; val: any }>) => {
        let q = supabase.from(table as any).select('id', { count: 'exact', head: true });
        for (const f of filters || []) q = (q as any).eq(f.col, f.val);
        const { count, error } = await q;
        if (error) throw error;
        return count ?? 0;
      };

      const usersTotal    = users.length || (await count('users'));
      const buyers        = users.filter((u) => u.role === 'buyer').length     || (await count('users', [{ col: 'role', val: 'buyer' }]));
      const sellers       = users.filter((u) => u.role === 'seller').length    || (await count('users', [{ col: 'role', val: 'seller' }]));
      const collectors    = users.filter((u) => u.role === 'collector').length || (await count('users', [{ col: 'role', val: 'collector' }]));
      const admins        = users.filter((u) => u.role === 'admin').length     || (await count('users', [{ col: 'role', val: 'admin' }]));
      const productsActive = await count('products', [{ col: 'status', val: 'activo' }]);
      const productsTotal  = await count('products');
      const offersTotal    = await count('offers');
      const requestsTotal  = await count('requests');
      const messagesTotal  = await count('messages');

      setStats({ usersTotal, buyers, sellers, collectors, admins, productsActive, productsTotal, offersTotal, requestsTotal, messagesTotal });

      const { data: recent } = await supabase.from('products').select('id,title,status,type,category,created_at').order('created_at', { ascending: false }).limit(10);
      setRecentProducts((recent || []) as any);
    } catch (e) {
      console.error('Error loading admin stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadGrowth = async () => {
    setGrowthLoading(true);
    try {
      const days = 14;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const [uRes, pRes, oRes] = await Promise.all([
        supabase.from('users').select('created_at').gte('created_at', since),
        supabase.from('products').select('created_at').gte('created_at', since),
        supabase.from('offers').select('created_at').gte('created_at', since),
      ]);
      const toDayKey = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };
      const init: Record<string, { users: number; products: number; offers: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        init[toDayKey(d.toISOString())] = { users: 0, products: 0, offers: 0 };
      }
      for (const r of (uRes.data || []) as any[]) if (init[toDayKey(r.created_at)]) init[toDayKey(r.created_at)].users++;
      for (const r of (pRes.data || []) as any[]) if (init[toDayKey(r.created_at)]) init[toDayKey(r.created_at)].products++;
      for (const r of (oRes.data || []) as any[]) if (init[toDayKey(r.created_at)]) init[toDayKey(r.created_at)].offers++;
      setGrowth(Object.entries(init).map(([day, v]) => ({ day, ...v })));
    } catch (e) {
      console.error('Error loading growth stats:', e);
    } finally {
      setGrowthLoading(false);
    }
  };

  const getSessionToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const adminFetch = async <T,>(path: string, body?: any): Promise<T> => {
    const token = await getSessionToken();
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body || {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `Error (${res.status})`);
    return json as T;
  };

  const handleDeleteUser = async (user: UserRow) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await adminFetch('/.netlify/functions/admin-delete-user', { user_id: user.id, auth_user_id: user.auth_user_id });
      await loadUsers();
      await loadStatsAndRecent();
    } catch (e: any) {
      alert(e?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleVerification = async (user: UserRow) => {
    try {
      const { error } = await supabase.from('users').update({ is_verified: !user.is_verified }).eq('id', user.id);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_verified: !u.is_verified } : u)));
    } catch {
      alert('Error al actualizar verificación');
    }
  };

  const openCreateUser = () => {
    setCreateError(null);
    setCreateForm({ full_name: '', email: '', password: '', role: 'buyer', phone_number: '', city: '', is_verified: false, email_confirm: true });
    setShowCreateUser(true);
  };

  const submitCreateUser = async () => {
    setCreateError(null);
    if (!createForm.full_name.trim()) return setCreateError('El nombre es obligatorio.');
    if (!createForm.email.trim()) return setCreateError('El email es obligatorio.');
    if (!createForm.password.trim() || createForm.password.length < 8) return setCreateError('La contraseña debe tener al menos 8 caracteres.');
    setCreatingUser(true);
    try {
      await adminFetch('/.netlify/functions/admin-create-user', createForm);
      setShowCreateUser(false);
      await loadUsers();
      await loadStatsAndRecent();
    } catch (e: any) {
      setCreateError(e?.message || 'No se pudo crear el usuario (verifica Netlify Functions)');
    } finally {
      setCreatingUser(false);
    }
  };

  const initials = (name: string) => {
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  };

  const avatarColor = (role: string) => {
    const map: Record<string, string> = { admin: 'bg-red-500', buyer: 'bg-blue-500', seller: 'bg-emerald-500', collector: 'bg-purple-500' };
    return map[role] ?? 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2.5">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Panel de Administración</h1>
              <p className="text-red-200 text-sm">{userProfile?.full_name || 'Super Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => { loadUsers(); loadStatsAndRecent(); loadGrowth(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ══════════════════════ RESUMEN ══════════════════════ */}
        {activeTab === 'resumen' && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Users}        label="Usuarios"     value={stats.usersTotal}    sub={`${stats.admins} admin`}                   color="bg-gray-700"    />
              <StatCard icon={Package}      label="Publicaciones" value={stats.productsActive} sub={`${stats.productsTotal} totales`}          color="bg-emerald-600" />
              <StatCard icon={ArrowUpRight} label="Ofertas"       value={stats.offersTotal}   sub="Totales"                                   color="bg-amber-500"   />
              <StatCard icon={Activity}     label="Solicitudes"   value={stats.requestsTotal} sub="Totales"                                   color="bg-blue-500"    />
              <StatCard icon={MessageSquare} label="Mensajes"     value={stats.messagesTotal} sub="Totales"                                   color="bg-teal-500"    />
            </div>

            {/* Distribución de usuarios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-600" /> Distribución de usuarios
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Compradores',  value: stats.buyers,     color: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700'    },
                    { label: 'Vendedores',   value: stats.sellers,    color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Recolectores', value: stats.collectors, color: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700' },
                    { label: 'Admins',       value: stats.admins,     color: 'bg-red-500',     badge: 'bg-red-50 text-red-700'      },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{row.label}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.badge}`}>{row.value}</span>
                      </div>
                      <MiniBar value={row.value} max={stats.usersTotal} color={row.color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Productos vs Ofertas */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-red-600" /> Actividad de contenido
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Publicaciones activas',  value: stats.productsActive, total: stats.productsTotal,  color: 'bg-emerald-500' },
                    { label: 'Ofertas',                 value: stats.offersTotal,   total: stats.offersTotal,    color: 'bg-amber-500'   },
                    { label: 'Solicitudes',             value: stats.requestsTotal, total: stats.requestsTotal,  color: 'bg-blue-500'    },
                    { label: 'Mensajes',                value: stats.messagesTotal, total: stats.messagesTotal,  color: 'bg-teal-500'    },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{row.label}</span>
                        <span className="text-sm font-bold text-gray-900">{row.value}</span>
                      </div>
                      <MiniBar value={row.value} max={Math.max(stats.productsTotal, stats.offersTotal, stats.requestsTotal, stats.messagesTotal, 1)} color={row.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Últimas publicaciones */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-red-600" />
                <h2 className="text-base font-bold text-gray-900">Últimas publicaciones</h2>
              </div>
              {recentProducts.length === 0 ? (
                <div className="px-6 py-8 text-sm text-gray-400 text-center">Aún no hay publicaciones.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Título', 'Categoría', 'Tipo', 'Estado', 'Fecha'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/60">
                          <td className="px-5 py-3 font-medium text-gray-900">{p.title}</td>
                          <td className="px-5 py-3 text-gray-600">{p.category}</td>
                          <td className="px-5 py-3 text-gray-600">{p.type}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════ ESTADÍSTICAS ══════════════════════ */}
        {activeTab === 'estadisticas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" /> Crecimiento — últimos 14 días
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Nuevos registros diarios por tipo de actividad</p>
                </div>
                <button
                  onClick={loadGrowth}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw className={`w-3 h-3 ${growthLoading ? 'animate-spin' : ''}`} /> Refrescar
                </button>
              </div>
              {growth.length > 0 ? (
                <GrowthChart data={growth} />
              ) : (
                <div className="h-36 flex items-center justify-center text-sm text-gray-400">
                  {growthLoading ? 'Cargando…' : 'Sin datos aún.'}
                </div>
              )}
            </div>

            {/* Tabla de crecimiento */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <h2 className="text-base font-bold text-gray-900">Tabla de crecimiento diario</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Día', 'Usuarios', 'Publicaciones', 'Ofertas'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {growth.map((g) => (
                      <tr key={g.day} className="hover:bg-gray-50/60">
                        <td className="px-5 py-3 text-gray-700">{new Date(g.day).toLocaleDateString('es-MX')}</td>
                        <td className="px-5 py-3">
                          <span className={`font-semibold ${g.users > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{g.users}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-semibold ${g.products > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{g.products}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-semibold ${g.offers > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{g.offers}</span>
                        </td>
                      </tr>
                    ))}
                    {growth.length === 0 && !growthLoading && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">Sin datos aún.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════ USUARIOS ══════════════════════ */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent w-64"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {['all', 'buyer', 'seller', 'collector', 'admin'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          roleFilter === r ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {r === 'all' ? 'Todos' : ROLES_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={openCreateUser}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" /> Crear usuario
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
                {roleFilter !== 'all' && ` · filtro: ${ROLES_LABELS[roleFilter]}`}
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-gray-400">Cargando usuarios…</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Usuario', 'Email', 'Rol', 'Ciudad', 'Verificado', 'Registro', 'Acciones'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/60">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(u.role)}`}>
                                {initials(u.full_name).toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-gray-900 truncate max-w-[120px]">{u.full_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500 truncate max-w-[180px]">{u.email}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLES_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                              {ROLES_LABELS[u.role] ?? u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-500">{u.city || '—'}</td>
                          <td className="px-5 py-3">
                            {u.is_verified
                              ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle className="w-4 h-4" />Sí</span>
                              : <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle className="w-4 h-4" />No</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('es-MX')}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleVerification(u)}
                                title={u.is_verified ? 'Quitar verificación' : 'Verificar'}
                                className={`p-1.5 rounded-lg transition-colors ${u.is_verified ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                              >
                                {u.is_verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Eliminar usuario"
                                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pagedUsers.length === 0 && (
                        <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No se encontraron usuarios.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>Página {page} de {totalPages}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════ CONTENIDO ══════════════════════ */}
        {activeTab === 'contenido' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                <Boxes className="w-4 h-4 text-red-600" /> Resumen de contenido
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Publicaciones activas',  value: stats.productsActive, color: 'text-emerald-600' },
                  { label: 'Publicaciones totales',  value: stats.productsTotal,  color: 'text-gray-700'   },
                  { label: 'Ofertas',                 value: stats.offersTotal,    color: 'text-amber-600'  },
                  { label: 'Solicitudes',             value: stats.requestsTotal,  color: 'text-blue-600'   },
                  { label: 'Mensajes',                value: stats.messagesTotal,  color: 'text-teal-600'   },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className={`text-base font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-red-600" /> Actividad reciente
              </h2>
              {recentProducts.length === 0 ? (
                <div className="text-sm text-gray-400">Sin actividad aún.</div>
              ) : (
                <ul className="space-y-3">
                  {recentProducts.slice(0, 6).map((p) => (
                    <li key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.category} · {p.type} ·{' '}
                          <span className={p.status === 'activo' ? 'text-emerald-600' : 'text-gray-400'}>{p.status}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleString('es-MX')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════ RECOMPENSAS ══════════════════════ */}
        {activeTab === 'recompensas' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Configuración de Puntos y Recompensas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ajusta cuántos puntos otorga cada acción y los umbrales de cada nivel. Los cambios se reflejan de inmediato en la sección de Estadísticas de todos los usuarios.
              </p>
            </div>
            <RewardRulesAdmin />
          </div>
        )}
      </div>

      {/* ══════════════════════ MODAL CREAR USUARIO ══════════════════════ */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <UserPlus className="w-5 h-5 text-red-600" /> Crear nuevo usuario
              </div>
              <button onClick={() => setShowCreateUser(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { label: 'Nombre completo', field: 'full_name', type: 'text', placeholder: 'Juan Pérez' },
                { label: 'Email',           field: 'email',     type: 'email', placeholder: 'correo@ejemplo.com' },
                { label: 'Contraseña',      field: 'password',  type: 'password', placeholder: 'Mínimo 8 caracteres' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(createForm as any)[field]}
                    onChange={(e) => setCreateForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  >
                    <option value="buyer">Comprador</option>
                    <option value="seller">Vendedor</option>
                    <option value="collector">Recolector</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    value={createForm.city}
                    onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Monterrey…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  value={createForm.phone_number}
                  onChange={(e) => setCreateForm((p) => ({ ...p, phone_number: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={createForm.is_verified} onChange={(e) => setCreateForm((p) => ({ ...p, is_verified: e.target.checked }))} className="w-4 h-4 accent-red-600" />
                  Marcar como verificado
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={createForm.email_confirm} onChange={(e) => setCreateForm((p) => ({ ...p, email_confirm: e.target.checked }))} className="w-4 h-4 accent-red-600" />
                  Confirmar email automáticamente
                </label>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{createError}</div>
              )}

              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                Para crear/eliminar usuarios en Auth necesitas Netlify Functions + variables de entorno.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button onClick={() => setShowCreateUser(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm">
                Cancelar
              </button>
              <button
                onClick={submitCreateUser}
                disabled={creatingUser}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                {creatingUser ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

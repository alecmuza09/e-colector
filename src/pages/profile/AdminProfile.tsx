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
  Heart,
  FileText,
  RefreshCw,
  UserPlus,
  Save,
} from 'lucide-react';

interface User {
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

type AdminTab = 'resumen' | 'usuarios' | 'contenido';

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
  favoritesTotal: number;
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

const AdminProfile = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    usersTotal: 0,
    buyers: 0,
    sellers: 0,
    collectors: 0,
    admins: 0,
    productsActive: 0,
    productsTotal: 0,
    offersTotal: 0,
    requestsTotal: 0,
    messagesTotal: 0,
    favoritesTotal: 0,
  });
  const [recentProducts, setRecentProducts] = useState<ProductRow[]>([]);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    full_name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone_number: '',
    city: '',
    is_verified: false,
    email_confirm: true,
  });

  useEffect(() => {
    loadUsers();
    loadStatsAndRecent();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.full_name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const loadStatsAndRecent = async () => {
    setStatsLoading(true);
    try {
      const count = async (table: string, filters?: Array<{ col: string; op: 'eq'; val: any }>) => {
        let q = supabase.from(table as any).select('id', { count: 'exact', head: true });
        for (const f of filters || []) {
          q = (q as any).eq(f.col, f.val);
        }
        const { count, error } = await q;
        if (error) throw error;
        return count ?? 0;
      };

      const usersTotal = users.length || (await count('users'));
      const buyers = users.filter((u) => u.role === 'buyer').length || (await count('users', [{ col: 'role', op: 'eq', val: 'buyer' }]));
      const sellers = users.filter((u) => u.role === 'seller').length || (await count('users', [{ col: 'role', op: 'eq', val: 'seller' }]));
      const collectors = users.filter((u) => u.role === 'collector').length || (await count('users', [{ col: 'role', op: 'eq', val: 'collector' }]));
      const admins = users.filter((u) => u.role === 'admin').length || (await count('users', [{ col: 'role', op: 'eq', val: 'admin' }]));

      const productsActive = await count('products', [{ col: 'status', op: 'eq', val: 'activo' }]);
      const productsTotal = await count('products');
      const offersTotal = await count('offers');
      const requestsTotal = await count('requests');
      const messagesTotal = await count('messages');
      const favoritesTotal = await count('favorites');

      setStats({
        usersTotal,
        buyers,
        sellers,
        collectors,
        admins,
        productsActive,
        productsTotal,
        offersTotal,
        requestsTotal,
        messagesTotal,
        favoritesTotal,
      });

      const { data: recent, error: recentErr } = await supabase
        .from('products')
        .select('id,title,status,type,category,created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (recentErr) throw recentErr;
      setRecentProducts((recent || []) as any);
    } catch (e) {
      console.error('Error loading admin stats:', e);
    } finally {
      setStatsLoading(false);
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
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body || {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || `Error (${res.status})`);
    }
    return json as T;
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      // Importante: eliminar también en auth. Esto se hace vía Netlify Function.
      await adminFetch('/.netlify/functions/admin-delete-user', {
        user_id: user.id,
        auth_user_id: user.auth_user_id,
      });
      loadUsers();
      loadStatsAndRecent();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert((error as any)?.message || 'Error al eliminar usuario (verifica Netlify Functions)');
    }
  };

  const handleToggleVerification = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: !user.is_verified })
        .eq('id', user.id);

      if (error) throw error;
      loadUsers();
      loadStatsAndRecent();
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Error al actualizar verificación');
    }
  };

  const openCreateUser = () => {
    setCreateError(null);
    setCreateForm({
      full_name: '',
      email: '',
      password: '',
      role: 'buyer',
      phone_number: '',
      city: '',
      is_verified: false,
      email_confirm: true,
    });
    setShowCreateUser(true);
  };

  const submitCreateUser = async () => {
    setCreateError(null);
    if (!createForm.full_name.trim()) return setCreateError('El nombre es obligatorio.');
    if (!createForm.email.trim()) return setCreateError('El email es obligatorio.');
    if (!createForm.password.trim() || createForm.password.length < 8) {
      return setCreateError('La contraseña debe tener al menos 8 caracteres.');
    }

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'buyer':
        return 'bg-blue-100 text-blue-700';
      case 'seller':
        return 'bg-emerald-100 text-emerald-700';
      case 'collector':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'buyer':
        return 'Comprador';
      case 'seller':
        return 'Vendedor';
      case 'collector':
        return 'Recolector';
      default:
        return role;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-red-100 mt-1">Bienvenido, {userProfile?.full_name || 'Administrador'}</p>
          </div>
        </div>
      </div>

      {/* Descripción del Rol */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
        <p className="text-gray-700">
          <strong>🛡️ Super Administrador</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Tienes acceso completo al sistema. Puedes crear, editar y administrar usuarios, productos y configuraciones.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Nota: la creación/eliminación de usuarios (Auth) requiere funciones server-side (Netlify Functions) para proteger la clave de servicio.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            activeTab === 'resumen' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Resumen
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            activeTab === 'usuarios' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" /> Usuarios
        </button>
        <button
          onClick={() => setActiveTab('contenido')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            activeTab === 'contenido' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Boxes className="w-4 h-4" /> Contenido
        </button>
        <button
          onClick={loadStatsAndRecent}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          title="Refrescar"
        >
          <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500">Usuarios</div>
              <div className="text-2xl font-bold text-gray-900">{stats.usersTotal}</div>
              <div className="text-xs text-gray-500 mt-1">Admins: {stats.admins}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500">Productos activos</div>
              <div className="text-2xl font-bold text-emerald-700">{stats.productsActive}</div>
              <div className="text-xs text-gray-500 mt-1">Total: {stats.productsTotal}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500">Ofertas</div>
              <div className="text-2xl font-bold text-gray-900">{stats.offersTotal}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500">Solicitudes</div>
              <div className="text-2xl font-bold text-gray-900">{stats.requestsTotal}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500">Mensajes</div>
              <div className="text-2xl font-bold text-gray-900">{stats.messagesTotal}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500">Favoritos</div>
              <div className="text-2xl font-bold text-gray-900">{stats.favoritesTotal}</div>
            </div>
          </div>

          {/* Distribución usuarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-red-600" /> Distribución de usuarios
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-700">{stats.buyers}</div>
                <div className="text-sm text-gray-600">Compradores</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded">
                <div className="text-2xl font-bold text-emerald-700">{stats.sellers}</div>
                <div className="text-sm text-gray-600">Vendedores</div>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-700">{stats.collectors}</div>
                <div className="text-sm text-gray-600">Recolectores</div>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-700">{stats.admins}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
            </div>
          </div>

          {/* Últimos productos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Boxes className="w-5 h-5 text-red-600" /> Últimos productos
            </h2>
            {recentProducts.length === 0 ? (
              <div className="text-sm text-gray-500">Aún no hay productos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estatus</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{p.title}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{p.category}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{p.type}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{p.status}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{new Date(p.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Gestión de Usuarios
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={openCreateUser}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  <UserPlus className="w-4 h-4" /> Crear usuario
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verificado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        {user.phone_number && <div className="text-sm text-gray-500">{user.phone_number}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleVerification(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title={user.is_verified ? 'Desverificar' : 'Verificar'}
                          >
                            {user.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar (Auth + Perfil)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-500">No se encontraron usuarios</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'contenido' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Boxes className="w-5 h-5 text-red-600" /> Contenido (resumen)
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between"><span>Productos (total)</span><span className="font-semibold">{stats.productsTotal}</span></div>
              <div className="flex justify-between"><span>Productos activos</span><span className="font-semibold">{stats.productsActive}</span></div>
              <div className="flex justify-between"><span>Ofertas</span><span className="font-semibold">{stats.offersTotal}</span></div>
              <div className="flex justify-between"><span>Solicitudes</span><span className="font-semibold">{stats.requestsTotal}</span></div>
              <div className="flex justify-between"><span>Mensajes</span><span className="font-semibold">{stats.messagesTotal}</span></div>
              <div className="flex justify-between"><span>Favoritos</span><span className="font-semibold">{stats.favoritesTotal}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-red-600" /> Actividad reciente
            </h2>
            {recentProducts.length === 0 ? (
              <div className="text-sm text-gray-500">Sin actividad aún.</div>
            ) : (
              <ul className="space-y-3">
                {recentProducts.slice(0, 6).map((p) => (
                  <li key={p.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="text-sm font-semibold text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1"><Boxes className="w-3 h-3" /> {p.category}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {p.type}</span>
                      <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" /> {p.status}</span>
                      <span className="text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" /> Crear usuario
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowCreateUser(false)}>
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, full_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Monterrey..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    value={createForm.phone_number}
                    onChange={(e) => setCreateForm((p) => ({ ...p, phone_number: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
                  <input
                    type="checkbox"
                    checked={createForm.is_verified}
                    onChange={(e) => setCreateForm((p) => ({ ...p, is_verified: e.target.checked }))}
                  />
                  Marcar como verificado
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={createForm.email_confirm}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email_confirm: e.target.checked }))}
                />
                Confirmar email automáticamente (recomendado para usuarios creados por admin)
              </label>
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {createError}
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm">
                Para que este botón funcione en Netlify debes configurar las funciones `admin-create-user` y `admin-delete-user`
                con la clave de servicio en variables de entorno.
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateUser(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitCreateUser}
                disabled={creatingUser}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {creatingUser ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;

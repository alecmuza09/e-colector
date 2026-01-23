import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Shield, Users, Settings, Trash2, Edit, Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { UserRole } from '../../types/user';

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

const AdminProfile = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
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

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
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
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Error al actualizar verificación');
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
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-800">{users.length}</div>
          <div className="text-sm text-gray-600">Total de Usuarios</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'buyer').length}
          </div>
          <div className="text-sm text-gray-600">Compradores</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {users.filter(u => u.role === 'seller').length}
          </div>
          <div className="text-sm text-gray-600">Vendedores</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'collector').length}
          </div>
          <div className="text-sm text-gray-600">Recolectores</div>
        </div>
      </div>

      {/* Gestión de Usuarios */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Gestión de Usuarios
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      {user.phone_number && (
                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
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
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
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
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;

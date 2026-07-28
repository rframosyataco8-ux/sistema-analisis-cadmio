import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'ANALISTA',
  });

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    axios.get(`${API_URL}/users`, { headers }).then((r) => setUsers(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users`, form, { headers });
      setShowForm(false);
      setForm({ email: '', password: '', fullName: '', role: 'ANALISTA' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try {
      await axios.patch(`${API_URL}/users/${id}/deactivate`, {}, { headers });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-gray-400 text-sm">Gestión de acceso al sistema (escritorio y móvil)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
        >
          + Nuevo usuario
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo usuario</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <option value="ANALISTA">ANALISTA (Lima - App móvil)</option>
                  <option value="ADMIN">ADMIN (Chincha - Escritorio)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-600 rounded-lg text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-green-600 rounded-lg text-sm font-medium disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="text-left px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="px-5 py-3">{u.fullName}</td>
                <td className="px-5 py-3">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.isActive ? (
                    <span className="text-green-400 text-xs">Activo</span>
                  ) : (
                    <span className="text-red-400 text-xs">Inactivo</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {u.isActive && (
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

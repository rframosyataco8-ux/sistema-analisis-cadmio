import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'ANALISTA',
  });

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setFetching(true);
    setError('');
    try {
      const r = await axios.get(`${API_URL}/users`, { headers });
      setUsers(Array.isArray(r.data) ? r.data : []);
    } catch (err: any) {
      const msg =
        err.response?.status === 401
          ? 'Sesión expirada. Vuelve a iniciar sesión.'
          : err.response?.status === 403
            ? 'No tienes permiso de ADMIN para ver usuarios.'
            : err.code === 'ERR_NETWORK'
              ? 'No se puede conectar al backend (http://localhost:3000). ¿Está corriendo?'
              : err.response?.data?.message || 'Error al cargar usuarios';
      setError(msg);
      setUsers([]);
    } finally {
      setFetching(false);
    }
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
      await load();
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
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Usuarios</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de acceso al sistema (escritorio y móvil)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
          <p className="font-medium">{error}</p>
          <p className="text-xs text-rose-400/80 mt-1">
            Si la base está vacía, en la carpeta backend ejecuta: <code className="font-mono bg-black/30 px-1 rounded">npm run prisma:seed</code>
          </p>
          <button onClick={load} className="mt-2 text-xs underline hover:text-rose-200">
            Reintentar
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-raised w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-5">Nuevo usuario</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nombre completo
                </label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Analista Lima"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="usuario@romex.pe"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  <option value="ANALISTA">ANALISTA (Lima — App móvil)</option>
                  <option value="ADMIN">ADMIN (Chincha — Escritorio)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Nombre</th>
                <th className="table-header">Email</th>
                <th className="table-header">Rol</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fetching && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-slate-500 text-sm">
                    Cargando usuarios…
                  </td>
                </tr>
              )}
              {!fetching &&
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="table-cell font-medium">{u.fullName}</td>
                    <td className="table-cell text-slate-400">{u.email}</td>
                    <td className="table-cell">
                      <span
                        className={
                          u.role === 'ADMIN'
                            ? 'badge bg-violet-950/80 text-violet-300 border border-violet-800/50'
                            : 'badge bg-sky-950/80 text-sky-300 border border-sky-800/50'
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      {u.isActive ? (
                        <span className="badge-conform">Activo</span>
                      ) : (
                        <span className="badge-risk">Inactivo</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {u.isActive && (
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                        >
                          Desactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              {!fetching && !users.length && !error && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-slate-500 text-sm">
                    No hay usuarios. Ejecuta el seed del backend o crea uno con el botón superior.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 card p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-300 mb-1">Usuarios por defecto (tras seed)</p>
        <ul className="space-y-1 text-xs">
          <li>
            <span className="font-mono text-amber-400/90">admin@romex.pe</span> / Admin123! — ADMIN Chincha
          </li>
          <li>
            <span className="font-mono text-amber-400/90">lima@romex.pe</span> / Analista123! — ANALISTA Lima (móvil)
          </li>
        </ul>
      </div>
    </div>
  );
}

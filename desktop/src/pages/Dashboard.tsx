import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${API_URL}/samples`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSamples(res.data))
      .catch(() => {
        localStorage.clear();
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const pendingCount = samples.filter((s) => s.status === 'PENDING_ANALYSIS').length;
  const analyzedCount = samples.filter((s) => s.status === 'ANALYZED' || s.status === 'VALIDATED').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">☕</div>
          <span className="font-semibold">Sistema Inteligente de Análisis de Cadmio</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.fullName} ({user?.role})</span>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Ejecutivo</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Muestras</p>
            <p className="text-3xl font-bold mt-1">{samples.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Pendientes de Análisis</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Analizadas</p>
            <p className="text-3xl font-bold mt-1 text-green-400">{analyzedCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Estado</p>
            <p className="text-lg font-semibold mt-2 text-green-500">● Sistema operativo</p>
          </div>
        </div>

        {/* Tabla simple de muestras */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Últimas muestras</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3">Lote</th>
                  <th className="text-left px-5 py-3">Producto</th>
                  <th className="text-left px-5 py-3">Cadmio</th>
                  <th className="text-left px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {samples.slice(0, 10).map((s) => (
                  <tr key={s.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-5 py-3">{s.loteCode}</td>
                    <td className="px-5 py-3">{s.productType?.name || '-'}</td>
                    <td className="px-5 py-3">{s.cadmium != null ? `${s.cadmium} ppm` : 'Pendiente'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        s.status === 'PENDING_ANALYSIS' ? 'bg-yellow-900 text-yellow-300' :
                        s.status === 'ANALYZED' ? 'bg-green-900 text-green-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {samples.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                      No hay muestras registradas aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

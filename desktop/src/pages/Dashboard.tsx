import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${API_URL}/samples/stats`, { headers }).then((r) => setStats(r.data));
    axios.get(`${API_URL}/samples`, { headers }).then((r) => setSamples(r.data.slice(0, 8)));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Dashboard Ejecutivo</h1>
      <p className="text-gray-400 text-sm mb-6">Resumen general del comportamiento del cadmio</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi title="Total Muestras" value={stats?.total ?? '-'} />
        <Kpi title="Pendientes" value={stats?.pending ?? '-'} color="text-yellow-400" />
        <Kpi title="Analizadas" value={stats?.analyzed ?? '-'} color="text-blue-400" />
        <Kpi title="Validadas" value={stats?.validated ?? '-'} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Kpi
          title="Promedio Cadmio"
          value={stats?.cadmium?.avg != null ? `${stats.cadmium.avg.toFixed(3)} ppm` : '-'}
        />
        <Kpi
          title="Máximo Cadmio"
          value={stats?.cadmium?.max != null ? `${stats.cadmium.max.toFixed(3)} ppm` : '-'}
          color="text-red-400"
        />
        <Kpi
          title="Mínimo Cadmio"
          value={stats?.cadmium?.min != null ? `${stats.cadmium.min.toFixed(3)} ppm` : '-'}
          color="text-green-400"
        />
      </div>

      {/* Tabla rápida */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold">Últimas muestras</h2>
        </div>
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
            {samples.map((s) => (
              <tr key={s.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="px-5 py-3 font-medium">{s.loteCode}</td>
                <td className="px-5 py-3">{s.productType?.name || '-'}</td>
                <td className="px-5 py-3">
                  {s.cadmium != null ? `${Number(s.cadmium).toFixed(3)} ppm` : 'Pendiente'}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {samples.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                  No hay muestras aún. Crea la primera desde la sección Muestras.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ title, value, color = 'text-white' }: { title: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING_ANALYSIS: 'bg-yellow-900/60 text-yellow-300',
    ANALYZED: 'bg-blue-900/60 text-blue-300',
    VALIDATED: 'bg-green-900/60 text-green-300',
    CREATED: 'bg-gray-700 text-gray-300',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-700'}`}>
      {status}
    </span>
  );
}

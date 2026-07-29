import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Reportes() {
  const [samples, setSamples] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${API_URL}/samples`, { headers }).then((r) => setSamples(r.data));
    axios.get(`${API_URL}/samples/stats`, { headers }).then((r) => setStats(r.data));
  }, []);

  const filtered = statusFilter
    ? samples.filter((s) => s.status === statusFilter)
    : samples;

  const exportCSV = () => {
    const headers = ['Lote', 'Producto', 'Peso', 'Productor', 'Cadmio_ppm', 'Estado', 'Origenes', 'Fecha'];
    const rows = filtered.map((s) => [
      s.loteCode,
      s.productType?.name || '',
      s.weight ?? '',
      s.producerName || '',
      s.cadmium != null ? Number(s.cadmium).toFixed(4) : 'PENDIENTE',
      s.status,
      s.origins?.map((o: any) => o.zone.name).join('; ') || '',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_cadmio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-gray-400 text-sm">Genera y exporta reportes de muestras de cadmio</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
        >
          Exportar CSV ({filtered.length})
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-xl font-bold">{stats?.total ?? 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Pendientes</p>
          <p className="text-xl font-bold text-yellow-400">{stats?.pending ?? 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Promedio ppm</p>
          <p className="text-xl font-bold">
            {stats?.cadmium?.avg != null ? Number(stats.cadmium.avg).toFixed(3) : '-'}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Máximo ppm</p>
          <p className="text-xl font-bold text-red-400">
            {stats?.cadmium?.max != null ? Number(stats.cadmium.max).toFixed(3) : '-'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING_ANALYSIS">Pendientes</option>
          <option value="ANALYZED">Analizadas</option>
          <option value="VALIDATED">Validadas</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-4 py-3">Lote</th>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">Cadmio</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Orígenes</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((s) => (
              <tr key={s.id} className="border-t border-gray-800">
                <td className="px-4 py-3 font-medium">{s.loteCode}</td>
                <td className="px-4 py-3">{s.productType?.name}</td>
                <td className="px-4 py-3">
                  {s.cadmium != null ? `${Number(s.cadmium).toFixed(3)} ppm` : 'Pendiente'}
                </td>
                <td className="px-4 py-3 text-xs">{s.status}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {s.origins?.map((o: any) => o.zone.name).join(', ') || '-'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <p className="text-center text-xs text-gray-500 py-3">
            Mostrando 50 de {filtered.length}. Exporta CSV para ver todas.
          </p>
        )}
      </div>
    </div>
  );
}

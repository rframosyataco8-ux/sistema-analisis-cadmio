import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Estadisticas() {
  const [stats, setStats] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    const h = { Authorization: `Bearer ${t}` };
    axios.get(`${API}/samples/stats`, { headers: h }).then((r) => setStats(r.data));
    axios.get(`${API}/samples`, { headers: h }).then((r) => setSamples(r.data));
  }, []);

  const byProduct: Record<string, number> = {};
  samples.forEach((s) => {
    const n = s.productType?.name || 'Otro';
    byProduct[n] = (byProduct[n] || 0) + 1;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Estadísticas</h1>
      <p className="text-gray-400 text-sm mb-6">Resumen numérico del sistema</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title="Total muestras" value={stats?.total ?? 0} />
        <Card title="Pendientes" value={stats?.pending ?? 0} color="text-yellow-400" />
        <Card title="Analizadas" value={stats?.analyzed ?? 0} color="text-blue-400" />
        <Card title="Validadas" value={stats?.validated ?? 0} color="text-green-400" />
        <Card title="Promedio Cd" value={stats?.cadmium?.avg != null ? Number(stats.cadmium.avg).toFixed(3) + ' ppm' : '-'} />
        <Card title="Máximo Cd" value={stats?.cadmium?.max != null ? Number(stats.cadmium.max).toFixed(3) + ' ppm' : '-'} color="text-red-400" />
        <Card title="Mínimo Cd" value={stats?.cadmium?.min != null ? Number(stats.cadmium.min).toFixed(3) + ' ppm' : '-'} color="text-green-400" />
        <Card title="Tipos producto" value={Object.keys(byProduct).length} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold mb-4">Muestras por tipo de producto (hoja Excel)</h3>
        <div className="space-y-3">
          {Object.entries(byProduct).map(([name, count]) => (
            <div key={name} className="flex items-center gap-4">
              <span className="w-48 text-sm text-gray-300 truncate">{name}</span>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${Math.min(100, (count / (samples.length || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium w-10 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color = 'text-white' }: { title: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-xs">{title}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

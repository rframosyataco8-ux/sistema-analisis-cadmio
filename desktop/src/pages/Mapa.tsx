import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Mapa() {
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    axios.get(`${API}/samples`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => setSamples(r.data));
  }, []);

  const byZone: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    if (s.cadmium == null) return;
    (s.origins || []).forEach((o: any) => {
      const z = o.zone?.name || 'Sin zona';
      if (!byZone[z]) byZone[z] = { sum: 0, count: 0 };
      byZone[z].sum += Number(s.cadmium);
      byZone[z].count++;
    });
  });

  const zones = Object.entries(byZone)
    .map(([name, d]) => ({ name, avg: d.sum / d.count }))
    .sort((a, b) => b.avg - a.avg);

  const color = (avg: number) => {
    if (avg >= 1.2) return 'bg-red-600';
    if (avg >= 1.0) return 'bg-orange-500';
    if (avg >= 0.8) return 'bg-yellow-500';
    if (avg >= 0.5) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Mapa de Calor</h1>
      <p className="text-gray-400 text-sm mb-6">Concentración de cadmio por zona de origen</p>

      <div className="flex gap-3 mb-6 text-xs">
        <Legend color="bg-green-500" label="Bajo (<0.5)" />
        <Legend color="bg-lime-500" label="0.5–0.8" />
        <Legend color="bg-yellow-500" label="0.8–1.0" />
        <Legend color="bg-orange-500" label="1.0–1.2" />
        <Legend color="bg-red-600" label="Alto (≥1.2)" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {zones.map((z) => (
          <div
            key={z.name}
            className={`${color(z.avg)} rounded-xl p-4 text-white shadow-lg`}
          >
            <p className="font-semibold text-sm">{z.name}</p>
            <p className="text-2xl font-bold mt-1">{z.avg.toFixed(3)}</p>
            <p className="text-xs opacity-80">ppm promedio</p>
          </div>
        ))}
        {zones.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-16">Sin datos de zonas</p>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

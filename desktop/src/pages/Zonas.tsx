import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Zonas() {
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    axios.get(`${API}/samples`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => setSamples(r.data));
  }, []);

  const byZone: Record<string, { sum: number; count: number; total: number }> = {};
  samples.forEach((s) => {
    (s.origins || []).forEach((o: any) => {
      const z = o.zone?.name || 'Sin zona';
      if (!byZone[z]) byZone[z] = { sum: 0, count: 0, total: 0 };
      byZone[z].total++;
      if (s.cadmium != null) {
        byZone[z].sum += Number(s.cadmium);
        byZone[z].count++;
      }
    });
  });

  const rows = Object.entries(byZone)
    .map(([name, d]) => ({
      name,
      promedio: d.count ? d.sum / d.count : 0,
      muestras: d.total,
      conCadmio: d.count,
    }))
    .sort((a, b) => b.promedio - a.promedio);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Zonas</h1>
      <p className="text-gray-400 text-sm mb-6">Orígenes de grano de cacao y niveles de cadmio</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/60 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3">Zona</th>
              <th className="text-left px-5 py-3">Muestras</th>
              <th className="text-left px-5 py-3">Con Cadmio</th>
              <th className="text-left px-5 py-3">Promedio ppm</th>
              <th className="text-left px-5 py-3">Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((z) => (
              <tr key={z.name} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="px-5 py-3 font-medium">{z.name}</td>
                <td className="px-5 py-3">{z.muestras}</td>
                <td className="px-5 py-3">{z.conCadmio}</td>
                <td className="px-5 py-3 font-semibold">{z.promedio ? z.promedio.toFixed(3) : '-'}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    z.promedio >= 1.2 ? 'bg-red-900/50 text-red-300' :
                    z.promedio >= 0.8 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'
                  }`}>
                    {z.promedio >= 1.2 ? 'Alto' : z.promedio >= 0.8 ? 'Medio' : 'Bajo'}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">Sin datos de zonas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

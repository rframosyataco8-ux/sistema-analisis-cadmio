import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Comparaciones() {
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_URL}/samples`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setSamples(r.data));
  }, []);

  // Comparación por zona
  const byZone: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    if (s.cadmium == null) return;
    s.origins?.forEach((o: any) => {
      const z = o.zone?.name || 'Sin zona';
      if (!byZone[z]) byZone[z] = { sum: 0, count: 0 };
      byZone[z].sum += Number(s.cadmium);
      byZone[z].count++;
    });
  });
  const zoneChart = Object.entries(byZone)
    .map(([name, d]) => ({ name, promedio: Number((d.sum / d.count).toFixed(3)), muestras: d.count }))
    .sort((a, b) => b.promedio - a.promedio);

  // Comparación por producto
  const byProduct: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    if (s.cadmium == null) return;
    const name = s.productType?.name || 'Sin tipo';
    if (!byProduct[name]) byProduct[name] = { sum: 0, count: 0 };
    byProduct[name].sum += Number(s.cadmium);
    byProduct[name].count++;
  });
  const productChart = Object.entries(byProduct)
    .map(([name, d]) => ({ name, promedio: Number((d.sum / d.count).toFixed(3)), muestras: d.count }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Comparaciones</h1>
      <p className="text-gray-400 text-sm mb-6">Compara niveles de cadmio por zona de origen y por tipo de producto</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Cadmio promedio por Zona</h3>
          {zoneChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={zoneChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-30} textAnchor="end" height={70} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Legend />
                <Bar dataKey="promedio" fill="#22c55e" name="Promedio ppm" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-20 text-center">Sin datos</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Cadmio promedio por Producto</h3>
          {productChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-20} textAnchor="end" height={70} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Legend />
                <Bar dataKey="promedio" fill="#3b82f6" name="Promedio ppm" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-20 text-center">Sin datos</p>
          )}
        </div>
      </div>

      {/* Tabla resumen zonas */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold">Resumen por zona</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3">Zona</th>
              <th className="text-left px-5 py-3">Muestras</th>
              <th className="text-left px-5 py-3">Promedio Cadmio</th>
              <th className="text-left px-5 py-3">Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {zoneChart.map((z) => (
              <tr key={z.name} className="border-t border-gray-800">
                <td className="px-5 py-3">{z.name}</td>
                <td className="px-5 py-3">{z.muestras}</td>
                <td className="px-5 py-3 font-medium">{z.promedio} ppm</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    z.promedio >= 1.2 ? 'bg-red-900/60 text-red-300' :
                    z.promedio >= 0.8 ? 'bg-yellow-900/60 text-yellow-300' :
                    'bg-green-900/60 text-green-300'
                  }`}>
                    {z.promedio >= 1.2 ? 'Alto' : z.promedio >= 0.8 ? 'Medio' : 'Bajo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

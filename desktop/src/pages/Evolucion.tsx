import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Evolucion() {
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    axios.get(`${API}/samples`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => setSamples(r.data));
  }, []);

  const byMonth: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    if (s.cadmium == null) return;
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0 };
    byMonth[key].sum += Number(s.cadmium);
    byMonth[key].count++;
  });

  const data = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, promedio: Number((d.sum / d.count).toFixed(3)) }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Evolución de Zonas</h1>
      <p className="text-gray-400 text-sm mb-6">Tendencia del cadmio promedio en el tiempo</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
              <Legend />
              <Line type="monotone" dataKey="promedio" stroke="#22c55e" strokeWidth={2} name="Promedio ppm" dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-20">Sin datos temporales aún</p>
        )}
      </div>
    </div>
  );
}

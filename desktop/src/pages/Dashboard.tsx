import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#06b6d4', '#f97316'];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${API_URL}/samples/stats`, { headers }).then((r) => setStats(r.data));
    axios.get(`${API_URL}/samples`, { headers }).then((r) => setSamples(r.data));
  }, []);

  // Datos para gráficos
  const byProduct = samples.reduce((acc: any, s) => {
    const name = s.productType?.name || 'Sin tipo';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const productData = Object.entries(byProduct).map(([name, value]) => ({ name, value }));

  const byZone: Record<string, { total: number; sum: number; count: number }> = {};
  samples.forEach((s) => {
    s.origins?.forEach((o: any) => {
      const z = o.zone?.name || 'Sin zona';
      if (!byZone[z]) byZone[z] = { total: 0, sum: 0, count: 0 };
      byZone[z].total++;
      if (s.cadmium != null) {
        byZone[z].sum += Number(s.cadmium);
        byZone[z].count++;
      }
    });
  });
  const zoneData = Object.entries(byZone)
    .map(([name, d]) => ({
      name,
      promedio: d.count > 0 ? Number((d.sum / d.count).toFixed(3)) : 0,
      muestras: d.total,
    }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 10);

  // Tendencia simple por mes (usando createdAt)
  const byMonth: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    if (s.cadmium == null) return;
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0 };
    byMonth[key].sum += Number(s.cadmium);
    byMonth[key].count++;
  });
  const trendData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month,
      promedio: Number((d.sum / d.count).toFixed(3)),
    }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Dashboard Ejecutivo</h1>
      <p className="text-gray-400 text-sm mb-6">Resumen general del comportamiento del cadmio</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi title="Total Muestras" value={stats?.total ?? '-'} />
        <Kpi title="Pendientes" value={stats?.pending ?? '-'} color="text-yellow-400" />
        <Kpi title="Analizadas" value={stats?.analyzed ?? '-'} color="text-blue-400" />
        <Kpi title="Validadas" value={stats?.validated ?? '-'} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Kpi
          title="Promedio Cadmio"
          value={stats?.cadmium?.avg != null ? `${Number(stats.cadmium.avg).toFixed(3)} ppm` : '-'}
        />
        <Kpi
          title="Máximo Cadmio"
          value={stats?.cadmium?.max != null ? `${Number(stats.cadmium.max).toFixed(3)} ppm` : '-'}
          color="text-red-400"
        />
        <Kpi
          title="Mínimo Cadmio"
          value={stats?.cadmium?.min != null ? `${Number(stats.cadmium.min).toFixed(3)} ppm` : '-'}
          color="text-green-400"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendencia */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Tendencia del Cadmio (ppm)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151' }}
                />
                <Line type="monotone" dataKey="promedio" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-16 text-center">Sin datos suficientes</p>
          )}
        </div>

        {/* Comparación zonas */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Top 10 Zonas (Promedio ppm)</h3>
          {zoneData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={zoneData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="promedio" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-16 text-center">Sin datos de zonas</p>
          )}
        </div>

        {/* Distribución por producto */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Distribución por Tipo de Producto</h3>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {productData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-16 text-center">Sin datos</p>
          )}
        </div>

        {/* Resumen rápido */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Resumen de Estados</h3>
          <div className="space-y-3 mt-6">
            <StatusRow label="Pendientes de análisis" value={stats?.pending ?? 0} color="bg-yellow-500" />
            <StatusRow label="Analizadas" value={stats?.analyzed ?? 0} color="bg-blue-500" />
            <StatusRow label="Validadas" value={stats?.validated ?? 0} color="bg-green-500" />
            <StatusRow label="Total" value={stats?.total ?? 0} color="bg-gray-500" />
          </div>
        </div>
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

function StatusRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

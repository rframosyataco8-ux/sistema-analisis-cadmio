import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useSocket } from '../hooks/useSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#06b6d4', '#f97316'];
const LIMITE_ALERTA = 1.0; // ppm - umbral de atención

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState('');

  const loadData = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${API_URL}/samples/stats`, { headers }).then((r) => setStats(r.data));
    axios.get(`${API_URL}/samples`, { headers }).then((r) => {
      setSamples(r.data);
      setLastUpdate(new Date().toLocaleTimeString());
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useSocket(() => loadData(), () => loadData());

  // Distribución por producto
  const byProduct = samples.reduce((acc: any, s) => {
    const name = s.productType?.name || 'Sin tipo';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const productData = Object.entries(byProduct).map(([name, value]) => ({ name, value }));

  // Promedio por zona
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

  // Tendencia mensual
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
    .map(([month, d]) => ({ month, promedio: Number((d.sum / d.count).toFixed(3)) }));

  // Alertas: muestras con cadmio alto
  const alertas = samples
    .filter((s) => s.cadmium != null && Number(s.cadmium) >= LIMITE_ALERTA)
    .sort((a, b) => Number(b.cadmium) - Number(a.cadmium))
    .slice(0, 8);

  const pendientes = samples.filter((s) => s.status === 'PENDING_ANALYSIS').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-gray-400 text-sm">Monitoreo del comportamiento del cadmio en productos de cacao</p>
        </div>
        {lastUpdate && (
          <div className="text-right">
            <p className="text-xs text-green-500">● En tiempo real</p>
            <p className="text-xs text-gray-500">Actualizado: {lastUpdate}</p>
          </div>
        )}
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Kpi title="Total Muestras" value={stats?.total ?? '-'} />
        <Kpi title="Pendientes Lima" value={pendientes} color="text-yellow-400" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tendencia */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-1">Tendencia del Cadmio</h3>
          <p className="text-xs text-gray-500 mb-4">Promedio mensual (ppm)</p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Line type="monotone" dataKey="promedio" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Promedio ppm" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Zonas */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-1">Top Zonas por Cadmio</h3>
          <p className="text-xs text-gray-500 mb-4">Promedio ppm por origen de grano</p>
          {zoneData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={zoneData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} width={95} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="promedio" fill="#22c55e" radius={[0, 4, 4, 0]} name="Promedio ppm" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Productos */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-1">Distribución por Producto</h3>
          <p className="text-xs text-gray-500 mb-4">Cantidad de muestras por tipo</p>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={productData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
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
            <EmptyChart />
          )}
        </div>

        {/* Alertas */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-1">Alertas de Cadmio Alto</h3>
          <p className="text-xs text-gray-500 mb-4">Muestras ≥ {LIMITE_ALERTA} ppm</p>
          {alertas.length > 0 ? (
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {alertas.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{s.loteCode}</p>
                    <p className="text-xs text-gray-400">{s.productType?.name}</p>
                  </div>
                  <span className="text-red-400 font-bold text-sm">{Number(s.cadmium).toFixed(3)} ppm</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-16 text-center">Sin alertas activas</p>
          )}
        </div>
      </div>

      {/* Últimas muestras */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="font-semibold">Últimas muestras registradas</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3">Lote</th>
              <th className="text-left px-5 py-3">Producto</th>
              <th className="text-left px-5 py-3">Orígenes</th>
              <th className="text-left px-5 py-3">Cadmio</th>
              <th className="text-left px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {samples.slice(0, 10).map((s) => (
              <tr key={s.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="px-5 py-3 font-medium">{s.loteCode}</td>
                <td className="px-5 py-3">{s.productType?.name || '-'}</td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {s.origins?.map((o: any) => o.zone.name).join(', ') || '-'}
                </td>
                <td className="px-5 py-3">
                  {s.cadmium != null ? (
                    <span className={Number(s.cadmium) >= LIMITE_ALERTA ? 'text-red-400 font-semibold' : ''}>
                      {Number(s.cadmium).toFixed(3)} ppm
                    </span>
                  ) : (
                    <span className="text-yellow-400">Pendiente</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {samples.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                  No hay muestras. Crea la primera desde Muestras o migra el Excel.
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
  const labels: Record<string, string> = {
    PENDING_ANALYSIS: 'Pendiente',
    ANALYZED: 'Analizada',
    VALIDATED: 'Validada',
    CREATED: 'Creada',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
}

function EmptyChart() {
  return <p className="text-gray-500 text-sm py-16 text-center">Sin datos suficientes aún</p>;
}

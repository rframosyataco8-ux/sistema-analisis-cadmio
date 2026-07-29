import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useSocket } from '../hooks/useSocket';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#06b6d4'];
const LIMITE = 1.0;

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState('');

  const load = useCallback(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
    axios.get(`${API}/samples/stats`, { headers: h }).then((r) => setStats(r.data)).catch(() => {});
    axios.get(`${API}/samples`, { headers: h }).then((r) => {
      setSamples(r.data);
      setLastUpdate(new Date().toLocaleTimeString());
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);
  useSocket(() => load(), () => load());

  const byProduct = samples.reduce((a: any, s) => {
    const n = s.productType?.name || 'Otro';
    a[n] = (a[n] || 0) + 1;
    return a;
  }, {});
  const productData = Object.entries(byProduct).map(([name, value]) => ({ name, value }));

  const byZone: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    (s.origins || []).forEach((o: any) => {
      const z = o.zone?.name || 'Sin zona';
      if (!byZone[z]) byZone[z] = { sum: 0, count: 0 };
      if (s.cadmium != null) {
        byZone[z].sum += Number(s.cadmium);
        byZone[z].count++;
      }
    });
  });
  const zoneData = Object.entries(byZone)
    .map(([name, d]) => ({ name, promedio: d.count ? Number((d.sum / d.count).toFixed(3)) : 0 }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 8);

  const byMonth: Record<string, { sum: number; count: number }> = {};
  samples.forEach((s) => {
    if (s.cadmium == null) return;
    const d = new Date(s.createdAt);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[k]) byMonth[k] = { sum: 0, count: 0 };
    byMonth[k].sum += Number(s.cadmium);
    byMonth[k].count++;
  });
  const trend = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, promedio: Number((d.sum / d.count).toFixed(3)) }));

  const alertas = samples.filter((s) => s.cadmium != null && Number(s.cadmium) >= LIMITE)
    .sort((a, b) => Number(b.cadmium) - Number(a.cadmium)).slice(0, 5);
  const pendientes = samples.filter((s) => s.status === 'PENDING_ANALYSIS').length;

  return (
    <div className="p-6 max-w-[1600px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-gray-400 text-sm">Resumen del comportamiento del cadmio</p>
        </div>
        {lastUpdate && (
          <div className="text-right text-xs">
            <p className="text-green-400 flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Tiempo real
            </p>
            <p className="text-gray-500">{lastUpdate}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Kpi label="Promedio Cd" value={stats?.cadmium?.avg != null ? Number(stats.cadmium.avg).toFixed(2) : '-'} unit="ppm" />
        <Kpi label="Máximo Cd" value={stats?.cadmium?.max != null ? Number(stats.cadmium.max).toFixed(2) : '-'} unit="ppm" accent="text-red-400" />
        <Kpi label="Mínimo Cd" value={stats?.cadmium?.min != null ? Number(stats.cadmium.min).toFixed(2) : '-'} unit="ppm" accent="text-green-400" />
        <Kpi label="Total" value={stats?.total ?? '-'} />
        <Kpi label="Pendientes" value={pendientes} accent="text-yellow-400" />
        <Kpi label="Analizadas" value={stats?.analyzed ?? '-'} accent="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <Panel title="Tendencia del Cadmio" subtitle="Promedio mensual">
          {trend.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                <Line type="monotone" dataKey="promedio" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>

        <Panel title="Top Zonas" subtitle="Promedio ppm">
          {zoneData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zoneData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" stroke="#6b7280" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={10} width={85} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                <Bar dataKey="promedio" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>

        <Panel title="Por Producto" subtitle="Distribución de muestras">
          {productData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={productData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {productData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-800">
            <h3 className="font-semibold text-sm">Últimas muestras</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-xs">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium">Lote</th>
                <th className="text-left px-5 py-2.5 font-medium">Producto</th>
                <th className="text-left px-5 py-2.5 font-medium">Cadmio</th>
                <th className="text-left px-5 py-2.5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {samples.slice(0, 8).map((s) => (
                <tr key={s.id} className="border-t border-gray-800/80 hover:bg-gray-800/20">
                  <td className="px-5 py-2.5 font-medium">{s.loteCode}</td>
                  <td className="px-5 py-2.5 text-gray-400">{s.productType?.name}</td>
                  <td className="px-5 py-2.5">
                    {s.cadmium != null ? (
                      <span className={Number(s.cadmium) >= LIMITE ? 'text-red-400 font-semibold' : 'text-gray-200'}>
                        {Number(s.cadmium).toFixed(3)}
                      </span>
                    ) : <span className="text-yellow-400 text-xs">Pendiente</span>}
                  </td>
                  <td className="px-5 py-2.5"><Badge status={s.status} /></td>
                </tr>
              ))}
              {!samples.length && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500">Sin muestras — ejecuta el seed</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-800">
            <h3 className="font-semibold text-sm">Alertas Cd ≥ {LIMITE}</h3>
          </div>
          <div className="divide-y divide-gray-800/80">
            {alertas.map((s) => (
              <div key={s.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{s.loteCode}</p>
                  <p className="text-[11px] text-gray-500">{s.productType?.name}</p>
                </div>
                <span className="text-red-400 font-bold text-sm">{Number(s.cadmium).toFixed(2)}</span>
              </div>
            ))}
            {!alertas.length && <p className="px-4 py-10 text-center text-gray-500 text-sm">Sin alertas</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, unit, accent = 'text-white' }: { label: string; value: any; unit?: string; accent?: string }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
      <p className="text-gray-500 text-[11px] uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent}`}>
        {value}{unit && <span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-[11px] text-gray-500 mb-3">{subtitle}</p>
      {children}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING_ANALYSIS: 'bg-yellow-900/40 text-yellow-300',
    ANALYZED: 'bg-blue-900/40 text-blue-300',
    VALIDATED: 'bg-green-900/40 text-green-300',
  };
  const labels: Record<string, string> = {
    PENDING_ANALYSIS: 'Pendiente',
    ANALYZED: 'Analizada',
    VALIDATED: 'Validada',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${map[status] || 'bg-gray-800 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  );
}

function Empty() {
  return <p className="text-gray-600 text-sm text-center py-16">Sin datos</p>;
}

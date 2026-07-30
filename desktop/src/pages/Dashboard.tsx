import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useSocket } from '../hooks/useSocket';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COLORS = ['#9a6540', '#c4894a', '#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];
const LIMITE_CD = 1.0;

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
  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, promedio: Number((d.sum / d.count).toFixed(3)) }));

  const alertas = samples
    .filter((s) => s.cadmium != null && Number(s.cadmium) >= LIMITE_CD)
    .sort((a, b) => Number(b.cadmium) - Number(a.cadmium))
    .slice(0, 6);

  const pendientes = samples.filter((s) => s.status === 'PENDING_ANALYSIS').length;
  const conPlaguicidas = samples.filter((s) => s.pesticides?.length > 0).length;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Dashboard Principal</h1>
          <p className="text-slate-400 text-sm mt-1">Control de calidad · Cadmio y plaguicidas en productos de cacao</p>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tiempo real · {lastUpdate}</span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Kpi
          label="Promedio Cd"
          value={stats?.cadmium?.avg != null ? Number(stats.cadmium.avg).toFixed(3) : '—'}
          unit="mg/kg"
          tone="neutral"
        />
        <Kpi
          label="Máximo Cd"
          value={stats?.cadmium?.max != null ? Number(stats.cadmium.max).toFixed(3) : '—'}
          unit="mg/kg"
          tone={stats?.cadmium?.max >= LIMITE_CD ? 'risk' : 'neutral'}
        />
        <Kpi
          label="Mínimo Cd"
          value={stats?.cadmium?.min != null ? Number(stats.cadmium.min).toFixed(3) : '—'}
          unit="mg/kg"
          tone="conform"
        />
        <Kpi label="Total lotes" value={stats?.total ?? '—'} tone="neutral" />
        <Kpi label="Pendientes lab" value={pendientes} tone={pendientes > 0 ? 'alert' : 'conform'} />
        <Kpi label="Con plaguicidas" value={conPlaguicidas} tone="neutral" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        <Panel title="Tendencia de Cadmio" subtitle="Promedio mensual (mg/kg)">
          {trend.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="promedio" stroke="#c4894a" strokeWidth={2.5} dot={{ r: 3.5, fill: '#c4894a' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>

        <Panel title="Cadmio por Zona" subtitle="Promedio mg/kg (top 8)">
          {zoneData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zoneData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="promedio" fill="#9a6540" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>

        <Panel title="Distribución por Producto" subtitle="Cantidad de lotes">
          {productData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={productData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={48}
                  paddingAngle={2}
                >
                  {productData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-slate-100">Últimos lotes</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Registro reciente de recepción y análisis</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Lote</th>
                  <th className="table-header">Producto</th>
                  <th className="table-header">Cadmio</th>
                  <th className="table-header">Plaguicidas</th>
                  <th className="table-header">Estado</th>
                </tr>
              </thead>
              <tbody>
                {samples.slice(0, 8).map((s) => {
                  const cd = s.cadmium != null ? Number(s.cadmium) : null;
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="table-cell font-medium font-mono text-[13px]">{s.loteCode}</td>
                      <td className="table-cell text-slate-400">{s.productType?.name}</td>
                      <td className="table-cell font-mono">
                        {cd != null ? (
                          <span className={cd >= LIMITE_CD ? 'text-rose-400 font-semibold' : 'text-slate-200'}>
                            {cd.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs">Pendiente</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {s.pesticides?.length > 0 ? (
                          <span className="badge-alert">{s.pesticides.length}</span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="table-cell"><StatusBadge status={s.status} /></td>
                    </tr>
                  );
                })}
                {!samples.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-slate-500 text-sm">
                      Sin lotes. Ejecuta el seed del backend.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80">
            <h3 className="font-semibold text-sm text-slate-100">Alertas de cadmio</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Lotes ≥ {LIMITE_CD} mg/kg</p>
          </div>
          <div className="divide-y divide-slate-800/60">
            {alertas.map((s) => (
              <div key={s.id} className="px-5 py-3.5 flex justify-between items-center hover:bg-slate-800/20 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium font-mono truncate">{s.loteCode}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.productType?.name}</p>
                </div>
                <span className="text-rose-400 font-bold font-mono text-sm shrink-0 ml-3">
                  {Number(s.cadmium).toFixed(2)}
                </span>
              </div>
            ))}
            {!alertas.length && (
              <p className="px-5 py-12 text-center text-slate-500 text-sm">Sin alertas activas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  tone = 'neutral',
}: {
  label: string;
  value: any;
  unit?: string;
  tone?: 'neutral' | 'conform' | 'alert' | 'risk';
}) {
  const toneClass = {
    neutral: 'text-slate-50',
    conform: 'text-emerald-400',
    alert: 'text-amber-400',
    risk: 'text-rose-400',
  }[tone];

  return (
    <div className="card p-5">
      <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-2 tracking-tight ${toneClass}`}>
        {value}
        {unit && <span className="text-xs font-normal text-slate-500 ml-1.5">{unit}</span>}
      </p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-sm text-slate-100">{title}</h3>
      <p className="text-[11px] text-slate-500 mb-4 mt-0.5">{subtitle}</p>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING_ANALYSIS: 'badge-alert',
    ANALYZED: 'badge-neutral',
    VALIDATED: 'badge-conform',
    CREATED: 'badge-neutral',
  };
  const labels: Record<string, string> = {
    PENDING_ANALYSIS: 'Pendiente',
    ANALYZED: 'Analizado',
    VALIDATED: 'Validado',
    CREATED: 'Creado',
  };
  return (
    <span className={map[status] || 'badge-neutral'}>
      {labels[status] || status}
    </span>
  );
}

function Empty() {
  return <p className="text-slate-600 text-sm text-center py-16">Sin datos suficientes</p>;
}

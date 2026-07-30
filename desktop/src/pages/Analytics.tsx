import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMITE_CD = 1.0;

export default function Analytics() {
  const [samples, setSamples] = useState<any[]>([]);
  const [productFilter, setProductFilter] = useState('');
  const [productTypes, setProductTypes] = useState<any[]>([]);

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
    axios.get(`${API}/samples`, { headers: h }).then((r) => setSamples(r.data)).catch(() => {});
    axios.get(`${API}/product-types`, { headers: h }).then((r) => setProductTypes(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!productFilter) return samples;
    return samples.filter((s) => s.productTypeId === productFilter);
  }, [samples, productFilter]);

  // Heatmap-like data: zone x avg cadmium
  const zoneStats = useMemo(() => {
    const map: Record<string, { sum: number; count: number; max: number; overLimit: number }> = {};
    filtered.forEach((s) => {
      (s.origins || []).forEach((o: any) => {
        const z = o.zone?.name || 'Sin zona';
        if (!map[z]) map[z] = { sum: 0, count: 0, max: 0, overLimit: 0 };
        if (s.cadmium != null) {
          const v = Number(s.cadmium);
          map[z].sum += v;
          map[z].count++;
          map[z].max = Math.max(map[z].max, v);
          if (v >= LIMITE_CD) map[z].overLimit++;
        }
      });
    });
    return Object.entries(map)
      .map(([name, d]) => ({
        name,
        promedio: d.count ? Number((d.sum / d.count).toFixed(3)) : 0,
        max: Number(d.max.toFixed(3)),
        muestras: d.count,
        sobreLimite: d.overLimit,
      }))
      .sort((a, b) => b.promedio - a.promedio);
  }, [filtered]);

  // Pesticide frequency
  const pestFreq = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((s) => {
      (s.pesticides || []).forEach((p: any) => {
        map[p.name] = (map[p.name] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  const getRiskLevel = (avg: number) => {
    if (avg >= 1.5) return { label: 'Alto', className: 'badge-risk' };
    if (avg >= LIMITE_CD) return { label: 'Medio', className: 'badge-alert' };
    return { label: 'Bajo', className: 'badge-conform' };
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Analytics y Comparativa Zonal</h1>
          <p className="text-slate-400 text-sm mt-1">Análisis de cadmio y plaguicidas por origen y producto</p>
        </div>
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="input-field w-auto min-w-[200px]"
        >
          <option value="">Todos los productos</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>{pt.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-slate-100">Promedio de cadmio por zona</h3>
          <p className="text-[11px] text-slate-500 mb-4 mt-0.5">Comparativa de orígenes</p>
          {zoneStats.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={zoneStats.slice(0, 12)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="promedio" fill="#9a6540" radius={[0, 6, 6, 0]} name="Promedio mg/kg" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 text-sm text-center py-16">Sin datos</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm text-slate-100">Frecuencia de plaguicidas</h3>
          <p className="text-[11px] text-slate-500 mb-4 mt-0.5">Moléculas más detectadas</p>
          {pestFreq.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pestFreq}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" height={70} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Detecciones" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 text-sm text-center py-16">Sin plaguicidas registrados</p>
          )}
        </div>
      </div>

      {/* Tabla zonal detallada */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80">
          <h3 className="font-semibold text-sm text-slate-100">Matriz de riesgo por zona</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Promedio, máximo y lotes sobre límite (≥ {LIMITE_CD} mg/kg)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Zona / Origen</th>
                <th className="table-header">Muestras</th>
                <th className="table-header">Promedio Cd</th>
                <th className="table-header">Máximo Cd</th>
                <th className="table-header">Sobre límite</th>
                <th className="table-header">Nivel de riesgo</th>
              </tr>
            </thead>
            <tbody>
              {zoneStats.map((z) => {
                const risk = getRiskLevel(z.promedio);
                return (
                  <tr key={z.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="table-cell font-medium">{z.name}</td>
                    <td className="table-cell font-mono text-slate-400">{z.muestras}</td>
                    <td className="table-cell font-mono">{z.promedio.toFixed(3)}</td>
                    <td className="table-cell font-mono">{z.max.toFixed(3)}</td>
                    <td className="table-cell font-mono">
                      {z.sobreLimite > 0 ? (
                        <span className="text-rose-400">{z.sobreLimite}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={risk.className}>{risk.label}</span>
                    </td>
                  </tr>
                );
              })}
              {!zoneStats.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-slate-500 text-sm">
                    Sin datos de zonas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

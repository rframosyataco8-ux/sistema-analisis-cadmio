import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMITE_CD = 1.0;
const COLORS = ['#c4894a', '#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16'];

/** Comparación de 2, 3, 4 o más zonas — solo lotes con resultado de cadmio. */
export default function Comparaciones() {
  const [samples, setSamples] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
    axios.get(`${API}/samples`, { headers: h }).then((r) => setSamples(r.data)).catch(() => {});
    axios.get(`${API}/product-types`, { headers: h }).then((r) => setProductTypes(r.data)).catch(() => {});
    axios.get(`${API}/zones`, { headers: h }).then((r) => setZones(r.data)).catch(() => {});
  }, []);

  const toggleZone = (name: string) => {
    setSelectedZones((prev) =>
      prev.includes(name) ? prev.filter((z) => z !== name) : [...prev, name],
    );
  };

  // Solo muestras con cadmio numérico
  const analyzed = useMemo(() => {
    let list = samples.filter((s) => s.cadmium != null && !Number.isNaN(Number(s.cadmium)));
    if (productFilter) list = list.filter((s) => s.productTypeId === productFilter);
    return list;
  }, [samples, productFilter]);

  const comparison = useMemo(() => {
    if (selectedZones.length < 2) return [];
    return selectedZones.map((zoneName) => {
      const vals: number[] = [];
      analyzed.forEach((s) => {
        const hasZone = (s.origins || []).some((o: any) => o.zone?.name === zoneName);
        if (hasZone) vals.push(Number(s.cadmium));
      });
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / vals.length : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const min = vals.length ? Math.min(...vals) : 0;
      const over = vals.filter((v) => v >= LIMITE_CD).length;
      return {
        zona: zoneName,
        muestras: vals.length,
        promedio: Number(avg.toFixed(3)),
        maximo: Number(max.toFixed(3)),
        minimo: Number(min.toFixed(3)),
        sobreLimite: over,
      };
    });
  }, [selectedZones, analyzed]);

  const chartData = comparison.map((c) => ({
    name: c.zona,
    promedio: c.promedio,
    maximo: c.maximo,
    minimo: c.minimo,
  }));

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Comparación de Zonas</h1>
        <p className="text-slate-400 text-sm mt-1">
          Selecciona 2 o más orígenes para evaluar el comportamiento del cadmio. Solo se usan lotes ya analizados.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
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

      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-sm text-slate-100 mb-3">Seleccionar zonas ({selectedZones.length})</h3>
        <div className="flex flex-wrap gap-2">
          {zones.map((z) => {
            const active = selectedZones.includes(z.name);
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => toggleZone(z.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  active
                    ? 'bg-amber-600/25 border-amber-500/40 text-amber-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {z.name}
              </button>
            );
          })}
        </div>
        {selectedZones.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedZones([])}
            className="mt-3 text-xs text-slate-500 hover:text-slate-300"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {selectedZones.length < 2 ? (
        <div className="card p-16 text-center">
          <p className="text-slate-500 text-sm">Elige al menos 2 zonas para comparar promedios, máximos y riesgo.</p>
        </div>
      ) : (
        <>
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-sm text-slate-100">Cadmio por zona seleccionada</h3>
            <p className="text-[11px] text-slate-500 mb-4 mt-0.5">Promedio, máximo y mínimo (mg/kg)</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                />
                <Legend />
                <Bar dataKey="promedio" fill={COLORS[0]} name="Promedio" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maximo" fill={COLORS[4]} name="Máximo" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minimo" fill={COLORS[1]} name="Mínimo" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80">
              <h3 className="font-semibold text-sm text-slate-100">Tabla comparativa</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Zona</th>
                    <th className="table-header">Muestras</th>
                    <th className="table-header">Promedio</th>
                    <th className="table-header">Mínimo</th>
                    <th className="table-header">Máximo</th>
                    <th className="table-header">≥ {LIMITE_CD} mg/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((c) => (
                    <tr key={c.zona} className="hover:bg-slate-800/30">
                      <td className="table-cell font-medium">{c.zona}</td>
                      <td className="table-cell font-mono text-slate-400">{c.muestras}</td>
                      <td className="table-cell font-mono">{c.promedio.toFixed(3)}</td>
                      <td className="table-cell font-mono text-emerald-400/90">{c.minimo.toFixed(3)}</td>
                      <td className={`table-cell font-mono ${c.maximo >= LIMITE_CD ? 'text-rose-400' : ''}`}>
                        {c.maximo.toFixed(3)}
                      </td>
                      <td className="table-cell font-mono">
                        {c.sobreLimite > 0 ? (
                          <span className="text-rose-400">{c.sobreLimite}</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

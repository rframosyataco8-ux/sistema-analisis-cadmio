import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMITE_CD = 1.0;
const COLORS = ['#c4894a', '#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899', '#14b8a6'];

/**
 * Comparación multi-zona (2–N zonas).
 * - Grano de cacao: cada lote suele tener UN origen → promedio por zona es limpio.
 * - Torta / polvo: orígenes mixtos → un lote cuenta en todas las zonas que aporta.
 * Solo lotes con resultado numérico de cadmio.
 */
export default function Comparaciones() {
  const [samples, setSamples] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [productFilter, setProductFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
    Promise.all([
      axios.get(`${API}/samples`, { headers: h }),
      axios.get(`${API}/product-types`, { headers: h }),
      axios.get(`${API}/zones`, { headers: h }),
    ])
      .then(([s, p, z]) => {
        setSamples(s.data || []);
        setProductTypes(p.data || []);
        setZones(z.data || []);
      })
      .catch((err) => {
        setError(
          err.code === 'ERR_NETWORK'
            ? 'Backend no disponible en localhost:3000'
            : err.response?.data?.message || 'Error al cargar datos',
        );
      });
  }, []);

  const toggleZone = (name: string) => {
    setSelectedZones((prev) =>
      prev.includes(name) ? prev.filter((z) => z !== name) : [...prev, name],
    );
  };

  const selectTopZones = (n: number) => {
    // Top N por cantidad de muestras con Cd en el filtro actual
    const counts: Record<string, number> = {};
    analyzed.forEach((s) => {
      (s.origins || []).forEach((o: any) => {
        const z = o.zone?.name;
        if (z) counts[z] = (counts[z] || 0) + 1;
      });
    });
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name]) => name);
    setSelectedZones(top);
  };

  const analyzed = useMemo(() => {
    let list = samples.filter((s) => s.cadmium != null && !Number.isNaN(Number(s.cadmium)));
    if (productFilter) list = list.filter((s) => s.productTypeId === productFilter);
    return list;
  }, [samples, productFilter]);

  const comparison = useMemo(() => {
    if (selectedZones.length < 1) return [];
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
      const pctOver = vals.length ? (over / vals.length) * 100 : 0;
      return {
        zona: zoneName,
        muestras: vals.length,
        promedio: Number(avg.toFixed(3)),
        maximo: Number(max.toFixed(3)),
        minimo: Number(min.toFixed(3)),
        sobreLimite: over,
        pctSobreLimite: Number(pctOver.toFixed(1)),
      };
    });
  }, [selectedZones, analyzed]);

  // Radar: normalizar ejes 0–100 para comparar zonas
  const radarData = useMemo(() => {
    if (comparison.length < 2) return [];
    const maxAvg = Math.max(...comparison.map((c) => c.promedio), 0.001);
    const maxMax = Math.max(...comparison.map((c) => c.maximo), 0.001);
    const maxN = Math.max(...comparison.map((c) => c.muestras), 1);
    return comparison.map((c) => ({
      zona: c.zona,
      'Promedio Cd': Number(((c.promedio / maxAvg) * 100).toFixed(1)),
      'Máximo Cd': Number(((c.maximo / maxMax) * 100).toFixed(1)),
      '% sobre límite': c.pctSobreLimite,
      'Volumen muestras': Number(((c.muestras / maxN) * 100).toFixed(1)),
      'Bajo mínimo (inv)': Number((100 - (c.minimo / maxAvg) * 100).toFixed(1)),
    }));
  }, [comparison]);

  // Formato para RadarChart de recharts (un punto por eje, series por zona)
  const radarAxes = useMemo(() => {
    if (radarData.length < 2) return [];
    const keys = ['Promedio Cd', 'Máximo Cd', '% sobre límite', 'Volumen muestras', 'Bajo mínimo (inv)'];
    return keys.map((key) => {
      const point: Record<string, string | number> = { eje: key };
      radarData.forEach((row) => {
        point[row.zona] = row[key as keyof typeof row] as number;
      });
      return point;
    });
  }, [radarData]);

  const pieData = comparison
    .filter((c) => c.muestras > 0)
    .map((c) => ({ name: c.zona, value: c.muestras }));

  const productHint = useMemo(() => {
    const pt = productTypes.find((p) => p.id === productFilter);
    if (!pt) return 'Todos los productos: en torta un lote con varias zonas cuenta en cada una.';
    if (pt.name?.toLowerCase().includes('grano')) {
      return 'Grano de cacao: cada lote suele tener un solo origen — ideal para comparar zonas puras (elige 4–6 zonas).';
    }
    if (pt.name?.toLowerCase().includes('trozada')) {
      return 'Torta trozada: muestra de embolsado con mezcla de orígenes + plaguicidas.';
    }
    return `${pt.name}: lotes con orígenes mixtos — el promedio por zona incluye mezclas.`;
  }, [productFilter, productTypes]);

  const openZoneReport = () => {
    if (!comparison.length) return;
    const productName = productTypes.find((p) => p.id === productFilter)?.name || 'Todos';
    const now = new Date().toLocaleString('es-PE');
    const rows = comparison
      .map(
        (c) =>
          `<tr>
            <td>${c.zona}</td>
            <td class="mono">${c.muestras}</td>
            <td class="mono">${c.promedio.toFixed(3)}</td>
            <td class="mono">${c.minimo.toFixed(3)}</td>
            <td class="mono ${c.maximo >= LIMITE_CD ? 'risk' : ''}">${c.maximo.toFixed(3)}</td>
            <td class="mono ${c.sobreLimite ? 'risk' : ''}">${c.sobreLimite} (${c.pctSobreLimite}%)</td>
          </tr>`,
      )
      .join('');
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/>
<title>Comparación zonal — Romex</title>
<style>
body{font-family:Segoe UI,system-ui,sans-serif;color:#1e293b;margin:0;padding:32px;background:#f8fafc}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #b45309;padding-bottom:16px;margin-bottom:24px}
h1{margin:0;font-size:20px}.meta{font-size:12px;color:#64748b;text-align:right}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
th{background:#0f172a;color:#f1f5f9;text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase}
td{padding:9px 12px;border-top:1px solid #f1f5f9;font-size:13px}
.mono{font-family:Consolas,monospace}.risk{color:#e11d48;font-weight:600}
.note{margin-top:16px;font-size:12px;color:#64748b}
@media print{body{padding:12px;background:#fff}}
</style></head><body>
<div class="header"><div><h1>Exportadora Romex — Comparación de zonas</h1>
<p style="margin:4px 0 0;color:#64748b;font-size:13px">Producto: ${productName} · Límite ${LIMITE_CD} mg/kg</p></div>
<div class="meta">Generado: ${now}</div></div>
<table><thead><tr><th>Zona</th><th>Muestras</th><th>Promedio</th><th>Mín</th><th>Máx</th><th>≥ límite</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="note">${productHint} Solo lotes con resultado de cadmio. Use Ctrl+P para PDF.</p>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Comparación de Zonas</h1>
          <p className="text-slate-400 text-sm mt-1">
            Elige 2 o más orígenes (hasta 6+) · gráficos de barras, línea, circular y radar (araña)
          </p>
        </div>
        {comparison.length >= 2 && (
          <button onClick={openZoneReport} className="btn-primary">
            Reporte HTML / PDF
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-800/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="input-field w-auto min-w-[220px]"
        >
          <option value="">Todos los productos</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => selectTopZones(6)} className="btn-secondary text-xs">
          Top 6 zonas
        </button>
        <button type="button" onClick={() => selectTopZones(4)} className="btn-ghost text-xs">
          Top 4
        </button>
        {selectedZones.length > 0 && (
          <button type="button" onClick={() => setSelectedZones([])} className="btn-ghost text-xs text-slate-500">
            Limpiar
          </button>
        )}
      </div>

      <p className="text-xs text-amber-500/80 mb-4 max-w-3xl">{productHint}</p>

      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-sm text-slate-100 mb-3">
          Zonas seleccionadas ({selectedZones.length})
        </h3>
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
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
          {!zones.length && <span className="text-slate-500 text-sm">Sin zonas — ejecuta el seed</span>}
        </div>
      </div>

      {selectedZones.length < 2 ? (
        <div className="card p-16 text-center">
          <p className="text-slate-500 text-sm">
            Elige al menos 2 zonas (o pulsa «Top 6 zonas») para ver barras, línea, circular y radar.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Lotes analizados en filtro actual: {analyzed.length}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            {/* Barras */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-slate-100">Barras — Promedio / Máx / Mín</h3>
              <p className="text-[11px] text-slate-500 mb-3">mg/kg por zona</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="zona" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="promedio" fill={COLORS[0]} name="Promedio" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maximo" fill={COLORS[4]} name="Máximo" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minimo" fill={COLORS[1]} name="Mínimo" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Línea */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-slate-100">Línea — Comportamiento del promedio</h3>
              <p className="text-[11px] text-slate-500 mb-3">Tendencia entre zonas seleccionadas</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="zona" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="promedio" stroke={COLORS[0]} strokeWidth={2.5} dot={{ r: 5 }} name="Promedio Cd" />
                  <Line type="monotone" dataKey="maximo" stroke={COLORS[4]} strokeWidth={1.5} strokeDasharray="4 4" name="Máximo" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Circular — volumen de muestras */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-slate-100">Circular — Volumen de muestras</h3>
              <p className="text-[11px] text-slate-500 mb-3">Distribución de lotes con Cd por zona</p>
              {pieData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={48}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#64748b' }}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-600 text-sm text-center py-20">Sin datos</p>
              )}
            </div>

            {/* Radar / araña */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-slate-100">Radar (araña) — Perfil de zona</h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Ejes normalizados 0–100: promedio, máximo, % sobre límite, volumen, inversión de mínimo
              </p>
              {radarAxes.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarAxes}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="eje" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                    {selectedZones.map((z, i) => (
                      <Radar
                        key={z}
                        name={z}
                        dataKey={z}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-600 text-sm text-center py-20">Selecciona ≥2 zonas</p>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80">
              <h3 className="font-semibold text-sm text-slate-100">Tabla comparativa</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Solo lotes con resultado de cadmio</p>
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
                    <th className="table-header">% sobre límite</th>
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
                      <td className="table-cell font-mono text-slate-400">{c.pctSobreLimite}%</td>
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

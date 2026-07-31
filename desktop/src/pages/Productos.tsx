import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMITE_CD = 1.0;

/** Control por producto: solo considera lotes con resultado de análisis (excluye SIN MUESTRA / pendientes sin valor). */
export default function Productos() {
  const [samples, setSamples] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
    axios.get(`${API}/samples`, { headers: h }).then((r) => setSamples(r.data)).catch(() => {});
    axios.get(`${API}/product-types`, { headers: h }).then((r) => setProductTypes(r.data)).catch(() => {});
  }, []);

  const cards = useMemo(() => {
    return productTypes.map((pt) => {
      const all = samples.filter((s) => s.productTypeId === pt.id);
      // Solo con resultado numérico de cadmio (excluye no analizados / sin muestra)
      const analyzed = all.filter((s) => s.cadmium != null && !Number.isNaN(Number(s.cadmium)));
      const pending = all.filter(
        (s) =>
          s.cadmium == null ||
          s.status === 'PENDING_ANALYSIS' ||
          (s.observationCadmium && String(s.observationCadmium).toUpperCase().includes('SIN')),
      );
      const withPest = all.filter((s) => s.pesticides?.length > 0);
      let sum = 0;
      let max = 0;
      let over = 0;
      analyzed.forEach((s) => {
        const v = Number(s.cadmium);
        sum += v;
        if (v > max) max = v;
        if (v >= LIMITE_CD) over++;
      });
      const avg = analyzed.length ? sum / analyzed.length : null;

      // Zonas involucradas (de muestras con resultado)
      const zoneSet = new Set<string>();
      analyzed.forEach((s) => {
        (s.origins || []).forEach((o: any) => {
          if (o.zone?.name) zoneSet.add(o.zone.name);
        });
      });

      return {
        id: pt.id,
        name: pt.name,
        code: pt.code,
        hasPesticides: pt.hasPesticides,
        total: all.length,
        analyzed: analyzed.length,
        pending: pending.length,
        withPest: withPest.length,
        avg,
        max,
        over,
        zones: zoneSet.size,
      };
    });
  }, [samples, productTypes]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Control por Producto</h1>
        <p className="text-slate-400 text-sm mt-1">
          Cada producto se gestiona de forma independiente. Los lotes sin resultado de análisis (sin muestra o pendientes)
          no se incluyen en promedios ni indicadores de cadmio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div
            key={c.id}
            className="card p-6 hover:border-amber-700/40 transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(`/lotes?product=${c.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">{c.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{c.code || '—'}</p>
              </div>
              {c.hasPesticides && (
                <span className="badge-alert">Cd + Plaguicidas</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Lotes</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">{c.total}</p>
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Analizados</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{c.analyzed}</p>
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Pendientes</p>
                <p className={`text-lg font-bold mt-0.5 ${c.pending > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {c.pending}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Promedio Cd</span>
                <span className="font-mono font-medium text-slate-200">
                  {c.avg != null ? `${c.avg.toFixed(3)} mg/kg` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Máximo Cd</span>
                <span className={`font-mono font-medium ${c.max >= LIMITE_CD ? 'text-rose-400' : 'text-slate-200'}`}>
                  {c.analyzed ? `${c.max.toFixed(3)} mg/kg` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sobre límite (≥{LIMITE_CD})</span>
                <span className={`font-mono ${c.over > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{c.over}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zonas de origen</span>
                <span className="font-mono text-slate-300">{c.zones}</span>
              </div>
              {c.hasPesticides && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Con plaguicidas</span>
                  <span className="font-mono text-amber-400">{c.withPest}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
              <span className="text-xs text-amber-500/80 group-hover:text-amber-400">Ver lotes →</span>
            </div>
          </div>
        ))}
        {!cards.length && (
          <p className="text-slate-500 col-span-full text-center py-16">Sin productos. Ejecuta el seed del backend.</p>
        )}
      </div>

      <div className="mt-8 card p-5">
        <h3 className="font-semibold text-sm text-slate-100 mb-2">Notas operativas</h3>
        <ul className="text-sm text-slate-400 space-y-1.5 list-disc list-inside">
          <li>
            <strong className="text-slate-300">Torta trozada estándar</strong>: muestra tomada en embolsado final; mezcla
            de granos de varias zonas; analiza cadmio y plaguicidas.
          </li>
          <li>
            Filas sin valor de cadmio o marcadas «SIN MUESTRA» no entran en promedios ni gráficos de comparación.
          </li>
          <li>
            Los resultados llegan desde Lima (app móvil o Excel); aquí se validan, comparan y reportan.
          </li>
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMITE_CD = 1.0;

export default function Reportes() {
  const [samples, setSamples] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [onlyWithResult, setOnlyWithResult] = useState(true);

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
    axios.get(`${API}/samples`, { headers: h }).then((r) => setSamples(r.data)).catch(() => {});
    axios.get(`${API}/product-types`, { headers: h }).then((r) => setProductTypes(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...samples];
    if (productFilter) list = list.filter((s) => s.productTypeId === productFilter);
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    if (onlyWithResult) list = list.filter((s) => s.cadmium != null);
    return list;
  }, [samples, productFilter, statusFilter, onlyWithResult]);

  const stats = useMemo(() => {
    const withCd = filtered.filter((s) => s.cadmium != null);
    const vals = withCd.map((s) => Number(s.cadmium));
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      total: filtered.length,
      withCd: withCd.length,
      avg: vals.length ? sum / vals.length : null,
      max: vals.length ? Math.max(...vals) : null,
      min: vals.length ? Math.min(...vals) : null,
      over: vals.filter((v) => v >= LIMITE_CD).length,
    };
  }, [filtered]);

  const exportCSV = () => {
    const headers = ['Lote', 'Producto', 'Peso', 'Productor', 'Cadmio_mgkg', 'Estado', 'Origenes', 'Plaguicidas', 'Observacion', 'Fecha'];
    const rows = filtered.map((s) => [
      s.loteCode,
      s.productType?.name || '',
      s.weight ?? '',
      s.producerName || '',
      s.cadmium != null ? Number(s.cadmium).toFixed(4) : '',
      s.status,
      s.origins?.map((o: any) => o.zone.name).join('; ') || '',
      s.pesticides?.map((p: any) => `${p.name}:${p.value ?? '-'}`).join(' | ') || '',
      s.observationCadmium || '',
      s.sentDate ? new Date(s.sentDate).toLocaleDateString('es-PE') : (s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-PE') : ''),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_cadmio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const openHtmlReport = () => {
    const productName = productTypes.find((p) => p.id === productFilter)?.name || 'Todos los productos';
    const now = new Date().toLocaleString('es-PE');
    const rowsHtml = filtered
      .map((s) => {
        const cd = s.cadmium != null ? Number(s.cadmium) : null;
        const cdClass = cd != null && cd >= LIMITE_CD ? 'risk' : '';
        const origins = s.origins?.map((o: any) => o.zone.name).join(', ') || '—';
        const pests = s.pesticides?.map((p: any) => `${p.name}: ${p.value ?? '—'}`).join('; ') || '—';
        return `<tr>
          <td class="mono">${s.loteCode}</td>
          <td>${s.productType?.name || ''}</td>
          <td class="mono ${cdClass}">${cd != null ? cd.toFixed(3) : '—'}</td>
          <td>${origins}</td>
          <td class="small">${pests}</td>
          <td>${s.status}</td>
        </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Reporte Cadmio — Exportadora Romex</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 32px; background: #f8fafc; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #b45309; padding-bottom: 20px; margin-bottom: 24px; }
  .brand h1 { margin: 0; font-size: 22px; color: #0f172a; }
  .brand p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
  .meta { text-align: right; font-size: 12px; color: #64748b; }
  .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px; }
  .kpi { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
  .kpi label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
  .kpi strong { font-size: 20px; color: #0f172a; }
  .kpi .risk { color: #e11d48; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
  th { background: #0f172a; color: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 9px 12px; border-top: 1px solid #f1f5f9; font-size: 13px; }
  tr:nth-child(even) td { background: #f8fafc; }
  .mono { font-family: 'Cascadia Code', 'Consolas', monospace; }
  .risk { color: #e11d48; font-weight: 600; }
  .small { font-size: 11px; color: #64748b; max-width: 220px; }
  .footer { margin-top: 28px; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print {
    body { padding: 12px; background: #fff; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>Exportadora Romex S.A.</h1>
      <p>Sistema de Análisis de Cadmio y Plaguicidas · Control de Calidad</p>
    </div>
    <div class="meta">
      <div><strong>Reporte de lotes</strong></div>
      <div>Producto: ${productName}</div>
      <div>Generado: ${now}</div>
      <div>Límite referencia: ${LIMITE_CD} mg/kg</div>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi"><label>Lotes en reporte</label><strong>${stats.total}</strong></div>
    <div class="kpi"><label>Con resultado Cd</label><strong>${stats.withCd}</strong></div>
    <div class="kpi"><label>Promedio Cd</label><strong>${stats.avg != null ? stats.avg.toFixed(3) : '—'}</strong></div>
    <div class="kpi"><label>Máximo Cd</label><strong class="${stats.max != null && stats.max >= LIMITE_CD ? 'risk' : ''}">${stats.max != null ? stats.max.toFixed(3) : '—'}</strong></div>
    <div class="kpi"><label>Sobre límite</label><strong class="${stats.over > 0 ? 'risk' : ''}">${stats.over}</strong></div>
  </div>

  <p class="no-print" style="margin-bottom:16px;font-size:13px;color:#64748b">
    Use <strong>Ctrl+P</strong> / <strong>Cmd+P</strong> para guardar como PDF.
  </p>

  <table>
    <thead>
      <tr>
        <th>Lote</th>
        <th>Producto</th>
        <th>Cadmio (mg/kg)</th>
        <th>Orígenes</th>
        <th>Plaguicidas</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>${rowsHtml || '<tr><td colspan="6">Sin datos</td></tr>'}</tbody>
  </table>

  <div class="footer">
    Documento generado por Sistema Inteligente de Análisis de Cadmio · Exportadora Romex · Confidencial
  </div>
  <script>/* auto-focus print optional */</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Reportes</h1>
          <p className="text-slate-400 text-sm mt-1">
            Exportación CSV y reporte HTML/PDF con formato corporativo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            Exportar CSV ({filtered.length})
          </button>
          <button onClick={openHtmlReport} className="btn-primary">
            Abrir reporte HTML / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">En reporte</p>
          <p className="text-xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Con resultado</p>
          <p className="text-xl font-bold mt-1 text-emerald-400">{stats.withCd}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Promedio Cd</p>
          <p className="text-xl font-bold mt-1 font-mono">
            {stats.avg != null ? stats.avg.toFixed(3) : '—'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Máximo</p>
          <p className={`text-xl font-bold mt-1 font-mono ${stats.max != null && stats.max >= LIMITE_CD ? 'text-rose-400' : ''}`}>
            {stats.max != null ? stats.max.toFixed(3) : '—'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Sobre límite</p>
          <p className={`text-xl font-bold mt-1 ${stats.over > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{stats.over}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="input-field w-auto min-w-[180px]">
          <option value="">Todos los productos</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>{pt.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">Todos los estados</option>
          <option value="PENDING_ANALYSIS">Pendientes</option>
          <option value="ANALYZED">Analizados</option>
          <option value="VALIDATED">Validados</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyWithResult}
            onChange={(e) => setOnlyWithResult(e.target.checked)}
            className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
          />
          Solo lotes con resultado de cadmio
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Lote</th>
                <th className="table-header">Producto</th>
                <th className="table-header">Cadmio</th>
                <th className="table-header">Orígenes</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((s) => {
                const cd = s.cadmium != null ? Number(s.cadmium) : null;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="table-cell font-mono font-medium text-[13px]">{s.loteCode}</td>
                    <td className="table-cell text-slate-400 text-xs">{s.productType?.name}</td>
                    <td className="table-cell font-mono">
                      {cd != null ? (
                        <span className={cd >= LIMITE_CD ? 'text-rose-400 font-semibold' : ''}>{cd.toFixed(3)}</span>
                      ) : (
                        <span className="text-amber-400 text-xs">Sin resultado</span>
                      )}
                    </td>
                    <td className="table-cell text-xs text-slate-500 max-w-[160px] truncate">
                      {s.origins?.map((o: any) => o.zone.name).join(', ') || '—'}
                    </td>
                    <td className="table-cell text-xs">{s.status}</td>
                    <td className="table-cell text-xs text-slate-500">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-PE') : '—'}
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-slate-500 text-sm">
                    Sin lotes con los filtros actuales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 80 && (
          <p className="text-center text-xs text-slate-500 py-3">
            Vista previa 80 de {filtered.length}. Use CSV o HTML para el listado completo.
          </p>
        )}
      </div>
    </div>
  );
}

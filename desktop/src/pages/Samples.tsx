import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PesticideRow {
  name: string;
  value: string;
}

export default function Samples() {
  const [samples, setSamples] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  const [form, setForm] = useState({
    loteCode: '',
    productTypeId: '',
    weight: '',
    producerCode: 'Chincha',
    producerName: 'Exportadora Romex S.A',
    zoneIds: [] as string[],
    notes: '',
    pesticides: [] as PesticideRow[],
  });

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const selectedProduct = productTypes.find((p) => p.id === form.productTypeId);
  const showPesticides = selectedProduct?.hasPesticides === true;

  const load = () => {
    axios.get(`${API_URL}/samples`, { headers }).then((r) => {
      setSamples(r.data);
      setFiltered(r.data);
    });
    axios.get(`${API_URL}/product-types`, { headers }).then((r) => setProductTypes(r.data));
    axios.get(`${API_URL}/zones`, { headers }).then((r) => setZones(r.data));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = [...samples];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.loteCode?.toLowerCase().includes(q) ||
          s.producerName?.toLowerCase().includes(q) ||
          s.productType?.name?.toLowerCase().includes(q) ||
          s.pesticides?.some((p: any) => p.name.toLowerCase().includes(q)),
      );
    }
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    if (productFilter) result = result.filter((s) => s.productTypeId === productFilter);
    setFiltered(result);
  }, [search, statusFilter, productFilter, samples]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        loteCode: form.loteCode,
        productTypeId: form.productTypeId,
        weight: form.weight ? Number(form.weight) : undefined,
        producerCode: form.producerCode,
        producerName: form.producerName,
        notes: form.notes || undefined,
        zoneIds: form.zoneIds.length ? form.zoneIds : undefined,
      };

      if (showPesticides && form.pesticides.length > 0) {
        payload.pesticides = form.pesticides
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            value: p.value ? Number(p.value.replace(',', '.')) : undefined,
            unit: 'mg/kg',
          }));
      }

      await axios.post(`${API_URL}/samples`, payload, { headers });
      setShowForm(false);
      setForm({
        loteCode: '',
        productTypeId: '',
        weight: '',
        producerCode: 'Chincha',
        producerName: 'Exportadora Romex S.A',
        zoneIds: [],
        notes: '',
        pesticides: [],
      });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear lote');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/samples/${id}/validate`, {}, { headers });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al validar');
    }
  };

  const exportCSV = () => {
    const headersRow = ['Lote', 'Producto', 'Peso', 'Cadmio', 'Estado', 'Productor', 'Orígenes', 'Plaguicidas'];
    const rows = filtered.map((s) => [
      s.loteCode,
      s.productType?.name || '',
      s.weight ?? '',
      s.cadmium != null ? Number(s.cadmium).toFixed(4) : 'Pendiente',
      s.status,
      s.producerName || '',
      s.origins?.map((o: any) => o.zone.name).join('; ') || '',
      s.pesticides?.map((p: any) => `${p.name}: ${p.value ?? '-'}`).join(' | ') || '',
    ]);
    const csv = [headersRow, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lotes_cadmio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const toggleZone = (id: string) => {
    setForm((prev) => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(id)
        ? prev.zoneIds.filter((z) => z !== id)
        : [...prev.zoneIds, id],
    }));
  };

  const addPesticide = () => {
    setForm((prev) => ({ ...prev, pesticides: [...prev.pesticides, { name: '', value: '' }] }));
  };

  const updatePesticide = (idx: number, field: 'name' | 'value', val: string) => {
    setForm((prev) => {
      const list = [...prev.pesticides];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, pesticides: list };
    });
  };

  const removePesticide = (idx: number) => {
    setForm((prev) => ({ ...prev, pesticides: prev.pesticides.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Control de Lotes y Recepción</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} de {samples.length} lotes registrados
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            Exportar CSV
          </button>
          {user.role === 'ADMIN' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              + Nuevo lote
            </button>
          )}
        </div>
      </div>

      {/* Product chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setProductFilter('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
            !productFilter
              ? 'bg-cacao-600/25 border-cacao-500/40 text-cacao-300'
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
          }`}
        >
          Todos
        </button>
        {productTypes.map((pt) => (
          <button
            key={pt.id}
            onClick={() => setProductFilter(pt.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
              productFilter === pt.id
                ? 'bg-cacao-600/25 border-cacao-500/40 text-cacao-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {pt.name}
            {pt.hasPesticides && <span className="ml-1 opacity-60">· P</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar lote, productor, plaguicida…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING_ANALYSIS">Pendiente</option>
          <option value="ANALYZED">Analizado</option>
          <option value="VALIDATED">Validado</option>
        </select>
        {(search || statusFilter || productFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setProductFilter(''); }}
            className="btn-ghost text-xs"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Modal crear */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-raised w-full max-w-xl max-h-[92vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-5">Nuevo lote</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Código de lote *
                </label>
                <input
                  required
                  value={form.loteCode}
                  onChange={(e) => setForm({ ...form, loteCode: e.target.value })}
                  className="input-field font-mono"
                  placeholder="Ej: 23260205"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Producto *
                </label>
                <select
                  required
                  value={form.productTypeId}
                  onChange={(e) => setForm({ ...form, productTypeId: e.target.value, pesticides: [] })}
                  className="input-field"
                >
                  <option value="">Seleccionar producto…</option>
                  {productTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}{pt.hasPesticides ? ' (con plaguicidas)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Peso (gr)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Código productor
                  </label>
                  <input
                    value={form.producerCode}
                    onChange={(e) => setForm({ ...form, producerCode: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nombre productor
                </label>
                <input
                  value={form.producerName}
                  onChange={(e) => setForm({ ...form, producerName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Orígenes de grano
                </label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {zones.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => toggleZone(z.id)}
                      className={`px-3 py-1 rounded-lg text-xs border transition-all duration-200 ${
                        form.zoneIds.includes(z.id)
                          ? 'bg-cacao-600/30 border-cacao-500/50 text-cacao-200'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {z.name}
                    </button>
                  ))}
                </div>
              </div>

              {showPesticides && (
                <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                      Plaguicidas detectados
                    </label>
                    <button type="button" onClick={addPesticide} className="text-xs px-2.5 py-1 rounded-lg bg-amber-800/40 text-amber-200 hover:bg-amber-700/40 transition">
                      + Agregar
                    </button>
                  </div>
                  {form.pesticides.length === 0 && (
                    <p className="text-xs text-slate-500">Sin plaguicidas. Puedes agregar Chlorpyrifos, 2,4-D, etc.</p>
                  )}
                  <div className="space-y-2">
                    {form.pesticides.map((p, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          placeholder="Nombre"
                          value={p.name}
                          onChange={(e) => updatePesticide(idx, 'name', e.target.value)}
                          className="input-field flex-1 py-2"
                        />
                        <input
                          placeholder="Valor"
                          value={p.value}
                          onChange={(e) => updatePesticide(idx, 'value', e.target.value)}
                          className="input-field w-24 py-2 font-mono"
                        />
                        <span className="text-[11px] text-slate-500">mg/kg</span>
                        <button type="button" onClick={() => removePesticide(idx)} className="text-rose-400 hover:text-rose-300 text-lg px-1">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Guardando…' : 'Crear lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Lote</th>
                <th className="table-header">Producto</th>
                <th className="table-header">Orígenes</th>
                <th className="table-header">Cadmio</th>
                <th className="table-header">Plaguicidas</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const cd = s.cadmium != null ? Number(s.cadmium) : null;
                return (
                  <>
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="table-cell font-mono font-medium text-[13px]">{s.loteCode}</td>
                      <td className="table-cell text-slate-400 text-xs">{s.productType?.name}</td>
                      <td className="table-cell text-xs text-slate-500 max-w-[140px] truncate">
                        {s.origins?.map((o: any) => o.zone.name).join(', ') || '—'}
                      </td>
                      <td className="table-cell font-mono">
                        {cd != null ? (
                          <span className={cd >= 1.5 ? 'text-rose-400 font-semibold' : cd >= 1.0 ? 'text-amber-400' : 'text-slate-200'}>
                            {cd.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs">Pendiente</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {s.pesticides?.length > 0 ? (
                          <button
                            onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                          >
                            {s.pesticides.length} · ver
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="table-cell">
                        {user.role === 'ADMIN' && s.status === 'ANALYZED' && (
                          <button
                            onClick={() => handleValidate(s.id)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Validar
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === s.id && s.pesticides?.length > 0 && (
                      <tr key={`${s.id}-pest`} className="bg-amber-950/15">
                        <td colSpan={7} className="px-6 py-3">
                          <div className="flex flex-wrap gap-2">
                            {s.pesticides.map((p: any) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-900/30 border border-amber-700/30 text-xs"
                              >
                                <span className="text-amber-300 font-medium">{p.name}</span>
                                <span className="text-slate-200 font-mono">
                                  {p.value != null ? Number(p.value).toFixed(4) : '—'}
                                </span>
                                <span className="text-slate-500">{p.unit || 'mg/kg'}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-500 text-sm">
                    No se encontraron lotes
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
  return <span className={map[status] || 'badge-neutral'}>{labels[status] || status}</span>;
}

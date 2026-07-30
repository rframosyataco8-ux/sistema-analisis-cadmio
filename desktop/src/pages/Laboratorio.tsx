import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Laboratorio() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [cadmium, setCadmium] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => {
    setLoading(true);
    axios
      .get(`${API}/samples/pending`, { headers })
      .then((r) => setPending(r.data))
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openForm = (sample: any) => {
    setSelected(sample);
    setCadmium('');
    setNotes('');
  };

  const handleSave = async () => {
    if (!selected) return;
    const value = parseFloat(cadmium.replace(',', '.'));
    if (isNaN(value) || value < 0) {
      alert('Ingresa un valor de cadmio válido');
      return;
    }
    setSaving(true);
    try {
      await axios.patch(
        `${API}/samples/${selected.id}/cadmium`,
        { cadmium: value, notes: notes || undefined },
        { headers },
      );
      setSelected(null);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Registro de Ensayos de Laboratorio</h1>
        <p className="text-slate-400 text-sm mt-1">
          Ingreso de resultados de cadmio · {user.fullName || 'Laboratorio'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lista pendientes */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Muestras pendientes de análisis</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{pending.length} lotes en cola</p>
            </div>
            <button onClick={load} className="btn-ghost text-xs">
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Cargando…</div>
          ) : pending.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 text-sm">No hay muestras pendientes</p>
              <p className="text-slate-600 text-xs mt-1">Todas las muestras han sido analizadas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50 max-h-[620px] overflow-y-auto">
              {pending.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openForm(s)}
                  className={`w-full text-left px-6 py-4 hover:bg-slate-800/40 transition-colors ${
                    selected?.id === s.id ? 'bg-cacao-950/40 border-l-2 border-cacao-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono font-semibold text-sm text-slate-100">{s.loteCode}</p>
                      <p className="text-xs text-cacao-400/90 mt-0.5">{s.productType?.name}</p>
                      {s.origins?.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {s.origins.map((o: any) => o.zone?.name).join(', ')}
                        </p>
                      )}
                      {s.pesticides?.length > 0 && (
                        <p className="text-[11px] text-amber-400/80 mt-1">
                          {s.pesticides.length} plaguicida{s.pesticides.length > 1 ? 's' : ''} registrado{s.pesticides.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <span className="badge-alert shrink-0">Pendiente</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de ingreso */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-8">
            {!selected ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Selecciona una muestra pendiente</p>
                <p className="text-xs text-slate-600 mt-1">para ingresar el valor de cadmio</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Lote seleccionado</p>
                  <p className="font-mono text-lg font-bold text-slate-50 mt-1">{selected.loteCode}</p>
                  <p className="text-sm text-cacao-400 mt-0.5">{selected.productType?.name}</p>
                </div>

                {selected.pesticides?.length > 0 && (
                  <div className="mb-5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Plaguicidas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.pesticides.map((p: any) => (
                        <span key={p.id} className="text-xs px-2 py-1 rounded-lg bg-amber-900/40 text-amber-200">
                          {p.name}: {p.value != null ? Number(p.value).toFixed(4) : '—'} {p.unit || 'mg/kg'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Valor de Cadmio (mg/kg) *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cadmium}
                      onChange={(e) => setCadmium(e.target.value)}
                      placeholder="Ej: 0.85"
                      className="input-field font-mono text-lg"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Observaciones
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Opcional"
                      className="input-field resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setSelected(null)} className="btn-secondary flex-1">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex-[1.5]"
                    >
                      {saving ? 'Guardando…' : 'Guardar resultado'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

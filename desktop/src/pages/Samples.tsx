import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Samples() {
  const [samples, setSamples] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtros
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
  });

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => {
    axios.get(`${API_URL}/samples`, { headers }).then((r) => {
      setSamples(r.data);
      setFiltered(r.data);
    });
    axios.get(`${API_URL}/product-types`, { headers }).then((r) => setProductTypes(r.data));
    axios.get(`${API_URL}/zones`, { headers }).then((r) => setZones(r.data));
  };

  useEffect(() => { load(); }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...samples];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.loteCode?.toLowerCase().includes(q) ||
          s.producerName?.toLowerCase().includes(q) ||
          s.productType?.name?.toLowerCase().includes(q),
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
      await axios.post(
        `${API_URL}/samples`,
        {
          ...form,
          weight: form.weight ? Number(form.weight) : undefined,
          zoneIds: form.zoneIds.length ? form.zoneIds : undefined,
        },
        { headers },
      );
      setShowForm(false);
      setForm({ ...form, loteCode: '', weight: '', notes: '', zoneIds: [] });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear muestra');
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
    const headers = ['Lote', 'Producto', 'Cadmio', 'Estado', 'Productor', 'Orígenes'];
    const rows = filtered.map((s) => [
      s.loteCode,
      s.productType?.name || '',
      s.cadmium != null ? Number(s.cadmium).toFixed(4) : 'Pendiente',
      s.status,
      s.producerName || '',
      s.origins?.map((o: any) => o.zone.name).join('; ') || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muestras_cadmio_${new Date().toISOString().slice(0, 10)}.csv`;
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Muestras</h1>
          <p className="text-gray-400 text-sm">{filtered.length} de {samples.length} registros</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm"
          >
            Exportar CSV
          </button>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
            >
              + Nueva muestra
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar lote, productor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm w-56"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING_ANALYSIS">Pendiente</option>
          <option value="ANALYZED">Analizada</option>
          <option value="VALIDATED">Validada</option>
        </select>
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
        >
          <option value="">Todos los productos</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>{pt.name}</option>
          ))}
        </select>
        {(search || statusFilter || productFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setProductFilter(''); }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Modal crear */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nueva muestra</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Código de Lote *</label>
                <input required value={form.loteCode} onChange={(e) => setForm({ ...form, loteCode: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" placeholder="Ej: 23260205" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo de producto *</label>
                <select required value={form.productTypeId} onChange={(e) => setForm({ ...form, productTypeId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
                  <option value="">Seleccionar...</option>
                  {productTypes.map((pt) => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Peso (gr)</label>
                  <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Código productor</label>
                  <input value={form.producerCode} onChange={(e) => setForm({ ...form, producerCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre productor</label>
                <input value={form.producerName} onChange={(e) => setForm({ ...form, producerName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Orígenes de grano</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {zones.map((z) => (
                    <button key={z.id} type="button" onClick={() => toggleZone(z.id)}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        form.zoneIds.includes(z.id) ? 'bg-green-600 border-green-500 text-white' : 'border-gray-600 text-gray-400'
                      }`}>{z.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-600 rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Crear muestra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3">Lote</th>
              <th className="text-left px-5 py-3">Producto</th>
              <th className="text-left px-5 py-3">Orígenes</th>
              <th className="text-left px-5 py-3">Cadmio</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="text-left px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="px-5 py-3 font-medium">{s.loteCode}</td>
                <td className="px-5 py-3">{s.productType?.name}</td>
                <td className="px-5 py-3 text-xs text-gray-400 max-w-[180px] truncate">
                  {s.origins?.map((o: any) => o.zone.name).join(', ') || '-'}
                </td>
                <td className="px-5 py-3">
                  {s.cadmium != null ? `${Number(s.cadmium).toFixed(3)} ppm` : 'Pendiente'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    s.status === 'PENDING_ANALYSIS' ? 'bg-yellow-900/60 text-yellow-300' :
                    s.status === 'ANALYZED' ? 'bg-blue-900/60 text-blue-300' :
                    s.status === 'VALIDATED' ? 'bg-green-900/60 text-green-300' : 'bg-gray-700'
                  }`}>{s.status}</span>
                </td>
                <td className="px-5 py-3">
                  {user.role === 'ADMIN' && s.status === 'ANALYZED' && (
                    <button onClick={() => handleValidate(s.id)} className="text-xs text-green-400 hover:text-green-300">
                      Validar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                  No se encontraron muestras
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

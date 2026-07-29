import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Trazabilidad() {
  const [samples, setSamples] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_URL}/samples`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setSamples(r.data));
  }, []);

  const filtered = samples.filter(
    (s) =>
      s.loteCode?.toLowerCase().includes(search.toLowerCase()) ||
      s.producerName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Trazabilidad</h1>
      <p className="text-gray-400 text-sm mb-6">
        Sigue el historial de cada lote: origen del grano, productor, análisis y validación
      </p>

      <input
        type="text"
        placeholder="Buscar por código de lote o productor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Lote</th>
                <th className="text-left px-4 py-3">Producto</th>
                <th className="text-left px-4 py-3">Orígenes</th>
                <th className="text-left px-4 py-3">Cadmio</th>
                <th className="text-left px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`border-t border-gray-800 cursor-pointer hover:bg-gray-800/40 ${
                    selected?.id === s.id ? 'bg-gray-800/60' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{s.loteCode}</td>
                  <td className="px-4 py-3">{s.productType?.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[150px] truncate">
                    {s.origins?.map((o: any) => o.zone.name).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {s.cadmium != null ? `${Number(s.cadmium).toFixed(3)}` : 'Pendiente'}
                  </td>
                  <td className="px-4 py-3 text-xs">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Cadena de trazabilidad</h3>
          {selected ? (
            <div className="space-y-4">
              <Step title="1. Registro en Chincha" detail={`Creado por: ${selected.createdBy?.fullName || 'Sistema'}`} date={selected.createdAt} />
              <Step title="2. Orígenes de grano" detail={selected.origins?.map((o: any) => o.zone.name).join(', ') || 'Sin origen'} />
              <Step title="3. Productor" detail={`${selected.producerCode || '-'} · ${selected.producerName || '-'}`} />
              <Step
                title="4. Análisis en Lima"
                detail={selected.cadmium != null
                  ? `Cadmio: ${Number(selected.cadmium).toFixed(4)} ppm · ${selected.analyzedBy?.fullName || ''}`
                  : 'Pendiente de análisis'}
                date={selected.analyzedAt}
              />
              <Step
                title="5. Validación"
                detail={selected.status === 'VALIDATED' ? 'Muestra validada' : 'Aún no validada'}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Selecciona un lote para ver su trazabilidad completa</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ title, detail, date }: { title: string; detail: string; date?: string }) {
  return (
    <div className="border-l-2 border-green-600 pl-4">
      <p className="text-sm font-medium text-green-400">{title}</p>
      <p className="text-sm text-gray-300 mt-0.5">{detail}</p>
      {date && <p className="text-xs text-gray-500 mt-1">{new Date(date).toLocaleString()}</p>}
    </div>
  );
}

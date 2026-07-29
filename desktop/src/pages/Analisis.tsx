import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Analisis() {
  const [samples, setSamples] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_URL}/samples`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setSamples(r.data.filter((s: any) => s.cadmium != null)));
  }, []);

  const avg = samples.length
    ? samples.reduce((a, s) => a + Number(s.cadmium), 0) / samples.length
    : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Análisis de Cadmio</h1>
      <p className="text-gray-400 text-sm mb-6">Detalle de muestras ya analizadas y su valor de cadmio</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Muestras con Cadmio</p>
          <p className="text-2xl font-bold mt-1">{samples.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Promedio general</p>
          <p className="text-2xl font-bold mt-1">{avg ? avg.toFixed(3) + ' ppm' : '-'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Sobre 1.0 ppm</p>
          <p className="text-2xl font-bold mt-1 text-red-400">
            {samples.filter((s) => Number(s.cadmium) >= 1).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Lote</th>
                <th className="text-left px-4 py-3">Producto</th>
                <th className="text-left px-4 py-3">Cadmio</th>
                <th className="text-left px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`border-t border-gray-800 cursor-pointer hover:bg-gray-800/40 ${
                    selected?.id === s.id ? 'bg-gray-800/60' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{s.loteCode}</td>
                  <td className="px-4 py-3">{s.productType?.name}</td>
                  <td className={`px-4 py-3 font-semibold ${Number(s.cadmium) >= 1 ? 'text-red-400' : 'text-green-400'}`}>
                    {Number(s.cadmium).toFixed(3)} ppm
                  </td>
                  <td className="px-4 py-3 text-xs">{s.status}</td>
                </tr>
              ))}
              {samples.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">Sin muestras analizadas</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Detalle de muestra</h3>
          {selected ? (
            <div className="space-y-3 text-sm">
              <Row label="Lote" value={selected.loteCode} />
              <Row label="Producto" value={selected.productType?.name} />
              <Row label="Peso" value={selected.weight ? `${selected.weight} gr` : '-'} />
              <Row label="Productor" value={selected.producerName || '-'} />
              <Row label="Cadmio" value={`${Number(selected.cadmium).toFixed(4)} ppm`} />
              <Row label="Estado" value={selected.status} />
              <Row label="Orígenes" value={selected.origins?.map((o: any) => o.zone.name).join(', ') || '-'} />
              <Row label="Notas" value={selected.notes || '-'} />
              <Row label="Analizado por" value={selected.analyzedBy?.fullName || '-'} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Selecciona una muestra de la tabla</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMITE = 1.0;

export default function Alertas() {
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    axios.get(`${API}/samples`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => setSamples(r.data));
  }, []);

  const altas = samples
    .filter((s) => s.cadmium != null && Number(s.cadmium) >= LIMITE)
    .sort((a, b) => Number(b.cadmium) - Number(a.cadmium));

  const pendientes = samples.filter((s) => s.status === 'PENDING_ANALYSIS');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Alertas</h1>
      <p className="text-gray-400 text-sm mb-6">Cadmio alto (≥ {LIMITE} ppm) y muestras pendientes de Lima</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <span className="text-red-400">⚠</span>
            <h3 className="font-semibold">Cadmio por encima del límite ({altas.length})</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-[480px] overflow-y-auto">
            {altas.map((s) => (
              <div key={s.id} className="px-5 py-3 flex justify-between items-center hover:bg-gray-800/40">
                <div>
                  <p className="font-medium text-sm">{s.loteCode}</p>
                  <p className="text-xs text-gray-400">{s.productType?.name}</p>
                </div>
                <span className="text-red-400 font-bold">{Number(s.cadmium).toFixed(3)} ppm</span>
              </div>
            ))}
            {altas.length === 0 && <p className="px-5 py-10 text-center text-gray-500 text-sm">Sin alertas de cadmio alto</p>}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <span className="text-yellow-400">⏳</span>
            <h3 className="font-semibold">Pendientes de análisis ({pendientes.length})</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-[480px] overflow-y-auto">
            {pendientes.map((s) => (
              <div key={s.id} className="px-5 py-3 flex justify-between items-center hover:bg-gray-800/40">
                <div>
                  <p className="font-medium text-sm">{s.loteCode}</p>
                  <p className="text-xs text-gray-400">{s.productType?.name}</p>
                </div>
                <span className="text-yellow-400 text-xs font-medium">Esperando Lima</span>
              </div>
            ))}
            {pendientes.length === 0 && <p className="px-5 py-10 text-center text-gray-500 text-sm">No hay pendientes</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

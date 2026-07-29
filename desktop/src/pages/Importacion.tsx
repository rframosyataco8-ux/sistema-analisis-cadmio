export default function Importacion() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Importación</h1>
      <p className="text-gray-400 text-sm mb-6">Carga histórica desde Excel (Torta Trozada Cadmio)</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
        <h3 className="font-semibold mb-3">Datos ya cargados por hoja</h3>
        <p className="text-sm text-gray-400 mb-4">
          El seed del sistema ya importó muestras reales de cada hoja del Excel:
        </p>
        <ul className="space-y-2 text-sm text-gray-300 mb-6">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Torta de Cacao</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Torta de cacao alcalino</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Grano de cacao</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cacao alcalino</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cacao en polvo</li>
        </ul>

        <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
          <p className="font-medium text-gray-300 mb-2">Para reimportar desde terminal:</p>
          <code className="text-green-400 text-xs block">cd backend</code>
          <code className="text-green-400 text-xs block">npm run prisma:seed</code>
          <p className="mt-3 text-xs">
            Las celdas en amarillo del Excel (recién llenadas / SIN MUESTRA) quedan como
            <span className="text-yellow-400"> PENDING_ANALYSIS</span> para que Lima las complete en el móvil.
          </p>
        </div>
      </div>
    </div>
  );
}

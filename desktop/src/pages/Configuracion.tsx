export default function Configuracion() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Configuración</h1>
      <p className="text-gray-400 text-sm mb-6">Ajustes del sistema</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Sesón actual</h3>
          <div className="space-y-3 text-sm">
            <Row label="Nombre" value={user.fullName || '-'} />
            <Row label="Email" value={user.email || '-'} />
            <Row label="Rol" value={user.role || '-'} />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Sistema</h3>
          <div className="space-y-3 text-sm">
            <Row label="Versión" value="1.0.0" />
            <Row label="API" value="http://localhost:3000" />
            <Row label="Límite alerta Cd" value="1.0 ppm" />
            <Row label="Empresa" value="Exportadora Romex S.A." />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-2">
          <h3 className="font-semibold mb-2">Hojas del Excel reconocidas</h3>
          <p className="text-xs text-gray-500 mb-3">Cada hoja se mapea a un tipo de producto distinto</p>
          <div className="flex flex-wrap gap-2">
            {['Torta de cacao', 'Torta de cacao alcalino', 'Grano de cacao', 'Cacao alcalino', 'Cacao en polvo', 'Torta trozada'].map((p) => (
              <span key={p} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

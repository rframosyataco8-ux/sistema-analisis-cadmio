import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
      isActive ? 'bg-green-600 text-white font-medium' : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex">
      <aside className="w-60 border-r border-gray-800/80 flex flex-col bg-[#0d1520]">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-green-500/60 flex items-center justify-center text-green-400 text-lg">🌿</div>
          <div>
            <p className="font-semibold text-sm leading-tight">Análisis de Cadmio</p>
            <p className="text-[10px] text-gray-500">Exportadora Romex</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLink to="/dashboard" className={linkClass}>
            <span>🏠</span> Dashboard
          </NavLink>
          <NavLink to="/samples" className={linkClass}>
            <span>🧪</span> Muestras
          </NavLink>
          <NavLink to="/zonas" className={linkClass}>
            <span>📍</span> Zonas
          </NavLink>
          <NavLink to="/comparaciones" className={linkClass}>
            <span>📊</span> Comparaciones
          </NavLink>
          <NavLink to="/evolucion" className={linkClass}>
            <span>📈</span> Evolución de Zonas
          </NavLink>
          <NavLink to="/reportes" className={linkClass}>
            <span>📄</span> Reportes
          </NavLink>
          <NavLink to="/estadisticas" className={linkClass}>
            <span>📋</span> Estadísticas
          </NavLink>
          <NavLink to="/alertas" className={linkClass}>
            <span>🔔</span> Alertas
          </NavLink>
          <NavLink to="/mapa" className={linkClass}>
            <span>🗺</span> Mapa de Calor
          </NavLink>
          <NavLink to="/importacion" className={linkClass}>
            <span>⬇</span> Importación
          </NavLink>

          {user.role === 'ADMIN' && (
            <>
              <div className="pt-3 pb-1 px-4 text-[10px] uppercase tracking-wider text-gray-600">Admin</div>
              <NavLink to="/users" className={linkClass}>
                <span>👥</span> Usuarios
              </NavLink>
              <NavLink to="/configuracion" className={linkClass}>
                <span>⚙</span> Configuración
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 truncate">{user.fullName}</p>
          <p className="text-[10px] text-green-500 mb-2">{user.role}</p>
          <button onClick={logout} className="text-xs text-red-400 hover:text-red-300">Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

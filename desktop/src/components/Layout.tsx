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
      isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-lg">☕</div>
          <div>
            <p className="font-semibold text-sm leading-tight">Análisis de Cadmio</p>
            <p className="text-xs text-gray-500">Sistema Empresarial</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/dashboard" className={linkClass}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/samples" className={linkClass}>
            🧪 Muestras
          </NavLink>
          {user.role === 'ADMIN' && (
            <NavLink to="/users" className={linkClass}>
              👥 Usuarios
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">{user.fullName}</p>
          <p className="text-xs text-green-500 mb-3">{user.role}</p>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

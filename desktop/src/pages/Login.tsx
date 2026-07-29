import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0f1a] text-white overflow-hidden">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-center px-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1611937663641-5cef5189d4f5?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent" />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            SISTEMA INTELIGENTE
            <br />
            DE ANÁLISIS DE
            <br />
            <span className="text-green-500">CADMIO</span>
          </h1>
          <div className="w-16 h-1 bg-green-500 mt-4 mb-6 rounded" />
          <p className="text-gray-300 text-sm leading-relaxed max-w-md">
            Plataforma para el análisis, monitoreo y comparación del comportamiento
            del cadmio en productos de cacao por zona.
          </p>
          <div className="flex gap-8 mt-12">
            <Feature icon="📊" title="ANÁLISIS" desc="Datos precisos y confiables" />
            <Feature icon="📈" title="COMPARACIONES" desc="Compare zonas y periodos" />
            <Feature icon="🛡" title="TRAZABILIDAD" desc="Información organizada" />
            <Feature icon="📄" title="REPORTES" desc="Reportes personalizados" />
          </div>
        </div>
        <p className="absolute bottom-6 left-16 text-xs text-gray-600 z-10">
          © 2026 Exportadora Romex S.A. · Todos los derechos reservados
        </p>
      </div>

      {/* Panel derecho — login */}
      <div className="w-full lg:w-[420px] xl:w-[460px] flex items-center justify-center p-8 bg-[#0d1520]/95 border-l border-gray-800/50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-green-500 flex items-center justify-center bg-[#0f1a12]">
              <span className="text-3xl">🌿</span>
            </div>
            <h2 className="text-2xl font-bold">Bienvenido</h2>
            <p className="text-gray-400 text-sm mt-1">Inicie sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 tracking-wider font-medium">USUARIO</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">👤</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 tracking-wider font-medium">CONTRASEÑA</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-10 py-3 bg-[#111827] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
                >
                  {showPass ? '👁' : '🔒'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-950/40 border border-red-900/50 rounded-lg py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg transition text-sm tracking-wide flex items-center justify-center gap-2"
            >
              {loading ? 'Ingresando...' : (
                <>
                  <span>→</span> INICIAR SESIÓN
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-xs text-gray-600">
            <span>Versión 1.0.0</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Conexión establecida
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 mx-auto mb-2 rounded-lg border border-green-500/40 flex items-center justify-center text-green-400 text-lg">
        {icon}
      </div>
      <p className="text-[10px] font-semibold text-green-400 tracking-wider">{title}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}

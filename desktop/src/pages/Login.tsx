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
  const [remember, setRemember] = useState(false);
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
    <div className="min-h-screen flex bg-[#0a0f1a] text-white overflow-hidden select-none">
      {/* ── Panel izquierdo — branding ── */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-center px-14 xl:px-20">
        {/* Fondo cacao */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1611937663641-5cef5189d4f5?w=1400&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/85 to-[#0a0f1a]/40" />
        {/* Patrón hexagonal sutil */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2322c55e' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 52px',
          }}
        />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl xl:text-[2.75rem] font-bold leading-[1.15] tracking-tight">
            SISTEMA INTELIGENTE
            <br />
            DE ANÁLISIS DE
            <br />
            <span className="text-green-500">CADMIO</span>
          </h1>
          <div className="w-14 h-[3px] bg-green-500 mt-5 mb-6 rounded-full" />
          <p className="text-gray-300/90 text-[15px] leading-relaxed max-w-md">
            Plataforma para el análisis, monitoreo y comparación del comportamiento
            del cadmio en productos de cacao por zona.
          </p>

          <div className="flex gap-6 mt-14">
            <Feature
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="ANÁLISIS"
              desc="Datos precisos y confiables"
            />
            <Feature
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
              title="COMPARACIONES"
              desc="Compare zonas y periodos fácilmente"
            />
            <Feature
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="TRAZABILIDAD"
              desc="Información organizada y segura"
            />
            <Feature
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="REPORTES"
              desc="Genere reportes personalizados"
            />
          </div>
        </div>

        <p className="absolute bottom-5 left-14 xl:left-20 text-[11px] text-gray-500 z-10">
          © 2024 · Todos los derechos reservados
        </p>
      </div>

      {/* ── Panel derecho — login ── */}
      <div className="w-full lg:w-[400px] xl:w-[440px] flex items-center justify-center p-8 bg-[#0c121c]/95 border-l border-white/[0.06] relative">
        <div className="w-full max-w-[340px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-[72px] h-[72px] mx-auto mb-4 rounded-full border-[2.5px] border-green-500 flex items-center justify-center bg-[#0d1a12] shadow-[0_0_24px_rgba(34,197,94,0.15)]">
              <svg className="w-9 h-9 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.31A12 12 0 0012 20c5 0 9-4 9-9 0-4.08-3-6.54-4-7zm-5 9a5 5 0 01-5-5c0-1.5.5-2.5 1.5-3.5 1.5 1.5 3.5 2.5 5.5 2.5.5 1.5.5 3.5-2 6z" />
                <path d="M12 2C9 4 7 7 7 10c0 2 1 3.5 2.5 4.5C11 12 14 10 16 7c-1-2-2.5-3.5-4-5z" opacity=".7" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold tracking-tight">Bienvenido</h2>
            <p className="text-gray-400 text-[13px] mt-1">Inicie sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-[11px] text-gray-400 mb-1.5 tracking-[0.08em] font-semibold uppercase">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-[11px] bg-[#111827] border border-gray-700/80 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[11px] text-gray-400 mb-1.5 tracking-[0.08em] font-semibold uppercase">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-11 py-[11px] bg-[#111827] border border-gray-700/80 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme + Olvidé */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-[#111827] text-green-500 focus:ring-green-500/40 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[12px] text-gray-400 group-hover:text-gray-300 transition">Recordarme</span>
              </label>
              <button type="button" className="text-[12px] text-green-500/80 hover:text-green-400 transition">
                ¿Olvidó su contraseña?
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-[13px] text-center bg-red-950/50 border border-red-900/40 rounded-lg py-2.5 px-3">
                {error}
              </p>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[13px] bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all text-[13px] tracking-[0.06em] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_20px_rgba(22,163,74,0.35)]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  INICIAR SESIÓN
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-[11px] text-gray-600">ó</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Windows (visual) */}
          <button
            type="button"
            className="w-full py-[11px] bg-transparent border border-gray-700/70 hover:border-gray-500 hover:bg-white/[0.03] rounded-lg text-[12px] text-gray-300 font-medium tracking-wide flex items-center justify-center gap-2.5 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5.5L10.5 4.5v6.75H3V5.5zm0 13L10.5 19.5v-6.75H3v6.75zM11.25 4.4L21 3v8.25h-9.75V4.4zm0 16.2L21 21v-8.25h-9.75v8.25z" />
            </svg>
            INICIAR SESIÓN CON WINDOWS
          </button>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between text-[11px] text-gray-600">
            <span>Versión 1.0.0</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Conexión establecida
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center max-w-[100px]">
      <div className="w-11 h-11 mx-auto mb-2.5 rounded-lg border border-green-500/35 flex items-center justify-center text-green-400 bg-green-500/[0.06]">
        {icon}
      </div>
      <p className="text-[10px] font-semibold text-green-400 tracking-[0.06em]">{title}</p>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{desc}</p>
    </div>
  );
}

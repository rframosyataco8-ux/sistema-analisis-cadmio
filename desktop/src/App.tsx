import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Samples from './pages/Samples';
import Users from './pages/Users';
import Configuracion from './pages/Configuracion';
import Analytics from './pages/Analytics';
import Laboratorio from './pages/Laboratorio';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return localStorage.getItem('accessToken') ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lotes" element={<Samples />} />
          <Route path="laboratorio" element={<Laboratorio />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="users" element={<Users />} />
          {/* Redirects de rutas antiguas */}
          <Route path="samples" element={<Navigate to="/lotes" replace />} />
          <Route path="zonas" element={<Navigate to="/analytics" replace />} />
          <Route path="comparaciones" element={<Navigate to="/analytics" replace />} />
          <Route path="evolucion" element={<Navigate to="/analytics" replace />} />
          <Route path="reportes" element={<Navigate to="/analytics" replace />} />
          <Route path="estadisticas" element={<Navigate to="/dashboard" replace />} />
          <Route path="alertas" element={<Navigate to="/dashboard" replace />} />
          <Route path="mapa" element={<Navigate to="/analytics" replace />} />
          <Route path="importacion" element={<Navigate to="/lotes" replace />} />
          <Route path="trazabilidad" element={<Navigate to="/lotes" replace />} />
          <Route path="analisis" element={<Navigate to="/laboratorio" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

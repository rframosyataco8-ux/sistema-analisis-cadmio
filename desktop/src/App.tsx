import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Samples from './pages/Samples';
import Users from './pages/Users';
import Analisis from './pages/Analisis';
import Comparaciones from './pages/Comparaciones';
import Trazabilidad from './pages/Trazabilidad';
import Reportes from './pages/Reportes';
import Zonas from './pages/Zonas';
import Evolucion from './pages/Evolucion';
import Estadisticas from './pages/Estadisticas';
import Alertas from './pages/Alertas';
import Mapa from './pages/Mapa';
import Importacion from './pages/Importacion';
import Configuracion from './pages/Configuracion';
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
          <Route path="samples" element={<Samples />} />
          <Route path="analisis" element={<Analisis />} />
          <Route path="zonas" element={<Zonas />} />
          <Route path="comparaciones" element={<Comparaciones />} />
          <Route path="evolucion" element={<Evolucion />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="alertas" element={<Alertas />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="importacion" element={<Importacion />} />
          <Route path="trazabilidad" element={<Trazabilidad />} />
          <Route path="users" element={<Users />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

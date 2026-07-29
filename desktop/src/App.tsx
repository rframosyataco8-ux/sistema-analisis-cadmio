import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Samples from './pages/Samples';
import Users from './pages/Users';
import Analisis from './pages/Analisis';
import Comparaciones from './pages/Comparaciones';
import Trazabilidad from './pages/Trazabilidad';
import Reportes from './pages/Reportes';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="samples" element={<Samples />} />
          <Route path="analisis" element={<Analisis />} />
          <Route path="comparaciones" element={<Comparaciones />} />
          <Route path="trazabilidad" element={<Trazabilidad />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

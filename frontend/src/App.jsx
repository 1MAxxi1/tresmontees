import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import GuardiaDashboard from './pages/GuardiaDashboard';
import RRHHLayout from './components/RRHHLayout';
import RRHHDashboardMUI from './pages/RRHHDashboardMUI';
import Trabajadores from './pages/Trabajadores';
import Entregas from './pages/Entregas';
import Reportes from './pages/Reportes';
import QRManager from './pages/QRManager';
import Notificaciones from './pages/Notificaciones';
import Configuracion from './pages/Configuracion';
import SupervisorLayout from './components/SupervisorLayout';
import SupervisorDashboard from './pages/SupervisorDashboard';
import SupervisorIncidencias from './pages/SupervisorIncidencias';

function ProtectedRoute({ children, allowedRoles }) {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/guardia" 
          element={
            <ProtectedRoute allowedRoles={['guardia']}>
              <GuardiaDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* RRHH con Layout de Material-UI */}
        <Route 
          path="/rrhh" 
          element={
            <ProtectedRoute allowedRoles={['rrhh', 'admin']}>
              <RRHHLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<RRHHDashboardMUI />} />
          <Route path="trabajadores" element={<Trabajadores />} />
          <Route path="qr" element={<QRManager />} />
          <Route path="entregas" element={<Entregas />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* SUPERVISOR con Layout de Material-UI */}
        <Route 
          path="/supervisor" 
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <SupervisorLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<SupervisorDashboard />} />
          <Route path="incidencias" element={<SupervisorIncidencias />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
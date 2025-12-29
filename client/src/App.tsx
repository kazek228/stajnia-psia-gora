import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Horses from './pages/Horses';
import Users from './pages/Users';
import Schedule from './pages/Schedule';
import Feeding from './pages/Feeding';
import RiderPortal from './pages/RiderPortal';
import TrainerSchedule from './pages/TrainerSchedule';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nature-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect based on role
  const getDefaultRoute = () => {
    switch (user?.role) {
      case 'ADMIN':
        return '/dashboard';
      case 'RIDER':
        return '/my-rides';
      case 'TRAINER':
        return '/my-schedule';
      case 'STABLE_HAND':
        return '/feeding';
      default:
        return '/dashboard';
    }
  };

  return (
    <Layout>
      <Routes>
        {/* Admin routes */}
        {user?.role === 'ADMIN' && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/horses" element={<Horses />} />
            <Route path="/users" element={<Users />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/feeding" element={<Feeding />} />
          </>
        )}

        {/* Rider routes */}
        {user?.role === 'RIDER' && (
          <Route path="/my-rides" element={<RiderPortal />} />
        )}

        {/* Trainer routes */}
        {user?.role === 'TRAINER' && (
          <>
            <Route path="/my-schedule" element={<TrainerSchedule />} />
          </>
        )}

        {/* Stable hand routes */}
        {user?.role === 'STABLE_HAND' && (
          <Route path="/feeding" element={<Feeding />} />
        )}

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

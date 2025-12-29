import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, hasRole } from './context/AuthContext';
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

  // Redirect based on role (priority: ADMIN > TRAINER > RIDER > STABLE_HAND)
  const getDefaultRoute = () => {
    if (hasRole(user, 'ADMIN')) return '/dashboard';
    if (hasRole(user, 'TRAINER')) return '/my-schedule';
    if (hasRole(user, 'RIDER')) return '/my-rides';
    if (hasRole(user, 'STABLE_HAND')) return '/feeding';
    return '/dashboard';
  };

  const isAdmin = hasRole(user, 'ADMIN');
  const isRider = hasRole(user, 'RIDER');
  const isTrainer = hasRole(user, 'TRAINER');
  const isStableHand = hasRole(user, 'STABLE_HAND');

  return (
    <Layout>
      <Routes>
        {/* Admin routes */}
        {isAdmin && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/horses" element={<Horses />} />
            <Route path="/users" element={<Users />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/feeding" element={<Feeding />} />
          </>
        )}

        {/* Rider routes */}
        {isRider && !isAdmin && (
          <Route path="/my-rides" element={<RiderPortal />} />
        )}

        {/* Trainer routes */}
        {isTrainer && !isAdmin && (
          <>
            <Route path="/my-schedule" element={<TrainerSchedule />} />
          </>
        )}

        {/* Stable hand routes */}
        {isStableHand && !isAdmin && (
          <Route path="/feeding" element={<Feeding />} />
        )}

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

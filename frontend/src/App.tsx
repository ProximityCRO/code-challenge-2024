import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import DriverDashboard from './pages/DriverDashboard';
// import RideRequest from './pages/RideRequest';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ element: React.ReactElement, role?: 'user' | 'driver' }> = ({ element, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user-dashboard" element={<ProtectedRoute element={<UserDashboard />} role="user" />} />
      <Route path="/driver-dashboard" element={<ProtectedRoute element={<DriverDashboard />} role="driver" />} />
      {/* <Route path="/ride-request" element={<ProtectedRoute element={<RideRequest />} role="user" />} /> */}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App;
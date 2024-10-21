import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import VehicleRegistrationForm from "./components/Driver/VehicleRegistrationForm";
import RideDetails from "./components/User/RideDetails";
import RideHistory from "./components/User/RideHistory";
import DriverHistory from "./components/Driver/DriverHistory";
import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute element={<UserDashboard />} role="user" />
                }
              />
              <Route
                path="/driver-dashboard"
                element={
                  <ProtectedRoute
                    element={<DriverRoute element={<DriverDashboard />} />}
                    role="driver"
                  />
                }
              />
              <Route
                path="/vehicle-registration"
                element={
                  <ProtectedRoute
                    element={<VehicleRegistrationForm />}
                    role="driver"
                  />
                }
              />
              <Route
                path="/ride/:id"
                element={<ProtectedRoute element={<RideDetails />} role="user" />}
              />
              <Route
                path="/ride-history"
                element={<ProtectedRoute element={<RideHistory />} role="user" />}
              />
              <Route
                path="/driver-history"
                element={<ProtectedRoute element={<DriverHistory />} role="driver" />}
              />
            </Routes>
          </AuthProvider>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  role?: "user" | "driver";
}> = ({ element, role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return element;
};

const DriverRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { user, isLoading } = useAuth();
  const [hasVehicle, setHasVehicle] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVehicle = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `http://localhost:3001/api/v1/auth/profile/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.vehicle) {
          setHasVehicle(true);
        } else {
          setHasVehicle(false);
          navigate("/vehicle-registration");
        }
      } catch (error) {
        console.error("Error checking vehicle:", error);
        setHasVehicle(false);
        navigate("/vehicle-registration");
      }
    };

    if (!isLoading && user && user.role === "driver") {
      checkVehicle();
    }
  }, [user, navigate, isLoading]);

  if (isLoading || hasVehicle === null) return null; // Estado de carga
  if (hasVehicle === false)
    return <Navigate to="/vehicle-registration" replace />;
  return element;
};

export default App;

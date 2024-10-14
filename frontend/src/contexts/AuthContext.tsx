import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "driver";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: "user" | "driver"
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");

      if (userId && userRole && userEmail) {
        const user = {
          id: parseInt(userId),
          name: "",
          email: userEmail,
          role: userRole as "user" | "driver",
        };
        setUser(user);
        return user;
      }
    }
    return null;
  };

  useEffect(() => {
    const authenticatedUser = checkAuth();
    if (authenticatedUser) {
      // User is authenticated, redirect to appropriate dashboard if not already there
      const currentPath = window.location.pathname;
      if (currentPath === "/login" || currentPath === "/register") {
        navigate(
          authenticatedUser.role === "driver"
            ? "/driver-dashboard"
            : "/user-dashboard"
        );
      }
    } else {
      // User is not authenticated, only redirect to login if trying to access protected routes
      const currentPath = window.location.pathname;
      const protectedRoutes = ["/user-dashboard", "/driver-dashboard"];
      if (protectedRoutes.includes(currentPath)) {
        navigate("/login");
      }
    }
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/auth/login",
        { email, password }
      );
      const { token, email: userEmail, id } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", id.toString());
      localStorage.setItem("userEmail", userEmail);

      // Extract role from JWT token
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const role = decodedToken.role;
      localStorage.setItem("userRole", role);

      // Set the user state directly
      setUser({
        id,
        name: "", // You might want to include the name in the login response
        email: userEmail,
        role: role as "user" | "driver",
      });

      // Navigate based on user role
      if (role === "driver") {
        navigate("/driver-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  const register = async (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: "user" | "driver"
  ) => {
    try {
      console.log("Registering user:", { name, email, phoneNumber, role });
      const response = await axios.post(
        "http://localhost:3001/api/v1/auth/register",
        {
          name,
          email,
          password,
          phone_number: phoneNumber,
          role,
        }
      );
      const { name: userName, email: userEmail } = response.data;
      setUser({ id: 0, name: userName, email: userEmail, role });
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Registration failed:", error.response.data);
        throw new Error(
          error.response.data.message ||
            "Registration failed. Please check your input and try again."
        );
      } else {
        console.error("Registration failed:", error);
        throw new Error(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

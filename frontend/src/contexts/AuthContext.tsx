import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// User interface definition
interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "driver";
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: "user" | "driver"
  ) => Promise<void>;
  logout: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State variables for user and loading status
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect hook to check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
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
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  // Function to handle user login
  const login = async (email: string, password: string): Promise<string> => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/auth/login",
        {
          email,
          password,
        }
      );
      const { token, email: userEmail, id } = response.data;

      // Store authentication data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", id.toString());
      localStorage.setItem("userEmail", userEmail);

      // Extract role from JWT token
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const role = decodedToken.role;
      localStorage.setItem("userRole", role);

      // Set the user state
      setUser({
        id,
        name: "", // Consider including the name in the login response
        email: userEmail,
        role: role as "user" | "driver",
      });

      return role;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Function to handle user registration
  const register = async (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: "user" | "driver"
  ): Promise<void> => {
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

      // Set the user state
      setUser({ id: 0, name: userName, email: userEmail, role });
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

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

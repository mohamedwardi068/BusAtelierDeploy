// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import fakeApi from "../data/fakeData";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(storedUser);
    } else {
      setUser(null); // Ensure user is cleared if token was deleted manually
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { token, user } = await fakeApi.users.login(credentials);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await fakeApi.users.logout();
    } catch (err) {
      console.warn("Logout request failed (but continuing):", err.message);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };



  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => useContext(AuthContext);

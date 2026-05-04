import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (formData) => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data;
  };

  const login = async (formData) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!data.success) {
      throw data;
    }

    const user = data.data;

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const setRoleApi = async (role) => {
    const res = await fetch("http://localhost:5000/api/auth/set-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (!data.success) {
      throw data;
    }

    const user = data.data;

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));

    return user;

    };

  return (
    <AuthContext.Provider
      value={{ user, register, login, setRoleApi, setUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
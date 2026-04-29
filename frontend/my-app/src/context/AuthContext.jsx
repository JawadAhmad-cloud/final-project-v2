import { createContext, useState } from "react";
// import { apiFetch } from "../services/Api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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
    throw data; // send full backend error
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

  if (!res.ok) {
    throw data;
  }
setUser(data)
  return setUser(data);
};

return (
<AuthContext.Provider value={{user, register, login,setUser}}>
    {children}
</AuthContext.Provider>
)
}
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

  if (!data.success) {
    throw data;
  }
const user=data.data
setUser(user)
return user
};
const setRoleApi= async(role)=>{
  const res = await fetch("http://localhost:5000/api/auth/set-role",{
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body:JSON.stringify({role})
  })
 const data =await res.json()
 if(!data.success){
  throw data
 }
 const user=data.data
setUser(user)
return user
}
return (
<AuthContext.Provider value={{user, register, login, setRoleApi, setUser}}>
    {children}
</AuthContext.Provider>
)
}
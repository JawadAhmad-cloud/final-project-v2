import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { AdminProvider } from "../src/context/AdminContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AdminProvider>
      <App />
    </AdminProvider>
  </AuthProvider>,
);

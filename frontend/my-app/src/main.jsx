import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { AdminProvider } from "../src/context/AdminContext.jsx";
import { SocketProvider } from "../src/context/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <AuthProvider>
        <AdminProvider>
          <App />
          <Toaster position="top-right" />
        </AdminProvider>
      </AuthProvider>
    </SocketProvider>
  </StrictMode>,
);

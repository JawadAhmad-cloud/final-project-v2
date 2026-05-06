import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/Routes";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;

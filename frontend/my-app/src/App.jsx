import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/Routes";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketProvider } from "./context/SocketContext";
import NotificationContainer from "./components/NotificationContainer";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <NotificationProvider>
          <Toaster position="bottom-right" />
          <NotificationContainer />
          <AppRoutes />
        </NotificationProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;

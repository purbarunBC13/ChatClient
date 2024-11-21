import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketContext.jsx";
import CustomToast from "@/components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <>
    <SocketProvider>
      <App />
      <Toaster closeButton />
      <CustomToast />
    </SocketProvider>
  </>
  // </React.StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { WatchlistProvider } from "./context/WatchlistContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* AuthProvider wraps everything — user is available everywhere */}
    <AuthProvider>
      {/* WatchlistProvider inside Auth so it can access user later */}
      <WatchlistProvider>
        <App />
      </WatchlistProvider>
    </AuthProvider>
  </StrictMode>
);
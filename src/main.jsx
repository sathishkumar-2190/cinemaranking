import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { WatchlistProvider } from "./context/WatchlistContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* WatchlistProvider makes watchlist available everywhere in the app */}
    <WatchlistProvider>
      <App />
    </WatchlistProvider>
  </StrictMode>
);
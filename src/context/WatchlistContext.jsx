// ─────────────────────────────────────────────
//  WatchlistContext — makes watchlist available
//  everywhere in the app without prop drilling
// ─────────────────────────────────────────────

import { createContext, useContext } from "react";
import { useWatchlist } from "./useWatchlist";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const watchlist = useWatchlist();
  return (
    <WatchlistContext.Provider value={watchlist}>
      {children}
    </WatchlistContext.Provider>
  );
}

// Use this hook anywhere in your app:
// const { addToWatchlist, isInWatchlist } = useWatchlistContext();
export function useWatchlistContext() {
  return useContext(WatchlistContext);
}
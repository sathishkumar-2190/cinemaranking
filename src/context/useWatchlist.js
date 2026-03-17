// ─────────────────────────────────────────────
//  useWatchlist — global watchlist state hook
//  Saves to localStorage now, easy to swap to
//  backend (Supabase) later — just replace the
//  load/save functions at the bottom of this file
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";

const STORAGE_KEY = "cinemaranking_watchlist";

// Load from localStorage
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { movies: [], series: [] };
  } catch {
    return { movies: [], series: [] };
  }
};

// Save to localStorage
const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error("Could not save watchlist");
  }
};

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    saveToStorage(watchlist);
  }, [watchlist]);

  // Add item — goes to correct list based on media_type
  const addToWatchlist = (item) => {
    const list = item.media_type === "tv" ? "series" : "movies";
    setWatchlist((prev) => {
      const alreadyIn = prev[list].some((i) => i.id === item.id);
      if (alreadyIn) return prev;
      return {
        ...prev,
        [list]: [
          ...prev[list],
          {
            id: item.id,
            title: item.title || item.name || "Untitled",
            poster_path: item.poster_path || null,
            vote_average: item.vote_average || 0,
            release_date: item.release_date || item.first_air_date || "",
            media_type: item.media_type || "movie",
            note: "",
          },
        ],
      };
    });
  };

  // Remove item from either list
  const removeFromWatchlist = (id, list) => {
    setWatchlist((prev) => ({
      ...prev,
      [list]: prev[list].filter((i) => i.id !== id),
    }));
  };

  // Check if already in watchlist
  const isInWatchlist = (id) => {
    return (
      watchlist.movies.some((i) => i.id === id) ||
      watchlist.series.some((i) => i.id === id)
    );
  };

  // Reorder a list after drag & drop
  const reorderList = (list, newOrder) => {
    setWatchlist((prev) => ({ ...prev, [list]: newOrder }));
  };

  // Update note on an item
  const updateNote = (id, list, note) => {
    setWatchlist((prev) => ({
      ...prev,
      [list]: prev[list].map((i) => (i.id === id ? { ...i, note } : i)),
    }));
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    reorderList,
    updateNote,
  };
}
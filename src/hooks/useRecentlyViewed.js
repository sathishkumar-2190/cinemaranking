// ─────────────────────────────────────────────
//  useRecentlyViewed — tracks last 20 visited
//  Saves to localStorage automatically
// ─────────────────────────────────────────────
import { useState, useCallback } from "react";

const KEY      = "cinemaranking_recently_viewed";
const MAX_ITEMS = 20;

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const save = (items) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); }
  catch { console.error("Could not save recently viewed"); }
};

export function useRecentlyViewed() {
  const [items, setItems] = useState(load);

  const addItem = useCallback((item) => {
    setItems(prev => {
      const filtered = prev.filter(i => !(i.id === item.id && i.media_type === item.media_type));
      const updated  = [item, ...filtered].slice(0, MAX_ITEMS);
      save(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  return { items, addItem, clearHistory };
}
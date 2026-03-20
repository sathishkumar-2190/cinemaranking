// ─────────────────────────────────────────────
//  useWatchlist — Phase 3
//  Syncs to Supabase when logged in
//  Falls back to localStorage when logged out
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "cinemaranking_watchlist";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { movies: [], series: [] };
  } catch {
    return { movies: [], series: [] };
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error("Could not save watchlist to localStorage");
  }
};

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState({ movies: [], series: [] });
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);

  // ── Listen for auth state changes ──────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Load watchlist when user changes ───────
  useEffect(() => {
    if (user) {
      loadFromSupabase();
    } else {
      // Not logged in — use localStorage
      setWatchlist(loadFromStorage());
      setLoading(false);
    }
  }, [user]);

  // ── Load from Supabase ──────────────────────
  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("rank", { ascending: true });

      if (error) throw error;

      const movies = (data || []).filter(i => i.media_type === "movie");
      const series = (data || []).filter(i => i.media_type === "tv");
      setWatchlist({ movies, series });
    } catch (err) {
      console.error("Failed to load watchlist:", err);
      // Fallback to localStorage if Supabase fails
      setWatchlist(loadFromStorage());
    }
    setLoading(false);
  };

  // ── Persist to localStorage (always) ───────
  // So data is available offline too
  useEffect(() => {
    if (!loading) saveToStorage(watchlist);
  }, [watchlist, loading]);

  // ── ADD ─────────────────────────────────────
  const addToWatchlist = useCallback(async (item) => {
    const list     = item.media_type === "tv" ? "series" : "movies";
    const numericId = Number(item.id);

    // Check already in list
    const alreadyIn = watchlist[list].some(i => i.id === numericId || i.tmdb_id === numericId);
    if (alreadyIn) return;

    const nextRank = watchlist[list].length + 1;

    const newItem = {
      tmdb_id:      numericId,
      media_type:   item.media_type || "movie",
      title:        item.title || item.name || "Untitled",
      poster_path:  item.poster_path || null,
      vote_average: item.vote_average || 0,
      release_date: item.release_date || item.first_air_date || "",
      note:         "",
      rank:         nextRank,
    };

    // Optimistic UI update
    setWatchlist(prev => ({
      ...prev,
      [list]: [...prev[list], { ...newItem, id: numericId }],
    }));

    // Save to Supabase if logged in
    if (user) {
      const { error } = await supabase
        .from("watchlist")
        .insert({ ...newItem, user_id: user.id });

      if (error) {
        console.error("Failed to save to Supabase:", error.message);
        // Revert on failure
        setWatchlist(prev => ({
          ...prev,
          [list]: prev[list].filter(i => i.tmdb_id !== numericId),
        }));
      }
    }
  }, [watchlist, user]);

  // ── REMOVE ──────────────────────────────────
  const removeFromWatchlist = useCallback(async (id, list) => {
    const numericId = Number(id);

    // Optimistic UI update
    setWatchlist(prev => ({
      ...prev,
      [list]: prev[list].filter(i => (i.tmdb_id || i.id) !== numericId),
    }));

    // Remove from Supabase if logged in
    if (user) {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", numericId);

      if (error) console.error("Failed to remove from Supabase:", error.message);
    }
  }, [user]);

  // ── CHECK ────────────────────────────────────
  const isInWatchlist = useCallback((id) => {
    const numericId = Number(id);
    return (
      watchlist.movies.some(i => (i.tmdb_id || i.id) === numericId) ||
      watchlist.series.some(i => (i.tmdb_id || i.id) === numericId)
    );
  }, [watchlist]);

  // ── REORDER (drag & drop) ───────────────────
  const reorderList = useCallback(async (list, newOrder) => {
    setWatchlist(prev => ({ ...prev, [list]: newOrder }));

    // Update ranks in Supabase if logged in
    if (user) {
      const updates = newOrder.map((item, index) =>
        supabase
          .from("watchlist")
          .update({ rank: index + 1 })
          .eq("user_id", user.id)
          .eq("tmdb_id", item.tmdb_id || item.id)
      );
      await Promise.all(updates);
    }
  }, [user]);

  // ── UPDATE NOTE ─────────────────────────────
  const updateNote = useCallback(async (id, list, note) => {
    const numericId = Number(id);

    setWatchlist(prev => ({
      ...prev,
      [list]: prev[list].map(i =>
        (i.tmdb_id || i.id) === numericId ? { ...i, note } : i
      ),
    }));

    if (user) {
      const { error } = await supabase
        .from("watchlist")
        .update({ note })
        .eq("user_id", user.id)
        .eq("tmdb_id", numericId);

      if (error) console.error("Failed to update note:", error.message);
    }
  }, [user]);

  return {
    watchlist,
    loading,
    user,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    reorderList,
    updateNote,
  };
}
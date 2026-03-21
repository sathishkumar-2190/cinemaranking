// ─────────────────────────────────────────────
//  useRatings — user star ratings
//  Saves to Supabase ratings table
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useRatings() {
  const [ratings, setRatings] = useState({}); // { tmdb_id: rating }
  const [user,    setUser]    = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadRatings(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) loadRatings(session.user.id);
      else setRatings({});
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadRatings = async (userId) => {
    const { data } = await supabase
      .from("ratings")
      .select("tmdb_id, rating")
      .eq("user_id", userId);
    if (data) {
      const map = {};
      data.forEach(r => { map[r.tmdb_id] = r.rating; });
      setRatings(map);
    }
  };

  const rateItem = useCallback(async (tmdbId, rating, mediaType) => {
    if (!user) return;
    const numId = Number(tmdbId);

    // Optimistic update
    setRatings(prev => ({ ...prev, [numId]: rating }));

    const { error } = await supabase
      .from("ratings")
      .upsert({
        user_id:    user.id,
        tmdb_id:    numId,
        media_type: mediaType,
        rating,
      }, { onConflict: "user_id,tmdb_id" });

    if (error) console.error("Rating save failed:", error.message);
  }, [user]);

  const removeRating = useCallback(async (tmdbId) => {
    if (!user) return;
    const numId = Number(tmdbId);
    setRatings(prev => { const n = {...prev}; delete n[numId]; return n; });
    await supabase.from("ratings").delete()
      .eq("user_id", user.id).eq("tmdb_id", numId);
  }, [user]);

  const getUserRating = useCallback((tmdbId) => {
    return ratings[Number(tmdbId)] || 0;
  }, [ratings]);

  return { rateItem, removeRating, getUserRating, user };
}
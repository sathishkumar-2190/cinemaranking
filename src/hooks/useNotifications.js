// ─────────────────────────────────────────────
//  useNotifications — checks for new releases
//  from followed actors and upcoming watchlist items
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { fetchPersonDetails } from "../api/tmdb";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [user,          setUser]          = useState(null);
  const [checked,       setChecked]       = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || checked) return;
    checkNotifications();
  }, [user]);

  const checkNotifications = async () => {
    setChecked(true);
    const notes = [];
    const now   = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    try {
      // Check followed actors for new releases
      const { data: actors } = await supabase
        .from("favourite_actors").select("*").eq("user_id", user.id);

      if (actors?.length) {
        const recentReleases = await Promise.all(
          actors.slice(0, 5).map(async (actor) => {
            const data = await fetchPersonDetails(actor.person_id);
            const recent = (data?.combined_credits?.cast || [])
              .filter(c => {
                const releaseDate = new Date(c.release_date || c.first_air_date || 0);
                return releaseDate > oneMonthAgo && releaseDate <= now && c.poster_path;
              })
              .slice(0, 2);
            return recent.map(r => ({
              type:    "actor_release",
              message: `${actor.name} in "${r.title || r.name}"`,
              id:      r.id,
              mediaType: r.media_type || "movie",
              time:    r.release_date || r.first_air_date,
            }));
          })
        );
        recentReleases.flat().forEach(n => notes.push(n));
      }

      // Check watchlist upcoming movies releasing soon
      const { data: watchlistItems } = await supabase
        .from("watchlist").select("*").eq("user_id", user.id);

      const upcoming = (watchlistItems || []).filter(item => {
        if (!item.release_date) return false;
        const releaseDate = new Date(item.release_date);
        const inNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return releaseDate > now && releaseDate <= inNextMonth;
      });

      upcoming.forEach(item => {
        notes.push({
          type:    "upcoming_release",
          message: `"${item.title}" releases on ${new Date(item.release_date).toLocaleDateString()}`,
          id:      item.tmdb_id,
          mediaType: item.media_type,
          time:    item.release_date,
        });
      });

    } catch (err) {
      console.error("Notification check failed:", err);
    }

    setNotifications(notes);
  };

  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return { notifications, clearNotification };
}
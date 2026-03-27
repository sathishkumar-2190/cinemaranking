// ─────────────────────────────────────────────
//  useFavouriteActors — follow actors
//  Saves to Supabase favourite_actors table
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useFavouriteActors() {
  const [favourites, setFavourites] = useState([]);
  const [user,       setUser]       = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadFavourites(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) loadFavourites(session.user.id);
      else setFavourites([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadFavourites = async (userId) => {
    const { data } = await supabase
      .from("favourite_actors")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setFavourites(data || []);
  };

  const followActor = useCallback(async (actor) => {
    if (!user) return;
    const alreadyFollowing = favourites.some(f => f.person_id === actor.id);
    if (alreadyFollowing) return;

    const newActor = {
      user_id:    user.id,
      person_id:  actor.id,
      name:       actor.name,
      photo_path: actor.profile_path || null,
    };

    setFavourites(prev => [...prev, newActor]);

    const { error } = await supabase.from("favourite_actors").insert(newActor);
    if (error) {
      console.error("Failed to follow actor:", error.message);
      setFavourites(prev => prev.filter(f => f.person_id !== actor.id));
    }
  }, [user, favourites]);

  const unfollowActor = useCallback(async (personId) => {
    if (!user) return;
    setFavourites(prev => prev.filter(f => f.person_id !== personId));
    await supabase.from("favourite_actors").delete()
      .eq("user_id", user.id).eq("person_id", personId);
  }, [user]);

  const isFollowing = useCallback((personId) => {
    return favourites.some(f => f.person_id === personId);
  }, [favourites]);

  return { favourites, followActor, unfollowActor, isFollowing, user };
}
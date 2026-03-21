// ─────────────────────────────────────────────
//  AddToListButton — shown on MovieDetails
//  Opens dropdown of user's lists to add to
// ─────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const GOLD = "#F5C518";

function AddToListButton({ movie, mediaType }) {
  const { user }     = useAuth();
  const [lists,      setLists]      = useState([]);
  const [open,       setOpen]       = useState(false);
  const [adding,     setAdding]     = useState(null); // list id being added to
  const [added,      setAdded]      = useState({}); // { listId: true }
  const [loading,    setLoading]    = useState(false);
  const dropdownRef  = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load user's lists + check which ones already have this movie
  const loadLists = async () => {
    if (!user) return;
    setLoading(true);

    const { data: userLists } = await supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (userLists) {
      setLists(userLists);

      // Check which lists already contain this movie
      const { data: existing } = await supabase
        .from("list_items")
        .select("list_id")
        .eq("tmdb_id", Number(movie.id))
        .in("list_id", userLists.map(l => l.id));

      if (existing) {
        const addedMap = {};
        existing.forEach(e => { addedMap[e.list_id] = true; });
        setAdded(addedMap);
      }
    }
    setLoading(false);
  };

  const handleOpen = () => {
    if (!open) loadLists();
    setOpen(o => !o);
  };

  const addToList = async (listId) => {
    if (added[listId]) return;
    setAdding(listId);

    const { data: maxRank } = await supabase
      .from("list_items")
      .select("rank")
      .eq("list_id", listId)
      .order("rank", { ascending: false })
      .limit(1);

    const nextRank = maxRank?.[0]?.rank ? maxRank[0].rank + 1 : 1;

    const { error } = await supabase.from("list_items").insert({
      list_id:    listId,
      tmdb_id:    Number(movie.id),
      media_type: mediaType,
      title:      movie.title || movie.name || "Untitled",
      poster_path:movie.poster_path || null,
      rank:       nextRank,
    });

    if (!error) {
      setAdded(prev => ({ ...prev, [listId]: true }));
    }
    setAdding(null);
  };

  if (!user) return (
    <Link to="/auth"
      className="px-6 py-2 rounded font-semibold text-sm border-2 border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition">
      + Add to List
    </Link>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen}
        className="px-6 py-2 rounded font-semibold text-sm border-2 transition"
        style={{ borderColor: GOLD, color: GOLD }}>
        📋 Add to List ▾
      </button>

      {open && (
        <div className="absolute top-12 left-0 bg-neutral-900 border border-neutral-700 rounded-xl py-2 w-64 z-50 shadow-xl">
          {loading ? (
            <p className="px-4 py-3 text-sm text-gray-400">Loading lists...</p>
          ) : lists.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-400 mb-2">No lists yet</p>
              <Link to="/lists" onClick={() => setOpen(false)}
                className="text-xs font-bold hover:opacity-80 transition"
                style={{ color: GOLD }}>
                + Create a list →
              </Link>
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-xs text-gray-500 border-b border-neutral-800">
                Add to list
              </p>
              {lists.map(list => (
                <button key={list.id}
                  onClick={() => addToList(list.id)}
                  disabled={!!added[list.id] || adding === list.id}
                  className="w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between hover:bg-neutral-800"
                  style={{ color: added[list.id] ? GOLD : "#ddd" }}>
                  <span className="line-clamp-1">{list.name}</span>
                  {adding === list.id
                    ? <span className="text-xs text-gray-400">Adding...</span>
                    : added[list.id]
                    ? <span className="text-xs font-bold" style={{ color: GOLD }}>✓ Added</span>
                    : null
                  }
                </button>
              ))}
              <div className="border-t border-neutral-800 mt-1 pt-1">
                <Link to="/lists" onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-xs hover:bg-neutral-800 transition"
                  style={{ color: GOLD }}>
                  + Create new list →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AddToListButton;
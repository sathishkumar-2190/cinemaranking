import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const GOLD = "#F5C518";

function AddToPartyButton({ movie, mediaType }) {
  const { user }    = useAuth();
  const [parties,   setParties]   = useState([]);
  const [open,      setOpen]      = useState(false);
  const [adding,    setAdding]    = useState(null);
  const [added,     setAdded]     = useState({});
  const [loading,   setLoading]   = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadParties = async () => {
    if (!user) return;
    setLoading(true);

    // Load parties created by user
    const { data: partyData } = await supabase
      .from("watch_parties")
      .select("id, name, movies")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (partyData) {
      setParties(partyData);

      // Check which parties already have this movie
      const addedMap = {};
      partyData.forEach(p => {
        const movies = p.movies || [];
        if (movies.some(m => m.tmdb_id === Number(movie.id))) {
          addedMap[p.id] = true;
        }
      });
      setAdded(addedMap);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    if (!open) loadParties();
    setOpen(o => !o);
  };

  const addToParty = async (partyId, currentMovies) => {
    if (added[partyId]) return;
    setAdding(partyId);

    const newMovie = {
      tmdb_id:    Number(movie.id),
      title:      movie.title || movie.name || "Untitled",
      poster_path: movie.poster_path || null,
      media_type: mediaType,
    };

    const updatedMovies = [...(currentMovies || []), newMovie];

    const { error } = await supabase
      .from("watch_parties")
      .update({ movies: updatedMovies })
      .eq("id", partyId)
      .eq("created_by", user.id);

    if (!error) {
      setAdded(prev => ({ ...prev, [partyId]: true }));
      // Update local parties state
      setParties(prev => prev.map(p =>
        p.id === partyId ? { ...p, movies: updatedMovies } : p
      ));
    }
    setAdding(null);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen}
        className="px-5 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 border-2"
        style={{ borderColor: "#555", color: "#ccc" }}>
        🎉 Watch Party ▾
      </button>

      {open && (
        <div className="absolute top-12 left-0 rounded-xl py-2 w-64 z-50"
             style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>

          {loading ? (
            <p className="px-4 py-3 text-sm" style={{ color: "#666" }}>Loading parties...</p>

          ) : parties.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-sm mb-2" style={{ color: "#888" }}>No watch parties yet</p>
              <Link to="/watch-party" onClick={() => setOpen(false)}
                className="text-xs font-bold hover:opacity-80 transition"
                style={{ color: GOLD }}>
                + Create a Watch Party →
              </Link>
            </div>

          ) : (
            <>
              <p className="px-4 py-2 text-xs border-b mb-1"
                 style={{ color: "#555", borderColor: "rgba(255,255,255,0.06)" }}>
                Add to watch party
              </p>
              {parties.map(party => (
                <button key={party.id}
                  onClick={() => addToParty(party.id, party.movies)}
                  disabled={!!added[party.id] || adding === party.id}
                  className="w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between hover:bg-white/5"
                  style={{ color: added[party.id] ? GOLD : "#ddd" }}>
                  <span className="line-clamp-1">🎉 {party.name}</span>
                  {adding === party.id
                    ? <span className="text-xs" style={{ color: "#666" }}>Adding...</span>
                    : added[party.id]
                    ? <span className="text-xs font-bold" style={{ color: GOLD }}>✓ Added</span>
                    : <span className="text-xs" style={{ color: "#555" }}>
                        {(party.movies || []).length} movies
                      </span>
                  }
                </button>
              ))}
              <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <Link to="/watch-party" onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-xs hover:bg-white/5 transition"
                  style={{ color: GOLD }}>
                  + Create new party →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AddToPartyButton;
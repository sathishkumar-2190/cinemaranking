import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { searchMulti } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

/* ── Search Box (like Compare page) ── */
function MovieSearchBox({ onAdd, existingIds }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const search = (q) => {
    setQuery(q);
    clearTimeout(timerRef.current);
    if (q.length < 2) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchMulti(q);
      setResults(
        res
          .filter(r => r.media_type === "movie" || r.media_type === "tv")
          .slice(0, 6)
      );
      setLoading(false);
    }, 400);
  };

  const pick = (item) => {
    onAdd(item);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative max-w-lg mb-8">
      <div className="flex items-center gap-3 bg-neutral-800 rounded-2xl px-4 py-3 border border-neutral-700 focus-within:border-yellow-400 transition">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
             stroke="#666" strokeWidth="2" className="shrink-0">
          <circle cx="8.5" cy="8.5" r="5.5"/>
          <path d="m13 13 3.5 3.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text" value={query}
          onChange={e => search(e.target.value)}
          placeholder="Search movies or series to add..."
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
        />
        {loading && <span className="text-xs" style={{ color: "#666" }}>Searching...</span>}
      </div>

      {/* RESULTS DROPDOWN */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
             style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
          {results.map(item => {
            const alreadyAdded = existingIds.has(item.id);
            const title  = item.title || item.name;
            const year   = (item.release_date || item.first_air_date || "").split("-")[0];
            const poster = item.poster_path ? `${IMG}${item.poster_path}` : noPoster;
            return (
              <button key={item.id}
                onClick={() => !alreadyAdded && pick(item)}
                disabled={alreadyAdded}
                className="w-full flex items-center gap-3 px-4 py-3 transition text-left"
                style={{ opacity: alreadyAdded ? 0.4 : 1 }}
                onMouseEnter={e => { if (!alreadyAdded) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <img src={poster} alt={title}
                  className="w-10 h-14 object-cover rounded-lg shrink-0"
                  onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white line-clamp-1">{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                    {item.media_type === "tv" ? "Series" : "Movie"}
                    {year && ` · ${year}`}
                    {item.vote_average > 0 && ` · ★ ${item.vote_average.toFixed(1)}`}
                  </p>
                </div>
                {alreadyAdded
                  ? <span className="text-xs font-bold shrink-0" style={{ color: GOLD }}>Added ✓</span>
                  : <span className="text-xs shrink-0" style={{ color: "#555" }}>+ Add</span>
                }
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
function WatchPartyPage() {
  const { partyId }  = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [party,      setParty]      = useState(null);
  const [movies,     setMovies]     = useState([]);
  const [votes,      setVotes]      = useState({});   // { tmdb_id: count }
  const [myVote,     setMyVote]     = useState(null); // tmdb_id I voted for
  const [loading,    setLoading]    = useState(true);
  const [copied,     setCopied]     = useState(false);
  const [partyName,  setPartyName]  = useState("");
  const [creating,   setCreating]   = useState(false);
  const [notFound,   setNotFound]   = useState(false);

  const isOwner    = user && party && user.id === party.created_by;
  const existingIds = new Set(movies.map(m => m.tmdb_id));
  const totalVotes  = Object.values(votes).reduce((a, b) => a + b, 0);
  const winner      = movies.length > 0
    ? [...movies].sort((a, b) => (votes[b.tmdb_id]||0) - (votes[a.tmdb_id]||0))[0]
    : null;

  useEffect(() => {
    if (partyId) loadParty();
    else setLoading(false);
  }, [partyId]);

  const loadParty = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("watch_parties").select("*").eq("id", partyId).single();
    if (!data) { setNotFound(true); setLoading(false); return; }

    setParty(data);
    setMovies(data.movies || []);

    // Load vote counts
    const { data: votesData } = await supabase
      .from("party_votes").select("tmdb_id").eq("party_id", partyId);
    const voteMap = {};
    votesData?.forEach(v => { voteMap[v.tmdb_id] = (voteMap[v.tmdb_id]||0) + 1; });
    setVotes(voteMap);

    // Check my vote
    if (user) {
      const { data: myVoteData } = await supabase
        .from("party_votes").select("tmdb_id")
        .eq("party_id", partyId).eq("user_id", user.id).single();
      setMyVote(myVoteData?.tmdb_id || null);
    }
    setLoading(false);
  };

  // ── CREATE PARTY ──
  const createParty = async () => {
    if (!user || !partyName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("watch_parties")
      .insert({ name: partyName.trim(), created_by: user.id, movies: [] })
      .select().single();
    if (!error && data) navigate(`/watch-party/${data.id}`);
    setCreating(false);
  };

  // ── ADD MOVIE ──
  const addMovie = async (item) => {
    if (!isOwner) return;
    const newMovie = {
      tmdb_id:    Number(item.id),
      title:      item.title || item.name || "Untitled",
      poster_path: item.poster_path || null,
      media_type: item.media_type,
      vote_average: item.vote_average || 0,
      year: (item.release_date || item.first_air_date || "").split("-")[0],
    };
    const updated = [...movies, newMovie];
    setMovies(updated);
    await supabase.from("watch_parties")
      .update({ movies: updated }).eq("id", partyId);
  };

  // ── REMOVE MOVIE ──
  const removeMovie = async (tmdbId) => {
    if (!isOwner) return;
    const updated = movies.filter(m => m.tmdb_id !== tmdbId);
    setMovies(updated);
    // Remove votes for this movie too
    await Promise.all([
      supabase.from("watch_parties").update({ movies: updated }).eq("id", partyId),
      supabase.from("party_votes").delete().eq("party_id", partyId).eq("tmdb_id", tmdbId),
    ]);
    const newVotes = { ...votes };
    delete newVotes[tmdbId];
    setVotes(newVotes);
    if (myVote === tmdbId) setMyVote(null);
  };

  // ── CAST VOTE (one per user, can change) ──
  const castVote = async (tmdbId) => {
    if (!user || myVote === tmdbId) return;

    const oldVote = myVote;

    // Optimistic update
    setMyVote(tmdbId);
    setVotes(prev => {
      const updated = { ...prev };
      if (oldVote) updated[oldVote] = Math.max(0, (updated[oldVote]||0) - 1);
      updated[tmdbId] = (updated[tmdbId]||0) + 1;
      return updated;
    });

    // Remove old vote if exists
    if (oldVote) {
      await supabase.from("party_votes").delete()
        .eq("party_id", partyId).eq("user_id", user.id);
    }

    // Insert new vote
    await supabase.from("party_votes").insert({
      party_id: partyId,
      user_id:  user.id,
      tmdb_id:  tmdbId,
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watch-party/${partyId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── NOT LOGGED IN ──
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
         style={{ backgroundColor: "var(--bg-primary)" }}>
      <p className="text-5xl">🎉</p>
      <h2 className="text-2xl font-bold text-white">Watch Party</h2>
      <p className="text-sm" style={{ color: "#888" }}>Log in to create or join a watch party</p>
      <Link to="/auth" className="px-8 py-3 rounded-full font-bold text-sm text-black"
            style={{ backgroundColor: GOLD }}>Log In</Link>
    </div>
  );

  if (loading || !party && partyId && !notFound) return (
  <div className="min-h-screen flex items-center justify-center"
       style={{ backgroundColor: "var(--bg-primary)" }}>
    <p style={{ color: "#666" }}>Loading party...</p>
  </div>
);

  // ── CREATE PARTY SCREEN ──
  if (!partyId) return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-3xl font-black text-white">Create Watch Party</h1>
          <p className="text-sm mt-2" style={{ color: "#888" }}>
            Search and add movies, share the link, friends vote!
          </p>
        </div>
        <input type="text" value={partyName} onChange={e => setPartyName(e.target.value)}
          placeholder="Party name (e.g. Friday Night Movies)"
          className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-yellow-400 outline-none text-sm mb-4 transition"
          onKeyDown={e => e.key === "Enter" && createParty()} />
        <button onClick={createParty} disabled={!partyName.trim() || creating}
          className="w-full py-3 rounded-xl font-bold text-sm text-black disabled:opacity-50 hover:opacity-90 transition"
          style={{ backgroundColor: GOLD }}>
          {creating ? "Creating..." : "Create Party 🎉"}
        </button>
        <Link to="/" className="block text-center text-sm mt-4 hover:text-yellow-400 transition"
              style={{ color: "#555" }}>← Back to home</Link>
      </div>
    </div>
  );

  // ── NOT FOUND ──
  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
         style={{ backgroundColor: "var(--bg-primary)" }}>
      <p className="text-5xl">😕</p>
      <p className="text-xl font-bold text-white">Party not found</p>
      <Link to="/watch-party" style={{ color: GOLD }}>Create a new party →</Link>
    </div>
  );

  // ── PARTY SCREEN ──
  return (
    <div className="min-h-screen text-white px-6 md:px-12 py-10"
         style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black">🎉 {party.name}</h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast ·
            {movies.length} movie{movies.length !== 1 ? "s" : ""}
            {myVote ? " · You voted!" : user ? " · Click a movie to vote" : ""}
          </p>
        </div>
        <button onClick={copyLink}
          className="px-5 py-2.5 rounded-full font-bold text-sm border transition"
          style={{ borderColor: GOLD, color: GOLD }}>
          {copied ? "Copied! ✓" : "🔗 Share Link"}
        </button>
      </div>

      {/* WINNER BANNER */}
      {winner && totalVotes > 0 && (votes[winner.tmdb_id]||0) > 0 && (
        <div className="mb-6 p-4 rounded-2xl flex items-center gap-4"
             style={{ background:"rgba(245,197,24,0.08)", border:"1px solid rgba(245,197,24,0.25)" }}>
          <img src={winner.poster_path ? `${IMG}${winner.poster_path}` : noPoster}
            alt={winner.title} className="w-14 h-20 object-cover rounded-xl shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: GOLD }}>
              🏆 Currently Winning
            </p>
            <p className="text-lg font-black text-white">{winner.title}</p>
            <p className="text-sm mt-0.5" style={{ color: "#888" }}>
              {votes[winner.tmdb_id]||0} vote{(votes[winner.tmdb_id]||0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* SEARCH — owner only */}
      {isOwner && (
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: GOLD }}>
            + Add Movies or Series
          </p>
          <MovieSearchBox onAdd={addMovie} existingIds={existingIds} />
        </div>
      )}

      {/* MOVIES GRID */}
      {movies.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <p className="text-5xl">🎬</p>
          <p className="text-xl font-semibold text-gray-300">No movies added yet</p>
          {isOwner
            ? <p className="text-sm" style={{ color: "#666" }}>Search above to add movies or series</p>
            : <p className="text-sm" style={{ color: "#666" }}>Waiting for the host to add movies</p>
          }
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map(item => {
            const voteCount  = votes[item.tmdb_id] || 0;
            const pct        = totalVotes > 0 ? Math.round(voteCount / totalVotes * 100) : 0;
            const isMyChoice = myVote === item.tmdb_id;
            const canVote    = user && myVote !== item.tmdb_id;

            return (
              <div key={item.tmdb_id} className="group relative">

                {/* REMOVE BUTTON — owner only */}
                {isOwner && (
                  <button onClick={() => removeMovie(item.tmdb_id)}
                    className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition"
                    style={{ background: "rgba(220,38,38,0.9)", color: "#fff" }}
                    title="Remove">
                    ✕
                  </button>
                )}

                {/* POSTER */}
                <div
                  onClick={() => canVote && castVote(item.tmdb_id)}
                  className="relative overflow-hidden rounded-xl transition-all"
                  style={{
                    cursor: canVote ? "pointer" : "default",
                    border: isMyChoice ? `2px solid ${GOLD}` : "2px solid transparent",
                  }}>
                  <img src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                    alt={item.title} className="w-full object-cover transition duration-300 group-hover:scale-105"
                    style={{ aspectRatio: "2/3" }}
                    onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />

                  {/* MY VOTE BADGE */}
                  {isMyChoice && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-black"
                         style={{ backgroundColor: GOLD }}>✓</div>
                  )}

                  {/* VOTE HOVER */}
                  {canVote && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                         style={{ background: "rgba(0,0,0,0.6)" }}>
                      <p className="text-white font-bold">
                        {myVote ? "Change Vote" : "Vote 👍"}
                      </p>
                    </div>
                  )}
                </div>

                {/* INFO + VOTE BAR */}
                <div className="mt-2 px-1">
                  <p className="text-sm font-semibold line-clamp-1 text-white">{item.title}</p>
                  <div className="mt-1.5">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#666" }}>
                      <span>{voteCount} vote{voteCount !== 1 ? "s" : ""}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                           style={{ width: `${pct}%`, backgroundColor: isMyChoice ? GOLD : "#555" }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WatchPartyPage;
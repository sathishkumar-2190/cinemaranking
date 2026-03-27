import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

function WatchPartyPage() {
  const { partyId } = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [party,    setParty]    = useState(null);
  const [movies,   setMovies]   = useState([]);
  const [votes,    setVotes]    = useState({});
  const [myVote,   setMyVote]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState(false);
  const [creating, setCreating] = useState(!partyId);
  const [partyName,setPartyName]= useState("");

  useEffect(() => {
    if (partyId) loadParty();
    else setLoading(false);
  }, [partyId]);

  const loadParty = async () => {
    setLoading(true);
    const { data: partyData } = await supabase
      .from("watch_parties").select("*").eq("id", partyId).single();
    if (!partyData) { setLoading(false); return; }
    setParty(partyData);
    setMovies(partyData.movies || []);

    // Load votes
    const { data: votesData } = await supabase
      .from("party_votes").select("*").eq("party_id", partyId);
    const voteMap = {};
    votesData?.forEach(v => { voteMap[v.tmdb_id] = (voteMap[v.tmdb_id] || 0) + 1; });
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

  const createParty = async () => {
    if (!user || !partyName.trim()) return;
    const { data, error } = await supabase.from("watch_parties").insert({
      name:       partyName.trim(),
      created_by: user.id,
      movies:     [],
    }).select().single();
    if (!error && data) navigate(`/watch-party/${data.id}`);
  };

  const castVote = async (tmdbId) => {
    if (!user || myVote) return;
    await supabase.from("party_votes").insert({ party_id: partyId, user_id: user.id, tmdb_id: tmdbId });
    setMyVote(tmdbId);
    setVotes(prev => ({ ...prev, [tmdbId]: (prev[tmdbId] || 0) + 1 }));
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const winner     = movies.length > 0
    ? movies.reduce((a, b) => (votes[a.tmdb_id]||0) >= (votes[b.tmdb_id]||0) ? a : b, movies[0])
    : null;

  const shareLink = `${window.location.origin}/watch-party/${partyId}`;

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
         style={{ backgroundColor: "var(--bg-primary)" }}>
      <p className="text-5xl">🎉</p>
      <h2 className="text-2xl font-bold text-white">Watch Party</h2>
      <p className="text-sm" style={{ color: "#888" }}>Log in to create or join a watch party</p>
      <Link to="/auth" className="px-8 py-3 rounded-full font-bold text-sm text-black hover:opacity-90"
            style={{ backgroundColor: GOLD }}>Log In</Link>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <p className="text-gray-400">Loading party...</p>
    </div>
  );

  // CREATE PARTY SCREEN
  if (creating && !partyId) return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-3xl font-black text-white">Create Watch Party</h1>
          <p className="text-sm mt-2" style={{ color: "#888" }}>
            Share the link with friends — everyone votes on what to watch!
          </p>
        </div>
        <input type="text" value={partyName} onChange={e => setPartyName(e.target.value)}
          placeholder="Party name (e.g. Friday Night Movies)"
          className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-yellow-400 outline-none text-sm mb-4 transition" />
        <p className="text-xs mb-6" style={{ color: "#666" }}>
          After creating, add movies from their detail pages using "Add to Watch Party"
        </p>
        <button onClick={createParty} disabled={!partyName.trim()}
          className="w-full py-3 rounded-xl font-bold text-sm text-black disabled:opacity-50 hover:opacity-90 transition"
          style={{ backgroundColor: GOLD }}>
          Create Party 🎉
        </button>
        <Link to="/" className="block text-center text-sm mt-4 hover:text-yellow-400 transition"
              style={{ color: "#666" }}>← Back to home</Link>
      </div>
    </div>
  );

  // PARTY NOT FOUND
  if (!party) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
         style={{ backgroundColor: "var(--bg-primary)" }}>
      <p className="text-5xl">😕</p>
      <p className="text-xl font-bold text-white">Party not found</p>
      <Link to="/watch-party" style={{ color: GOLD }}>Create a new party →</Link>
    </div>
  );

  // PARTY SCREEN
  return (
    <div className="min-h-screen text-white px-6 md:px-12 py-10"
         style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* HEADER */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black">🎉 {party.name}</h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast
            {myVote ? " · You voted!" : " · Click a movie to vote"}
          </p>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          className="px-5 py-2.5 rounded-full font-bold text-sm border transition"
          style={{ borderColor: GOLD, color: GOLD }}>
          {copied ? "Copied! ✓" : "🔗 Share Link"}
        </button>
      </div>

      {/* WINNER BANNER */}
      {winner && totalVotes > 0 && (
        <div className="mb-8 p-5 rounded-2xl border flex items-center gap-4"
             style={{ background: "rgba(245,197,24,0.08)", borderColor: "rgba(245,197,24,0.3)" }}>
          <img src={winner.poster_path ? `${IMG}${winner.poster_path}` : noPoster}
            alt={winner.title} className="w-16 h-24 object-cover rounded-xl shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: GOLD }}>
              🏆 Currently Winning
            </p>
            <p className="text-xl font-black text-white">{winner.title}</p>
            <p className="text-sm mt-1" style={{ color: "#888" }}>
              {votes[winner.tmdb_id] || 0} vote{(votes[winner.tmdb_id]||0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* MOVIE LIST */}
      {movies.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <p className="text-5xl">🎬</p>
          <p className="text-xl font-semibold text-gray-300">No movies added yet</p>
          <p className="text-sm" style={{ color: "#666" }}>
            Share the party link, then add movies from their detail pages
          </p>
          <p className="text-xs p-4 rounded-xl border mt-2 font-mono break-all"
             style={{ borderColor: "#333", color: "#888" }}>
            {shareLink}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movies.map(item => {
            const voteCount  = votes[item.tmdb_id] || 0;
            const pct        = totalVotes > 0 ? Math.round(voteCount / totalVotes * 100) : 0;
            const isMyChoice = myVote === item.tmdb_id;
            return (
              <div key={item.tmdb_id}
                onClick={() => !myVote && castVote(item.tmdb_id)}
                className="cursor-pointer group rounded-2xl overflow-hidden transition-all"
                style={{
                  background: "#141414",
                  border: isMyChoice ? `2px solid ${GOLD}` : "1px solid #222",
                  transform: !myVote ? undefined : "none",
                }}>
                <div className="relative" style={{ aspectRatio: "2/3" }}>
                  <img src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                    alt={item.title} className="w-full h-full object-cover" />
                  {!myVote && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                         style={{ background: "rgba(0,0,0,0.7)" }}>
                      <p className="text-white font-bold text-lg">Vote 👍</p>
                    </div>
                  )}
                  {isMyChoice && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-black"
                         style={{ backgroundColor: GOLD }}>✓</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#888" }}>
                      <span>{voteCount} vote{voteCount !== 1 ? "s" : ""}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#2a2a2a" }}>
                      <div className="h-full rounded-full transition-all"
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
import { useState } from "react";
import { fetchMovieDetails, searchMulti } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

function SearchBox({ label, onSelect, selected }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await searchMulti(q);
    setResults(res.filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 6));
    setLoading(false);
    setOpen(true);
  };

  const pick = async (item) => {
    setOpen(false);
    setQuery(item.title || item.name);
    const details = await fetchMovieDetails(item.id, item.media_type);
    onSelect({ ...details, media_type: item.media_type });
  };

  return (
    <div className="relative flex-1">
      <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: GOLD }}>
        {label}
      </label>
      <input type="text" value={query} onChange={e => search(e.target.value)}
        placeholder="Search a movie or series..."
        className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-yellow-400 outline-none text-sm transition" />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden z-50">
          {results.map(r => (
            <button key={r.id} onClick={() => pick(r)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition text-left">
              <img src={r.poster_path ? `${IMG}${r.poster_path}` : noPoster}
                alt={r.title||r.name} className="w-8 h-12 object-cover rounded" />
              <div>
                <p className="text-sm font-semibold text-white">{r.title||r.name}</p>
                <p className="text-xs" style={{ color: "#666" }}>
                  {r.media_type === "tv" ? "Series" : "Movie"} ·
                  {(r.release_date||r.first_air_date||"").split("-")[0]}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="mt-3 flex items-center gap-3 bg-neutral-800 rounded-xl p-3">
          <img src={selected.poster_path ? `${IMG}${selected.poster_path}` : noPoster}
            alt={selected.title||selected.name} className="w-12 h-16 object-cover rounded-lg" />
          <div>
            <p className="font-bold text-white text-sm">{selected.title||selected.name}</p>
            <p className="text-xs" style={{ color: "#888" }}>
              {(selected.release_date||selected.first_air_date||"").split("-")[0]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, a, b, higher = true }) {
  const aNum = parseFloat(a) || 0;
  const bNum = parseFloat(b) || 0;
  const aWins = higher ? aNum >= bNum : aNum <= bNum;
  const bWins = higher ? bNum > aNum  : bNum < aNum;

  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b items-center"
         style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className={`text-sm font-semibold text-right ${aWins && aNum !== bNum ? "text-yellow-400" : "text-white"}`}>{a || "—"}</div>
      <div className="text-xs text-center font-medium uppercase tracking-wider" style={{ color: "#555" }}>{label}</div>
      <div className={`text-sm font-semibold text-left ${bWins ? "text-yellow-400" : "text-white"}`}>{b || "—"}</div>
    </div>
  );
}

function ComparePage() {
  const [movieA, setMovieA] = useState(null);
  const [movieB, setMovieB] = useState(null);

  const fmt = (n) => n > 0 ? `$${(n/1e6).toFixed(0)}M` : "N/A";
  const runtime = (m) => m?.runtime ? `${Math.floor(m.runtime/60)}h ${m.runtime%60}m` : "N/A";

  const canCompare = movieA && movieB;

  return (
    <div className="min-h-screen text-white px-6 md:px-12 py-10"
         style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-black">Compare</h1>
      </div>

      {/* SEARCH BOXES */}
      <div className="flex gap-6 mb-10 flex-wrap md:flex-nowrap">
        <SearchBox label="Movie / Series A" onSelect={setMovieA} selected={movieA} />
        <div className="flex items-center justify-center text-2xl font-black"
             style={{ color: GOLD, paddingTop: "24px" }}>VS</div>
        <SearchBox label="Movie / Series B" onSelect={setMovieB} selected={movieB} />
      </div>

      {/* COMPARISON TABLE */}
      {canCompare && (
        <div className="max-w-3xl">

          {/* POSTER ROW */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <img src={movieA.poster_path ? `${IMG}${movieA.poster_path}` : noPoster}
                alt={movieA.title||movieA.name}
                className="w-32 h-48 object-cover rounded-xl mx-auto mb-2" />
              <p className="font-bold text-white text-sm">{movieA.title||movieA.name}</p>
            </div>
            <div className="flex items-center justify-center text-3xl font-black"
                 style={{ color: GOLD }}>VS</div>
            <div className="text-center">
              <img src={movieB.poster_path ? `${IMG}${movieB.poster_path}` : noPoster}
                alt={movieB.title||movieB.name}
                className="w-32 h-48 object-cover rounded-xl mx-auto mb-2" />
              <p className="font-bold text-white text-sm">{movieB.title||movieB.name}</p>
            </div>
          </div>

          {/* STATS */}
          <div className="bg-neutral-900 rounded-2xl p-4 border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <StatRow label="TMDB Rating"   a={movieA.vote_average?.toFixed(1)} b={movieB.vote_average?.toFixed(1)} />
            <StatRow label="Vote Count"    a={movieA.vote_count?.toLocaleString()} b={movieB.vote_count?.toLocaleString()} />
            <StatRow label="Runtime"       a={runtime(movieA)} b={runtime(movieB)} />
            <StatRow label="Budget"        a={fmt(movieA.budget)} b={fmt(movieB.budget)} />
            <StatRow label="Revenue"       a={fmt(movieA.revenue)} b={fmt(movieB.revenue)} />
            <StatRow label="Year"          a={(movieA.release_date||movieA.first_air_date||"").split("-")[0]}
                                           b={(movieB.release_date||movieB.first_air_date||"").split("-")[0]} />
            <StatRow label="Type"
              a={movieA.media_type === "tv" ? "Series" : "Movie"}
              b={movieB.media_type === "tv" ? "Series" : "Movie"} />

            {/* GENRES */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex flex-wrap gap-1 justify-end">
                {(movieA.genres||[]).map(g => (
                  <span key={g.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background:"#222", color:"#aaa" }}>{g.name}</span>
                ))}
              </div>
              <div className="text-xs text-center font-medium uppercase tracking-wider" style={{ color: "#555" }}>Genres</div>
              <div className="flex flex-wrap gap-1">
                {(movieB.genres||[]).map(g => (
                  <span key={g.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background:"#222", color:"#aaa" }}>{g.name}</span>
                ))}
              </div>
            </div>

            {/* OVERVIEW */}
            <div className="grid grid-cols-3 gap-4 pt-3">
              <p className="text-xs text-right line-clamp-4" style={{ color: "#888" }}>{movieA.overview}</p>
              <div className="text-xs text-center font-medium uppercase tracking-wider" style={{ color: "#555", paddingTop: "2px" }}>Overview</div>
              <p className="text-xs line-clamp-4" style={{ color: "#888" }}>{movieB.overview}</p>
            </div>
          </div>

          {/* WINNER */}
          {movieA.vote_average !== movieB.vote_average && (
            <div className="mt-6 text-center p-4 rounded-2xl border"
                 style={{ background: "rgba(245,197,24,0.08)", borderColor: "rgba(245,197,24,0.3)" }}>
              <p className="text-sm" style={{ color: "#888" }}>Higher rated</p>
              <p className="text-xl font-black mt-1" style={{ color: GOLD }}>
                🏆 {movieA.vote_average > movieB.vote_average
                  ? (movieA.title||movieA.name)
                  : (movieB.title||movieB.name)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* PLACEHOLDER */}
      {!canCompare && (
        <div className="flex flex-col items-center py-20 gap-3">
          <p className="text-6xl">⚖️</p>
          <p className="text-xl font-semibold text-gray-300">Search two titles to compare</p>
          <p className="text-sm" style={{ color: "#666" }}>Ratings, box office, runtime, genres and more</p>
        </div>
      )}
    </div>
  );
}

export default ComparePage;
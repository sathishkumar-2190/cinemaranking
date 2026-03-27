import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchMulti } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD     = "#F5C518";
const IMG      = "https://image.tmdb.org/t/p/w342";
const IMG_PROF = "https://image.tmdb.org/t/p/w185";

const LANGUAGES = [
  { code: "", label: "All Languages" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "hi", label: "Hindi" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "en", label: "English" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

const GENRES_MOVIE = [
  { id: "", label: "All" }, { id: 28, label: "Action" },
  { id: 35, label: "Comedy" }, { id: 27, label: "Horror" },
  { id: 10749, label: "Romance" }, { id: 53, label: "Thriller" },
  { id: 878, label: "Sci-Fi" }, { id: 18, label: "Drama" },
  { id: 16, label: "Animation" },
];

const CURRENT_YEAR = new Date().getFullYear();

function SearchResults() {
  const [searchParams]  = useSearchParams();
  const query           = searchParams.get("q") || "";
  const navigate        = useNavigate();

  const [all,      setAll]      = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState("");

  // Filter states
  const [lang,      setLang]      = useState("");
  const [genre,     setGenre]     = useState("");
  const [yearFrom,  setYearFrom]  = useState("");
  const [yearTo,    setYearTo]    = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true); setAll([]);
    searchMulti(query).then(results => {
      setAll(results);
      setSearched(query);
      setLoading(false);
    });
  }, [query]);

  const movies  = all.filter(i => i.media_type === "movie");
  const series  = all.filter(i => i.media_type === "tv");
  const people  = all.filter(i => i.media_type === "person");

  // Apply filters
  const applyFilters = (items) => {
    return items.filter(item => {
      if (lang && item.original_language !== lang) return false;
      if (minRating && item.vote_average < Number(minRating)) return false;
      const itemYear = Number((item.release_date || item.first_air_date || "0").split("-")[0]);
      if (yearFrom && itemYear < Number(yearFrom)) return false;
      if (yearTo   && itemYear > Number(yearTo))   return false;
      if (genre    && !(item.genre_ids || []).includes(Number(genre))) return false;
      return true;
    });
  };

  const baseItems = filter === "all"    ? [...movies, ...series, ...people]
                  : filter === "movies" ? movies
                  : filter === "series" ? series
                  : people;

  const items = filter === "people" ? baseItems : applyFilters(baseItems);

  const goTo = (item) => {
    if (item.media_type === "person") navigate(`/person/${item.id}`);
    else navigate(`/details/${item.media_type}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  const activeFilters = [lang, genre, yearFrom, yearTo, minRating].filter(Boolean).length;

  const resetFilters = () => { setLang(""); setGenre(""); setYearFrom(""); setYearTo(""); setMinRating(""); };

  const Select = ({ value, onChange, children }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-neutral-800 text-white text-sm px-3 py-2 rounded-xl border border-neutral-700 outline-none focus:border-yellow-400 transition">
      {children}
    </select>
  );

  return (
    <div className="min-h-screen text-white px-6 md:px-12 py-10"
         style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-1">Search Results</h1>
      {searched && (
        <p className="text-sm mb-6" style={{ color: "#888" }}>
          Results for <span style={{ color: GOLD }}>"{searched}"</span>
          {!loading && ` — ${all.length} found`}
        </p>
      )}

      {/* TYPE TABS + FILTER TOGGLE */}
      {!loading && all.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all",    label: `All (${all.length})` },
              { key: "movies", label: `Movies (${movies.length})` },
              { key: "series", label: `Series (${series.length})` },
              { key: "people", label: `People (${people.length})` },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
                style={filter === f.key
                  ? { backgroundColor: GOLD, color: "#000" }
                  : { border: "1px solid #444", color: "#aaa" }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* FILTER TOGGLE */}
          <button onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition border"
            style={{
              borderColor: activeFilters > 0 ? GOLD : "#444",
              color: activeFilters > 0 ? GOLD : "#aaa",
            }}>
            ⚙ Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>
      )}

      {/* FILTER PANEL */}
      {showFilters && filter !== "people" && (
        <div className="bg-neutral-800 rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Language</label>
            <Select value={lang} onChange={setLang}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Genre</label>
            <Select value={genre} onChange={setGenre}>
              {GENRES_MOVIE.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Min Rating</label>
            <Select value={minRating} onChange={setMinRating}>
              <option value="">Any</option>
              {[9,8,7,6,5].map(r => <option key={r} value={r}>★ {r}+</option>)}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Year Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="From" value={yearFrom} min="1900" max={CURRENT_YEAR}
                onChange={e => setYearFrom(e.target.value)}
                className="w-24 bg-neutral-700 text-white text-sm px-3 py-2 rounded-xl border border-neutral-700 focus:border-yellow-400 outline-none" />
              <input type="number" placeholder="To" value={yearTo} min="1900" max={CURRENT_YEAR+2}
                onChange={e => setYearTo(e.target.value)}
                className="w-24 bg-neutral-700 text-white text-sm px-3 py-2 rounded-xl border border-neutral-700 focus:border-yellow-400 outline-none" />
            </div>
          </div>

          {activeFilters > 0 && (
            <button onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-neutral-600 text-gray-400 hover:text-white transition">
              Reset
            </button>
          )}
        </div>
      )}

      {/* RESULTS COUNT AFTER FILTER */}
      {!loading && activeFilters > 0 && (
        <p className="text-xs text-gray-500 mb-4">
          Showing {items.length} of {baseItems.length} results after filters
        </p>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* NO RESULTS */}
      {!loading && items.length === 0 && searched && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-5xl">🎬</p>
          <p className="text-xl font-semibold text-gray-300">No results found</p>
          <p className="text-sm" style={{ color: "#666" }}>
            {activeFilters > 0 ? "Try adjusting your filters" : "Try a different keyword"}
          </p>
          {activeFilters > 0 && (
            <button onClick={resetFilters}
              className="px-6 py-2 rounded-full font-bold text-sm text-black mt-2"
              style={{ backgroundColor: GOLD }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* RESULTS GRID */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => {
            const isPerson  = item.media_type === "person";
            const title     = item.title || item.name || "Untitled";
            const year      = (item.release_date || item.first_air_date || "").split("-")[0];
            const rating    = item.vote_average?.toFixed(1);
            const imgPath   = isPerson ? item.profile_path : item.poster_path;
            const imgBase   = isPerson ? IMG_PROF : IMG;
            const poster    = imgPath ? `${imgBase}${imgPath}` : noPoster;
            const typeLabel = isPerson ? "Person" : item.media_type === "tv" ? "Series" : "Movie";
            const typeBg    = isPerson ? "#7F77DD" : GOLD;

            return (
              <div key={`${item.media_type}-${item.id}`}
                onClick={() => goTo(item)} className="cursor-pointer group">
                <div className="relative overflow-hidden rounded-xl mb-2" style={{ aspectRatio: "2/3" }}>
                  <img src={poster} alt={title} loading="lazy"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: typeBg, color: "#000" }}>
                    {typeLabel}
                  </span>
                  {rating && rating !== "0.0" && !isPerson && (
                    <span className="absolute top-2 right-2 rating-badge">★ {rating}</span>
                  )}
                </div>
                <p className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {year && !isPerson && <span className="text-xs" style={{ color: "#666" }}>{year}</span>}
                  {isPerson && item.known_for_department && (
                    <span className="text-xs" style={{ color: "#666" }}>{item.known_for_department}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
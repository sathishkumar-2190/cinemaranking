import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchMulti } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD     = "#F5C518";
const IMG      = "https://image.tmdb.org/t/p/w342";
const IMG_PROF = "https://image.tmdb.org/t/p/w185";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query          = searchParams.get("q") || "";
  const navigate       = useNavigate();

  const [all,      setAll]      = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState("");

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

  const items = filter === "all" ? [...movies, ...series, ...people]
              : filter === "movies" ? movies
              : filter === "series" ? series
              : people;

  const goToDetails = (item) => {
    if (item.media_type === "person") {
      navigate(`/person/${item.id}`);
    } else {
      navigate(`/details/${item.media_type}/${item.id}`);
    }
    window.scrollTo({ top: 0 });
  };

  const FILTERS = [
    { key: "all",    label: `All (${all.length})` },
    { key: "movies", label: `Movies (${movies.length})` },
    { key: "series", label: `Series (${series.length})` },
    { key: "people", label: `People (${people.length})` },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADING */}
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      {searched && (
        <p className="text-gray-400 mb-6 text-sm">
          Results for <span style={{ color: GOLD }}>"{searched}"</span>
          {!loading && ` — ${all.length} found`}
        </p>
      )}

      {/* FILTER TABS */}
      {!loading && all.length > 0 && (
        <div className="flex gap-3 mb-8 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
              style={filter===f.key ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* SKELETON */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({length:10}).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* NO RESULTS */}
      {!loading && items.length === 0 && searched && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-5xl">🎬</p>
          <p className="text-xl font-semibold text-gray-300">No results found</p>
          <p className="text-gray-500 text-sm">Try a different keyword</p>
        </div>
      )}

      {/* RESULTS GRID */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map(item => {
            const isPerson = item.media_type === "person";
            const title    = item.title || item.name || "Untitled";
            const year     = (item.release_date || item.first_air_date || "").split("-")[0];
            const rating   = item.vote_average?.toFixed(1);
            const imgPath  = isPerson ? item.profile_path : item.poster_path;
            const imgBase  = isPerson ? IMG_PROF : IMG;
            const poster   = imgPath ? `${imgBase}${imgPath}` : noPoster;
            const typeLabel = isPerson ? "Person"
                            : item.media_type === "tv" ? "Series" : "Movie";
            const typeBg    = isPerson ? "#7F77DD" : GOLD;
            const typeColor = "#000";

            return (
              <div key={`${item.media_type}-${item.id}`} onClick={() => goToDetails(item)}
                className="cursor-pointer group">
                <div className="relative overflow-hidden rounded-xl">
                  <img src={poster} alt={title} loading="lazy"
                    className="w-full h-auto object-cover transition duration-300 group-hover:scale-105"
                    onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
                        style={{ backgroundColor: typeBg, color: typeColor }}>
                    {typeLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition">{title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {rating && rating !== "0.0" && !isPerson && (
                    <span className="text-xs font-bold" style={{ color: GOLD }}>★ {rating}</span>
                  )}
                  {year && !isPerson && <span className="text-xs text-gray-400">{year}</span>}
                  {isPerson && item.known_for_department && (
                    <span className="text-xs text-gray-400">{item.known_for_department}</span>
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
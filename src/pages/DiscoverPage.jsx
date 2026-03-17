import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { discoverMovies, discoverSeries } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

const MOVIE_GENRES = [
  {id:"",label:"All"},{id:28,label:"Action"},{id:35,label:"Comedy"},
  {id:27,label:"Horror"},{id:10749,label:"Romance"},{id:53,label:"Thriller"},
  {id:878,label:"Sci-Fi"},{id:16,label:"Animation"},{id:18,label:"Drama"},
  {id:80,label:"Crime"},{id:10751,label:"Family"},{id:36,label:"History"},
  {id:14,label:"Fantasy"},{id:9648,label:"Mystery"},{id:10402,label:"Music"},
];
const TV_GENRES = [
  {id:"",label:"All"},{id:10759,label:"Action"},{id:35,label:"Comedy"},
  {id:27,label:"Horror"},{id:10749,label:"Romance"},{id:80,label:"Thriller"},
  {id:10765,label:"Sci-Fi"},{id:16,label:"Animation"},{id:18,label:"Drama"},
  {id:10762,label:"Kids"},{id:10763,label:"News"},{id:10764,label:"Reality"},
];
const LANGUAGES = [
  {code:"",label:"All Languages"},
  {code:"en",label:"English"},{code:"ta",label:"Tamil"},
  {code:"te",label:"Telugu"},{code:"hi",label:"Hindi"},
  {code:"ml",label:"Malayalam"},{code:"kn",label:"Kannada"},
  {code:"ja",label:"Japanese"},{code:"ko",label:"Korean"},
  {code:"fr",label:"French"},{code:"es",label:"Spanish"},
  {code:"zh",label:"Chinese"},{code:"de",label:"German"},
];
const SORT_OPTIONS = [
  {val:"popularity.desc",label:"Most Popular"},
  {val:"vote_average.desc",label:"Highest Rated"},
  {val:"primary_release_date.desc",label:"Newest First"},
  {val:"primary_release_date.asc",label:"Oldest First"},
  {val:"revenue.desc",label:"Highest Revenue"},
];
const CURRENT_YEAR = new Date().getFullYear();

function DiscoverPage() {
  const navigate = useNavigate();

  const [mediaTab,  setMediaTab]  = useState("movies");
  const [genre,     setGenre]     = useState("");
  const [yearFrom,  setYearFrom]  = useState("");
  const [yearTo,    setYearTo]    = useState("");
  const [minRating, setMinRating] = useState("");
  const [language,  setLanguage]  = useState("");
  const [sort,      setSort]      = useState("popularity.desc");
  const [page,      setPage]      = useState(1);

  const [results,   setResults]   = useState([]);
  const [maxPages,  setMaxPages]  = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);

  const genres = mediaTab === "movies" ? MOVIE_GENRES : TV_GENRES;

  const handleDiscover = async (p=1) => {
    setLoading(true); setSearched(true);
    const params = { genre, yearFrom, yearTo, minRating, language, sort, page: p };
    const data = mediaTab === "movies"
      ? await discoverMovies(params)
      : await discoverSeries(params);
    setResults(data.results);
    setMaxPages(data.total_pages);
    setPage(p);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setGenre(""); setYearFrom(""); setYearTo("");
    setMinRating(""); setLanguage(""); setSort("popularity.desc");
    setPage(1); setResults([]); setSearched(false);
  };

  const switchTab = (t) => {
    setMediaTab(t); setGenre(""); setPage(1);
    setResults([]); setSearched(false);
  };

  const goTo = (item) => {
    navigate(`/details/${item.media_type}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  const SelectBox = ({ label, value, onChange, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="bg-neutral-800 text-white text-sm px-3 py-2 rounded-lg border border-neutral-600 focus:border-yellow-400 outline-none">
        {children}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">Discover</h1>
      </div>

      {/* MEDIA TYPE TABS */}
      <div className="flex gap-3 mb-6">
        {["movies","series"].map(t => (
          <button key={t} onClick={() => switchTab(t)}
            className="px-6 py-2.5 rounded-full font-bold text-sm capitalize transition"
            style={mediaTab===t ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
            {t === "movies" ? "🎬 Movies" : "📺 Series"}
          </button>
        ))}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-neutral-800 rounded-2xl p-6 mb-8">

        {/* GENRE PILLS */}
        <p className="text-xs text-gray-400 mb-3">Genre</p>
        <div className="flex gap-2 flex-wrap mb-6">
          {genres.map(g => (
            <button key={g.id} onClick={() => setGenre(String(g.id))}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition"
              style={String(genre)===String(g.id)
                ? {backgroundColor:GOLD,color:"#000"}
                : {border:"1px solid #555",color:"#aaa"}}>
              {g.label}
            </button>
          ))}
        </div>

        {/* FILTER DROPDOWNS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SelectBox label="Language" value={language} onChange={setLanguage}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </SelectBox>

          <SelectBox label="Sort by" value={sort} onChange={setSort}>
            {SORT_OPTIONS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
          </SelectBox>

          <SelectBox label="Min Rating" value={minRating} onChange={setMinRating}>
            <option value="">Any Rating</option>
            {[9,8,7,6,5].map(r => <option key={r} value={r}>★ {r}+</option>)}
          </SelectBox>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Year Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="From" value={yearFrom} min="1900" max={CURRENT_YEAR}
                onChange={e=>setYearFrom(e.target.value)}
                className="w-full bg-neutral-700 text-white text-sm px-3 py-2 rounded-lg border border-neutral-600 focus:border-yellow-400 outline-none" />
              <input type="number" placeholder="To" value={yearTo} min="1900" max={CURRENT_YEAR+2}
                onChange={e=>setYearTo(e.target.value)}
                className="w-full bg-neutral-700 text-white text-sm px-3 py-2 rounded-lg border border-neutral-600 focus:border-yellow-400 outline-none" />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button onClick={() => handleDiscover(1)}
            className="px-8 py-2.5 rounded-full font-bold text-sm text-black transition hover:opacity-90"
            style={{ backgroundColor: GOLD }}>
            Discover →
          </button>
          <button onClick={reset}
            className="px-6 py-2.5 rounded-full font-bold text-sm border border-neutral-600 text-gray-400 hover:text-white transition">
            Reset
          </button>
        </div>
      </div>

      {/* RESULTS COUNT */}
      {searched && !loading && (
        <p className="text-gray-400 text-sm mb-6">
          Found results · page {page} of {maxPages}
        </p>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({length:20}).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* NO RESULTS */}
      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-5xl">🔍</p>
          <p className="text-xl font-semibold text-gray-300">No results found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* RESULTS GRID */}
      {!loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
            {results.map(item => {
              const title = item.title||item.name||"Untitled";
              const year  = (item.release_date||item.first_air_date||"").split("-")[0];
              return (
                <div key={item.id} onClick={() => goTo(item)} className="cursor-pointer group">
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                      alt={title} loading="lazy"
                      className="w-full h-auto object-cover transition duration-300 group-hover:scale-105"
                      onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                    {item.vote_average > 0 && (
                      <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full"
                            style={{backgroundColor:GOLD,color:"#000"}}>
                        ★ {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition">{title}</p>
                  {year && <p className="text-xs text-gray-400 mt-0.5">{year}</p>}
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => handleDiscover(Math.max(1,page-1))} disabled={page===1}
              className="px-5 py-2 rounded-full font-bold text-sm border border-neutral-600 disabled:opacity-30 hover:border-yellow-400 transition"
              style={{color:GOLD}}>← Prev</button>
            {Array.from({length:Math.min(maxPages,10)}).map((_,i) => (
              <button key={i} onClick={() => handleDiscover(i+1)}
                className="w-10 h-10 rounded-full font-bold text-sm transition"
                style={page===i+1 ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
                {i+1}
              </button>
            ))}
            <button onClick={() => handleDiscover(Math.min(maxPages,page+1))} disabled={page===maxPages}
              className="px-5 py-2 rounded-full font-bold text-sm border border-neutral-600 disabled:opacity-30 hover:border-yellow-400 transition"
              style={{color:GOLD}}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}

export default DiscoverPage;
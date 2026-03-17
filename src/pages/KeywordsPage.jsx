import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchKeywords, fetchByKeyword } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

// Popular mood/keyword suggestions
const SUGGESTIONS = [
  {id:9717, label:"Based on novel"},{id:818,  label:"Based on true story"},
  {id:10836,label:"Time travel"},   {id:9748, label:"Heist"},
  {id:180547,label:"Survival"},     {id:4379, label:"Revenge"},
  {id:10840,label:"Dystopia"},      {id:161176,label:"Friendship"},
  {id:9882, label:"Space"},         {id:2964, label:"Future"},
  {id:11004,label:"Zombies"},       {id:14514,label:"Superhero"},
  {id:10987,label:"Conspiracy"},    {id:3691, label:"Forbidden love"},
  {id:4344, label:"Murder"},        {id:9713, label:"Serial killer"},
  {id:10683,label:"Coming of age"}, {id:258718,label:"Pandemic"},
  {id:6149, label:"Artificial intelligence"},{id:3801,label:"Road trip"},
];

function KeywordsPage() {
  const navigate   = useNavigate();
  const [query,    setQuery]    = useState("");
  const [kwResults,setKwResults]= useState([]);
  const [searching,setSearching]= useState(false);
  const [activeKw, setActiveKw] = useState(null);
  const [mediaType,setMediaType]= useState("movie");
  const [movies,   setMovies]   = useState([]);
  const [loading,  setLoading]  = useState(false);

  const searchKw = async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    const res = await searchKeywords(q);
    setKwResults(res.slice(0, 12));
    setSearching(false);
  };

  const selectKeyword = async (kw, type=mediaType) => {
    setActiveKw(kw); setLoading(true); setMovies([]);
    const res = await fetchByKeyword(kw.id, type);
    setMovies(res);
    setLoading(false);
  };

  const switchMedia = (type) => {
    setMediaType(type);
    if (activeKw) selectKeyword(activeKw, type);
  };

  const goTo = (item) => {
    navigate(`/details/${item.media_type}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">Browse by Mood</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8 ml-5">Pick a keyword or mood and explore matching titles</p>

      {/* SEARCH BAR */}
      <div className="flex gap-3 mb-6 max-w-lg">
        <input type="text" value={query}
          onChange={e => { setQuery(e.target.value); if(e.target.value.length>2) searchKw(e.target.value); }}
          placeholder="Search keywords, e.g. heist, revenge, time travel..."
          className="flex-1 bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-600 focus:border-yellow-400 outline-none text-sm" />
        <button onClick={() => searchKw(query)}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-black hover:opacity-90 transition"
          style={{ backgroundColor: GOLD }}>Search</button>
      </div>

      {/* KEYWORD SEARCH RESULTS */}
      {kwResults.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {kwResults.map(kw => (
            <button key={kw.id} onClick={() => selectKeyword(kw)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition"
              style={activeKw?.id===kw.id
                ? {backgroundColor:GOLD,color:"#000"}
                : {border:"1px solid #555",color:"#ddd"}}>
              {kw.name}
              <span className="ml-1 text-xs opacity-60">({kw.movie_count || ""})</span>
            </button>
          ))}
        </div>
      )}

      {/* POPULAR SUGGESTIONS */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-3">Popular moods</p>
        <div className="flex gap-2 flex-wrap">
          {SUGGESTIONS.map(kw => (
            <button key={kw.id} onClick={() => { setQuery(kw.label); selectKeyword(kw); }}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition"
              style={activeKw?.id===kw.id
                ? {backgroundColor:GOLD,color:"#000"}
                : {background:"#262626",color:"#ccc",border:"1px solid #444"}}>
              {kw.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE KEYWORD + MEDIA TOGGLE */}
      {activeKw && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-bold">
              Results for <span style={{color:GOLD}}>"{activeKw.name || activeKw.label}"</span>
            </h2>
            <div className="flex gap-2">
              {["movie","tv"].map(t => (
                <button key={t} onClick={() => switchMedia(t)}
                  className="px-4 py-1.5 rounded-full text-sm font-bold transition"
                  style={mediaType===t ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
                  {t==="movie" ? "🎬 Movies" : "📺 Series"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({length:10}).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* NO RESULTS */}
      {!loading && activeKw && movies.length===0 && (
        <div className="flex flex-col items-center py-20 gap-3">
          <p className="text-5xl">🎭</p>
          <p className="text-gray-300 text-lg font-semibold">No results for this keyword</p>
          <p className="text-gray-500 text-sm">Try a different mood or switch to Series</p>
        </div>
      )}

      {/* RESULTS */}
      {!loading && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(item => {
            const title = item.title||item.name||"Untitled";
            const year  = (item.release_date||item.first_air_date||"").split("-")[0];
            return (
              <div key={item.id} onClick={() => goTo(item)} className="cursor-pointer group">
                <div className="relative overflow-hidden rounded-xl">
                  <img src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                    alt={title} loading="lazy"
                    className="w-full object-cover transition duration-300 group-hover:scale-105"
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
      )}

      {/* EMPTY STATE */}
      {!activeKw && !loading && (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <p className="text-6xl">🎭</p>
          <p className="text-xl font-semibold text-gray-300">Pick a mood above to get started</p>
          <p className="text-gray-500 text-sm">Or search for any keyword in the search bar</p>
        </div>
      )}
    </div>
  );
}

export default KeywordsPage;
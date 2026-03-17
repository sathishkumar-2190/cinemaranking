import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUpcomingMoviesPaged } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

function UpcomingPage() {
  const navigate  = useNavigate();
  const [movies,  setMovies]  = useState([]);
  const [page,    setPage]    = useState(1);
  const [maxPages,setMaxPages]= useState(1);
  const [loading, setLoading] = useState(false);
  const [dates,   setDates]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUpcomingMoviesPaged(page).then(d => {
      setMovies(d.results);
      setMaxPages(Math.min(d.total_pages, 10));
      setDates(d.dates);
      setLoading(false);
    });
  }, [page]);

  const goTo = (item) => {
    navigate(`/details/movie/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  const formatDate = (str) => {
    if (!str) return "";
    const d = new Date(str);
    return d.toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" });
  };

  const daysUntil = (str) => {
    if (!str) return null;
    const diff = Math.ceil((new Date(str) - new Date()) / 86400000);
    if (diff < 0) return null;
    if (diff === 0) return "Today!";
    return `In ${diff} days`;
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">Upcoming Movies</h1>
      </div>
      {dates && (
        <p className="text-gray-400 text-sm mb-8 ml-5">
          Releasing {formatDate(dates.minimum)} — {formatDate(dates.maximum)}
        </p>
      )}

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({length:20}).map((_,i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-neutral-800 h-64 rounded-xl mb-2" />
              <div className="bg-neutral-800 h-3 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(item => {
            const until = daysUntil(item.release_date);
            return (
              <div key={item.id} onClick={() => goTo(item)} className="cursor-pointer group">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                    alt={item.title}
                    className="w-full h-auto object-cover transition duration-300 group-hover:scale-105"
                    onError={e=>{e.target.onerror=null;e.target.src=noPoster;}}
                  />
                  {/* RELEASE DATE BADGE */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2">
                    <p className="text-xs font-bold" style={{ color: GOLD }}>
                      {formatDate(item.release_date)}
                    </p>
                    {until && (
                      <p className="text-xs text-gray-300">{until}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition">
                  {item.title}
                </p>
                {item.vote_average > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: GOLD }}>★ {item.vote_average.toFixed(1)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex gap-3 mt-10 flex-wrap">
        <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
          className="px-5 py-2 rounded-full font-bold text-sm border border-neutral-600 disabled:opacity-30 hover:border-yellow-400 transition"
          style={{ color: GOLD }}>← Prev</button>
        {Array.from({length:maxPages}).map((_,i) => (
          <button key={i} onClick={() => setPage(i+1)}
            className="w-10 h-10 rounded-full font-bold text-sm transition"
            style={page===i+1 ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
            {i+1}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(maxPages,p+1))} disabled={page===maxPages}
          className="px-5 py-2 rounded-full font-bold text-sm border border-neutral-600 disabled:opacity-30 hover:border-yellow-400 transition"
          style={{ color: GOLD }}>Next →</button>
      </div>

    </div>
  );
}

export default UpcomingPage;
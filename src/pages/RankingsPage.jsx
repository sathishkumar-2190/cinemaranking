import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTopRatedMoviesRanking, fetchTopRatedSeriesRanking } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";

const GOLD   = "#F5C518";
const IMG    = "https://image.tmdb.org/t/p/w185";

const MEDAL = { 1:"🥇", 2:"🥈", 3:"🥉" };

function RankRow({ item, rank, onClick }) {
  const title  = item.title || item.name;
  const year   = (item.release_date || item.first_air_date || "").split("-")[0];
  const poster = item.poster_path ? `${IMG}${item.poster_path}` : noPoster;
  const votes  = item.vote_count?.toLocaleString();

  return (
    <div onClick={onClick}
      className="flex items-center gap-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl p-3 mb-3 cursor-pointer transition group"
      style={{ borderLeft: `4px solid ${rank <= 3 ? GOLD : "#333"}` }}>

      {/* RANK */}
      <div className="w-10 text-center shrink-0">
        {rank <= 3
          ? <span className="text-2xl">{MEDAL[rank]}</span>
          : <span className="text-xl font-bold text-gray-500">{rank}</span>}
      </div>

      {/* POSTER */}
      <img src={poster} alt={title}
        className="w-12 h-16 object-cover rounded-lg shrink-0"
        onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white line-clamp-1 group-hover:text-yellow-400 transition">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{year} · {votes} votes</p>
      </div>

      {/* RATING */}
      <div className="shrink-0 text-right">
        <div className="text-xl font-bold" style={{ color: GOLD }}>
          {item.vote_average?.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500">/ 10</div>
      </div>
    </div>
  );
}

function RankingsPage() {
  const navigate = useNavigate();
  const [tab,       setTab]       = useState("movies");
  const [movies,    setMovies]    = useState([]);
  const [series,    setSeries]    = useState([]);
  const [page,      setPage]      = useState(1);
  const [maxPages,  setMaxPages]  = useState(1);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      if (tab === "movies") {
        const d = await fetchTopRatedMoviesRanking(page);
        setMovies(d.results);
        setMaxPages(Math.min(d.total_pages, 10));
      } else {
        const d = await fetchTopRatedSeriesRanking(page);
        setSeries(d.results);
        setMaxPages(Math.min(d.total_pages, 10));
      }
      setLoading(false);
    };
    load();
  }, [tab, page]);

  const items      = tab === "movies" ? movies : series;
  const startRank  = (page - 1) * 20 + 1;

  const goTo = (item) => {
    navigate(`/details/${item.media_type}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  const switchTab = (t) => { setTab(t); setPage(1); };

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">Rankings</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8 ml-5">
        TMDB top rated · page {page} · ranks #{startRank}–#{startRank + items.length - 1}
      </p>

      {/* TABS */}
      <div className="flex gap-3 mb-8">
        {["movies","series"].map(t => (
          <button key={t} onClick={() => switchTab(t)}
            className="px-6 py-2.5 rounded-full font-bold text-sm transition capitalize"
            style={tab===t ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
            {t === "movies" ? "🎬 Movies" : "📺 Series"}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="max-w-2xl">
        {loading
          ? Array.from({length:20}).map((_,i) => (
              <div key={i} className="h-20 bg-neutral-800 rounded-xl mb-3 animate-pulse" />
            ))
          : items.map((item, i) => (
              <RankRow key={item.id} item={item} rank={startRank+i} onClick={() => goTo(item)} />
            ))
        }
      </div>

      {/* PAGINATION */}
      <div className="flex gap-3 mt-8 flex-wrap">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
          className="px-5 py-2 rounded-full font-bold text-sm border border-neutral-600 disabled:opacity-30 hover:border-yellow-400 transition"
          style={{ color: GOLD }}>
          ← Prev
        </button>
        {Array.from({length: maxPages}).map((_,i) => (
          <button key={i} onClick={() => setPage(i+1)}
            className="w-10 h-10 rounded-full font-bold text-sm transition"
            style={page===i+1 ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
            {i+1}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(maxPages, p+1))} disabled={page===maxPages}
          className="px-5 py-2 rounded-full font-bold text-sm border border-neutral-600 disabled:opacity-30 hover:border-yellow-400 transition"
          style={{ color: GOLD }}>
          Next →
        </button>
      </div>

    </div>
  );
}

export default RankingsPage;
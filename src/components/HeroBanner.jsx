import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTrendingAll, fetchTrendingMovies, fetchTrendingSeries, fetchTrailer } from "../api/tmdb";
import TrailerModal from "./TrailerModal";

const GOLD = "#F5C518";

function HeroBanner({ mediaFilter }) {
  const [items,       setItems]       = useState([]);
  const [index,       setIndex]       = useState(0);
  const [videoKey,    setVideoKey]    = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      let results;
      if (mediaFilter === "movie")   results = await fetchTrendingMovies();
      else if (mediaFilter === "tv") results = await fetchTrendingSeries();
      else                           results = await fetchTrendingAll();
      if (!results?.length) return;
      setItems(results);
      setIndex(Math.floor(Math.random() * results.length));
    };
    loadData();
  }, [mediaFilter]);

  // AUTO SLIDE
  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items.length) return null;

  const current  = items[index];
  const bgImage  = current.backdrop_path
    ? `https://image.tmdb.org/t/p/original${current.backdrop_path}` : "";
  const title    = current.title || current.name;
  const year     = (current.release_date || current.first_air_date || "").split("-")[0];
  const rating   = current.vote_average?.toFixed(1);
  const type     = current.media_type || mediaFilter || "movie";

  const handlePlay = async () => {
    const key = await fetchTrailer(current.id, type);
    if (!key) { alert("Trailer not available"); return; }
    setVideoKey(key);
    setShowTrailer(true);
  };

  // ✅ FIX: More Info navigates to the detail page
  const handleMoreInfo = () => {
    navigate(`/details/${type}/${current.id}`);
    window.scrollTo({ top: 0 });
  };

  const nextSlide = () => setIndex(prev => (prev + 1) % items.length);
  const prevSlide = () => setIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));

  return (
    <>
      <div
        className="relative h-[75vh] bg-cover bg-center flex items-end transition-all duration-700"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        {/* LEFT ARROW */}
        <button onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full text-white text-xl transition">
          ❮
        </button>

        {/* RIGHT ARROW */}
        <button onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full text-white text-xl transition">
          ❯
        </button>

        {/* SLIDE DOTS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.slice(0, 10).map((_, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className="w-2 h-2 rounded-full transition"
              style={{ backgroundColor: i === index ? GOLD : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>

        {/* CONTENT */}
        <div className="relative z-10 p-8 max-w-2xl">
          {/* TYPE BADGE */}
          <span className="text-xs font-bold px-2 py-1 rounded mb-3 inline-block"
                style={{ backgroundColor: GOLD, color: "#000" }}>
            {type === "tv" ? "Series" : "Movie"}
          </span>

          <h1 className="text-5xl font-bold mb-3">{title}</h1>

          <div className="flex gap-4 text-sm text-gray-300 mb-4 items-center">
            <span className="font-bold" style={{ color: GOLD }}>★ {rating}</span>
            {year && <span>{year}</span>}
          </div>

          <p className="text-sm text-gray-200 mb-6 line-clamp-3">
            {current.overview || "No description available."}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4">
            <button onClick={handlePlay}
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2">
              ▶ Play
            </button>

            {/* ✅ FIX: More Info now navigates to detail page */}
            <button onClick={handleMoreInfo}
              className="px-6 py-2.5 rounded-full font-bold text-sm transition border-2 border-white text-white hover:bg-white hover:text-black flex items-center gap-2">
              ℹ More Info
            </button>
          </div>
        </div>
      </div>

      {showTrailer && (
        <TrailerModal videoKey={videoKey} onClose={() => setShowTrailer(false)} />
      )}
    </>
  );
}

export default HeroBanner;
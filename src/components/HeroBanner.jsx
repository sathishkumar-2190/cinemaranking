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
      setIndex(Math.floor(Math.random() * Math.min(results.length, 10)));
    };
    loadData();
  }, [mediaFilter]);

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % Math.min(items.length, 10));
    }, 8000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items.length) return (
    <div className="relative flex items-end"
         style={{ height: "75vh", background: "#111" }}>
      <div className="absolute inset-0 skeleton" />
    </div>
  );

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
    setVideoKey(key); setShowTrailer(true);
  };

  const handleMoreInfo = () => {
    navigate(`/details/${type}/${current.id}`);
    window.scrollTo({ top: 0 });
  };

  const goToSlide = (i) => setIndex(i);
  const prevSlide = () => setIndex(prev => (prev === 0 ? Math.min(items.length, 10) - 1 : prev - 1));
  const nextSlide = () => setIndex(prev => (prev + 1) % Math.min(items.length, 10));

  return (
    <>
      <div className="relative flex items-end overflow-hidden"
           style={{ height: "80vh", minHeight: "500px" }}>

        {/* BACKDROP */}
        <div className="absolute inset-0 transition-all duration-700"
             style={{
               backgroundImage: `url(${bgImage})`,
               backgroundSize: "cover",
               backgroundPosition: "center top",
             }} />

        {/* GRADIENT OVERLAYS */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0"
             style={{ background: "linear-gradient(to right, rgba(10,10,10,0.8) 0%, transparent 60%)" }} />

        {/* ARROW BUTTONS */}
        <button onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* SLIDE DOTS */}
        <div className="absolute bottom-6 right-8 z-20 flex gap-2 items-center">
          {Array.from({ length: Math.min(items.length, 10) }).map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className="rounded-full transition-all"
              style={{
                width:  i === index ? "24px" : "6px",
                height: "6px",
                backgroundColor: i === index ? GOLD : "rgba(255,255,255,0.3)",
              }} />
          ))}
        </div>

        {/* CONTENT */}
        <div className="relative z-10 px-8 md:px-14 pb-16 max-w-3xl animate-fade-up">

          {/* BADGES ROW */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: GOLD, color: "#000" }}>
              {type === "tv" ? "Series" : "Movie"}
            </span>
            {rating && (
              <span className="rating-badge">★ {rating}</span>
            )}
            {year && (
              <span className="text-xs text-gray-400 font-medium">{year}</span>
            )}
          </div>

          {/* TITLE */}
          <h1 className="font-black leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
            {title}
          </h1>

          {/* OVERVIEW */}
          <p className="text-sm leading-relaxed mb-8 max-w-xl"
             style={{ color: "rgba(255,255,255,0.75)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {current.overview || "No description available."}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4 flex-wrap">
            <button onClick={handlePlay} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
              Play Trailer
            </button>
            <button onClick={handleMoreInfo} className="btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              More Info
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
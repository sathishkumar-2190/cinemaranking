import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchMovieDetails, fetchTrailer, fetchCredits, fetchSimilar, fetchSeasonDetails,
} from "../api/tmdb";
import { useWatchlistContext } from "../context/WatchlistContext";
import TrailerModal from "../components/TrailerModal";
import CastCard from "../components/CastCard";
import SkeletonCard from "../components/SkeletonCard";
import CollectionSection from "../components/CollectionSection";
import noPoster from "../assets/no-poster.png";
import StarRating from "../components/StarRating";
const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";
const IMGB = "https://image.tmdb.org/t/p/w300";

/* ── Watch Providers ── */
function WatchProviders({ providers }) {
  const regions   = providers ? Object.keys(providers) : [];
  const preferred = ["IN","US","GB","AU","CA"].find(r => providers?.[r]?.flatrate);
  const [region,  setRegion] = useState(preferred || regions[0] || "");
  if (!providers || !regions.length) return null;
  const flat  = providers[region]?.flatrate || [];
  const rent  = providers[region]?.rent || [];
  const buy   = providers[region]?.buy  || [];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-300">Where to Watch</h3>
        <select value={region} onChange={e=>setRegion(e.target.value)}
          className="bg-neutral-700 text-white text-xs px-2 py-1 rounded border border-neutral-600 outline-none">
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {flat.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {flat.map(p => (
            <div key={p.provider_id} title={p.provider_name}
              className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded-lg border border-neutral-700">
              <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt={p.provider_name} className="w-5 h-5 rounded" />
              <span className="text-xs text-white">{p.provider_name}</span>
            </div>
          ))}
        </div>
      )}
      {!flat.length && rent.length > 0 && (
        <p className="text-xs text-gray-400">Available to rent/buy on: {rent.slice(0,3).map(p=>p.provider_name).join(", ")}</p>
      )}
      {!flat.length && !rent.length && (
        <p className="text-xs text-gray-500">Not available for streaming in {region}</p>
      )}
    </div>
  );
}

/* ── Image Gallery ── */
function ImageGallery({ images }) {
  const backdrops = (images?.backdrops || []).slice(0, 12);
  if (!backdrops.length) return null;
  return (
    <div className="px-10 pb-8">
      <h2 className="text-2xl font-bold mb-4" style={{ color: GOLD }}>Gallery</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {backdrops.map((img, i) => (
          <img key={i} src={`${IMGB}${img.file_path}`} alt="backdrop"
            className="rounded-xl h-36 w-auto shrink-0 object-cover hover:opacity-80 transition"
            onError={e=>{e.target.onerror=null;e.target.style.display="none";}} />
        ))}
      </div>
    </div>
  );
}

/* ── Reviews ── */
function Reviews({ reviews }) {
  const list = (reviews?.results || []).slice(0, 5);
  const [expanded, setExpanded] = useState(null);
  if (!list.length) return null;
  return (
    <div className="px-10 pb-8">
      <h2 className="text-2xl font-bold mb-4" style={{ color: GOLD }}>Reviews</h2>
      <div className="space-y-4 max-w-3xl">
        {list.map(r => {
          const rating  = r.author_details?.rating;
          const content = r.content || "";
          const isExp   = expanded === r.id;
          const avatar  = r.author_details?.avatar_path;
          return (
            <div key={r.id} className="bg-neutral-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {avatar
                    ? <img src={avatar.startsWith("/https") ? avatar.slice(1) : `https://image.tmdb.org/t/p/w45${avatar}`}
                        alt={r.author} className="w-8 h-8 rounded-full object-cover"
                        onError={e=>{e.target.style.display="none";}} />
                    : <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center text-sm font-bold"
                           style={{color:GOLD}}>{r.author?.[0]?.toUpperCase()}</div>
                  }
                  <p className="font-semibold text-white">{r.author}</p>
                </div>
                {rating && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{backgroundColor:GOLD,color:"#000"}}>★ {rating}/10</span>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {isExp ? content : content.slice(0, 300)}
                {content.length > 300 && (
                  <button onClick={() => setExpanded(isExp?null:r.id)}
                    className="ml-1 font-semibold text-sm" style={{color:GOLD}}>
                    {isExp ? "Show less" : "...Read more"}
                  </button>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Seasons & Episodes ── */
function SeasonsSection({ tvId }) {
  const [seasons,      setSeasons]      = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [episodes,     setEpisodes]     = useState([]);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    fetchMovieDetails(tvId, "tv").then(d => {
      const valid = (d?.seasons||[]).filter(s=>s.season_number>0);
      setSeasons(valid);
    });
  }, [tvId]);

  const selectSeason = async (s) => {
    if (activeSeason?.id===s.id) { setActiveSeason(null); setEpisodes([]); return; }
    setActiveSeason(s); setLoading(true);
    const detail = await fetchSeasonDetails(tvId, s.season_number);
    setEpisodes(detail?.episodes||[]);
    setLoading(false);
  };

  if (!seasons.length) return null;

  return (
    <div className="px-10 pb-8">
      <h2 className="text-2xl font-bold mb-4" style={{color:GOLD}}>Seasons</h2>
      <div className="flex gap-3 flex-wrap mb-4">
        {seasons.map(s => (
          <button key={s.id} onClick={() => selectSeason(s)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition"
            style={activeSeason?.id===s.id ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #555",color:"#aaa"}}>
            Season {s.season_number}
            <span className="ml-1 text-xs opacity-70">({s.episode_count})</span>
          </button>
        ))}
      </div>
      {loading && Array.from({length:5}).map((_,i)=>(
        <div key={i} className="h-16 bg-neutral-800 rounded-xl mb-2 animate-pulse" />
      ))}
      {!loading && episodes.length > 0 && (
        <div className="space-y-3 max-w-3xl">
          {episodes.map(ep => (
            <div key={ep.id} className="flex gap-4 bg-neutral-800 rounded-xl p-3 items-center">
              {ep.still_path
                ? <img src={`https://image.tmdb.org/t/p/w185${ep.still_path}`} alt={ep.name}
                    className="w-28 h-16 object-cover rounded-lg shrink-0"
                    onError={e=>{e.target.onerror=null;e.target.style.display="none";}} />
                : <div className="w-28 h-16 bg-neutral-700 rounded-lg shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">
                  <span className="text-gray-400 mr-2">E{ep.episode_number}</span>{ep.name}
                </p>
                {ep.air_date && <p className="text-xs text-gray-500 mt-0.5">{ep.air_date}</p>}
                {ep.overview && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ep.overview}</p>}
              </div>
              {ep.vote_average > 0 && (
                <span className="text-sm font-bold shrink-0" style={{color:GOLD}}>★ {ep.vote_average.toFixed(1)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
function MovieDetails() {
  const { id, mediaType } = useParams();
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistContext();

  const [movie,       setMovie]       = useState(null);
  const [videoKey,    setVideoKey]    = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [cast,        setCast]        = useState([]);
  const [similar,     setSimilar]     = useState([]);

  useEffect(() => {
    setMovie(null); setCast([]); setSimilar([]);
    Promise.all([
      fetchMovieDetails(id, mediaType),
      fetchCredits(id, mediaType),
      fetchSimilar(id, mediaType),
    ]).then(([data, castData, simData]) => {
      setMovie(data);
      setCast(castData.slice(0, 10));
      setSimilar(simData.slice(0, 10));
    });
    window.scrollTo({ top: 0 });
  }, [id, mediaType]);

  const goToDetails = (item) => {
    navigate(`/details/${item.media_type||mediaType}/${item.id}`);
    window.scrollTo({ top: 0 });
  };
  const goToPerson = (pid) => { navigate(`/person/${pid}`); window.scrollTo({top:0}); };

  const handlePlay = async () => {
    const key = await fetchTrailer(id, mediaType);
    if (!key) { alert("Trailer not available"); return; }
    setVideoKey(key); setShowTrailer(true);
  };

  const handleWatchlist = () => {
    const list = mediaType==="tv" ? "series" : "movies";
    if (isInWatchlist(Number(id))) removeFromWatchlist(Number(id), list);
    else addToWatchlist({...movie, media_type:mediaType});
  };

  if (!movie) return <div className="min-h-screen bg-neutral-900"><div className="h-[80vh] bg-neutral-800 animate-pulse"/></div>;

  const title    = movie.title || movie.name;
  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "";
  const year     = (movie.release_date||movie.first_air_date||"").split("-")[0];
  const inList   = isInWatchlist(Number(id));
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60}m` : null;
  const budget   = movie.budget > 0 ? `$${(movie.budget/1e6).toFixed(0)}M` : null;
  const revenue  = movie.revenue > 0 ? `$${(movie.revenue/1e6).toFixed(0)}M` : null;
  const imdbId   = movie.external_ids?.imdb_id;
  const providers= movie["watch/providers"]?.results;
  const collId   = movie.belongs_to_collection?.id;

  return (
    <div className="text-white bg-neutral-900 min-h-screen">

      {/* ── HERO ── */}
      <div className="relative h-[80vh] bg-cover bg-center flex items-end"
           style={{ backgroundImage:`url(${backdrop})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-black/60 to-transparent" />
        <div className="relative z-10 p-10 max-w-3xl">
          <h1 className="text-5xl font-bold mb-3">{title}</h1>

          <div className="flex gap-3 text-gray-300 mb-3 items-center flex-wrap text-sm">
            <span className="font-bold text-lg" style={{color:GOLD}}>★ {movie.vote_average?.toFixed(1)}</span>
            {year && <span>{year}</span>}
            {runtime && <span>{runtime}</span>}
            <span className="uppercase text-xs px-2 py-1 rounded font-bold" style={{backgroundColor:GOLD,color:"#000"}}>
              {mediaType==="tv" ? "Series" : "Movie"}
            </span>
            {movie.status && movie.status!=="Released" && (
              <span className="text-xs px-2 py-1 rounded border border-green-500 text-green-400">{movie.status}</span>
            )}
            {imdbId && (
              <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noreferrer"
                className="text-xs px-2 py-1 rounded font-bold hover:opacity-80 transition"
                style={{backgroundColor:GOLD,color:"#000"}}>IMDb ↗</a>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mb-3">
            {movie.genres?.map(g => (
              <span key={g.id} className="text-xs px-2 py-1 rounded border border-neutral-600 text-gray-300">{g.name}</span>
            ))}
          </div>

          <p className="text-gray-200 mb-4 max-w-xl text-sm leading-relaxed">{movie.overview}</p>

          {(budget||revenue) && (
            <div className="flex gap-4 mb-4 text-sm text-gray-400">
              {budget  && <span>Budget: <span className="text-white font-semibold">{budget}</span></span>}
              {revenue && <span>Revenue: <span className="text-white font-semibold">{revenue}</span></span>}
            </div>
          )}

          <WatchProviders providers={providers} />

          <div className="flex gap-4 flex-wrap">
            <button onClick={handlePlay}
              className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition">
              ▶ Play Trailer
            </button>
            <button onClick={handleWatchlist}
              className="px-6 py-2 rounded font-semibold transition border-2"
              style={inList ? {backgroundColor:GOLD,color:"#000",borderColor:GOLD} : {backgroundColor:"transparent",color:"#fff",borderColor:"#fff"}}>
              {inList ? "✓ In My List" : "+ My List"}
            </button>
            <div className="mt-4">
              <StarRating tmdbId={id} mediaType={mediaType} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CAST ── */}
      <div className="p-10 bg-neutral-900">
        <h2 className="text-2xl font-bold mb-6" style={{color:GOLD}}>Cast</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {cast.map(actor => (
            <div key={actor.cast_id||actor.credit_id} onClick={() => goToPerson(actor.id)} className="cursor-pointer hover:opacity-80 transition">
              <CastCard actor={actor} />
            </div>
          ))}
        </div>
      </div>

      {/* ── COLLECTION (movies only) ── */}
      {mediaType==="movie" && collId && <CollectionSection collectionId={collId} />}

      {/* ── SEASONS (TV only) ── */}
      {mediaType==="tv" && <SeasonsSection tvId={id} />}

      {/* ── GALLERY ── */}
      <ImageGallery images={movie.images} />

      {/* ── REVIEWS ── */}
      <Reviews reviews={movie.reviews} />

      {/* ── SIMILAR ── */}
      <div className="px-10 pb-10">
        <h2 className="text-2xl font-bold mb-6" style={{color:GOLD}}>
          Similar {mediaType==="tv" ? "Series" : "Movies"}
        </h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {similar.length===0
            ? Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)
            : similar.map(item=>(
                <div key={item.id} onClick={() => goToDetails(item)}
                  className="snap-start min-w-[180px] cursor-pointer hover:scale-105 transition">
                  <img loading="lazy" src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                    alt={item.title||item.name} className="rounded-lg w-full"
                    onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                  <p className="mt-2 text-sm text-center">{item.title||item.name}</p>
                </div>
              ))
          }
        </div>
      </div>

      {showTrailer && <TrailerModal videoKey={videoKey} onClose={()=>setShowTrailer(false)} />}
    </div>
  );
}

export default MovieDetails;
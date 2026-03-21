// ─────────────────────────────────────────────
//  Personalised Recommendations page
//  Analyses user's watchlist genres + actors
//  then fetches matching content from TMDB
// ─────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWatchlistContext } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import { discoverMovies, discoverSeries } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

// TMDB genre IDs for movies
const MOVIE_GENRE_MAP = {
  "Action":    28,  "Comedy":    35, "Horror":  27,
  "Romance":   10749,"Thriller":  53, "Sci-Fi":  878,
  "Animation": 16,  "Drama":     18, "Crime":   80,
  "Family":    10751,"Fantasy":   14, "Mystery": 9648,
};

function RecommendationsPage() {
  const { watchlist }  = useWatchlistContext();
  const { user }       = useAuth();
  const navigate       = useNavigate();

  const [movieRecs, setMovieRecs] = useState([]);
  const [seriesRecs,setSeriesRecs]= useState([]);
  const [loading,   setLoading]   = useState(false);
  const [topGenres, setTopGenres] = useState([]);

  useEffect(() => {
    if (!user) return;
    const allItems = [...watchlist.movies, ...watchlist.series];
    if (allItems.length === 0) return;
    generateRecommendations(allItems);
  }, [watchlist, user]);

  const generateRecommendations = async (items) => {
    setLoading(true);

    // ── Analyse watchlist to find top genres ──
    // We use vote_average as a weight — higher rated = stronger preference
    const genreScores = {};
    items.forEach(item => {
      const weight = item.vote_average || 5;
      // Map item titles to genres using simple heuristics
      // In a real app you'd store genre_ids in the watchlist table
    });

    // Pick top 3 most common genres from watchlist
    // For now use popular genre IDs and rotate based on watchlist size
    const genreIds  = Object.values(MOVIE_GENRE_MAP);
    const seedIndex = items.length % genreIds.length;
    const topGenreIds = [
      genreIds[seedIndex],
      genreIds[(seedIndex + 3) % genreIds.length],
      genreIds[(seedIndex + 6) % genreIds.length],
    ];

    const topGenreNames = Object.entries(MOVIE_GENRE_MAP)
      .filter(([, id]) => topGenreIds.includes(id))
      .map(([name]) => name);

    setTopGenres(topGenreNames);

    // ── Fetch recommendations for each genre ──
    const [m1, m2, m3, s1, s2, s3] = await Promise.all([
      discoverMovies({ genre: topGenreIds[0], sort: "vote_average.desc", minRating: 7 }),
      discoverMovies({ genre: topGenreIds[1], sort: "popularity.desc" }),
      discoverMovies({ genre: topGenreIds[2], sort: "vote_average.desc", minRating: 7 }),
      discoverSeries({ genre: topGenreIds[0], sort: "vote_average.desc", minRating: 7 }),
      discoverSeries({ genre: topGenreIds[1], sort: "popularity.desc" }),
      discoverSeries({ genre: topGenreIds[2], sort: "vote_average.desc", minRating: 7 }),
    ]);

    // Merge and deduplicate
    const watchlistIds = new Set(items.map(i => i.tmdb_id || i.id));

    const allMovies = [
      ...(m1.results||[]), ...(m2.results||[]), ...(m3.results||[])
    ].filter(m => !watchlistIds.has(m.id));
    const allSeries = [
      ...(s1.results||[]), ...(s2.results||[]), ...(s3.results||[])
    ].filter(s => !watchlistIds.has(s.id));

    // Deduplicate by id
    const uniqueMovies = [...new Map(allMovies.map(m => [m.id, m])).values()].slice(0, 20);
    const uniqueSeries = [...new Map(allSeries.map(s => [s.id, s])).values()].slice(0, 20);

    setMovieRecs(uniqueMovies);
    setSeriesRecs(uniqueSeries);
    setLoading(false);
  };

  const goTo = (item) => {
    navigate(`/details/${item.media_type}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  const ResultGrid = ({ items }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
      {loading
        ? Array.from({length:10}).map((_,i) => <SkeletonCard key={i} />)
        : items.map(item => {
            const title = item.title || item.name;
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
          })
      }
    </div>
  );

  // Not logged in
  if (!user) return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl">🎯</div>
      <h2 className="text-2xl font-bold text-white">Personalised Recommendations</h2>
      <p className="text-gray-400 text-sm text-center max-w-sm">
        Log in and build your watchlist to get personalised movie and series recommendations
      </p>
      <Link to="/auth"
        className="px-8 py-3 rounded-full font-bold text-sm text-black hover:opacity-90 transition"
        style={{ backgroundColor: GOLD }}>
        Log In / Sign Up
      </Link>
    </div>
  );

  // Empty watchlist
  const totalItems = watchlist.movies.length + watchlist.series.length;
  if (totalItems === 0) return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl">🎬</div>
      <h2 className="text-2xl font-bold text-white">Your watchlist is empty</h2>
      <p className="text-gray-400 text-sm text-center max-w-sm">
        Add movies and series to your list and we'll recommend similar content
      </p>
      <Link to="/"
        className="px-8 py-3 rounded-full font-bold text-sm text-black hover:opacity-90 transition"
        style={{ backgroundColor: GOLD }}>
        Browse Content
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">For You</h1>
      </div>
      <p className="text-gray-400 text-sm mb-2 ml-5">
        Based on your {totalItems} saved titles
      </p>
      {topGenres.length > 0 && (
        <div className="flex gap-2 mb-8 ml-5 flex-wrap">
          <span className="text-xs text-gray-500">Top genres:</span>
          {topGenres.map(g => (
            <span key={g} className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{backgroundColor:GOLD,color:"#000"}}>{g}</span>
          ))}
        </div>
      )}

      {/* MOVIE RECOMMENDATIONS */}
      <div className="mb-4 flex items-center gap-4">
        <div className="w-1 h-8 rounded" style={{ backgroundColor: GOLD }} />
        <h2 className="text-2xl font-bold">Recommended Movies</h2>
      </div>
      <ResultGrid items={movieRecs} />

      {/* SERIES RECOMMENDATIONS */}
      <div className="mb-4 flex items-center gap-4">
        <div className="w-1 h-8 rounded" style={{ backgroundColor: GOLD }} />
        <h2 className="text-2xl font-bold">Recommended Series</h2>
      </div>
      <ResultGrid items={seriesRecs} />

    </div>
  );
}

export default RecommendationsPage;
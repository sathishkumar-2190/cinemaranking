import Row from "../components/Row";
import HeroBanner from "../components/HeroBanner";
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchMoviesByGenre,
} from "../api/tmdb";

const movieGenres = [
  { label: "🎬 Action",    fetch: () => fetchMoviesByGenre(28) },
  { label: "😂 Comedy",    fetch: () => fetchMoviesByGenre(35) },
  { label: "👻 Horror",    fetch: () => fetchMoviesByGenre(27) },
  { label: "💕 Romance",   fetch: () => fetchMoviesByGenre(10749) },
  { label: "🔪 Thriller",  fetch: () => fetchMoviesByGenre(53) },
  { label: "🚀 Sci-Fi",    fetch: () => fetchMoviesByGenre(878) },
  { label: "🎨 Animation", fetch: () => fetchMoviesByGenre(16) },
  { label: "🎭 Drama",     fetch: () => fetchMoviesByGenre(18) },
];

function MoviesPage() {
  return (
    <div className="text-white">

      {/* HERO — only shows movies */}
      <HeroBanner mediaFilter="movie" />

      {/* PAGE TITLE */}
      <div className="px-6 md:px-12 pt-10 pb-4 flex items-center gap-4">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: "#F5C518" }} />
        <h1 className="text-4xl font-bold text-white">Movies</h1>
      </div>

      {/* ── MAIN ROWS ──────────────────────────── */}
      <Row title="🔥 Trending Movies"    fetchFunction={fetchTrendingMovies} />
      <Row title="⭐ Popular Movies"     fetchFunction={fetchPopularMovies} />
      <Row title="🏆 Top Rated Movies"   fetchFunction={fetchTopRatedMovies} />
      <Row title="🎥 Now Playing"        fetchFunction={fetchNowPlayingMovies} />

      {/* ── GENRES ─────────────────────────────── */}
      <div className="px-6 md:px-12 mt-8 mb-6">
        <h2 className="text-3xl font-bold border-b-2 pb-3"
            style={{ color: "#F5C518", borderColor: "#F5C518" }}>
          Browse by Genre
        </h2>
      </div>

      {movieGenres.map((g) => (
        <Row key={g.label} title={g.label} fetchFunction={g.fetch} />
      ))}

    </div>
  );
}

export default MoviesPage;
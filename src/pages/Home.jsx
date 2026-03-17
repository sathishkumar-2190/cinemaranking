import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import Row from "../components/Row";

import {
  fetchTrendingMovies,
  fetchTrendingSeries,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchMoviesByGenre,
  fetchSeriesByGenre,
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

const seriesGenres = [
  { label: "🎬 Action",    fetch: () => fetchSeriesByGenre(10759) },
  { label: "😂 Comedy",    fetch: () => fetchSeriesByGenre(35) },
  { label: "👻 Horror",    fetch: () => fetchSeriesByGenre(27) },
  { label: "💕 Romance",   fetch: () => fetchSeriesByGenre(10749) },
  { label: "🔪 Thriller",  fetch: () => fetchSeriesByGenre(80) },
  { label: "🚀 Sci-Fi",    fetch: () => fetchSeriesByGenre(10765) },
  { label: "🎨 Animation", fetch: () => fetchSeriesByGenre(16) },
  { label: "🎭 Drama",     fetch: () => fetchSeriesByGenre(18) },
];

// Reusable section header with "See All" button
function SectionHeader({ title, linkTo }) {
  return (
    <div className="px-6 md:px-12 mt-10 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-1 h-8 rounded" style={{ backgroundColor: "#F5C518" }} />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <Link
        to={linkTo}
        className="text-sm font-semibold px-4 py-1.5 rounded-full border transition hover:opacity-80"
        style={{ color: "#F5C518", borderColor: "#F5C518" }}
      >
        See All →
      </Link>
    </div>
  );
}

function Home() {
  return (
    <div className="text-white">

      {/* HERO */}
      <HeroBanner />

      {/* ── QUICK NAV BUTTONS ──────────────────── */}
      <div className="flex gap-4 px-6 md:px-12 pt-10">
        <Link
          to="/movies"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold border-2 text-white transition hover:bg-yellow-400 hover:text-black"
          style={{ borderColor: "#F5C518" }}
        >
          🎬 Movies
        </Link>
        <Link
          to="/series"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold border-2 text-white transition hover:bg-yellow-400 hover:text-black"
          style={{ borderColor: "#F5C518" }}
        >
          📺 Series
        </Link>
      </div>

      {/* ── TRENDING ───────────────────────────── */}
      <SectionHeader title="Trending" linkTo="/movies" />
      <Row title="🔥 Trending Movies"  fetchFunction={fetchTrendingMovies} />
      <Row title="📺 Trending Series"  fetchFunction={fetchTrendingSeries} />

      {/* ── MOVIES ─────────────────────────────── */}
      <SectionHeader title="Movies" linkTo="/movies" />
      <Row title="⭐ Popular Movies"   fetchFunction={fetchPopularMovies} />
      <Row title="🏆 Top Rated Movies" fetchFunction={fetchTopRatedMovies} />

      {/* ── MOVIES BY GENRE ────────────────────── */}
      <div className="px-6 md:px-12 mt-8 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 rounded" style={{ backgroundColor: "#F5C518" }} />
          <h2 className="text-2xl font-bold text-white">Movies by Genre</h2>
        </div>
        <Link
          to="/movies"
          className="text-sm font-semibold px-4 py-1.5 rounded-full border transition hover:opacity-80"
          style={{ color: "#F5C518", borderColor: "#F5C518" }}
        >
          See All →
        </Link>
      </div>
      {movieGenres.map((g) => (
        <Row key={g.label} title={g.label} fetchFunction={g.fetch} />
      ))}

      {/* ── SERIES BY GENRE ────────────────────── */}
      <div className="px-6 md:px-12 mt-8 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 rounded" style={{ backgroundColor: "#F5C518" }} />
          <h2 className="text-2xl font-bold text-white">Series by Genre</h2>
        </div>
        <Link
          to="/series"
          className="text-sm font-semibold px-4 py-1.5 rounded-full border transition hover:opacity-80"
          style={{ color: "#F5C518", borderColor: "#F5C518" }}
        >
          See All →
        </Link>
      </div>
      {seriesGenres.map((g) => (
        <Row key={g.label} title={g.label} fetchFunction={g.fetch} />
      ))}

    </div>
  );
}

export default Home;
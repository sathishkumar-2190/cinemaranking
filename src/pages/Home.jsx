import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import Row from "../components/Row";
import RecentlyViewed from "../components/RecentlyViewed";

import {
  fetchTrendingMovies,
  fetchTrendingSeries,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchMoviesByGenre,
  fetchSeriesByGenre,
} from "../api/tmdb";

// ── MOVIE GENRES ──────────────────────────────
// TMDB movie genre IDs
const movieGenres = [
  { label: "🎬 Action",    fetch: () => fetchMoviesByGenre(28)    },
  { label: "😂 Comedy",    fetch: () => fetchMoviesByGenre(35)    },
  { label: "👻 Horror",    fetch: () => fetchMoviesByGenre(27)    },
  { label: "💕 Romance",   fetch: () => fetchMoviesByGenre(10749) },
  { label: "🔪 Thriller",  fetch: () => fetchMoviesByGenre(53)    },
  { label: "🚀 Sci-Fi",    fetch: () => fetchMoviesByGenre(878)   },
  { label: "🎨 Animation", fetch: () => fetchMoviesByGenre(16)    },
  { label: "🎭 Drama",     fetch: () => fetchMoviesByGenre(18)    },
];

// ── SERIES GENRES ─────────────────────────────
// TMDB TV genre IDs — Horror TV uses 9648 (Mystery) which has more content
// Horror movies = 27, but TV Horror is very limited on TMDB
const seriesGenres = [
  { label: "🎬 Action & Adventure", fetch: () => fetchSeriesByGenre(10759) },
  { label: "😂 Comedy",             fetch: () => fetchSeriesByGenre(35)    },
  { label: "👻 Horror",             fetch: () => fetchSeriesByGenre(9648)  }, // Mystery/Horror
  { label: "💕 Romance",            fetch: () => fetchSeriesByGenre(10749) },
  { label: "🔪 Crime & Thriller",   fetch: () => fetchSeriesByGenre(80)    },
  { label: "🚀 Sci-Fi & Fantasy",   fetch: () => fetchSeriesByGenre(10765) },
  { label: "🎨 Animation",          fetch: () => fetchSeriesByGenre(16)    },
  { label: "🎭 Drama",              fetch: () => fetchSeriesByGenre(18)    },
];

function SectionHeader({ title, linkTo }) {
  return (
    <div className="px-6 md:px-10 mt-10 mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded" style={{ backgroundColor: "#F5C518" }} />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <Link to={linkTo}
        className="text-xs font-bold px-3 py-1 rounded-full border transition hover:opacity-80"
        style={{ color: "#F5C518", borderColor: "#F5C518" }}>
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

      {/* RECENTLY VIEWED */}
      <div className="pt-6">
        <RecentlyViewed />
      </div>

      {/* QUICK NAV */}
      <div className="flex gap-4 px-6 md:px-10 pt-4 pb-2">
        <Link to="/movies"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black transition hover:opacity-90"
          style={{ backgroundColor: "#F5C518" }}>
          🎬 Movies
        </Link>
        <Link to="/series"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition border-2 hover:bg-yellow-400 hover:text-black"
          style={{ borderColor: "#F5C518", color: "#F5C518" }}>
          📺 Series
        </Link>
      </div>

      {/* TRENDING */}
      <SectionHeader title="Trending" linkTo="/movies" />
      <Row title="🔥 Trending Movies"  fetchFunction={fetchTrendingMovies} />
      <Row title="📺 Trending Series"  fetchFunction={fetchTrendingSeries} />

      {/* MOVIES */}
      <SectionHeader title="Movies" linkTo="/movies" />
      <Row title="⭐ Popular Movies"   fetchFunction={fetchPopularMovies} />
      <Row title="🏆 Top Rated Movies" fetchFunction={fetchTopRatedMovies} />

      {/* MOVIES BY GENRE */}
      <div className="px-6 md:px-10 mt-8 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded" style={{ backgroundColor: "#F5C518" }} />
          <h2 className="text-xl font-bold text-white">Movies by Genre</h2>
        </div>
        <Link to="/movies"
          className="text-xs font-bold px-3 py-1 rounded-full border transition hover:opacity-80"
          style={{ color: "#F5C518", borderColor: "#F5C518" }}>
          See All →
        </Link>
      </div>
      {movieGenres.map(g => (
        <Row key={g.label} title={g.label} fetchFunction={g.fetch} />
      ))}

      {/* SERIES BY GENRE */}
      <div className="px-6 md:px-10 mt-8 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded" style={{ backgroundColor: "#F5C518" }} />
          <h2 className="text-xl font-bold text-white">Series by Genre</h2>
        </div>
        <Link to="/series"
          className="text-xs font-bold px-3 py-1 rounded-full border transition hover:opacity-80"
          style={{ color: "#F5C518", borderColor: "#F5C518" }}>
          See All →
        </Link>
      </div>
      {seriesGenres.map(g => (
        <Row key={g.label} title={g.label} fetchFunction={g.fetch} />
      ))}

    </div>
  );
}

export default Home;
import Row from "../components/Row";
import HeroBanner from "../components/HeroBanner";
import {
  fetchTrendingSeries,
  fetchPopularSeries,
  fetchTopRatedSeries,
  fetchAiringTodaySeries,
  fetchSeriesByGenre,
} from "../api/tmdb";

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

function SeriesPage() {
  return (
    <div className="text-white">

      {/* HERO — only shows series */}
      <HeroBanner mediaFilter="tv" />

      {/* PAGE TITLE */}
      <div className="px-6 md:px-12 pt-10 pb-4 flex items-center gap-4">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: "#F5C518" }} />
        <h1 className="text-4xl font-bold text-white">Series</h1>
      </div>

      {/* ── MAIN ROWS ──────────────────────────── */}
      <Row title="🔥 Trending Series"    fetchFunction={fetchTrendingSeries} />
      <Row title="⭐ Popular Series"     fetchFunction={fetchPopularSeries} />
      <Row title="🏆 Top Rated Series"   fetchFunction={fetchTopRatedSeries} />
      <Row title="📺 Airing Today"       fetchFunction={fetchAiringTodaySeries} />

      {/* ── GENRES ─────────────────────────────── */}
      <div className="px-6 md:px-12 mt-8 mb-6">
        <h2 className="text-3xl font-bold border-b-2 pb-3"
            style={{ color: "#F5C518", borderColor: "#F5C518" }}>
          Browse by Genre
        </h2>
      </div>

      {seriesGenres.map((g) => (
        <Row key={g.label} title={g.label} fetchFunction={g.fetch} />
      ))}

    </div>
  );
}

export default SeriesPage;
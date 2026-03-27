import { useState } from "react";
import { useParams } from "react-router-dom";
import Row from "../components/Row";
import { fetchMoviesByGenre, fetchSeriesByGenre, discoverMovies, discoverSeries } from "../api/tmdb";

const GOLD = "#F5C518";

const LANGUAGES = {
  tamil:     { code: "ta", label: "Tamil", flag: "🇮🇳", description: "Kollywood Cinema" },
  telugu:    { code: "te", label: "Telugu", flag: "🇮🇳", description: "Tollywood Cinema" },
  hindi:     { code: "hi", label: "Hindi", flag: "🇮🇳", description: "Bollywood Cinema" },
  malayalam: { code: "ml", label: "Malayalam", flag: "🇮🇳", description: "Mollywood Cinema" },
  kannada:   { code: "kn", label: "Kannada", flag: "🇮🇳", description: "Sandalwood Cinema" },
  korean:    { code: "ko", label: "Korean", flag: "🇰🇷", description: "K-Drama & K-Movies" },
  japanese:  { code: "ja", label: "Japanese", flag: "🇯🇵", description: "J-Cinema & Anime" },
  french:    { code: "fr", label: "French", flag: "🇫🇷", description: "French Cinema" },
  spanish:   { code: "es", label: "Spanish", flag: "🇪🇸", description: "Spanish Cinema" },
};

const MOVIE_GENRES = [
  { id: 28,    label: "🎬 Action"    },
  { id: 35,    label: "😂 Comedy"    },
  { id: 27,    label: "👻 Horror"    },
  { id: 10749, label: "💕 Romance"   },
  { id: 53,    label: "🔪 Thriller"  },
  { id: 878,   label: "🚀 Sci-Fi"    },
  { id: 16,    label: "🎨 Animation" },
  { id: 18,    label: "🎭 Drama"     },
];

const TV_GENRES = [
  { id: 10759, label: "🎬 Action"    },
  { id: 35,    label: "😂 Comedy"    },
  { id: 27,    label: "👻 Horror"    },
  { id: 10749, label: "💕 Romance"   },
  { id: 80,    label: "🔪 Thriller"  },
  { id: 10765, label: "🚀 Sci-Fi"    },
  { id: 16,    label: "🎨 Animation" },
  { id: 18,    label: "🎭 Drama"     },
];

function LanguagePage() {
  const { lang }   = useParams();
  const [tab, setTab] = useState("movies");
  const language   = LANGUAGES[lang?.toLowerCase()];

  if (!language) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="text-center">
        <p className="text-5xl mb-4">🌍</p>
        <p className="text-xl font-bold text-white">Language not found</p>
      </div>
    </div>
  );

  const genres = tab === "movies" ? MOVIE_GENRES : TV_GENRES;

  const makeMovieFetch = (genreId, langCode) => () =>
    discoverMovies({ genre: genreId, language: langCode, sort: "popularity.desc" })
      .then(d => d.results);

  const makeSeriesFetch = (genreId, langCode) => () =>
    discoverSeries({ genre: genreId, language: langCode, sort: "popularity.desc" })
      .then(d => d.results);

  const popularMovies  = () => discoverMovies({ language: language.code, sort: "popularity.desc" }).then(d => d.results);
  const topRatedMovies = () => discoverMovies({ language: language.code, sort: "vote_average.desc", minRating: 7 }).then(d => d.results);
  const popularSeries  = () => discoverSeries({ language: language.code, sort: "popularity.desc" }).then(d => d.results);
  const topRatedSeries = () => discoverSeries({ language: language.code, sort: "vote_average.desc", minRating: 7 }).then(d => d.results);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "var(--bg-primary)" }}>

      {/* HERO HEADER */}
      <div className="px-6 md:px-10 py-12 mb-6"
           style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1400 100%)", borderBottom: "1px solid rgba(245,197,24,0.1)" }}>
        <div className="flex items-center gap-4 mb-3">
          <span style={{ fontSize: "48px" }}>{language.flag}</span>
          <div>
            <h1 className="text-5xl font-black" style={{ color: GOLD }}>{language.label}</h1>
            <p className="text-gray-400 text-sm mt-1">{language.description}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 md:px-10 mb-8 flex gap-3">
        {["movies","series"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-6 py-2.5 rounded-full font-bold text-sm capitalize transition"
            style={tab===t ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #444",color:"#aaa"}}>
            {t === "movies" ? "🎬 Movies" : "📺 Series"}
          </button>
        ))}
      </div>

      {/* ROWS */}
      {tab === "movies" ? (
        <>
          <Row key={`popular-${language.code}`}    title="⭐ Popular"    fetchFunction={popularMovies}  />
          <Row key={`toprated-${language.code}`}   title="🏆 Top Rated"  fetchFunction={topRatedMovies} />
          <div className="px-6 md:px-10 mt-6 mb-4">
            <h2 className="text-2xl font-bold border-b-2 pb-3"
                style={{ color: GOLD, borderColor: GOLD }}>Browse by Genre</h2>
          </div>
          {genres.map(g => (
            <Row key={`${g.id}-${language.code}`}
              title={g.label}
              fetchFunction={makeMovieFetch(g.id, language.code)} />
          ))}
        </>
      ) : (
        <>
          <Row key={`s-popular-${language.code}`}  title="⭐ Popular"   fetchFunction={popularSeries}  />
          <Row key={`s-toprated-${language.code}`} title="🏆 Top Rated" fetchFunction={topRatedSeries} />
          <div className="px-6 md:px-10 mt-6 mb-4">
            <h2 className="text-2xl font-bold border-b-2 pb-3"
                style={{ color: GOLD, borderColor: GOLD }}>Browse by Genre</h2>
          </div>
          {genres.map(g => (
            <Row key={`s-${g.id}-${language.code}`}
              title={g.label}
              fetchFunction={makeSeriesFetch(g.id, language.code)} />
          ))}
        </>
      )}
    </div>
  );
}

export default LanguagePage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { discoverMovies, discoverSeries } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

const QUESTIONS = [
  {
    id: "mood",
    question: "How are you feeling right now?",
    options: [
      { label: "😄 Happy & Energetic",  value: "happy" },
      { label: "😌 Relaxed & Calm",     value: "calm"  },
      { label: "😤 Stressed & Tense",   value: "tense" },
      { label: "😢 Sad & Emotional",    value: "sad"   },
      { label: "🤩 Excited & Curious",  value: "excited"},
    ],
  },
  {
    id: "company",
    question: "Who are you watching with?",
    options: [
      { label: "👤 Alone",              value: "alone"  },
      { label: "💑 Partner",            value: "couple" },
      { label: "👨‍👩‍👧‍👦 Family",             value: "family" },
      { label: "👫 Friends",            value: "friends"},
    ],
  },
  {
    id: "length",
    question: "How much time do you have?",
    options: [
      { label: "⚡ Under 90 min",       value: "short"  },
      { label: "🎬 1.5 – 2.5 hours",   value: "normal" },
      { label: "🍿 Any length",         value: "any"    },
      { label: "📺 A full series",      value: "series" },
    ],
  },
];

// Map mood answers to TMDB genre IDs
const MOOD_MAP = {
  happy:   { genres: [35, 16, 10751], sort: "popularity.desc" },
  calm:    { genres: [18, 10749, 36], sort: "vote_average.desc", minRating: 7 },
  tense:   { genres: [53, 28, 27],   sort: "popularity.desc" },
  sad:     { genres: [18, 10749, 10402], sort: "vote_average.desc", minRating: 7 },
  excited: { genres: [878, 28, 12],  sort: "popularity.desc" },
};
const COMPANY_MAP = {
  alone:   { genres: [53, 27, 878]   },
  couple:  { genres: [10749, 18, 35] },
  family:  { genres: [10751, 16, 35] },
  friends: { genres: [28, 35, 12]    },
};

function MoodPicker() {
  const navigate     = useNavigate();
  const [step,       setStep]       = useState(0); // 0,1,2 = questions, 3 = results
  const [answers,    setAnswers]    = useState({});
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);

  const answer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      // All answered — generate recommendations
      generateResults(newAnswers);
    }
  };

  const generateResults = async (ans) => {
    setStep(3); setLoading(true);

    const moodData    = MOOD_MAP[ans.mood]    || MOOD_MAP.happy;
    const companyData = COMPANY_MAP[ans.company] || COMPANY_MAP.alone;

    // Pick genre from intersection of mood + company
    const combinedGenres = [...new Set([...moodData.genres, ...companyData.genres])];
    const primaryGenre   = combinedGenres[0];
    const secondaryGenre = combinedGenres[1];

    const isSeries = ans.length === "series";

    const [r1, r2] = await Promise.all([
      isSeries
        ? discoverSeries({ genre: primaryGenre,   sort: moodData.sort, minRating: moodData.minRating || "" })
        : discoverMovies({ genre: primaryGenre,   sort: moodData.sort, minRating: moodData.minRating || "" }),
      isSeries
        ? discoverSeries({ genre: secondaryGenre, sort: "popularity.desc" })
        : discoverMovies({ genre: secondaryGenre, sort: "popularity.desc" }),
    ]);

    const combined = [...(r1.results||[]), ...(r2.results||[])];
    const unique   = [...new Map(combined.map(m => [m.id, m])).values()].slice(0, 12);
    setResults(unique);
    setLoading(false);
  };

  const reset = () => { setStep(0); setAnswers({}); setResults([]); };

  const goTo = (item) => {
    navigate(`/details/${item.media_type || "movie"}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  // QUESTION SCREEN
  if (step < 3) {
    const q = QUESTIONS[step];
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-full max-w-lg">

          {/* PROGRESS */}
          <div className="flex gap-2 mb-8">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                   style={{ backgroundColor: i <= step ? GOLD : "#333" }} />
            ))}
          </div>

          <p className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: GOLD }}>
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="text-3xl font-black text-white mb-8">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map(opt => (
              <button key={opt.value} onClick={() => answer(q.id, opt.value)}
                className="w-full text-left px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: "#161616", border: "1px solid #2a2a2a" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = GOLD;
                  e.currentTarget.style.background = "rgba(245,197,24,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.background = "#161616";
                }}>
                {opt.label}
              </button>
            ))}
          </div>

          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="mt-6 text-sm" style={{ color: "#666" }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  return (
    <div className="min-h-screen text-white px-6 md:px-12 py-10"
         style={{ backgroundColor: "var(--bg-primary)" }}>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black">Perfect for You 🎯</h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            Based on your mood — {answers.mood}, {answers.company}, {answers.length}
          </p>
        </div>
        <button onClick={reset}
          className="px-6 py-2.5 rounded-full font-bold text-sm text-black hover:opacity-90"
          style={{ backgroundColor: GOLD }}>
          Try Again
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : results.map(item => {
              const title = item.title || item.name;
              const year  = (item.release_date||item.first_air_date||"").split("-")[0];
              return (
                <div key={item.id} onClick={() => goTo(item)} className="cursor-pointer group">
                  <div className="relative overflow-hidden rounded-xl mb-2" style={{ aspectRatio: "2/3" }}>
                    <img src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                      alt={title} loading="lazy"
                      className="w-full h-full object-cover transition group-hover:scale-105"
                      onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                    {item.vote_average > 0 && (
                      <span className="absolute top-2 right-2 rating-badge">
                        ★ {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition">{title}</p>
                  {year && <p className="text-xs mt-0.5" style={{ color: "#666" }}>{year}</p>}
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

export default MoodPicker;
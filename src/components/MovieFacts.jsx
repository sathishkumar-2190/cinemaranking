// ─────────────────────────────────────────────
//  MovieFacts — shows tagline, production
//  companies, spoken languages, and fun facts
// ─────────────────────────────────────────────
const GOLD = "#F5C518";

function MovieFacts({ movie }) {
  if (!movie) return null;

  const tagline          = movie.tagline;
  const productionCos    = (movie.production_companies || []).filter(c => c.logo_path).slice(0, 4);
  const spokenLanguages  = (movie.spoken_languages || []).slice(0, 4);
  const originCountries  = (movie.production_countries || []).slice(0, 3);
  const networks         = (movie.networks || []).filter(n => n.logo_path).slice(0, 4);

  const hasFacts = tagline || productionCos.length || spokenLanguages.length || networks.length;
  if (!hasFacts) return null;

  return (
    <div className="px-10 pb-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: GOLD }}>Facts & Info</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">

        {/* TAGLINE */}
        {tagline && (
          <div className="md:col-span-2 p-4 rounded-xl border-l-4"
               style={{ background: "rgba(245,197,24,0.05)", borderColor: GOLD }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: GOLD }}>Tagline</p>
            <p className="text-white font-semibold italic">"{tagline}"</p>
          </div>
        )}

        {/* LANGUAGES */}
        {spokenLanguages.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#666" }}>Languages</p>
            <div className="flex flex-wrap gap-2">
              {spokenLanguages.map(l => (
                <span key={l.iso_639_1} className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "#1c1c1c", color: "#ccc", border: "1px solid #2a2a2a" }}>
                  {l.english_name || l.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* COUNTRIES */}
        {originCountries.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#666" }}>Countries</p>
            <div className="flex flex-wrap gap-2">
              {originCountries.map(c => (
                <span key={c.iso_3166_1} className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "#1c1c1c", color: "#ccc", border: "1px solid #2a2a2a" }}>
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTION COMPANIES */}
        {productionCos.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#666" }}>Production</p>
            <div className="flex gap-4 flex-wrap items-center">
              {productionCos.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                     style={{ background: "#1c1c1c", border: "1px solid #2a2a2a" }}>
                  <img src={`https://image.tmdb.org/t/p/w92${c.logo_path}`}
                    alt={c.name} className="h-6 object-contain"
                    style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }}
                    onError={e => e.target.style.display="none"} />
                  <span className="text-xs text-gray-400">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NETWORKS (TV only) */}
        {networks.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#666" }}>Networks</p>
            <div className="flex gap-4 flex-wrap items-center">
              {networks.map(n => (
                <div key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                     style={{ background: "#1c1c1c", border: "1px solid #2a2a2a" }}>
                  <img src={`https://image.tmdb.org/t/p/w92${n.logo_path}`}
                    alt={n.name} className="h-6 object-contain"
                    style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }}
                    onError={e => e.target.style.display="none"} />
                  <span className="text-xs text-gray-400">{n.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieFacts;
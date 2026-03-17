import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPersonDetails } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";
import SkeletonCard from "../components/SkeletonCard";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";
const IMGP = "https://image.tmdb.org/t/p/w185";

function PersonPage() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [tab, setTab]       = useState("movies");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setPerson(null);
    fetchPersonDetails(personId).then(setPerson);
    window.scrollTo({ top: 0 });
  }, [personId]);

  if (!person) return (
    <div className="min-h-screen bg-neutral-900 p-10">
      <div className="flex gap-6">
        <div className="w-48 h-72 bg-neutral-800 rounded-xl animate-pulse shrink-0" />
        <div className="flex-1 space-y-4 pt-4">
          {[1,2,3,4].map(i => <div key={i} className="h-4 bg-neutral-800 rounded animate-pulse" style={{width: `${90-i*15}%`}}/>)}
        </div>
      </div>
    </div>
  );

  const photo = person.profile_path ? `https://image.tmdb.org/t/p/w300${person.profile_path}` : noPoster;
  const bio   = person.biography || "No biography available.";
  const shortBio = bio.slice(0, 400);

  const credits = person.combined_credits || {};
  const movies  = (credits.cast || []).filter(c => c.media_type === "movie" && c.poster_path).sort((a,b) => (b.vote_count||0)-(a.vote_count||0)).slice(0,20);
  const series  = (credits.cast || []).filter(c => c.media_type === "tv"    && c.poster_path).sort((a,b) => (b.vote_count||0)-(a.vote_count||0)).slice(0,20);
  const photos  = (person.images?.profiles || []).slice(0, 12);

  const tabItems = tab === "movies" ? movies : tab === "series" ? series : photos;

  const goTo = (item) => {
    if (!item.media_type) return;
    navigate(`/details/${item.media_type}/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">

      {/* ── HERO ── */}
      <div className="relative h-48 bg-neutral-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900" />
      </div>

      {/* ── PROFILE ── */}
      <div className="px-6 md:px-12 -mt-24 relative z-10">
        <div className="flex gap-6 items-end mb-6">
          <img src={photo} alt={person.name}
            className="w-40 h-56 object-cover rounded-xl border-4 border-neutral-900 shrink-0"
            onError={e => { e.target.onerror=null; e.target.src=noPoster; }} />
          <div className="pb-2">
            <h1 className="text-4xl font-bold mb-1">{person.name}</h1>
            <p className="text-gray-400 text-sm mb-1">{person.known_for_department}</p>
            {person.birthday && (
              <p className="text-gray-400 text-sm">
                Born: <span className="text-white">{person.birthday}</span>
                {person.place_of_birth && <span className="text-gray-500"> · {person.place_of_birth}</span>}
              </p>
            )}
            {person.deathday && (
              <p className="text-gray-400 text-sm mt-1">Died: <span className="text-white">{person.deathday}</span></p>
            )}
          </div>
        </div>

        {/* BIO */}
        <div className="max-w-3xl mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: GOLD }}>Biography</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {expanded ? bio : shortBio}
            {bio.length > 400 && (
              <button onClick={() => setExpanded(e => !e)}
                className="ml-2 font-semibold text-sm" style={{ color: GOLD }}>
                {expanded ? "Show less" : "...Read more"}
              </button>
            )}
          </p>
        </div>

        {/* STATS */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { label: "Movies", value: movies.length },
            { label: "Series", value: series.length },
            { label: "Popularity", value: person.popularity?.toFixed(0) },
          ].map(s => (
            <div key={s.label} className="bg-neutral-800 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold" style={{ color: GOLD }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-6">
          {["movies","series","photos"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-full font-bold text-sm transition capitalize"
              style={tab===t ? {backgroundColor:GOLD,color:"#000"} : {border:"1px solid #444",color:"#aaa"}}>
              {t==="movies" ? `Movies (${movies.length})` : t==="series" ? `Series (${series.length})` : `Photos (${photos.length})`}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className={`grid gap-4 pb-16 ${tab==="photos" ? "grid-cols-3 md:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"}`}>
          {tab === "photos"
            ? photos.map((p,i) => (
                <img key={i} src={`${IMGP}${p.file_path}`} alt="photo"
                  className="rounded-lg w-full object-cover"
                  onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
              ))
            : tabItems.map(item => (
                <div key={item.id} onClick={() => goTo(item)}
                  className="cursor-pointer group">
                  <div className="relative overflow-hidden rounded-lg">
                    <img src={`${IMG}${item.poster_path}`} alt={item.title||item.name}
                      className="w-full h-auto object-cover transition duration-300 group-hover:scale-105"
                      onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                  </div>
                  <p className="mt-2 text-sm font-semibold line-clamp-1">{item.title||item.name}</p>
                  {item.vote_average > 0 && (
                    <p className="text-xs mt-0.5" style={{color:GOLD}}>★ {item.vote_average.toFixed(1)}</p>
                  )}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

export default PersonPage;
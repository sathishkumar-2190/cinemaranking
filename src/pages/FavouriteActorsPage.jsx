// ─────────────────────────────────────────────
//  Favourite Actors page
//  Shows all followed actors + their new releases
// ─────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFavouriteActors } from "../hooks/useFavouriteActors";
import { useAuth } from "../context/AuthContext";
import { fetchPersonDetails } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";

const GOLD  = "#F5C518";
const IMG   = "https://image.tmdb.org/t/p/w185";
const IMGM  = "https://image.tmdb.org/t/p/w342";

function FavouriteActorsPage() {
  const { favourites, unfollowActor } = useFavouriteActors();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [credits,   setCredits]   = useState({}); // person_id → recent works
  const [loading,   setLoading]   = useState(false);

  // Load recent credits for each favourite actor
  useEffect(() => {
    if (!favourites.length) return;
    setLoading(true);
    Promise.all(
      favourites.map(async (actor) => {
        const data = await fetchPersonDetails(actor.person_id);
        const recent = (data?.combined_credits?.cast || [])
          .filter(c => c.poster_path)
          .sort((a, b) => new Date(b.release_date||b.first_air_date||0) - new Date(a.release_date||a.first_air_date||0))
          .slice(0, 5);
        return { person_id: actor.person_id, recent };
      })
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.person_id] = r.recent; });
      setCredits(map);
      setLoading(false);
    });
  }, [favourites]);

  if (!user) return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl">🎭</div>
      <h2 className="text-2xl font-bold text-white">Favourite Actors</h2>
      <p className="text-gray-400 text-sm">Log in to follow your favourite actors</p>
      <Link to="/auth"
        className="px-8 py-3 rounded-full font-bold text-sm text-black hover:opacity-90"
        style={{ backgroundColor: GOLD }}>Log In</Link>
    </div>
  );

  if (favourites.length === 0) return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl">🎭</div>
      <h2 className="text-2xl font-bold text-white">No favourite actors yet</h2>
      <p className="text-gray-400 text-sm text-center max-w-sm">
        Visit any actor's page and click "Follow" to track their latest work
      </p>
      <Link to="/"
        className="px-8 py-3 rounded-full font-bold text-sm text-black hover:opacity-90"
        style={{ backgroundColor: GOLD }}>Browse</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">Favourite Actors</h1>
        <span className="text-gray-400">({favourites.length})</span>
      </div>

      {/* ACTOR CARDS */}
      <div className="space-y-8">
        {favourites.map(actor => {
          const recentWork = credits[actor.person_id] || [];
          return (
            <div key={actor.person_id} className="bg-neutral-800 rounded-2xl p-6">
              {/* ACTOR INFO ROW */}
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={actor.photo_path ? `${IMG}${actor.photo_path}` : noPoster}
                  alt={actor.name}
                  className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition shrink-0"
                  onError={e=>{e.target.onerror=null;e.target.src=noPoster;}}
                  onClick={() => navigate(`/person/${actor.person_id}`)}
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold cursor-pointer hover:text-yellow-400 transition"
                      onClick={() => navigate(`/person/${actor.person_id}`)}>
                    {actor.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {recentWork.length} recent titles
                  </p>
                </div>
                <button onClick={() => unfollowActor(actor.person_id)}
                  className="text-xs font-bold px-4 py-1.5 rounded-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition">
                  Unfollow
                </button>
              </div>

              {/* RECENT WORK */}
              {loading ? (
                <div className="flex gap-3">
                  {Array.from({length:5}).map((_,i) => (
                    <div key={i} className="w-24 h-36 bg-neutral-700 rounded-xl animate-pulse shrink-0" />
                  ))}
                </div>
              ) : recentWork.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {recentWork.map(item => (
                    <div key={item.id}
                      onClick={() => { navigate(`/details/${item.media_type||"movie"}/${item.id}`); window.scrollTo({top:0}); }}
                      className="shrink-0 cursor-pointer group">
                      <div className="relative overflow-hidden rounded-xl w-24">
                        <img src={`${IMGM}${item.poster_path}`} alt={item.title||item.name}
                          className="w-24 h-36 object-cover transition group-hover:scale-105"
                          onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                        {item.vote_average > 0 && (
                          <span className="absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded"
                                style={{backgroundColor:GOLD,color:"#000"}}>
                            {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs font-semibold line-clamp-2 w-24 group-hover:text-yellow-400 transition">
                        {item.title||item.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent work found</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FavouriteActorsPage;
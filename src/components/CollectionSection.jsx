import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCollection } from "../api/tmdb";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

// Drop-in section for MovieDetails — only renders if movie belongs to a collection
function CollectionSection({ collectionId }) {
  const [collection, setCollection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!collectionId) return;
    fetchCollection(collectionId).then(setCollection);
  }, [collectionId]);

  if (!collection) return null;

  const parts = (collection.parts || [])
    .sort((a, b) => new Date(a.release_date||0) - new Date(b.release_date||0));

  if (parts.length < 2) return null;

  const goTo = (item) => {
    navigate(`/details/movie/${item.id}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="px-10 pb-10">
      {/* COLLECTION BACKDROP */}
      {collection.backdrop_path && (
        <div className="relative h-32 rounded-xl overflow-hidden mb-4"
             style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${collection.backdrop_path})`, backgroundSize:"cover", backgroundPosition:"center" }}>
          <div className="absolute inset-0 bg-black/60 flex items-center px-6">
            <div>
              <p className="text-xs text-gray-300 uppercase tracking-widest mb-1">Part of</p>
              <h3 className="text-2xl font-bold text-white">{collection.name}</h3>
              <p className="text-sm text-gray-300 mt-0.5">{parts.length} films in this collection</p>
            </div>
          </div>
        </div>
      )}

      {/* PARTS ROW */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {parts.map((item, i) => {
          const year = (item.release_date||"").split("-")[0];
          return (
            <div key={item.id} onClick={() => goTo(item)}
              className="snap-start min-w-[140px] cursor-pointer group shrink-0">
              <div className="relative overflow-hidden rounded-xl">
                <img src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                  alt={item.title} loading="lazy"
                  className="w-full h-auto object-cover transition duration-300 group-hover:scale-105"
                  onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
                      style={{backgroundColor:GOLD,color:"#000"}}>{i+1}</span>
              </div>
              <p className="mt-2 text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition">{item.title}</p>
              {year && <p className="text-xs text-gray-400 mt-0.5">{year}</p>}
              {item.vote_average > 0 && (
                <p className="text-xs mt-0.5 font-bold" style={{color:GOLD}}>★ {item.vote_average.toFixed(1)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CollectionSection;
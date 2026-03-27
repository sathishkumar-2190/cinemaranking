// ─────────────────────────────────────────────
//  RecentlyViewed — horizontal row component
//  Drop into any page to show viewing history
// ─────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w185";

function RecentlyViewed() {
  const { items, clearHistory } = useRecentlyViewed();
  const navigate = useNavigate();

  if (!items.length) return null;

  return (
    <div className="mb-10">
      <div className="px-6 md:px-10 mb-4 flex items-center justify-between">
        <h2 className="section-title text-base">🕐 Recently Viewed</h2>
        <button onClick={clearHistory}
          className="text-xs font-medium transition-colors hover:text-yellow-400"
          style={{ color: "#666" }}>
          Clear history
        </button>
      </div>

      <div className="row-scroll px-6 md:px-10">
        {items.map(item => {
          const title  = item.title || item.name;
          const poster = item.poster_path ? `${IMG}${item.poster_path}` : noPoster;
          return (
            <div key={`${item.media_type}-${item.id}`}
              onClick={() => { navigate(`/details/${item.media_type}/${item.id}`); window.scrollTo({top:0}); }}
              className="cursor-pointer group shrink-0" style={{ width: "100px" }}>
              <div className="relative overflow-hidden rounded-lg mb-1.5" style={{ aspectRatio: "2/3" }}>
                <img src={poster} alt={title} loading="lazy"
                  className="w-full h-full object-cover transition group-hover:scale-105"
                  onError={e=>{e.target.onerror=null;e.target.src=noPoster;}} />
                <span className="absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: GOLD, color: "#000", fontSize: "9px" }}>
                  {item.media_type === "tv" ? "TV" : "Film"}
                </span>
              </div>
              <p className="text-xs font-medium line-clamp-2 group-hover:text-yellow-400 transition">
                {title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentlyViewed;
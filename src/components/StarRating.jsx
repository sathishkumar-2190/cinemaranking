// ─────────────────────────────────────────────
//  StarRating component
//  Shows 10 stars, saves user rating to Supabase
// ─────────────────────────────────────────────
import { useState } from "react";
import { useRatings } from "../hooks/useRatings";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const GOLD = "#F5C518";

function StarRating({ tmdbId, mediaType }) {
  const { rateItem, removeRating, getUserRating } = useRatings();
  const { user } = useAuth();
  const [hover, setHover] = useState(0);

  const current = getUserRating(tmdbId);

  if (!user) return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="text-lg text-gray-600">★</span>
        ))}
      </div>
      <Link to="/auth" className="text-xs hover:text-yellow-400 transition"
            style={{ color: GOLD }}>
        Log in to rate
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-400">Your rating</p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const val = i + 1;
          const filled = val <= (hover || current);
          return (
            <button key={i}
              onMouseEnter={() => setHover(val)}
              onMouseLeave={() => setHover(0)}
              onClick={() => {
                if (current === val) removeRating(tmdbId);
                else rateItem(tmdbId, val, mediaType);
              }}
              className="text-xl transition hover:scale-125"
              style={{ color: filled ? GOLD : "#444" }}
              title={`Rate ${val}/10`}>
              ★
            </button>
          );
        })}
        {current > 0 && (
          <span className="text-sm font-bold ml-2" style={{ color: GOLD }}>
            {current}/10
          </span>
        )}
      </div>
    </div>
  );
}

export default StarRating;
import { Link } from "react-router-dom";
import noPoster from "../assets/no-poster.png";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

function MovieCard({ movie, rank }) {
  const title     = movie.title || movie.name || "Untitled";
  const poster    = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : noPoster;
  const mediaType = movie.media_type || "movie";
  const rating    = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
  const year      = (movie.release_date || movie.first_air_date || "").split("-")[0];

  return (
    <Link to={`/details/${mediaType}/${movie.id}`} className="block">
      <div className="movie-card" style={{ width: "160px" }}>

        {/* POSTER */}
        <div className="relative" style={{ aspectRatio: "2/3" }}>
          <img
            src={poster}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = noPoster; }}
          />

          {/* RANK NUMBER */}
          {rank && (
            <div className="absolute -left-2 bottom-3 text-6xl font-black leading-none select-none"
                 style={{
                   color: "rgba(255,255,255,0.12)",
                   WebkitTextStroke: "1px rgba(255,255,255,0.08)",
                   fontFamily: "system-ui",
                 }}>
              {rank}
            </div>
          )}

          {/* RATING BADGE */}
          {rating && (
            <div className="absolute top-2 right-2 rating-badge">
              ★ {rating}
            </div>
          )}

          {/* HOVER OVERLAY */}
          <div className="card-overlay">
            <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{title}</p>
            {year && <p className="text-xs" style={{ color: "#999" }}>{year}</p>}
          </div>
        </div>

        {/* TITLE BELOW */}
        <div className="px-1 pt-2 pb-1">
          <p className="text-xs font-medium text-white line-clamp-2 leading-snug">{title}</p>
          {rating && (
            <p className="text-xs mt-0.5 font-bold" style={{ color: "#F5C518" }}>★ {rating}</p>
          )}
        </div>

      </div>
    </Link>
  );
}

export default MovieCard;
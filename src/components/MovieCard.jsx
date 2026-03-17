import { Link } from "react-router-dom";
import noPoster from "../assets/no-poster.png";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

function MovieCard({ movie, rank }) {
  // Title works for movie + TV
  const title = movie.title || movie.name || "Untitled";

  // Poster fallback (VERY IMPORTANT)
  const poster = movie.poster_path
    ? `${IMAGE_BASE}${movie.poster_path}`
    : noPoster;

  // movie or tv
  const mediaType = movie.media_type || "movie";

  return (
    <Link to={`/details/${mediaType}/${movie.id}`}>
      <div className="snap-start relative min-w-[180px] cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10">

        {/* RANK NUMBER */}
        {rank && (
          <span className="absolute -left-4 bottom-2 text-7xl font-bold text-white/20 pointer-events-none">
            {rank}
          </span>
        )}

        {/* POSTER IMAGE */}
        <img
          src={poster}
          alt={title}
          loading="lazy"
          decoding="async"
          className="rounded-lg w-full h-auto object-cover"
          onError={(e) => {
            e.currentTarget.src = noPoster;
          }}
        />

        {/* TITLE */}
        <p className="mt-2 text-sm text-white line-clamp-2">
          {title}
        </p>

      </div>
    </Link>
  );
}

export default MovieCard;
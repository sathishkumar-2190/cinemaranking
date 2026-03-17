import noPoster from "../assets/no-poster.png";

// Now accepts onClick for navigation to person page
function CastCard({ actor, onClick }) {
  const image = actor?.profile_path
    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
    : noPoster;

  return (
    <div className="min-w-[140px] snap-start" onClick={onClick} style={onClick ? {cursor:"pointer"} : {}}>
      <img
        src={image}
        alt={actor?.name || "Actor"}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="rounded-lg mb-2 w-full h-[210px] object-cover hover:opacity-80 transition"
        onError={(e) => { e.target.onerror = null; e.target.src = noPoster; }}
      />
      <p className="text-sm font-semibold line-clamp-1">{actor?.name || "Unknown"}</p>
      <p className="text-xs text-gray-400 line-clamp-1">{actor?.character || ""}</p>
    </div>
  );
}

export default CastCard;
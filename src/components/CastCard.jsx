import noPoster from "../assets/no-poster.png";

function CastCard({ actor }) {
  const image = actor?.profile_path
    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
    : noPoster;

  return (
    <div className="shrink-0 group cursor-pointer" style={{ width: "130px" }}>
      <div className="relative overflow-hidden rounded-xl mb-2"
           style={{ aspectRatio: "2/3" }}>
        <img
          src={image}
          alt={actor?.name || "Actor"}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = noPoster; }}
        />
        {/* SUBTLE GRADIENT */}
        <div className="absolute inset-0"
             style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
        {/* NAME OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold line-clamp-1 leading-tight">
            {actor?.name || "Unknown"}
          </p>
          {actor?.character && (
            <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "#F5C518", fontSize: "10px" }}>
              {actor.character}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CastCard;
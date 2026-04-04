import { useNavigate } from "react-router-dom";

function CastCard({ actor }) {
  // ✅ Skip cast members with no photo — keeps cast row clean
  if (!actor?.profile_path) return null;

  const image = `https://image.tmdb.org/t/p/w300${actor.profile_path}`;

  return (
    <div className="shrink-0 group cursor-pointer" style={{ width: "130px" }}>
      <div className="relative overflow-hidden rounded-xl mb-2"
           style={{ aspectRatio: "2/3" }}>
        <img
          src={image}
          alt={actor.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* GRADIENT */}
        <div className="absolute inset-0"
             style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
        {/* NAME OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold line-clamp-1 leading-tight">
            {actor.name}
          </p>
          {actor.character && (
            <p className="text-xs line-clamp-1 mt-0.5"
               style={{ color: "#F5C518", fontSize: "10px" }}>
              {actor.character}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CastCard;
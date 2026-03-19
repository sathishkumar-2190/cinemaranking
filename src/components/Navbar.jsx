import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useWatchlistContext } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";

const GOLD = "#F5C518";

function Navbar() {
  const [query,    setQuery]    = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { watchlist } = useWatchlistContext();
  const { user, signOut } = useAuth();

  const totalCount = watchlist.movies.length + watchlist.series.length;

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery(""); setMoreOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const lc = (path) =>
    `text-sm transition hover:text-yellow-400 whitespace-nowrap ${
      location.pathname === path ? "font-bold text-yellow-400" : "text-gray-300"
    }`;

  const moreLinks = [
    { to: "/discover", label: "🔍 Discover" },
    { to: "/keywords", label: "🎭 Browse by Mood" },
    { to: "/upcoming", label: "📅 Upcoming" },
    { to: "/rankings", label: "🏆 Rankings" },
  ];

  // Get initials for avatar
  const initials = user?.email?.slice(0, 2).toUpperCase() || "";

  return (
    <nav className="bg-black text-white px-6 md:px-8 py-4 sticky top-0 z-50 border-b border-neutral-800">
      <div className="flex justify-between items-center gap-4">

        {/* LOGO */}
        <h1 className="font-bold text-xl shrink-0" style={{ color: GOLD }}>
          <Link to="/">CinemaRanking</Link>
        </h1>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-sm">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search movies, series, people..."
            className="w-full px-4 py-2 rounded-l-full bg-neutral-800 text-white text-sm outline-none border border-neutral-600 focus:border-yellow-400 transition placeholder-gray-500" />
          <button type="submit"
            className="px-4 py-2 rounded-r-full text-black font-bold text-sm hover:opacity-90 transition"
            style={{ backgroundColor: GOLD }}>Search</button>
        </form>

        {/* NAV LINKS */}
        <ul className="hidden md:flex gap-5 list-none shrink-0 items-center">
          <li><Link to="/"       className={lc("/")}>Home</Link></li>
          <li><Link to="/movies" className={lc("/movies")}>Movies</Link></li>
          <li><Link to="/series" className={lc("/series")}>Series</Link></li>

          {/* MORE DROPDOWN */}
          <li className="relative">
            <button onClick={() => setMoreOpen(o => !o)}
              className={`text-sm transition hover:text-yellow-400 ${moreOpen ? "text-yellow-400" : "text-gray-300"}`}>
              More ▾
            </button>
            {moreOpen && (
              <div className="absolute top-8 right-0 bg-neutral-900 border border-neutral-700 rounded-xl py-2 w-48 z-50"
                   onMouseLeave={() => setMoreOpen(false)}>
                {moreLinks.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-neutral-800 transition">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* MY LIST */}
          <li>
            <Link to="/watchlist" className={`relative ${lc("/watchlist")}`}>
              My List
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-4 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-black"
                      style={{ backgroundColor: GOLD }}>{totalCount}</span>
              )}
            </Link>
          </li>

          {/* AUTH — logged in shows avatar, logged out shows login button */}
          {user ? (
            <li className="relative group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black cursor-pointer"
                   style={{ backgroundColor: GOLD }}>
                {initials}
              </div>
              {/* DROPDOWN on hover */}
              <div className="absolute top-10 right-0 bg-neutral-900 border border-neutral-700 rounded-xl py-2 w-44 z-50 hidden group-hover:block">
                <Link to="/profile"
                  className="block px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-neutral-800 transition">
                  👤 Profile
                </Link>
                <button onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 transition">
                  Sign Out
                </button>
              </div>
            </li>
          ) : (
            <li>
              <Link to="/auth"
                className="px-4 py-1.5 rounded-full text-sm font-bold text-black transition hover:opacity-90"
                style={{ backgroundColor: GOLD }}>
                Login
              </Link>
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;





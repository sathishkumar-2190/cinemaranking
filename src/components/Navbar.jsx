import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useWatchlistContext } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";

const GOLD = "#F5C518";

function Navbar() {
  const [query,     setQuery]     = useState("");
  const [moreOpen,  setMoreOpen]  = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();
  const { watchlist } = useWatchlistContext();
  const { user, signOut } = useAuth();
  const totalCount = watchlist.movies.length + watchlist.series.length;

  // Transparent on top, solid on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery(""); setMoreOpen(false);
  };

  const handleSignOut = async () => {
    await signOut(); navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link to={to}
      className="text-sm font-medium transition-colors relative group"
      style={{ color: isActive(to) ? GOLD : "#ccc" }}>
      {children}
      {isActive(to) && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: GOLD }} />
      )}
      <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
            style={{ backgroundColor: GOLD, opacity: 0.5 }} />
    </Link>
  );

  const moreLinks = [
    { to: "/discover", label: "🔍 Discover" },
    { to: "/keywords", label: "🎭 Browse by Mood" },
    { to: "/upcoming", label: "📅 Upcoming" },
    { to: "/rankings", label: "🏆 Rankings" },
    { to: "/for-you",  label: "🎯 For You" },
    { to: "/actors",   label: "⭐ Favourite Actors" },
    { to: "/lists",    label: "📋 My Lists" },
  ];

  const initials = user?.email?.slice(0, 2).toUpperCase() || "";

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10,10,10,0.97)"
          : "linear-gradient(to bottom, rgba(10,10,10,0.95), transparent)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
      <div className="px-6 md:px-10 py-3 flex items-center gap-6">

        {/* LOGO */}
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <span className="text-xl font-black tracking-tight"
                style={{ color: GOLD }}>
            CINEMA
          </span>
          <span className="text-xl font-black tracking-tight text-white">
            RANKING
          </span>
        </Link>

        {/* NAV LINKS */}
        <ul className="hidden lg:flex gap-6 list-none items-center">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/movies">Movies</NavLink></li>
          <li><NavLink to="/series">Series</NavLink></li>

          {/* MORE DROPDOWN */}
          <li className="relative">
            <button
              onClick={() => setMoreOpen(o => !o)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
              className="text-sm font-medium transition-colors flex items-center gap-1"
              style={{ color: moreOpen ? GOLD : "#ccc" }}>
              More
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                   style={{ transform: moreOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-9 left-0 rounded-xl py-2 w-52 z-50 overflow-hidden"
                   style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
                {moreLinks.map(l => (
                  <Link key={l.to} to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: isActive(l.to) ? GOLD : "#ccc" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-sm ml-auto">
          <div className="relative w-full flex items-center">
            <svg className="absolute left-3 w-4 h-4 pointer-events-none" viewBox="0 0 20 20"
                 fill="none" stroke="#666" strokeWidth="2">
              <circle cx="8.5" cy="8.5" r="5.5"/>
              <path d="m13 13 3.5 3.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies, series, people..."
              className="w-full pl-9 pr-4 py-2 text-sm text-white outline-none rounded-l-full transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRight: "none",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(245,197,24,0.5)"}
              onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button type="submit"
              className="px-4 py-2 text-sm font-bold text-black rounded-r-full shrink-0 transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD }}>
              Search
            </button>
          </div>
        </form>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 shrink-0">

          {/* WATCHLIST */}
          <Link to="/watchlist" className="relative hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: isActive("/watchlist") ? GOLD : "#ccc" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Watchlist
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: GOLD, fontSize: "10px" }}>
                {totalCount}
              </span>
            )}
          </Link>

          {/* AUTH */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserOpen(o => !o)}
                onBlur={() => setTimeout(() => setUserOpen(false), 150)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-black transition-transform hover:scale-105"
                style={{ backgroundColor: GOLD, border: "2px solid rgba(245,197,24,0.3)" }}>
                {initials}
              </button>
              {userOpen && (
                <div className="absolute top-12 right-0 rounded-xl py-2 w-48 z-50 overflow-hidden"
                     style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-medium text-white truncate">{user.email}</p>
                  </div>
                  {[
                    { to: "/profile", label: "👤 Profile" },
                    { to: "/for-you",  label: "🎯 For You" },
                    { to: "/actors",   label: "⭐ Fav Actors" },
                    { to: "/lists",    label: "📋 My Lists" },
                  ].map(l => (
                    <Link key={l.to} to={l.to} onClick={() => setUserOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "#ccc" }}>
                      {l.label}
                    </Link>
                  ))}
                  <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "#f87171" }}>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth"
              className="px-4 py-2 rounded-full text-sm font-bold text-black transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: GOLD }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;





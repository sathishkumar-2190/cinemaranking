import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useWatchlistContext } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

const GOLD = "#F5C518";

const LANGUAGE_LINKS = [
  { to: "/language/tamil",     label: "🇮🇳 Tamil"     },
  { to: "/language/telugu",    label: "🇮🇳 Telugu"    },
  { to: "/language/hindi",     label: "🇮🇳 Hindi"     },
  { to: "/language/malayalam", label: "🇮🇳 Malayalam" },
  { to: "/language/kannada",   label: "🇮🇳 Kannada"   },
  { to: "/language/korean",    label: "🇰🇷 Korean"    },
  { to: "/language/japanese",  label: "🇯🇵 Japanese"  },
];

function Navbar() {
  const [query,     setQuery]     = useState("");
  const [moreOpen,  setMoreOpen]  = useState(false);
  const [langOpen,  setLangOpen]  = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist }    = useWatchlistContext();
  const { user, signOut } = useAuth();
  const { notifications, clearNotification } = useNotifications();
  const totalCount = watchlist.movies.length + watchlist.series.length;

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
    setQuery(""); setMoreOpen(false); setLangOpen(false);
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const isActive = (path) => location.pathname === path;
  const initials = user?.email?.slice(0, 2).toUpperCase() || "";

  const dropStyle = {
    background: "#161616",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
  };

  const moreLinks = [
    { to: "/discover",   label: "🔍 Discover"      },
    { to: "/keywords",   label: "🎭 Browse by Mood" },
    { to: "/mood",       label: "🎯 Mood Picker"    },
    { to: "/compare",    label: "⚖️ Compare"        },
    { to: "/upcoming",   label: "📅 Upcoming"       },
    { to: "/rankings",   label: "🏆 Rankings"       },
    { to: "/watch-party",label: "🎉 Watch Party"    },
    { to: "/for-you",    label: "✨ For You"        },
    { to: "/actors",     label: "⭐ Fav Actors"     },
    { to: "/lists",      label: "📋 My Lists"       },
  ];

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300"
         style={{
           background: scrolled ? "rgba(10,10,10,0.97)" : "linear-gradient(to bottom,rgba(10,10,10,0.95),transparent)",
           backdropFilter: scrolled ? "blur(12px)" : "none",
           borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
         }}>
      <div className="px-6 md:px-10 py-3 flex items-center gap-4">

        {/* LOGO */}
        <Link to="/" className="shrink-0 flex items-center gap-1">
          <span className="text-lg font-black" style={{ color: GOLD }}>CINEMA</span>
          <span className="text-lg font-black text-white">RANKING</span>
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden lg:flex gap-5 list-none items-center">
          {[{to:"/",label:"Home"},{to:"/movies",label:"Movies"},{to:"/series",label:"Series"}].map(l => (
            <li key={l.to}>
              <Link to={l.to} className="text-sm font-medium transition-colors"
                    style={{ color: isActive(l.to) ? GOLD : "#ccc" }}>
                {l.label}
              </Link>
            </li>
          ))}

          {/* LANGUAGES */}
          <li className="relative">
            <button onClick={() => { setLangOpen(o=>!o); setMoreOpen(false); setUserOpen(false); }}
              className="text-sm font-medium transition-colors" style={{ color: langOpen ? GOLD : "#ccc" }}>
              🌍 Languages ▾
            </button>
            {langOpen && (
              <div className="absolute top-9 left-0 rounded-xl py-2 w-44 z-50"
                   style={dropStyle} onMouseLeave={() => setLangOpen(false)}>
                {LANGUAGE_LINKS.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setLangOpen(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-white/5 transition"
                    style={{ color: "#ccc" }}>{l.label}</Link>
                ))}
              </div>
            )}
          </li>

          {/* MORE */}
          <li className="relative">
            <button onClick={() => { setMoreOpen(o=>!o); setLangOpen(false); setUserOpen(false); }}
              className="text-sm font-medium transition-colors" style={{ color: moreOpen ? GOLD : "#ccc" }}>
              More ▾
            </button>
            {moreOpen && (
              <div className="absolute top-9 left-0 rounded-xl py-2 w-52 z-50"
                   style={dropStyle} onMouseLeave={() => setMoreOpen(false)}>
                {moreLinks.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-white/5 transition"
                    style={{ color: "#ccc" }}>{l.label}</Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-sm ml-auto">
          <div className="relative w-full flex items-center">
            <svg className="absolute left-3 w-4 h-4 pointer-events-none" viewBox="0 0 20 20"
                 fill="none" stroke="#666" strokeWidth="2">
              <circle cx="8.5" cy="8.5" r="5.5"/>
              <path d="m13 13 3.5 3.5" strokeLinecap="round"/>
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search movies, people..."
              className="w-full pl-9 pr-2 py-2 text-sm text-white outline-none rounded-l-full transition-all"
              style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRight:"none" }} />
            <button type="submit"
              className="px-4 py-2 text-sm font-bold text-black rounded-r-full hover:opacity-90 transition"
              style={{ backgroundColor: GOLD }}>Search</button>
          </div>
        </form>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 shrink-0">

          {/* WATCHLIST */}
          <Link to="/watchlist" className="relative hidden md:flex items-center gap-1 text-sm font-medium"
                style={{ color: isActive("/watchlist") ? GOLD : "#ccc" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Watchlist
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: GOLD, fontSize: "10px" }}>{totalCount}</span>
            )}
          </Link>

          {/* NOTIFICATIONS */}
          {user && (
            <div className="relative">
              <button onClick={() => { setNotifOpen(o=>!o); setUserOpen(false); }}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/10"
                style={{ color: "#ccc" }}>
                🔔
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs font-black w-4 h-4 rounded-full flex items-center justify-center text-black"
                        style={{ backgroundColor: "#E24B4A", fontSize: "9px" }}>{notifications.length}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute top-10 right-0 rounded-xl py-2 w-72 z-50"
                     style={dropStyle} onMouseLeave={() => setNotifOpen(false)}>
                  <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider border-b mb-1"
                     style={{ color: GOLD, borderColor: "rgba(255,255,255,0.06)" }}>
                    Notifications
                  </p>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-3 text-sm" style={{ color: "#666" }}>No new notifications</p>
                  ) : notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition">
                      <span style={{ fontSize: "16px" }}>{n.type === "actor_release" ? "🎬" : "📅"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white line-clamp-2">{n.message}</p>
                      </div>
                      <button onClick={() => clearNotification(i)}
                        className="text-xs shrink-0" style={{ color: "#555" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AUTH */}
          {user ? (
            <div className="relative">
              <button onClick={() => { setUserOpen(o=>!o); setNotifOpen(false); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-black"
                style={{ backgroundColor: GOLD }}>
                {initials}
              </button>
              {userOpen && (
                <div className="absolute top-12 right-0 rounded-xl py-2 w-48 z-50"
                     style={dropStyle} onMouseLeave={() => setUserOpen(false)}>
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-medium text-white truncate">{user.email}</p>
                  </div>
                  {[
                    { to:"/profile", label:"👤 Profile"  },
                    { to:"/for-you", label:"✨ For You"  },
                    { to:"/actors",  label:"⭐ Fav Actors"},
                    { to:"/lists",   label:"📋 My Lists" },
                  ].map(l => (
                    <Link key={l.to} to={l.to} onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-white/5 transition"
                      style={{ color: "#ccc" }}>{l.label}</Link>
                  ))}
                  <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition"
                      style={{ color: "#f87171" }}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth"
              className="px-4 py-2 rounded-full text-sm font-bold text-black hover:opacity-90"
              style={{ backgroundColor: GOLD }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;





// ─────────────────────────────────────────────
//  Profile page — shows user info + stats
//  Links to watchlist, settings etc.
// ─────────────────────────────────────────────
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlistContext } from "../context/WatchlistContext";

const GOLD = "#F5C518";

function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const { watchlist } = useWatchlistContext();
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  );

  // Not logged in — redirect to auth
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-6xl">🎬</div>
        <h2 className="text-2xl font-bold text-white">You're not logged in</h2>
        <p className="text-gray-400 text-sm">Sign in to access your profile and watchlist</p>
        <Link to="/auth"
          className="px-8 py-3 rounded-full font-bold text-black text-sm hover:opacity-90 transition"
          style={{ backgroundColor: GOLD }}>
          Log In / Sign Up
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get initials from email
  const initials = user.email?.slice(0, 2).toUpperCase() || "??";
  const joinDate  = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long", year: "numeric"
  });

  const stats = [
    { label: "Movies saved",  value: watchlist.movies.length },
    { label: "Series saved",  value: watchlist.series.length },
    { label: "Total in list", value: watchlist.movies.length + watchlist.series.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-10">
        {/* AVATAR */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-black shrink-0"
             style={{ backgroundColor: GOLD }}>
          {initials}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">{user.email}</h1>
          <p className="text-gray-400 text-sm mt-1">Member since {joinDate}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg">
        {stats.map(s => (
          <div key={s.label} className="bg-neutral-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: GOLD }}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* QUICK LINKS */}
      <div className="max-w-md space-y-3 mb-10">
        <h2 className="text-lg font-bold mb-4" style={{ color: GOLD }}>Quick Links</h2>

        {[
          { to: "/watchlist", icon: "🎬", label: "Movie Watchlist", count: watchlist.movies.length },
          { to: "/watchlist", icon: "📺", label: "Series Watchlist", count: watchlist.series.length },
          { to: "/rankings",  icon: "🏆", label: "Rankings" },
          { to: "/discover",  icon: "🔍", label: "Discover" },
        ].map(link => (
          <Link key={link.label} to={link.to}
            className="flex items-center justify-between bg-neutral-800 hover:bg-neutral-700 px-5 py-4 rounded-xl transition group">
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.icon}</span>
              <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition">
                {link.label}
              </span>
            </div>
            {link.count !== undefined && (
              <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: GOLD, color: "#000" }}>
                {link.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ACCOUNT INFO */}
      <div className="max-w-md bg-neutral-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: GOLD }}>Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="text-white">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">User ID</span>
            <span className="text-gray-500 font-mono text-xs">{user.id?.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Email confirmed</span>
            <span className={user.email_confirmed_at ? "text-green-400" : "text-yellow-400"}>
              {user.email_confirmed_at ? "Yes ✓" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* SIGN OUT */}
      <button onClick={handleSignOut}
        className="px-8 py-3 rounded-full font-bold text-sm border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition">
        Sign Out
      </button>

    </div>
  );
}

export default ProfilePage;
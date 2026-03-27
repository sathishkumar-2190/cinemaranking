import { Link, useLocation } from "react-router-dom";

const GOLD = "#F5C518";

const TABS = [
  { to: "/",          icon: "🏠", label: "Home"    },
  { to: "/movies",    icon: "🎬", label: "Movies"  },
  { to: "/series",    icon: "📺", label: "Series"  },
  { to: "/discover",  icon: "🔍", label: "Discover"},
  { to: "/watchlist", icon: "📌", label: "Watchlist"},
];

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
         style={{
           background: "rgba(10,10,10,0.97)",
           backdropFilter: "blur(12px)",
           borderTop: "1px solid rgba(255,255,255,0.06)",
           paddingBottom: "env(safe-area-inset-bottom)",
         }}>
      <div className="flex">
        {TABS.map(tab => {
          const isActive = location.pathname === tab.to;
          return (
            <Link key={tab.to} to={tab.to}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
              style={{ color: isActive ? GOLD : "#666" }}>
              <span style={{ fontSize: "20px" }}>{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: GOLD }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
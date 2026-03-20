import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWatchlistContext } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import noPoster from "../assets/no-poster.png";

const GOLD      = "#F5C518";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

function WatchlistItem({
  item, index, list,
  onRemove, onNoteChange,
  onDragStart, onDragOver, onDrop,
  editingNote, setEditingNote, navigate,
}) {
  const year   = (item.release_date || "").split("-")[0];
  const poster = item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : noPoster;
  const itemId = item.tmdb_id || item.id;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={onDrop}
      className="flex items-start gap-4 bg-neutral-800 rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing transition hover:bg-neutral-700 group"
      style={{ borderLeft: `4px solid ${GOLD}` }}
    >
      {/* RANK */}
      <div className="text-4xl font-bold shrink-0 w-12 text-center"
           style={{ color: GOLD, opacity: 0.85 }}>
        {index + 1}
      </div>

      {/* DRAG HANDLE */}
      <div className="shrink-0 flex flex-col gap-1 pt-2 opacity-40 group-hover:opacity-80 transition">
        {[1,2,3].map(i => <div key={i} className="w-5 h-0.5 bg-gray-400 rounded" />)}
      </div>

      {/* POSTER */}
      <img src={poster} alt={item.title}
        className="w-16 h-24 object-cover rounded-lg shrink-0 cursor-pointer hover:opacity-80 transition"
        onError={e=>{e.target.onerror=null;e.target.src=noPoster;}}
        onClick={() => navigate(`/details/${item.media_type}/${itemId}`)} />

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white cursor-pointer hover:underline line-clamp-1"
            onClick={() => navigate(`/details/${item.media_type}/${itemId}`)}>
          {item.title}
        </h3>

        <div className="flex gap-3 mt-1 text-sm text-gray-400 flex-wrap">
          {year && <span>{year}</span>}
          {item.vote_average > 0 && (
            <span style={{ color: GOLD }}>★ {Number(item.vote_average).toFixed(1)}</span>
          )}
          <span className="uppercase text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ backgroundColor: GOLD, color: "#000" }}>
            {item.media_type === "tv" ? "Series" : "Movie"}
          </span>
        </div>

        {/* NOTE */}
        {editingNote === itemId ? (
          <div className="mt-2">
            <input autoFocus type="text" defaultValue={item.note}
              placeholder="Add a note..."
              className="w-full bg-neutral-700 text-white text-sm px-3 py-1.5 rounded-lg outline-none border border-neutral-600 focus:border-yellow-400"
              onBlur={e => { onNoteChange(itemId, e.target.value); setEditingNote(null); }}
              onKeyDown={e => {
                if (e.key === "Enter") { onNoteChange(itemId, e.target.value); setEditingNote(null); }
                if (e.key === "Escape") setEditingNote(null);
              }} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500 cursor-pointer hover:text-yellow-400 transition line-clamp-1"
             onClick={() => setEditingNote(itemId)}>
            {item.note ? `📝 ${item.note}` : "+ Add note..."}
          </p>
        )}
      </div>

      {/* REMOVE */}
      <button onClick={() => onRemove(itemId, list)}
        className="shrink-0 text-gray-500 hover:text-red-400 transition text-xl font-bold px-2">
        ✕
      </button>
    </div>
  );
}

function EmptyState({ list, isLoggedIn }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="text-6xl">{list === "movies" ? "🎬" : "📺"}</p>
      <p className="text-xl font-semibold text-gray-300">
        Your {list === "movies" ? "movie" : "series"} list is empty
      </p>
      {isLoggedIn
        ? <p className="text-gray-500 text-sm">Browse and click "+ My List" on any detail page</p>
        : <div className="flex flex-col items-center gap-3 mt-2">
            <p className="text-gray-500 text-sm">Log in to sync your list across devices</p>
            <Link to="/auth"
              className="px-6 py-2 rounded-full font-bold text-sm text-black hover:opacity-90 transition"
              style={{ backgroundColor: GOLD }}>
              Log In / Sign Up
            </Link>
          </div>
      }
    </div>
  );
}

function Watchlist() {
  const { watchlist, removeFromWatchlist, reorderList, updateNote, loading, user } =
    useWatchlistContext();

  const [activeTab,   setActiveTab]   = useState("movies");
  const [editingNote, setEditingNote] = useState(null);
  const navigate = useNavigate();

  const dragIndex  = useRef(null);
  const hoverIndex = useRef(null);

  const items = watchlist[activeTab];

  const handleDragStart = (i)   => { dragIndex.current = i; };
  const handleDragOver  = (i)   => { hoverIndex.current = i; };
  const handleDrop = () => {
    const from = dragIndex.current;
    const to   = hoverIndex.current;
    if (from === null || to === null || from === to) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    reorderList(activeTab, updated);
    dragIndex.current = hoverIndex.current = null;
  };

  const tabClass = (tab) =>
    `px-6 py-2.5 rounded-full font-bold text-sm transition ${
      activeTab === tab ? "text-black" : "text-gray-400 hover:text-white border border-neutral-600"
    }`;

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-gray-400">Loading your list...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
        <h1 className="text-4xl font-bold">My List</h1>
        <span className="ml-2 text-gray-400 text-lg">
          ({watchlist.movies.length + watchlist.series.length} total)
        </span>
      </div>

      {/* SYNC STATUS */}
      <p className="text-xs mb-8 ml-5" style={{ color: user ? "#1D9E75" : "#888" }}>
        {user ? `✓ Synced to cloud · ${user.email}` : "⚠ Not logged in — saved locally only"}
      </p>

      {/* TABS */}
      <div className="flex gap-3 mb-8">
        <button className={tabClass("movies")}
          style={activeTab==="movies" ? {backgroundColor:GOLD} : {}}
          onClick={() => setActiveTab("movies")}>
          🎬 Movies ({watchlist.movies.length})
        </button>
        <button className={tabClass("series")}
          style={activeTab==="series" ? {backgroundColor:GOLD} : {}}
          onClick={() => setActiveTab("series")}>
          📺 Series ({watchlist.series.length})
        </button>
      </div>

      {/* DRAG HINT */}
      {items.length > 1 && (
        <p className="text-gray-500 text-sm mb-4">☰ Drag items to reorder your ranking</p>
      )}

      {/* LIST */}
      {items.length === 0
        ? <EmptyState list={activeTab} isLoggedIn={!!user} />
        : <div className="max-w-3xl">
            {items.map((item, index) => (
              <WatchlistItem
                key={item.tmdb_id || item.id}
                item={item} index={index} list={activeTab}
                onRemove={removeFromWatchlist}
                onNoteChange={(id, note) => updateNote(id, activeTab, note)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                editingNote={editingNote}
                setEditingNote={setEditingNote}
                navigate={navigate}
              />
            ))}
          </div>
      }

    </div>
  );
}

export default Watchlist;
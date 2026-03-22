import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

function ListDetailPage() {
  const { slug }   = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [list,     setList]     = useState(null);
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [copyMsg,  setCopyMsg]  = useState("");
  const [notFound, setNotFound] = useState(false);
  const [editNote, setEditNote] = useState(null); // item id being edited

  // Drag state
  const dragIndex  = useRef(null);
  const hoverIndex = useRef(null);

  useEffect(() => { loadList(); }, [slug]);

  const loadList = async () => {
    setLoading(true);
    const { data: listData } = await supabase
      .from("lists").select("*").eq("slug", slug).single();
    if (!listData) { setNotFound(true); setLoading(false); return; }
    setList(listData);
    const { data: itemsData } = await supabase
      .from("list_items").select("*").eq("list_id", listData.id)
      .order("rank", { ascending: true });
    setItems(itemsData || []);
    setLoading(false);
  };

  const removeItem = async (tmdbId) => {
    setItems(prev => prev.filter(i => i.tmdb_id !== tmdbId));
    await supabase.from("list_items").delete()
      .eq("list_id", list.id).eq("tmdb_id", tmdbId);
  };

  // ── DRAG & DROP ──────────────────────────────
  const handleDragStart = (index) => { dragIndex.current = index; };
  const handleDragOver  = (e, index) => { e.preventDefault(); hoverIndex.current = index; };
  const handleDrop      = async () => {
    const from = dragIndex.current;
    const to   = hoverIndex.current;
    if (from === null || to === null || from === to) return;

    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    // Update ranks
    const withRanks = updated.map((item, i) => ({ ...item, rank: i + 1 }));
    setItems(withRanks);

    dragIndex.current = hoverIndex.current = null;

    // Save to Supabase
    await Promise.all(
      withRanks.map(item =>
        supabase.from("list_items").update({ rank: item.rank })
          .eq("list_id", list.id).eq("tmdb_id", item.tmdb_id)
      )
    );
  };

  // ── NOTES ────────────────────────────────────
  const saveNote = async (itemId, tmdbId, note) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, note } : i));
    setEditNote(null);
    await supabase.from("list_items").update({ note })
      .eq("list_id", list.id).eq("tmdb_id", tmdbId);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const goTo = (item) => {
    navigate(`/details/${item.media_type}/${item.tmdb_id}`);
    window.scrollTo({ top: 0 });
  };

  const isOwner = user && list && user.id === list.user_id;

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-gray-400">Loading list...</div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">📋</p>
      <p className="text-xl font-bold text-white">List not found</p>
      <Link to="/lists" style={{ color: GOLD }} className="text-sm hover:underline">← Back to My Lists</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="mb-8">
        <Link to="/lists" className="text-xs text-gray-500 hover:text-yellow-400 transition mb-4 block">
          ← Back to My Lists
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
              <h1 className="text-4xl font-bold">{list.name}</h1>
            </div>
            {list.description && (
              <p className="text-gray-400 text-sm ml-5 mb-2">{list.description}</p>
            )}
            <p className="text-gray-500 text-xs ml-5">
              {items.length} {items.length === 1 ? "title" : "titles"} ·
              Created {new Date(list.created_at).toLocaleDateString()}
              {list.is_public && " · Public"}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={copyLink}
              className="px-4 py-2 rounded-full text-sm font-bold border border-neutral-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition">
              {copyMsg || "🔗 Share"}
            </button>
          </div>
        </div>
      </div>

      {/* DRAG HINT */}
      {isOwner && items.length > 1 && (
        <p className="text-gray-500 text-xs mb-6 flex items-center gap-2">
          <span>☰</span> Drag items to reorder · Click note to edit
        </p>
      )}

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-5xl">🎬</p>
          <p className="text-xl font-semibold text-gray-300">This list is empty</p>
          <p className="text-gray-500 text-sm">Go to any movie or series and click "Add to List"</p>
          <Link to="/"
            className="px-6 py-2 rounded-full font-bold text-sm text-black mt-2 hover:opacity-90 transition"
            style={{ backgroundColor: GOLD }}>
            Browse Content
          </Link>
        </div>
      )}

      {/* LIST ITEMS — card layout with drag, notes, remove */}
      {items.length > 0 && (
        <div className="max-w-3xl space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={isOwner}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              className="flex items-start gap-4 bg-neutral-800 rounded-xl p-4 transition hover:bg-neutral-750 group"
              style={{ borderLeft: `4px solid ${GOLD}`, cursor: isOwner ? "grab" : "default" }}
            >
              {/* RANK */}
              <div className="text-3xl font-bold shrink-0 w-10 text-center"
                   style={{ color: GOLD, opacity: 0.8 }}>
                {index + 1}
              </div>

              {/* DRAG HANDLE (owner only) */}
              {isOwner && (
                <div className="shrink-0 flex flex-col gap-1 pt-3 opacity-30 group-hover:opacity-70 transition">
                  {[1,2,3].map(i => <div key={i} className="w-4 h-0.5 bg-gray-400 rounded" />)}
                </div>
              )}

              {/* POSTER */}
              <img
                src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                alt={item.title}
                className="w-14 h-20 object-cover rounded-lg shrink-0 cursor-pointer hover:opacity-80 transition"
                onClick={() => goTo(item)}
                onError={e=>{e.target.onerror=null;e.target.src=noPoster;}}
              />

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-white cursor-pointer hover:underline line-clamp-1 text-sm"
                  onClick={() => goTo(item)}>
                  {item.title}
                </h3>

                <span className="text-xs px-2 py-0.5 rounded font-bold mt-1 inline-block"
                      style={{ backgroundColor: GOLD, color: "#000" }}>
                  {item.media_type === "tv" ? "Series" : "Movie"}
                </span>

                {/* NOTE */}
                {isOwner ? (
                  editNote === item.id ? (
                    <div className="mt-2">
                      <input
                        autoFocus
                        type="text"
                        defaultValue={item.note || ""}
                        placeholder="Add a note..."
                        className="w-full bg-neutral-700 text-white text-xs px-3 py-2 rounded-lg outline-none border border-neutral-600 focus:border-yellow-400 transition"
                        onBlur={e => saveNote(item.id, item.tmdb_id, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveNote(item.id, item.tmdb_id, e.target.value);
                          if (e.key === "Escape") setEditNote(null);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Press Enter to save · Esc to cancel</p>
                    </div>
                  ) : (
                    <p
                      className="mt-2 text-xs cursor-pointer hover:text-yellow-400 transition line-clamp-2"
                      style={{ color: item.note ? "#aaa" : "#555" }}
                      onClick={() => setEditNote(item.id)}>
                      {item.note ? `📝 ${item.note}` : "+ Add note..."}
                    </p>
                  )
                ) : (
                  item.note && (
                    <p className="mt-2 text-xs text-gray-400 line-clamp-2">📝 {item.note}</p>
                  )
                )}
              </div>

              {/* REMOVE (owner only) */}
              {isOwner && (
                <button
                  onClick={() => removeItem(item.tmdb_id)}
                  className="shrink-0 text-gray-600 hover:text-red-400 transition text-lg font-bold px-1 pt-1">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListDetailPage;
// ─────────────────────────────────────────────
//  ListDetailPage — view a single list
//  Shows all movies/series in the list
//  Accessible via /list/:slug
// ─────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w342";

function ListDetailPage() {
  const { slug }    = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [list,      setList]      = useState(null);
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [copyMsg,   setCopyMsg]   = useState("");
  const [notFound,  setNotFound]  = useState(false);

  useEffect(() => {
    loadList();
  }, [slug]);

  const loadList = async () => {
    setLoading(true);

    // Load the list
    const { data: listData } = await supabase
      .from("lists")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!listData) { setNotFound(true); setLoading(false); return; }
    setList(listData);

    // Load items
    const { data: itemsData } = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", listData.id)
      .order("rank", { ascending: true });

    setItems(itemsData || []);
    setLoading(false);
  };

  const removeItem = async (tmdbId) => {
    setItems(prev => prev.filter(i => i.tmdb_id !== tmdbId));
    await supabase.from("list_items")
      .delete()
      .eq("list_id", list.id)
      .eq("tmdb_id", tmdbId);
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
      <Link to="/lists" style={{ color: GOLD }} className="text-sm hover:underline">
        ← Back to My Lists
      </Link>
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

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button onClick={copyLink}
              className="px-4 py-2 rounded-full text-sm font-bold border border-neutral-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition">
              {copyMsg || "🔗 Share"}
            </button>
            {isOwner && (
              <Link to="/lists"
                className="px-4 py-2 rounded-full text-sm font-bold border border-neutral-600 text-gray-300 hover:border-yellow-400 transition">
                Manage Lists
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-5xl">🎬</p>
          <p className="text-xl font-semibold text-gray-300">This list is empty</p>
          <p className="text-gray-500 text-sm">
            Go to any movie or series detail page and click "Add to List"
          </p>
          <Link to="/"
            className="px-6 py-2 rounded-full font-bold text-sm text-black mt-2 hover:opacity-90 transition"
            style={{ backgroundColor: GOLD }}>
            Browse Content
          </Link>
        </div>
      )}

      {/* ITEMS GRID */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item, index) => (
            <div key={item.id} className="group">
              <div className="relative overflow-hidden rounded-xl cursor-pointer"
                   onClick={() => goTo(item)}>
                <img
                  src={item.poster_path ? `${IMG}${item.poster_path}` : noPoster}
                  alt={item.title} loading="lazy"
                  className="w-full h-auto object-cover transition duration-300 group-hover:scale-105"
                  onError={e=>{e.target.onerror=null;e.target.src=noPoster;}}
                />
                {/* RANK BADGE */}
                <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: GOLD, color: "#000" }}>
                  #{index + 1}
                </span>
                {/* TYPE BADGE */}
                <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded bg-black/70">
                  {item.media_type === "tv" ? "Series" : "Movie"}
                </span>
                {/* REMOVE BUTTON (owner only) */}
                {isOwner && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.tmdb_id); }}
                    className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-red-600/80 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-500">
                    ✕
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold line-clamp-2 cursor-pointer group-hover:text-yellow-400 transition"
                 onClick={() => goTo(item)}>
                {item.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListDetailPage;
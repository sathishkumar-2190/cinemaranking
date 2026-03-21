// ─────────────────────────────────────────────
//  TMDB Lists — create, manage, share lists
//  Stores lists in Supabase (no TMDB auth needed)
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import noPoster from "../assets/no-poster.png";

const GOLD = "#F5C518";
const IMG  = "https://image.tmdb.org/t/p/w185";

function ListsPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [lists,     setLists]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [newName,   setNewName]   = useState("");
  const [newDesc,   setNewDesc]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [copyMsg,   setCopyMsg]   = useState("");

  useEffect(() => {
    if (user) loadLists();
  }, [user]);

  const loadLists = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lists")
      .select("*, list_items(count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setLists(data || []);
    setLoading(false);
  };

  const createList = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const slug = newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { data, error } = await supabase
      .from("lists")
      .insert({
        user_id:     user.id,
        name:        newName.trim(),
        description: newDesc.trim(),
        slug:        `${slug}-${Date.now()}`,
        is_public:   true,
      })
      .select()
      .single();

    if (!error && data) {
      setLists(prev => [data, ...prev]);
      setNewName(""); setNewDesc(""); setCreating(false);
    }
    setSaving(false);
  };

  const deleteList = async (listId) => {
    await supabase.from("list_items").delete().eq("list_id", listId);
    await supabase.from("lists").delete().eq("id", listId).eq("user_id", user.id);
    setLists(prev => prev.filter(l => l.id !== listId));
  };

  const copyShareLink = (slug) => {
    const url = `${window.location.origin}/list/${slug}`;
    navigator.clipboard.writeText(url);
    setCopyMsg(slug);
    setTimeout(() => setCopyMsg(""), 2000);
  };

  if (!user) return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl">📋</div>
      <h2 className="text-2xl font-bold text-white">My Lists</h2>
      <p className="text-gray-400 text-sm">Log in to create and share curated lists</p>
      <Link to="/auth"
        className="px-8 py-3 rounded-full font-bold text-sm text-black hover:opacity-90"
        style={{ backgroundColor: GOLD }}>Log In</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 rounded" style={{ backgroundColor: GOLD }} />
          <h1 className="text-4xl font-bold">My Lists</h1>
        </div>
        <button onClick={() => setCreating(true)}
          className="px-6 py-2.5 rounded-full font-bold text-sm text-black hover:opacity-90 transition"
          style={{ backgroundColor: GOLD }}>
          + Create New List
        </button>
      </div>

      {/* CREATE FORM */}
      {creating && (
        <div className="bg-neutral-800 rounded-2xl p-6 mb-8 max-w-lg">
          <h2 className="text-lg font-bold mb-4" style={{ color: GOLD }}>New List</h2>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="List name (e.g. Best Tamil Films)"
            className="w-full bg-neutral-700 text-white px-4 py-3 rounded-xl border border-neutral-600 focus:border-yellow-400 outline-none text-sm mb-3" />
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-neutral-700 text-white px-4 py-3 rounded-xl border border-neutral-600 focus:border-yellow-400 outline-none text-sm resize-none mb-4" />
          <div className="flex gap-3">
            <button onClick={createList} disabled={saving || !newName.trim()}
              className="px-6 py-2 rounded-full font-bold text-sm text-black disabled:opacity-50 hover:opacity-90 transition"
              style={{ backgroundColor: GOLD }}>
              {saving ? "Creating..." : "Create"}
            </button>
            <button onClick={() => { setCreating(false); setNewName(""); setNewDesc(""); }}
              className="px-6 py-2 rounded-full font-bold text-sm border border-neutral-600 text-gray-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* LISTS */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="h-24 bg-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-5xl">📋</p>
          <p className="text-xl font-semibold text-gray-300">No lists yet</p>
          <p className="text-gray-500 text-sm">Create a list to curate and share your favourites</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {lists.map(list => (
            <div key={list.id} className="bg-neutral-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0 cursor-pointer"
                   onClick={() => navigate(`/list/${list.slug}`)}>
                <h3 className="font-bold text-white hover:text-yellow-400 transition">{list.name}</h3>
                {list.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{list.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {list.list_items?.[0]?.count || 0} items · {new Date(list.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {/* SHARE */}
                <button onClick={() => copyShareLink(list.slug)}
                  className="text-xs px-3 py-1.5 rounded-full border border-neutral-600 text-gray-400 hover:text-white hover:border-yellow-400 transition">
                  {copyMsg === list.slug ? "Copied! ✓" : "Share 🔗"}
                </button>
                {/* DELETE */}
                <button onClick={() => deleteList(list.id)}
                  className="text-xs px-3 py-1.5 rounded-full border border-red-800 text-red-400 hover:bg-red-500 hover:text-white transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListsPage;
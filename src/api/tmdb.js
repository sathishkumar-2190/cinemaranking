// ─────────────────────────────────────────────
//  Frontend TMDB API — calls YOUR server now
//  The TMDB token lives on the server only
//  Server must be running: cd server && npm run dev
// ─────────────────────────────────────────────

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const get = async (endpoint) => {
  try {
    const res = await fetch(`${API}${endpoint}`);
    if (!res.ok) { console.error(`API error ${res.status}: ${endpoint}`); return null; }
    return await res.json();
  } catch (err) {
    console.error("Network error:", err);
    return null;
  }
};

/* ── TRENDING ── */
export const fetchTrendingMovies = async () => {
  const d = await get("/tmdb/trending/movies");
  return (d?.results||[]).map(m=>({...m,media_type:"movie"}));
};
export const fetchTrendingSeries = async () => {
  const d = await get("/tmdb/trending/series");
  return (d?.results||[]).map(s=>({...s,media_type:"tv"}));
};
export const fetchTrendingAll = async () => {
  const d = await get("/tmdb/trending/all");
  return d?.results || [];
};

/* ── MOVIES ── */
export const fetchPopularMovies = async () => {
  const d = await get("/tmdb/movies/popular");
  return (d?.results||[]).map(m=>({...m,media_type:"movie"}));
};
export const fetchTopRatedMovies = async () => {
  const d = await get("/tmdb/movies/top-rated");
  return (d?.results||[]).map(m=>({...m,media_type:"movie"}));
};
export const fetchNowPlayingMovies = async () => {
  const d = await get("/tmdb/movies/now-playing");
  return (d?.results||[]).map(m=>({...m,media_type:"movie"}));
};
export const fetchUpcomingMovies = async () => {
  const d = await get("/tmdb/movies/upcoming");
  return (d?.results||[]).map(m=>({...m,media_type:"movie"}));
};

/* ── SERIES ── */
export const fetchPopularSeries = async () => {
  const d = await get("/tmdb/series/popular");
  return (d?.results||[]).map(s=>({...s,media_type:"tv"}));
};
export const fetchTopRatedSeries = async () => {
  const d = await get("/tmdb/series/top-rated");
  return (d?.results||[]).map(s=>({...s,media_type:"tv"}));
};
export const fetchAiringTodaySeries = async () => {
  const d = await get("/tmdb/series/airing-today");
  return (d?.results||[]).map(s=>({...s,media_type:"tv"}));
};

/* ── DETAILS ── */
export const fetchMovieDetails = async (id, mediaType="movie") => {
  const d = await get(`/tmdb/details/${mediaType}/${id}`);
  return d||null;
};
export const fetchTrailer = async (id, mediaType="movie") => {
  const d = await get(`/tmdb/details/${mediaType}/${id}/videos`);
  const t = d?.results?.find(v=>v.site==="YouTube"&&(v.type==="Trailer"||v.type==="Teaser"));
  return t?t.key:null;
};
export const fetchCredits = async (id, mediaType="movie") => {
  const d = await get(`/tmdb/details/${mediaType}/${id}/credits`);
  return d?.cast||[];
};
export const fetchSimilar = async (id, mediaType="movie") => {
  const d = await get(`/tmdb/details/${mediaType}/${id}/similar`);
  return (d?.results||[]).map(i=>({...i,media_type:mediaType}));
};
export const fetchSeasonDetails = async (tvId, seasonNumber) => {
  return get(`/tmdb/tv/${tvId}/season/${seasonNumber}`);
};

/* ── PERSON ── */
export const fetchPersonDetails = async (personId) => {
  return get(`/tmdb/person/${personId}`);
};

/* ── SEARCH ── */
export const searchMulti = async (query) => {
  const d = await get(`/tmdb/search?q=${encodeURIComponent(query)}`);
  return d?.results||[];
};
export const searchKeywords = async (query) => {
  const d = await get(`/tmdb/search/keywords?q=${encodeURIComponent(query)}`);
  return d?.results||[];
};

/* ── DISCOVER ── */
export const discoverMovies = async (params={}) => {
  const q = new URLSearchParams(params).toString();
  const d = await get(`/tmdb/discover/movie?${q}`);
  return {
    results: (d?.results||[]).map(m=>({...m,media_type:"movie"})),
    total_pages: Math.min(d?.total_pages||1,20),
  };
};
export const discoverSeries = async (params={}) => {
  const q = new URLSearchParams(params).toString();
  const d = await get(`/tmdb/discover/tv?${q}`);
  return {
    results: (d?.results||[]).map(s=>({...s,media_type:"tv"})),
    total_pages: Math.min(d?.total_pages||1,20),
  };
};

/* ── GENRES ── */
export const fetchMoviesByGenre = async (genreId) => {
  const d = await get(`/tmdb/discover/movie?genre=${genreId}&sort=popularity.desc`);
  return (d?.results||[]).map(m=>({...m,media_type:"movie"}));
};
export const fetchSeriesByGenre = async (genreId) => {
  const d = await get(`/tmdb/discover/tv?genre=${genreId}&sort=popularity.desc`);
  return (d?.results||[]).map(s=>({...s,media_type:"tv"}));
};

/* ── KEYWORDS ── */
export const fetchByKeyword = async (keywordId, mediaType="movie") => {
  const d = await get(`/tmdb/discover/${mediaType}?keyword=${keywordId}`);
  return (d?.results||[]).map(i=>({...i,media_type:mediaType}));
};

/* ── COLLECTION ── */
export const fetchCollection = async (collectionId) => {
  return get(`/tmdb/collection/${collectionId}`);
};

/* ── RANKINGS ── */
export const fetchTopRatedMoviesRanking = async (page=1) => {
  const d = await get(`/tmdb/rankings/movie?page=${page}`);
  return {
    results: (d?.results||[]).map(m=>({...m,media_type:"movie"})),
    total_pages: d?.total_pages||1,
  };
};
export const fetchTopRatedSeriesRanking = async (page=1) => {
  const d = await get(`/tmdb/rankings/tv?page=${page}`);
  return {
    results: (d?.results||[]).map(s=>({...s,media_type:"tv"})),
    total_pages: d?.total_pages||1,
  };
};

/* ── UPCOMING ── */
export const fetchUpcomingMoviesPaged = async (page=1) => {
  const d = await get(`/tmdb/movies/upcoming?page=${page}`);
  return {
    results: (d?.results||[]).map(m=>({...m,media_type:"movie"})),
    total_pages: Math.min(d?.total_pages||1,10),
    dates: d?.dates,
  };
};
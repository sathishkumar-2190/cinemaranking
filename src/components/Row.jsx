import { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

function Row({ title, fetchFunction }) {
  const [items,   setItems]   = useState([]);
  const [visible, setVisible] = useState(false);
  const rowRef    = useRef(null);
  const fetchRef  = useRef(fetchFunction);

  // Lazy load — only fetch when row scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    fetchRef.current().then(data => { if (!cancelled) setItems(data || []); });
    return () => { cancelled = true; };
  }, [visible]);

  return (
    <div ref={rowRef} className="mb-10">
      {/* SECTION HEADER */}
      <div className="px-6 md:px-10 mb-4 flex items-center justify-between">
        <h2 className="section-title text-base md:text-lg">{title}</h2>
        <div className="gold-divider flex-1 ml-4 opacity-30" />
      </div>

      {/* CARDS ROW */}
      <div className="row-scroll px-6 md:px-10">
        {items.length === 0
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, index) => (
              <MovieCard key={item.id} movie={item} rank={index + 1} />
            ))
        }
      </div>
    </div>
  );
}

export default Row;

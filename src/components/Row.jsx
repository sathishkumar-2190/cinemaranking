import { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

// Rows only fetch when they scroll into view
// This cuts Home page from 20+ simultaneous calls → 4 on load
function Row({ title, fetchFunction }) {
  const [items,   setItems]   = useState([]);
  const [visible, setVisible] = useState(false);
  const rowRef   = useRef(null);
  const fetchRef = useRef(fetchFunction);

  // Watch for when this row enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only trigger once
        }
      },
      { rootMargin: "200px" } // start loading 200px before visible
    );

    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch only when row becomes visible
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    fetchRef.current().then(data => {
      if (!cancelled) setItems(data || []);
    });

    return () => { cancelled = true; };
  }, [visible]);

  return (
    <div ref={rowRef} className="px-6 md:px-12 mb-10">
      <h2 className="text-xl font-bold mb-4" style={{ color: "#F5C518" }}>
        {title}
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4">
        {/* Show skeletons until row is visible AND data has loaded */}
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

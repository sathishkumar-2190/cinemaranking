function SkeletonCard() {
  return (
    <div className="min-w-[180px] animate-pulse">
      <div className="bg-neutral-700 h-[270px] rounded-lg"></div>
      <div className="bg-neutral-700 h-4 mt-3 rounded w-3/4"></div>
    </div>
  );
}

export default SkeletonCard;
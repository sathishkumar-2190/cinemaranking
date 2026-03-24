function SkeletonCard() {
  return (
    <div style={{ width: "160px", flexShrink: 0 }}>
      <div className="skeleton rounded-xl" style={{ width: "160px", aspectRatio: "2/3" }} />
      <div className="skeleton rounded mt-2" style={{ height: "12px", width: "80%" }} />
      <div className="skeleton rounded mt-1" style={{ height: "10px", width: "50%" }} />
    </div>
  );
}

export default SkeletonCard;
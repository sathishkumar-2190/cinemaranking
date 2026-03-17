function TrailerModal({ videoKey, onClose }) {
  if (!videoKey) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-white text-3xl"
      >
        ✕
      </button>

      {/* YOUTUBE PLAYER */}
      <iframe
        className="w-[90%] md:w-[70%] h-[60vh] rounded-lg"
        src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
        title="Trailer"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  );
}

export default TrailerModal;
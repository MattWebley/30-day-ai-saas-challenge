import { useState } from "react";
import { Play } from "lucide-react";

interface LazyLoomProps {
  videoId: string;
  thumbnailUrl?: string;
  title?: string;
}

export function LazyLoom({ videoId, thumbnailUrl, title = "Video" }: LazyLoomProps) {
  const [loaded, setLoaded] = useState(false);

  const embedUrl = `https://www.loom.com/embed/${videoId}`;
  const thumbnail = thumbnailUrl || `https://cdn.loom.com/sessions/thumbnails/${videoId}-with-play.gif`;

  if (loaded) {
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        frameBorder="0"
        allowFullScreen
        title={title}
      />
    );
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      className="w-full h-full relative group cursor-pointer bg-slate-900"
      aria-label={`Play ${title}`}
    >
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
          <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
        </div>
      </div>
    </button>
  );
}

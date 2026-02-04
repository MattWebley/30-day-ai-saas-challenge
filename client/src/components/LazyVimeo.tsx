import { useState } from "react";
import { Play } from "lucide-react";

interface LazyVimeoProps {
  videoId: string;
  hash?: string;
  title?: string;
}

export function LazyVimeo({ videoId, hash, title = "Video" }: LazyVimeoProps) {
  const [loaded, setLoaded] = useState(false);

  const thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`;
  const embedUrl = hash
    ? `https://player.vimeo.com/video/${videoId}?h=${hash}&autoplay=1&title=0&byline=0&portrait=0`
    : `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;

  if (loaded) {
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
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
        src={thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
          <Play className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" />
        </div>
      </div>
    </button>
  );
}

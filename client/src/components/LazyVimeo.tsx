import { useState } from "react";
import { Play } from "lucide-react";

interface LazyVimeoProps {
  videoId: string;
  hash?: string;
  title?: string;
  thumbnail?: string;
  overlayText?: string;
  autoplay?: boolean;
}

export function LazyVimeo({ videoId, hash, title = "Video", thumbnail, overlayText, autoplay = false }: LazyVimeoProps) {
  const [loaded, setLoaded] = useState(autoplay);

  const thumbnailUrl = thumbnail || `https://vumbnail.com/${videoId}.jpg`;
  // Note: muted=0 attempts unmuted playback, but browsers may still enforce muting for autoplay
  const embedUrl = hash
    ? `https://player.vimeo.com/video/${videoId}?h=${hash}&autoplay=1&muted=0&title=0&byline=0&portrait=0`
    : `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&title=0&byline=0&portrait=0`;

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
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-4">
        {overlayText && (
          <div className="text-white text-xl md:text-2xl font-bold text-center px-4 drop-shadow-lg">
            {overlayText}
          </div>
        )}
        <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
          <Play className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" />
        </div>
        {!overlayText && (
          <div className="text-white text-sm font-medium opacity-80">
            Click to play
          </div>
        )}
      </div>
    </button>
  );
}

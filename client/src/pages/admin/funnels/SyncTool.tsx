import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Pause, RotateCcw, Check, Timer } from "lucide-react";
import { toast } from "sonner";
import type { FunnelModuleVariant, FunnelSlide } from "./funnelTypes";
import { useQuery } from "@tanstack/react-query";

interface Props {
  variantId: number;
  onDone: () => void;
}

export default function SyncTool({ variantId, onDone }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [nextSlideIdx, setNextSlideIdx] = useState(0);
  const [timestamps, setTimestamps] = useState<Map<number, number>>(new Map());

  // Fetch variant with slides
  const { data: variant } = useQuery<FunnelModuleVariant>({
    queryKey: [`/api/admin/funnels/variants/${variantId}`],
    queryFn: async () => {
      // We need to get variant data - fetch from the variant endpoint or reconstruct
      // For simplicity, we'll fetch slides separately
      const res = await fetch(`/api/admin/funnels/variants/${variantId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: false, // We use slides from parent
  });

  // Get slides for this variant - fetch all slides
  const { data: slides = [] } = useQuery<FunnelSlide[]>({
    queryKey: [`/api/admin/funnels/variant-slides/${variantId}`],
    queryFn: async () => {
      // We need a way to get slides for a variant. We'll use the presentation full endpoint
      // For now, let's add a simple endpoint or just look for existing timestamps
      // Actually, slides are already available through the parent. Let's use a direct fetch
      const res = await fetch(`/api/admin/funnels/variants/${variantId}`, { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.slides || [];
    },
  });

  // Initialize timestamps from existing slide data
  useEffect(() => {
    const map = new Map<number, number>();
    slides.forEach(s => {
      if (s.startTimeMs > 0) map.set(s.id, s.startTimeMs);
    });
    // First slide always starts at 0
    if (slides.length > 0 && !map.has(slides[0].id)) {
      map.set(slides[0].id, 0);
    }
    setTimestamps(map);
    setNextSlideIdx(map.size);
  }, [slides]);

  // Update current time during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const interval = setInterval(() => {
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime * 1000); // convert to ms
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const markSlide = () => {
    if (nextSlideIdx >= slides.length) return;
    const slide = slides[nextSlideIdx];
    const timeMs = nextSlideIdx === 0 ? 0 : Math.round(currentTime);
    const newTimestamps = new Map(timestamps);
    newTimestamps.set(slide.id, timeMs);
    setTimestamps(newTimestamps);
    setNextSlideIdx(nextSlideIdx + 1);
  };

  const resetSync = () => {
    setTimestamps(new Map());
    setNextSlideIdx(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentTime(0);
  };

  const saveSync = useMutation({
    mutationFn: async () => {
      const slideUpdates = Array.from(timestamps.entries()).map(([id, startTimeMs]) => ({
        id, startTimeMs,
      }));
      await apiRequest("PUT", "/api/admin/funnels/slides/bulk-sync", { slides: slideUpdates });
    },
    onSuccess: () => {
      toast.success("Slide timestamps saved!");
      onDone();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const frac = Math.floor((ms % 1000) / 100);
    return `${m}:${sec.toString().padStart(2, '0')}.${frac}`;
  };

  const audioUrl = slides.length > 0 ? undefined : undefined; // We'd need the variant's audio URL
  // Since we don't have the variant data loaded separately, we'll show a URL input
  const [manualAudioUrl, setManualAudioUrl] = useState("");

  return (
    <Card className="p-6 border-2 border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <Timer className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-slate-900">Slide Sync Tool</h3>
      </div>

      <p className="text-slate-600 mb-4">
        Play the audio and tap "Mark" when each new slide should appear. The first slide automatically starts at 0:00.
      </p>

      {/* Audio URL input (if not auto-loaded) */}
      <div className="mb-4">
        <label className="text-sm text-slate-700 font-medium">Audio URL</label>
        <input
          type="text"
          value={manualAudioUrl}
          onChange={(e) => setManualAudioUrl(e.target.value)}
          placeholder="Paste audio file URL..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 mt-1"
        />
      </div>

      {/* Audio Player */}
      {manualAudioUrl && (
        <audio ref={audioRef} src={manualAudioUrl} preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <Button
          size="lg"
          variant={isPlaying ? "outline" : "default"}
          onClick={togglePlay}
          disabled={!manualAudioUrl}
          title={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
          {formatTime(currentTime)}
        </div>

        <Button
          size="lg"
          onClick={markSlide}
          disabled={nextSlideIdx >= slides.length}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
          title="Mark current time as start of next slide"
        >
          Mark Slide {nextSlideIdx + 1}
        </Button>

        <Button size="sm" variant="ghost" onClick={resetSync} title="Reset all timestamps">
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
      </div>

      {/* Slide List with timestamps */}
      <div className="space-y-1 mb-6">
        {slides.map((slide, idx) => {
          const ts = timestamps.get(slide.id);
          const isSynced = ts !== undefined;
          const isNext = idx === nextSlideIdx;

          return (
            <div
              key={slide.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                isNext ? 'bg-blue-50 border border-blue-200' :
                isSynced ? 'bg-green-50 border border-green-200' :
                'bg-white border border-slate-100'
              }`}
            >
              <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
              {isSynced ? (
                <span className="text-xs font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded w-16 text-center">
                  {formatTime(ts!)}
                </span>
              ) : (
                <span className="text-xs text-slate-400 w-16 text-center">—</span>
              )}
              <span className="text-sm text-slate-700 flex-1 truncate">
                {slide.headline || slide.body || "(empty)"}
              </span>
              {isSynced && <Check className="w-4 h-4 text-green-500" />}
              {isNext && <span className="text-xs text-blue-600 font-medium">Next →</span>}
            </div>
          );
        })}
      </div>

      {/* Manual timestamp edit */}
      {timestamps.size > 0 && (
        <details className="mb-4">
          <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
            Edit timestamps manually
          </summary>
          <div className="mt-2 space-y-1">
            {slides.map((slide, idx) => {
              const ts = timestamps.get(slide.id);
              return (
                <div key={slide.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16">Slide {idx + 1}:</span>
                  <input
                    type="number"
                    value={ts ?? ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        const newTs = new Map(timestamps);
                        newTs.set(slide.id, val);
                        setTimestamps(newTs);
                      }
                    }}
                    className="w-24 px-2 py-1 text-xs border border-slate-300 rounded"
                    placeholder="ms"
                  />
                  <span className="text-xs text-slate-400">ms</span>
                  {ts !== undefined && <span className="text-xs text-slate-400">({formatTime(ts)})</span>}
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* Save */}
      <Button
        onClick={() => saveSync.mutate()}
        disabled={timestamps.size === 0 || saveSync.isPending}
        className="w-full"
        title="Save all slide timestamps"
      >
        <Check className="w-4 h-4 mr-1" /> Save All Timestamps ({timestamps.size} slides)
      </Button>
    </Card>
  );
}

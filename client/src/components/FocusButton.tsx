import { useState, useRef, useEffect } from "react";
import { Headphones, ChevronDown, Brain, Zap, Coffee, Sparkles, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

// Different binaural beat modes for various mental states
const BEAT_MODES = [
  {
    id: "focus",
    name: "Focus",
    description: "Active concentration",
    icon: Zap,
    beatFrequency: 14, // Beta - active thinking
    color: "violet",
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    description: "Intense concentration",
    icon: Brain,
    beatFrequency: 20, // High Beta - intense focus
    color: "indigo",
  },
  {
    id: "calm-focus",
    name: "Calm Focus",
    description: "Relaxed alertness",
    icon: Coffee,
    beatFrequency: 10, // Alpha - calm but alert
    color: "sky",
  },
  {
    id: "creative",
    name: "Creative Flow",
    description: "Brainstorming & ideation",
    icon: Sparkles,
    beatFrequency: 6, // Theta - creativity
    color: "amber",
  },
  {
    id: "relaxation",
    name: "Relaxation",
    description: "Stress relief",
    icon: Waves,
    beatFrequency: 8, // Low Alpha - relaxation
    color: "emerald",
  },
];

const BASE_FREQUENCY = 200; // Hz - carrier tone

type BeatMode = typeof BEAT_MODES[number];

export function FocusButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentMode, setCurrentMode] = useState<BeatMode>(BEAT_MODES[0]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopBeats();
    };
  }, []);

  const startBeats = async (mode: BeatMode) => {
    // Stop any existing beats first
    stopBeats();

    setIsLoading(true);
    setCurrentMode(mode);

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Create a gain node for volume control (keep it subtle)
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime); // Low volume
      gainNodeRef.current = gainNode;

      // Create channel merger for stereo output
      const merger = audioContext.createChannelMerger(2);

      // Left channel oscillator (base frequency)
      const oscillatorLeft = audioContext.createOscillator();
      oscillatorLeft.type = "sine";
      oscillatorLeft.frequency.setValueAtTime(BASE_FREQUENCY, audioContext.currentTime);

      // Right channel oscillator (base + beat frequency)
      const oscillatorRight = audioContext.createOscillator();
      oscillatorRight.type = "sine";
      oscillatorRight.frequency.setValueAtTime(
        BASE_FREQUENCY + mode.beatFrequency,
        audioContext.currentTime
      );

      // Create individual gain nodes for each channel
      const gainLeft = audioContext.createGain();
      const gainRight = audioContext.createGain();
      gainLeft.gain.setValueAtTime(1, audioContext.currentTime);
      gainRight.gain.setValueAtTime(1, audioContext.currentTime);

      // Connect left oscillator to left channel (channel 0)
      oscillatorLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0);

      // Connect right oscillator to right channel (channel 1)
      oscillatorRight.connect(gainRight);
      gainRight.connect(merger, 0, 1);

      // Connect merger to main gain and then to output
      merger.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start oscillators
      oscillatorLeft.start();
      oscillatorRight.start();

      oscillatorLeftRef.current = oscillatorLeft;
      oscillatorRightRef.current = oscillatorRight;

      setIsPlaying(true);
      setShowMenu(false);
    } catch (error) {
      console.error("Error starting binaural beats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopBeats = () => {
    try {
      if (oscillatorLeftRef.current) {
        oscillatorLeftRef.current.stop();
        oscillatorLeftRef.current.disconnect();
        oscillatorLeftRef.current = null;
      }
      if (oscillatorRightRef.current) {
        oscillatorRightRef.current.stop();
        oscillatorRightRef.current.disconnect();
        oscillatorRightRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
    setIsPlaying(false);
  };

  const handleButtonClick = () => {
    if (isPlaying) {
      stopBeats();
    } else {
      setShowMenu(!showMenu);
    }
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { bg: string; text: string; hover: string; activeBg: string }> = {
      violet: { bg: "bg-violet-100", text: "text-violet-700", hover: "hover:bg-violet-50", activeBg: "bg-violet-500" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-700", hover: "hover:bg-indigo-50", activeBg: "bg-indigo-500" },
      sky: { bg: "bg-sky-100", text: "text-sky-700", hover: "hover:bg-sky-50", activeBg: "bg-sky-500" },
      amber: { bg: "bg-amber-100", text: "text-amber-700", hover: "hover:bg-amber-50", activeBg: "bg-amber-500" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-700", hover: "hover:bg-emerald-50", activeBg: "bg-emerald-500" },
    };
    return colors[color] || colors.violet;
  };

  const currentColors = getColorClasses(currentMode.color, isPlaying);
  const CurrentIcon = currentMode.icon;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={cn(
          "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          isPlaying
            ? `${currentColors.bg} ${currentColors.text}`
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        )}
        title={isPlaying ? `${currentMode.name} mode active - click to stop` : "Start focus mode (binaural beats) - use headphones"}
      >
        <Headphones className={cn(
          "w-4 h-4 transition-all",
          isPlaying && "animate-pulse"
        )} />
        <span className="hidden sm:inline">
          {isLoading ? "Starting..." : isPlaying ? currentMode.name : "Focus"}
        </span>
        {!isPlaying && (
          <ChevronDown className="w-3 h-3 hidden sm:inline" />
        )}
        {isPlaying && (
          <span className={cn("absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping", currentColors.activeBg)} />
        )}
      </button>

      {/* Dropdown Menu */}
      {showMenu && !isPlaying && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Select Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">Use headphones for best effect</p>
          </div>

          {BEAT_MODES.map((mode) => {
            const colors = getColorClasses(mode.color, false);
            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                onClick={() => startBeats(mode)}
                className={cn(
                  "w-full px-3 py-2.5 flex items-center gap-3 transition-colors",
                  colors.hover
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                  <Icon className={cn("w-4 h-4", colors.text)} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-slate-900 text-sm">{mode.name}</div>
                  <div className="text-xs text-slate-500">{mode.description} • {mode.beatFrequency} Hz</div>
                </div>
              </button>
            );
          })}

          <div className="px-3 py-2 border-t border-slate-100 mt-1">
            <p className="text-xs text-slate-400">
              Binaural beats require stereo headphones to work properly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FocusButton;

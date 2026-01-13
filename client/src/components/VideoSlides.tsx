import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Presentation, ChevronLeft, ChevronRight } from "lucide-react";
import { useTestMode } from "@/contexts/TestModeContext";

interface Slide {
  title: string;
  points: string[];
}

interface VideoSlidesProps {
  day: number;
}

// Slide content for each day - designed for video scripts, not lesson duplicates
const slideContent: Record<number, Slide[]> = {
  0: [
    {
      title: "Welcome to 21 Days",
      points: [
        "This is a BUILD challenge, not a course",
        "21 days from idea → launch-ready product",
        "Show up daily. No skipping. No excuses.",
      ],
    },
    {
      title: "The 4 Rules",
      points: [
        "1. SHOW UP DAILY — consistency beats intensity",
        "2. NEVER BREAK THE CHAIN — your streak matters",
        "3. DONE > PERFECT — ship beats polish",
        "4. NO SKIPPING — each day builds on the last",
      ],
    },
    {
      title: "What You'll Build",
      points: [
        "Days 1-7: Find & plan your winning idea",
        "Days 8-14: Build your product",
        "Days 15-18: Test & refine",
        "Days 19-21: Polish & LAUNCH",
      ],
    },
  ],
  1: [
    {
      title: "Day 1: Find Your Idea",
      points: [
        "The BEST ideas come from what you ALREADY know",
        "Industries where people make REAL MONEY = easier sales",
        "Think NICHE, not broad",
      ],
    },
    {
      title: "The 4-Point Filter",
      points: [
        "PAIN INTENSITY — Is this task hated/frequent/costly?",
        "CASH PROXIMITY — Does it help earn or save money?",
        "SPEED TO MVP — Can you ship in 14 days?",
        "PERSONAL ADVANTAGE — Your knowledge, access, audience?",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Generate 28 personalized ideas using AI",
        "Score each against the 4-point filter",
        "Shortlist your top 3-5 ideas",
        "Don't overthink — trust your gut",
      ],
    },
  ],
  // Add more days as needed...
};

export function VideoSlides({ day }: VideoSlidesProps) {
  const { testMode } = useTestMode();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [open, setOpen] = useState(false);

  // Only show in test mode (admin/dev mode)
  if (!testMode) return null;

  const slides = slideContent[day];
  if (!slides || slides.length === 0) return null;

  const goNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setCurrentSlide(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Presentation className="w-4 h-4" />
          Video Slides
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Day {day} Video Slides
          </DialogTitle>
        </DialogHeader>

        {/* Slide Content */}
        <div className="min-h-[400px] flex flex-col">
          <div className="flex-1 bg-white border-2 border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {slides[currentSlide].title}
            </h2>
            <ul className="space-y-4">
              {slides[currentSlide].points.map((point, i) => (
                <li key={i} className="flex items-start gap-4 text-lg text-slate-700">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Slide Indicators */}
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm">
                {currentSlide + 1} / {slides.length}
              </span>
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentSlide
                        ? "bg-primary"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={currentSlide === slides.length - 1}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Test mode only
        </p>
      </DialogContent>
    </Dialog>
  );
}

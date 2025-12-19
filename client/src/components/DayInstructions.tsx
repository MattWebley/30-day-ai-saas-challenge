import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface DayInstructionsProps {
  day: number;
  outcome?: string;
}

const DAY_INSTRUCTIONS: Record<number, string[]> = {
  1: [
    "Fill in your background (knowledge, skills, interests)",
    "Click 'Generate 28 SaaS Ideas'",
    "Pick your top 3-5 favorite ideas",
    "Click 'Confirm Selection'"
  ],
  2: [
    "Select one of your shortlisted ideas",
    "AI generates 3-5 pain points it solves",
    "Pick the most compelling pain point",
    "Use validation prompts to research the market",
    "Lock in your final idea choice"
  ],
  3: [
    "Define the bleeding neck problem",
    "List core features from competitors",
    "Add your unique USP features",
    "Write your 10-second pitch",
    "Define your ideal customer (ICP)"
  ],
  4: [
    "Review your features and ICP",
    "Generate AI screen recommendations",
    "Confirm your app flow"
  ],
  5: [
    "Review all your features",
    "Categorize: Must Have / Nice to Have / Cut",
    "Pick ONE killer feature for MVP"
  ],
  6: [
    "Read today's lesson",
    "Complete the micro-decision",
    "Write your reflection"
  ],
};

export function DayInstructions({ day, outcome }: DayInstructionsProps) {
  const instructions = DAY_INSTRUCTIONS[day] || DAY_INSTRUCTIONS[6];

  return (
    <Card className="p-4 border-2 border-slate-200 bg-slate-50 mb-6" data-testid="day-instructions">
      <p className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wide">What To Do Today:</p>
      <ol className="space-y-2 mb-4">
        {instructions.map((step, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {outcome && (
        <div className="mt-4 pt-4 border-t border-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-slate-900 mb-1 uppercase tracking-wide">Today's Outcome:</p>
              <p className="text-sm text-slate-700 font-medium">{outcome}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

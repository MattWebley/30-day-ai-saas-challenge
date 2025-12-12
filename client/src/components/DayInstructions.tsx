import { Card } from "@/components/ui/card";

interface DayInstructionsProps {
  day: number;
}

const DAY_INSTRUCTIONS: Record<number, string[]> = {
  1: [
    "Fill in your background (knowledge, skills, interests)",
    "Click 'Generate 28 SaaS Ideas'",
    "Pick your top 3-5 favorite ideas",
    "Click 'Confirm Selection'"
  ],
  2: [
    "Hover over each idea to see full details",
    "Use the prompts to validate each idea",
    "Pick ONE winner to move forward with"
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

export function DayInstructions({ day }: DayInstructionsProps) {
  const instructions = DAY_INSTRUCTIONS[day] || DAY_INSTRUCTIONS[6];
  
  return (
    <Card className="p-4 border-2 border-black bg-white mb-6" data-testid="day-instructions">
      <p className="font-bold text-sm text-black mb-3 uppercase tracking-wide">What To Do Today:</p>
      <ol className="space-y-2">
        {instructions.map((step, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

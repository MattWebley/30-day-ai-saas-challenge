import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface DayInstructionsProps {
  day: number;
  outcome?: string;
}

const DAY_INSTRUCTIONS: Record<number, string[]> = {
  0: [
    "Read the rules for success",
    "Commit to each rule by tapping",
    "Choose your 'why' for building",
    "Set your income goal",
    "Write your accountability promise"
  ],
  1: [
    "Fill in your background (knowledge, skills, interests)",
    "Click 'Generate 28 SaaS Ideas'",
    "Pick your top 3-5 favorite ideas",
    "Click 'Confirm Selection'"
  ],
  2: [
    "Select one of your shortlisted ideas",
    "AI identifies 7-10 prominent pain points (ranked by severity)",
    "Pick up to 3 most compelling pain points",
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
    "Generate AI name suggestions",
    "Pick your favorite name",
    "Register the .com domain",
    "Claim all social media handles"
  ],
  5: [
    "Set up Replit account",
    "Set up Claude Pro account",
    "Set up ChatGPT Plus account",
    "Set up OpenAI API account",
    "Confirm all tools are ready"
  ],
  6: [
    "Review your idea, features, and USP",
    "Generate your PRD with AI",
    "Copy PRD into Replit",
    "Start your first build session"
  ],
  7: [
    "Connect Claude Code to Replit",
    "Set up GitHub repository",
    "Learn the daily workflow",
    "Complete your first build session"
  ],
  8: [
    "Read the lesson on effective prompting",
    "Choose a quick win to build",
    "Build it with Claude Code",
    "Document what you built"
  ],
  9: [
    "Open your PRD from Day 6",
    "Test every feature in your app",
    "Mark each: WORKS / BROKEN / MISSING",
    "Identify your top priority fix"
  ],
  10: [
    "Get your OpenAI API key",
    "Add it to Replit Secrets",
    "Plan ONE AI feature",
    "Build and test it"
  ],
  11: [
    "Check if your app has user authentication",
    "If not: ask Replit to add login/signup",
    "Decide if you need additional APIs",
    "If yes: sign up, get API keys, integrate",
    "Test that everything works"
  ],
  12: [
    "Take a screenshot of your app's current state",
    "Write a 2-sentence summary of where you're at",
    "Share to the community (optional)",
    "Celebrate your progress so far!"
  ],
  13: [
    "Sign up for Resend",
    "Verify your domain",
    "Add API key to Replit Secrets",
    "Send a test welcome email"
  ],
  14: [
    "Set a timer for focused building",
    "Pick ONE focus: features, bugs, or polish",
    "Build without distractions",
    "Use PAUSE if you need more time"
  ],
  15: [
    "Identify your USP feature",
    "Test it end-to-end",
    "Compare to competitors",
    "Answer: Would someone pay for this?"
  ],
  16: [
    "Test every button and form",
    "Try to break things with weird inputs",
    "Document all bugs found",
    "Fix critical issues"
  ],
  17: [
    "Define first user success moment",
    "Build the onboarding path",
    "Time the flow (under 2 mins)",
    "Test as a new user"
  ],
  18: [
    "Decide what metrics to track",
    "Build your admin dashboard",
    "Add user and activity stats",
    "Check your numbers"
  ],
  19: [
    "Open your app on your actual phone",
    "Test all main features on mobile",
    "Document any issues",
    "Fix or note for later"
  ],
  20: [
    "Pick your primary brand color",
    "Apply consistent styling",
    "Add your logo to the header",
    "Verify it looks professional"
  ],
  21: [
    "Run through pre-launch checklist",
    "Fix any blocking issues",
    "Click the LAUNCH button",
    "Celebrate and plan next steps"
  ],
};

export function DayInstructions({ day, outcome }: DayInstructionsProps) {
  const instructions = DAY_INSTRUCTIONS[day] || [
    "Read today's lesson",
    "Complete the interactive exercise",
    "Document your progress"
  ];

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

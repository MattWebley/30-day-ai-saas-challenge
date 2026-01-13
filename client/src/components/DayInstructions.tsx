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
    "Choose your logo style (wordmark, icon+text, or AI-generated)",
    "Open Canva, Midjourney, or Ideogram",
    "Create your logo (30 mins max)",
    "Save as PNG file"
  ],
  6: [
    "Set up Replit account",
    "Set up Claude Pro account",
    "Set up ChatGPT Plus account",
    "Set up OpenAI API account",
    "Confirm all tools are ready"
  ],
  7: [
    "Review your idea, features, and USP",
    "Generate your PRD with AI",
    "Copy PRD into Replit",
    "Start your first build session"
  ],
  8: [
    "Connect Claude Code to Replit",
    "Set up GitHub repository",
    "Learn the daily workflow",
    "Complete your first build session"
  ],
  9: [
    "Read the lesson on effective prompting",
    "Choose a quick win to build",
    "Build it with Claude Code",
    "Document what you built"
  ],
  10: [
    "Learn the Build-Test-Fix workflow",
    "Open your app and find ONE bug",
    "Describe the bug clearly",
    "Fix it with Claude Code",
    "Verify the fix works"
  ],
  11: [
    "Pick your primary brand color",
    "Choose your font",
    "Copy the Claude Code prompt",
    "Apply branding to your app",
    "Verify it looks consistent"
  ],
  12: [
    "Create OpenAI account & add credits",
    "Get your API key (copy it immediately!)",
    "Add key to Replit Secrets",
    "Describe your AI feature",
    "Build and test it with Claude Code"
  ],
  13: [
    "Ask Replit: 'Can you do X without an external API?'",
    "Identify which superpowers your app actually needs",
    "If payments: Set up Stripe",
    "If scraping: Set up Bright Data",
    "Test any APIs you connect"
  ],
  14: [
    "Ask Replit: 'Does my app have user authentication?'",
    "If yes: Test login/logout flow",
    "If no: Add auth with one prompt",
    "Verify each user sees only their own data"
  ],
  15: [
    "Sign up for Resend (free)",
    "Get your API key",
    "Add RESEND_API_KEY to Replit Secrets",
    "Set up your welcome email",
    "Test by signing up with a new account"
  ],
  16: [
    "Open your app on your actual phone",
    "Test all main features on mobile",
    "Document any issues",
    "Fix with Claude Code"
  ],
  17: [
    "Decide what metrics to track",
    "Build your admin dashboard",
    "Add user and activity stats",
    "Check your numbers"
  ],
  18: [
    "THIS IS THE PAUSE POINT",
    "Review the MVP checklist in the lesson",
    "Ask: Does my core feature work perfectly?",
    "Build until your MVP is ready",
    "Submit to the Showcase (screenshot + testimonial)"
  ],
  19: [
    "Set your monthly income goal",
    "Pick your price point ($9-$199/month)",
    "Calculate how many customers you need",
    "Understand the gap between app and business"
  ],
  20: [
    "Pick ONE platform for your launch",
    "Set your launch date (2-4 weeks out)",
    "Review the 4-week launch timeline",
    "Commit to your #1 action for each week"
  ],
  21: [
    "See what turns an app into a business",
    "Understand the four pillars of SaaS",
    "Choose your path forward",
    "Write your commitment statement"
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

import { LucideIcon } from "lucide-react";

export interface DayTask {
  day: number;
  title: string;
  description: string;
  phase: string;
  completed: boolean;
  locked: boolean;
  aiTask?: {
    type: "suggestion" | "template" | "generator" | "setup";
    title: string;
    description: string;
    suggestions?: { title: string; desc: string }[];
    template?: string;
  };
}

export const challengeDays: DayTask[] = [
  // Phase 1: Clarifier (Days 1-7)
  { 
    day: 1, 
    title: "Problems", 
    description: "Identify friction in your daily life or industry. What sucks?", 
    phase: "Clarifier", 
    completed: false, 
    locked: false,
    aiTask: {
      type: "suggestion",
      title: "Problem Generator",
      description: "Based on your interests, here are 3 potential problems to solve:",
      suggestions: [
        { title: "Inefficient Meeting Notes", desc: "Professionals spend too much time transcribing and summarizing calls." },
        { title: "Content Repurposing", desc: "Creators struggle to turn one video into blog posts, tweets, and emails." },
        { title: "Freelance Invoicing", desc: "Chasing payments and creating professional invoices is a hassle for new freelancers." }
      ]
    }
  },
  { 
    day: 2, 
    title: "Money Problems", 
    description: "Filter your problems. Which ones are people actually paying to solve right now?", 
    phase: "Clarifier", 
    completed: false, 
    locked: true 
  },
  { day: 3, title: "Top 3", description: "Narrow it down. Select your best 3 ideas.", phase: "Clarifier", completed: false, locked: true },
  { day: 4, title: "Avatar", description: "Who is this for? Define your dream customer.", phase: "Clarifier", completed: false, locked: true },
  { day: 5, title: "Validation", description: "Quick market check. Is there search volume?", phase: "Clarifier", completed: false, locked: true },
  { day: 6, title: "Idea Lock", description: "Commit to ONE idea for the next 24 days.", phase: "Clarifier", completed: false, locked: true },
  { day: 7, title: "Transformation", description: "Define the 'Before' and 'After' state for your user.", phase: "Clarifier", completed: false, locked: true },
  
  // Phase 2: Blueprint Architect (Days 8-14)
  { day: 8, title: "Dream Features", description: "Brainstorm everything this tool COULD do.", phase: "Blueprint Architect", completed: false, locked: true },
  { day: 9, title: "Core Feature", description: "Kill your darlings. Pick the ONE feature that matters.", phase: "Blueprint Architect", completed: false, locked: true },
  { day: 10, title: "MVP Statement", description: "Write your one-sentence pitch.", phase: "Blueprint Architect", completed: false, locked: true },
  { day: 11, title: "User Flow", description: "Map the steps: Input -> Magic -> Output.", phase: "Blueprint Architect", completed: false, locked: true },
  { day: 12, title: "Sketch", description: "Napkin drawing of the interface.", phase: "Blueprint Architect", completed: false, locked: true },
  { day: 13, title: "Wireframes", description: "Low-fidelity structure of your screens.", phase: "Blueprint Architect", completed: false, locked: true },
  { day: 14, title: "Brand Identity", description: "Name, Domain, Keywords, and UI Theme.", phase: "Blueprint Architect", completed: false, locked: true },

  // Phase 3: Maker Mode (Day 15)
  { 
    day: 15, 
    title: "AUTO SETUP DAY", 
    description: "The Big Bang. Generate Legal, Tech Stack, and Accounts in one click.", 
    phase: "Maker Mode", 
    completed: false, 
    locked: true,
    aiTask: {
      type: "setup",
      title: "One-Click Setup",
      description: "We are generating your Terms, Privacy Policy, and setting up your Replit & OpenAI accounts.",
    }
  },

  // Phase 4: MVP Builder (Days 16-23)
  { day: 16, title: "Input/Output Map", description: "Define exactly what data enters and leaves.", phase: "MVP Builder", completed: false, locked: true },
  { day: 17, title: "Sample Questions", description: "Create dummy input data for testing.", phase: "MVP Builder", completed: false, locked: true },
  { day: 18, title: "Sample Answers", description: "Create dummy output data for testing.", phase: "MVP Builder", completed: false, locked: true },
  { day: 19, title: "Screen 1", description: "Build the Input Interface.", phase: "MVP Builder", completed: false, locked: true },
  { day: 20, title: "Screen 2", description: "Build the Processing/Wait screen.", phase: "MVP Builder", completed: false, locked: true },
  { day: 21, title: "Output Screen", description: "Build the Result Interface.", phase: "MVP Builder", completed: false, locked: true },
  { day: 22, title: "Test MVP", description: "Run through the flow yourself. Does it work?", phase: "MVP Builder", completed: false, locked: true },
  { day: 23, title: "Fix Issues", description: "Squash the bugs you found.", phase: "MVP Builder", completed: false, locked: true },

  // Phase 5: Refinement Specialist (Days 24-27)
  { day: 24, title: "UI Improvement", description: "Make it look professional. Polish the CSS.", phase: "Refinement Specialist", completed: false, locked: true },
  { day: 25, title: "Add Delight", description: "Add micro-interactions and loading states.", phase: "Refinement Specialist", completed: false, locked: true },
  { day: 26, title: "Cleanup", description: "Organize your code and remove unused files.", phase: "Refinement Specialist", completed: false, locked: true },
  { day: 27, title: "Final Polish", description: "One last check before the marketing prep.", phase: "Refinement Specialist", completed: false, locked: true },

  // Phase 6: Product Creator (Days 28-29)
  { day: 28, title: "Landing Page", description: "Build a simple sales page.", phase: "Product Creator", completed: false, locked: true },
  { day: 29, title: "MVP Summary", description: "Package your MVP and generate your certificate.", phase: "Product Creator", completed: false, locked: true },

  // Phase 7: The Finisher (Day 30)
  { day: 30, title: "THE LAUNCH", description: "Book your strategy call and go live.", phase: "The Finisher", completed: false, locked: true },
];

export const badges = [
  { id: 1, name: "Initiator", description: "Day 1 completed", icon: "Rocket", earned: false },
  { id: 2, name: "Clarifier", description: "Days 1-7 completed", icon: "Search", earned: false },
  { id: 3, name: "Blueprint Architect", description: "Days 8-14 completed", icon: "PenTool", earned: false },
  { id: 4, name: "Maker Mode", description: "Auto Setup Day completed", icon: "Zap", earned: false },
  { id: 5, name: "MVP Builder", description: "Days 16-23 completed", icon: "Hammer", earned: false },
  { id: 6, name: "Refinement Specialist", description: "Days 24-27 completed", icon: "Sparkles", earned: false },
  { id: 7, name: "Product Creator", description: "Days 28-29 completed", icon: "Box", earned: false },
  { id: 8, name: "The Finisher", description: "Day 30 completed", icon: "Trophy", earned: false },
  { id: 9, name: "Elite Consistency", description: "No missed days", icon: "Star", earned: false },
];

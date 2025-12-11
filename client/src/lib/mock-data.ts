import { LucideIcon } from "lucide-react";

export interface DayTask {
  day: number;
  title: string;
  description: string;
  phase: string;
  completed: boolean;
  locked: boolean;
}

export const challengeDays: DayTask[] = [
  // Phase 1: Initiation (Days 1-7)
  { day: 1, title: "The Idea Spark", description: "Validate your initial concept", phase: "Initiation", completed: false, locked: false },
  { day: 2, title: "Problem Definition", description: "Who actually cares?", phase: "Initiation", completed: false, locked: true },
  { day: 3, title: "Avatar Creation", description: "Define your dream customer", phase: "Initiation", completed: false, locked: true },
  { day: 4, title: "Transformation", description: "From A to B", phase: "Initiation", completed: false, locked: true },
  { day: 5, title: "Feature Selection", description: "Kill your darlings", phase: "Initiation", completed: false, locked: true },
  { day: 6, title: "The One Sentence", description: "Pitch it simply", phase: "Initiation", completed: false, locked: true },
  { day: 7, title: "User Flow Map", description: "How they get there", phase: "Initiation", completed: false, locked: true },
  
  // Phase 2: Blueprint (Days 8-14)
  { day: 8, title: "Screen Sketching", description: "Napkin drawings", phase: "Blueprint", completed: false, locked: true },
  { day: 9, title: "Wireframing I", description: "Structure first", phase: "Blueprint", completed: false, locked: true },
  { day: 10, title: "Wireframing II", description: "Connecting dots", phase: "Blueprint", completed: false, locked: true },
  { day: 11, title: "UI Style Picker", description: "Make it pop", phase: "Blueprint", completed: false, locked: true },
  { day: 12, title: "Name Generator", description: "Brand identity", phase: "Blueprint", completed: false, locked: true },
  { day: 13, title: "Domain Check", description: "Claim your spot", phase: "Blueprint", completed: false, locked: true },
  { day: 14, title: "Keyword Strategy", description: "Get found", phase: "Blueprint", completed: false, locked: true },

  // Phase 3: Maker Mode (Day 15)
  { day: 15, title: "AUTO SETUP DAY", description: "The Big Bang", phase: "Maker Mode", completed: false, locked: true },

  // Phase 4: MVP Builder (Days 16-23)
  { day: 16, title: "Input/Output Map", description: "Data flow", phase: "MVP Builder", completed: false, locked: true },
  { day: 17, title: "Sample Data", description: "Fake it 'til you make it", phase: "MVP Builder", completed: false, locked: true },
  { day: 18, title: "Screen Builder I", description: "Core Interface", phase: "MVP Builder", completed: false, locked: true },
  { day: 19, title: "Logic Builder", description: "Brain power", phase: "MVP Builder", completed: false, locked: true },
  { day: 20, title: "Output Screen", description: "The result", phase: "MVP Builder", completed: false, locked: true },
  { day: 21, title: "Integration", description: "Connecting APIs", phase: "MVP Builder", completed: false, locked: true },
  { day: 22, title: "Testing", description: "Break it", phase: "MVP Builder", completed: false, locked: true },
  { day: 23, title: "Refinement", description: "Smooth edges", phase: "MVP Builder", completed: false, locked: true },

  // Phase 5: Refinement (Days 24-27)
  { day: 24, title: "Bug Squashing", description: "Fix the cracks", phase: "Refinement", completed: false, locked: true },
  { day: 25, title: "UI Polish", description: "Pixel perfect", phase: "Refinement", completed: false, locked: true },
  { day: 26, title: "Delight Generator", description: "Micro-interactions", phase: "Refinement", completed: false, locked: true },
  { day: 27, title: "Cleanup", description: "Code hygiene", phase: "Refinement", completed: false, locked: true },

  // Phase 6: Launch (Days 28-30)
  { day: 28, title: "Landing Page", description: "Sell the dream", phase: "Launch", completed: false, locked: true },
  { day: 29, title: "Certificate", description: "You did it", phase: "Launch", completed: false, locked: true },
  { day: 30, title: "THE LAUNCH", description: "Go live", phase: "Launch", completed: false, locked: true },
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

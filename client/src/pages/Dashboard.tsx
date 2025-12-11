import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Shuffle, 
  ArrowRight, 
  CheckCircle2, 
  Lightbulb,
  MessageSquare,
  Wand2,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  // Mock Data for Day 1
  const dayData = {
    day: 1,
    title: "The Idea Spark",
    description: "Before we build, we validate. Today is about crystalizing that vague thought in your shower into a concrete concept.",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    aiSuggestions: [
      {
        title: "Micro-SaaS for Dog Walkers",
        desc: "A CRM specifically for managing recurring dog walking schedules and payments."
      },
      {
        title: "AI Email Triage",
        desc: "A plugin that auto-drafts replies based on your past writing style."
      },
      {
        title: "Content Repurposer",
        desc: "Turn a single blog post into 10 tweets and a LinkedIn carousel automatically."
      }
    ]
  };

  const handleComplete = () => {
    setCompleted(true);
    // Trigger confetti or badge animation here
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Day {dayData.day}
              </span>
              <span>•</span>
              <span>Initiation Phase</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{dayData.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {dayData.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <div className="text-xs font-medium text-muted-foreground uppercase">Time Estimate</div>
               <div className="font-bold">5 Minutes</div>
             </div>
             <div className="h-10 w-px bg-border hidden md:block"></div>
             <Button variant="outline" className="gap-2">
               <Play className="w-4 h-4" /> Watch Lesson
             </Button>
          </div>
        </div>

        {/* Main Task Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Task Steps */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: AI Suggestions */}
            <Card className="p-6 border-2 border-slate-100 shadow-none overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold">1</div>
                  <h2 className="font-bold text-lg">AI Generated Ideas</h2>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Shuffle className="w-4 h-4" /> Shuffle
                </Button>
              </div>

              <div className="space-y-4">
                {dayData.aiSuggestions.map((idea, i) => (
                  <div key={i} className="group relative border rounded-xl p-4 hover:border-primary/50 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{idea.title}</h3>
                        <p className="text-sm text-slate-500">{idea.desc}</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-primary"></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Step 2: Micro Decision */}
            <Card className="p-6 border-2 border-slate-100 shadow-none relative opacity-90">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">2</div>
                <h2 className="font-bold text-lg text-slate-700">Refinement</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Which target audience excites you the most? Pick one to focus on.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                 {["Freelancers", "Small Agencies", "Enterprise Sales", "Students"].map((opt) => (
                   <Button key={opt} variant="outline" className="justify-start h-12 text-slate-600">
                     {opt}
                   </Button>
                 ))}
              </div>
            </Card>

             {/* Step 3: Reflection */}
            <Card className="p-6 border-2 border-slate-100 shadow-none relative opacity-90">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">3</div>
                <h2 className="font-bold text-lg text-slate-700">Reflection</h2>
              </div>
              <div className="space-y-4">
                <p className="font-medium text-slate-700">Why does this problem matter to you?</p>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="I've experienced this pain myself when..."
                />
              </div>
            </Card>

            <div className="flex justify-end pt-4">
              <Button size="lg" className="rounded-full px-8 h-12 text-lg shadow-xl shadow-primary/20 gap-2" onClick={handleComplete}>
                Complete Day 1 <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

          </div>

          {/* Right Column: Progress & Info */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <Trophy className="w-5 h-5 text-yellow-400" />
                 Next Reward
               </h3>
               <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-4 bg-white/10 p-3 rounded-lg backdrop-blur-md border border-white/10">
                   <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white">
                     <Wand2 className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="font-bold text-sm">Initiator Badge</div>
                     <div className="text-xs text-slate-300">Complete Day 1</div>
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-xs font-medium text-slate-400">
                     <span>Progress</span>
                     <span>90%</span>
                   </div>
                   <Progress value={90} className="h-2 bg-slate-800" />
                 </div>
               </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Daily Streak</h3>
              <div className="flex items-center gap-2">
                <div className="text-4xl font-black text-slate-900">0</div>
                <div className="text-sm text-muted-foreground leading-tight">
                  Days<br/>Active
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}

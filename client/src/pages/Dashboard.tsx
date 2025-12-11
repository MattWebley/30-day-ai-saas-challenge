import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Shuffle, 
  ArrowRight, 
  CheckCircle2, 
  Wand2,
  Trophy,
  ChevronRight,
  Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { challengeDays } from "@/lib/mock-data";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:day");
  const [location, setLocation] = useLocation();
  const [completed, setCompleted] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // Determine current day from URL or default to 1
  const currentDay = params?.day ? parseInt(params.day) : 1;
  const dayData = challengeDays.find(d => d.day === currentDay) || challengeDays[0];

  // Handle completion
  const handleComplete = () => {
    setCompleted(true);
    // In a real app, we would update state/backend here
    // For prototype, we just animate/show feedback
    setTimeout(() => {
        // Navigate to next day if not the last day
        if (currentDay < 30) {
            setLocation(`/dashboard/${currentDay + 1}`);
            setCompleted(false);
        }
    }, 1500);
  };

  const handleShuffle = () => {
    setLoadingAI(true);
    setTimeout(() => setLoadingAI(false), 1000); // Simulate API call
  };

  return (
    <Layout currentDay={currentDay}>
      <div className="space-y-8 pb-20 font-sans">
        {/* Header - Clean & Sharp */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                Day {dayData.day}
              </span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{dayData.phase}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{dayData.title}</h1>
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
              {dayData.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <div className="text-right hidden md:block">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Time</div>
               <div className="font-bold text-slate-900 text-lg">5 Min</div>
             </div>
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
             <Button variant="outline" className="gap-2 border-2 border-slate-200 hover:border-primary hover:text-primary font-bold">
               <Play className="w-4 h-4" /> Watch Lesson
             </Button>
          </div>
        </div>

        {/* Main Task Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Task Steps */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: AI Task / Content */}
            {/* Dynamic rendering based on if we have specific AI content in mock-data, otherwise generic fallback */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                  <h2 className="font-bold text-xl text-slate-900">
                    {dayData.aiTask?.title || "AI Generated Suggestions"}
                  </h2>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-slate-500 hover:text-primary font-medium"
                    onClick={handleShuffle}
                    disabled={loadingAI}
                >
                  <Shuffle className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} /> 
                  {loadingAI ? "Generating..." : "Shuffle"}
                </Button>
              </div>

              <div className="space-y-3">
                {dayData.aiTask?.suggestions ? (
                    dayData.aiTask.suggestions.map((idea, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="group relative border-2 border-slate-100 rounded-xl p-5 hover:border-primary/30 hover:bg-blue-50/30 transition-all cursor-pointer bg-white"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-slate-900 mb-1 text-lg">{idea.title}</h3>
                              <p className="text-slate-500 font-medium">{idea.desc}</p>
                            </div>
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-primary group-hover:bg-primary transition-colors"></div>
                          </div>
                        </motion.div>
                    ))
                ) : (
                    // Generic Fallback for days without specific mock data yet
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 bg-slate-50">
                        <Wand2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">AI Generator for "{dayData.title}" would appear here.</p>
                        <p className="text-xs mt-1">Click "Shuffle" to simulate generation.</p>
                    </div>
                )}
              </div>
            </div>

            {/* Step 2: Micro Decision */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">2</div>
                <h2 className="font-bold text-xl text-slate-900">Micro Decision</h2>
              </div>
              <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                <p className="text-slate-600 font-medium mb-4">
                  Make a decision to move forward. Don't overthink it.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                   {["Option A", "Option B", "Option C", "Option D"].map((opt) => (
                     <Button key={opt} variant="outline" className="justify-start h-14 text-slate-600 border-2 border-slate-100 hover:border-primary hover:text-primary hover:bg-blue-50/50 text-base font-semibold">
                       {opt}
                     </Button>
                   ))}
                </div>
              </Card>
            </div>

             {/* Step 3: Reflection */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">3</div>
                <h2 className="font-bold text-xl text-slate-900">Reflection</h2>
              </div>
              <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                <label className="font-semibold text-slate-900 block mb-3">One sentence takeaway from today:</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-lg border-2 border-slate-200 bg-slate-50 p-4 text-base font-medium shadow-none placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 resize-none transition-colors"
                  placeholder="I realized that..."
                />
              </Card>
            </div>

            <div className="flex justify-end pt-8">
              <Button 
                size="lg" 
                className={`rounded-xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 gap-2 hover:translate-y-[-2px] transition-all ${completed ? "bg-green-500 hover:bg-green-600" : ""}`} 
                onClick={handleComplete}
              >
                {completed ? (
                    <>
                        Completed! <CheckCircle2 className="w-5 h-5" />
                    </>
                ) : (
                    <>
                        Complete Day {dayData.day} <ArrowRight className="w-5 h-5" />
                    </>
                )}
              </Button>
            </div>

          </div>

          {/* Right Column: Progress & Info */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900 text-white border-none shadow-2xl rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
               
               <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-yellow-500" />
                 Next Milestone
               </h3>
               
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                     <Wand2 className="w-7 h-7" />
                   </div>
                   <div>
                     <div className="font-bold text-xl">Initiator</div>
                     <div className="text-sm text-slate-400 font-medium">Badge Reward</div>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <span>Current Progress</span>
                     <span>{Math.round((currentDay / 30) * 100)}%</span>
                   </div>
                   <Progress value={(currentDay / 30) * 100} className="h-3 bg-white/10" indicatorClassName="bg-primary" />
                 </div>
               </div>
            </Card>

            <Card className="p-6 border-2 border-slate-100 shadow-none rounded-2xl">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Current Streak</h3>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-black text-slate-900 leading-none">3</div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-1">
                  Days<br/>Active
                </div>
              </div>
            </Card>
            
            {/* Locked Future Days Preview */}
            <div className="pt-4 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Coming Up Next</h4>
                <div className="space-y-2">
                    {challengeDays.slice(currentDay, currentDay + 3).map(nextDay => (
                        <div key={nextDay.day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                            <span className="text-xs font-bold uppercase">Day {nextDay.day}</span>
                            <span className="text-sm font-medium truncate max-w-[120px]">{nextDay.title}</span>
                            <Lock className="w-3 h-3" />
                        </div>
                    ))}
                </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

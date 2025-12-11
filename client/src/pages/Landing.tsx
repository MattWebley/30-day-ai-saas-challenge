import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Zap, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">30</div>
            <span>SaaS Challenge</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="hidden sm:flex">Login</Button>
            <Link href="/dashboard">
              <Button className="rounded-full px-6">Start Challenge</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-24 px-6 max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Join 2,400+ builders starting today</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Zero to AI SaaS <br/>
              <span className="text-primary">in 30 Days.</span>
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              A gamified daily challenge. 5-minute micro-tasks. 
              No coding required until you're ready. Build your MVP while you have your morning coffee.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Start Day 1 Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-orange-500" />,
                  title: "Micro-Tasks",
                  desc: "Forget 2-hour lectures. Every day is a 5-minute actionable task that moves the needle."
                },
                {
                  icon: <Trophy className="w-6 h-6 text-yellow-500" />,
                  title: "Gamified Progress",
                  desc: "Earn badges, maintain streaks, and unlock new phases as you build your product."
                },
                {
                  icon: <Sparkles className="w-6 h-6 text-purple-500" />,
                  title: "AI Powered",
                  desc: "Don't know what to write? Our AI generators do 80% of the work for you."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 h-full border-none shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-white border shadow-sm flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

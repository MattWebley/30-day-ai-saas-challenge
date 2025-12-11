import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Zap, Trophy, Play } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar - Clean & Minimal */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png" 
              alt="Matt Webley" 
              className="w-10 h-10 rounded-full"
            />
            <span className="font-bold text-xl tracking-tight">30 Day AI SaaS Challenge</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hidden md:inline text-sm font-medium text-slate-500">Already a member?</span>
            <a href="/api/login">
              <Button variant="ghost" className="font-medium text-slate-900 hover:text-primary hover:bg-blue-50">Login</Button>
            </a>
            <a href="/api/login">
              <Button className="rounded-lg px-6 font-semibold shadow-none">Start Now</Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Centered, High Contrast, No Blobs */}
        <section className="py-20 md:py-32 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-primary text-sm font-semibold tracking-wide uppercase border border-blue-100">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Challenge for New Founders</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Build your AI SaaS <br className="hidden md:block" />
              <span className="text-primary">in just 30 days.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              No code. No confusion. Just 5-minute daily micro-tasks that guide you from idea to paying customers.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/api/login">
                <Button size="lg" className="h-16 px-10 text-lg rounded-xl font-bold gap-3 shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all">
                  Start Day 1 for Free <ArrowRight className="w-6 h-6" />
                </Button>
              </a>
            </div>
            
            <div className="pt-6 flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Join 2,400+ builders</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Video / Social Proof Section */}
        <section className="pb-24 px-6">
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-4 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Abstract geometric background instead of blobs */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">See how it works</h2>
                <p className="text-slate-300 max-w-xl mx-auto text-lg">
                  Watch the 2-minute walkthrough of how we simplify the entire SaaS building process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Clean, Bordered Cards */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Why this actually works</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Most courses fail because they are too long. We fixed that.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-primary" />,
                  title: "Micro-Tasks",
                  desc: "Every day is a 5-minute actionable task. No fluff, just progress."
                },
                {
                  icon: <Trophy className="w-8 h-8 text-primary" />,
                  title: "Gamified Progress",
                  desc: "Earn badges, maintain streaks, and actually enjoy the process."
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-primary" />,
                  title: "AI Automation",
                  desc: "We use AI to generate your ideas, copy, and legal docs for you."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 h-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all rounded-xl">
                    <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">
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

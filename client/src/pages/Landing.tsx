import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
              alt="Matt Webley"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-bold text-lg">21 Day AI SaaS Challenge</span>
          </div>
          <div className="flex gap-2 items-center">
            <a href="/api/login">
              <Button variant="ghost" size="sm">Login</Button>
            </a>
            <a href="/api/login">
              <Button size="sm">Join Now</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        {/* Hero - The Hook */}
        <section className="pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <p className="text-primary font-semibold">From Matt Webley</p>

            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              In 21 Days, You'll Have a Real AI Software Product Ready to Launch
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Not an idea. Not a plan. Not a prototype. An actual, working product that you built yourself, even if you've never written a line of code.
            </p>
          </motion.div>
        </section>

        {/* The Problem */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <p>
              Let me guess...
            </p>
            <p>
              You've got ideas. Maybe too many ideas. And you've been sitting on them for months. Maybe years.
            </p>
            <p>
              You've watched others build software businesses. You've seen the screenshots of dashboards with MRR numbers that make you wonder "why not me?"
            </p>
            <p>
              But every time you try to start, you hit the same wall:
            </p>
            <ul className="space-y-3 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-slate-400 mt-1">→</span>
                <span>"I don't know how to code."</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-400 mt-1">→</span>
                <span>"I don't know which idea to pick."</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-400 mt-1">→</span>
                <span>"I don't have time."</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-400 mt-1">→</span>
                <span>"What if it fails?"</span>
              </li>
            </ul>
            <p>
              So the ideas stay ideas. And another year goes by.
            </p>
            <p className="font-semibold text-slate-900">
              I'm here to tell you that none of those reasons are real anymore.
            </p>
          </div>
        </section>

        {/* The Solution */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              AI Changed Everything
            </h2>
            <p>
              A year ago, building software required a developer. Or months of learning to code yourself. Or tens of thousands of dollars to hire someone.
            </p>
            <p>
              That's over now.
            </p>
            <p>
              Today, AI tools like Replit Agent and Claude Code can build software for you. You describe what you want in plain English, and it writes the code. It sets up the database. It creates the interface. It deploys the thing.
            </p>
            <p>
              The problem isn't the building anymore.
            </p>
            <p className="font-semibold text-slate-900">
              The problem is that nobody shows you HOW to use these tools properly. What to build. When to build it. And how to avoid the 47 mistakes that waste your time.
            </p>
            <p>
              That's what this challenge solves.
            </p>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              Here's What Happens Over 21 Days
            </h2>

            <div className="space-y-6 text-lg text-slate-700">
              <p>
                Each day, you get ONE focused task. Not a 4-hour tutorial. Not a 47-page PDF. Just ONE thing to do that moves you forward.
              </p>

              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <p className="font-semibold text-slate-900">Days 1-7: Pick Your Idea</p>
                <p className="text-base text-slate-600">
                  AI generates 28 product ideas based on YOUR skills and interests. You score them, validate the best ones, and pick ONE to build. No more analysis paralysis.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <p className="font-semibold text-slate-900">Days 8-14: Build The Thing</p>
                <p className="text-base text-slate-600">
                  You'll use Replit Agent and Claude Code to actually build your product. I give you the exact prompts. You paste them. The AI builds. You iterate. By day 14, you have a working product.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <p className="font-semibold text-slate-900">Days 15-21: Polish & Launch</p>
                <p className="text-base text-slate-600">
                  Authentication, emails, mobile-ready design, admin dashboard - all the "real app" stuff that makes people actually want to use it. Then you launch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              See What You'll Be Working With
            </h2>
            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
              Not some generic course platform. This is a purpose-built app that guides you through every step.
            </p>

            <div className="space-y-8">
              {/* Screenshot 1 - Dashboard/Progress */}
              <div className="space-y-3">
                <div className="bg-slate-100 rounded-xl border border-slate-200 aspect-video flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Screenshot: Your daily dashboard with progress tracking</span>
                </div>
                <p className="text-center text-slate-600">Track your progress with badges, streaks, and a visual battle pass</p>
              </div>

              {/* Screenshot 2 - Idea Generator */}
              <div className="space-y-3">
                <div className="bg-slate-100 rounded-xl border border-slate-200 aspect-video flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Screenshot: AI idea generation with scoring</span>
                </div>
                <p className="text-center text-slate-600">AI generates and scores 28 product ideas tailored to your skills</p>
              </div>

              {/* Screenshot 3 - Daily Task */}
              <div className="space-y-3">
                <div className="bg-slate-100 rounded-xl border border-slate-200 aspect-video flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Screenshot: A typical daily task with clear instructions</span>
                </div>
                <p className="text-center text-slate-600">Each day gives you one clear task with step-by-step guidance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Works */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              Why This Actually Works
            </h2>
            <p>
              Most courses fail because they're too long. You buy them with good intentions, then life happens. You fall behind. You feel guilty. The course sits unopened forever.
            </p>
            <p>
              The 21 Day Challenge is different:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span><strong>Daily micro-tasks</strong> - No 4-hour sessions. You do something small every day.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span><strong>Gamified progress</strong> - Badges, streaks, a battle pass. Your lizard brain actually wants to continue.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span><strong>AI does the heavy lifting</strong> - You're not learning to code. You're learning to direct AI to code for you.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span><strong>Built-in accountability</strong> - The app tracks everything. You see your progress. You feel the momentum.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* About Matt */}
        <section className="py-12 border-t border-slate-100">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img
              src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
              alt="Matt Webley"
              className="w-24 h-24 rounded-full"
            />
            <div className="space-y-4 text-lg text-slate-700">
              <p>
                <strong className="text-slate-900">I'm Matt Webley.</strong> I've been building software businesses for over a decade. I've also watched hundreds of people try and fail to get started.
              </p>
              <p>
                It's not because they're not smart enough. It's because they're drowning in options and nobody gives them a simple path.
              </p>
              <p>
                This challenge is that simple path. I've stripped out everything that doesn't matter and kept only what actually gets you to a launched product.
              </p>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              This Is For You If:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>You have ideas but haven't built anything yet</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>You're not a developer (and don't want to become one)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>You're tired of courses that never get finished</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>You want a structured, no-BS path to actually launching something</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>You can commit to showing up daily for 21 days</span>
              </li>
            </ul>

            <div className="pt-4">
              <h3 className="text-xl font-bold text-slate-900 text-center mb-4">
                This Is NOT For You If:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">✕</span>
                  <span>You want to "learn to code properly" (this isn't a coding course)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">✕</span>
                  <span>You're looking for a get-rich-quick scheme (this is real work)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">✕</span>
                  <span>You can't commit to 21 days of consistent action</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* The Offer */}
        <section className="py-12 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-center">
                Join the 21 Day AI SaaS Challenge
              </h2>
              <p className="text-slate-300 text-lg">
                21 days. One task per day. A real product at the end.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400 text-sm uppercase tracking-wide">What's included:</p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>21 guided daily tasks with exact instructions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>AI-powered idea generation (28 ideas scored for you)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Copy-paste prompts for Replit Agent and Claude Code</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Progress tracking with badges and streaks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Build log to document your journey</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Lifetime access to the platform and all updates</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-6">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black">£295</span>
                <span className="text-slate-400 text-lg">/ $399 USD</span>
              </div>
              <p className="text-slate-400">
                One payment. Lifetime access. No subscriptions.
              </p>
              <a href="/api/login" className="block">
                <Button size="lg" className="w-full h-16 text-xl font-bold gap-3 bg-white text-slate-900 hover:bg-slate-100">
                  Start the Challenge <ArrowRight className="w-6 h-6" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              Questions You Might Have
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Do I need to know how to code?</p>
                <p className="text-slate-600">No. You'll be using AI tools to write the code for you. You just need to be able to type prompts and follow instructions.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">How long does each day take?</p>
                <p className="text-slate-600">It varies. Some days are 5-10 minutes. Build days might take longer depending on how much iteration you want to do. The key is showing up consistently.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">What if I miss a day?</p>
                <p className="text-slate-600">The platform tracks your progress. You can pick up where you left off. But fair warning: the momentum is what makes this work. Breaking the chain makes it harder.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">What AI tools do I need?</p>
                <p className="text-slate-600">You'll use Replit Agent (which has a free tier) and Claude Code. You may need a small amount of credits for AI features -typically under $20 for the whole challenge.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Will I actually have a real product at the end?</p>
                <p className="text-slate-600">If you do the work, yes. It won't be a billion-dollar company on day 22. But it will be a real, working piece of software that you built and can show to people.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Is there a refund policy?</p>
                <p className="text-slate-600">If you complete all 21 days and genuinely don't find value, email me and we'll sort it out. I don't hide behind fine print.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              The Real Question
            </h2>
            <p>
              Where will you be in 21 days?
            </p>
            <p>
              You could be exactly where you are now. Still thinking about that idea. Still wondering if you should learn to code. Still waiting for the "right time."
            </p>
            <p>
              Or you could have a real product. Something you built. Something you can show people. Something that proves -to yourself more than anyone -that you can actually do this.
            </p>
            <p className="font-semibold text-slate-900">
              The time is going to pass anyway. Make it count.
            </p>
          </div>

          <div className="pt-8 pb-20">
            <a href="/api/login">
              <Button size="lg" className="w-full h-16 text-xl font-bold gap-3">
                Start Day 1 Now <ChevronRight className="w-6 h-6" />
              </Button>
            </a>
            <p className="text-center text-slate-500 text-sm mt-4">
              £295 / $399 USD - Lifetime access
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img
              src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
              alt="Matt Webley"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold">21 Day AI SaaS Challenge</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Matt Webley. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            <a href="https://mattwebley.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
              mattwebley.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, AlertTriangle, Clock, Zap, Target, TrendingUp, Shield, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Header */}
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

        {/* ========================================== */}
        {/* 1. BIG PROMISE HEADLINE */}
        {/* ========================================== */}
        <section className="pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              How Complete Beginners Are Using AI to Build Real, Working Software Products in 21 Days for Less Than $100...
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-700">
              ...Without Writing a Single Line of Code, Without Any Technical Experience, and Without Spending Months "Learning to Code"
            </h2>
          </motion.div>
        </section>

        {/* ========================================== */}
        {/* 2. FASCINATING LEAD / STORY */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              AI Has Made Building Software 100x Cheaper and Easier
            </h2>

            <p>
              If you've ever dreamed of building your own software product... if you've watched others launch apps and thought "why not ME?"... if you've got ideas that have been sitting in your head for MONTHS or even YEARS...
            </p>

            <p>
              Then pay attention. Because what I'm about to tell you is going to blow your mind.
            </p>

            <p className="font-semibold text-slate-900 text-xl">
              The rules of building software have COMPLETELY changed.
            </p>

            <p>
              Until recently, if you wanted to build software, you had THREE options:
            </p>

            <ol className="list-decimal pl-6 space-y-3">
              <li><strong>Learn to code yourself</strong> - which takes 6-12 months MINIMUM before you can build anything useful</li>
              <li><strong>Hire developers</strong> - which costs $30,000-$100,000+ for even a BASIC app</li>
              <li><strong>Find a technical co-founder</strong> - which means giving away 50% of your company before you've made a PENNY</li>
            </ol>

            <p>
              All three options are SLOW, EXPENSIVE, and FRUSTRATING.
            </p>

            <p>
              I know because I've been there! I've hired developers who took my money and delivered GARBAGE. I've had partnerships fall apart because the "technical guy" lost interest. I've watched project after project stall because I was dependent on someone else to build it.
            </p>

            <p className="font-semibold text-slate-900">
              But recently, something changed. Something BIG.
            </p>

            <p>
              AI tools like Replit Agent and Claude Code got good enough that they can now build REAL, WORKING software from plain English instructions.
            </p>

            <p>
              Not toys. Not prototypes. REAL software that people PAY for.
            </p>

            <p>
              And here's what most people don't understand yet:
            </p>

            <div className="bg-slate-900 text-white p-6 rounded-xl my-8">
              <p className="text-xl font-bold">
                The barrier to building software has dropped from $50,000+ and 12 months... to less than $100 and 21 days.
              </p>
            </div>

            <p>
              That's not hype. That's not marketing rubbish. That's the ACTUAL reality of where we are RIGHT NOW.
            </p>

            <p>
              The problem? Nobody's showing regular people HOW to do it properly.
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* 3. PROBLEM / AGITATION */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              But Without a System, You'll Stay Stuck Like Everyone Else
            </h2>

            <p>
              Let me describe someone. Tell me if this sounds familiar:
            </p>

            <p>
              You've got ideas. GOOD ideas. Maybe you've even written some of them down. You KNOW there's a market out there for what you're thinking about.
            </p>

            <p>
              But every time you try to start...
            </p>

            <ul className="space-y-4 pl-4">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You get OVERWHELMED by all the technical stuff. Databases. APIs. Frameworks. Hosting. It feels like you need a computer science degree just to get STARTED.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You can't decide WHICH idea to pursue. You've got 5 or 10 or 20 ideas, and analysis paralysis keeps you FROZEN. What if you pick the wrong one?</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You've tried to learn to code before. Maybe you did a tutorial. Maybe you signed up for a course. But you never FINISHED, and even if you did, you STILL couldn't build what you wanted.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You looked into hiring developers, but the quotes made your eyes WATER. $15,000 for an MVP? $50,000 for something "proper"? That's just NOT realistic.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You've tried "no-code" tools before, and they're either too LIMITED to build anything real, or they're so COMPLEX you might as well be coding anyway.</span>
              </li>
            </ul>

            <p>
              And so another week goes by. Another month. Another YEAR.
            </p>

            <p>
              Meanwhile, you watch other people - people who are NO smarter than you - launch products, get customers, and build businesses. And you wonder what secret THEY know that YOU don't.
            </p>

            <p className="font-semibold text-slate-900 text-xl">
              Here's the BRUTAL truth nobody wants to tell you:
            </p>

            <p>
              The biggest thing holding you back isn't your technical skills. It isn't your ideas. It isn't even your time.
            </p>

            <p className="font-bold text-slate-900">
              It's that you don't have a SYSTEM.
            </p>

            <p>
              You don't have someone telling you EXACTLY what to do, in EXACTLY what order, with EXACTLY what tools. You're trying to figure it all out yourself, and THAT'S why you're stuck.
            </p>

            <p>
              What you need isn't more motivation. It isn't more ideas. It isn't "inspiration."
            </p>

            <p>
              What you need is someone who's already DONE it to hand you the exact step-by-step playbook and say: "Do THIS. Then THIS. Then THIS. Now you have a product."
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* WHY SAAS */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Why SaaS? Because It's the Ultimate Business Model
            </h2>

            <p>
              Here's why I'm so passionate about helping people build SaaS:
            </p>

            <div className="bg-slate-900 text-white p-8 rounded-xl my-6 space-y-4">
              <p className="text-xl font-bold">
                SaaS gives you a FACELESS, PASSIVE, RECURRING income stream you can run from ANYWHERE in the world.
              </p>
              <p className="text-slate-300">
                No inventory. No shipping. No customer service phone calls. No showing your face on camera if you don't want to. Just software that works 24/7, collecting payments while you sleep.
              </p>
            </div>

            <p>
              And here's the exciting part:
            </p>

            <p className="font-semibold text-slate-900 text-xl">
              Imagine having a product READY TO SELL in just 21 days.
            </p>

            <p>
              Not "ready to think about." Not "ready to plan." READY TO SELL. Taking payments. Serving customers. Building recurring revenue.
            </p>

            <p>
              That's what we're doing here.
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* THE SOLUTION */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              The 21 Day AI SaaS Challenge: One Task Per Day, A Real Product at the End
            </h2>

            <div className="my-8 bg-slate-50 border-2 border-slate-200 rounded-xl p-8">
              <p className="text-lg">
                This ISN'T a course. It ISN'T a bunch of videos you'll never watch. It ISN'T a community where you chat with other people who also aren't building anything.
              </p>
              <p className="text-lg mt-4 font-semibold text-slate-900">
                It's a 21-day guided challenge where you complete ONE focused task every single day... and at the end, you have a REAL, WORKING software product.
              </p>
            </div>

            <p>
              Here's how it works:
            </p>

            <p>
              Every day for 21 days, you log in and get ONE clear task to complete. Not a 4-hour video lecture. Not 47 pages to read. Just ONE specific action that moves you forward.
            </p>

            <p>
              Some days take 5 minutes. Some days take longer. But every day is designed to be COMPLETABLE - no matter how busy you are.
            </p>

            <p>
              The tasks are sequenced PERFECTLY. Day 1 builds on nothing. Day 2 builds on Day 1. Day 3 builds on Day 2. By Day 21, all those small steps have added up to a COMPLETE product.
            </p>

            <p>
              And here's the KEY:
            </p>

            <p className="font-bold text-slate-900 text-xl">
              You're NOT writing code. You're DIRECTING AI to write it for you.
            </p>

            <p>
              I give you the exact prompts to use. You paste them into the AI tools. The AI builds. You review and iterate. That's IT.
            </p>

            <p>
              If you can TYPE, you can do this.
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* THE JOURNEY - SIMPLIFIED */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Idea → Prepare → Build → Launch (All in 21 Days)
            </h2>

            <div className="text-lg text-slate-700 space-y-6">
              <p>
                Over 21 days, you'll go through four distinct phases - each one building on the last:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h3 className="text-xl font-bold text-slate-900">IDEA</h3>
                  </div>
                  <p className="text-slate-600">
                    Find YOUR winning idea. Not just any idea - one that's validated, that you're excited about, and that people will actually PAY for. You'll leave with a name, domain, and logo.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h3 className="text-xl font-bold text-slate-900">PREPARE</h3>
                  </div>
                  <p className="text-slate-600">
                    Set up your AI toolkit and start building. You'll have your first working version running before you know it. No coding - just directing AI with plain English.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                    <h3 className="text-xl font-bold text-slate-900">BUILD</h3>
                  </div>
                  <p className="text-slate-600">
                    Add all the features that make a REAL product: user accounts, AI features, email, mobile support, admin dashboard. Everything a professional SaaS needs.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
                    <h3 className="text-xl font-bold text-slate-900">LAUNCH</h3>
                  </div>
                  <p className="text-slate-600">
                    Final polish, testing, and deployment. Make sure everything WORKS, looks professional, and is ready for your first users. Then hit that launch button.
                  </p>
                </div>
              </div>

              <p className="font-semibold text-slate-900 text-center text-xl pt-4">
                By Day 21, you'll have a REAL, WORKING software product ready for customers.
              </p>

              <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-6 mt-8">
                <p className="font-bold text-slate-900 text-lg mb-2">
                  Important: This challenge is about BUILDING, not MARKETING.
                </p>
                <p className="text-slate-600">
                  You'll go from idea to validated concept to working software. We cover everything needed to build a REAL product: the tech setup, AI integration, user accounts, email, mobile support - the WHOLE thing. What we DON'T cover is marketing, customer acquisition, or business building. That's a different skill set for after you've built something worth selling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 4. PROOF - TESTIMONIALS & CREDIBILITY */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              I've Spent 10+ Years Building Software So You Don't Have To
            </h2>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="Matt Webley"
                className="w-32 h-32 rounded-full"
              />
              <div className="space-y-4 text-lg text-slate-700">
                <p>
                  <strong className="text-slate-900">I'm Matt Webley.</strong> I started selling online in the year 2000, launched my first company in 2002, and I've been building SaaS businesses for about a decade now.
                </p>
                <p>
                  In my spare time - while working a day job, raising a family, living life - I've generated over <strong className="text-slate-900">$23 million in online revenue</strong>. And <strong className="text-slate-900">$12 million of that came from SaaS</strong>.
                </p>
                <p>
                  I'm not telling you this to brag. I'm telling you because I've seen EXACTLY what it takes to build software products that actually make money. I've made every mistake. I've learned every lesson. And now I've packaged it all into a system that works.
                </p>
                <p>
                  The 21 Day AI SaaS Challenge is the distillation of EVERYTHING I've learned about what it ACTUALLY takes to go from idea to launched product - without the fluff, without the theory, without the stuff that doesn't matter.
                </p>
                <p className="font-semibold text-slate-900">
                  I built this because I was TIRED of seeing smart, capable people stay stuck for YEARS when they could be launching in WEEKS.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The "This Actually Works" Section */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Daily Micro-Tasks + AI Tools + Perfect Sequence = A Product You Actually FINISH
            </h2>

            <p>
              You've probably tried other things before. Courses that went unfinished. Tutorials that taught you concepts but not how to actually BUILD. Communities where everyone shares ideas but nobody SHIPS.
            </p>

            <p>
              Here's why THIS is different:
            </p>

            <div className="space-y-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Daily Micro-Tasks, NOT Marathon Sessions</h4>
                  <p className="text-slate-600 mt-1">
                    You don't need to find 4 hours. You don't need a "free weekend." You just need to show up daily and do ONE thing. Some days that's 5 minutes. The CONSISTENCY is what builds momentum.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Perfectly Sequenced - ZERO Guesswork</h4>
                  <p className="text-slate-600 mt-1">
                    You NEVER have to wonder "what should I do next?" Every day builds on the last. The path is laid out. You just have to WALK it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">AI Does the HEAVY Lifting</h4>
                  <p className="text-slate-600 mt-1">
                    You're NOT learning to code. You're learning to DIRECT AI to code for you. I give you the exact prompts. You paste them. The AI builds. It's like having a developer who works for $0.002 per task!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Gamified Progress Keeps You GOING</h4>
                  <p className="text-slate-600 mt-1">
                    Badges. Streaks. A visual progress tracker. Your lizard brain actually WANTS to continue. It's the same psychology that makes games addictive - but pointed at building something VALUABLE.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Built-In "Pause Point" for REAL Building</h4>
                  <p className="text-slate-600 mt-1">
                    Day 18 is the MVP day. You can stay there as long as you need - days, weeks, whatever it takes. This isn't about SPEED. It's about actually FINISHING something real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 5. BULLETS - WHAT YOU GET */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              21 Days of Tasks, AI Prompts, an AI Coach, and Everything You Need
            </h2>

            <div className="space-y-6 text-lg text-slate-700">
              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">21 Guided Daily Tasks with EXACT Instructions</span>
                  <p className="text-slate-600 mt-1">Not vague concepts. Not "figure it out yourself." Each day tells you EXACTLY what to do, what to click, what to type. ZERO guesswork.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">AI-Powered Idea Generation (28 Ideas Scored For You)</span>
                  <p className="text-slate-600 mt-1">Tell the system about yourself and it generates 28 SaaS ideas tailored to YOUR skills and interests, each one scored against proven criteria. No more analysis paralysis!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">Copy-Paste Prompts for Replit Agent and Claude Code</span>
                  <p className="text-slate-600 mt-1">I give you the EXACT prompts that work. You paste them. The AI builds. No prompt engineering skills needed.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">Progress Tracking with Badges, Streaks, and Battle Pass</span>
                  <p className="text-slate-600 mt-1">Visual motivation that keeps you GOING. See your progress. Earn badges. Build your streak. Your brain will WANT to continue.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">AI Mentor Chat (Ask Questions ANYTIME)</span>
                  <p className="text-slate-600 mt-1">Stuck? Confused? The AI mentor understands the challenge and your context. Ask it ANYTHING and get instant help.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">Build Log to Document Your Journey</span>
                  <p className="text-slate-600 mt-1">Every decision you make is saved. Every milestone is recorded. Look back and see how FAR you've come.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">12 Months Access to Complete the Challenge</span>
                  <p className="text-slate-600 mt-1">One year to go from idea to working product. AI tools move fast - you'll always use the CURRENT methods, not outdated ones.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">Claude Code Guide (Unlocks After Day 9)</span>
                  <p className="text-slate-600 mt-1">A dedicated reference page with ALL the prompts you need for efficient building. Bookmark it and use it FOREVER.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* WHO THIS IS FOR / NOT FOR */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8 text-lg text-slate-700">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              This is For Non-Technical People Who Want to Build Software
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                  <Check className="w-6 h-6 text-green-600" />
                  This IS For You If:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You have ideas but haven't built anything YET</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You're NOT a developer (and don't want to become one)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You're TIRED of courses that never get finished</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You want a structured, NO-BS path to launching something</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You can commit to showing up daily for 21 days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You're in a "biz opp" space (KDP, FBA, courses, etc.) and want your OWN tool</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>You've watched others build SaaS and thought "why not ME?"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  This is NOT For You If:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold">✕</span>
                    <span>You want to "learn to code properly" (this ISN'T a coding course)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold">✕</span>
                    <span>You're looking for a get-rich-quick scheme (this is REAL work)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold">✕</span>
                    <span>You CAN'T commit to 21 days of consistent action</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold">✕</span>
                    <span>You expect to build a billion-dollar company in 3 weeks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold">✕</span>
                    <span>You're already an experienced developer (you don't NEED this)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold">✕</span>
                    <span>You want someone to build it FOR you (YOU'RE doing the work here)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 6. THE OFFER STACK */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl md:text-4xl font-black">
                Get Instant Access for Just £295 (One Payment, 12 Months Access)
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400 text-sm uppercase tracking-wide">Here's EVERYTHING you get:</p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>21 guided daily tasks with EXACT instructions <span className="text-slate-400">(Value: £500+)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>AI-powered idea generation - 28 ideas scored for YOU <span className="text-slate-400">(Value: £200+)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Copy-paste prompts for Replit Agent and Claude Code <span className="text-slate-400">(Value: £300+)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Progress tracking with badges, streaks, and battle pass <span className="text-slate-400">(Value: Priceless motivation)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>AI Mentor chat for instant help <span className="text-slate-400">(Value: £150+)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Build log to document your journey <span className="text-slate-400">(Value: Your proof of work)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>12 months access to complete the challenge <span className="text-slate-400">(Value: Plenty of time)</span></span>
                </li>
              </ul>
            </div>

            <div className="border-t border-slate-700 pt-8 space-y-6">
              <div className="text-center">
                <p className="text-slate-400 line-through text-lg">Total Value: £1,150+</p>
                <div className="flex items-baseline justify-center gap-3 mt-2">
                  <span className="text-5xl font-black">£295</span>
                  <span className="text-slate-400 text-lg">/ $399 USD</span>
                </div>
                <p className="text-slate-400 mt-2">
                  One payment. 12 months access. No subscriptions.
                </p>
              </div>

              <a href="/api/login" className="block">
                <Button size="lg" className="w-full h-16 text-xl font-bold gap-3 bg-white text-slate-900 hover:bg-slate-100">
                  Start the Challenge NOW <ArrowRight className="w-6 h-6" />
                </Button>
              </a>

              <p className="text-center text-slate-400 text-sm">
                Instant access. Start Day 1 IMMEDIATELY.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 1 YEAR ACCESS */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              You Have 1 Year to Complete the Challenge
            </h2>

            <p>
              When you join, you get <strong className="text-slate-900">12 months of access</strong> to complete the challenge.
            </p>

            <p>
              Why not lifetime? Because AI moves FAST. The tools, the methods, the prompts - they're evolving constantly. What works today might be completely different in 2 years.
            </p>

            <p>
              I want you using the CURRENT system, not something outdated. And honestly? If you can't find 21 days within an entire YEAR to build your product, this probably isn't for you.
            </p>

            <p className="font-semibold text-slate-900">
              One year is MORE than enough time. Most people who take action finish in a few weeks. The ones who don't finish in a year were never going to finish anyway.
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* 7. GUARANTEE */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                Do The Work, Get a Working Product - Or Your Money Back
              </h2>
            </div>

            <p>
              Here's my promise to you:
            </p>

            <p>
              If you go through the challenge every day, do the work, and DON'T have a working software product at the end of it - one of my vibe coding coaches will jump on a call with you, figure out what went wrong, and help you fix it.
            </p>

            <p>
              And if we STILL can't get you to a working product? I'll refund you in FULL. No questions. No hassle.
            </p>

            <p>
              Why am I confident making this offer? Because I KNOW that if you actually show up and follow the system, you WILL have a product at the end. That's not a guess. That's just how this works.
            </p>

            <p className="font-semibold text-slate-900">
              The ONLY way to fail is to not show up. And if you're the type who won't show up, please don't join. Save us both the time.
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* 8. SCARCITY / URGENCY */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              21 Days From Now, You Could Have a Working Product
            </h2>

            <p>
              Look, I'm NOT going to give you fake scarcity. There's no "only 7 spots left" nonsense here.
            </p>

            <p>
              But I AM going to tell you something TRUE:
            </p>

            <p className="font-semibold text-slate-900 text-xl">
              "Later" is where dreams go to DIE.
            </p>

            <p>
              How many times have you told yourself you'd start "next week"? "Next month"? "When things calm down"?
            </p>

            <p>
              Things NEVER calm down. There's NEVER a perfect time. The only time you actually have control over is RIGHT NOW.
            </p>

            <p>
              Here's the math:
            </p>

            <ul className="space-y-2 pl-6">
              <li>• 21 days from today, you could have a WORKING product</li>
              <li>• Or 21 days from today, you could be exactly where you are NOW, still thinking about it</li>
            </ul>

            <p>
              The time is going to pass EITHER WAY.
            </p>

            <p>
              The question is: what will you have to SHOW for it?
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mt-6">
              <p className="font-semibold text-slate-900">
                Also worth noting: AI tools are evolving FAST. The methods that work today might change tomorrow. With your 12 months access, you'll be using the CURRENT system - not something that's become outdated. The earlier you start, the further AHEAD you'll be.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* FAQ */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Common Questions About the Challenge
            </h2>

            <div className="space-y-6 text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Do I need to know how to code?</p>
                <p className="text-slate-600">Absolutely NOT. You'll be using AI tools to write the code for you. If you can type and follow instructions, you can do this.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">How long does each day take?</p>
                <p className="text-slate-600">It varies. Some days are 5-10 minutes. Building days might take longer depending on how much iteration you want to do. The key is showing up CONSISTENTLY.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">What if I miss a day?</p>
                <p className="text-slate-600">The platform tracks your progress and you can pick up where you left off. But fair warning: the MOMENTUM is what makes this work. Breaking the chain makes it harder.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">What AI tools do I need?</p>
                <p className="text-slate-600">You'll use Replit (has a free tier), Claude, and ChatGPT. For AI features, you'll need a small amount of OpenAI credits - typically under $20 for the WHOLE challenge.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Will I actually have a REAL product at the end?</p>
                <p className="text-slate-600">If you do the work, YES. It won't be a billion-dollar company on day 22. But it WILL be a real, working piece of software with user accounts, AI features, and everything else a real SaaS needs.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Can I go FASTER than 21 days?</p>
                <p className="text-slate-600">Yes! The days unlock as you complete them. If you want to do 2 or 3 days in one sitting, go for it. The 21-day structure is about consistency, not restriction.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">What if I get stuck?</p>
                <p className="text-slate-600">The platform has a built-in AI mentor that understands the challenge and your context. Ask it ANYTHING. You can also report problems directly to me.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Is this just another course I'll never finish?</p>
                <p className="text-slate-600">This is SPECIFICALLY designed to NOT be that. Daily micro-tasks, gamified progress, and a clear 21-day structure create accountability that courses LACK. You're not watching videos. You're DOING things.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 9. FINAL CTA */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Stay Stuck Forever, or Start Building Today
            </h2>

            <p>
              You've read this far. That tells me something about you.
            </p>

            <p>
              It tells me you're SERIOUS. That you're not just daydreaming about building software - you actually want to DO it.
            </p>

            <p>
              So here's the question:
            </p>

            <p className="font-bold text-slate-900 text-xl text-center">
              What's it going to be?
            </p>

            <p>
              <strong>Option A:</strong> Close this page. Tell yourself you'll "think about it." Watch another month go by. Then another. Keep the ideas in your head where they've been sitting for YEARS. Stay exactly where you are.
            </p>

            <p>
              <strong>Option B:</strong> Join the challenge. Show up daily for 21 days. Follow the system. And in three weeks, look at the ACTUAL, WORKING product you built with your own hands (okay, with AI's hands, but YOU directed them).
            </p>

            <p>
              One option keeps you STUCK. The other gets you MOVING.
            </p>

            <p className="font-semibold text-slate-900">
              The choice is yours. But choose NOW, while you're thinking about it. Because "later" rarely comes.
            </p>
          </div>

          <div className="pt-8 pb-12">
            <a href="/api/login">
              <Button size="lg" className="w-full h-16 text-xl font-bold gap-3">
                Yes, I'm Ready - Start Day 1 NOW <ChevronRight className="w-6 h-6" />
              </Button>
            </a>
            <p className="text-center text-slate-500 text-sm mt-4">
              £295 / $399 USD - One payment, 12 months access
            </p>
          </div>
        </section>

        {/* ========================================== */}
        {/* 10. P.S. SECTION */}
        {/* ========================================== */}
        <section className="py-12 border-t border-slate-100 space-y-6 text-lg text-slate-700">
          <p>
            <strong>P.S.</strong> - Still here? Let me give you the SHORT version:
          </p>

          <p>
            The 21 Day AI SaaS Challenge takes you from "I have an idea" to "I have a WORKING product" in 21 days. No coding required. AI does the heavy lifting. You just show up daily and follow the system.
          </p>

          <p>
            <strong>P.P.S.</strong> - Remember: the barrier to building software USED to be $50,000+ and 12 months. Now it's £295 and 21 days. This window won't last forever. The people who move NOW will have a massive head start on everyone who waits.
          </p>

          <p>
            <strong>P.P.P.S.</strong> - If you complete all 21 days and don't feel like you got value, email me. We'll sort it out. I don't hide behind fine print. Your success is MY success.
          </p>

          <div className="pt-4">
            <a href="/api/login">
              <Button size="lg" className="w-full h-14 text-lg font-bold gap-2">
                Start the Challenge <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-12">
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
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-4">
            Disclaimer: Results vary. Building a product does not guarantee income. Most software products never generate significant revenue. Your success depends on your effort, market conditions, and many factors outside our control. This challenge teaches you how to build - what you do with what you build is up to you.
          </p>
        </div>
      </footer>
    </div>
  );
}

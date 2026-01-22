import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, AlertTriangle, Clock, Zap, Target, TrendingUp, Shield, Star, Play } from "lucide-react";

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
            <a href="/order">
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

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              ...Without Writing a Single Line of Code, Without Any Technical Experience, and Without Spending Months "Learning to Code"
            </h2>

            {/* VSL - VIDEO SALES LETTER */}
            <div className="mt-10 space-y-4">
              <p className="text-slate-600 font-medium">Watch the 3-minute overview</p>

              {/* Video Placeholder - Replace with actual video embed */}
              <div className="relative aspect-video bg-slate-200 rounded-xl overflow-hidden cursor-pointer group">
                {/* Placeholder thumbnail - replace src with actual thumbnail */}
                <img
                  src="/vsl-thumbnail.png"
                  alt="Watch video overview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image if thumbnail doesn't exist yet
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* GRADIENT OVERLAY - remove this div to revert */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-200">
                    <Play className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
                  3:24
                </div>

                {/* TODO: Replace this placeholder with actual video embed
                     Example for YouTube:
                     <iframe
                       src="https://www.youtube.com/embed/VIDEO_ID"
                       className="w-full h-full"
                       allowFullScreen
                     />

                     Example for Vimeo:
                     <iframe
                       src="https://player.vimeo.com/video/VIDEO_ID"
                       className="w-full h-full"
                       allowFullScreen
                     />
                */}
              </div>

              <p className="text-sm text-slate-500">Or keep scrolling to read everything below</p>
            </div>
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
              If you've ever dreamed of building your own software product... if you've watched others launch apps and thought "why not ME?"... whether you've got a specific idea or you just KNOW you want to build SOMETHING...
            </p>

            <p>
              Then pay attention. Because what I'm about to tell you is going to blow your mind.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              The Old Way Was SLOW, EXPENSIVE, and FRUSTRATING
            </h3>

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

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              Then AI Changed EVERYTHING
            </h3>

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
                The barrier to building software has dropped from $250,000+ and 2-3 YEARS... to less than $100 and 21 days. Even tiny tools used to cost $50K+. Now? Under $100.
              </p>
            </div>

            <p>
              That's not hype. That's not marketing rubbish. That's the ACTUAL reality of where we are RIGHT NOW.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              But Nobody's Showing Regular People HOW to Do It
            </h3>

            <p>
              That's the problem. The tools exist. The opportunity is REAL. But there's no roadmap for non-technical people to follow.
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
              Maybe you've got ideas - GOOD ideas you've been sitting on. Or maybe you just know you WANT to build something but haven't figured out WHAT yet. Either way, you KNOW there's opportunity out there.
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
                <span>You're stuck on the IDEA. Either you've got too many and can't pick, or you can't think of the "right" one. Analysis paralysis keeps you FROZEN.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You've tried to learn to code before. Maybe you did a tutorial. Maybe you signed up for a course. But you never FINISHED, and even if you did, you STILL couldn't build what you wanted.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You looked into hiring developers, but the quotes made your eyes WATER. $50,000 for a tiny tool? $250,000+ for something "proper"? That's just NOT realistic.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <span>You've tried "no-code" tools before, and they're either too LIMITED to build anything real, or they're so COMPLEX you might as well be coding anyway.</span>
              </li>
            </ul>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              And So Another Week Goes By. Another Month. Another YEAR.
            </h3>

            <p>
              Meanwhile, you watch other people (people who are NO smarter than you) launch products, get customers, and build businesses. And you wonder what secret THEY know that YOU don't.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              It's NOT Your Ideas. It's NOT Your Skills. It's That You Don't Have a SYSTEM.
            </h3>

            <p>
              The biggest thing holding you back isn't your technical skills. It isn't your ideas. It isn't even your time.
            </p>

            <p>
              You don't have someone telling you EXACTLY what to do, in EXACTLY what order, with EXACTLY what tools. You're trying to figure it all out yourself, and THAT'S why you're stuck.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              You Need a Step-by-Step Playbook From Someone Who's DONE It
            </h3>

            <p>
              What you need isn't more motivation. It isn't more ideas. It isn't "inspiration."
            </p>

            <p>
              What you need is someone to hand you the exact playbook and say: "Do THIS. Then THIS. Then THIS. Now you have a product."
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

            {/* Dashboard Preview */}
            <div className="my-8">
              <img
                src="/dashboard-preview.png"
                alt="Challenge dashboard showing daily progress tracker"
                className="w-full rounded-lg shadow-2xl border border-slate-200"
              />
              <p className="text-center text-sm text-slate-500 mt-3">The challenge dashboard - your daily guide to building</p>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              One Clear Task Every Day. 21 Days. Done.
            </h3>

            <p>
              Every day for 21 days, you log in and get ONE clear task to complete. Not a 4-hour video lecture. Not 47 pages to read. Just ONE specific action that moves you forward.
            </p>

            <p>
              Some days take 5 minutes. Some days take longer. But every day is designed to be COMPLETABLE, no matter how busy you are.
            </p>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 my-6">
              <p className="text-slate-700">
                <strong className="text-slate-900">Life happens?</strong> No problem. There's a PAUSE button built right into the challenge. Take a week off. Take a month. Come back when you're ready. The 21 days is a framework, not a prison. Some people blast through it. Some people take 3 months. Both are fine. Your product, your pace.
              </p>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              Each Day Builds on the Last. By Day 21, You Have a Product.
            </h3>

            <p>
              The tasks are sequenced PERFECTLY. Day 1 builds on nothing. Day 2 builds on Day 1. Day 3 builds on Day 2. By Day 21, all those small steps have added up to a COMPLETE product.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              You're NOT Coding. You're DIRECTING AI to Code For You.
            </h3>

            <p>
              I give you the exact prompts to use. You paste them into the AI tools. The AI builds. You review and iterate. That's IT.
            </p>

            <p>
              If you can TYPE, you can do this.
            </p>

            <div className="bg-slate-900 text-white p-6 rounded-xl my-8">
              <p className="text-lg">
                <strong>By the way:</strong> this challenge app you're looking at right now? I built it using the exact same system I'm teaching you. The prompts, the process, all of it. You're looking at the proof.
              </p>
            </div>
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
                    Don't have an idea? We'll generate 28 for you. Already have one? We'll validate it. Either way, you'll leave with a winning idea, a name, domain, and logo.
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
                  You'll go from "I want to build something" to working software. We help you find or validate an idea, then cover everything needed to build a REAL product: the tech setup, AI integration, user accounts, email, mobile support - the WHOLE thing. What we DON'T cover is marketing, customer acquisition, or business building. That's a different skill set for after you've built something worth selling.
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
              I've Spent 8+ Years Building Software So You Don't Have To
            </h2>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="Matt Webley"
                className="w-32 h-32 rounded-full"
              />
              <div className="space-y-4 text-lg text-slate-700">
                <p>
                  <strong className="text-slate-900">I'm Matt Webley.</strong> I started selling online in the year 2000, launched my first company in 2002, and I've been building SaaS businesses for 8+ years.
                </p>
                <p>
                  In my spare time (while working a day job, raising a family, living life) I've generated over <strong className="text-slate-900">$23 million in online revenue</strong>. And <strong className="text-slate-900">$12 million of that came from SaaS</strong>.
                </p>

                <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-4">
                  $12 Million From SaaS. Every Mistake Made. Every Lesson Learned.
                </h3>

                <p>
                  I'm not telling you this to brag. I'm telling you because I've seen EXACTLY what it takes to build software products that actually make money. I've made every mistake. I've learned every lesson. And now I've packaged it all into a system that works.
                </p>
                <p>
                  The 21 Day AI SaaS Challenge is the distillation of EVERYTHING I've learned about what it ACTUALLY takes to go from zero to launched product. No fluff. No theory. Just the stuff that matters.
                </p>

                <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-4">
                  I Was TIRED of Watching Smart People Stay Stuck for YEARS
                </h3>

                <p>
                  That's why I built this. Because smart, capable people shouldn't be stuck for years when they could be launching in WEEKS.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-12 border-t border-slate-100">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Real People. Real Products. Built With This System.
            </h2>

            <div className="space-y-16">
              {/* Product 1 - AuditMyListing - James F */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
                <img
                  src="/auditmylisting-app.png"
                  alt="AuditMyListing app interface"
                  className="w-full"
                />
                <div className="p-6 flex items-center gap-4">
                  <img
                    src="/james-f.png"
                    alt="James F."
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-lg">James F.</p>
                    <p className="text-slate-600">Built AuditMyListing - Amazon & eBay listing optimization tool</p>
                  </div>
                </div>
              </div>

              {/* Product 2 - VerifyCreator - Jack G */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
                <img
                  src="/verifycreator-app.png"
                  alt="VerifyCreator app interface"
                  className="w-full"
                />
                <div className="p-6 flex items-center gap-4">
                  <img
                    src="/jack-g.png"
                    alt="Jack G."
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Jack G.</p>
                    <p className="text-slate-600">Built VerifyCreator - AI-powered influencer verification platform</p>
                  </div>
                </div>
              </div>

              {/* Product 3 - MusoBuddy - Tim F */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
                <img
                  src="/musobuddy-app.png"
                  alt="MusoBuddy app interface"
                  className="w-full"
                />
                <div className="p-6 flex items-center gap-4">
                  <img
                    src="/tim-f.png"
                    alt="Tim F."
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Tim F.</p>
                    <p className="text-slate-600">Built MusoBuddy - Gig management software for freelance musicians</p>
                  </div>
                </div>
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
                    You're NOT learning to code. You're learning to DIRECT AI to code for you. I give you the exact prompts. You paste them. The AI builds. It's like having a developer on call 24/7 for pennies.
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
                  <span className="font-semibold text-slate-900">Progress Tracking with Badges and Streaks</span>
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
                  <span className="font-semibold text-slate-900">Focus Mode with Binaural Beats</span>
                  <p className="text-slate-600 mt-1">Built-in concentration audio with 5 modes: Focus, Deep Focus, Calm Focus, Creative Flow, and Relaxation. Put on headphones, pick a mode, and get in the zone.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">12 Months Access to Complete the Challenge</span>
                  <p className="text-slate-600 mt-1">One year to go from zero to working product. AI tools move fast - you'll always use the CURRENT methods, not outdated ones.</p>
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
                    <span>You want to build something (with or without an idea already)</span>
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
                  <span>Progress tracking with badges and streaks <span className="text-slate-400">(Value: Priceless motivation)</span></span>
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

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              Why Not Lifetime? Because AI Moves FAST.
            </h3>

            <p>
              The tools, the methods, the prompts are evolving constantly. What works today might be completely different in 2 years. I want you using the CURRENT system, not something outdated.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              One Year Is MORE Than Enough Time
            </h3>

            <p>
              Most people who take action finish in a few weeks. If you can't find 21 days within an entire YEAR to build your product, this probably isn't for you. The ones who don't finish in a year were never going to finish anyway.
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
              If you go through the challenge every day, do the work, and DON'T have a working software product at the end of it, one of my vibe coding coaches will jump on a call with you, figure out what went wrong, and help you fix it.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              And If We STILL Can't Get You There? Full Refund. No Questions.
            </h3>

            <p>
              Why am I confident making this offer? Because I KNOW that if you actually show up and follow the system, you WILL have a product at the end. That's not a guess. That's just how this works.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              The ONLY Way to Fail Is to Not Show Up
            </h3>

            <p>
              And if you're the type who won't show up, please don't join. Save us both the time.
            </p>

            <p className="font-bold text-slate-900 text-right pt-4">
              - Matt Webley
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

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              "Later" Is Where Dreams Go to DIE
            </h3>

            <p>
              How many times have you told yourself you'd start "next week"? "Next month"? "When things calm down"?
            </p>

            <p>
              Things NEVER calm down. There's NEVER a perfect time. The only time you actually have control over is RIGHT NOW.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              21 Days From Now: A Working Product, or Still Thinking About It?
            </h3>

            <ul className="space-y-2 pl-6">
              <li>• 21 days from today, you could have a WORKING product</li>
              <li>• Or 21 days from today, you could be exactly where you are NOW, still thinking about it</li>
            </ul>

            <p>
              The time is going to pass EITHER WAY. The question is: what will you have to SHOW for it?
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
                <p className="text-slate-600">You'll use Replit, Claude Code, and ChatGPT. The entire challenge should cost less than $100 in AI tools.</p>
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

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center">
              You've Read This Far. That Tells Me Something About You.
            </h3>

            <p>
              It tells me you're SERIOUS. That you're not just daydreaming about building software. You actually want to DO it.
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              So Here's the Question: What's It Going to Be?
            </h3>

            <p>
              <strong>Option A:</strong> Close this page. Tell yourself you'll "think about it." Watch another month go by. Then another. Keep the ideas in your head where they've been sitting for YEARS. Stay exactly where you are.
            </p>

            <p>
              <strong>Option B:</strong> Join the challenge. Show up daily for 21 days. Follow the system. And in three weeks, look at the ACTUAL, WORKING product you built with your own hands (okay, with AI's hands, but YOU directed them).
            </p>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 text-center pt-6">
              One Option Keeps You STUCK. The Other Gets You MOVING.
            </h3>

            <p>
              The choice is yours. But choose NOW, while you're thinking about it. Because "later" rarely comes.
            </p>

            <p className="font-bold text-slate-900 text-center pt-6 text-xl">
              I'll see you inside.
            </p>
            <p className="font-bold text-slate-900 text-center">
              - Matt Webley
            </p>
          </div>

          {/* CTA Section */}
          <div className="pt-8 pb-12 text-center space-y-4">
            <a
              href="/order"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-5 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              YES! I'm Ready To Start
              <ArrowRight className="w-6 h-6 inline ml-2" />
            </a>
            <p className="text-slate-500 text-sm">
              One-time payment · Instant access · 12 months
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
            The 21 Day AI SaaS Challenge takes you from "I want to build something" to "I have a WORKING product" in 21 days. No idea yet? Day 1 generates 28 personalized ideas for you. No coding required. AI does the heavy lifting. You just show up daily and follow the system.
          </p>

          <p>
            <strong>P.P.S.</strong> - Remember: the barrier to building software USED to be $250,000+ and 2-3 years. Even tiny tools cost $50K+. Now it's £295 and 21 days. This window won't last forever. The people who move NOW will have a massive head start on everyone who waits.
          </p>

          <p>
            <strong>P.P.P.S.</strong> - If you complete all 21 days and don't feel like you got value, email me. We'll sort it out. I don't hide behind fine print. Your success is MY success.
          </p>

          <p className="font-bold text-slate-900 pt-4">
            - Matt
          </p>
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
            © {new Date().getFullYear()} Webley Global - FZCO, Dubai. All rights reserved.
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

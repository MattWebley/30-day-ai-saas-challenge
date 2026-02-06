import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ExternalLink, Star, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface ShowcaseEntry {
  id: number;
  appName: string;
  description: string;
  screenshotUrl: string;
  liveUrl: string | null;
  featured: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export default function Showcase() {
  const { data: entries, isLoading } = useQuery<ShowcaseEntry[]>({
    queryKey: ["/api/showcase"],
  });

  const featuredEntries = entries?.filter((e) => e.featured) || [];
  const regularEntries = entries?.filter((e) => !e.featured) || [];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="Matt Webley"
                className="w-10 h-10 rounded-full"
              />
              <span className="font-bold text-xl tracking-tight">21-Day AI SaaS Challenge</span>
            </a>
          </Link>
          <div className="flex gap-4 items-center">
            <a href="/login">
              <Button variant="ghost" className="font-medium text-slate-900 hover:text-primary hover:bg-blue-50">
                Login
              </Button>
            </a>
            <a href="/login">
              <Button className="rounded-lg px-6 font-semibold shadow-none">Join Challenge</Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-slate-50 to-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold tracking-wide uppercase border border-purple-100">
              <Trophy className="w-4 h-4" />
              <span>Community Showcase</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Built in 21 Days.{" "}
              <span className="text-primary">Launched for Real.</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Real products built by real people who completed the 21-Day AI SaaS Challenge.
              No fluff. Just shipped.
            </p>

            <div className="pt-4">
              <a href="/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl font-bold gap-3 shadow-lg shadow-primary/20">
                  Build Your Own <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </motion.div>
        </section>

        {/* Showcase Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 mt-4">Loading showcase...</p>
              </div>
            ) : entries?.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No apps yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Be the first to complete the 21-Day Challenge and get featured here!
                </p>
                <a href="/login" className="mt-6 inline-block">
                  <Button className="gap-2">
                    Start the Challenge <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ) : (
              <>
                {/* Featured Entries */}
                {featuredEntries.length > 0 && (
                  <div className="mb-16">
                    <div className="flex items-center gap-2 mb-8">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <h2 className="text-2xl font-bold text-slate-900">Featured</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      {featuredEntries.map((entry, i) => (
                        <ShowcaseCard key={entry.id} entry={entry} index={i} featured />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Entries */}
                {regularEntries.length > 0 && (
                  <div>
                    {featuredEntries.length > 0 && (
                      <h2 className="text-2xl font-bold text-slate-900 mb-8">All Builds</h2>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularEntries.map((entry, i) => (
                        <ShowcaseCard key={entry.id} entry={entry} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Build Yours?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join the challenge and go from idea to launch-ready AI SaaS in just 21 days.
              Your app could be featured here next.
            </p>
            <a href="/login">
              <Button
                size="lg"
                className="h-16 px-10 text-lg rounded-xl font-bold gap-3 bg-white text-slate-900 hover:bg-slate-100"
              >
                Start Day 1 for Free <ArrowRight className="w-6 h-6" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <img
              src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
              alt="Matt Webley"
              className="w-6 h-6 rounded-full"
            />
            <span>21-Day AI SaaS Challenge by Matt Webley</span>
          </div>
          <div className="flex gap-6">
            <a href="https://mattwebley.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              mattwebley.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShowcaseCard({
  entry,
  index,
  featured = false,
}: {
  entry: ShowcaseEntry;
  index: number;
  featured?: boolean;
}) {
  const creatorName =
    entry.user.firstName && entry.user.lastName
      ? `${entry.user.firstName} ${entry.user.lastName}`
      : entry.user.firstName || "Anonymous Builder";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card
        className={`overflow-hidden bg-white border-2 hover:border-primary/50 transition-none ${
          featured ? "border-amber-200" : "border-slate-200"
        }`}
      >
        {/* Screenshot */}
        <div className="aspect-video bg-slate-100 relative overflow-hidden">
          <img
            src={entry.screenshotUrl}
            alt={entry.appName}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Preview";
            }}
          />
          {featured && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-bold">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-bold text-lg text-slate-900 leading-tight">{entry.appName}</h3>
            {entry.liveUrl && (
              <a
                href={entry.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{entry.description}</p>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            {entry.user.profileImageUrl ? (
              <img
                src={entry.user.profileImageUrl}
                alt={creatorName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                {creatorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span>Built by {creatorName}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

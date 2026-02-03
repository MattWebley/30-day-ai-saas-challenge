import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Globe,
  Copy,
  ExternalLink,
  Sparkles,
  ListChecks
} from "lucide-react";
import { ds } from "@/lib/design-system";

interface Day20GetFoundProps {
  appName: string;
  onComplete: (data: {
    seoOptimized: boolean;
    submittedToGoogle: boolean;
    directoriesSubmitted: string[]
  }) => void;
}

const DIRECTORIES = [
  { name: "Google Search Console", url: "https://search.google.com/search-console", priority: true, description: "Essential - submit your sitemap here" },
  { name: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", priority: true, description: "Easy setup, same process as Google" },
  { name: "Product Hunt", url: "https://www.producthunt.com", priority: false, description: "Launch when ready for visibility" },
  { name: "BetaList", url: "https://betalist.com/submit", priority: false, description: "Free, good for early adopters" },
  { name: "SaaSHub", url: "https://www.saashub.com", priority: false, description: "SaaS-specific directory" },
  { name: "AlternativeTo", url: "https://alternativeto.net/manage-software/", priority: false, description: "List as alternative to competitors" },
  { name: "Indie Hackers", url: "https://www.indiehackers.com/products", priority: false, description: "Share your product and story" },
  { name: "Hacker News (Show HN)", url: "https://news.ycombinator.com/submit", priority: false, description: "Tech-focused audience" },
  { name: "G2", url: "https://www.g2.com/products/new", priority: false, description: "Business software reviews" },
  { name: "Capterra", url: "https://www.capterra.com/vendors/sign-up", priority: false, description: "Business software directory" }
];

export function Day20GetFound({ appName, onComplete }: Day20GetFoundProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "optimize" | "submit" | "directories" | "complete"
  >("intro");

  const [promptCopied, setPromptCopied] = useState(false);
  const [seoOptimized, setSeoOptimized] = useState(false);
  const [submittedToGoogle, setSubmittedToGoogle] = useState(false);
  const [submittedDirectories, setSubmittedDirectories] = useState<string[]>([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const toggleDirectory = (name: string) => {
    if (submittedDirectories.includes(name)) {
      setSubmittedDirectories(submittedDirectories.filter(d => d !== name));
    } else {
      setSubmittedDirectories([...submittedDirectories, name]);
    }
  };

  // One comprehensive SEO prompt that does everything
  const seoPrompt = `Do a complete SEO setup for my app "${appName || "my app"}":

STEP 1 - KEYWORD RESEARCH
First, analyze my app and identify:
- 1 primary keyword (the main thing people search for when looking for this type of solution)
- 3-5 secondary keywords (related terms, features, use cases)
- 3-5 long-tail keywords (specific phrases with lower competition)

Focus on keywords a new site can realistically rank for.

STEP 2 - ON-PAGE SEO
Using the keywords you identified, optimize my app:

1. TITLE TAG (50-60 characters)
   - Primary keyword near the beginning
   - Compelling and clickable

2. META DESCRIPTION (150-160 characters)
   - Include primary keyword naturally
   - Clear call-to-action

3. H1 HEADING
   - Include primary keyword
   - Only ONE H1 per page

4. H2/H3 SUBHEADINGS
   - Use secondary keywords in subheadings
   - Structure content logically

5. IMAGE ALT TEXT
   - Add descriptive alt text to all images
   - Include keywords where natural

6. OPEN GRAPH TAGS
   - og:title, og:description, og:image
   - og:type = "website"
   - For social media sharing

7. X/TWITTER CARD TAGS
   - twitter:card, twitter:title, twitter:description, twitter:image
   - (Tag names are still "twitter:" - that's the standard)

8. FAVICON
   - Create a simple favicon using the app's brand color
   - Add to HTML head

9. SITEMAP.XML
   - Create /sitemap.xml listing all pages
   - Set appropriate priority for each

10. ROBOTS.TXT
    - Create /robots.txt pointing to sitemap
    - Allow all crawlers

Apply these to my homepage first. Show me which keywords you chose and why.`;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Get Found Online</h3>
                <p className={ds.muted}>Right now, if someone Googles or asks AI for what your app does, they won't find you. Let's fix that.</p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>What is SEO?</h4>
            <p className={`${ds.body} mb-4`}>
              SEO (Search Engine Optimization) is making your app easy for Google to understand
              and show to people searching for what you offer.
            </p>
            <p className={ds.body}>
              It starts with <strong>keywords</strong> - the words people type when looking for a solution like yours.
              Then you optimize your pages so Google knows what you're about.
            </p>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>Why This Matters</h4>
            <div className="space-y-3">
              {[
                "People search Google 8.5 BILLION times per day",
                "SEO is FREE traffic that compounds over time",
                "A page you optimize today can bring visitors for YEARS",
                "Being mentioned online also helps AI assistants recommend you"
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className={ds.body}>{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>The catch:</strong> Google doesn't trust brand new sites.
              It can take weeks or months before they start sending traffic. The sooner you do this, the sooner that clock starts.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("optimize")}
          >
            Let's Optimize My App <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: One Comprehensive SEO Prompt */}
      {step === "optimize" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("intro")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Complete SEO Setup</h3>
                <p className={ds.muted}>One prompt that does everything - keyword research AND optimization.</p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-2`}>What This Prompt Does</h4>
            <p className={`${ds.muted} mb-4`}>Claude Code will handle all of this for you:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Find the best keywords",
                "Title tags",
                "Meta descriptions",
                "H1/H2 headings",
                "Image alt text",
                "Open Graph tags",
                "X/Twitter cards",
                "Favicon",
                "Sitemap.xml",
                "Robots.txt"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className={ds.body}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-3`}>The SEO Prompt</h4>
            <p className={`${ds.muted} mb-4`}>Copy this into Claude Code and let it do the work</p>

            <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-100 font-mono whitespace-pre-wrap mb-4 max-h-72 overflow-y-auto">
              {seoPrompt}
            </div>

            <Button
              variant="outline"
              onClick={() => copyToClipboard(seoPrompt)}
              className="gap-2"
            >
              {promptCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeoOptimized(!seoOptimized)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  seoOptimized
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-300"
                }`}
              >
                {seoOptimized && <Check className="w-4 h-4" />}
              </button>
              <p className={ds.body}>I've run the SEO prompt in Claude Code</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("submit")}
          >
            Submit to Google <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Submit to Google */}
      {step === "submit" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("optimize")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Submit to Google</h3>
                <p className={ds.muted}>Now tell Google your site exists. This is how you get indexed.</p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>Google Search Console Setup</h4>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Go to Google Search Console",
                  desc: "Sign in with your Google account",
                  link: "https://search.google.com/search-console"
                },
                {
                  step: 2,
                  title: "Add your property",
                  desc: "Enter your domain. Choose 'URL prefix' for easier setup."
                },
                {
                  step: 3,
                  title: "Verify ownership",
                  desc: "Add the HTML meta tag to your site's <head>. Claude Code can help."
                },
                {
                  step: 4,
                  title: "Submit your sitemap",
                  desc: "Go to Sitemaps → Enter 'sitemap.xml' → Submit."
                }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <p className={ds.label}>{item.title}</p>
                    <p className={ds.muted}>{item.desc}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
                      >
                        Open Google Search Console <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <p className={`${ds.body} mb-4`}>
              <strong>Need help with verification?</strong> Tell Claude Code:
            </p>
            <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-100 font-mono mb-3">
              Google Search Console gave me this verification meta tag:{"\n\n"}
              [paste the meta tag here]{"\n\n"}
              Add it to my site's {"<head>"} section.
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSubmittedToGoogle(!submittedToGoogle)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  submittedToGoogle
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-300"
                }`}
              >
                {submittedToGoogle && <Check className="w-4 h-4" />}
              </button>
              <p className={ds.body}>I've submitted my site to Google Search Console</p>
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Don't worry if it takes time.</strong> Google can take
              days or weeks to fully index your site. The important thing is you've submitted it.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("directories")}
          >
            Bonus: More Places to Submit <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Directories */}
      {step === "directories" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("submit")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <span className="text-sm text-slate-500">{submittedDirectories.length} submitted</span>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Directory Submissions</h3>
                <p className={ds.muted}>Free backlinks and traffic. Do these while watching TV.</p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-2`}>Essential</h4>
            <p className={`${ds.muted} mb-4`}>Do these first - most important for getting found</p>
            <div className="space-y-2">
              {DIRECTORIES.filter(d => d.priority).map((dir) => {
                const isSubmitted = submittedDirectories.includes(dir.name);
                return (
                  <div
                    key={dir.name}
                    className={`p-3 rounded-lg border transition-all ${
                      isSubmitted ? "border-green-300 bg-green-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDirectory(dir.name)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSubmitted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSubmitted && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={ds.label}>{dir.name}</p>
                          <a
                            href={dir.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className={ds.muted}>{dir.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-2`}>Nice to Have</h4>
            <p className={`${ds.muted} mb-4`}>Do these when you have time</p>
            <div className="space-y-2">
              {DIRECTORIES.filter(d => !d.priority).map((dir) => {
                const isSubmitted = submittedDirectories.includes(dir.name);
                return (
                  <div
                    key={dir.name}
                    className={`p-3 rounded-lg border transition-all ${
                      isSubmitted ? "border-green-300 bg-green-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDirectory(dir.name)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSubmitted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSubmitted && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={ds.label}>{dir.name}</p>
                          <a
                            href={dir.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className={ds.muted}>{dir.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <h4 className={`${ds.heading} mb-2`}>What About AI Search?</h4>
            <p className={`${ds.body} mb-3`}>
              More people are asking ChatGPT, Claude, and Perplexity for recommendations instead of Googling.
            </p>
            <p className={ds.body}>
              <strong>What helps:</strong> Being mentioned across the web - Reddit threads, review sites,
              comparison articles, forums. The directories above are a good start.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("complete")}
          >
            Complete Day 20 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">You're Now Discoverable</h3>
              <p className={ds.body}>
                Google knows you exist. Your pages are optimized. Traffic will come.
              </p>
              <p className={`${ds.muted} mt-3`}>
                Adding an automated SEO blog written by AI (one post per day) will help even more, but that's beyond the scope of this training.
              </p>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-3`}>What You've Done</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className={ds.body}>Learned how SEO works for SaaS</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className={ds.body}>Got the SEO optimization prompt</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className={ds.body}>Know how to submit to Google & directories</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className={ds.body}>Understand AI search discoverability</p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-3`}>Tomorrow: The Finish Line</h4>
            <p className={ds.body}>
              Day 21 is about seeing what {appName || "your app"} could actually earn -
              and completing the challenge. You're almost there.
            </p>
          </div>

          {/* Mentorship pitch */}
          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Want help getting your first customers?</strong>{" "}
              SEO takes time to kick in. If you want faster results, I can help you
              build a launch & marketing strategy that fits your app and audience - and work with you to implement it.
            </p>
            <a
              href="https://mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-primary font-medium hover:underline"
            >
              Book a free call <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              seoOptimized,
              submittedToGoogle,
              directoriesSubmitted: submittedDirectories
            })}
          >
            Complete Day 20 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}

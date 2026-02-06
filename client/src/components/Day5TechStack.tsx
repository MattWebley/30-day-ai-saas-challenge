import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Copy, Check, Users } from "lucide-react";
import { Link } from "wouter";
import { ds } from "@/lib/design-system";
import { toast } from "sonner";

interface Tool {
  name: string;
  description: string;
  url: string;
  required: boolean;
  icon: string;
}

interface Day5TechStackProps {
  dayId: number;
  onComplete: (data: { completedSetup: string[] }) => void;
  savedInputs?: Record<string, any>;
}

const REQUIRED_TOOLS: Tool[] = [
  {
    name: "Replit",
    description: "Your development environment. Easy to use, runs in browser, has a built-in AI agent as fallback.",
    url: "https://replit.com/refer/info7410",
    required: true,
    icon: "💻",
  },
  {
    name: "Claude Pro",
    description: "The powerhouse. Claude Code plugs into Replit - best coding model available, lower costs, incredible results.",
    url: "https://claude.ai",
    required: true,
    icon: "🤖",
  },
];

const RECOMMENDED_TOOLS: Tool[] = [
  {
    name: "Wispr Flow",
    description: "The secret weapon that separates fast builders from slow ones. Dictate your prompts, ideas, and instructions 3x faster than typing. Your brain moves faster than your fingers - Wispr Flow removes that bottleneck.",
    url: "https://ref.wisprflow.ai/matthew-webley",
    required: false,
    icon: "🎙️",
  },
];

const OPTIONAL_TOOLS: Tool[] = [
  {
    name: "Abacus.AI",
    description: "Video generation, text-to-speech, image generation - all sorts of AI models to create assets.",
    url: "https://chatllm.abacus.ai/WlwgmxfvHg",
    required: false,
    icon: "🧮",
  },
];

export function Day5TechStack({ dayId, onComplete, savedInputs }: Day5TechStackProps) {
  const [completedTools, setCompletedTools] = useState<Set<string>>(
    new Set(savedInputs?.completedSetup || [])
  );
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    toast.success("Prompt copied!");
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const toggleTool = (toolName: string) => {
    const newCompleted = new Set(completedTools);
    if (newCompleted.has(toolName)) {
      newCompleted.delete(toolName);
    } else {
      newCompleted.add(toolName);
    }
    setCompletedTools(newCompleted);
  };

  const allRequiredComplete = REQUIRED_TOOLS.every((tool) =>
    completedTools.has(tool.name)
  );

  const handleContinue = () => {
    onComplete({
      completedSetup: Array.from(completedTools),
    });
  };

  return (
    <div className="space-y-6">
      <div className={ds.cardWithPadding}>
        <div className="space-y-4">
          <div>
            <h3 className={ds.heading}>Your AI Tech Stack</h3>
            <p className={ds.body}>
              These tools will 10x your development speed
            </p>
            <p className={ds.muted + " mt-2"}>
              Today's goal: get these set up. Feel free to have a play around with them, but don't get distracted - we'll be using them properly very soon.
            </p>
          </div>
        </div>
      </div>

      {/* Required Tools */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <h4 className={ds.label}>Required Tools</h4>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium">
            MUST HAVE
          </span>
        </div>
        <p className={ds.body + " mb-4"}>
          Click the checkbox when you've set up each tool.
        </p>

        <div className="space-y-4">
          {REQUIRED_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className={completedTools.has(tool.name) ? ds.optionSelected : ds.optionDefault}
              onClick={() => toggleTool(tool.name)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTools.has(tool.name)}
                  onCheckedChange={() => {}}
                  className="mt-1 pointer-events-none"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <h5 className={ds.label}>{tool.name}</h5>
                  </div>
                  <p className={ds.muted + " mb-3"}>{tool.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => { e.stopPropagation(); window.open(tool.url, "_blank"); }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open {tool.name}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highly Recommended - Wispr Flow */}
      <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        {/* Speed Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
            ⚡ 3X FASTER
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h4 className={ds.label}>Highly Recommended</h4>
          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded font-medium">
            SPEED BOOST
          </span>
        </div>

        <p className="text-lg font-bold text-slate-900 mb-2">
          Want to build your SaaS 3x faster?
        </p>
        <p className={ds.body + " mb-4"}>
          Most students who use Wispr Flow complete the challenge in half the time. Why? Because you can speak 3x faster than you type. Your ideas flow directly into Claude without the typing bottleneck.
        </p>

        <div className="space-y-4">
          {RECOMMENDED_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className={`${completedTools.has(tool.name) ? 'bg-white border-2 border-primary' : 'bg-white/80 border-2 border-slate-200'} rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50`}
              onClick={() => toggleTool(tool.name)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTools.has(tool.name)}
                  onCheckedChange={() => {}}
                  className="mt-1 pointer-events-none"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <h5 className={ds.label}>{tool.name}</h5>
                  </div>
                  <p className={ds.muted + " mb-3"}>{tool.description}</p>

                  {/* Benefits List */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-green-500">✓</span> Talk instead of type
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-green-500">✓</span> Works everywhere
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-green-500">✓</span> Perfect for long prompts
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-green-500">✓</span> Free trial available
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => { e.stopPropagation(); window.open(tool.url, "_blank"); }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Try Wispr Flow Free
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Seriously - once you try dictation, you'll never go back to typing long prompts
        </p>
      </div>

      {/* Optional Tools */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center gap-2 mb-4">
          <h4 className={ds.label}>Optional Tools</h4>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">
            NICE TO HAVE
          </span>
        </div>
        <p className={ds.muted + " mb-4"}>
          Helpful but not required - you can add these later
        </p>

        <div className="space-y-4">
          {OPTIONAL_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className={completedTools.has(tool.name) ? ds.optionSelected : ds.optionDefault}
              onClick={() => toggleTool(tool.name)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTools.has(tool.name)}
                  onCheckedChange={() => {}}
                  className="mt-1 pointer-events-none"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <h5 className={ds.label}>{tool.name}</h5>
                  </div>
                  <p className={ds.muted + " mb-3"}>{tool.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => { e.stopPropagation(); window.open(tool.url, "_blank"); }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open {tool.name}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Secret Weapon */}
      <div className={ds.cardWithPadding}>
        <h4 className={ds.label + " mb-2"}>Your $500/hr Business Advisor</h4>
        <p className={ds.body + " mb-4"}>
          Here's what most people miss: These aren't just coding tools. You now have access to a business advisor that would cost $500/hour - available 24/7 for $20/month. Don't spend hours Googling - just ask.
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-slate-900 font-bold">USE IT FOR EVERYTHING</p>
          <ul className="space-y-1 text-slate-700">
            <li>• <span className="font-medium">Pricing:</span> "Should I charge $29 or $49/month?"</li>
            <li>• <span className="font-medium">Features:</span> "Which 3 features should I build first?"</li>
            <li>• <span className="font-medium">Copy:</span> "Write me 5 taglines for my SaaS"</li>
            <li>• <span className="font-medium">Stuck:</span> "This isn't working - here's the error..."</li>
            <li>• <span className="font-medium">Strategy:</span> "I'm stuck between two approaches, help me decide"</li>
          </ul>
        </div>

        <p className={ds.body + " mb-4"}>
          The founders who WIN treat AI as a <span className="font-bold">THINKING PARTNER</span>, not just a code generator.
        </p>

        <div className={ds.infoBoxHighlight + " mb-4"}>
          <p className={ds.muted}>
            <strong>Coming soon:</strong> When Claude Code is plugged into Replit (next lessons), it has FULL CONTEXT of your app. You can just ask questions naturally - no need for detailed explanations.
          </p>
        </div>

        <p className={ds.muted + " mb-4"}>
          Here are starter prompts for different situations. You'll only need these templates at first - eventually prompting becomes second nature.
        </p>

        {/* Problem-Solving Prompt */}
        <div className="p-4 bg-slate-900 rounded-lg mb-3">
          <p className="text-slate-400 text-xs mb-2 font-medium">🔧 FIXING A PROBLEM</p>
          <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-line">{`I'm trying to [WHAT YOU WANT TO HAPPEN].
But instead [WHAT'S ACTUALLY HAPPENING].
Error: [PASTE ERROR IF ANY]
How do I fix this?`}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 mb-4 transition-colors ${copiedPrompt === "fix" ? "bg-green-600 hover:bg-green-600 text-white border-green-600" : ""}`}
          onClick={() => copyPrompt("fix", `I'm trying to [WHAT YOU WANT TO HAPPEN].
But instead [WHAT'S ACTUALLY HAPPENING].
Error: [PASTE ERROR IF ANY]
How do I fix this?`)}
        >
          {copiedPrompt === "fix" ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
        </Button>

        {/* Advice/Hive Mind Prompt */}
        <div className="p-4 bg-slate-900 rounded-lg mb-3">
          <p className="text-slate-400 text-xs mb-2 font-medium">🧠 NEED ADVICE / HIVE MIND</p>
          <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-line">{`I'm building [YOUR APP].
I need to decide: [YOUR QUESTION/DECISION]
What are my options? What would you recommend and why?`}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 mb-4 transition-colors ${copiedPrompt === "advice" ? "bg-green-600 hover:bg-green-600 text-white border-green-600" : ""}`}
          onClick={() => copyPrompt("advice", `I'm building [YOUR APP].
I need to decide: [YOUR QUESTION/DECISION]
What are my options? What would you recommend and why?`)}
        >
          {copiedPrompt === "advice" ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
        </Button>

        {/* How Do I Prompt */}
        <div className="p-4 bg-slate-900 rounded-lg mb-3">
          <p className="text-slate-400 text-xs mb-2 font-medium">🤔 HOW DO I...</p>
          <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-line">{`How do I [THING YOU WANT TO DO] in [CONTEXT/TECH]?
Give me a simple example I can follow.`}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 mb-4 transition-colors ${copiedPrompt === "howto" ? "bg-green-600 hover:bg-green-600 text-white border-green-600" : ""}`}
          onClick={() => copyPrompt("howto", `How do I [THING YOU WANT TO DO] in [CONTEXT/TECH]?
Give me a simple example I can follow.`)}
        >
          {copiedPrompt === "howto" ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
        </Button>

        {/* Review My Approach Prompt */}
        <div className="p-4 bg-slate-900 rounded-lg mb-3">
          <p className="text-slate-400 text-xs mb-2 font-medium">👀 REVIEW MY APPROACH</p>
          <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-line">{`I'm planning to [YOUR APPROACH].
Is this a good idea? What am I missing?
What problems might I run into?`}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 transition-colors ${copiedPrompt === "review" ? "bg-green-600 hover:bg-green-600 text-white border-green-600" : ""}`}
          onClick={() => copyPrompt("review", `I'm planning to [YOUR APPROACH].
Is this a good idea? What am I missing?
What problems might I run into?`)}
        >
          {copiedPrompt === "review" ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
        </Button>

        <p className={ds.muted + " mt-4"}>
          These templates are training wheels. Soon you'll just talk to Claude like a colleague - but start here.
        </p>
      </div>

      {/* Coaching CTA */}
      <div className={ds.infoBoxHighlight}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className={ds.label + " mb-1"}>Want an expert building alongside you?</p>
            <p className={ds.muted + " mb-3"}>
              The build phase starts soon. If you'd prefer hands-on help from someone who's done this before, our coaching sessions let you build live on a call with an experienced vibe coder.
            </p>
            <Link href="/coaching">
              <Button variant="outline" size="sm">
                Learn About Coaching
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between">
          <div>
            {!allRequiredComplete ? (
              <>
                <p className={ds.label}>
                  Check off Replit and Claude Pro above when you've set them up
                </p>
                <p className={ds.muted + " mt-1"}>
                  {completedTools.has("Replit") ? "✓ Replit done" : "○ Replit needed"} · {completedTools.has("Claude Pro") ? "✓ Claude Pro done" : "○ Claude Pro needed"}
                </p>
              </>
            ) : (
              <>
                <p className={ds.label}>
                  All set! You're ready to move on.
                </p>
                <p className={ds.muted + " mt-1"}>
                  {completedTools.size} tools checked
                </p>
              </>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!allRequiredComplete}
          >
            {allRequiredComplete ? "Continue" : "Complete Setup First"}
          </Button>
        </div>
      </div>
    </div>
  );
}

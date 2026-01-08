import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";

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
}

const REQUIRED_TOOLS: Tool[] = [
  {
    name: "Replit",
    description: "Your AI-powered development environment. Build your entire SaaS without installing anything locally.",
    url: "https://replit.com/signup",
    required: true,
    icon: "💻",
  },
  {
    name: "Claude Code",
    description: "Your AI coding assistant. Writes code, fixes bugs, and helps you build faster.",
    url: "https://claude.ai",
    required: true,
    icon: "🤖",
  },
];

const OPTIONAL_TOOLS: Tool[] = [
  {
    name: "ChatGPT",
    description: "Additional AI assistance for brainstorming and problem-solving.",
    url: "https://chat.openai.com",
    required: false,
    icon: "💬",
  },
  {
    name: "Abacus.AI",
    description: "Advanced AI models for specialized tasks (optional).",
    url: "https://abacus.ai",
    required: false,
    icon: "🧮",
  },
];

export function Day5TechStack({ dayId, onComplete }: Day5TechStackProps) {
  const [completedTools, setCompletedTools] = useState<Set<string>>(new Set());

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
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Your AI Tech Stack</h3>
            <p className="text-slate-600">
              These tools will 10x your development speed
            </p>
          </div>
        </div>
      </Card>

      {/* Required Tools */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-bold text-slate-900">Required Tools</h4>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
            MUST HAVE
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          These are essential - you need both to build your SaaS
        </p>

        <div className="space-y-4">
          {REQUIRED_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-400 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTools.has(tool.name)}
                  onCheckedChange={() => toggleTool(tool.name)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <h5 className="font-bold text-slate-900">{tool.name}</h5>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(tool.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Sign Up for {tool.name}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optional Tools */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-bold text-slate-900">Optional Tools</h4>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
            NICE TO HAVE
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Helpful but not required - you can add these later
        </p>

        <div className="space-y-4">
          {OPTIONAL_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTools.has(tool.name)}
                  onCheckedChange={() => toggleTool(tool.name)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <h5 className="font-semibold text-slate-700">{tool.name}</h5>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(tool.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Check Out {tool.name}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Continue Button */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">
              {completedTools.size} of {REQUIRED_TOOLS.length + OPTIONAL_TOOLS.length} tools set up
            </p>
            {!allRequiredComplete && (
              <p className="text-sm text-slate-600 mt-1">
                Complete both required tools to continue
              </p>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!allRequiredComplete}
          >
            {allRequiredComplete ? "Continue" : "Complete Required Setup"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

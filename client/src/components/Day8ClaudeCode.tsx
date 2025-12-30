import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Terminal,
  Copy,
  CheckCircle2,
  Sparkles,
  Bug,
  Paintbrush,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day8ClaudeCodeProps {
  onComplete: () => void;
}

const PROMPT_TEMPLATES = [
  {
    id: "build",
    category: "Building",
    icon: Sparkles,
    title: "Create a new feature",
    template: `Create a [component/feature] that [does what].

It should:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Style it to match the existing design.`,
  },
  {
    id: "fix",
    category: "Fixing",
    icon: Bug,
    title: "Fix a bug",
    template: `I have a bug:

EXPECTED: [What should happen]
ACTUAL: [What's actually happening]
ERROR: [Paste any error message here]

Find and fix this issue.`,
  },
  {
    id: "improve",
    category: "Improving",
    icon: Paintbrush,
    title: "Improve existing code",
    template: `Improve the [component/page] by [specific change].

Keep the existing functionality but:
- [Change 1]
- [Change 2]

Don't break anything else.`,
  },
];

const GOLDEN_RULES = [
  { id: "specific", text: "Be SPECIFIC, not vague ('Add 16px padding' not 'make it look better')" },
  { id: "one-thing", text: "Ask for ONE thing at a time" },
  { id: "context", text: "Give CONTEXT about what you're trying to do" },
  { id: "examples", text: "Include EXAMPLES when possible" },
];

export function Day8ClaudeCode({ onComplete }: Day8ClaudeCodeProps) {
  const [rulesChecked, setRulesChecked] = useState<Set<string>>(new Set());
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleRule = (ruleId: string) => {
    const newChecked = new Set(rulesChecked);
    if (newChecked.has(ruleId)) {
      newChecked.delete(ruleId);
    } else {
      newChecked.add(ruleId);
    }
    setRulesChecked(newChecked);
  };

  const copyTemplate = (id: string, template: string) => {
    navigator.clipboard.writeText(template);
    setCopiedTemplate(id);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard",
    });
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const allRulesChecked = GOLDEN_RULES.every((rule) => rulesChecked.has(rule.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Master Claude Code</h3>
            <p className="text-slate-600 mt-1">Learn the prompts and patterns that make AI coding fast and effective.</p>
          </div>
        </div>
      </Card>

      {/* Golden Rules Checklist */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">The Golden Rules</h4>
        <p className="text-sm text-slate-600 mb-4">Review and acknowledge each rule:</p>
        <div className="space-y-3">
          {GOLDEN_RULES.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleRule(rule.id)}
            >
              <Checkbox
                checked={rulesChecked.has(rule.id)}
                onCheckedChange={() => toggleRule(rule.id)}
              />
              <span className="text-sm text-slate-700">{rule.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Templates */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Essential Prompt Templates</h4>
        <p className="text-sm text-slate-600 mb-4">Copy these and customize for your needs:</p>
        <div className="space-y-4">
          {PROMPT_TEMPLATES.map((prompt) => (
            <div key={prompt.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <prompt.icon className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-900">{prompt.title}</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">{prompt.category}</span>
              </div>
              <div className="p-3">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded">
                  {prompt.template}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => copyTemplate(prompt.id, prompt.template)}
                >
                  {copiedTemplate === prompt.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Complete Button */}
      {allRulesChecked && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          I've Got It - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

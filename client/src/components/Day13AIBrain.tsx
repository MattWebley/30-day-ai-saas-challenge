import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Key,
  ExternalLink,
  Copy,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day13AIBrainProps {
  userIdea: string;
  onComplete: () => void;
}

const SETUP_STEPS = [
  { id: "openai-account", text: "Created OpenAI account at platform.openai.com", url: "https://platform.openai.com" },
  { id: "openai-key", text: "Generated API key in OpenAI dashboard" },
  { id: "replit-secrets", text: "Added OPENAI_API_KEY to Replit Secrets" },
  { id: "tested", text: "Tested AI feature in my app" },
];

const AI_PROMPT_TEMPLATE = `Add an AI feature that [describe what it does].

When user [clicks button / submits form]:
1. Take their input from [input field]
2. Send to OpenAI with this instruction: "[what AI should do with input]"
3. Show result in [where to display]

Use OPENAI_API_KEY from secrets.
Add loading state while processing.
Handle errors gracefully.`;

export function Day13AIBrain({ userIdea, onComplete }: Day13AIBrainProps) {
  const [setupChecked, setSetupChecked] = useState<Set<string>>(new Set());
  const [aiFeatureDesc, setAiFeatureDesc] = useState("");
  const { toast } = useToast();

  const toggleSetup = (id: string) => {
    const newChecked = new Set(setupChecked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setSetupChecked(newChecked);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
    toast({
      title: "Copied!",
      description: "Prompt template copied to clipboard",
    });
  };

  const allSetupComplete = SETUP_STEPS.every((step) => setupChecked.has(step.id));
  const canComplete = allSetupComplete && aiFeatureDesc.length > 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Add The AI Brain</h3>
            <p className="text-slate-600 mt-1">Give your app intelligence with OpenAI integration.</p>
          </div>
        </div>
      </Card>

      {/* Cost Info */}
      <Card className="p-4 border-2 border-green-200 bg-green-50">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">API Costs Are Low</p>
            <p className="text-sm text-green-700 mt-1">
              GPT-3.5: ~$0.002 per 1K tokens (500 calls for $1)<br />
              GPT-4: ~$0.06 per 1K tokens (more capable)
            </p>
          </div>
        </div>
      </Card>

      {/* Setup Checklist */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Setup Checklist</h4>
        <div className="space-y-3">
          {SETUP_STEPS.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleSetup(step.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={setupChecked.has(step.id)}
                  onCheckedChange={() => toggleSetup(step.id)}
                />
                <span className="text-sm text-slate-700">{step.text}</span>
              </div>
              {step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Template */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">AI Feature Prompt Template</h4>
        <p className="text-sm text-slate-600 mb-4">Copy this and customize for your app:</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {AI_PROMPT_TEMPLATE}
        </pre>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
          <Copy className="w-4 h-4" />
          Copy Template
        </Button>
      </Card>

      {/* AI Feature Description */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">What AI Feature Did You Add?</h4>
        <p className="text-sm text-slate-600 mb-4">Describe the AI feature you added to your app:</p>
        <Textarea
          placeholder="e.g., 'AI generates social media posts from user's blog content' or 'AI analyzes uploaded data and provides insights'"
          value={aiFeatureDesc}
          onChange={(e) => setAiFeatureDesc(e.target.value)}
          className="min-h-[100px]"
        />
        {userIdea && (
          <p className="text-xs text-slate-500 mt-2">Your app: {userIdea}</p>
        )}
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          AI Brain Added - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

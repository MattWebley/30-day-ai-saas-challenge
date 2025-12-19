import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Brain,
  Copy,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wand2,
  Search,
  MessageSquare,
  Cog,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day16AIBrainProps {
  dayId: number;
  userIdea: string;
  onComplete: () => void;
}

const AI_USE_CASES = [
  {
    id: "generate",
    label: "GENERATE content",
    icon: Wand2,
    description: "Create text, ideas, suggestions, variations",
    examples: ["Generate blog posts", "Create product descriptions", "Write email drafts"],
    promptTemplate: "Generate [CONTENT TYPE] based on [USER INPUT]"
  },
  {
    id: "analyze",
    label: "ANALYZE data",
    icon: Search,
    description: "Insights, summaries, scores, explanations",
    examples: ["Summarize documents", "Score content quality", "Extract key points"],
    promptTemplate: "Analyze [DATA] and provide [INSIGHT TYPE]"
  },
  {
    id: "answer",
    label: "ANSWER questions",
    icon: MessageSquare,
    description: "Chatbot, help system, support assistant",
    examples: ["Answer product questions", "Provide recommendations", "Explain concepts"],
    promptTemplate: "Answer questions about [TOPIC] in [TONE]"
  },
  {
    id: "automate",
    label: "AUTOMATE tasks",
    icon: Cog,
    description: "Processing, sorting, tagging, organizing",
    examples: ["Categorize submissions", "Tag content automatically", "Route requests"],
    promptTemplate: "Automatically [ACTION] when [TRIGGER]"
  },
];

export function Day16AIBrain({ dayId, userIdea, onComplete }: Day16AIBrainProps) {
  const [step, setStep] = useState<"usecase" | "define" | "prompt" | "test">("usecase");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [trigger, setTrigger] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [aiInstruction, setAiInstruction] = useState<string>("");
  const [outputLocation, setOutputLocation] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [testChecklist, setTestChecklist] = useState({
    apiKeyStored: false,
    loadingState: false,
    outputDisplays: false,
    errorsHandled: false,
  });
  const { toast } = useToast();

  const useCase = AI_USE_CASES.find(u => u.id === selectedUseCase);

  const generateBuildPrompt = () => {
    const prompt = `Add an AI-powered feature to my app:

WHAT IT DOES:
${useCase?.label} - ${aiInstruction}

WHEN IT TRIGGERS:
${trigger}

USER INPUT:
${userInput}

AI INSTRUCTION:
"${aiInstruction}"

OUTPUT:
Display the result ${outputLocation}

IMPLEMENTATION:
1. Use the OpenAI API key from secrets (OPENAI_API_KEY)
2. When user ${trigger.toLowerCase()}:
   - Take their input: ${userInput}
   - Send to OpenAI with instruction: "${aiInstruction}"
   - Show loading spinner while processing
   - Display result ${outputLocation}
3. Handle errors gracefully (show friendly message if AI fails)
4. Add a "regenerate" button to try again

Make this feel magical but fast. Users should see results in 2-5 seconds.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "AI Feature Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const toggleTest = (key: keyof typeof testChecklist) => {
    setTestChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allTestsPass = Object.values(testChecklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Give Your App A BRAIN</h3>
            <p className="text-slate-600 mt-1">
              This is what makes people say "WOW" - AI that actually helps.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Use Case", "Define", "Build", "Test"].map((label, idx) => {
          const steps = ["usecase", "define", "prompt", "test"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-purple-100 text-purple-700" :
                isCurrent ? "bg-purple-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Use Case */}
      {step === "usecase" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What should AI DO in your app?</h4>
          <p className="text-sm text-slate-500 mb-4">Pick the primary purpose of your AI feature</p>

          <div className="grid gap-3">
            {AI_USE_CASES.map((uc) => {
              const Icon = uc.icon;
              return (
                <button
                  key={uc.id}
                  onClick={() => setSelectedUseCase(uc.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedUseCase === uc.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 mt-0.5 ${
                      selectedUseCase === uc.id ? "text-purple-600" : "text-slate-500"
                    }`} />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{uc.label}</div>
                      <div className="text-sm text-slate-600 mt-1">{uc.description}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uc.examples.map((ex, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedUseCase === uc.id && <CheckCircle2 className="w-5 h-5 text-purple-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!selectedUseCase}
            onClick={() => setStep("define")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Define */}
      {step === "define" && useCase && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Define Your AI Feature</h4>
          <p className="text-sm text-slate-500 mb-4">Fill in the details for your {useCase.label.toLowerCase()} feature</p>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                When does it trigger?
              </label>
              <Input
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="e.g., When user clicks the 'Generate' button"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                What's the user input?
              </label>
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., The text in the main textarea"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                What should AI do with it?
              </label>
              <Textarea
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder={`e.g., ${useCase.promptTemplate}`}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                Where does the output go?
              </label>
              <Input
                value={outputLocation}
                onChange={(e) => setOutputLocation(e.target.value)}
                placeholder="e.g., In a new card below the input"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("usecase")}>
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!trigger || !userInput || !aiInstruction || !outputLocation}
              onClick={generateBuildPrompt}
            >
              Generate Build Prompt <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your AI Feature Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-purple-500 hover:bg-purple-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => setStep("test")}
            >
              I've Built It - Let's Test <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900">Don't forget your API key!</div>
                <div className="text-sm text-amber-800 mt-1">
                  In Replit: Tools → Secrets → Add OPENAI_API_KEY with your key from platform.openai.com
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Step 4: Test */}
      {step === "test" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Test Your AI Feature</h4>
          <p className="text-sm text-slate-500 mb-4">Check each item as you verify it works</p>

          <div className="space-y-3">
            {[
              { key: "apiKeyStored", label: "API key is stored in Secrets", desc: "Check Replit Secrets for OPENAI_API_KEY" },
              { key: "loadingState", label: "Loading state shows while processing", desc: "You should see a spinner or 'Processing...' text" },
              { key: "outputDisplays", label: "AI output displays correctly", desc: "The generated content appears where expected" },
              { key: "errorsHandled", label: "Errors are handled gracefully", desc: "Try with empty input - does it show a helpful message?" },
            ].map((item) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  testChecklist[item.key as keyof typeof testChecklist]
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 hover:border-green-300"
                }`}
                onClick={() => toggleTest(item.key as keyof typeof testChecklist)}
              >
                <Checkbox checked={testChecklist[item.key as keyof typeof testChecklist]} />
                <div>
                  <div className="font-semibold text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {allTestsPass && (
            <Card className="p-4 border-2 border-green-300 bg-green-50 mt-4">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">Your app has a BRAIN now!</div>
                  <div className="text-sm text-green-700">This is what separates you from "just another tool."</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("prompt")}>
              Back to Prompt
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!allTestsPass}
              onClick={onComplete}
            >
              Complete Day 16
            </Button>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">AI Feature Tips</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Start simple.</strong> One AI feature done well beats five done poorly.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Be specific in instructions.</strong> "Summarize in 3 bullet points" beats "summarize this."</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Cost is tiny.</strong> ~$0.002 per request. Don't overthink it.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

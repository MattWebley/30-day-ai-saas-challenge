import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, ExternalLink, Wrench, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Day4Props {
  onComplete: () => void;
}

export function Day4ToolSetup({ onComplete }: Day4Props) {
  const queryClient = useQueryClient();
  const [replitChecked, setReplitChecked] = useState(false);
  const [aiToolSelected, setAiToolSelected] = useState<string | null>(null);
  const [aiToolSetup, setAiToolSetup] = useState(false);

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const handleComplete = () => {
    saveProgress.mutate({
      replitVerified: replitChecked,
      aiTool: aiToolSelected,
      aiToolSetup: aiToolSetup,
    });
    onComplete();
  };

  const allComplete = replitChecked && aiToolSelected && aiToolSetup;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Up Your AI Tools</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          You need 2 things to build your SaaS: Replit (to code) and an AI assistant (to help you code).
        </p>
      </div>

      {/* Step 1: Replit */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setReplitChecked(!replitChecked)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
              replitChecked ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            {replitChecked && <Check className="w-4 h-4 text-white" />}
          </button>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 mb-2">1. Verify Replit Access</h3>
            <p className="text-sm text-slate-600 mb-3">
              You're already using Replit to access this app! Just confirm you can log in to Replit.com
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://replit.com', '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
              Open Replit.com
            </Button>
          </div>
        </div>
      </Card>

      {/* Step 2: Choose AI Tool */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-900 mb-2">2. Choose Your AI Assistant</h3>
          <p className="text-sm text-slate-600">
            Pick ONE tool to help you generate code and your PRD. All are $20/month.
          </p>
        </div>

        <div className="grid gap-3">
          {/* ChatGPT */}
          <button
            onClick={() => setAiToolSelected('chatgpt')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              aiToolSelected === 'chatgpt'
                ? 'border-black bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                aiToolSelected === 'chatgpt' ? 'border-black bg-black' : 'border-slate-300'
              }`}>
                {aiToolSelected === 'chatgpt' && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">ChatGPT Plus</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Most popular. Great for PRDs and general coding help.
                </p>
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">$20/month</span>
              </div>
            </div>
          </button>

          {/* Claude */}
          <button
            onClick={() => setAiToolSelected('claude')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              aiToolSelected === 'claude'
                ? 'border-black bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                aiToolSelected === 'claude' ? 'border-black bg-black' : 'border-slate-300'
              }`}>
                {aiToolSelected === 'claude' && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">Claude Pro</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Excellent for coding and technical documentation. Best for complex PRDs.
                </p>
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">$20/month</span>
              </div>
            </div>
          </button>

          {/* Abacus AI */}
          <button
            onClick={() => setAiToolSelected('abacus')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              aiToolSelected === 'abacus'
                ? 'border-black bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                aiToolSelected === 'abacus' ? 'border-black bg-black' : 'border-slate-300'
              }`}>
                {aiToolSelected === 'abacus' && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">Abacus AI</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Alternative AI assistant with coding capabilities.
                </p>
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">$20/month</span>
              </div>
            </div>
          </button>
        </div>

        {aiToolSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-slate-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900">Set Up {aiToolSelected === 'chatgpt' ? 'ChatGPT' : aiToolSelected === 'claude' ? 'Claude' : 'Abacus AI'}</h4>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">1.</span>
                <div className="flex-1">
                  <span>Create your account:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 ml-2"
                    onClick={() => {
                      const urls = {
                        chatgpt: 'https://chat.openai.com',
                        claude: 'https://claude.ai',
                        abacus: 'https://abacus.ai'
                      };
                      window.open(urls[aiToolSelected as keyof typeof urls], '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Sign Up
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">2.</span>
                <span>Upgrade to the paid plan ($20/month)</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">3.</span>
                <span>Test it by asking: "Help me build a SaaS product"</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">4.</span>
                <span>Once it responds, check the box below:</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => setAiToolSetup(!aiToolSetup)}
                className="flex items-center gap-3 w-full"
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  aiToolSetup ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-slate-400'
                }`}>
                  {aiToolSetup && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  I've set up my account and it's working!
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Summary */}
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">You're All Set!</h3>
                <p className="text-sm text-green-700 mb-3">
                  You have everything you need to build your SaaS:
                </p>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>✓ Replit account (for building)</li>
                  <li>✓ {aiToolSelected === 'chatgpt' ? 'ChatGPT Plus' : aiToolSelected === 'claude' ? 'Claude Pro' : 'Abacus AI'} (for AI help)</li>
                </ul>
                <p className="text-sm text-green-700 mt-3 font-medium">
                  Tomorrow: You'll generate your complete PRD and start building!
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full mt-4 h-14 text-lg font-bold gap-2"
            onClick={handleComplete}
            data-testid="button-complete-day4"
          >
            Complete Day 4 <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

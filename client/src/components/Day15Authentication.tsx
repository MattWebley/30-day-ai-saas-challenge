import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Copy,
  CheckCircle2,
  ChevronRight,
  User,
  Key,
  Mail,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day15AuthenticationProps {
  appName: string;
  onComplete: () => void;
}

const AUTH_OPTIONS = [
  {
    id: "replit",
    icon: Sparkles,
    name: "Replit Auth",
    desc: "One-click setup, secure",
    pros: "Fastest to implement",
    recommended: true,
  },
  {
    id: "email",
    icon: Mail,
    name: "Email + Password",
    desc: "Traditional, users know it",
    pros: "Full control",
    recommended: false,
  },
  {
    id: "social",
    icon: User,
    name: "Social Login",
    desc: "Google, GitHub, etc.",
    pros: "Easy for users",
    recommended: false,
  },
  {
    id: "magic",
    icon: Key,
    name: "Magic Link",
    desc: "Passwordless via email",
    pros: "Modern, secure",
    recommended: false,
  },
];

const AUTH_CHECKLIST = [
  { id: "method", text: "Chose authentication method" },
  { id: "implemented", text: "Implemented login/signup in my app" },
  { id: "protected", text: "Protected pages that need login" },
  { id: "user-data", text: "User data is saved to their account" },
  { id: "tested", text: "Tested login/logout flow" },
];

const REPLIT_AUTH_PROMPT = `Add Replit Auth to my app:

1. Add a Login button in the header
2. Show user's name/avatar when logged in
3. Add a Logout button
4. Protect [list your protected pages] so only logged-in users can access
5. Save user data from [your main feature] to their account
6. Each user should only see their own data`;

export function Day15Authentication({ appName, onComplete }: Day15AuthenticationProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [checklistDone, setChecklistDone] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleChecklist = (id: string) => {
    const newDone = new Set(checklistDone);
    if (newDone.has(id)) {
      newDone.delete(id);
    } else {
      newDone.add(id);
    }
    setChecklistDone(newDone);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(REPLIT_AUTH_PROMPT);
    toast({
      title: "Copied!",
      description: "Auth prompt copied to clipboard",
    });
  };

  const canComplete = selectedMethod && checklistDone.size >= 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">User Authentication</h3>
            <p className="text-slate-600 mt-1">Let users create accounts and have their own private data.</p>
          </div>
        </div>
      </Card>

      {/* Auth Method Selection */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Choose Auth Method</h4>
        <div className="grid gap-3">
          {AUTH_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setSelectedMethod(option.id)}
            >
              <input
                type="radio"
                checked={selectedMethod === option.id}
                onChange={() => setSelectedMethod(option.id)}
                className="w-4 h-4"
              />
              <option.icon className={`w-5 h-5 ${selectedMethod === option.id ? "text-blue-600" : "text-slate-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{option.name}</span>
                  {option.recommended && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{option.desc} • {option.pros}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Template */}
      {selectedMethod === "replit" && (
        <Card className="p-6 border-2 border-slate-200">
          <h4 className="font-bold text-lg mb-2 text-slate-900">Replit Auth Prompt</h4>
          <p className="text-sm text-slate-600 mb-4">Copy and customize for your app:</p>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
            {REPLIT_AUTH_PROMPT}
          </pre>
          <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
            <Copy className="w-4 h-4" />
            Copy Prompt
          </Button>
        </Card>
      )}

      {/* Checklist */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Implementation Checklist</h4>
        <div className="space-y-3">
          {AUTH_CHECKLIST.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleChecklist(item.id)}
            >
              <Checkbox
                checked={checklistDone.has(item.id)}
                onCheckedChange={() => toggleChecklist(item.id)}
              />
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Auth Complete - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

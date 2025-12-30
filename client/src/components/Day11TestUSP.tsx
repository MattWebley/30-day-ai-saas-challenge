import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface Day11TestUSPProps {
  userIdea: string;
  onComplete: () => void;
}

const USP_CRITERIA = [
  { id: "demonstrable", text: "I can SHOW it in action, not just describe it" },
  { id: "different", text: "Competitors don't have this (or do it worse)" },
  { id: "solves-pain", text: "It solves a REAL pain point users have" },
  { id: "understood", text: "Users understand what it does in 5 seconds" },
];

const USP_TEST = [
  { id: "works", text: "Does the USP feature actually WORK?" },
  { id: "fast", text: "Is it FAST enough?" },
  { id: "result", text: "Is the RESULT good?" },
  { id: "pay", text: "Would someone PAY for this?" },
];

export function Day11TestUSP({ userIdea, onComplete }: Day11TestUSPProps) {
  const [uspDescription, setUspDescription] = useState("");
  const [criteriaChecked, setCriteriaChecked] = useState<Set<string>>(new Set());
  const [testChecked, setTestChecked] = useState<Set<string>>(new Set());

  const toggleCriteria = (id: string) => {
    const newChecked = new Set(criteriaChecked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCriteriaChecked(newChecked);
  };

  const toggleTest = (id: string) => {
    const newChecked = new Set(testChecked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setTestChecked(newChecked);
  };

  const criteriaProgress = criteriaChecked.size;
  const testProgress = testChecked.size;
  const canComplete = uspDescription.length > 10 && criteriaProgress >= 3 && testProgress >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Test Your USP</h3>
            <p className="text-slate-600 mt-1">Your unique selling point is your weapon. Let's make sure it's sharp.</p>
          </div>
        </div>
      </Card>

      {/* USP Description */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">What's Your USP?</h4>
        <p className="text-sm text-slate-600 mb-4">
          The ONE thing that makes your app different from competitors:
        </p>
        <Textarea
          placeholder="e.g., 'Our AI generates 10 social posts in 30 seconds from any blog URL' or 'The only tool that connects directly to [specific platform]'"
          value={uspDescription}
          onChange={(e) => setUspDescription(e.target.value)}
          className="min-h-[100px]"
        />
        {userIdea && (
          <p className="text-xs text-slate-500 mt-2">Your app: {userIdea}</p>
        )}
      </Card>

      {/* USP Criteria */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Does Your USP Meet These Criteria?</h4>
        <div className="space-y-3">
          {USP_CRITERIA.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleCriteria(item.id)}
            >
              <Checkbox
                checked={criteriaChecked.has(item.id)}
                onCheckedChange={() => toggleCriteria(item.id)}
              />
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${(criteriaProgress / USP_CRITERIA.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* USP Test */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Test Your USP Feature</h4>
        <p className="text-sm text-slate-600 mb-4">Go to your app and use the USP feature. Check each item:</p>
        <div className="space-y-3">
          {USP_TEST.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleTest(item.id)}
            >
              <Checkbox
                checked={testChecked.has(item.id)}
                onCheckedChange={() => toggleTest(item.id)}
              />
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all"
            style={{ width: `${(testProgress / USP_TEST.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          USP Verified - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

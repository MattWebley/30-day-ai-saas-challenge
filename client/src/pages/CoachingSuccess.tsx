import { Check, ArrowRight, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";

export default function CoachingSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const type = params.get("type") || "coaching";

  // Determine what they bought based on type param
  const getProductName = () => {
    switch (type) {
      case "single":
        return "Expert Coaching Session";
      case "matt-single":
        return "1-on-1 Session with Matt";
      case "matt":
        return "4x Coaching Sessions with Matt";
      default:
        return "Expert Coaching Package";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 border-2 border-slate-200 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">You're in!</h1>
          <p className="text-lg text-slate-700 font-medium">
            {getProductName()}
          </p>
        </div>

        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-700">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">What happens next?</span>
          </div>
          <p className="text-slate-600">
            I'll email you within 24 hours to schedule your session at a time that works for you.
          </p>
        </div>

        <p className="text-slate-500 text-sm">
          Check your inbox (and spam folder) for my email.
        </p>

        <Link href="/dashboard">
          <Button className="w-full">
            Back to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}

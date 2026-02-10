import { useEffect } from "react";
import { Check, ArrowRight, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { trackFacebookEvent, generateEventId } from "@/components/FacebookPixel";

export default function CoachingSuccess() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const type = params.get("type") || "coaching";

  // Track purchase with Meta Pixel
  useEffect(() => {
    const getPurchaseValue = () => {
      switch (type) {
        case "expert-single": return 349;
        case "expert": return 995;
        case "matt-single": return 1995;
        case "matt": return 3995;
        default: return 995;
      }
    };

    const getContentId = () => {
      switch (type) {
        case "expert-single": return 'coaching-expert-single';
        case "expert": return 'coaching-expert-pack';
        case "matt-single": return 'coaching-matt-single';
        case "matt": return 'coaching-matt-pack';
        default: return 'coaching-expert-pack';
      }
    };

    trackFacebookEvent('Purchase', {
      value: getPurchaseValue(),
      currency: 'GBP',
      content_name: getProductName(),
      content_type: 'product',
      content_ids: [getContentId()]
    }, generateEventId());
  }, [type]);

  const getProductName = () => {
    switch (type) {
      case "expert-single":
        return "Expert Coaching Session";
      case "expert":
        return "4x Expert Coaching Sessions";
      case "matt-single":
        return "1-on-1 Session with Matt";
      case "matt":
        return "4x Coaching Sessions with Matt";
      default:
        return "Coaching Package";
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

        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-700">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Book your session now</span>
          </div>
          <p className="text-slate-600">
            Head to your coaching page to book your first session.
          </p>
          <Link href="/my-coaching">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Calendar className="w-4 h-4 mr-2" />
              Go to My Coaching
            </Button>
          </Link>
        </div>
        <p className="text-slate-500 text-sm">
          You'll also receive a confirmation email with booking details.
        </p>

        <p className="text-xs text-slate-400 px-2">
          Coaching sessions are delivered by independent third-party professionals. Your coaching relationship is with the independent coach, not with us.
        </p>

        <a href={isLoading ? "#" : (isAuthenticated ? "/dashboard" : "/login")} onClick={(e) => isLoading && e.preventDefault()}>
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                {isAuthenticated ? "Back to Dashboard" : "Log In to Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </a>
      </Card>
    </div>
  );
}

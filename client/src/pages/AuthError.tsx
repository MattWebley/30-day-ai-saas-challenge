import { AlertCircle, RefreshCw, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthError() {
  const handleRetry = () => {
    // Clear any stale session data and retry
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore if sessionStorage is not available
    }
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Login Hiccup
          </h1>
          <p className="text-slate-600">
            Your browser's privacy settings interrupted the login process. This sometimes happens with strict cookie settings.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <div className="text-sm text-slate-500">
            or try a different browser (Chrome works best)
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-3">
            <strong>Already purchased?</strong> Don't worry - your purchase is saved. Once you log in successfully, you'll have full access.
          </p>
          <a
            href="mailto:matt@21dayaisaas.com?subject=Login%20Issue&body=Hi%2C%20I'm%20having%20trouble%20logging%20in.%20My%20email%20is%3A%20"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Mail className="w-4 h-4" />
            Need help? Email support
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

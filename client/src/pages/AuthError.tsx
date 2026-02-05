import { useState } from "react";
import { AlertCircle, RefreshCw, Mail, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function AuthError() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason");

  const getErrorMessage = () => {
    switch (reason) {
      case "invalid_token":
        return "This login link is invalid or has already been used.";
      case "token_used":
        return "This login link has already been used. Please request a new one.";
      case "token_expired":
        return "This login link has expired. Please request a new one.";
      case "server_error":
        return "Something went wrong on our end. Please try again.";
      default:
        return "Your browser's privacy settings interrupted the login process.";
    }
  };

  const handleRetry = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
    }
    window.location.href = "/api/login";
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to send login link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Check Your Email
            </h1>
            <p className="text-slate-700">
              If you have a purchase with <strong>{email}</strong>, you'll receive a login link shortly.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg text-left space-y-2">
            <p className="text-slate-700 font-medium">Next steps:</p>
            <ol className="text-slate-700 list-decimal list-inside space-y-1">
              <li>Check your inbox (and spam folder)</li>
              <li>Click the login link in the email</li>
              <li>You'll be logged in automatically</li>
            </ol>
          </div>

          <p className="text-slate-600 text-sm">
            Link expires in 15 minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Login Issue
          </h1>
          <p className="text-slate-700">
            {getErrorMessage()}
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Standard Login
          </Button>

          <div className="text-slate-600 text-sm">
            or try a different browser (Chrome works best)
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 text-left">
          <h2 className="font-semibold text-slate-900 mb-3">
            Already purchased? Log in with email:
          </h2>
          
          <form onSubmit={handleMagicLink} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-magic-email"
            />
            
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full gap-2"
              disabled={isLoading || !email.trim()}
              data-testid="button-send-magic-link"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Login Link
                </>
              )}
            </Button>
          </form>

          <p className="text-slate-600 text-sm mt-3">
            We'll email you a one-time login link that works in any browser.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <a
            href="mailto:matt@mattwebley.com?subject=Login%20Issue&body=Hi%2C%20I'm%20having%20trouble%20logging%20in.%20My%20email%20is%3A%20"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Mail className="w-4 h-4" />
            Still stuck? Email support
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

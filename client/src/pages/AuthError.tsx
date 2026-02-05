import { useState } from "react";
import { Mail, ArrowRight, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthError() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason");

  const getMessage = () => {
    switch (reason) {
      case "token_used":
        return "This link has already been used - but no worries, just request a fresh one below.";
      case "token_expired":
        return "This link has expired - let's get you a new one.";
      default:
        return "Let's get you logged in with a fresh link.";
    }
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Check Your Email!
            </h1>
            <p className="text-slate-700">
              We've sent a login link to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-left space-y-2">
            <p className="text-slate-700 font-medium">What to do:</p>
            <ol className="text-slate-700 list-decimal list-inside space-y-1">
              <li>Check your inbox (and spam folder)</li>
              <li>Click the link in the email</li>
              <li>You'll be logged in automatically</li>
            </ol>
          </div>

          <p className="text-slate-500 text-sm">
            The link is valid for 30 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <RefreshCw className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Need a New Link?
          </h1>
          <p className="text-slate-600">
            {getMessage()}
          </p>
        </div>

        <div className="text-left space-y-4">
          <p className="font-medium text-slate-900">
            Enter your email to get a fresh login link:
          </p>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-base"
            />

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full gap-2 py-5 text-base"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Me a Login Link
                </>
              )}
            </Button>
          </form>

          <p className="text-slate-500 text-sm text-center">
            We'll email you a link that logs you in instantly.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <a
            href="mailto:matt@mattwebley.com?subject=Help%20logging%20in"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary font-medium"
          >
            <Mail className="w-4 h-4" />
            Need help? Email matt@mattwebley.com
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle, Loader2, KeyRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [error, setError] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSendingLink(true);
    setError("");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMagicLinkSent(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to send login link. Please try again.");
    } finally {
      setIsSendingLink(false);
    }
  };

  if (magicLinkSent) {
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
          <LogIn className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Log In
          </h1>
          <p className="text-slate-600">
            Welcome back to the 21-Day AI SaaS Challenge
          </p>
        </div>

        {!showMagicLink ? (
          <div className="text-left space-y-4">
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>

              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  onClick={(e) => { e.preventDefault(); setLocation('/forgot-password'); }}
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full gap-2 py-5 text-base"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Log In
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowMagicLink(true)}
              className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              Send me a login link instead
            </button>
          </div>
        ) : (
          <div className="text-left space-y-4">
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full gap-2 py-5 text-base"
                disabled={isSendingLink || !email.trim()}
              >
                {isSendingLink ? (
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowMagicLink(false)}
              className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              Log in with password instead
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <p className="text-slate-700 text-sm">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-primary hover:text-primary/80 font-medium"
              onClick={(e) => { e.preventDefault(); setLocation('/register'); }}
            >
              Sign up
            </a>
          </p>
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

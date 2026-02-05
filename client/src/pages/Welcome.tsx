import { useEffect, useState } from "react";
import { Check, ArrowRight, Sparkles, Calendar, BookOpen, Trophy, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function Welcome() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);

  useEffect(() => {
    // Trigger confetti on load
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const firstName = (user as any)?.firstName || "there";
  const userEmail = (user as any)?.email || "";

  const handleSetPassword = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsSettingPassword(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to set password");
      }

      setPasswordSet(true);
      toast.success("Password set! You can now log in with your email and password.");
    } catch (error: any) {
      toast.error(error.message || "Failed to set password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className={`max-w-lg w-full text-center space-y-8 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900">
            You're In, {firstName}!
          </h1>
          <p className="text-xl text-slate-600">
            Welcome to the 21-Day AI SaaS Challenge
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 text-left space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            What Happens Next
          </h2>
          <div className="space-y-3">
            {[
              { icon: Calendar, text: "Start Day 0 today - it only takes 5 minutes" },
              { icon: BookOpen, text: "Complete one day at a time at your own pace" },
              { icon: Trophy, text: "In 21 days, you'll have a working product" }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-slate-700 pt-1">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Password Setup - Optional */}
        {isAuthenticated && !passwordSet && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 text-left space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Set Up Your Login
            </h2>
            <p className="text-slate-600 text-sm">
              Create a password so you can log in anytime (optional but recommended)
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Type it again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSetPassword}
                disabled={isSettingPassword || !password || !confirmPassword}
                className="w-full"
              >
                {isSettingPassword ? "Setting up..." : "Save My Login"}
              </Button>
            </div>
          </div>
        )}

        {/* Password Set Confirmation */}
        {passwordSet && (
          <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-800">Password set!</p>
                <p className="text-green-700 text-sm">You can now log in with {userEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <a
          href={isLoading ? "#" : (isAuthenticated ? "/dashboard" : "/api/login")}
          className={`inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 w-full ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
          onClick={(e) => isLoading && e.preventDefault()}
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Start Day 0
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </a>

        {/* Support Note */}
        <p className="text-sm text-slate-500">
          Questions? Email matt@mattwebley.com
        </p>
      </div>
    </div>
  );
}

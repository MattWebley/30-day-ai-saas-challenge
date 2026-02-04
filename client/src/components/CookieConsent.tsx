import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so it doesn't flash immediately on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setShowBanner(false);
    // Reload to ensure tracking scripts can initialize
    window.location.reload();
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-slate-200 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-slate-700 font-medium mb-1">We use cookies</p>
            <p className="text-slate-600 text-sm">
              We use cookies to improve your experience, analyze site traffic, and for marketing.
              By clicking "Accept All", you consent to our use of cookies.
              <a href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</a>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to check if marketing cookies are allowed
export function hasMarketingConsent(): boolean {
  return localStorage.getItem("cookie-consent") === "all";
}

import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandProvider } from "@/components/BrandProvider";
import { TestModeProvider, useTestMode } from "@/contexts/TestModeContext";
import { useAuth } from "@/hooks/useAuth";
import { captureReferralCode, useReferralTracking } from "@/hooks/useReferral";

// Capture referral code from URL immediately on load
captureReferralCode();
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Dashboard from "@/pages/Dashboard";
import Badges from "@/pages/Badges";
import BuildLog from "@/pages/BuildLog";
import ClaudeCodeGuide from "@/pages/ClaudeCodeGuide";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import AdminAnswer from "@/pages/AdminAnswer";
import Showcase from "@/pages/Showcase";
import DesignPreview from "@/pages/DesignPreview";
import Order from "@/pages/Order";
import SalesLetterPack from "@/pages/SalesLetterPack";
import Coaching from "@/pages/Coaching";
import CoachingUpsell from "@/pages/CoachingUpsell";
import Critique from "@/pages/Critique";
import Testimonial from "@/pages/Testimonial";
import Welcome from "@/pages/Welcome";
import Referrals from "@/pages/Referrals";
import Congratulations from "@/pages/Congratulations";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Track referrals after authentication
  useReferralTracking();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Public routes */}
        <Route path="/showcase" component={Showcase} />
        <Route path="/order" component={Order} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/admin/answer/:token" component={AdminAnswer} />
        <Route path="/sales-letter-pack" component={SalesLetterPack} />
        <Route path="/coaching/upsell" component={CoachingUpsell} />
        <Route path="/welcome" component={Welcome} />
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/dashboard/:day" component={Dashboard} />
            <Route path="/badges" component={Badges} />
            <Route path="/referrals" component={Referrals} />
            <Route path="/build-log" component={BuildLog} />
            <Route path="/claude-code" component={ClaudeCodeGuide} />
            <Route path="/settings" component={Settings} />
            <Route path="/admin" component={Admin} />
            <Route path="/design-preview" component={DesignPreview} />
            <Route path="/coaching" component={Coaching} />
            <Route path="/critique" component={Critique} />
            <Route path="/testimonial" component={Testimonial} />
            <Route path="/congratulations" component={Congratulations} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// REMOVE THIS BEFORE LAUNCH - Floating test mode toggle button
function TestModeToggle() {
  const { testMode, setTestMode } = useTestMode();
  return (
    <button
      onClick={() => setTestMode(!testMode)}
      className={`fixed top-4 right-4 z-[9999] px-3 py-2 rounded-lg text-xs font-bold shadow-lg transition-all ${
        testMode
          ? 'bg-amber-500 text-white hover:bg-amber-600'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      Test Mode: {testMode ? 'ON' : 'OFF'}
    </button>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <TestModeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            {/* REMOVE THIS BEFORE LAUNCH */}
            <TestModeToggle />
          </TooltipProvider>
        </TestModeProvider>
      </BrandProvider>
    </QueryClientProvider>
  );
}

export default App;

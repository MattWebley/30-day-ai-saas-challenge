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
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";

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
import CoachingSuccess from "@/pages/CoachingSuccess";
import Critique from "@/pages/Critique";
import CritiqueSuccess from "@/pages/CritiqueSuccess";
import Testimonial from "@/pages/Testimonial";
import Welcome from "@/pages/Welcome";
import Referrals from "@/pages/Referrals";
import Congratulations from "@/pages/Congratulations";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import AuthError from "@/pages/AuthError";
import MagicVerify from "@/pages/MagicVerify";
import { CookieConsent } from "@/components/CookieConsent";
import { FacebookPixel } from "@/components/FacebookPixel";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Track page views for Google Analytics
  useAnalytics();

  // Track referrals after authentication
  useReferralTracking();

  // Send heartbeat for live user tracking (lightweight, in-memory only)
  useHeartbeat(isAuthenticated);

  // Public routes that don't need auth check
  const publicPaths = ['/order', '/showcase', '/checkout/success', '/admin/answer', '/sales-letter-pack', '/coaching/upsell', '/coaching/success', '/critique/success', '/welcome', '/terms', '/privacy'];
  const isPublicRoute = publicPaths.some(path => location.startsWith(path)) || location === '/';

  // Only show loading spinner for protected routes
  if (isLoading && !isPublicRoute) {
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
        {/* Public routes - render immediately without auth check */}
        <Route path="/showcase" component={Showcase} />
        <Route path="/order" component={Order} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/admin/answer/:token" component={AdminAnswer} />
        <Route path="/sales-letter-pack" component={SalesLetterPack} />
        <Route path="/coaching/upsell" component={CoachingUpsell} />
        <Route path="/coaching/success" component={CoachingSuccess} />
        <Route path="/critique/success" component={CritiqueSuccess} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/auth-error" component={AuthError} />
        <Route path="/auth/error" component={AuthError} />
        <Route path="/auth/magic" component={MagicVerify} />
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

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <TestModeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <CookieConsent />
            <FacebookPixel />
          </TooltipProvider>
        </TestModeProvider>
      </BrandProvider>
    </QueryClientProvider>
  );
}

export default App;

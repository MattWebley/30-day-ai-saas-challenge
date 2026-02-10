import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { FileText, User, Lock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface InvitationData {
  email: string;
  ratePerSession: number;
  rateCurrency: string;
  contractText: string;
}

export default function CoachSetup() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [calComLink, setCalComLink] = useState("");
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [hasScrolledContract, setHasScrolledContract] = useState(false);

  const contractRef = useRef<HTMLDivElement>(null);

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/coach/setup/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Invalid or expired invitation");
          return;
        }
        const data = await res.json();
        setInvitation(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchInvitation();
  }, [token]);

  // Track scrolling in contract box
  const handleContractScroll = () => {
    if (!contractRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contractRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledContract(true);
    }
  };

  // Form validation
  const passwordsMatch = password === confirmPassword;
  const passwordLongEnough = password.length >= 8;
  const isFormValid = firstName && lastName && passwordLongEnough && passwordsMatch && agreedToContract && signatureName.trim().length > 0;

  // Submit
  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/coach/setup/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          signatureName: signatureName.trim(),
          agreedToContract: true,
          calComLink: calComLink.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to create account");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      // Redirect to coach dashboard after a brief moment
      setTimeout(() => setLocation("/coach"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const currencySymbol = invitation?.rateCurrency === 'gbp' ? '£' : '$';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Invitation Problem</h1>
          <p className="text-slate-700">{error}</p>
          <p className="text-slate-600 text-sm">If you think this is a mistake, please contact matt@mattwebley.com</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">You're All Set!</h1>
          <p className="text-slate-700">Your account has been created and the agreement has been signed. Redirecting you to your coach dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Coach Setup</h1>
          <p className="text-slate-700">
            Welcome! Before you can start coaching, please review and sign the contractor agreement, then set up your account.
          </p>
          <p className="text-slate-600 text-sm">
            Invited as: <span className="font-medium">{invitation?.email}</span> · Rate: <span className="font-medium">{currencySymbol}{((invitation?.ratePerSession || 0) / 100).toFixed(2)}/session</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Section 1: Contract */}
        <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Independent Contractor Agreement</h2>
              <p className="text-slate-600 text-sm">Please read the entire agreement carefully before signing</p>
            </div>
          </div>

          <div
            ref={contractRef}
            onScroll={handleContractScroll}
            className="p-5 max-h-96 overflow-y-auto bg-slate-50 border-b border-slate-200 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"
          >
            {invitation?.contractText}
          </div>

          <div className="p-5 space-y-4">
            {!hasScrolledContract && (
              <p className="text-amber-600 text-sm font-medium">Please scroll through the entire agreement above before signing.</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToContract}
                onChange={(e) => setAgreedToContract(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300"
              />
              <span className="text-slate-700">
                I have read and agree to the terms of the Independent Contractor Agreement above. I understand this is a legally binding contract.
              </span>
            </label>

            <div>
              <label className="text-slate-700 font-medium">Type your full legal name as your electronic signature *</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="e.g. Jane Elizabeth Smith"
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-700 text-lg font-serif italic focus:outline-none focus:border-primary"
              />
              {signatureName && (
                <p className="text-slate-500 text-sm mt-1">
                  Signed electronically as: <span className="font-serif italic font-medium">{signatureName}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Profile Setup */}
        <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Profile</h2>
              <p className="text-slate-600 text-sm">Set up your coach account</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-medium">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-medium">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                  placeholder="Min 8 characters"
                />
                {password && !passwordLongEnough && (
                  <p className="text-red-500 text-sm mt-1">Must be at least 8 characters</p>
                )}
              </div>
              <div>
                <label className="text-slate-700 font-medium">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                  placeholder="Repeat your password"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-medium">Cal.com Booking Link <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                type="url"
                value={calComLink}
                onChange={(e) => setCalComLink(e.target.value)}
                className="mt-1 w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                placeholder="https://cal.com/your-name/coaching"
              />
              <p className="text-slate-500 text-sm mt-1">Clients will use this to book sessions with you. You can add it later from your dashboard.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
              </span>
            ) : (
              "Sign Agreement & Create Account"
            )}
          </button>
          <p className="text-slate-500 text-sm mt-3">
            By clicking above, you agree to the contractor terms and confirm that your typed name serves as your legally binding electronic signature.
          </p>
        </div>
      </div>
    </div>
  );
}

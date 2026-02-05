import { useEffect } from "react";
import { useLocation } from "wouter";

export default function MagicVerify() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      window.location.href = `/api/auth/magic-link/verify?token=${token}`;
    } else {
      setLocation("/auth/error?reason=invalid_token");
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-700 font-medium">Verifying your login...</p>
      </div>
    </div>
  );
}

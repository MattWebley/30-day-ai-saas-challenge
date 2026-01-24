import { useEffect } from "react";
import { useLocation } from "wouter";

// Redirect old Sales Letter Pack URL to the new Critique page
export default function SalesLetterPack() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/critique");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Redirecting...</p>
      </div>
    </div>
  );
}

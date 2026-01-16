import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900">
          Welcome to the Challenge!
        </h1>
        
        <p className="text-lg text-slate-600">
          Your payment was successful. You now have full access to the 21 Day AI SaaS Challenge.
        </p>
        
        <p className="text-slate-600">
          Check your email for login details, or click below to get started right now.
        </p>
        
        <a href="/api/login">
          <Button size="lg" className="w-full h-14 text-lg font-bold">
            Start Day 1 Now
          </Button>
        </a>
        
        <p className="text-sm text-slate-500">
          Questions? Email matt@mattwebley.com
        </p>
      </div>
    </div>
  );
}

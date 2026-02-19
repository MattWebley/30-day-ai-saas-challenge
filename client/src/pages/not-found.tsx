import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          </div>

          <p className="mt-4 text-slate-700">
            Sorry, we couldn't find that page. It may have been moved or no longer exists.
          </p>

          <a
            href="/"
            className="inline-block mt-6 text-primary font-medium hover:underline"
          >
            Go to homepage
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

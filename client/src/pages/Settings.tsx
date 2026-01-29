import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const queryClient = useQueryClient();

  const resetAllProgress = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/progress/reset-all", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/badges/user"] });
      toast.success("All progress has been reset. Starting fresh!");
      window.location.href = "/dashboard/1";
    },
    onError: () => {
      toast.error("Failed to reset progress. Try again.");
    },
  });

  return (
    <Layout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and challenge preferences.
          </p>
        </div>

        <Card className="p-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile</h2>
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" placeholder="Enter your name" defaultValue="Builder" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="hello@example.com" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive an email every morning.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Streak Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified if you're about to lose your streak.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4 border-red-200">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Reset all your challenge progress and start fresh from Day 1.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                data-testid="button-start-over"
              >
                <RotateCcw className="w-4 h-4" /> Start Over
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to start over?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ALL your progress from Days 1-5, including your ideas, features, pitch, and customer profile. You'll start fresh from Day 1.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => resetAllProgress.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </Layout>
  );
}

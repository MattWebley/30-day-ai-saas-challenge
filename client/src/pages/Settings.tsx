import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";
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

  // Fetch user data
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Local state for form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Update local state when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  // Save profile mutation
  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", "/api/auth/user", {
        firstName,
        lastName,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast.success("Profile updated!");
    },
    onError: () => {
      toast.error("Failed to save changes. Try again.");
    },
  });

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

  // Check if form has changes
  const hasChanges = user && (
    firstName !== (user.firstName || "") ||
    lastName !== (user.lastName || "")
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </Layout>
    );
  }

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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-slate-50 text-slate-600"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => saveProfile.mutate()}
              disabled={!hasChanges || saveProfile.isPending}
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
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

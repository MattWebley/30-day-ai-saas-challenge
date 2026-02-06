import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { RotateCcw, Loader2, Camera, X } from "lucide-react";
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhotoPreview(user.profileImageUrl || null);
    }
  }, [user]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please use a photo under 5MB.");
      return;
    }

    // Resize to 150x150 and convert to base64
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Crop to square from center
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(dataUrl);
        setPhotoChanged(true);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoChanged(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save profile mutation
  const saveProfile = useMutation({
    mutationFn: async () => {
      const body: any = { firstName, lastName };
      if (photoChanged) {
        body.profileImageUrl = photoPreview; // null = remove, string = new photo
      }
      const res = await apiRequest("PUT", "/api/auth/user", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPhotoChanged(false);
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
    lastName !== (user.lastName || "") ||
    photoChanged
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

            {/* Profile Photo */}
            <div className="grid gap-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold border-2 border-slate-200">
                      {(firstName || user?.email || '?')[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1"
                  >
                    <Camera className="w-4 h-4" />
                    {photoPreview ? 'Change' : 'Upload'}
                  </Button>
                  {photoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePhoto}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>

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

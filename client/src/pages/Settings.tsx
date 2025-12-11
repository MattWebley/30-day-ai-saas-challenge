import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
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
      </div>
    </Layout>
  );
}

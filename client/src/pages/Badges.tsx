import { Layout } from "@/components/layout/Layout";
import { badges } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

export default function Badges() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Your Badges</h1>
          <p className="text-muted-foreground mt-2">
            Collect all 9 badges to complete the challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, i) => {
            const Icon = (Icons[badge.icon as keyof typeof Icons] as LucideIcon) || Icons.Trophy;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  "p-8 flex flex-col items-center text-center gap-4 transition-all hover:shadow-lg",
                  badge.earned 
                    ? "bg-white border-black" 
                    : "bg-white border-black opacity-60 grayscale"
                )}>
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-2",
                    badge.earned 
                      ? "bg-blue-50 text-primary shadow-inner" 
                      : "bg-slate-600 text-white"
                  )}>
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>

                  {!badge.earned && (
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-widest mt-2">
                      Locked
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

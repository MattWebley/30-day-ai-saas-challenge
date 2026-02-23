import { useState } from "react";
import { LaunchMachineSidebar } from "./LaunchMachineSidebar";
import { Menu } from "lucide-react";

interface LaunchMachineLayoutProps {
  children: React.ReactNode;
  activeLessonId?: number;
}

export function LaunchMachineLayout({ children, activeLessonId }: LaunchMachineLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 font-bold text-slate-900">SaaS Launch Machine</span>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <LaunchMachineSidebar activeLessonId={activeLessonId} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <div className="flex-shrink-0">
          <LaunchMachineSidebar activeLessonId={activeLessonId} />
        </div>
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden min-w-0 pt-14">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

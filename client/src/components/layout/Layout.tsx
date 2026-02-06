import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { ReportProblem } from "@/components/ReportProblem";
import { FocusButton } from "@/components/FocusButton";
import { ChatWidget } from "@/components/ChatWidget";

interface LayoutProps {
  children: React.ReactNode;
  currentDay?: number;
}

export function Layout({ children, currentDay = 1 }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center ml-3 flex-1">
          <img
            src="/logo.png?v=3"
            alt="21-Day AI SaaS Challenge"
            className="h-8 w-auto object-contain"
            style={{ imageRendering: 'auto' }}
          />
        </div>
        <FocusButton />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar (fixed overlay) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar currentDay={currentDay} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop Layout - sidebar and content side by side, both scroll with page */}
      <div className="hidden lg:flex">
        <div className="flex-shrink-0">
          <Sidebar currentDay={currentDay} />
        </div>
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 animate-in fade-in duration-500">
            {children}
            <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
              <ReportProblem currentDay={currentDay} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden min-w-0 pt-14">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
          {children}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
            <ReportProblem currentDay={currentDay} />
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget currentDay={currentDay} />
    </div>
  );
}

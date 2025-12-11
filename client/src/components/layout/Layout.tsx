import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

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
        <div className="flex items-center gap-2 ml-3">
          <img 
            src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png" 
            alt="Matt Webley" 
            className="w-8 h-8 rounded-full"
          />
          <span className="font-bold text-sm">30 Day AI SaaS Challenge</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar currentDay={currentDay} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="lg:ml-80 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

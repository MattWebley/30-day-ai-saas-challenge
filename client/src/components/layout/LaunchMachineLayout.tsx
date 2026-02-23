import { useState } from "react";
import { LaunchMachineSidebar } from "./LaunchMachineSidebar";
import { Menu, Shield } from "lucide-react";
import { ReportProblem } from "@/components/ReportProblem";
import { ChatWidget } from "@/components/ChatWidget";
import { AdminNotificationBell } from "@/components/AdminNotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface LaunchMachineLayoutProps {
  children: React.ReactNode;
  activeLessonId?: number;
}

export function LaunchMachineLayout({ children, activeLessonId }: LaunchMachineLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = (user as any)?.isAdmin;

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
        <div className="flex items-center ml-3 flex-1">
          <img
            src="/logo.png?v=3"
            alt="AI SaaS Launch Machine"
            className="h-8 w-auto object-contain"
            style={{ imageRendering: 'auto' }}
          />
        </div>
        {isAdmin && (
          <>
            <AdminNotificationBell />
            <Link href="/admin" className="p-2 rounded-lg hover:bg-muted mr-1">
              <Shield className="w-5 h-5 text-slate-600" />
            </Link>
          </>
        )}
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
          {isAdmin && (
            <div className="flex justify-end items-center gap-2 px-6 pt-4">
              <AdminNotificationBell />
              <Link href="/admin" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </div>
          )}
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 animate-in fade-in duration-500">
            {children}
            <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
              <ReportProblem />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden min-w-0 pt-14">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
          {children}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
            <ReportProblem />
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

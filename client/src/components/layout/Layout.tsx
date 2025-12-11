import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  currentDay?: number;
}

export function Layout({ children, currentDay = 1 }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar currentDay={currentDay} />
      <main className="flex-1 ml-80 min-w-0">
        <div className="max-w-5xl mx-auto p-8 md:p-12 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

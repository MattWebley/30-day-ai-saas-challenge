import { useState, useRef, useEffect } from "react";
import { Bell, MessageSquare, HelpCircle, Image, Video, Flag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NotificationItem {
  key: string;
  label: string;
  count: number;
  tab: string;
  section: string;
}

interface NotificationData {
  total: number;
  items: NotificationItem[];
}

const ICONS: Record<string, typeof Bell> = {
  comments: MessageSquare,
  questions: HelpCircle,
  showcase: Image,
  critiques: Video,
  flagged: Flag,
};

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery<NotificationData>({
    queryKey: ["/api/admin/notifications"],
    refetchInterval: 60_000,
  });

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const total = data?.total || 0;

  const navigateTo = (tab: string, section: string) => {
    setOpen(false);
    // Use window.location to force a full navigation so the admin page
    // picks up the tab param and scrolls to the right section
    window.location.href = `/admin?tab=${tab}#${section}`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-muted relative"
        aria-label="Admin notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full px-1">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-bold text-slate-900 text-sm">Notifications</p>
          </div>
          {total === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">
              All clear — nothing needs attention
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {data?.items.map((item) => {
                const Icon = ICONS[item.key] || Bell;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigateTo(item.tab, item.section)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-slate-700 text-sm flex-1">{item.label}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => { setOpen(false); window.location.href = "/admin"; }}
            className="w-full px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-slate-50 border-t border-slate-100"
          >
            Open Admin Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

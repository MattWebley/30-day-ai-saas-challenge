import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Info, AlertCircle, CheckCircle, Gift, ExternalLink } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string;
  dismissible: boolean | null;
  linkUrl: string | null;
  linkText: string | null;
}

export function AnnouncementBanner() {
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/announcements/${id}/dismiss`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to dismiss");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  if (announcements.length === 0) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          title: 'text-amber-900',
          text: 'text-amber-700',
        };
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'text-green-900',
          text: 'text-green-700',
        };
      case 'promo':
        return {
          bg: 'bg-purple-50 border-purple-200',
          icon: <Gift className="w-5 h-5 text-purple-600" />,
          title: 'text-purple-900',
          text: 'text-purple-700',
        };
      default: // info
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          title: 'text-blue-900',
          text: 'text-blue-700',
        };
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {announcements.map((announcement) => {
        const styles = getTypeStyles(announcement.type);

        return (
          <div
            key={announcement.id}
            className={`p-4 rounded-lg border-2 ${styles.bg} relative`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold ${styles.title}`}>{announcement.title}</h4>
                <p className={`text-sm mt-1 ${styles.text}`}>{announcement.message}</p>
                {announcement.linkUrl && (
                  <a
                    href={announcement.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-sm font-medium mt-2 ${styles.title} hover:underline`}
                  >
                    {announcement.linkText || 'Learn more'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {announcement.dismissible && (
                <button
                  onClick={() => dismissMutation.mutate(announcement.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
                  disabled={dismissMutation.isPending}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

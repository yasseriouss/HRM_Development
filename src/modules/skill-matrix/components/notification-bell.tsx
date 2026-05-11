import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Bell, CheckCheck, X } from "lucide-react";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  workflow_id: string | null;
  step_id: string | null;
}

export function NotificationBell() {
  const headers = getAuthHeaders();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { headers });
      if (res.ok) {
        const data = await res.json() as Notification[];
        setNotifications(data);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT", headers });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PUT", headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silent
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-80 max-h-96 rounded-lg border border-border bg-card shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5"
                  title="Mark all read"
                >
                  <CheckCheck className="h-3 w-3" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="ms-1 text-muted-foreground hover:text-primary">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notifications yet.</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-2">{!n.is_read && (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">{n.workflow_id ? (
                        <Link
                          href={`/workflows/${n.workflow_id}`}
                          onClick={() => { markRead(n.id); setOpen(false); }}
                          className="text-xs leading-snug hover:text-primary transition-colors block"
                        >
                          {n.message}
                        </Link>
                      ) : (
                        <p className="text-xs leading-snug">{n.message}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>{!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="shrink-0 text-muted-foreground hover:text-primary mt-0.5"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

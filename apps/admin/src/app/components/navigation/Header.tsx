import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Activity,
  ChevronDown,
  Clock,
  FileText,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { apiCall } from "../../../services/api";

type AdminProfile = {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar_url?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  isRead: boolean;
  type?: string;
};

function formatRole(role?: string) {
  if (!role) return "Admin";
  return role
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "--";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function formatRelativeTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function normalizeNotifications(payload: any): NotificationItem[] {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.notifications)
      ? payload.notifications
      : [];

  return raw
    .map((item: any) => {
      const id = String(item?.id ?? item?.notification_id ?? "");
      if (!id) return null;
      return {
        id,
        title: String(item?.title ?? "Notification"),
        message: String(item?.message ?? item?.body ?? ""),
        createdAt: item?.created_at ?? item?.createdAt,
        isRead: Boolean(item?.is_read ?? item?.isRead ?? false),
        type: item?.type ?? "system",
      };
    })
    .filter((item: NotificationItem | null): item is NotificationItem => item !== null);
}

export function Header() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiCall<any>("/api/admin/v1/account/profile");
        const record = response?.profile ?? response;
        setProfile(record ?? null);
      } catch {
        setProfile(null);
      }
    };

    void loadProfile();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      setNotificationsError(null);
      try {
        const response = await apiCall<any>("/api/notifications/v1");
        setNotifications(normalizeNotifications(response));
      } catch (err: any) {
        setNotifications([]);
        setNotificationsError(err?.message || "Failed to load notifications");
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    void loadNotifications();
  }, []);

  useEffect(() => {
    if (!showNotifications) return;
    const refreshNotifications = async () => {
      setIsLoadingNotifications(true);
      setNotificationsError(null);
      try {
        const response = await apiCall<any>("/api/notifications/v1");
        setNotifications(normalizeNotifications(response));
      } catch (err: any) {
        setNotificationsError(err?.message || "Failed to load notifications");
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    void refreshNotifications();
  }, [showNotifications]);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayName = profile?.full_name || profile?.name || "";
  const displayRole = formatRole(profile?.role);
  const displayEmail = profile?.email || "";
  const displayInitials = getInitials(displayName || "Admin");

  const markAllRead = async () => {
    try {
      await apiCall("/api/notifications/v1/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err: any) {
      setNotificationsError(err?.message || "Failed to mark notifications as read");
    }
  };

  const markRead = async (notificationId: string) => {
    try {
      await apiCall(`/api/notifications/v1/${notificationId}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
    } catch (err: any) {
      setNotificationsError(err?.message || "Failed to update notification");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search bookings, providers, customers..."
            className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Date & Time Display */}
        <div className="hidden lg:flex items-center gap-2 text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-mono font-semibold text-gray-700">{formattedTime}</span>
            <span className="mx-1.5 text-gray-300">|</span>
            <span className="text-gray-500">{formattedDate}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center bg-[#16A34A] text-white text-[10px] font-bold rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-400">{unreadCount} unread</p>
                  </div>
                  <button
                    className="text-xs text-[#16A34A] hover:text-[#15803D] font-medium"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {isLoadingNotifications && (
                    <div className="px-4 py-6 text-xs text-gray-400">Loading notifications...</div>
                  )}
                  {!isLoadingNotifications && notificationsError && (
                    <div className="px-4 py-6 text-xs text-red-500">{notificationsError}</div>
                  )}
                  {!isLoadingNotifications && !notificationsError && notifications.length === 0 && (
                    <div className="px-4 py-6 text-xs text-gray-400">No notifications yet.</div>
                  )}
                  {!isLoadingNotifications && !notificationsError && notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        if (!notification.isRead) {
                          void markRead(notification.id);
                        }
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? "bg-green-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.isRead ? "bg-[#16A34A]" : "bg-gray-200"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                  <button className="w-full text-center text-xs text-[#16A34A] hover:text-[#15803D] font-medium">
                    View all notifications →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#16A34A] to-[#059669] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">{displayInitials}</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">
                {displayName || "Admin"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{displayRole}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                showProfileMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-20 overflow-hidden">
                {/* Profile info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#16A34A] to-[#059669] rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">{displayInitials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {displayName || "Admin"}
                      </p>
                      <p className="text-xs text-gray-400">{displayEmail || ""}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/admin-profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/security-settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/audit-trail");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>Activity Log</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
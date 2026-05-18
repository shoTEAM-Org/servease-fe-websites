import { useEffect, useState } from "react";
import { Bell, Search, User, LogOut, Settings, ClipboardList, ChevronDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { SignOutModal } from "../SignOutModal";
import { apiCall } from "../../../hooks/useApi";

type HeaderNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const mockNotifications: HeaderNotification[] = [
  {
    id: "mock-1",
    type: "booking",
    title: "New Booking Request",
    message: "Maria Santos requested a cleaning service in Makati",
    time: "2 minutes ago",
    unread: true,
  },
  {
    id: "mock-2",
    type: "approval",
    title: "Provider Pending Approval",
    message: "New service provider awaiting KYC verification",
    time: "15 minutes ago",
    unread: true,
  },
  {
    id: "mock-3",
    type: "payment",
    title: "Payout Request",
    message: "Provider #1234 requested a payout",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "mock-4",
    type: "dispute",
    title: "Dispute Raised",
    message: "Customer filed a dispute for booking #BK-2024-001",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "mock-5",
    type: "system",
    title: "System Update",
    message: "Platform maintenance scheduled for tonight at 2:00 AM",
    time: "5 hours ago",
    unread: false,
  },
];

function getString(source: Record<string, any>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return fallback;
}

function getNotificationItems(payload: any): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = [
    payload?.notifications,
    payload?.items,
    payload?.results,
    payload?.rows,
    payload?.data,
    payload?.data?.notifications,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.rows,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function formatNotificationTime(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function normalizeNotifications(payload: any): HeaderNotification[] {
  return getNotificationItems(payload).map((item, index) => {
    const source = item && typeof item === "object" ? item : {};
    const readValue = source.read ?? source.isRead ?? source.is_read ?? source.read_at ?? source.readAt;
    const unreadValue = source.unread ?? source.isUnread ?? source.is_unread;
    const unread = typeof unreadValue === "boolean" ? unreadValue : !(readValue === true || typeof readValue === "string");

    return {
      id: getString(source, ["id", "notificationId", "notification_id"], `notification-${index + 1}`),
      type: getString(source, ["type", "category"], "system"),
      title: getString(source, ["title", "subject"], "Notification"),
      message: getString(source, ["message", "body", "content", "description"], ""),
      time: formatNotificationTime(source.createdAt ?? source.created_at ?? source.time ?? source.timestamp),
      unread,
    };
  });
}

export function Header() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      setIsLoadingNotifications(true);
      setNotificationsError("");

      try {
        const response = await apiCall("/api/admin/v1/notifications");
        if (isMounted) {
          setNotifications(normalizeNotifications(response));
        }
      } catch (error: any) {
        console.warn("Falling back to mock notifications after fetch failed:", error);
        if (isMounted) {
          setNotifications(mockNotifications);
          setNotificationsError(error?.message || "Failed to load notifications");
        }
      } finally {
        if (isMounted) {
          setIsLoadingNotifications(false);
        }
      }
    }

    void fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    setIsSignOutModalOpen(false);
    logout();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const markNotificationRead = async (notificationId: string) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification?.unread) {
      return;
    }

    setNotifications((current) =>
      current.map((item) => item.id === notificationId ? { ...item, unread: false } : item)
    );

    if (notificationId.startsWith("mock-")) {
      return;
    }

    try {
      await apiCall(`/api/admin/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: "PATCH",
      });
    } catch (error) {
      console.warn("Failed to mark notification as read:", error);
      setNotifications((current) =>
        current.map((item) => item.id === notificationId ? { ...item, unread: true } : item)
      );
    }
  };

  const markAllNotificationsRead = async () => {
    const previous = notifications;
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));

    if (previous.every((item) => item.id.startsWith("mock-"))) {
      return;
    }

    try {
      await apiCall("/api/admin/v1/notifications/read-all", {
        method: "PATCH",
      });
    } catch (error) {
      console.warn("Failed to mark all notifications as read:", error);
      setNotifications(previous);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search bookings, providers, customers..."
            className="pl-9 bg-gray-50 border-gray-200 h-10"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-[#DCFCE7] hover:text-[#00BF63] rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-[#00BF63] text-white text-xs border-2 border-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={markAllNotificationsRead}
                    disabled={unreadCount === 0}
                    className="text-xs text-[#00BF63] hover:text-[#00A055] font-medium cursor-pointer disabled:text-gray-300 disabled:cursor-default"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-[#DCFCE7] transition-colors cursor-pointer ${
                          notification.unread ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.unread ? "bg-[#00BF63]" : "bg-gray-300"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {notificationsError && (
                  <div className="px-4 py-2 border-t border-amber-100 bg-amber-50 text-xs text-amber-700">
                    Showing fallback notifications.
                  </div>
                )}

                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/broadcasts");
                    }}
                    className="w-full text-center text-sm text-[#00BF63] hover:text-[#00A055] font-medium cursor-pointer"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-4 py-2 pr-3 border-l border-gray-200 hover:bg-[#DCFCE7] rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">{admin?.name || "Admin User"}</p>
              <p className="text-xs text-gray-500">{admin?.role || "Super Admin"}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showProfileMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{admin?.name || "Admin User"}</p>
                  <p className="text-xs text-gray-500">{admin?.email || "admin@servease.ph"}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#DCFCE7] hover:text-[#00BF63] transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleNavigate("/settings")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#DCFCE7] hover:text-[#00BF63] transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => handleNavigate("/audit-trail")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#DCFCE7] hover:text-[#00BF63] transition-colors cursor-pointer text-left"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Activity Log
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsSignOutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sign Out Modal */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}

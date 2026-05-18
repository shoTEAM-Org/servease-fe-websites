import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  LifeBuoy,
  CreditCard,
  TrendingUp,
  BarChart3,
  PieChart,
  UserPlus,
  Shield,
  Settings,
  Bell,
  FileText,
  PanelLeftClose,
  PanelLeft,
  ShoppingBag,
  Grid3x3,
  MapPin,
  Tag,
  Plug,
  Briefcase,
  DollarSign,
  Activity,
  CheckSquare,
  ClipboardList,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Megaphone,
  Percent,
  Wallet,
} from "lucide-react";
import logo from "../../../assets/serveaselogo.png";
import { useTranslation } from "../../contexts/LanguageContext";

interface SidebarItemProps {
  item: {
    to: string;
    icon: React.ElementType;
    label: string;
    end?: boolean;
  };
  isCollapsed: boolean;
}

function SidebarItem({ item, isCollapsed }: SidebarItemProps) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative ${
            isActive
              ? "bg-[#00BF63] text-white"
              : "text-foreground hover:bg-[#DCFCE7] hover:text-[#15803D]"
          }`
        }
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span
          className={`text-sm font-medium transition-all duration-300 ${
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          }`}
        >
          {item.label}
        </span>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    </li>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("sidebar.dashboard"),
      items: [
        { to: "/dashboard", icon: LayoutDashboard, label: t("sidebar.overview"), end: true },
      ],
    },
    {
      title: t("sidebar.userManagement"),
      items: [
        { to: "/customers",             icon: Users,         label: t("sidebar.customers") },
        { to: "/service-providers",     icon: UserCheck,     label: t("sidebar.serviceProviders") },
        { to: "/provider-applications", icon: UserPlus,      label: t("sidebar.approvalQueue") },
      ],
    },
    {
      title: t("sidebar.operations"),
      items: [
        { to: "/bookings",          icon: Package,       label: t("sidebar.allBookings") },
        { to: "/ongoing-services",  icon: ClipboardList, label: t("sidebar.ongoingServices") },
        { to: "/disputes",          icon: LifeBuoy,      label: t("sidebar.disputes") },
        { to: "/support",           icon: HelpCircle,    label: t("sidebar.support") },
      ],
    },
    {
      title: t("sidebar.finance"),
      items: [
        { to: "/transactions",      icon: CreditCard,  label: t("sidebar.transactions") },
        { to: "/provider-earnings", icon: Wallet,      label: t("sidebar.providerEarnings") },
        { to: "/payout-requests",   icon: TrendingUp,  label: t("sidebar.payoutRequests") },
        { to: "/refund-management", icon: RefreshCw,   label: t("sidebar.refundManagement") },
        { to: "/failed-payments",   icon: AlertCircle, label: t("sidebar.failedPayments") },
      ],
    },
    {
      title: t("sidebar.marketplaceMarketing"),
      items: [
        { to: "/categories",    icon: Grid3x3,    label: t("sidebar.categories") },
        { to: "/services",      icon: ShoppingBag, label: t("sidebar.services") },
        { to: "/service-areas", icon: MapPin,      label: t("sidebar.serviceAreas") },
        { to: "/promotions",    icon: Tag,         label: t("sidebar.promotions") },
        { to: "/broadcasts",    icon: Megaphone,   label: t("sidebar.broadcasts") },
      ],
    },
    {
      title: t("sidebar.reportsAnalytics"),
      items: [
        { to: "/reports/revenue",           icon: BarChart3,   label: t("sidebar.revenue") },
        { to: "/reports/booking-analytics", icon: PieChart,    label: t("sidebar.bookingAnalytics") },
        { to: "/reports/business",          icon: Briefcase,   label: t("sidebar.businessReports") },
        { to: "/reports/financial",         icon: DollarSign,  label: t("sidebar.financialReports") },
        { to: "/reports/user",              icon: Users,       label: t("sidebar.userReports") },
        { to: "/reports/performance",       icon: Activity,    label: t("sidebar.performanceReports") },
        { to: "/reports/compliance",        icon: CheckSquare, label: t("sidebar.complianceReports") },
      ],
    },
    {
      title: t("sidebar.platformSettings"),
      items: [
        { to: "/commission-rules",       icon: Percent,    label: t("sidebar.commission") },
        { to: "/admin-roles",            icon: Shield,     label: t("sidebar.adminRolesPermissions") },
        { to: "/security-settings",      icon: Settings,   label: t("sidebar.securitySettings") },
        { to: "/notification-settings",  icon: Bell,       label: t("sidebar.notificationSettings") },
        { to: "/audit-trail",            icon: FileText,   label: t("sidebar.logsAuditTrail") },
        { to: "/integrations",           icon: Plug,       label: t("sidebar.integrations") },
      ],
    },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-card border-r border-border z-20 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border flex-shrink-0">
        {!isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={logo}
              alt="ServEase"
              className="h-8 w-auto"
            />
            <p className="text-xs text-muted-foreground whitespace-nowrap">{t("sidebar.adminDashboard")}</p>
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="p-4 flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
            )}
            {isCollapsed && (
              <div className="h-px bg-border mb-2" />
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.to + item.label}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-[#DCFCE7] hover:text-[#15803D] transition-colors"
          title={isCollapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span className="text-sm font-medium">{t("sidebar.collapse")}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            <p>ServEase Admin v2.0</p>
            <p className="mt-1">© 2026 ServEase Platform</p>
          </div>
        </div>
      )}
    </aside>
  );
}

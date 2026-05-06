import { Shield, Bell, FileText, Users, CheckCircle, Clock, MoreVertical, RefreshCw, Copy, Check, Eye, UserX, Lock, Settings, Edit2, UserCheck, Key, Search, Download, Filter, Plug, Wifi, WifiOff, ExternalLink, CreditCard, MapPin, BarChart3, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { useApi, apiCall } from "../../hooks/useApi";
import { AdminRolesComponent } from "../components/AdminRolesComponent";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";

// Admin type definition
type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  lastLogin: string;
  status: "Active" | "Inactive";
};

// Role permissions mapping
const rolePermissions = {
  "Admin": ["Manage Users", "Manage Roles", "Manage Permissions"],
  "Editor": ["Edit Content", "Manage Comments"],
  "Viewer": ["View Content", "View Comments"]
};

// Admin Roles & Permissions - now using the new component
export function AdminRoles() {
  return <AdminRolesComponent />;
}

// Notification Settings
export function NotificationSettings() {
  const { data, isLoading, error } = useApi<any>("/api/admin/v1/settings/notifications");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [disputeAlerts, setDisputeAlerts] = useState(true);

  useEffect(() => {
    if (data) {
      setEmailNotifications(data.emailNotifications ?? true);
      setSmsNotifications(data.smsNotifications ?? false);
      setPushNotifications(data.pushNotifications ?? true);
      setBookingAlerts(data.bookingAlerts ?? true);
      setPaymentAlerts(data.paymentAlerts ?? true);
      setDisputeAlerts(data.disputeAlerts ?? true);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await apiCall("/api/admin/v1/settings/notifications", {
        method: "PUT",
        body: JSON.stringify({
          emailNotifications,
          smsNotifications,
          pushNotifications,
          bookingAlerts,
          paymentAlerts,
          disputeAlerts,
        }),
      });
      toast.success("Notification settings saved successfully", {
        className: "bg-[#00BF63] text-white border-none"
      });
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-700 font-medium">Failed to load notification settings</p>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure how you receive notifications and alerts
        </p>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00BF63]" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Booking Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                New bookings, cancellations, and updates
              </p>
            </div>
            <Switch
              checked={bookingAlerts}
              onCheckedChange={setBookingAlerts}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Payment Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                Payment confirmations, refunds, and failures
              </p>
            </div>
            <Switch
              checked={paymentAlerts}
              onCheckedChange={setPaymentAlerts}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Dispute Alerts</p>
              <p className="text-xs text-gray-500 mt-1">
                New disputes and resolution updates
              </p>
            </div>
            <Switch
              checked={disputeAlerts}
              onCheckedChange={setDisputeAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#00BF63] hover:bg-[#00A055]">
          Save Settings
        </Button>
      </div>
    </div>
  );
}

// Security Settings
export function SecuritySettings() {
  const { data, isLoading, error } = useApi<any>("/api/admin/v1/settings/security");

  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [ipAddresses, setIpAddresses] = useState("");

  useEffect(() => {
    if (data) {
      setTwoFactorAuth(data.twoFactorAuth ?? false);
      setSessionTimeout(data.sessionTimeout?.toString() ?? "30");
      setIpWhitelisting(data.ipWhitelisting ?? false);
      setIpAddresses(data.ipAddresses ?? "");
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await apiCall("/api/admin/v1/settings/security", {
        method: "PUT",
        body: JSON.stringify({
          twoFactorAuth,
          sessionTimeout: parseInt(sessionTimeout, 10),
          ipWhitelisting,
          ipAddresses,
        }),
      });
      toast.success("Security settings saved successfully", {
        className: "bg-[#00BF63] text-white border-none"
      });
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-700 font-medium">Failed to load security settings</p>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage security and access control settings
        </p>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00BF63]" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mt-1">
                Require 2FA for all admin logins
              </p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Auto-logout after period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-900">IP Whitelisting</p>
              <p className="text-xs text-gray-500 mt-1">
                Only allow access from approved IP addresses
              </p>
            </div>
            <Switch
              checked={ipWhitelisting}
              onCheckedChange={setIpWhitelisting}
            />
          </div>

          {ipWhitelisting && (
            <div className="space-y-2">
              <Label htmlFor="ipAddresses">Allowed IP Addresses</Label>
              <Input
                id="ipAddresses"
                placeholder="e.g., 192.168.1.1, 192.168.1.2"
                value={ipAddresses}
                onChange={(e) => setIpAddresses(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter comma-separated IP addresses
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#00BF63] hover:bg-[#00A055]">
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}

// Audit Trail
export function AuditTrail() {
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [selectedAdminUser, setSelectedAdminUser] = useState("all");
  const [selectedActionType, setSelectedActionType] = useState("all");
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", pageSize.toString());
  if (searchQuery) queryParams.append("search", searchQuery);
  if (selectedDateRange !== "all") queryParams.append("dateRange", selectedDateRange);
  if (selectedAdminUser !== "all") queryParams.append("adminUser", selectedAdminUser);
  if (selectedActionType !== "all") queryParams.append("actionType", selectedActionType);
  if (selectedEntityType !== "all") queryParams.append("entityType", selectedEntityType);

  const { data, isLoading, error } = useApi<any>(`/api/admin/v1/audit-trail?${queryParams.toString()}`);

  const auditLogs = data?.logs || [];
  const totalLogs = data?.total || 0;
  const stats = data?.stats || { totalToday: 0, activeAdmins: 0 };

  // Filtering is now handled by the backend
  const filteredLogs = auditLogs;

  const handleExportLogs = () => {
    toast.success("Audit logs exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500 mt-1">
          Track all admin actions and system changes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Actions Today</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalToday || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Active Admin Users</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeAdmins || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Clock className="w-6 h-6 text-[#00BF63]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Live</p>
                <p className="text-xs text-gray-400 mt-1">Tracking enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#00BF63]" />
              Filters
            </CardTitle>
            <Button
              onClick={handleExportLogs}
              className="bg-[#00BF63] hover:bg-[#00A055]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Logs */}
            <div className="space-y-2">
              <Label htmlFor="searchLogs">Search Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="searchLogs"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thismonth">This Month</SelectItem>
                  <SelectItem value="lastmonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin User */}
            <div className="space-y-2">
              <Label htmlFor="adminUser">Admin User</Label>
              <Select value={selectedAdminUser} onValueChange={setSelectedAdminUser}>
                <SelectTrigger id="adminUser">
                  <SelectValue placeholder="Select admin user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admin Users</SelectItem>
                  <SelectItem value="Juan Dela Cruz">Juan Dela Cruz</SelectItem>
                  <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                  <SelectItem value="Roberto Garcia">Roberto Garcia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="resolve">Resolve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="Admin User">Admin User</SelectItem>
                  <SelectItem value="Service Provider">Service Provider</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Payout">Payout</SelectItem>
                  <SelectItem value="Dispute">Dispute</SelectItem>
                  <SelectItem value="Promotion">Promotion</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredLogs.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalLogs}</span> logs
            </p>
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 font-medium">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={filteredLogs.length < pageSize || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {error ? (
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p>{error}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No audit logs found matching your criteria.</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="font-mono font-semibold text-[#00BF63]">{log.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">{log.adminUser}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      {log.entity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{log.details}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-gray-600">{log.ipAddress}</span>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-4">
        {isLoading ? (
           Array.from({ length: 3 }).map((_, index) => (
             <Card key={index}>
               <CardContent className="p-4">
                 <Skeleton className="h-20 w-full" />
               </CardContent>
             </Card>
           ))
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No audit logs found.
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log: any) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-[#00BF63]">{log.id}</span>
                  <p className="font-medium text-gray-900 mt-1">{log.adminUser}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {log.action}
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  {log.entity}
                </Badge>
                <p className="text-sm text-gray-700">{log.details}</p>
                <p className="font-mono text-xs text-gray-600">IP: {log.ipAddress}</p>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
}

// Integrations
export function Integrations() {
  const { data, isLoading, error } = useApi<any>("/api/admin/v1/settings/integrations");
  const storageKey = "servease_integrations";

  const defaultIntegrations = {
    gcash: { enabled: true, connected: true },
    paymaya: { enabled: true, connected: true },
    stripe: { enabled: false, connected: false },
    twilio: { enabled: true, connected: true },
    sendgrid: { enabled: true, connected: true },
    googleMaps: { enabled: true, connected: true },
    mixpanel: { enabled: false, connected: false },
    firebase: { enabled: true, connected: true },
  };

  const [localIntegrations, setLocalIntegrations] = useState<any>(null);

  const readStoredIntegrations = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeStoredIntegrations = (next: any) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignore storage failures (e.g., private mode)
    }
  };

  useEffect(() => {
    const stored = readStoredIntegrations();
    if (stored) {
      setLocalIntegrations(stored);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredIntegrations();
    if (data && !stored) {
      setLocalIntegrations(data);
    }
  }, [data]);

  const integrations = localIntegrations || data || defaultIntegrations;

  const integrationEndpointKeys: Record<string, string> = {
    gcash: "gcash",
    paymaya: "paymaya",
    stripe: "stripe",
    twilio: "twilio",
    sendgrid: "sendgrid",
    googleMaps: "google-maps",
    mixpanel: "mixpanel",
    firebase: "firebase",
  };

  const integrationLabels: Record<string, string> = {
    gcash: "GCash",
    paymaya: "PayMaya",
    stripe: "Stripe",
    twilio: "Twilio",
    sendgrid: "SendGrid",
    googleMaps: "Google Maps",
    mixpanel: "Mixpanel",
    firebase: "Firebase",
  };

  const getIntegrationEndpointKey = (service: string) =>
    integrationEndpointKeys[service] ?? service;

  const getIntegrationLabel = (service: string) =>
    integrationLabels[service] ?? service;

  const handleTestIntegration = async (service: string) => {
    const endpointKey = getIntegrationEndpointKey(service);
    const label = getIntegrationLabel(service);
    try {
      await apiCall(`/api/admin/v1/settings/integrations/${endpointKey}/test`, {
        method: "POST",
      });
      toast.success(`${label} integration test successful`);
    } catch (err: any) {
      toast.error(`Failed to test ${label}`, { description: err.message });
    }
  };

  const handleUpdateCredentials = async (service: string) => {
    const label = getIntegrationLabel(service);
    toast.success(`${label} credentials update initiated...`);
  };

  const handleToggle = async (service: string, currentState: boolean) => {
    const endpointKey = getIntegrationEndpointKey(service);
    // Optimistic update — flip immediately, no refetch, no success toast
    setLocalIntegrations((prev: any) => ({
      ...(prev || integrations),
      [service]: { ...(prev?.[service] || integrations[service]), enabled: !currentState },
    }));

    try {
      await apiCall(`/api/admin/v1/settings/integrations/${endpointKey}/toggle`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !currentState }),
      });
      const nextState = {
        ...(localIntegrations || integrations),
        [service]: {
          ...(localIntegrations?.[service] || integrations[service]),
          enabled: !currentState,
        },
      };
      writeStoredIntegrations(nextState);
    } catch (err: any) {
      // Revert on failure
      setLocalIntegrations((prev: any) => ({
        ...(prev || integrations),
        [service]: { ...(prev?.[service] || integrations[service]), enabled: currentState },
      }));
      toast.error(`Failed to toggle ${service}`, { description: err.message });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-700 font-medium">Failed to load integrations</p>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">
          Manage third-party services and API integrations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Plug className="w-6 h-6 text-[#00BF63]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
                <p className="text-xs text-gray-400 mt-1">Out of 8 total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Connected Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">100%</p>
                <p className="text-xs text-gray-400 mt-1">All services online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Last Health Check</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2 min</p>
                <p className="text-xs text-gray-400 mt-1">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00BF63]" />
            Payment Gateways
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GCash */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">GCash</h4>
                  <p className="text-sm text-gray-500">Philippine mobile wallet payment</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.gcash?.enabled ? "default" : "secondary"}
                  className={
                    integrations.gcash?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.gcash?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.gcash?.enabled}
                  onCheckedChange={() => handleToggle("gcash", integrations.gcash?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Button
                variant="outline"
                  onClick={() => handleTestIntegration("gcash")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
                <Button
                  onClick={() => handleUpdateCredentials("gcash")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>

          {/* PayMaya */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">PayMaya</h4>
                  <p className="text-sm text-gray-500">Digital payment solution for Philippines</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.paymaya?.enabled ? "default" : "secondary"}
                  className={
                    integrations.paymaya?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.paymaya?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.paymaya?.enabled}
                  onCheckedChange={() => handleToggle("paymaya", integrations.paymaya?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Button
                variant="outline"
                  onClick={() => handleTestIntegration("paymaya")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
                <Button
                  onClick={() => handleUpdateCredentials("paymaya")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>

          {/* Stripe */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Stripe</h4>
                  <p className="text-sm text-gray-500">International payment processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.stripe?.enabled ? "default" : "secondary"}
                  className={
                    integrations.stripe?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.stripe?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.stripe?.enabled}
                  onCheckedChange={() => handleToggle("stripe", integrations.stripe?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Button
                variant="outline"
                  onClick={() => handleTestIntegration("stripe")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
                <Button
                  onClick={() => handleUpdateCredentials("stripe")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Gateway */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00BF63]" />
            SMS Gateway
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Twilio */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Twilio</h4>
                  <p className="text-sm text-gray-500">SMS and communication API</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.twilio?.enabled ? "default" : "secondary"}
                  className={
                    integrations.twilio?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.twilio?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.twilio?.enabled}
                  onCheckedChange={() => handleToggle("twilio", integrations.twilio?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleTestIntegration("twilio")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
              <Button
                onClick={() => handleUpdateCredentials("twilio")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00BF63]" />
            Email Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* SendGrid */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">SendGrid</h4>
                  <p className="text-sm text-gray-500">Email delivery service</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.sendgrid?.enabled ? "default" : "secondary"}
                  className={
                    integrations.sendgrid?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.sendgrid?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.sendgrid?.enabled}
                  onCheckedChange={() => handleToggle("sendgrid", integrations.sendgrid?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleTestIntegration("sendgrid")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
              <Button
                onClick={() => handleUpdateCredentials("sendgrid")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00BF63]" />
            Maps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Google Maps */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Google Maps API</h4>
                  <p className="text-sm text-gray-500">Location and mapping services</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.googleMaps?.enabled ? "default" : "secondary"}
                  className={
                    integrations.googleMaps?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.googleMaps?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.googleMaps?.enabled}
                  onCheckedChange={() => handleToggle("googleMaps", integrations.googleMaps?.enabled)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleMapsKey">API Key</Label>
                <Input
                  id="googleMapsKey"
                  type="text"
                  placeholder="AIza..."
                  defaultValue="AIzaSyBdVl-cTICSwYKrZ95SuvNw7dbMuDt1KG0"
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestIntegration("googleMaps")}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Integration
                </Button>
                <Button
                  onClick={() => handleUpdateCredentials("googleMaps")}
                  className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Credentials
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00BF63]" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mixpanel */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mixpanel</h4>
                  <p className="text-sm text-gray-500">Product analytics platform</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.mixpanel?.enabled ? "default" : "secondary"}
                  className={
                    integrations.mixpanel?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.mixpanel?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.mixpanel?.enabled}
                  onCheckedChange={() => handleToggle("mixpanel", integrations.mixpanel?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleTestIntegration("mixpanel")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
              <Button
                onClick={() => handleUpdateCredentials("mixpanel")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>

          {/* Firebase */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Firebase</h4>
                  <p className="text-sm text-gray-500">Analytics and app performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={integrations.firebase?.enabled ? "default" : "secondary"}
                  className={
                    integrations.firebase?.enabled
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {integrations.firebase?.enabled ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <Switch
                  checked={integrations.firebase?.enabled}
                  onCheckedChange={() => handleToggle("firebase", integrations.firebase?.enabled)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleTestIntegration("firebase")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
              <Button
                onClick={() => handleUpdateCredentials("firebase")}
                className="flex-1 bg-[#00BF63] hover:bg-[#00A055]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Credentials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

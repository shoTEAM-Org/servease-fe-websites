import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  Camera,
  Edit,
  Key,
  ShieldCheck,
  FileText,
  Monitor,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { apiCall } from "../../services/api";

type AdminProfileRecord = {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  contact_number?: string;
  role?: string;
  created_at?: string;
  last_login_at?: string;
  avatar_url?: string;
  permissions?: string[];
  two_factor_enabled?: boolean;
  login_history?: Array<{
    id?: string;
    timestamp?: string;
    device?: string;
    location?: string;
    ipAddress?: string;
    status?: string;
  }>;
};

function formatRole(role?: string) {
  if (!role) return "Admin";
  return role
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getRoleBadgeClass(role?: string) {
  const normalized = role?.toLowerCase() || "";
  if (normalized.includes("super")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (normalized.includes("finance")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (normalized.includes("support")) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export function AdminProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiCall<any>("/api/admin/v1/account/profile");
        const record = response?.profile ?? response;
        setProfile(record ?? null);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayName = profile?.full_name || profile?.name || "";
  const displayEmail = profile?.email || "";
  const displayPhone = profile?.contact_number || "";
  const displayRole = formatRole(profile?.role);
  const roleBadgeClass = getRoleBadgeClass(profile?.role);
  const displayCreatedAt = profile?.created_at || "";
  const displayLastLogin = profile?.last_login_at || "";
  const displayPhoto =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      displayName || "Admin",
    )}`;
  const permissions = Array.isArray(profile?.permissions) ? profile.permissions : [];
  const loginHistory = Array.isArray(profile?.login_history)
    ? profile.login_history
    : [];
  const twoFactorState = profile?.two_factor_enabled;

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your admin account information
          </p>
          {isLoading && (
            <p className="text-xs text-gray-400 mt-2">Loading profile...</p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/audit-trail")}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Activity Log
          </Button>
          <Button 
            size="sm" 
            className="bg-[#16A34A] hover:bg-[#15803D]"
            onClick={() => {/* Edit profile handler */}}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Profile Info Card */}
        <div className="col-span-1 space-y-6">
          {/* Profile Photo & Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={displayPhoto}
                    alt={displayName || "Admin"}
                    className="w-32 h-32 rounded-full border-4 border-gray-100"
                  />
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mt-4">
                  {displayName || "Admin"}
                </h2>
                <Badge className={`mt-2 ${roleBadgeClass}`}>{displayRole}</Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{displayEmail || "--"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{displayPhone || "--"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{displayRole}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Account Created</div>
                    <div className="text-base font-semibold text-gray-900 mt-0.5">
                      {displayCreatedAt ? formatDate(displayCreatedAt) : "--"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Last Login</div>
                    <div className="text-base font-semibold text-gray-900 mt-0.5">
                      {displayLastLogin ? formatDateTime(displayLastLogin) : "--"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {twoFactorState === true ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Enabled</span>
                    </>
                  ) : twoFactorState === false ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Disabled</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Unknown</span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={twoFactorState == null}
                  onClick={() => {/* Toggle 2FA handler */}}
                >
                  {twoFactorState ? "Disable" : "Enable"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Two-factor authentication adds an extra layer of security to your account.
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {/* Change password handler */}}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => navigate("/security-settings")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Permissions & Login History */}
        <div className="col-span-2 space-y-6">
          {/* Permissions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissions Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {permissions.length === 0 ? (
                  <div className="col-span-2 text-sm text-gray-500">
                    Permissions are managed by role and are not available yet.
                  </div>
                ) : (
                  permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-green-900">
                        {permission}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> As a {displayRole}, you have access based on your assigned role permissions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Login History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Login History (Recent 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[200px]">Device</TableHead>
                      <TableHead className="w-[180px]">Location</TableHead>
                      <TableHead className="w-[140px]">IP Address</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-xs text-gray-400">
                          No login activity available yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginHistory.map((log, index) => (
                        <TableRow key={log.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell className="py-3">
                            <span className="text-xs text-gray-600">
                              {log.timestamp ? formatDateTime(log.timestamp) : "--"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-700">{log.device || "--"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-700">{log.location || "--"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-xs font-mono text-gray-500">
                              {log.ipAddress || "--"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              className={
                                log.status === "success"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }
                            >
                              {log.status === "success" ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
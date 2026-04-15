import { useEffect, useMemo, useState } from "react";
import { Search, Star, TrendingUp, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "@/lib/react-router-compat";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type ProviderRow = {
  id: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  status: string;
  created_at: string;
  business_name: string;
  average_rating: number;
  booking_count: number;
  verification_status: string | null;
};

type ProvidersResponse = {
  providers: ProviderRow[];
  total: number;
  page: number;
  limit: number;
};

const LIMIT = 20;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeProvider(raw: Partial<ProviderRow>): ProviderRow {
  return {
    id: asString(raw.id),
    full_name: asString(raw.full_name, "—"),
    email: asString(raw.email, "—"),
    contact_number: typeof raw.contact_number === "string" ? raw.contact_number : null,
    status: asString(raw.status, "inactive"),
    created_at: asString(raw.created_at),
    business_name: asString(raw.business_name, asString(raw.full_name, "—")),
    average_rating: asNumber(raw.average_rating),
    booking_count: asNumber(raw.booking_count),
    verification_status: typeof raw.verification_status === "string" ? raw.verification_status : null,
  };
}

function ProvidersSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[520px] w-full rounded-xl" />
    </>
  );
}

function LoadingNotice() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4 text-sm text-blue-700">
        Loading providers...
      </CardContent>
    </Card>
  );
}

export function ServiceProviders() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProvidersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<ProvidersResponse>(
          `/api/admin/v1/users/providers?page=${page}&limit=${LIMIT}`
        );
        if (!cancelled) {
          const providers = Array.isArray((result as { providers?: unknown[] }).providers)
            ? (result as { providers: unknown[] }).providers.map((raw) =>
                normalizeProvider((raw ?? {}) as Partial<ProviderRow>)
              )
            : [];
          setData({
            providers,
            total: asNumber((result as { total?: unknown }).total, providers.length),
            page: asNumber((result as { page?: unknown }).page, page),
            limit: asNumber((result as { limit?: unknown }).limit, LIMIT),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load providers.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  async function toggleStatus(provider: ProviderRow) {
    const newStatus = asString(provider.status).toLowerCase() === "active" ? "suspended" : "active";
    setTogglingId(provider.id);
    try {
      await fetchAdminJson<{ ok: boolean }>(`/api/admin/v1/users/providers/${provider.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Provider status updated.");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update provider status.");
    } finally {
      setTogglingId(null);
    }
  }

  const providers = data?.providers ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  const filtered = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return providers.filter(
      (p) =>
        asString(p.business_name).toLowerCase().includes(needle) ||
        asString(p.full_name).toLowerCase().includes(needle) ||
        asString(p.email).toLowerCase().includes(needle) ||
        asString(p.id).toLowerCase().includes(needle)
    );
  }, [providers, searchTerm]);

  const activeCount = providers.filter((p) => asString(p.status).toLowerCase() === "active").length;
  const totalBookings = providers.reduce((sum, p) => sum + p.booking_count, 0);
  const avgRating =
    providers.length > 0
      ? providers.reduce((sum, p) => sum + Number(p.average_rating || 0), 0) / providers.length
      : 0;
  const approvedCount = providers.filter((p) => p.verification_status === "approved").length;

  const stats = [
    {
      title: "Total Service Providers",
      value: total.toLocaleString(),
      change: "All registered providers",
      icon: Users,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "Active (this page)",
      value: activeCount.toString(),
      change: `of ${providers.length} on this page`,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg Rating (this page)",
      value: avgRating.toFixed(2),
      change: "Based on provider profiles",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved Profiles",
      value: approvedCount.toString(),
      change: `Bookings: ${totalBookings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
        <p className="text-gray-500 mt-1">Manage and monitor service providers on the platform</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load providers</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <>
          <LoadingNotice />
          <ProvidersSkeleton />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Service Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by business, owner, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider ID</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No service providers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((provider) => {
                        const isActive = asString(provider.status).toLowerCase() === "active";
                        const isToggling = togglingId === provider.id;
                        return (
                          <TableRow key={provider.id}>
                            <TableCell>
                              <span className="font-mono font-semibold text-[#16A34A] text-sm">
                                {provider.id ? `${provider.id.slice(0, 8)}…` : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-gray-900">{provider.business_name || "—"}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{provider.full_name || "—"}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{provider.email || "—"}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{provider.contact_number || "—"}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-gray-900">
                                  {Number(provider.average_rating || 0).toFixed(1)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900">
                                {provider.booking_count.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              {isActive ? (
                                <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">{provider.status}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => navigate(`/service-providers/${provider.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isActive ? "destructive" : "outline"}
                                  disabled={isToggling}
                                  onClick={() => void toggleStatus(provider)}
                                  className="text-xs"
                                >
                                  {isToggling
                                    ? "Updating…"
                                    : isActive
                                    ? "Suspend"
                                    : "Activate"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  {total === 0
                    ? "No providers"
                    : `Showing ${rangeStart}–${rangeEnd} of ${total} providers`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

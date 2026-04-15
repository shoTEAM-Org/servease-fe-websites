import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/react-router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { fetchAdminJson } from "../lib/adminApi";

type ApplicationStatus = "pending" | "approved" | "rejected";

type ProviderApplication = {
  applicationId: string;
  providerId: string;
  businessName: string;
  ownerName: string;
  category: string;
  dateApplied: string;
  location: string;
  status: ApplicationStatus;
  email: string | null;
  contact_number: string | null;
};

type ProviderApplicationsResponse = {
  applications: ProviderApplication[];
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

function asStatus(value: unknown): ApplicationStatus {
  const status = asString(value).toLowerCase();
  if (status === "approved" || status === "rejected") return status;
  return "pending";
}

function normalizeApplication(raw: Partial<ProviderApplication>): ProviderApplication {
  return {
    applicationId: asString(raw.applicationId),
    providerId: asString(raw.providerId),
    businessName: asString(raw.businessName, "Unnamed Business"),
    ownerName: asString(raw.ownerName, "Unknown Owner"),
    category: asString(raw.category, "General Services"),
    dateApplied: asString(raw.dateApplied),
    location: asString(raw.location, "—"),
    status: asStatus(raw.status),
    email: typeof raw.email === "string" ? raw.email : null,
    contact_number: typeof raw.contact_number === "string" ? raw.contact_number : null,
  };
}

export function ProviderApplications() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProviderApplicationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<ProviderApplicationsResponse>(
          `/api/admin/v1/users/provider-applications?page=${page}&limit=${LIMIT}&status=${statusFilter}`
        );

        if (!cancelled) {
          const applications = Array.isArray((result as { applications?: unknown[] }).applications)
            ? (result as { applications: unknown[] }).applications.map((raw) =>
                normalizeApplication((raw ?? {}) as Partial<ProviderApplication>)
              )
            : [];
          setData({
            applications,
            total: asNumber((result as { total?: unknown }).total, applications.length),
            page: asNumber((result as { page?: unknown }).page, page),
            limit: asNumber((result as { limit?: unknown }).limit, LIMIT),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load provider applications.");
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
  }, [page, statusFilter]);

  const applications = data?.applications ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const pendingCount = applications.filter((app) => app.status === "pending").length;
  const approvedCount = applications.filter((app) => app.status === "approved").length;
  const rejectedCount = applications.filter((app) => app.status === "rejected").length;

  const filteredApplications = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        app.businessName.toLowerCase().includes(needle) ||
        app.ownerName.toLowerCase().includes(needle) ||
        app.applicationId.toLowerCase().includes(needle);
      const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [applications, searchTerm, categoryFilter]);

  const categories = Array.from(new Set(applications.map((app) => app.category))).sort();

  const stats = [
    {
      title: "Pending Review",
      value: pendingCount.toString(),
      subtitle: "Awaiting approval",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Approved (page)",
      value: approvedCount.toString(),
      subtitle: "Processed applications",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected (page)",
      value: rejectedCount.toString(),
      subtitle: "Requires re-submission",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const getStatusBadge = (status: ApplicationStatus) => {
    if (status === "pending") {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Review</Badge>;
    }
    if (status === "approved") {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Provider Applications</h1>
        <p className="text-gray-500 mt-1">Review and approve new service provider applications</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load approval queue</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Queue</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredApplications.length} of {total} applications
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No applications found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.applicationId}>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900">{app.applicationId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{app.businessName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{app.ownerName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{app.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {app.dateApplied
                            ? new Date(app.dateApplied).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{app.location}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/provider-applications/${app.applicationId}`)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              {total === 0
                ? "No applications"
                : `Page ${page} of ${totalPages} (${total.toLocaleString()} total)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

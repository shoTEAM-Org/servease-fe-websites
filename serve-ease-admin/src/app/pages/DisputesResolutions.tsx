import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  DollarSign,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAdminJson } from "../lib/adminApi";

type ApiDispute = {
  id?: string;
  dispute_id?: string;
  booking_id?: string | null;
  booking_public_id?: string | null;
  customer_id?: string | null;
  provider_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  provider_name?: string;
  provider_email?: string;
  reason?: string | null;
  amount?: number | null;
  status?: string | null;
  created_at?: string | null;
};

type DisputesResponse = {
  disputes: ApiDispute[];
  total: number;
  page: number;
  limit: number;
};

type DisputeStatusFilter = "all" | "open" | "investigating" | "resolved" | "closed";
type DisputePriorityFilter = "all" | "high" | "medium" | "low";

type DisputeRow = {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  providerName: string;
  providerEmail: string;
  reason: string;
  amount: number;
  statusRaw: string;
  statusLabel: "Open" | "Investigating" | "Resolved" | "Closed";
  createdAt: string;
  priority: "High" | "Medium" | "Low";
};

const LIMIT = 50;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toStatusLabel(status: string): "Open" | "Investigating" | "Resolved" | "Closed" {
  const normalized = status.toLowerCase();
  if (normalized === "open") return "Open";
  if (normalized === "investigating" || normalized === "under_review" || normalized === "under review") {
    return "Investigating";
  }
  if (normalized === "resolved") return "Resolved";
  return "Closed";
}

function computePriority(amount: number, statusLabel: DisputeRow["statusLabel"]): DisputeRow["priority"] {
  if (statusLabel === "Open" && amount >= 3000) return "High";
  if (amount >= 1500) return "Medium";
  return "Low";
}

function toFilterStatus(status: DisputeStatusFilter): string {
  if (status === "all") return "all";
  if (status === "investigating") return "under_review";
  return status;
}

function mapDispute(raw: ApiDispute): DisputeRow {
  const statusRaw = asString(raw.status, "open");
  const statusLabel = toStatusLabel(statusRaw);
  const amount = asNumber(raw.amount, 0);

  return {
    id: asString(raw.id ?? raw.dispute_id, "—"),
    bookingId: asString(raw.booking_public_id || raw.booking_id, "—"),
    customerName: asString(raw.customer_name, "Unknown Customer"),
    customerEmail: asString(raw.customer_email, "—"),
    providerName: asString(raw.provider_name, "Unknown Provider"),
    providerEmail: asString(raw.provider_email, "—"),
    reason: asString(raw.reason, "No reason provided"),
    amount,
    statusRaw,
    statusLabel,
    createdAt: asString(raw.created_at),
    priority: computePriority(amount, statusLabel),
  };
}

export function DisputesResolutions() {
  const [data, setData] = useState<DisputesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisputeStatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<DisputePriorityFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const statusQuery = toFilterStatus(statusFilter);
        const result = await fetchAdminJson<DisputesResponse>(
          `/api/admin/v1/operations/disputes?page=${page}&limit=${LIMIT}${
            statusQuery !== "all" ? `&status=${encodeURIComponent(statusQuery)}` : ""
          }`
        );

        if (!cancelled) {
          const disputes = Array.isArray((result as { disputes?: unknown[] }).disputes)
            ? ((result as { disputes: unknown[] }).disputes as ApiDispute[])
            : [];

          setData({
            disputes,
            total: asNumber((result as { total?: unknown }).total, disputes.length),
            page: asNumber((result as { page?: unknown }).page, page),
            limit: asNumber((result as { limit?: unknown }).limit, LIMIT),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load disputes.");
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

  const disputes = useMemo(
    () => (data?.disputes ?? []).map((raw) => mapDispute(raw)),
    [data]
  );

  const filteredDisputes = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return disputes.filter((dispute) => {
      const matchesSearch =
        dispute.id.toLowerCase().includes(needle) ||
        dispute.bookingId.toLowerCase().includes(needle) ||
        dispute.customerName.toLowerCase().includes(needle) ||
        dispute.providerName.toLowerCase().includes(needle);

      const matchesPriority = priorityFilter === "all" || dispute.priority.toLowerCase() === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [disputes, searchTerm, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: disputes.length,
      open: disputes.filter((d) => d.statusLabel === "Open").length,
      investigating: disputes.filter((d) => d.statusLabel === "Investigating").length,
      resolved: disputes.filter((d) => d.statusLabel === "Resolved").length,
    };
  }, [disputes]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const getStatusBadge = (status: DisputeRow["statusLabel"]) => {
    if (status === "Open") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Open
        </Badge>
      );
    }
    if (status === "Investigating") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Investigating
        </Badge>
      );
    }
    if (status === "Resolved") {
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolved
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        <XCircle className="w-3 h-3 mr-1" />
        Closed
      </Badge>
    );
  };

  const getPriorityBadge = (priority: DisputeRow["priority"]) => {
    if (priority === "High") return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>;
    if (priority === "Medium") return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Low</Badge>;
  };

  const handleUpdateStatus = async (dispute: DisputeRow, nextStatus: "under_review" | "resolved" | "closed") => {
    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/operations/disputes/${dispute.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(`Dispute ${dispute.id} updated.`);

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          disputes: prev.disputes.map((item) =>
            asString(item.id) === dispute.id ? { ...item, status: nextStatus } : item
          ),
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500 mt-1">Manage and resolve customer disputes and service issues</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load disputes</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
                <p className="text-xs text-gray-400 mt-1">Needs attention</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Investigating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.investigating}</p>
                <p className="text-xs text-gray-400 mt-1">Being processed</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully closed</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <CheckCircle className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">In disputes</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>All Disputes</CardTitle>
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by dispute, booking, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setPage(1);
                setStatusFilter(value as DisputeStatusFilter);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as DisputePriorityFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200 overflow-x-scroll pb-2 [scrollbar-gutter:stable]">
            <Table className="min-w-[1600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[290px] sticky left-0 z-20 bg-white text-gray-800 font-semibold border-r border-gray-200">Dispute ID</TableHead>
                  <TableHead className="min-w-[260px] text-gray-800 font-semibold">Booking ID</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Customer</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Provider</TableHead>
                  <TableHead className="min-w-[260px] text-gray-700 font-semibold">Reason</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Amount</TableHead>
                  <TableHead className="min-w-[160px] text-gray-700 font-semibold">Filed Date</TableHead>
                  <TableHead className="min-w-[130px] text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="min-w-[110px] text-gray-700 font-semibold">Priority</TableHead>
                  <TableHead className="min-w-[210px] text-gray-700 font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Loading disputes...
                    </TableCell>
                  </TableRow>
                ) : filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No disputes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id} className="hover:bg-gray-50">
                      <TableCell className="sticky left-0 z-10 bg-white border-r border-gray-200">
                        <span className="font-mono font-bold text-[#15803D] whitespace-nowrap">{dispute.id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900 whitespace-nowrap">{dispute.bookingId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{dispute.customerName}</p>
                          <p className="text-xs text-gray-600">{dispute.customerEmail || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{dispute.providerName}</p>
                          <p className="text-xs text-gray-600">{dispute.providerEmail || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900 whitespace-normal">{dispute.reason}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₱{dispute.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {dispute.createdAt
                            ? new Date(dispute.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(dispute.statusLabel)}</TableCell>
                      <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {dispute.statusLabel === "Open" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              disabled={isSubmitting}
                              onClick={() => void handleUpdateStatus(dispute, "under_review")}
                            >
                              Start
                            </Button>
                          ) : null}
                          {dispute.statusLabel !== "Resolved" && dispute.statusLabel !== "Closed" ? (
                            <Button
                              size="sm"
                              className="bg-[#16A34A] text-white hover:bg-[#15803D]"
                              disabled={isSubmitting}
                              onClick={() => void handleUpdateStatus(dispute, "resolved")}
                            >
                              Resolve
                            </Button>
                          ) : null}
                          {dispute.statusLabel !== "Closed" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              disabled={isSubmitting}
                              onClick={() => void handleUpdateStatus(dispute, "closed")}
                            >
                              Close
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredDisputes.length} of {total} disputes
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
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

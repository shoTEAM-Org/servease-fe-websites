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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type RefundStatus = "Pending" | "Approved" | "Processed" | "Rejected";

type ApiRefund = {
  id?: string;
  refund_id?: string;
  booking_id?: string | null;
  booking_public_id?: string | null;
  customer_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  amount?: number;
  reason?: string | null;
  refund_reason?: string | null;
  refund_status?: string;
  status?: string;
  requested_date?: string | null;
  created_at?: string | null;
};

type RefundsResponse = {
  payments: ApiRefund[];
  total: number;
  page: number;
  limit: number;
};

type RefundRow = {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedDate: string | null;
};

const LIMIT = 50;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStatus(status: string): RefundStatus {
  const s = status.toLowerCase();
  if (s === "processed" || s === "refunded") return "Processed";
  if (s === "approved" || s === "cancelled") return "Approved";
  if (s === "rejected") return "Rejected";
  return "Pending";
}

function mapRefund(raw: ApiRefund): RefundRow {
  return {
    id: asString(raw.refund_id ?? raw.id),
    bookingId: asString(raw.booking_public_id ?? raw.booking_id, "—"),
    customerName: asString(raw.customer_name, "Unknown Customer"),
    customerEmail: asString(raw.customer_email, "—"),
    amount: asNumber(raw.amount, 0),
    reason: asString(raw.reason ?? raw.refund_reason, "Refund requested"),
    status: normalizeStatus(asString(raw.refund_status ?? raw.status, "pending")),
    requestedDate: raw.requested_date ?? raw.created_at ?? null,
  };
}

export function RefundManagement() {
  const [data, setData] = useState<RefundsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundRow | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<RefundsResponse>(
          `/api/admin/v1/finance/refunds?page=${page}&limit=${LIMIT}`
        );
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load refund requests.");
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
  }, [page]);

  const refunds = useMemo(() => (data?.payments ?? []).map((raw) => mapRefund(raw)), [data]);

  const filteredRefunds = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return refunds.filter((refund) => {
      const matchesSearch =
        refund.id.toLowerCase().includes(needle) ||
        refund.bookingId.toLowerCase().includes(needle) ||
        refund.customerName.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const pending = refunds.filter((r) => r.status === "Pending");
    const approved = refunds.filter((r) => r.status === "Approved");
    const processed = refunds.filter((r) => r.status === "Processed");
    const rejected = refunds.filter((r) => r.status === "Rejected");
    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      processedCount: processed.length,
      rejectedCount: rejected.length,
      pendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
      approvedAmount: approved.reduce((sum, r) => sum + r.amount, 0),
      processedAmount: processed.reduce((sum, r) => sum + r.amount, 0),
    };
  }, [refunds]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const refresh = async () => {
    const result = await fetchAdminJson<RefundsResponse>(
      `/api/admin/v1/finance/refunds?page=${page}&limit=${LIMIT}`
    );
    setData(result);
  };

  const handleApprove = async () => {
    if (!selectedRefund) return;
    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/finance/refunds/${selectedRefund.id}`, {
        method: "PATCH",
      });
      toast.success("Refund marked as processed.");
      setShowApproveDialog(false);
      setSelectedRefund(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process refund.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    setShowRejectDialog(false);
    setSelectedRefund(null);
    setRejectReason("");
    toast.message("Reject action is not wired in backend yet.");
  };

  const getStatusBadge = (status: RefundStatus) => {
    if (status === "Pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (status === "Approved") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (status === "Processed") {
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3 mr-1" />
          Processed
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
        <p className="text-gray-500 mt-1">Review and process customer refund requests</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load refund requests</p>
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
                <p className="text-sm text-gray-500">Pending Refunds</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingCount}</p>
                <p className="text-xs text-gray-400 mt-1">₱{(stats.pendingAmount / 1000).toFixed(1)}K total</p>
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
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approvedCount}</p>
                <p className="text-xs text-gray-400 mt-1">₱{(stats.approvedAmount / 1000).toFixed(1)}K total</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Processed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processedCount}</p>
                <p className="text-xs text-gray-400 mt-1">₱{(stats.processedAmount / 1000).toFixed(1)}K refunded</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <DollarSign className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejectedCount}</p>
                <p className="text-xs text-gray-400 mt-1">Declined requests</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Refund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, booking, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200 overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Refund ID</TableHead>
                  <TableHead className="min-w-[140px] text-gray-700 font-semibold">Booking ID</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Customer</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Amount</TableHead>
                  <TableHead className="min-w-[230px] text-gray-700 font-semibold">Reason</TableHead>
                  <TableHead className="min-w-[160px] text-gray-700 font-semibold">Request Date</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="min-w-[180px] text-gray-700 font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading refund requests...
                    </TableCell>
                  </TableRow>
                ) : filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">{refund.id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-700">{refund.bookingId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{refund.customerName}</p>
                          <p className="text-xs text-gray-600">{refund.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₱{refund.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{refund.reason}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {refund.requestedDate
                            ? new Date(refund.requestedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      <TableCell>
                        {refund.status === "Pending" || refund.status === "Approved" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowApproveDialog(true);
                              }}
                              className="bg-[#16A34A] hover:bg-[#15803D]"
                              disabled={isSubmitting}
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Process
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowRejectDialog(true);
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={isSubmitting}
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredRefunds.length} of {total} refund requests
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

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund Request</DialogTitle>
            <DialogDescription>
              Mark refund <span className="font-mono">{selectedRefund?.id}</span> as processed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedRefund(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleApprove()} className="bg-[#16A34A] hover:bg-[#15803D]" disabled={isSubmitting}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Refund Request</DialogTitle>
            <DialogDescription>
              Capture rejection reason for refund <span className="font-mono">{selectedRefund?.id}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedRefund(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!rejectReason} className="bg-red-600 hover:bg-red-700">
              Reject Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

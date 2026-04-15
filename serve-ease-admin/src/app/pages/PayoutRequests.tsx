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
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type PayoutStatus = "Pending" | "Approved" | "Released" | "Rejected";

type ApiPayout = {
  id?: string;
  provider_id?: string | null;
  provider_name?: string;
  provider_email?: string;
  amount?: number;
  status?: string;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  requested_date?: string | null;
  processed_date?: string | null;
};

type PayoutsResponse = {
  payouts: ApiPayout[];
  total: number;
  page: number;
  limit: number;
};

type PayoutRow = {
  id: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  amount: number;
  status: PayoutStatus;
  bankName: string;
  accountName: string;
  accountNumberMasked: string;
  requestedDate: string | null;
  processedDate: string | null;
};

const LIMIT = 50;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStatus(status: string): PayoutStatus {
  const s = status.toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "released") return "Released";
  if (s === "rejected") return "Rejected";
  return "Pending";
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return "****";
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
}

function mapPayout(raw: ApiPayout): PayoutRow {
  return {
    id: asString(raw.id),
    providerId: asString(raw.provider_id, "—"),
    providerName: asString(raw.provider_name, "Unknown Provider"),
    providerEmail: asString(raw.provider_email, "—"),
    amount: asNumber(raw.amount, 0),
    status: normalizeStatus(asString(raw.status, "pending")),
    bankName: asString(raw.bank_name, "Bank"),
    accountName: asString(raw.account_name, "Account Name"),
    accountNumberMasked: maskAccountNumber(asString(raw.account_number)),
    requestedDate: raw.requested_date ?? null,
    processedDate: raw.processed_date ?? null,
  };
}

export function PayoutRequests() {
  const [data, setData] = useState<PayoutsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRow | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<PayoutsResponse>(
          `/api/admin/v1/finance/payouts?page=${page}&limit=${LIMIT}`
        );
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payout requests.");
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

  const payouts = useMemo(() => (data?.payouts ?? []).map((raw) => mapPayout(raw)), [data]);

  const filteredPayouts = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return payouts.filter((payout) => {
      const matchesSearch =
        payout.id.toLowerCase().includes(needle) ||
        payout.providerName.toLowerCase().includes(needle) ||
        payout.providerId.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payouts, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const pending = payouts.filter((p) => p.status === "Pending");
    const approved = payouts.filter((p) => p.status === "Approved");
    const released = payouts.filter((p) => p.status === "Released");
    const rejected = payouts.filter((p) => p.status === "Rejected");

    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      releasedCount: released.length,
      rejectedCount: rejected.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      approvedAmount: approved.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payouts]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const refresh = async () => {
    const result = await fetchAdminJson<PayoutsResponse>(
      `/api/admin/v1/finance/payouts?page=${page}&limit=${LIMIT}`
    );
    setData(result);
  };

  const handlePayoutAction = async (status: "approved" | "rejected") => {
    if (!selectedPayout) return;
    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/finance/payouts/${selectedPayout.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Payout request ${status}.`);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setSelectedPayout(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update payout request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PayoutStatus) => {
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
    if (status === "Released") {
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <Wallet className="w-3 h-3 mr-1" />
          Released
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
        <h1 className="text-3xl font-bold text-gray-900">Payout Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve service provider payout requests</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load payout requests</p>
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
                <p className="text-sm text-gray-500">Pending Requests</p>
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
                <p className="text-sm text-gray-500">Released</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.releasedCount}</p>
                <p className="text-xs text-gray-400 mt-1">Settled</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Wallet className="w-6 h-6 text-[#16A34A]" />
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
          <CardTitle>All Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, provider name..."
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
                <SelectItem value="Released">Released</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200 overflow-x-auto">
            <Table className="min-w-[1300px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Request ID</TableHead>
                  <TableHead className="min-w-[230px] text-gray-700 font-semibold">Provider</TableHead>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Provider ID</TableHead>
                  <TableHead className="min-w-[130px] text-gray-700 font-semibold">Amount</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Bank Details</TableHead>
                  <TableHead className="min-w-[160px] text-gray-700 font-semibold">Request Date</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="min-w-[180px] text-gray-700 font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading payout requests...
                    </TableCell>
                  </TableRow>
                ) : filteredPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">{payout.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{payout.providerName}</p>
                          <p className="text-xs text-gray-600">{payout.providerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-700">{payout.providerId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₱{payout.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payout.accountName}</p>
                          <p className="text-xs text-gray-600">
                            {payout.bankName} - {payout.accountNumberMasked}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {payout.requestedDate
                            ? new Date(payout.requestedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {payout.status === "Pending" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowApproveDialog(true);
                              }}
                              className="bg-[#16A34A] hover:bg-[#15803D]"
                              disabled={isSubmitting}
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayout(payout);
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
              Showing {filteredPayouts.length} of {total} payout requests
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
            <DialogTitle>Approve Payout Request</DialogTitle>
            <DialogDescription>
              Approve payout request <span className="font-mono">{selectedPayout?.id}</span> for{" "}
              <span className="font-semibold">{selectedPayout?.providerName}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedPayout(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handlePayoutAction("approved")}
              className="bg-[#16A34A] hover:bg-[#15803D]"
              disabled={isSubmitting}
            >
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout Request</DialogTitle>
            <DialogDescription>
              Reject payout request <span className="font-mono">{selectedPayout?.id}</span> for{" "}
              <span className="font-semibold">{selectedPayout?.providerName}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedPayout(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handlePayoutAction("rejected")}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

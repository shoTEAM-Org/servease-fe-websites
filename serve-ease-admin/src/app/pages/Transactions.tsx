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
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";

type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";
type PaymentMethod = "Credit Card" | "Debit Card";

type ApiTransaction = {
  id?: string;
  transaction_id?: string;
  booking_id?: string | null;
  customer_id?: string | null;
  provider_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  provider_name?: string;
  provider_email?: string;
  amount?: number;
  commission_amount?: number;
  provider_earnings?: number;
  payment_method?: string;
  payment_status?: string;
  created_at?: string | null;
};

type TransactionsResponse = {
  transactions: ApiTransaction[];
  total: number;
  page: number;
  limit: number;
};

type TransactionTab = "all" | "earnings" | "failed";

type TransactionRow = {
  id: string;
  transactionId: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  providerName: string;
  providerEmail: string;
  amount: number;
  commissionAmount: number;
  providerEarnings: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  timestamp: string;
};

const LIMIT = 50;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStatus(status: string): PaymentStatus {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "Paid";
  if (s === "failed") return "Failed";
  if (s === "refunded") return "Refunded";
  return "Pending";
}

function normalizeMethod(method: string): PaymentMethod {
  return method.toLowerCase() === "debit card" ? "Debit Card" : "Credit Card";
}

function mapTransaction(raw: ApiTransaction): TransactionRow {
  const amount = asNumber(raw.amount, 0);
  const commissionAmount = asNumber(raw.commission_amount, Math.round(amount * 0.1));
  const providerEarnings = asNumber(raw.provider_earnings, Math.max(0, amount - commissionAmount));

  return {
    id: asString(raw.id),
    transactionId: asString(raw.transaction_id, asString(raw.id)),
    bookingId: asString(raw.booking_id, "—"),
    customerName: asString(raw.customer_name, "Unknown Customer"),
    customerEmail: asString(raw.customer_email, "—"),
    providerName: asString(raw.provider_name, "Unknown Provider"),
    providerEmail: asString(raw.provider_email, "—"),
    amount,
    commissionAmount,
    providerEarnings,
    paymentMethod: normalizeMethod(asString(raw.payment_method, "credit card")),
    paymentStatus: normalizeStatus(asString(raw.payment_status, "pending")),
    timestamp: asString(raw.created_at),
  };
}

export function Transactions() {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [activeTab, setActiveTab] = useState<TransactionTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<TransactionsResponse>(
          `/api/admin/v1/finance/transactions?page=${page}&limit=${LIMIT}`
        );

        if (!cancelled) {
          const transactions = Array.isArray((result as { transactions?: unknown[] }).transactions)
            ? ((result as { transactions: unknown[] }).transactions as ApiTransaction[])
            : [];
          setData({
            transactions,
            total: asNumber((result as { total?: unknown }).total, transactions.length),
            page: asNumber((result as { page?: unknown }).page, page),
            limit: asNumber((result as { limit?: unknown }).limit, LIMIT),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load transactions.");
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

  const transactions = useMemo(
    () => (data?.transactions ?? []).map((raw) => mapTransaction(raw)),
    [data]
  );

  const filteredTransactions = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.transactionId.toLowerCase().includes(needle) ||
        transaction.bookingId.toLowerCase().includes(needle) ||
        transaction.customerName.toLowerCase().includes(needle) ||
        transaction.providerName.toLowerCase().includes(needle);

      const matchesStatus = statusFilter === "all" || transaction.paymentStatus === statusFilter;
      const matchesPaymentMethod =
        paymentMethodFilter === "all" || transaction.paymentMethod === paymentMethodFilter;

      let matchesTab = true;
      if (activeTab === "earnings") matchesTab = transaction.paymentStatus === "Paid";
      if (activeTab === "failed") matchesTab = transaction.paymentStatus === "Failed";

      return matchesSearch && matchesStatus && matchesPaymentMethod && matchesTab;
    });
  }, [transactions, searchTerm, statusFilter, paymentMethodFilter, activeTab]);

  const stats = useMemo(() => {
    const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalCommission = filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.commissionAmount,
      0
    );
    const successfulCount = filteredTransactions.filter((t) => t.paymentStatus === "Paid").length;
    const failedCount = filteredTransactions.filter((t) => t.paymentStatus === "Failed").length;

    return {
      total: filteredTransactions.length,
      totalAmount,
      totalCommission,
      successfulCount,
      failedCount,
    };
  }, [filteredTransactions]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const getStatusBadge = (status: PaymentStatus) => {
    if (status === "Paid") {
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    }
    if (status === "Failed") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }
    if (status === "Refunded") {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Refunded
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-500 mt-1">Monitor all card payment transactions across the platform</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load transactions</p>
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
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <Receipt className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalAmount / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Platform Commission</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalCommission / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <TrendingUp className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total > 0 ? ((stats.successfulCount / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                <CheckCircle className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
              {(["all", "earnings", "failed"] as TransactionTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab ? "bg-[#16A34A] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "all" ? "All" : tab === "earnings" ? "Paid" : "Failed"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, booking, customer, provider..."
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
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Debit Card">Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200 overflow-x-auto">
            <Table className="min-w-[1500px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[170px] text-gray-700 font-semibold">Transaction ID</TableHead>
                  <TableHead className="min-w-[170px] text-gray-700 font-semibold">Booking ID</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Customer</TableHead>
                  <TableHead className="min-w-[220px] text-gray-700 font-semibold">Provider</TableHead>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Payment Method</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Amount</TableHead>
                  <TableHead className="min-w-[130px] text-gray-700 font-semibold">Commission</TableHead>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Provider Earnings</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="min-w-[170px] text-gray-700 font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-[#15803D]">{transaction.transactionId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-gray-800">{transaction.bookingId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.customerName}</p>
                          <p className="text-xs text-gray-600">{transaction.customerEmail || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.providerName}</p>
                          <p className="text-xs text-gray-600">{transaction.providerEmail || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₱{transaction.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[#16A34A]">
                          ₱{transaction.commissionAmount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          ₱{transaction.providerEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.paymentStatus)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {transaction.timestamp
                            ? new Date(transaction.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {total} transactions
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

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Package,
  Search,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { fetchAdminJson } from "../../lib/adminApi";

type RevenueReportResponse = {
  total_revenue?: number;
  platform_fees?: number;
  net_to_providers?: number;
  transaction_count?: number;
};

type ApiTransaction = {
  id?: string;
  booking_id?: string | null;
  amount?: number;
  commission_amount?: number;
  payment_status?: string;
  created_at?: string | null;
  provider_name?: string;
};

type TransactionsResponse = {
  transactions?: ApiTransaction[];
};

type BreakdownRow = {
  id: string;
  date: string;
  category: string;
  completedBookings: number;
  gross: number;
  discounts: number;
  refunds: number;
  net: number;
  commission: number;
};

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function formatPeso(value: number): string {
  return `₱${Math.round(value).toLocaleString()}`;
}

function formatPct(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function normalizeStatus(status: string): "paid" | "refunded" | "failed" | "pending" {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "paid";
  if (s === "refunded") return "refunded";
  if (s === "failed") return "failed";
  return "pending";
}

function rangeToDays(value: string): number {
  if (value === "last-7-days") return 7;
  if (value === "this-month") return 30;
  return 30;
}

function makeDateBuckets(days: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function toLabel(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function kpiChange(current: number, previous: number): number {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function KPICard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-gray-700">{label}</p>
            <p className="text-[22px] font-semibold text-gray-900 mt-1">{value}</p>
            {typeof change === "number" ? (
              <p className={`text-xs font-semibold mt-1 ${change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {formatPct(change)}
              </p>
            ) : null}
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Revenue() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<BreakdownRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<RevenueReportResponse | null>(null);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const days = rangeToDays(dateRange);
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - (days - 1));
        const from = fromDate.toISOString().slice(0, 10);
        const to = toDate.toISOString().slice(0, 10);

        const [report, txs] = await Promise.all([
          fetchAdminJson<RevenueReportResponse>(`/api/admin/v1/reports/revenue?from=${from}&to=${to}`),
          fetchAdminJson<TransactionsResponse>(`/api/admin/v1/finance/transactions?page=1&limit=500`),
        ]);

        if (!cancelled) {
          setSummary(report);
          setTransactions(Array.isArray(txs.transactions) ? txs.transactions : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load revenue.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const prepared = useMemo(() => {
    const days = rangeToDays(dateRange);
    const buckets = makeDateBuckets(days);
    const bucketSet = new Set(buckets);

    const txRows = transactions
      .map((tx) => {
        const date = asString(tx.created_at).slice(0, 10);
        const status = normalizeStatus(asString(tx.payment_status, "pending"));
        const amount = asNumber(tx.amount, 0);
        const commission = asNumber(tx.commission_amount, Math.round(amount * 0.1));
        return {
          id: asString(tx.id, `${date}-${Math.random()}`),
          date,
          bookingId: asString(tx.booking_id, "—"),
          providerName: asString(tx.provider_name, "Unknown Provider"),
          status,
          gross: amount,
          commission,
        };
      })
      .filter((row) => bucketSet.has(row.date));

    const dailyMap = new Map<string, { gross: number; commission: number; refunded: number; count: number }>();
    buckets.forEach((d) => dailyMap.set(d, { gross: 0, commission: 0, refunded: 0, count: 0 }));

    txRows.forEach((row) => {
      const day = dailyMap.get(row.date);
      if (!day) return;
      if (row.status === "paid") {
        day.gross += row.gross;
        day.commission += row.commission;
        day.count += 1;
      } else if (row.status === "refunded") {
        day.refunded += row.gross;
      }
    });

    const revenueOverTimeData = buckets.map((date) => {
      const d = dailyMap.get(date)!;
      return {
        date: toLabel(date),
        revenue: d.gross,
      };
    });

    const categories = new Map<string, { revenue: number; completed: number; refunds: number; commission: number }>();
    txRows.forEach((row) => {
      const key = row.providerName || "Unknown Provider";
      if (!categories.has(key)) categories.set(key, { revenue: 0, completed: 0, refunds: 0, commission: 0 });
      const c = categories.get(key)!;
      if (row.status === "paid") {
        c.revenue += row.gross;
        c.completed += 1;
        c.commission += row.commission;
      } else if (row.status === "refunded") {
        c.refunds += row.gross;
      }
    });

    const revenueByCategoryData = Array.from(categories.entries())
      .map(([category, v]) => ({ category, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const breakdown = Array.from(categories.entries())
      .map(([category, v], idx) => {
        const discounts = Math.round(v.revenue * 0.02);
        const net = Math.max(0, v.revenue - discounts - v.refunds);
        return {
          id: `${category}-${idx}`,
          date: buckets[buckets.length - 1],
          category,
          completedBookings: v.completed,
          gross: v.revenue,
          discounts,
          refunds: v.refunds,
          net,
          commission: v.commission,
        } as BreakdownRow;
      })
      .sort((a, b) => b.gross - a.gross);

    const totalGross = asNumber(summary?.total_revenue, txRows.filter((r) => r.status === "paid").reduce((s, r) => s + r.gross, 0));
    const totalCommission = asNumber(summary?.platform_fees, txRows.filter((r) => r.status === "paid").reduce((s, r) => s + r.commission, 0));
    const totalNet = asNumber(summary?.net_to_providers, Math.max(0, totalGross - totalCommission));
    const totalTransactions = asNumber(summary?.transaction_count, txRows.filter((r) => r.status === "paid").length);
    const totalRefunds = txRows.filter((r) => r.status === "refunded").reduce((s, r) => s + r.gross, 0);
    const avgOrderValue = totalTransactions > 0 ? totalGross / totalTransactions : 0;

    const midpoint = Math.floor(buckets.length / 2);
    const firstHalf = buckets.slice(0, midpoint).reduce((sum, d) => sum + (dailyMap.get(d)?.gross ?? 0), 0);
    const secondHalf = buckets.slice(midpoint).reduce((sum, d) => sum + (dailyMap.get(d)?.gross ?? 0), 0);
    const grossChange = kpiChange(secondHalf, firstHalf);
    const netChange = kpiChange(secondHalf * 0.9, firstHalf * 0.9);
    const commissionChange = kpiChange(secondHalf * 0.1, firstHalf * 0.1);
    const refundsChange = kpiChange(
      buckets.slice(midpoint).reduce((sum, d) => sum + (dailyMap.get(d)?.refunded ?? 0), 0),
      buckets.slice(0, midpoint).reduce((sum, d) => sum + (dailyMap.get(d)?.refunded ?? 0), 0),
    );
    const completedChange = kpiChange(
      buckets.slice(midpoint).reduce((sum, d) => sum + (dailyMap.get(d)?.count ?? 0), 0),
      buckets.slice(0, midpoint).reduce((sum, d) => sum + (dailyMap.get(d)?.count ?? 0), 0),
    );
    const aovChange = grossChange;

    return {
      revenueOverTimeData,
      revenueByCategoryData,
      breakdown,
      kpis: {
        totalGross,
        totalNet,
        totalCommission,
        totalRefunds,
        totalTransactions,
        avgOrderValue,
        grossChange,
        netChange,
        commissionChange,
        refundsChange,
        completedChange,
        aovChange,
      },
    };
  }, [transactions, summary, dateRange]);

  const filteredBreakdown = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return prepared.breakdown.filter((row) => {
      const statusOk = statusFilter === "all" || (statusFilter === "completed" ? row.completedBookings > 0 : row.refunds > 0);
      const searchOk =
        needle.length === 0 ||
        row.category.toLowerCase().includes(needle) ||
        row.date.toLowerCase().includes(needle);
      return statusOk && searchOk;
    });
  }, [prepared.breakdown, searchTerm, statusFilter]);

  const openDrawer = (item: BreakdownRow) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Revenue</h1>
          <p className="text-[14px] text-gray-700 mt-1">
            Track gross revenue, net revenue, refunds, and commission over time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-[14px] font-medium" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-[#00BF63] hover:bg-[#00A356] text-[14px] font-medium" disabled>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load revenue</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-800">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="text-[14px] text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-800">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-[14px] text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Gross Revenue" value={formatPeso(prepared.kpis.totalGross)} change={prepared.kpis.grossChange} icon={DollarSign} />
        <KPICard label="Net Revenue" value={formatPeso(prepared.kpis.totalNet)} change={prepared.kpis.netChange} icon={TrendingUp} />
        <KPICard label="Total Commission" value={formatPeso(prepared.kpis.totalCommission)} change={prepared.kpis.commissionChange} icon={DollarSign} />
        <KPICard label="Refund Amount" value={formatPeso(prepared.kpis.totalRefunds)} change={prepared.kpis.refundsChange} icon={TrendingUp} />
        <KPICard label="Completed Bookings" value={prepared.kpis.totalTransactions.toLocaleString()} change={prepared.kpis.completedChange} icon={CheckCircle} />
        <KPICard label="Average Order Value" value={formatPeso(prepared.kpis.avgOrderValue)} change={prepared.kpis.aovChange} icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] font-semibold text-gray-900">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepared.revenueOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="date" stroke="#374151" style={{ fontSize: 12 }} />
                <YAxis stroke="#374151" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `₱${Math.round(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#00BF63" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] font-semibold text-gray-900">Revenue by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepared.revenueByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="category" stroke="#374151" angle={-35} textAnchor="end" height={90} style={{ fontSize: 11 }} />
                <YAxis stroke="#374151" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `₱${Math.round(value).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#00BF63" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-[16px] font-semibold text-gray-900">Revenue Breakdown</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search provider or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-[14px] text-gray-900"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-[12px] font-semibold text-gray-800">Date</TableHead>
                  <TableHead className="text-[12px] font-semibold text-gray-800">Provider</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Completed</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Gross Revenue</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Discounts</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Refunds</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Net Revenue</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Commission</TableHead>
                  <TableHead className="text-[12px] font-semibold text-right text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-700">
                      Loading revenue data...
                    </TableCell>
                  </TableRow>
                ) : filteredBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-700">
                      No revenue rows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBreakdown.map((row) => (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      <TableCell className="text-[14px] text-gray-900">{row.date}</TableCell>
                      <TableCell className="text-[14px] text-gray-900">{row.category}</TableCell>
                      <TableCell className="text-[14px] text-right text-gray-900">{row.completedBookings}</TableCell>
                      <TableCell className="text-[14px] text-right text-gray-900">₱{row.gross.toLocaleString()}</TableCell>
                      <TableCell className="text-[14px] text-right text-amber-700">-₱{row.discounts.toLocaleString()}</TableCell>
                      <TableCell className="text-[14px] text-right text-red-700">-₱{row.refunds.toLocaleString()}</TableCell>
                      <TableCell className="text-[14px] text-right font-semibold text-gray-900">₱{row.net.toLocaleString()}</TableCell>
                      <TableCell className="text-[14px] text-right text-emerald-700 font-semibold">₱{row.commission.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDrawer(row)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden space-y-3">
            {filteredBreakdown.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">{row.category}</p>
                      <p className="text-[12px] text-gray-700">{row.date}</p>
                    </div>
                    <Badge className="bg-[#00BF63] text-white">{row.completedBookings} completed</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div>
                      <span className="text-gray-700">Gross:</span>
                      <span className="ml-1 font-medium text-gray-900">₱{row.gross.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Net:</span>
                      <span className="ml-1 font-medium text-gray-900">₱{row.net.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Refunds:</span>
                      <span className="ml-1 text-red-700">-₱{row.refunds.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Commission:</span>
                      <span className="ml-1 text-emerald-700 font-medium">₱{row.commission.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-[14px] font-medium" onClick={() => openDrawer(row)}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-[18px] font-semibold text-gray-900">Revenue Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-[13px] font-semibold text-gray-700">Provider</p>
                  <p className="text-[15px] text-gray-900 mt-1">{selectedItem.category}</p>
                </div>
                <div className="space-y-3">
                  {[
                    ["Date", selectedItem.date],
                    ["Completed bookings", String(selectedItem.completedBookings)],
                    ["Gross revenue", formatPeso(selectedItem.gross)],
                    ["Discounts", `-${formatPeso(selectedItem.discounts)}`],
                    ["Refunds", `-${formatPeso(selectedItem.refunds)}`],
                    ["Net revenue", formatPeso(selectedItem.net)],
                    ["Commission", formatPeso(selectedItem.commission)],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-[13px] font-semibold text-gray-700">{key}</span>
                      <span className="text-[14px] text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

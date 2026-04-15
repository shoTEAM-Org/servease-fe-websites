import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  AlertCircle,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";

type EarningsPaymentRow = {
  id?: string;
  provider_id?: string | null;
  provider_name?: string;
  provider_email?: string;
  amount?: number;
  commission_amount?: number;
  provider_earnings?: number;
  created_at?: string | null;
};

type EarningsResponse = {
  payments: EarningsPaymentRow[];
  total: number;
  page: number;
  limit: number;
};

type ProviderEarningsRow = {
  providerId: string;
  providerName: string;
  providerEmail: string;
  totalEarnings: number;
  totalCommission: number;
  paidEarnings: number;
  totalBookings: number;
  lastPayoutDate: string | null;
};

const LIMIT = 100;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function ProviderEarnings() {
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<EarningsResponse>(
          `/api/admin/v1/finance/earnings?page=1&limit=${LIMIT}`
        );
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load provider earnings.");
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
  }, []);

  const providerRows = useMemo(() => {
    const grouped = new Map<string, ProviderEarningsRow>();

    for (const payment of data?.payments ?? []) {
      const providerId = asString(payment.provider_id, "unknown");
      const amount = asNumber(payment.amount, 0);
      const commissionAmount = asNumber(payment.commission_amount, Math.round(amount * 0.1));
      const providerEarnings = asNumber(payment.provider_earnings, Math.max(0, amount - commissionAmount));
      const createdAt = asString(payment.created_at);

      const current = grouped.get(providerId) ?? {
        providerId,
        providerName: asString(payment.provider_name, "Unknown Provider"),
        providerEmail: asString(payment.provider_email, "—"),
        totalEarnings: 0,
        totalCommission: 0,
        paidEarnings: 0,
        totalBookings: 0,
        lastPayoutDate: null,
      };

      current.totalEarnings += amount;
      current.totalCommission += commissionAmount;
      current.paidEarnings += providerEarnings;
      current.totalBookings += 1;
      if (createdAt && (!current.lastPayoutDate || createdAt > current.lastPayoutDate)) {
        current.lastPayoutDate = createdAt;
      }

      grouped.set(providerId, current);
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [data]);

  const filteredProviders = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return providerRows.filter((row) => {
      return (
        row.providerName.toLowerCase().includes(needle) ||
        row.providerId.toLowerCase().includes(needle) ||
        row.providerEmail.toLowerCase().includes(needle)
      );
    });
  }, [providerRows, searchTerm]);

  const stats = useMemo(() => {
    const totalEarnings = filteredProviders.reduce((sum, row) => sum + row.totalEarnings, 0);
    const totalCommission = filteredProviders.reduce((sum, row) => sum + row.totalCommission, 0);
    const totalPaid = filteredProviders.reduce((sum, row) => sum + row.paidEarnings, 0);
    const totalBookings = filteredProviders.reduce((sum, row) => sum + row.totalBookings, 0);

    return {
      totalEarnings,
      totalCommission,
      totalPaid,
      totalBookings,
    };
  }, [filteredProviders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Earnings</h1>
        <p className="text-gray-500 mt-1">Monitor earnings and settlements for all service providers</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load provider earnings</p>
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
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₱{(stats.totalEarnings / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-400 mt-1">All providers</p>
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
                <p className="text-sm text-gray-500">Platform Commission</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalCommission / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-400 mt-1">From completed payments</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid to Providers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₱{(stats.totalPaid / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-400 mt-1">Net provider earnings</p>
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
                <p className="text-sm text-gray-500">Completed Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                <p className="text-xs text-gray-400 mt-1">Completed payments</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by provider name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px] text-gray-700 font-semibold">Provider ID</TableHead>
                  <TableHead className="min-w-[240px] text-gray-700 font-semibold">Provider</TableHead>
                  <TableHead className="min-w-[130px] text-gray-700 font-semibold">Total Earnings</TableHead>
                  <TableHead className="min-w-[140px] text-gray-700 font-semibold">Commission</TableHead>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Provider Earnings</TableHead>
                  <TableHead className="min-w-[140px] text-gray-700 font-semibold">Completed Bookings</TableHead>
                  <TableHead className="min-w-[170px] text-gray-700 font-semibold">Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading provider earnings...
                    </TableCell>
                  </TableRow>
                ) : filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((row) => (
                    <TableRow key={row.providerId}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">{row.providerId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{row.providerName}</p>
                          <p className="text-xs text-gray-600">{row.providerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₱{row.totalEarnings.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">₱{row.totalCommission.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[#16A34A]">₱{row.paidEarnings.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {row.totalBookings} bookings
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.lastPayoutDate ? (
                          <span className="text-sm text-gray-600">
                            {new Date(row.lastPayoutDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No payment yet</span>
                        )}
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
  );
}

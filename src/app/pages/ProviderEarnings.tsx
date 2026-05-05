import { useEffect, useState, useMemo } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  CreditCard,
  Eye,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import type { ProviderEarning } from "../../types";

export function ProviderEarnings() {
  const { providerEarnings, isLoadingProviderEarnings, fetchProviderEarnings } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<ProviderEarning | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProviderEarnings();
  }, [fetchProviderEarnings]);

  const providerEarningsData = useMemo(() => {
    return providerEarnings.map((earnings) => ({
      earnings,
      category: earnings.categoryName || "N/A",
      completedBookingsCount: earnings.completedBookings || earnings.totalBookings,
    }));
  }, [providerEarnings]);

  const categoryOptions = useMemo(() => {
    const categories = providerEarningsData
      .map((item) => ({
        id: item.earnings.categoryId || item.category,
        name: item.category,
      }))
      .filter((category) => category.id && category.name && category.name !== "N/A");

    return Array.from(new Map(categories.map((category) => [category.id, category])).values());
  }, [providerEarningsData]);

  const filteredProviders = useMemo(() => {
    return providerEarningsData.filter((item) => {
      const matchesSearch =
        (item.earnings.providerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.earnings.providerId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.earnings.categoryId === categoryFilter || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [providerEarningsData, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const totalEarnings = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.totalEarnings,
      0
    );
    const totalPending = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.pendingEarnings,
      0
    );
    const totalPaid = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.paidEarnings,
      0
    );
    const totalBookings = providerEarningsData.reduce(
      (sum, item) => sum + item.earnings.totalBookings,
      0
    );

    return {
      totalEarnings,
      totalPending,
      totalPaid,
      totalBookings,
    };
  }, [providerEarningsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Earnings</h1>
        <p className="text-gray-500 mt-1">
          Monitor earnings and settlements for all service providers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalEarnings / 1000).toFixed(1)}K
                </p>
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
                <p className="text-sm text-gray-500">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalPending / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-400 mt-1">Not yet paid</p>
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
                <p className="text-sm text-gray-500">Paid Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₱{(stats.totalPaid / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-400 mt-1">Already settled</p>
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
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                <p className="text-xs text-gray-400 mt-1">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by provider name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              disabled={categoryOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Pending Earnings</TableHead>
                  <TableHead>Paid Earnings</TableHead>
                  <TableHead>Completed Bookings</TableHead>
                  <TableHead>Last Payout</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProviderEarnings ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading provider earnings...
                    </TableCell>
                  </TableRow>
                ) : filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map(({ earnings, category, completedBookingsCount }) => (
                    <TableRow key={earnings.providerId}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {earnings.providerId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{earnings.providerName || "N/A"}</p>
                          <p className="text-xs text-gray-500">{earnings.providerEmail || earnings.providerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">
                          ₱{earnings.totalEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-yellow-600">
                          ₱{earnings.pendingEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[#16A34A]">
                          ₱{earnings.paidEarnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {completedBookingsCount} bookings
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {earnings.lastPayoutDate ? (
                          <span className="text-sm text-gray-600">
                            {new Date(earnings.lastPayoutDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No payout yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(earnings);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provider Earnings Details</DialogTitle>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm text-gray-500">Provider Name</p>
                <p className="font-semibold text-gray-900">
                  {selectedProvider.providerName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Provider Email</p>
                <p className="font-medium text-gray-900">
                  {selectedProvider.providerEmail || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="font-semibold text-gray-900">
                    ₱{selectedProvider.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Earnings</p>
                  <p className="font-semibold text-yellow-600">
                    ₱{selectedProvider.pendingEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Earnings</p>
                  <p className="font-semibold text-[#16A34A]">
                    ₱{selectedProvider.paidEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="font-semibold text-gray-900">
                    {selectedProvider.totalBookings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Bookings</p>
                  <p className="font-semibold text-gray-900">
                    {selectedProvider.completedBookings.toLocaleString()}
                  </p>
                </div>
                {selectedProvider.totalCommission != null && (
                  <div>
                    <p className="text-sm text-gray-500">Commission</p>
                    <p className="font-semibold text-gray-900">
                      ₱{selectedProvider.totalCommission.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Payout</p>
                <p className="font-medium text-gray-900">
                  {selectedProvider.lastPayoutDate
                    ? new Date(selectedProvider.lastPayoutDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No payout yet"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedProvider(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

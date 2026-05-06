import { useState, useEffect } from "react";
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
  DollarSign,
  Edit2,
  Save,
  X,
  TrendingUp,
  Percent,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useApi, apiCall } from "../../hooks/useApi";
import { Skeleton } from "../components/ui/skeleton";

interface CommissionRule {
  id: string;
  category: string;
  currentRate: number;
  previousRate: number;
  status: "active" | "pending" | "inactive";
  lastUpdated: string;
  monthlyRevenue: number;
  monthlyCommission: number;
}

export function CommissionRules() {
  const { data, isLoading, error } = useApi<any>("/api/admin/v1/commission-rules");
  const [localRules, setLocalRules] = useState<CommissionRule[] | null>(null);
  const apiStats = data?.stats || null;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    if (data?.rules) setLocalRules(data.rules);
  }, [data]);

  const rules: CommissionRule[] = localRules || data?.rules || [];

  const handleEdit = (rule: CommissionRule) => {
    setEditingId(rule.id);
    setEditValue(rule.currentRate.toString());
  };

  const handleSave = async (ruleId: string) => {
    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    // Optimistic update — apply immediately, no reload, no toast
    setLocalRules((prev) =>
      (prev || []).map((r) =>
        r.id === ruleId
          ? { ...r, previousRate: r.currentRate, currentRate: newRate, lastUpdated: new Date().toISOString().split("T")[0] }
          : r
      )
    );
    setEditingId(null);
    setEditValue("");

    try {
      await apiCall(`/api/admin/v1/commission-rules/${ruleId}`, {
        method: "PUT",
        body: JSON.stringify({ currentRate: newRate }),
      });
    } catch (err: any) {
      // Revert on failure
      if (data?.rules) setLocalRules(data.rules);
      toast.error("Failed to update commission rule", { description: err.message });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Active
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        Inactive
      </Badge>
    );
  };

  const totalMonthlyRevenue = rules.reduce((sum: number, rule: CommissionRule) => sum + rule.monthlyRevenue, 0);
  const totalMonthlyCommission = rules.reduce((sum: number, rule: CommissionRule) => sum + rule.monthlyCommission, 0);

  // Stats array dynamically built from API data
  const stats = [
    {
      title: "Average Commission Rate",
      value: apiStats ? `${apiStats.averageRate}%` : "0%",
      change: "vs last month",
      icon: Percent,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Monthly Commission",
      value: apiStats ? `₱${(apiStats.totalCommission / 1000000).toFixed(2)}M` : "₱0",
      change: "vs last month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Categories",
      value: apiStats ? apiStats.activeCategories.toString() : "0",
      change: "All categories operational",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Changes",
      value: apiStats ? apiStats.pendingChanges.toString() : "0",
      change: "Rules waiting update",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Rules</h1>
          <p className="text-gray-500 mt-1">Configure and manage commission rates for each service category</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-700 font-medium">Failed to load commission rules API</p>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-red-500 mt-2">Actions are disabled until the API is available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commission Rules</h1>
        <p className="text-gray-500 mt-1">
          Configure and manage commission rates for each service category
        </p>
      </div>

      {/* Stats */}
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

      {/* Commission Rules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Category Commission Rates</CardTitle>
            <Badge variant="outline" className="text-sm">
              {rules.length} Categories
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Rate</TableHead>
                  <TableHead>Previous Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Monthly Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <span className="font-medium text-gray-900">{rule.category}</span>
                    </TableCell>
                    <TableCell>
                      {editingId === rule.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600 text-sm">
                            {rule.currentRate}%
                          </span>
                          {rule.currentRate !== rule.previousRate && (
                            <Badge variant="outline" className="text-xs">
                              Updated
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{rule.previousRate}%</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(rule.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{rule.lastUpdated}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        ₱{rule.monthlyRevenue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ₱{rule.monthlyCommission.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === rule.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(rule.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rule)}
                          title="Edit Commission Rate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{totalMonthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Monthly Commission</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{totalMonthlyCommission.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Important Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                Changes to commission rates will take effect immediately for new bookings.
                Existing bookings will maintain their original commission rate. Please ensure
                all service providers are notified of rate changes in accordance with your
                service agreements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Search, Star, TrendingUp, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useData } from "../../contexts/DataContext";
import type { ProviderStatus } from "../../types";

export function ServiceProviders() {
  const { serviceProviders, getCategoryById } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProviders = useMemo(() => {
    return serviceProviders.filter((provider) => {
      const category = getCategoryById(provider.categoryId);
      const matchesSearch =
        provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || provider.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || provider.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [serviceProviders, searchTerm, categoryFilter, statusFilter, getCategoryById]);

  const stats = useMemo(() => {
    const avgRating = serviceProviders.reduce((sum, p) => sum + p.rating, 0) / serviceProviders.length;
    const avgCompletionRate = serviceProviders.reduce((sum, p) => sum + p.completionRate, 0) / serviceProviders.length;
    const totalBookings = serviceProviders.reduce((sum, p) => sum + p.totalBookings, 0);

    return [
      {
        title: "Total Service Providers",
        value: serviceProviders.length.toString(),
        change: `${serviceProviders.filter((p) => p.status === "Active").length} active`,
        icon: Users,
        color: "text-[#16A34A]",
        bgColor: "bg-[#DCFCE7]",
      },
      {
        title: "Average Rating",
        value: avgRating.toFixed(2),
        change: "Platform average",
        icon: Star,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      {
        title: "Avg Completion Rate",
        value: `${avgCompletionRate.toFixed(1)}%`,
        change: "Good performance",
        icon: CheckCircle,
        color: "text-[#16A34A]",
        bgColor: "bg-[#DCFCE7]",
      },
      {
        title: "Total Bookings",
        value: totalBookings.toString(),
        change: "All time",
        icon: TrendingUp,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
    ];
  }, [serviceProviders]);

  const getStatusBadge = (status: ProviderStatus) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
        <p className="text-gray-500 mt-1">
          Manage all service providers on the platform
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

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Service Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Home Maintenance & Repair">Home Maintenance</SelectItem>
                <SelectItem value="Beauty, Wellness & Personal Care">Beauty & Wellness</SelectItem>
                <SelectItem value="Domestic & Cleaning Services">Cleaning Services</SelectItem>
                <SelectItem value="Automotive & Tech Support">Auto & Tech</SelectItem>
                <SelectItem value="Pet Services">Pet Services</SelectItem>
                <SelectItem value="Events & Entertainment">Events</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
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
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No service providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {provider.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {provider.businessName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {getCategoryById(provider.categoryId)?.name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {provider.contactPerson}
                          </p>
                          <p className="text-xs text-gray-500">{provider.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{provider.location}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-gray-900">{provider.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {provider.totalBookings}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            provider.completionRate >= 95
                              ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                              : provider.completionRate >= 85
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {provider.completionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(provider.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/service-providers/${provider.id}`)}
                          className="bg-[#16A34A] hover:bg-[#15803D]"
                        >
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
    </div>
  );
}
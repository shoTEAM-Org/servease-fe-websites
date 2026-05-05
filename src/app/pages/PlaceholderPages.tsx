import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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
import { Search, Users, TrendingUp, DollarSign, Package, CheckCircle } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { useEffect, useState } from "react";
import type { Customer } from "../../types";

export function Customers() {
  const {
    customers,
    isLoadingCustomers,
    fetchCustomers,
    fetchCustomerDetails,
    updateCustomerStatus,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: "Total Customers",
      value: customers.length.toString(),
      change: `${customers.filter((c) => c.status === "Active").length} active`,
      icon: Users,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "Total Bookings",
      value: customers.reduce((sum, c) => sum + c.totalBookings, 0).toString(),
      change: "All time",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Spent",
      value: `₱${(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000).toFixed(1)}K`,
      change: "Platform revenue",
      icon: DollarSign,
      color: "text-[#16A34A]",
      bgColor: "bg-[#DCFCE7]",
    },
    {
      title: "Avg. Bookings per Customer",
      value: customers.length
        ? (customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length).toFixed(1)
        : "0.0",
      change: "Engagement rate",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
    const details = await fetchCustomerDetails(customer.id);
    if (details) {
      setSelectedCustomer(details);
    }
  };

  const handleStatusChange = async (customer: Customer, status: Customer["status"]) => {
    const result = await updateCustomerStatus(customer.id, status);
    if (result.success) {
      alert(`Customer status updated to ${status}.`);
    }
  };

  const getStatusBadgeClass = (status: Customer["status"]) => {
    if (status === "Active") {
      return "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]";
    }
    if (status === "Suspended") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">
          Manage and monitor all customers on the platform
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

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCustomers ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-[#16A34A]">
                          {customer.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.phone}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{customer.location}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{customer.totalBookings}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-[#16A34A]">
                          ₱{customer.totalSpent.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(customer.memberSince).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(customer.status)}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                            View
                          </Button>
                          <Select
                            value={customer.status}
                            onValueChange={(value) => handleStatusChange(customer, value as Customer["status"])}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{selectedCustomer.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{selectedCustomer.location || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bookings</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.totalBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="font-medium text-gray-900">₱{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusBadgeClass(selectedCustomer.status)}>
                  {selectedCustomer.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Coming-soon placeholder helper ──────────────────────────── */
function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
          <p className="text-gray-400 text-sm max-w-sm">
            This section is under development and will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function Support() {
  return (
    <ComingSoon
      title="Support"
      description="Manage customer and provider support tickets"
    />
  );
}

export function Broadcasts() {
  return (
    <ComingSoon
      title="Broadcasts"
      description="Send announcements and push notifications to users and providers"
    />
  );
}

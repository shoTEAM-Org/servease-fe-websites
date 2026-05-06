import { useState } from "react";
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
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { useApi } from "../../../hooks/useApi";

function KPICard({ label, value, change, icon: Icon, changeType }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-gray-500">{label}</p>
            <p className="text-[22px] font-semibold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${changeType === "up" ? "text-green-600" : "text-red-600"}`}>
                {changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingAnalytics() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use the API hook for Booking Analytics
  const { data, isLoading, error } = useApi<any>(
    `/api/admin/v1/reports/booking-analytics?dateRange=${dateRange}&category=${categoryFilter}&area=${serviceAreaFilter}&status=${statusFilter}`
  );

  const handleExportCSV = () => {
    alert("✅ Exporting Booking Analytics data to CSV...");
  };

  const handleExportPDF = () => {
    alert("✅ Exporting Booking Analytics data to PDF...");
  };

  const openDrawer = (item: any) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  // Fallback to empty data structure if no data is provided by the backend
  const stats = data?.stats || {};
  const bookingsOverTimeData = data?.bookingsOverTime || [];
  const bookingStatusData = data?.bookingStatusData || [];
  const bookingsListData = data?.bookingsList || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Booking Analytics</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Understand booking volume, completion rate, cancellations, and trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="text-[14px] font-medium">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} className="bg-[#00BF63] hover:bg-[#00A356] text-[14px] font-medium">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="home">Home Maintenance & Repair</SelectItem>
                  <SelectItem value="beauty">Beauty, Wellness & Personal Care</SelectItem>
                  <SelectItem value="cleaning">Domestic & Cleaning Services</SelectItem>
                  <SelectItem value="pet">Pet Services</SelectItem>
                  <SelectItem value="events">Events & Entertainment</SelectItem>
                  <SelectItem value="auto">Automotive & Tech Support</SelectItem>
                  <SelectItem value="education">Education & Professional Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Service Area</Label>
              <Select value={serviceAreaFilter} onValueChange={setServiceAreaFilter}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="manila">Manila</SelectItem>
                  <SelectItem value="quezon-city">Quezon City</SelectItem>
                  <SelectItem value="makati">Makati</SelectItem>
                  <SelectItem value="pasig">Pasig</SelectItem>
                  <SelectItem value="taguig">Taguig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-700 font-medium">Failed to load booking analytics data</p>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[104px] w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[360px] w-full rounded-xl" />
            <Skeleton className="h-[360px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Total Bookings" value={stats.totalBookings || "0"} change={stats.totalBookingsChange} changeType="up" icon={Package} />
            <KPICard label="Completed" value={stats.completed || "0"} change={stats.completedChange} changeType="up" icon={CheckCircle} />
            <KPICard label="Cancelled" value={stats.cancelled || "0"} change={stats.cancelledChange} changeType="down" icon={Package} />
            <KPICard label="Completion Rate" value={stats.completionRate || "0%"} change={stats.completionRateChange} changeType="up" icon={TrendingUp} />
            <KPICard label="Avg Booking Value" value={`₱${stats.avgBookingValue || "0"}`} change={stats.avgBookingValueChange} changeType="up" icon={DollarSign} />
            <KPICard label="Avg Lead Time" value={stats.avgLeadTime || "0 days"} change={stats.avgLeadTimeChange} changeType="down" icon={Clock} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Bookings Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsOverTimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bookingsOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#00BF63" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available for this period.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold">Booking Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || "#ccc"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available for this period.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-[16px] font-semibold">Bookings List</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-[14px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bookingsListData.length > 0 ? (
                <>
                  {/* Desktop/Tablet Table */}
                  <div className="hidden sm:block border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[12px] font-semibold">Booking ID</TableHead>
                          <TableHead className="text-[12px] font-semibold">Scheduled Date/Time</TableHead>
                          <TableHead className="text-[12px] font-semibold">Customer</TableHead>
                          <TableHead className="text-[12px] font-semibold">Provider</TableHead>
                          <TableHead className="text-[12px] font-semibold">Category</TableHead>
                          <TableHead className="text-[12px] font-semibold">Service</TableHead>
                          <TableHead className="text-[12px] font-semibold">Status</TableHead>
                          <TableHead className="text-[12px] font-semibold text-right">Total Amount</TableHead>
                          <TableHead className="text-[12px] font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingsListData.map((booking: any) => (
                          <TableRow key={booking.id} className="hover:bg-gray-50">
                            <TableCell className="text-[14px] font-medium">{booking.id}</TableCell>
                            <TableCell className="text-[14px]">
                              <div>{booking.scheduledDate}</div>
                              <div className="text-gray-500 text-[12px]">{booking.scheduledTime}</div>
                            </TableCell>
                            <TableCell className="text-[14px]">{booking.customer}</TableCell>
                            <TableCell className="text-[14px]">{booking.provider}</TableCell>
                            <TableCell className="text-[14px]">{booking.category}</TableCell>
                            <TableCell className="text-[14px]">{booking.service}</TableCell>
                            <TableCell>
                              <Badge className={
                                booking.status === "Completed" ? "bg-green-100 text-green-700" :
                                booking.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                                "bg-yellow-100 text-yellow-700"
                              }>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[14px] text-right font-semibold">₱{Number(booking.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openDrawer(booking)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {bookingsListData.map((booking: any) => (
                      <Card key={booking.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[14px] font-semibold">{booking.id}</p>
                              <p className="text-[12px] text-gray-500">{booking.scheduledDate} at {booking.scheduledTime}</p>
                            </div>
                            <Badge className={
                              booking.status === "Completed" ? "bg-green-100 text-green-700" :
                              booking.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-[13px]">
                            <div><span className="text-gray-500">Customer:</span> <span className="ml-1">{booking.customer}</span></div>
                            <div><span className="text-gray-500">Provider:</span> <span className="ml-1">{booking.provider}</span></div>
                            <div><span className="text-gray-500">Service:</span> <span className="ml-1">{booking.service}</span></div>
                            <div><span className="text-gray-500">Amount:</span> <span className="ml-1 font-semibold">₱{Number(booking.amount).toLocaleString()}</span></div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-[14px] font-medium" onClick={() => openDrawer(booking)}>
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No bookings found for the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[18px] font-semibold">Booking Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[13px] font-medium text-gray-500">Timeline</p>
                  <p className="text-[14px] text-gray-900 mt-1">
                    Created → Assigned → In Progress → {selectedItem.status}
                  </p>
                </div>
                <div className="space-y-3">
                  {Object.entries(selectedItem).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center pb-2 border-b">
                      <span className="text-[13px] font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-[14px] text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

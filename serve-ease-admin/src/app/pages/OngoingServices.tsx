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
  AlertTriangle,
  XCircle,
  Search,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type LiveStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type PaymentStatus = "Paid" | "Pending" | "Failed";

type OngoingBooking = {
  id: string;
  booking_id: string;
  customer_id?: string;
  provider_id?: string;
  customer_name?: string;
  provider_name?: string;
  service_title?: string;
  service_description?: string;
  category_id?: string;
  status?: string;
  payment_status?: string;
  scheduled_at?: string;
  created_at?: string;
  amount?: number;
  location?: string;
};

type OngoingServicesResponse = {
  bookings: OngoingBooking[];
};

interface OngoingService {
  id: string;
  bookingId: string;
  customer: string;
  provider: string;
  category: string;
  startTime: string;
  expectedCompletion: string;
  liveStatus: LiveStatus;
  paymentStatus: PaymentStatus;
  location: string;
  amount: number;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toLiveStatus(status: string): LiveStatus {
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "pending") return "Scheduled";
  if (s === "in_progress" || s === "in progress") return "In Progress";
  if (s === "completed") return "Completed";
  return "Cancelled";
}

function toPaymentStatus(status: string): PaymentStatus {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "Paid";
  if (s === "failed") return "Failed";
  return "Pending";
}

function addHours(iso: string, hours = 2): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function mapBookingToService(raw: OngoingBooking): OngoingService {
  const scheduled = asString(raw.scheduled_at || raw.created_at);
  return {
    id: asString(raw.id),
    bookingId: asString(raw.booking_id, asString(raw.id)),
    customer: asString(raw.customer_name, "Unknown Customer"),
    provider: asString(raw.provider_name, "Unknown Provider"),
    category: asString(raw.category_id, "General Services"),
    startTime: scheduled,
    expectedCompletion: addHours(scheduled, 2),
    liveStatus: toLiveStatus(asString(raw.status, "scheduled")),
    paymentStatus: toPaymentStatus(asString(raw.payment_status, "pending")),
    location: asString(raw.location, "Metro Manila"),
    amount: asNumber(raw.amount, 0),
  };
}

export function OngoingServices() {
  const [services, setServices] = useState<OngoingService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<OngoingService | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<OngoingServicesResponse>("/api/admin/v1/operations/ongoing");
        if (!cancelled) {
          const raw = Array.isArray((result as { bookings?: unknown[] }).bookings)
            ? ((result as { bookings: unknown[] }).bookings as OngoingBooking[])
            : [];
          setServices(raw.map((booking) => mapBookingToService(booking)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load ongoing services.");
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
  }, [refreshKey]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || service.liveStatus === statusFilter;
    const matchesLocation = locationFilter === "all" || service.location.includes(locationFilter);

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  const activeBookings = services.filter((s) => s.liveStatus === "Scheduled" || s.liveStatus === "In Progress").length;
  const inProgress = services.filter((s) => s.liveStatus === "In Progress").length;
  const delayedServices = services.filter((s) => {
    if (s.liveStatus !== "In Progress") return false;
    const expected = new Date(s.expectedCompletion);
    const now = new Date();
    return now > expected;
  }).length;
  const completedToday = services.filter((s) => s.liveStatus === "Completed").length;

  const stats = [
    {
      title: "Active Bookings",
      value: activeBookings.toString(),
      change: "Scheduled + In Progress",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Progress",
      value: inProgress.toString(),
      change: "Currently being served",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Delayed Services",
      value: delayedServices.toString(),
      change: "Past expected time",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Completed Today",
      value: completedToday.toString(),
      change: "Successfully finished",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category))).sort(),
    [services]
  );
  const locations = useMemo(
    () => Array.from(new Set(services.map((s) => s.location))).sort(),
    [services]
  );

  const getStatusBadge = (status: LiveStatus) => {
    switch (status) {
      case "Scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CreditCard className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const handleForceCancel = (service: OngoingService) => {
    setSelectedService(service);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleEscalateDispute = (service: OngoingService) => {
    setSelectedService(service);
    setEscalationReason("");
    setEscalateModalOpen(true);
  };

  const handleContactProvider = (service: OngoingService) => {
    setSelectedService(service);
    setContactMessage("");
    setContactModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedService || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/operations/bookings/${selectedService.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      toast.success("Booking cancelled successfully.");
      setCancelModalOpen(false);
      setSelectedService(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEscalate = async () => {
    if (!selectedService || !escalationReason.trim()) {
      toast.error("Please provide an escalation reason.");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(
        `/api/admin/v1/operations/bookings/${selectedService.id}/disputes`,
        {
          method: "POST",
          body: JSON.stringify({ reason: escalationReason.trim() }),
        }
      );
      toast.success("Case escalated to disputes.");
      setEscalateModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to escalate dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (!selectedService || !contactMessage.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    setContactModalOpen(false);
    setSelectedService(null);
    toast.success("Message logged.");
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ongoing Services</h1>
        <p className="text-gray-500 mt-1">Monitor active service bookings in real-time</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load ongoing services</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

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

      <Card>
        <CardHeader>
          <CardTitle>Active Service Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Booking ID, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200">
            <Table className="min-w-[1280px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Booking ID</TableHead>
                  <TableHead className="min-w-[160px] text-gray-700 font-semibold">Customer</TableHead>
                  <TableHead className="min-w-[190px] text-gray-700 font-semibold">Service Provider</TableHead>
                  <TableHead className="min-w-[200px] text-gray-700 font-semibold">Category</TableHead>
                  <TableHead className="min-w-[110px] text-gray-700 font-semibold">Start Time</TableHead>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">Expected Completion</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Live Status</TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">Payment Status</TableHead>
                  <TableHead className="min-w-[140px] text-gray-700 font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading services...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-blue-700">{service.bookingId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{service.customer}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-800">{service.provider}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-800 whitespace-normal">{service.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{formatTime(service.startTime)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{formatTime(service.expectedCompletion)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(service.liveStatus)}</TableCell>
                      <TableCell>{getPaymentBadge(service.paymentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactProvider(service)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Select>
                            <SelectTrigger className="w-[100px] h-9">
                              <SelectValue placeholder="Actions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="cancel"
                                onSelect={() => handleForceCancel(service)}
                              >
                                Force Cancel
                              </SelectItem>
                              <SelectItem
                                value="escalate"
                                onSelect={() => handleEscalateDispute(service)}
                              >
                                Escalate to Dispute
                              </SelectItem>
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

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force Cancel Booking</DialogTitle>
            <DialogDescription>
              This action will cancel the booking. Please provide a reason.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking ID:</span>
                    <span className="font-mono font-semibold">{selectedService.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-semibold">{selectedService.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="font-semibold">{selectedService.provider}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Cancellation Reason</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleConfirmCancel()} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              <XCircle className="w-4 h-4 mr-2" />
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={escalateModalOpen} onOpenChange={setEscalateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Dispute</DialogTitle>
            <DialogDescription>This will create a dispute case for admin review.</DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking ID:</span>
                    <span className="font-mono font-semibold">{selectedService.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-semibold">{selectedService.customer}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Escalation Reason</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  placeholder="Enter reason for escalation..."
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleConfirmEscalate()} className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Escalate Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Service Provider</DialogTitle>
            <DialogDescription>Send an internal message to the service provider.</DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="font-semibold">{selectedService.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking ID:</span>
                    <span className="font-mono font-semibold">{selectedService.bookingId}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Message</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                  placeholder="Enter your message..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import type { Dispute, DisputeStatus } from "../../types";

export function DisputesResolutions() {
  const { disputes, isLoadingDisputes, fetchDisputes, getCustomerById, getProviderById, updateDisputeStatus } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    void fetchDisputes();
  }, [fetchDisputes]);

  const getDisputeCustomerName = (dispute: Dispute) =>
    dispute.customerName || getCustomerById(dispute.customerId)?.name || "N/A";

  const getDisputeProviderName = (dispute: Dispute) =>
    dispute.providerName || getProviderById(dispute.providerId)?.businessName || "N/A";

  const filteredDisputes = useMemo(() => {
    return disputes.filter((dispute) => {
      const matchesSearch =
        dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDisputeCustomerName(dispute).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDisputeProviderName(dispute).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        dispute.status === statusFilter ||
        (statusFilter === "Investigating" && dispute.status === "Under Review");
      const matchesPriority = priorityFilter === "all" || dispute.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [disputes, searchTerm, statusFilter, priorityFilter, getCustomerById, getProviderById]);

  const stats = useMemo(() => {
    return {
      total: disputes.length,
      open: disputes.filter((d) => d.status === "Open").length,
      investigating: disputes.filter((d) => d.status === "Investigating" || d.status === "Under Review").length,
      resolved: disputes.filter((d) => d.status === "Resolved").length,
    };
  }, [disputes]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Open
          </Badge>
        );
      case "Investigating":
      case "Under Review":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Investigating
          </Badge>
        );
      case "Resolved":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case "Closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>;
      case "Low":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleUpdateDisputeStatus = async (status: DisputeStatus) => {
    if (!selectedDispute) {
      return;
    }

    setIsUpdatingStatus(true);
    const result = await updateDisputeStatus(selectedDispute.id, status);
    if (result.success) {
      setSelectedDispute((prev) =>
        prev
          ? {
              ...prev,
              status,
              resolvedAt: status === "Resolved" ? new Date().toISOString() : prev.resolvedAt,
            }
          : prev
      );
    }
    setIsUpdatingStatus(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500 mt-1">
          Manage and resolve customer disputes and service issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
                <p className="text-xs text-gray-400 mt-1">Needs attention</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Investigating</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.investigating}</p>
                <p className="text-xs text-gray-400 mt-1">Being processed</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully closed</p>
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
                <p className="text-sm text-gray-500">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">In disputes</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, customer, provider..."
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
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Investigating">Investigating</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Filed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDisputes ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading disputes...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No disputes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute) => {
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <span className="font-mono font-semibold text-[#16A34A]">
                            {dispute.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-gray-900">
                            {getDisputeCustomerName(dispute)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {getDisputeProviderName(dispute)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{dispute.reason}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            ₱{dispute.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(dispute.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                        <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setSelectedDispute(dispute)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedDispute !== null} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              {selectedDispute?.id} {selectedDispute?.bookingId ? `for booking ${selectedDispute.bookingId}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{getDisputeCustomerName(selectedDispute)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Provider</p>
                  <p className="font-medium text-gray-900">{getDisputeProviderName(selectedDispute)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium text-gray-900">₱{selectedDispute.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Filed</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDispute.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedDispute.status)}
                  {getPriorityBadge(selectedDispute.priority)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Reason</p>
                  <p className="text-sm text-gray-600">{selectedDispute.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-sm text-gray-600">{selectedDispute.description || "No description provided."}</p>
                </div>
                {selectedDispute.resolution && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Resolution</p>
                    <p className="text-sm text-gray-600">{selectedDispute.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              disabled={isUpdatingStatus || selectedDispute?.status === "Investigating" || selectedDispute?.status === "Under Review"}
              onClick={() => handleUpdateDisputeStatus("Investigating")}
            >
              {isUpdatingStatus ? "Updating..." : "Mark Under Review"}
            </Button>
            <Button
              className="bg-[#16A34A] hover:bg-[#15803D]"
              disabled={isUpdatingStatus || selectedDispute?.status === "Resolved"}
              onClick={() => handleUpdateDisputeStatus("Resolved")}
            >
              {isUpdatingStatus ? "Updating..." : "Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

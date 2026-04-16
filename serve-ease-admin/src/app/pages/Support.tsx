import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
import { fetchAdminJson } from "../lib/adminApi";

type SupportStatus = "open" | "in_progress" | "resolved" | "closed";
type SupportStatusFilter = "all" | SupportStatus;

type ApiSupportTicket = {
  id?: string;
  user_id?: string;
  subject?: string;
  message?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type SupportTicketsResponse = {
  tickets: ApiSupportTicket[];
  total: number;
  page: number;
  limit: number;
};

type SupportTicketRow = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: SupportStatus;
  createdAt: string;
};

const LIMIT = 20;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStatus(value: unknown): SupportStatus {
  const normalized = asString(value, "open").trim().toLowerCase();
  if (normalized === "in_progress" || normalized === "in progress") return "in_progress";
  if (normalized === "resolved") return "resolved";
  if (normalized === "closed") return "closed";
  return "open";
}

function mapTicket(raw: ApiSupportTicket): SupportTicketRow {
  return {
    id: asString(raw.id, "—"),
    userId: asString(raw.user_id, "—"),
    subject: asString(raw.subject, "No subject"),
    message: asString(raw.message, "—"),
    status: normalizeStatus(raw.status),
    createdAt: asString(raw.created_at),
  };
}

export function Support() {
  const [data, setData] = useState<SupportTicketsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportStatusFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<SupportTicketsResponse>(
          `/api/admin/v1/operations/support?page=${page}&limit=${LIMIT}`,
        );

        if (!cancelled) {
          const tickets = Array.isArray((result as { tickets?: unknown[] }).tickets)
            ? ((result as { tickets: unknown[] }).tickets as ApiSupportTicket[])
            : [];

          setData({
            tickets,
            total: asNumber((result as { total?: unknown }).total, tickets.length),
            page: asNumber((result as { page?: unknown }).page, page),
            limit: asNumber((result as { limit?: unknown }).limit, LIMIT),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load support tickets.");
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

  const tickets = useMemo(() => (data?.tickets ?? []).map((raw) => mapTicket(raw)), [data]);

  const filteredTickets = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(needle) ||
        ticket.userId.toLowerCase().includes(needle) ||
        ticket.subject.toLowerCase().includes(needle) ||
        ticket.message.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, tickets]);

  const stats = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
      closed: tickets.filter((ticket) => ticket.status === "closed").length,
    }),
    [tickets],
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  async function updateTicketStatus(ticketId: string, nextStatus: SupportStatus) {
    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/operations/support/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tickets: prev.tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: nextStatus } : ticket,
          ),
        };
      });
      toast.success(`Support ticket ${ticketId} updated.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getStatusBadge(status: SupportStatus) {
    if (status === "open") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Open
        </Badge>
      );
    }
    if (status === "in_progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (status === "resolved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Resolved
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        <XCircle className="w-3 h-3 mr-1" />
        Closed
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 mt-1">Manage customer and provider support tickets.</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load support tickets</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Closed</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{stats.closed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Ticket Queue</CardTitle>
            <div className="text-sm text-gray-500">
              {filteredTickets.length} of {total} tickets
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ticket, user, or subject..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SupportStatusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                      Loading support tickets...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                      No support tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-medium text-gray-900">{ticket.subject}</TableCell>
                      <TableCell className="max-w-[320px] truncate text-sm text-gray-600">
                        {ticket.message}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">{ticket.userId}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {ticket.status === "open" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() => void updateTicketStatus(ticket.id, "in_progress")}
                            >
                              Start
                            </Button>
                          ) : null}
                          {ticket.status !== "resolved" ? (
                            <Button
                              size="sm"
                              disabled={isSubmitting}
                              onClick={() => void updateTicketStatus(ticket.id, "resolved")}
                            >
                              Resolve
                            </Button>
                          ) : null}
                          {ticket.status !== "closed" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isSubmitting}
                              onClick={() => void updateTicketStatus(ticket.id, "closed")}
                            >
                              Close
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              {total === 0 ? "No tickets" : `Page ${page} of ${totalPages} (${total.toLocaleString()} total)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((value) => value + 1)}
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

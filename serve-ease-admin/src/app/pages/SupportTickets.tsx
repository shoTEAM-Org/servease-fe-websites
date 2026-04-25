"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { LifeBuoy } from "lucide-react";

type SupportTicket = {
  ticket_id: string;
  user_id?: string | null;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority?: string | null;
  created_at?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "http://localhost:5000";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("admin_access_token") ||
    window.localStorage.getItem("access_token") ||
    ""
  );
};

export function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTickets() {
      setIsLoading(true);
      setError("");

      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE}/api/admin/v1/operations/support?page=1&limit=50`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(`Support tickets request failed with ${response.status}`);
        }

        const payload = await response.json();
        const rows = Array.isArray(payload?.tickets)
          ? payload.tickets
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];

        if (mounted) setTickets(rows);
      } catch (loadError) {
        if (mounted) {
          setTickets([]);
          setError(loadError instanceof Error ? loadError.message : "Failed to load support tickets.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadTickets();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 mt-1">Tickets from notification_and_support.support_tickets.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-[#00BF63]" />
            Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Loading support tickets...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.ticket_id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{ticket.message}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>{ticket.priority || "normal"}</TableCell>
                    <TableCell className="font-mono text-xs">{ticket.user_id || "-"}</TableCell>
                    <TableCell>
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

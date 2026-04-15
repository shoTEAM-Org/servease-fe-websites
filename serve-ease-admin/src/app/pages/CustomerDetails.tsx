import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/lib/react-router-compat";
import { ArrowLeft, AlertCircle, CheckCircle, User, Mail, Phone, Calendar, ClipboardList } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type CustomerUser = {
  id: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  status: string;
  created_at: string;
};

type CustomerProfile = {
  user_id?: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  postal_code?: string | null;
};

type CustomerDetailsResponse = {
  user: CustomerUser;
  profile: CustomerProfile | null;
  booking_count: number;
};

function CustomerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40 rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-60 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    </div>
  );
}

function formatAddress(profile: CustomerProfile | null) {
  if (!profile) return "—";
  const parts = [profile.address, profile.city, profile.province, profile.region, profile.postal_code]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<CustomerDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError("Missing customer ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<CustomerDetailsResponse>(`/api/admin/v1/users/customers/${id}`);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load customer details.");
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
  }, [id]);

  async function toggleStatus() {
    if (!data) return;
    const currentStatus = data.user.status.toLowerCase();
    const nextStatus = currentStatus === "active" ? "suspended" : "active";

    try {
      setIsUpdatingStatus(true);
      await fetchAdminJson<{ ok: boolean }>(`/api/admin/v1/users/customers/${data.user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                status: nextStatus,
              },
            }
          : prev
      );
      toast.success("Customer status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) {
    return <CustomerDetailsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/customers")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load customer details</p>
              <p className="mt-1 text-sm">{error ?? "Customer not found."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = data.user.status.toLowerCase() === "active";

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/customers")} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
        <p className="text-gray-500 mt-1">View customer profile and account status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                <p className="font-mono text-sm text-[#16A34A]">{data.user.id}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {isActive ? (
                  <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">{data.user.status}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Full Name</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {data.user.full_name}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {data.user.email}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {data.user.contact_number || "—"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Member Since</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(data.user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-2">Address</p>
              <p className="font-medium text-gray-900">{formatAddress(data.profile)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-2">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#16A34A]" />
                {data.booking_count.toLocaleString()}
              </p>
            </div>

            <Button
              className="w-full"
              variant={isActive ? "destructive" : "outline"}
              disabled={isUpdatingStatus}
              onClick={() => void toggleStatus()}
            >
              {isUpdatingStatus ? "Updating…" : isActive ? "Suspend Customer" : "Activate Customer"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

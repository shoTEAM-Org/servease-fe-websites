import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/lib/react-router-compat";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  Star,
  Briefcase,
  Shield,
  Tag,
  MapPin,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type ProviderUser = {
  id: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  status: string;
  created_at: string;
};

type ProviderProfile = {
  user_id?: string;
  business_name?: string | null;
  service_description?: string | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  trust_score?: number | null;
  verification_status?: string | null;
};

type ProviderService = {
  id: string;
  title: string;
  price: number | null;
  category_id: string | null;
  service_location: string | null;
  created_at: string;
};

type ProviderDetailsResponse = {
  user: ProviderUser;
  profile: ProviderProfile | null;
  booking_count: number;
  services: ProviderService[];
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeService(raw: Partial<ProviderService>): ProviderService {
  return {
    id: asString(raw.id),
    title: asString(raw.title, "Untitled Service"),
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : null,
    category_id: typeof raw.category_id === "string" ? raw.category_id : null,
    service_location: typeof raw.service_location === "string" ? raw.service_location : null,
    created_at: asString(raw.created_at),
  };
}

function normalizeProviderDetails(raw: Partial<ProviderDetailsResponse>): ProviderDetailsResponse {
  const userRaw = (raw.user ?? {}) as Partial<ProviderUser>;
  const profileRaw = raw.profile ? ((raw.profile ?? {}) as Partial<ProviderProfile>) : null;
  const servicesRaw = Array.isArray(raw.services) ? raw.services : [];

  return {
    user: {
      id: asString(userRaw.id),
      full_name: asString(userRaw.full_name, "—"),
      email: asString(userRaw.email, "—"),
      contact_number: typeof userRaw.contact_number === "string" ? userRaw.contact_number : null,
      status: asString(userRaw.status, "inactive"),
      created_at: asString(userRaw.created_at),
    },
    profile: profileRaw
      ? {
          user_id: typeof profileRaw.user_id === "string" ? profileRaw.user_id : undefined,
          business_name:
            typeof profileRaw.business_name === "string" ? profileRaw.business_name : null,
          service_description:
            typeof profileRaw.service_description === "string"
              ? profileRaw.service_description
              : null,
          average_rating: asNumber(profileRaw.average_rating, 0),
          total_reviews: asNumber(profileRaw.total_reviews, 0),
          trust_score: asNumber(profileRaw.trust_score, 0),
          verification_status:
            typeof profileRaw.verification_status === "string"
              ? profileRaw.verification_status
              : null,
        }
      : null,
    booking_count: asNumber(raw.booking_count, 0),
    services: servicesRaw.map((service) => normalizeService((service ?? {}) as Partial<ProviderService>)),
  };
}

function ProviderDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-52 rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

function getVerificationBadge(status?: string | null) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "approved") {
    return (
      <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
        <Shield className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (!status) {
    return <Badge variant="secondary">Not set</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

export function ServiceProviderDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<ProviderDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError("Missing provider ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<ProviderDetailsResponse>(`/api/admin/v1/users/providers/${id}`);
        if (!cancelled) {
          setData(normalizeProviderDetails((result ?? {}) as Partial<ProviderDetailsResponse>));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load provider details.");
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
    const currentStatus = asString(data.user.status).toLowerCase();
    const nextStatus = currentStatus === "active" ? "suspended" : "active";

    try {
      setIsUpdatingStatus(true);
      await fetchAdminJson<{ ok: boolean }>(`/api/admin/v1/users/providers/${data.user.id}/status`, {
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
      toast.success("Provider status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) {
    return <ProviderDetailsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/service-providers")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Service Providers
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load provider details</p>
              <p className="mt-1 text-sm">{error ?? "Provider not found."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, profile, services, booking_count } = data;
  const isActive = asString(user.status).toLowerCase() === "active";

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/service-providers")} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Service Providers
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Details</h1>
        <p className="text-gray-500 mt-1">View provider profile, status, and listed services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-1">Provider ID</p>
                <p className="font-mono text-sm text-[#16A34A]">{user.id}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {isActive ? (
                  <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">{user.status}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Owner Name</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {user.full_name}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Business Name</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  {profile?.business_name || user.full_name}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {user.email}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {user.contact_number || "—"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Member Since</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Verification</p>
                {getVerificationBadge(profile?.verification_status)}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-2">Service Description</p>
              <p className="font-medium text-gray-900">{profile?.service_description || "—"}</p>
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
                {booking_count.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Average Rating</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {Number(profile?.average_rating || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Reviews</span>
                <span className="font-semibold text-gray-900">
                  {Number(profile?.total_reviews || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trust Score</span>
                <span className="font-semibold text-gray-900">
                  {Number(profile?.trust_score || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              variant={isActive ? "destructive" : "outline"}
              disabled={isUpdatingStatus}
              onClick={() => void toggleStatus()}
            >
              {isUpdatingStatus ? "Updating…" : isActive ? "Suspend Provider" : "Activate Provider"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listed Services</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500">No services listed.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="rounded-lg border p-4 space-y-2">
                  <p className="font-semibold text-gray-900">{service.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span>{service.category_id || "Uncategorized"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{service.service_location || "Location not set"}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Price:{" "}
                    <span className="font-semibold text-gray-900">
                      {typeof service.price === "number" ? `PHP ${service.price.toFixed(2)}` : "—"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

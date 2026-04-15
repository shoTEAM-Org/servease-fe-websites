import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@/lib/react-router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  XCircle,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type ApplicationStatus = "pending" | "approved" | "rejected";

type ProviderApplicationDocument = {
  id: string;
  name: string;
  file: string;
  status: string;
  reject_reason?: string | null;
  uploaded_at?: string | null;
  reviewed_at?: string | null;
};

type ProviderApplication = {
  applicationId: string;
  providerId: string;
  businessName: string;
  ownerName: string;
  category: string;
  dateApplied: string;
  location: string;
  status: ApplicationStatus;
  email: string | null;
  contact_number: string | null;
  profile?: {
    service_description?: string | null;
    verification_status?: string | null;
    trust_score?: number | null;
    average_rating?: number | null;
  } | null;
  documents: ProviderApplicationDocument[];
  notes: Array<{ id: number; text: string; author: string; timestamp: string }>;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStatus(value: unknown): ApplicationStatus {
  const status = asString(value).toLowerCase();
  if (status === "approved" || status === "rejected") return status;
  return "pending";
}

function normalizeDocument(raw: Partial<ProviderApplicationDocument>): ProviderApplicationDocument {
  return {
    id: asString(raw.id),
    name: asString(raw.name, "Document"),
    file: asString(raw.file),
    status: asString(raw.status, "pending"),
    reject_reason: typeof raw.reject_reason === "string" ? raw.reject_reason : null,
    uploaded_at: typeof raw.uploaded_at === "string" ? raw.uploaded_at : null,
    reviewed_at: typeof raw.reviewed_at === "string" ? raw.reviewed_at : null,
  };
}

function normalizeApplication(raw: Partial<ProviderApplication>): ProviderApplication {
  const docs = Array.isArray(raw.documents) ? raw.documents : [];
  const notes = Array.isArray(raw.notes) ? raw.notes : [];
  return {
    applicationId: asString(raw.applicationId),
    providerId: asString(raw.providerId),
    businessName: asString(raw.businessName, "Unnamed Business"),
    ownerName: asString(raw.ownerName, "Unknown Owner"),
    category: asString(raw.category, "General Services"),
    dateApplied: asString(raw.dateApplied),
    location: asString(raw.location, "—"),
    status: asStatus(raw.status),
    email: typeof raw.email === "string" ? raw.email : null,
    contact_number: typeof raw.contact_number === "string" ? raw.contact_number : null,
    profile: raw.profile
      ? {
          service_description:
            typeof raw.profile.service_description === "string"
              ? raw.profile.service_description
              : null,
          verification_status:
            typeof raw.profile.verification_status === "string"
              ? raw.profile.verification_status
              : null,
          trust_score: asNumber(raw.profile.trust_score, 0),
          average_rating: asNumber(raw.profile.average_rating, 0),
        }
      : null,
    documents: docs.map((doc) =>
      normalizeDocument((doc ?? {}) as Partial<ProviderApplicationDocument>)
    ),
    notes: notes.map((note, index) => ({
      id: asNumber(note.id, index + 1),
      text: asString(note.text),
      author: asString(note.author, "System"),
      timestamp: asString(note.timestamp),
    })),
  };
}

function getStatusBadge(status: ApplicationStatus) {
  if (status === "approved") {
    return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
  }
  if (status === "rejected") {
    return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
      <Clock className="w-3 h-3 mr-1" />
      Pending Review
    </Badge>
  );
}

function getDocumentBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "approved") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (normalized === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  );
}

export function ProviderApplicationReview() {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();

  const [application, setApplication] = useState<ProviderApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!applicationId) {
        setError("Missing application ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAdminJson<ProviderApplication>(
          `/api/admin/v1/users/provider-applications/${applicationId}`
        );
        if (!cancelled) {
          setApplication(normalizeApplication((result ?? {}) as Partial<ProviderApplication>));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load application.");
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
  }, [applicationId]);

  const pendingDocs = useMemo(
    () =>
      (application?.documents ?? []).filter((doc) => doc.status.toLowerCase() === "pending").length,
    [application]
  );

  async function updateStatus(status: ApplicationStatus) {
    if (!application || isSubmitting) return;
    if (status === "rejected" && !rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(
        `/api/admin/v1/users/provider-applications/${application.applicationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            ...(status === "rejected" ? { reject_reason: rejectReason.trim() } : {}),
          }),
        }
      );

      toast.success(`Application ${status}.`);
      setApplication((prev) => (prev ? { ...prev, status } : prev));
      if (status === "rejected") {
        setRejectReason("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update application status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Loading application...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/provider-applications")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Approval Queue
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load application</p>
              <p className="mt-1 text-sm">{error ?? "Application not found."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/provider-applications")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {getStatusBadge(application.status)}
          <span className="text-sm text-gray-500">{application.applicationId}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
        <p className="text-gray-500 mt-1">Review provider profile and documents before approval.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Business Name</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  {application.businessName}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Owner Name</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {application.ownerName}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {application.email || "—"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {application.contact_number || "—"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Date Applied</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {application.dateApplied
                    ? new Date(application.dateApplied).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-500 mb-2">Category</p>
                <p className="font-medium text-gray-900">{application.category}</p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-2">Service Description</p>
              <p className="text-sm text-gray-800">
                {application.profile?.service_description || "No description provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pending Documents</span>
                <span className="font-semibold text-gray-900">{pendingDocs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Verification</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Shield className="w-4 h-4 text-gray-500" />
                  {application.profile?.verification_status || "pending"}
                </span>
              </div>
            </div>

            <Textarea
              placeholder="Rejection reason (required when rejecting)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => void updateStatus("approved")}
                disabled={isSubmitting}
                className="bg-[#16A34A] hover:bg-[#15803D]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Application
              </Button>
              <Button
                variant="destructive"
                onClick={() => void updateStatus("rejected")}
                disabled={isSubmitting}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {application.documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents submitted.</p>
          ) : (
            application.documents.map((doc) => (
              <div key={doc.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 break-all">{doc.file || "No file path"}</p>
                    {doc.reject_reason ? (
                      <p className="text-xs text-red-600 mt-1">Reason: {doc.reject_reason}</p>
                    ) : null}
                  </div>
                  {getDocumentBadge(doc.status)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

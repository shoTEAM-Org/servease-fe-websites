import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Export applications data for use in detail page
export const applications = [
  {
    applicationId: "APP-2026-0234",
    businessName: "Tutor Excellence Hub",
    ownerName: "Roberto Miguel Cruz",
    category: "Education & Professional Services",
    dateApplied: "2026-03-01",
    location: "Taguig City, Metro Manila",
    status: "pending",
    providerId: "SE-ED-003",
  },
  {
    applicationId: "APP-2026-0235",
    businessName: "Wellness Massage Therapy",
    ownerName: "Carmen Grace Alvarez",
    category: "Beauty Wellness & Personal Care",
    dateApplied: "2026-03-03",
    location: "Manila City, Metro Manila",
    status: "pending",
    providerId: "SE-BW-009",
  },
  {
    applicationId: "APP-2026-0236",
    businessName: "Prime Cleaning Solutions",
    ownerName: "Fernando Jose Santos",
    category: "Domestic & Cleaning Services",
    dateApplied: "2026-03-02",
    location: "Quezon City, Metro Manila",
    status: "pending",
    providerId: "SE-DC-016",
  },
  {
    applicationId: "APP-2026-0237",
    businessName: "AutoCare Express",
    ownerName: "Leonardo David Reyes",
    category: "Automotive & Tech Support",
    dateApplied: "2026-03-04",
    location: "Makati City, Metro Manila",
    status: "pending",
    providerId: "SE-AT-017",
  },
  {
    applicationId: "APP-2026-0238",
    businessName: "PetCare Veterinary Services",
    ownerName: "Victoria Anne Lopez",
    category: "Pet Services",
    dateApplied: "2026-03-03",
    location: "Pasig City, Metro Manila",
    status: "pending",
    providerId: "SE-PS-018",
  },
  {
    applicationId: "APP-2026-0239",
    businessName: "EventMasters Pro",
    ownerName: "Christopher James Diaz",
    category: "Events & Entertainment",
    dateApplied: "2026-03-01",
    location: "Pasay City, Metro Manila",
    status: "pending",
    providerId: "SE-EE-019",
  },
  {
    applicationId: "APP-2026-0240",
    businessName: "HandyFix Home Services",
    ownerName: "Michelle Anne Garcia",
    category: "Home Maintenance & Repair",
    dateApplied: "2026-03-02",
    location: "Mandaluyong City, Metro Manila",
    status: "pending",
    providerId: "SE-HM-020",
  },
  {
    applicationId: "APP-2026-0228",
    businessName: "ElectroPro Electricians",
    ownerName: "Antonio Carlos Rivera",
    category: "Home Maintenance & Repair",
    dateApplied: "2024-01-20",
    location: "Malabon City, Metro Manila",
    status: "approved",
    providerId: "SE-HM-015",
  },
  {
    applicationId: "APP-2026-0215",
    businessName: "HomeFixPro Manila",
    ownerName: "Juan Carlos Reyes",
    category: "Home Maintenance & Repair",
    dateApplied: "2024-01-10",
    location: "Makati City, Metro Manila",
    status: "approved",
    providerId: "SE-HM-001",
  },
  {
    applicationId: "APP-2026-0221",
    businessName: "Glow Beauty Spa",
    ownerName: "Maria Elena Santos",
    category: "Beauty Wellness & Personal Care",
    dateApplied: "2024-02-15",
    location: "Quezon City, Metro Manila",
    status: "approved",
    providerId: "SE-BW-002",
  },
  {
    applicationId: "APP-2026-0198",
    businessName: "QuickTech Repairs",
    ownerName: "Santiago Miguel Torres",
    category: "Automotive & Tech Support",
    dateApplied: "2023-12-05",
    location: "Valenzuela City, Metro Manila",
    status: "rejected",
    providerId: "SE-AT-021",
  },
  {
    applicationId: "APP-2026-0205",
    businessName: "CleanSwift Services",
    ownerName: "Angelica Rose Mendoza",
    category: "Domestic & Cleaning Services",
    dateApplied: "2024-01-08",
    location: "Paranaque City, Metro Manila",
    status: "rejected",
    providerId: "SE-DC-022",
  },
];

const stats = [
  {
    title: "Pending Review",
    value: "7",
    subtitle: "Awaiting approval",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Approved Today",
    value: "3",
    subtitle: "Applications processed",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Requires Action",
    value: "2",
    subtitle: "Urgent reviews needed",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

type ProviderApplicationRow = typeof applications[number];

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("servease_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function getString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value) {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return undefined;
}

function getApplicationArray(response: unknown): unknown[] {
  const record = asRecord(response);
  if (Array.isArray(response)) return response;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.applications)) return record.applications;
  if (Array.isArray(record.provider_applications)) return record.provider_applications;
  return [];
}

function normalizeApplicationRow(application: unknown): ProviderApplicationRow | null {
  const record = asRecord(application);
  const provider = asRecord(record.provider);
  const business = asRecord(record.business);
  const owner = asRecord(record.owner);
  const address = asRecord(record.address ?? record.business_address);
  const id = getString(record.applicationId, record.application_id, record.id);
  const businessName = getString(record.businessName, record.business_name, business.name, provider.businessName, provider.business_name);
  const ownerName = getString(record.ownerName, record.owner_name, owner.name, provider.ownerName, provider.owner_name, provider.contactPerson, provider.contact_person);

  if (!id || !businessName) {
    return null;
  }

  return {
    applicationId: id,
    businessName,
    ownerName: ownerName || "Unknown Owner",
    category: getString(record.category, record.categoryName, record.category_name, provider.category, provider.categoryName, provider.category_name) || "Uncategorized",
    dateApplied: getString(record.dateApplied, record.date_applied, record.createdAt, record.created_at, record.submittedAt, record.submitted_at) || new Date().toISOString(),
    location: getString(record.location, address.city, business.location, provider.location) || "N/A",
    status: (getString(record.status, record.application_status, record.approvalStatus, record.approval_status) || "pending").toLowerCase(),
    providerId: getString(record.providerId, record.provider_id, provider.id) || id,
  };
}

function normalizeApplicationRows(response: unknown): ProviderApplicationRow[] {
  return getApplicationArray(response)
    .map(normalizeApplicationRow)
    .filter((application): application is ProviderApplicationRow => application !== null);
}

export function ProviderApplications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [providerApplications, setProviderApplications] = useState<ProviderApplicationRow[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const apiBaseUrl = getApiBaseUrl();
    const applicationsUrl = `${apiBaseUrl}/api/admin/v1/users/provider-applications`;

    setIsLoadingApplications(true);
    fetch(applicationsUrl, {
      headers: getAuthHeaders(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch provider applications: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        const normalizedApplications = normalizeApplicationRows(data);
        console.log("provider applications raw response", data);
        console.log(
          "provider applications normalized statuses",
          normalizedApplications.map((app) => ({
            applicationId: app.applicationId,
            businessName: app.businessName,
            status: app.status,
          }))
        );
        setProviderApplications(normalizedApplications);
      })
      .catch((error) => {
        console.warn("Provider applications could not be loaded.", error);
        alert("Provider applications could not be loaded. Please try again.");
        setProviderApplications([]);
      })
      .finally(() => {
        setIsLoadingApplications(false);
      });
  }, [location.state]);

  let filteredApplications = providerApplications.filter((app) => {
    const matchesSearch =
      app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort: pending first, then by date (newest first)
  filteredApplications = [...filteredApplications].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
  });

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          Pending Review
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const pendingCount = providerApplications.filter((app) => app.status === "pending").length;
  const approvedCount = providerApplications.filter((app) => app.status === "approved").length;
  const requiresActionCount = providerApplications.filter((app) => app.status === "pending").length;
  const displayStats = stats.map((stat) => {
    if (stat.title === "Pending Review") return { ...stat, value: String(pendingCount) };
    if (stat.title === "Approved Today") return { ...stat, value: String(approvedCount) };
    if (stat.title === "Requires Action") return { ...stat, value: String(requiresActionCount) };
    return stat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Provider Applications</h1>
        <p className="text-gray-500 mt-1">
          Review and approve new service provider applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Queue</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredApplications.length} of {providerApplications.length} applications
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">
                  Pending Review ({pendingCount})
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Home Maintenance & Repair">
                  Home Maintenance & Repair
                </SelectItem>
                <SelectItem value="Beauty Wellness & Personal Care">
                  Beauty Wellness & Personal Care
                </SelectItem>
                <SelectItem value="Education & Professional Services">
                  Education & Professional Services
                </SelectItem>
                <SelectItem value="Domestic & Cleaning Services">
                  Domestic & Cleaning Services
                </SelectItem>
                <SelectItem value="Pet Services">Pet Services</SelectItem>
                <SelectItem value="Events & Entertainment">
                  Events & Entertainment
                </SelectItem>
                <SelectItem value="Automotive & Tech Support">
                  Automotive & Tech Support
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingApplications ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#00BF63]" />
                        Loading provider applications...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No applications found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.applicationId}>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900">
                          {app.applicationId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {app.businessName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{app.ownerName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{app.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(app.dateApplied).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{app.location}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/provider-applications/${app.applicationId}`)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
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

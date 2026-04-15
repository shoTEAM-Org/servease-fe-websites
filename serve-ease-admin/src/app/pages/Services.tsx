import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Search,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import { fetchAdminJson } from "../lib/adminApi";
import { toast } from "sonner";

type ApiCategory = {
  id?: string;
  name?: string;
};

type CategoriesResponse = {
  categories: ApiCategory[];
};

type ApiService = {
  id?: string;
  title?: string;
  category_id?: string | null;
  price?: number | null;
  hourly_rate?: number | null;
  pricing_mode?: string | null;
  estimated_duration?: string | null;
  created_at?: string | null;
  is_active?: boolean | null;
};

type ServicesResponse = {
  services: ApiService[];
  total: number;
  page: number;
  limit: number;
};

type ServiceRow = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  pricingType: "Fixed" | "Hourly" | "Starting at";
  basePrice: number;
  status: "Active" | "Inactive";
  lastUpdated: string;
  duration: string;
};

const LIMIT = 100;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function pricingModeToLabel(mode: string): "Fixed" | "Hourly" | "Starting at" {
  const m = mode.toLowerCase();
  if (m === "hourly") return "Hourly";
  if (m === "starting_at" || m === "starting at") return "Starting at";
  return "Fixed";
}

function pricingLabelToMode(label: string): "flat" | "hourly" | "starting_at" {
  if (label === "Hourly") return "hourly";
  if (label === "Starting at") return "starting_at";
  return "flat";
}

export function Services() {
  const [servicesData, setServicesData] = useState<ServiceRow[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pricingTypeFilter, setPricingTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRow | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    pricingType: "Fixed",
    price: "",
    duration: "",
    status: "Active",
  });

  const fetchAll = async () => {
    const [servicesResult, categoriesResult] = await Promise.all([
      fetchAdminJson<ServicesResponse>(`/api/admin/v1/marketplace/services?page=1&limit=${LIMIT}`),
      fetchAdminJson<CategoriesResponse>(`/api/admin/v1/marketplace/categories?page=1&limit=${LIMIT}`),
    ]);

    const categories = (categoriesResult.categories ?? []).map((c) => ({
      id: asString(c.id),
      name: asString(c.name, "Unknown Category"),
    }));
    const categoriesById = new Map(categories.map((c) => [c.id, c.name]));

    const rows = (servicesResult.services ?? []).map((service) => {
      const mode = pricingModeToLabel(asString(service.pricing_mode, "flat"));
      const price = mode === "Hourly" ? asNumber(service.hourly_rate, 0) : asNumber(service.price, 0);
      return {
        id: asString(service.id),
        name: asString(service.title, "Untitled Service"),
        categoryId: asString(service.category_id),
        categoryName: categoriesById.get(asString(service.category_id)) || "Unknown Category",
        pricingType: mode,
        basePrice: price,
        status: service.is_active === false ? "Inactive" : "Active",
        lastUpdated: asString(service.created_at).slice(0, 10) || "—",
        duration: asString(service.estimated_duration, "—"),
      } as ServiceRow;
    });

    setCategoryOptions(categories);
    setServicesData(rows);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        await fetchAll();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load services.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredServices = useMemo(() => {
    return servicesData.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || service.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || service.status.toLowerCase() === statusFilter;
      const matchesPricing = pricingTypeFilter === "all" || service.pricingType.toLowerCase() === pricingTypeFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesPricing;
    });
  }, [servicesData, searchTerm, categoryFilter, statusFilter, pricingTypeFilter]);

  const stats = useMemo(() => {
    const total = servicesData.length;
    const active = servicesData.filter((s) => s.status === "Active").length;
    const inactive = total - active;
    const avgPrice = total > 0 ? Math.round(servicesData.reduce((sum, s) => sum + s.basePrice, 0) / total) : 0;
    return { total, active, inactive, avgPrice };
  }, [servicesData]);

  const handleEdit = (service: ServiceRow) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      categoryId: service.categoryId,
      description: "",
      pricingType: service.pricingType,
      price: String(service.basePrice),
      duration: service.duration === "—" ? "" : service.duration,
      status: service.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedService) return;
    if (!formData.name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    try {
      setIsSubmitting(true);
      const pricingMode = pricingLabelToMode(formData.pricingType);
      const price = Number(formData.price || 0);
      const payload = {
        title: formData.name.trim(),
        category_id: formData.categoryId || null,
        pricing_mode: pricingMode,
        price: pricingMode === "hourly" ? null : price,
        hourly_rate: pricingMode === "hourly" ? price : null,
        estimated_duration: formData.duration.trim() || null,
        is_active: formData.status === "Active",
      };
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/marketplace/services/${selectedService.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Service updated.");
      setIsDialogOpen(false);
      setSelectedService(null);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (service: ServiceRow) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;
    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/marketplace/services/${selectedService.id}`, {
        method: "DELETE",
      });
      toast.success(`Service "${selectedService.name}" deleted.`);
      setDeleteDialogOpen(false);
      setSelectedService(null);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (service: ServiceRow) => {
    try {
      setIsSubmitting(true);
      await fetchAdminJson<{ status: string }>(`/api/admin/v1/marketplace/services/${service.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: service.status !== "Active" }),
      });
      toast.success(`Service "${service.name}" status updated.`);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update service status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-500 mt-1">Manage service offerings, pricing, and availability across all categories</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Failed to load services</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Services</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-blue-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Active Services</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6 text-[#00BF63]" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Inactive Services</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p></div><div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><XCircle className="w-6 h-6 text-red-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Avg. Base Price</p><p className="text-2xl font-bold text-gray-900 mt-1">₱{stats.avgPrice}</p></div><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Service List</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><Input placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categoryOptions.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="All status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            <Select value={pricingTypeFilter} onValueChange={setPricingTypeFilter}><SelectTrigger><SelectValue placeholder="All pricing types" /></SelectTrigger><SelectContent><SelectItem value="all">All Pricing Types</SelectItem><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="starting at">Starting at</SelectItem><SelectItem value="hourly">Hourly</SelectItem></SelectContent></Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Service Name</TableHead><TableHead>Category</TableHead><TableHead>Pricing Type</TableHead><TableHead className="text-right">Base Price / Rate</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead><TableHead>Last Updated</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Loading services...</TableCell></TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No services found</TableCell></TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-blue-600" /></div><div><p className="font-medium text-gray-900">{service.name}</p><p className="text-xs text-gray-500">{service.id}</p></div></div></TableCell>
                      <TableCell className="text-sm text-gray-700">{service.categoryName}</TableCell>
                      <TableCell><Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{service.pricingType}</Badge></TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">₱{service.basePrice.toLocaleString()}{service.pricingType === "Hourly" && <span className="text-xs text-gray-500">/hr</span>}</TableCell>
                      <TableCell className="text-sm text-gray-600"><div className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration}</div></TableCell>
                      <TableCell><Badge className={service.status === "Active" ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]" : "bg-red-100 text-red-700 border-red-200"}>{service.status === "Active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}{service.status}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-500">{service.lastUpdated}</TableCell>
                      <TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Button variant="outline" size="sm" onClick={() => handleEdit(service)} disabled={isSubmitting}><Edit className="w-4 h-4" /></Button><Button variant="outline" size="sm" onClick={() => void toggleStatus(service)} disabled={isSubmitting}>{service.status === "Active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button><Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(service)} disabled={isSubmitting}><Trash2 className="w-4 h-4" /></Button></div></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Service Name *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="category">Category *</Label><Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}><SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categoryOptions.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="pricingType">Pricing Type *</Label><Select value={formData.pricingType} onValueChange={(value) => setFormData({ ...formData, pricingType: value })}><SelectTrigger id="pricingType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Starting at">Starting at</SelectItem><SelectItem value="Hourly">Hourly</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="price">{formData.pricingType === "Hourly" ? "Hourly Rate *" : "Base Price *"}</Label><Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="duration">Duration Estimate</Label><Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button className="bg-[#00BF63] hover:bg-[#00A055]" onClick={() => void handleSave()} disabled={isSubmitting}>Update Service</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Service</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => void confirmDelete()} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>Delete Service</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

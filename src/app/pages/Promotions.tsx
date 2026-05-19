import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
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
  Plus,
  Edit,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  DollarSign,
  AlertCircle,
  Download,
  FileText,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { datedFileName, exportSectionsToCsv, exportSectionsToPdf } from "../utils/exportFiles";

type PromotionType = "Percent" | "Fixed";
type PromotionStatus = "Active" | "Scheduled" | "Expired" | "Disabled";

interface Promotion {
  id: string;
  code: string;
  promoRef: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: PromotionStatus;
  minBasket: number;
  categoryRestriction: string;
  categoryId: string;
}

interface PromotionRow {
  id: string;
  code: string;
  promo_ref?: string | null;
  type: string;
  value: number | string;
  start_date: string;
  end_date: string;
  usage_count?: number | string | null;
  usage_limit?: number | string | null;
  status: string;
}

interface PromoApplicableCategoryRow {
  promo_id: string;
  category_id: string;
}

const SUPABASE_SCHEMA = "notification_and_support";
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function getSupabaseHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Accept-Profile": SUPABASE_SCHEMA,
    "Content-Profile": SUPABASE_SCHEMA,
  };
}

async function supabaseRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...getSupabaseHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

function normalizeType(type: string): PromotionType {
  const value = type.toLowerCase();
  return value === "fixed" || value === "fixed_amount" || value === "amount" ? "Fixed" : "Percent";
}

function normalizeStatus(status: string): PromotionStatus {
  const value = status.toLowerCase();
  if (value === "scheduled") return "Scheduled";
  if (value === "expired") return "Expired";
  if (value === "disabled" || value === "inactive") return "Disabled";
  return "Active";
}

function getStoredAdminId(): string | undefined {
  try {
    const admin = JSON.parse(localStorage.getItem("servease_admin") || "{}");
    return typeof admin.id === "string" && admin.id ? admin.id : undefined;
  } catch {
    return undefined;
  }
}

export function Promotions() {
  const { serviceCategories } = useData();
  const categoryNameById = useMemo(
    () => new Map(serviceCategories.map((category) => [category.id, category.name])),
    [serviceCategories]
  );
  const categoryIdByName = useMemo(
    () => new Map(serviceCategories.map((category) => [category.name, category.id])),
    [serviceCategories]
  );
  const [promotionsData, setPromotionsData] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "Percent",
    value: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    minBasket: "",
    categoryRestriction: "None",
    status: "Active",
  });

  const fetchPromotions = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [rows, categoryRows] = await Promise.all([
        supabaseRequest<PromotionRow[]>("promotions?select=*&order=created_at.desc"),
        supabaseRequest<PromoApplicableCategoryRow[]>("promo_applicable_categories?select=promo_id,category_id"),
      ]);
      const categoryIdByPromoId = new Map(
        categoryRows.map((row) => [row.promo_id, row.category_id])
      );

      setPromotionsData(
        rows.map((row) => {
          const categoryId = categoryIdByPromoId.get(row.id) || "";

          return {
            id: row.id,
            code: row.code,
            promoRef: row.promo_ref || "",
            type: normalizeType(row.type),
            value: Number(row.value) || 0,
            startDate: row.start_date,
            endDate: row.end_date,
            usageLimit: Number(row.usage_limit) || 0,
            usageCount: Number(row.usage_count) || 0,
            status: normalizeStatus(row.status),
            minBasket: 0,
            categoryRestriction: categoryId ? categoryNameById.get(categoryId) || categoryId : "None",
            categoryId,
          };
        })
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to load promotions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [categoryNameById]);

  // Filter promotions
  const filteredPromotions = promotionsData.filter((promo) => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || promo.type === typeFilter;
    const matchesStatus = statusFilter === "all" || promo.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: promotionsData.length,
    active: promotionsData.filter((p) => p.status === "Active").length,
    scheduled: promotionsData.filter((p) => p.status === "Scheduled").length,
    expired: promotionsData.filter((p) => p.status === "Expired").length,
  };

  const promotionExportSection = {
    headers: [
      "ID",
      "Code",
      "Reference",
      "Type",
      "Value",
      "Start Date",
      "End Date",
      "Usage Count",
      "Usage Limit",
      "Status",
      "Category Restriction",
    ],
    rows: filteredPromotions.map((promotion) => [
      promotion.id,
      promotion.code,
      promotion.promoRef,
      promotion.type,
      promotion.type === "Percent" ? `${promotion.value}%` : `PHP ${promotion.value}`,
      promotion.startDate,
      promotion.endDate,
      promotion.usageCount,
      promotion.usageLimit,
      promotion.status,
      promotion.categoryRestriction,
    ]),
  };

  const handleExportCSV = () => {
    exportSectionsToCsv(datedFileName("promotions", "csv"), [promotionExportSection]);
  };

  const handleExportPDF = () => {
    exportSectionsToPdf(datedFileName("promotions", "pdf"), "Promotions", [promotionExportSection]);
  };

  const handleAdd = () => {
    setSelectedPromotion(null);
    setFormData({
      code: "",
      type: "Percent",
      value: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      minBasket: "",
      categoryRestriction: "None",
      status: "Active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code,
      type: promotion.type,
      value: promotion.value.toString(),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      usageLimit: promotion.usageLimit.toString(),
      minBasket: promotion.minBasket.toString(),
      categoryRestriction: promotion.categoryRestriction,
      status: promotion.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.value || !formData.startDate || !formData.endDate || !formData.usageLimit) {
      alert("Please fill in all required promotion fields.");
      return;
    }

    setIsSaving(true);
    const categoryId =
      formData.categoryRestriction === "None"
        ? ""
        : categoryIdByName.get(formData.categoryRestriction) || formData.categoryRestriction;
    const promotionPayload = {
      code: formData.code.trim().toUpperCase(),
      promo_ref: selectedPromotion?.promoRef || formData.code.trim().toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      start_date: formData.startDate,
      end_date: formData.endDate,
      usage_limit: Number(formData.usageLimit),
      status: formData.status,
    };
    const adminId = getStoredAdminId();
    const savePayload = selectedPromotion
      ? { ...promotionPayload, ...(adminId ? { updated_by: adminId } : {}) }
      : {
          ...promotionPayload,
          ...(adminId ? { created_by: adminId, updated_by: adminId } : {}),
        };

    try {
      const savedRows = selectedPromotion
        ? await supabaseRequest<PromotionRow[]>(
            `promotions?id=eq.${encodeURIComponent(selectedPromotion.id)}`,
            {
              method: "PATCH",
              headers: { Prefer: "return=representation" },
              body: JSON.stringify(savePayload),
            }
          )
        : await supabaseRequest<PromotionRow[]>("promotions", {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(savePayload),
          });
      const savedPromotionId = savedRows[0]?.id || selectedPromotion?.id;

      if (savedPromotionId) {
        await supabaseRequest<null>(
          `promo_applicable_categories?promo_id=eq.${encodeURIComponent(savedPromotionId)}`,
          { method: "DELETE" }
        );

        if (categoryId) {
          await supabaseRequest<unknown>("promo_applicable_categories", {
            method: "POST",
            body: JSON.stringify({ promo_id: savedPromotionId, category_id: categoryId }),
          });
        }
      }

      await fetchPromotions();
      alert(`Promotion ${selectedPromotion ? "updated" : "created"} successfully!`);
      setIsDialogOpen(false);
    } catch (error: any) {
      alert(error.message || "Unable to save promotion.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPromotion) return;

    setIsDeleting(true);
    try {
      await supabaseRequest<null>(
        `promo_applicable_categories?promo_id=eq.${encodeURIComponent(selectedPromotion.id)}`,
        { method: "DELETE" }
      );
      await supabaseRequest<null>(
        `promotions?id=eq.${encodeURIComponent(selectedPromotion.id)}`,
        { method: "DELETE" }
      );
      await fetchPromotions();
      alert(`Promotion "${selectedPromotion.code}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
    } catch (error: any) {
      alert(error.message || "Unable to delete promotion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const disablePromotion = async (promotion: Promotion) => {
    try {
      const adminId = getStoredAdminId();
      await supabaseRequest<PromotionRow[]>(
        `promotions?id=eq.${encodeURIComponent(promotion.id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            status: "Disabled",
            ...(adminId ? { updated_by: adminId } : {}),
          }),
        }
      );
      await fetchPromotions();
      alert(`Promotion "${promotion.code}" disabled successfully!`);
    } catch (error: any) {
      alert(error.message || "Unable to disable promotion.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "Disabled":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Disabled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
        <p className="text-gray-500 mt-1">
          Create and manage promotional codes, discounts, and special offers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Promotions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Promotions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00BF63]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.scheduled}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Promotions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Promotions List</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" onClick={handleExportPDF} className="bg-[#00BF63] hover:bg-[#00A055] text-white">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button className="bg-[#00BF63] hover:bg-[#00A055] text-white" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Create Promotion
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Unable to load promotions</p>
                <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Percent">Percentage Discount</SelectItem>
                <SelectItem value="Fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      Loading promotions...
                    </TableCell>
                  </TableRow>
                )}
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{promotion.code}</p>
                          <p className="text-xs text-gray-500">{promotion.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          promotion.type === "Percent"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {promotion.type === "Percent" ? (
                          <Percent className="w-3 h-3 mr-1" />
                        ) : (
                          <DollarSign className="w-3 h-3 mr-1" />
                        )}
                        {promotion.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {promotion.type === "Percent" ? `${promotion.value}%` : `₱${promotion.value}`}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{promotion.startDate}</TableCell>
                    <TableCell className="text-sm text-gray-600">{promotion.endDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {promotion.usageCount} / {promotion.usageLimit}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              promotion.usageLimit > 0 &&
                              (promotion.usageCount / promotion.usageLimit) * 100 > 80
                                ? "bg-orange-500"
                                : "bg-[#00BF63]"
                            }`}
                            style={{
                              width: `${
                                promotion.usageLimit > 0
                                  ? Math.min((promotion.usageCount / promotion.usageLimit) * 100, 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {promotion.status === "Active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disablePromotion(promotion)}
                          >
                            Disable
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(promotion)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!isLoading && filteredPromotions.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No promotions found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedPromotion ? "Edit Promotion" : "Create New Promotion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promotion Code *</Label>
              <Input
                id="code"
                placeholder="e.g., WELCOME50"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percent">Percentage Discount</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Value * {formData.type === "Percent" ? "(%)" : "(₱)"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minBasket">Min Basket Value (₱)</Label>
                <Input
                  id="minBasket"
                  type="number"
                  placeholder="0"
                  value={formData.minBasket}
                  onChange={(e) => setFormData({ ...formData, minBasket: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit *</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryRestriction">Category Restriction (Optional)</Label>
              <Select value={formData.categoryRestriction} onValueChange={(value) => setFormData({ ...formData, categoryRestriction: value })}>
                <SelectTrigger id="categoryRestriction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">No Restriction</SelectItem>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.minBasket && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Minimum Basket Requirement</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This promotion will only apply to bookings with a minimum value of ₱
                    {formData.minBasket}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00BF63] hover:bg-[#00A055]"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : selectedPromotion
                  ? "Update Promotion"
                  : "Create Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete promotion code "{selectedPromotion?.code}"? This
              action cannot be undone. Users will no longer be able to use this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Promotion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

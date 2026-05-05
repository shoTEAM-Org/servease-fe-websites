import { useEffect, useState } from "react";
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
  Eye,
  EyeOff,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import type { MarketplaceService } from "../../types";

export function Services() {
  const {
    serviceCategories,
    serviceProviders,
    services,
    isLoadingServices,
    fetchServices,
    fetchServiceCategories,
    fetchServiceProviders,
    createMarketplaceService,
    updateMarketplaceService,
    deleteMarketplaceService,
    toggleMarketplaceServiceStatus,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pricingTypeFilter, setPricingTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [formData, setFormData] = useState({
    providerId: "",
    name: "",
    category: "",
    description: "",
    pricingType: "Fixed",
    price: "",
    duration: "",
    materials: "",
    status: "Active",
  });

  useEffect(() => {
    void fetchServiceCategories();
    void fetchServiceProviders();
    void fetchServices();
  }, [fetchServiceCategories, fetchServiceProviders, fetchServices]);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);
    const matchesPricing = pricingTypeFilter === "all" || service.pricingType.toLowerCase() === pricingTypeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesPricing;
  });

  const averagePrice = services.length
    ? Math.round(services.reduce((sum, service) => sum + service.basePrice, 0) / services.length)
    : 0;
  const stats = {
    total: services.length,
    active: services.filter((service) => service.isActive).length,
    inactive: services.filter((service) => !service.isActive).length,
    avgPrice: averagePrice,
  };

  const handleAdd = () => {
    setSelectedService(null);
    setFormData({
      providerId: "",
      name: "",
      category: "",
      description: "",
      pricingType: "Fixed",
      price: "",
      duration: "",
      materials: "",
      status: "Active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (service: MarketplaceService) => {
    setSelectedService(service);
    setFormData({
      providerId: service.providerId,
      name: service.name,
      category: service.category,
      description: service.description || "",
      pricingType: service.pricingType,
      price: service.basePrice.toString(),
      duration: service.duration,
      materials: "",
      status: service.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category || !formData.price || Number(formData.price) <= 0) {
      alert("Provider, category, service name, and price are required.");
      return;
    }

    if (!selectedService) {
      if (!formData.providerId) {
        alert("Provider, category, service name, and price are required.");
        return;
      }

      const result = await createMarketplaceService(formData);
      if (!result.success) {
        return;
      }

      alert("Service created successfully!");
      setIsDialogOpen(false);
      return;
    }

    const result = await updateMarketplaceService(selectedService.id, formData);
    if (!result.success) {
      return;
    }

    alert("Service updated successfully!");
    setIsDialogOpen(false);
  };

  const handleDelete = (service: MarketplaceService) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) {
      return;
    }

    const result = await deleteMarketplaceService(selectedService.id);
    if (!result.success) {
      return;
    }

    alert(`Service "${selectedService.name}" deleted successfully!`);
    setDeleteDialogOpen(false);
    setSelectedService(null);
  };

  const toggleStatus = async (service: MarketplaceService) => {
    const result = await toggleMarketplaceServiceStatus(service.id, !service.isActive);
    if (!result.success) {
      return;
    }

    alert(`Service "${service.name}" status toggled!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-500 mt-1">
          Manage service offerings, pricing, and availability across all categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Services</p>
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
                <p className="text-sm text-gray-500">Inactive Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Base Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₱{stats.avgPrice}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service List</CardTitle>
            <Button className="bg-[#00BF63] hover:bg-[#00A055] text-white" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={pricingTypeFilter} onValueChange={setPricingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All pricing types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing Types</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="starting at">Starting at</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing Type</TableHead>
                  <TableHead className="text-right">Base Price / Rate</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingServices ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading services...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{service.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {service.pricingType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        ₱{service.basePrice.toLocaleString()}
                        {service.pricingType === "Hourly" && <span className="text-xs text-gray-500">/hr</span>}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            service.isActive
                              ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {service.isActive ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{service.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(service)}
                          >
                            {service.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(service)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoadingServices && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No services found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedService && (
              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select
                  value={formData.providerId}
                  onValueChange={(value) => setFormData({ ...formData, providerId: value })}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Plumbing Repair"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the service..."
                rows={3}
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricingType">Pricing Type *</Label>
                <Select value={formData.pricingType} onValueChange={(value) => setFormData({ ...formData, pricingType: value })}>
                  <SelectTrigger id="pricingType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Starting at">Starting at</SelectItem>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  {formData.pricingType === "Hourly" ? "Hourly Rate *" : "Base Price *"}
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration Estimate</Label>
              <Input
                id="duration"
                placeholder="e.g., 1-2 hours"
                value={formData.duration}
                onChange={(event) => setFormData({ ...formData, duration: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials">Required Materials (Optional)</Label>
              <Textarea
                id="materials"
                placeholder="List of materials required..."
                rows={2}
                value={formData.materials}
                onChange={(event) => setFormData({ ...formData, materials: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#00BF63] hover:bg-[#00A055]" onClick={handleSave}>
              {selectedService ? "Update Service" : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

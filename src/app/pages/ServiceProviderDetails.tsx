import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  FileText,
  Ban,
  UserX,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle,
  XCircle,
  ZoomIn,
  AlertCircle,
  Calendar,
  Shield,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// Mock data - replace with actual data fetching
const mockProvider = {
  id: "SE-HM-001",
  businessName: "HomeFixPro Manila",
  serviceCategory: "Home Maintenance & Repair",
  businessDescription:
    "HomeFixPro Manila is a professional home maintenance and repair service company specializing in plumbing, electrical work, carpentry, and general home repairs. We pride ourselves on quality workmanship and excellent customer service. Our team of certified technicians is dedicated to solving all your home maintenance needs with professionalism and efficiency.",
  businessType: "physical",
  businessAddress: {
    street: "456 Ayala Avenue",
    barangay: "Bel-Air",
    city: "Makati City",
    province: "Metro Manila",
    zipCode: "1209",
  },
  onlinePresence: {
    website: "https://homefixpro.ph",
    platforms: ["Facebook Marketplace", "Lazada", "Shopee"],
  },
  services: [
    "Plumbing repairs and installation",
    "Electrical troubleshooting and wiring",
    "Carpentry and furniture assembly",
    "Painting and wall repairs",
    "General home maintenance",
  ],
  workingHours: {
    monday: { isOpen: true, startTime: "08:00", endTime: "18:00" },
    tuesday: { isOpen: true, startTime: "08:00", endTime: "18:00" },
    wednesday: { isOpen: true, startTime: "08:00", endTime: "18:00" },
    thursday: { isOpen: true, startTime: "08:00", endTime: "18:00" },
    friday: { isOpen: true, startTime: "08:00", endTime: "18:00" },
    saturday: { isOpen: true, startTime: "09:00", endTime: "15:00" },
    sunday: { isOpen: false, startTime: "", endTime: "" },
  },
  contactInfo: {
    phoneNumber: "+63 917 123 4567",
    email: "contact@homefixpro.ph",
    website: "https://homefixpro.ph",
  },
  socialMedia: {
    facebook: "https://facebook.com/homefixpromanila",
    instagram: "https://instagram.com/homefixproph",
    twitter: "https://twitter.com/homefixpro",
    linkedin: "",
  },
  businessPermit: {
    fileName: "business-permit-2024.pdf",
    fileUrl: "https://images.unsplash.com/photo-1554224311-beee460c201f?w=800&q=80",
    verificationStatus: "verified", // pending, verified, invalid
    uploadedDate: "2024-01-10",
    permitNumber: "BPM-2024-00123456",
    registeredBusinessName: "HomeFixPro Manila Services Corporation",
    issueDate: "2024-01-05",
    expiryDate: "2025-01-05",
    verificationChecklist: {
      businessNameMatch: true,
      permitValid: true,
      addressMatch: true,
      categoryMatch: true,
    },
    documentStatus: "verified", // verified, needs-clarification, invalid
  },
  approvalStatus: "approved",
  rating: 4.9,
  completedJobs: 1247,
  dateJoined: "2024-01-15",
};

export function ServiceProviderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showPermitModal, setShowPermitModal] = useState(false);

  const provider = mockProvider; // Replace with actual data fetching based on id

  const getVerificationBadge = (status: string) => {
    if (status === "verified") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Verification
        </Badge>
      );
    }
    if (status === "invalid") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Invalid
        </Badge>
      );
    }
    return null;
  };

  const getDocumentStatusBadge = (status: string) => {
    if (status === "verified") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (status === "needs-clarification") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Needs Clarification
        </Badge>
      );
    }
    if (status === "invalid") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Invalid
        </Badge>
      );
    }
    return null;
  };

  const handleSuspend = () => {
    // Handle suspend action
    console.log("Suspending provider:", id);
    setShowSuspendModal(false);
    // Add actual API call here
  };

  const handleDeactivate = () => {
    // Handle deactivate action
    console.log("Deactivating provider:", id);
    setShowDeactivateModal(false);
    // Add actual API call here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/sellers/marketplace")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Service Providers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Service Provider Details
            </h1>
            <p className="text-gray-500 mt-1">
              Business ID: <span className="font-mono">{provider.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Basic Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Business Name
              </label>
              <p className="text-gray-900 mt-1">{provider.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Selected Service Category
              </label>
              <p className="text-gray-900 mt-1">{provider.serviceCategory}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Business Description
            </label>
            <p className="text-gray-900 mt-1 leading-relaxed">
              {provider.businessDescription}
            </p>
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Business Address
            </label>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {provider.businessType === "physical"
                      ? "Physical Location"
                      : "Online Business"}
                  </p>
                  {provider.businessType === "physical" ? (
                    <p className="text-gray-900 mt-1">
                      {provider.businessAddress.street}, Barangay{" "}
                      {provider.businessAddress.barangay}
                      <br />
                      {provider.businessAddress.city},{" "}
                      {provider.businessAddress.province}{" "}
                      {provider.businessAddress.zipCode}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-900">
                        Website: {provider.onlinePresence.website}
                      </p>
                      <p className="text-gray-900">
                        Platforms:{" "}
                        {provider.onlinePresence.platforms.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Service Description
          </label>
          <p className="text-gray-900 leading-relaxed">
            {provider.services.join(". ")}
          </p>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(provider.workingHours).map(([day, schedule]) => (
              <div
                key={day}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <span className="font-medium text-gray-700 capitalize w-32">
                  {day}
                </span>
                {schedule.isOpen ? (
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Open
                    </Badge>
                    <span className="text-gray-900 font-mono">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    Closed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <p className="text-gray-900 mt-1">
                  {provider.contactInfo.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <p className="text-gray-900 mt-1">
                  {provider.contactInfo.email}
                </p>
              </div>
            </div>

            {provider.contactInfo.website && (
              <div className="flex items-start gap-3 md:col-span-2">
                <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Website
                  </label>
                  <a
                    href={provider.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {provider.contactInfo.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Presence */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Presence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {provider.socialMedia.facebook && (
              <div className="flex items-start gap-3">
                <Facebook className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Facebook
                  </label>
                  <a
                    href={provider.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block text-sm"
                  >
                    {provider.socialMedia.facebook}
                  </a>
                </div>
              </div>
            )}

            {provider.socialMedia.instagram && (
              <div className="flex items-start gap-3">
                <Instagram className="w-5 h-5 text-pink-600 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Instagram
                  </label>
                  <a
                    href={provider.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block text-sm"
                  >
                    {provider.socialMedia.instagram}
                  </a>
                </div>
              </div>
            )}

            {provider.socialMedia.twitter && (
              <div className="flex items-start gap-3">
                <Twitter className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Twitter/X
                  </label>
                  <a
                    href={provider.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block text-sm"
                  >
                    {provider.socialMedia.twitter}
                  </a>
                </div>
              </div>
            )}

            {provider.socialMedia.linkedin && (
              <div className="flex items-start gap-3">
                <Linkedin className="w-5 h-5 text-blue-700 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    LinkedIn
                  </label>
                  <a
                    href={provider.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block text-sm"
                  >
                    {provider.socialMedia.linkedin}
                  </a>
                </div>
              </div>
            )}

            {!provider.socialMedia.facebook &&
              !provider.socialMedia.instagram &&
              !provider.socialMedia.twitter &&
              !provider.socialMedia.linkedin && (
                <p className="text-gray-500 text-sm col-span-2">
                  No social media links provided
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Business Permit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Business Permit & Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {provider.businessPermit.fileUrl ? (
            <div className="space-y-6">
              {/* Image Preview */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Uploaded Business Permit
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative group">
                  <img
                    src={provider.businessPermit.fileUrl}
                    alt="Business Permit"
                    className="w-full max-w-md mx-auto rounded cursor-pointer hover:opacity-90 transition"
                    onClick={() => setShowPermitModal(true)}
                  />
                  <button
                    onClick={() => setShowPermitModal(true)}
                    className="absolute top-6 right-6 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition"
                    title="Click to enlarge"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600">
                    File: <span className="font-mono">{provider.businessPermit.fileName}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded on{" "}
                    {new Date(provider.businessPermit.uploadedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Permit Details */}
              <div className="border-t pt-6">
                <label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Permit Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Permit Number
                      </label>
                      <p className="text-gray-900 mt-1 font-mono">
                        {provider.businessPermit.permitNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Registered Business Name
                      </label>
                      <p className="text-gray-900 mt-1">
                        {provider.businessPermit.registeredBusinessName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Issue Date
                      </label>
                      <p className="text-gray-900 mt-1">
                        {new Date(provider.businessPermit.issueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Expiry Date
                      </label>
                      <p className="text-gray-900 mt-1">
                        {new Date(provider.businessPermit.expiryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="border-t pt-6">
                <label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Verification Checklist
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Business Name matches application</span>
                    {provider.businessPermit.verificationChecklist.businessNameMatch ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Permit is valid and not expired</span>
                    {provider.businessPermit.verificationChecklist.permitValid ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Address matches submitted address</span>
                    {provider.businessPermit.verificationChecklist.addressMatch ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Category matches permit scope</span>
                    {provider.businessPermit.verificationChecklist.categoryMatch ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No Business Permit Uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Actions */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Provider Management</h3>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={() => setShowSuspendModal(true)}
              >
                <Ban className="w-4 h-4" />
                Suspend Provider
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeactivateModal(true)}
              >
                <UserX className="w-4 h-4" />
                Deactivate Provider
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/sellers/marketplace")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Service Providers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suspend Confirmation Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-orange-600" />
              Suspend Service Provider
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{provider.businessName}</strong>?
              This action will temporarily disable their account and they will not be able to
              receive new bookings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSuspend}
            >
              Confirm Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Modal */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              Deactivate Service Provider
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate <strong>{provider.businessName}</strong>?
              This is a permanent action and will completely remove their access to the platform.
              All active bookings will be cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Business Permit Enlarge Modal */}
      <Dialog open={showPermitModal} onOpenChange={setShowPermitModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Business Permit - {provider.businessPermit.fileName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={provider.businessPermit.fileUrl}
              alt="Business Permit"
              className="w-full rounded"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
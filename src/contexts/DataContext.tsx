import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  ServiceCategory,
  MarketplaceService,
  ServiceProvider,
  Customer,
  Booking,
  Transaction,
  PayoutRequest,
  Dispute,
  Refund,
  AdminUser,
  AuditLog,
  DashboardStats,
  ProviderEarning,
} from "../types";
import * as dataStore from "../services/dataStore";

interface DataContextType {
  // Data
  serviceCategories: ServiceCategory[];
  services: MarketplaceService[];
  isLoadingServices: boolean;
  serviceProviders: ServiceProvider[];
  isLoadingServiceProviders: boolean;
  customers: Customer[];
  isLoadingCustomers: boolean;
  bookings: Booking[];
  isLoadingBookings: boolean;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  failedPayments: Transaction[];
  isLoadingFailedPayments: boolean;
  payoutRequests: PayoutRequest[];
  isLoadingPayoutRequests: boolean;
  providerEarnings: ProviderEarning[];
  isLoadingProviderEarnings: boolean;
  disputes: Dispute[];
  isLoadingDisputes: boolean;
  refunds: Refund[];
  isLoadingRefunds: boolean;
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];

  // Computed Data
  dashboardStats: DashboardStats;

  // Helper Functions
  getCustomerById: (id: string) => Customer | undefined;
  getProviderById: (id: string) => ServiceProvider | undefined;
  getCategoryById: (id: string) => ServiceCategory | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsByCustomer: (customerId: string) => Booking[];
  getBookingsByProvider: (providerId: string) => Booking[];
  getTransactionsByProvider: (providerId: string) => Transaction[];
  calculateProviderEarnings: (providerId: string) => ProviderEarning;
  fetchServiceCategories: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchServiceProviders: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchCustomerDetails: (customerId: string) => Promise<Customer | null>;
  fetchBookings: () => Promise<void>;
  fetchDisputes: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchFailedPayments: () => Promise<void>;
  fetchPayoutRequests: () => Promise<void>;
  fetchProviderEarnings: () => Promise<void>;
  fetchRefunds: () => Promise<void>;

  // Actions
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => Promise<BookingMutationResult>;
  approveRefund: (refundId: string) => Promise<RefundMutationResult>;
  rejectRefund: (refundId: string, reason: string) => Promise<RefundMutationResult>;
  updateProviderStatus: (providerId: string, status: ServiceProvider["status"]) => Promise<ProviderMutationResult>;
  updateCustomerStatus: (customerId: string, status: Customer["status"]) => Promise<CustomerMutationResult>;
  updateDisputeStatus: (disputeId: string, status: Dispute["status"]) => Promise<DisputeMutationResult>;
  updatePayoutRequestStatus: (payoutId: string, status: PayoutRequest["status"]) => Promise<PayoutMutationResult>;
  approvePayoutRequest: (payoutId: string) => Promise<PayoutMutationResult>;
  updateCommissionRate: (categoryId: string, newRate: number) => void;
  createServiceCategory: (category: CategoryFormData) => Promise<CategoryMutationResult>;
  updateServiceCategory: (categoryId: string, category: CategoryFormData) => Promise<CategoryMutationResult>;
  deleteServiceCategory: (categoryId: string) => Promise<CategoryMutationResult>;
  toggleServiceCategoryStatus: (categoryId: string, status: string) => Promise<CategoryMutationResult>;
  createMarketplaceService: (service: ServiceFormData) => Promise<ServiceMutationResult>;
  updateMarketplaceService: (serviceId: string, service: ServiceFormData) => Promise<ServiceMutationResult>;
  deleteMarketplaceService: (serviceId: string) => Promise<ServiceMutationResult>;
  toggleMarketplaceServiceStatus: (serviceId: string, isActive: boolean) => Promise<ServiceMutationResult>;
  addAuditLog: (action: string, userId: string, details: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface CategoryFormData {
  name: string;
  icon: string;
  description: string;
  status: string;
  sortOrder: string;
}

interface ServiceFormData {
  providerId: string;
  name: string;
  category: string;
  description: string;
  pricingType: string;
  price: string;
  duration: string;
  materials: string;
  status: string;
}

interface CategoryMutationResult {
  success: boolean;
  status?: number;
  error?: string;
  category?: ServiceCategory;
}

interface ServiceMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface ProviderMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface CustomerMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface BookingMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface DisputeMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface PayoutMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface RefundMutationResult {
  success: boolean;
  status?: number;
  error?: string;
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("servease_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeServiceCategory(category: unknown): ServiceCategory | null {
  if (!category || typeof category !== "object") {
    return null;
  }

  const record = category as Record<string, unknown>;
  const id = record.id ?? record.categoryId ?? record.category_id;
  const name = record.name ?? record.categoryName ?? record.category_name;
  const commissionRate = record.commissionRate ?? record.commission_rate ?? 0;
  const status = record.status ?? record.isActive ?? record.is_active;
  const sortOrder = record.sortOrder ?? record.sort_order ?? record.order;
  const servicesCount = record.servicesCount ?? record.services_count ?? record.serviceCount ?? record.service_count;

  if (id == null || name == null) {
    return null;
  }

  return {
    id: String(id),
    providerId: getString(record, ["provider_id", "providerId"]),
    name: String(name),
    commissionRate: Number(commissionRate) || 0,
    icon: record.icon == null ? undefined : String(record.icon),
    description: record.description == null ? undefined : String(record.description),
    status: typeof status === "boolean" ? (status ? "Active" : "Inactive") : status == null ? "Active" : String(status),
    sortOrder: sortOrder == null ? undefined : Number(sortOrder) || undefined,
    servicesCount: servicesCount == null ? undefined : Number(servicesCount) || 0,
  };
}

function normalizeServiceCategoriesResponse(response: unknown): ServiceCategory[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const categories = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.data)
      ? maybeRecord.data
      : Array.isArray(maybeRecord.categories)
        ? maybeRecord.categories
        : [];

  return categories
    .map(normalizeServiceCategory)
    .filter((category): category is ServiceCategory => category !== null);
}

function normalizeCreatedServiceCategoryResponse(response: unknown): ServiceCategory | null {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  return normalizeServiceCategory(response)
    ?? normalizeServiceCategory(maybeRecord.data)
    ?? normalizeServiceCategory(maybeRecord.category);
}

function getNestedRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function getString(record: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    if (!record) {
      continue;
    }

    const value = record[key];
    if (value == null || value === "") {
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const label = (value as Record<string, unknown>).label;
      if (label != null && label !== "") {
        return String(label);
      }
      continue;
    }

    if (value != null && value !== "") {
      return String(value);
    }
  }
  return fallback;
}

const mockMarketplaceServices: MarketplaceService[] = [
  { id: "SRV-001", providerId: "", name: "Plumbing Repair", categoryId: "CAT-001", category: "Home Maintenance & Repair", pricingType: "Fixed", basePrice: 500, isActive: true, status: "Active", lastUpdated: "2026-02-28", duration: "1-2 hours" },
  { id: "SRV-002", providerId: "", name: "Aircon Cleaning", categoryId: "CAT-001", category: "Home Maintenance & Repair", pricingType: "Fixed", basePrice: 800, isActive: true, status: "Active", lastUpdated: "2026-02-27", duration: "2-3 hours" },
  { id: "SRV-003", providerId: "", name: "House Cleaning", categoryId: "CAT-003", category: "Domestic & Cleaning Services", pricingType: "Hourly", basePrice: 250, isActive: true, status: "Active", lastUpdated: "2026-02-26", duration: "Per hour" },
  { id: "SRV-004", providerId: "", name: "Massage Therapy", categoryId: "CAT-002", category: "Beauty, Wellness & Personal Care", pricingType: "Fixed", basePrice: 1200, isActive: true, status: "Active", lastUpdated: "2026-02-25", duration: "1 hour" },
  { id: "SRV-005", providerId: "", name: "Event Photography", categoryId: "CAT-005", category: "Events & Entertainment", pricingType: "Starting at", basePrice: 15000, isActive: true, status: "Active", lastUpdated: "2026-02-24", duration: "4-8 hours" },
  { id: "SRV-006", providerId: "", name: "Dog Grooming", categoryId: "CAT-004", category: "Pet Services", pricingType: "Fixed", basePrice: 600, isActive: true, status: "Active", lastUpdated: "2026-02-23", duration: "1-2 hours" },
  { id: "SRV-007", providerId: "", name: "Car Wash", categoryId: "CAT-006", category: "Automotive & Tech Support", pricingType: "Fixed", basePrice: 300, isActive: true, status: "Active", lastUpdated: "2026-02-22", duration: "30-45 mins" },
  { id: "SRV-008", providerId: "", name: "Tutoring (Math)", categoryId: "CAT-007", category: "Education & Professional Services", pricingType: "Hourly", basePrice: 400, isActive: true, status: "Active", lastUpdated: "2026-02-21", duration: "Per hour" },
];

function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeServiceIsActive(status: unknown, isActive: unknown): boolean {
  if (typeof isActive === "boolean") {
    return isActive;
  }

  const normalized = String(status ?? "active").trim().toLowerCase();
  return !["inactive", "disabled", "false", "0"].includes(normalized);
}

function normalizePricingType(record: Record<string, unknown>): MarketplaceService["pricingType"] {
  const mode = String(record.default_pricing_mode ?? record.defaultPricingMode ?? "").trim().toLowerCase();
  const supportsHourly = Boolean(record.supports_hourly ?? record.supportsHourly);
  const supportsFlat = Boolean(record.supports_flat ?? record.supportsFlat);

  if (mode === "hourly" || (supportsHourly && !supportsFlat)) {
    return "Hourly";
  }
  if (mode === "flat" || mode === "fixed") {
    return "Fixed";
  }
  if (mode === "starting_at" || mode === "starting at") {
    return "Starting at";
  }
  return supportsHourly && !supportsFlat ? "Hourly" : "Fixed";
}

function normalizeMarketplaceService(service: unknown, categories: ServiceCategory[]): MarketplaceService | null {
  if (!service || typeof service !== "object") {
    return null;
  }

  const record = service as Record<string, unknown>;
  const id = record.id ?? record.serviceId ?? record.service_id;
  const name = record.title ?? record.name ?? record.serviceName ?? record.service_name;
  const category = getNestedRecord(record, "service_categories")
    ?? getNestedRecord(record, "serviceCategory")
    ?? getNestedRecord(record, "category");
  const categoryId = getString(record, ["category_id", "categoryId"], category ? getString(category, ["id"]) : "");
  const categoryName = category
    ? getString(category, ["name", "title"], "Uncategorized")
    : categories.find((item) => item.id === categoryId)?.name ?? "Uncategorized";

  if (id == null || name == null) {
    return null;
  }

  const pricingType = normalizePricingType(record);
  const hourlyRate = toNumber(record.hourly_rate ?? record.hourlyRate, 0);
  const flatRate = toNumber(record.flat_rate ?? record.flatRate, 0);
  const price = toNumber(record.price, 0);
  const basePrice = pricingType === "Hourly"
    ? hourlyRate || price
    : flatRate || price || hourlyRate;
  const updatedAt = getString(record, ["updated_at", "updatedAt", "created_at", "createdAt"]);
  const isActive = normalizeServiceIsActive(record.status, record.is_active ?? record.isActive);

  return {
    id: String(id),
    name: String(name),
    description: getString(record, ["description"]),
    categoryId,
    category: categoryName,
    pricingType,
    basePrice,
    hourlyRate: hourlyRate || undefined,
    flatRate: flatRate || undefined,
    isActive,
    status: isActive ? "Active" : "Inactive",
    lastUpdated: updatedAt ? updatedAt.slice(0, 10) : "-",
    duration: getString(record, ["duration", "duration_estimate", "durationEstimate", "estimated_duration", "estimatedDuration"], "-"),
    serviceLocationType: getString(record, ["service_location_type", "serviceLocationType"]),
  };
}

function normalizeMarketplaceServicesResponse(response: unknown, categories: ServiceCategory[]): MarketplaceService[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const services = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.services)
      ? maybeRecord.services
      : Array.isArray(maybeRecord.data)
        ? maybeRecord.data
        : Array.isArray(maybeRecord.results)
          ? maybeRecord.results
          : [];

  return services
    .map((service) => normalizeMarketplaceService(service, categories))
    .filter((service): service is MarketplaceService => service !== null);
}

function getNumber(record: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== "") {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    }
  }
  return fallback;
}

function normalizeCustomerStatus(status: unknown): Customer["status"] {
  const normalized = String(status ?? "active").trim().toLowerCase();
  if (normalized === "suspended" || normalized === "banned") {
    return "Suspended";
  }
  if (normalized === "inactive" || normalized === "disabled") {
    return "Inactive";
  }
  return "Active";
}

function customerStatusToApiStatus(status: Customer["status"]): string {
  return status.toLowerCase();
}

function normalizeCustomer(customer: unknown): Customer | null {
  if (!customer || typeof customer !== "object") {
    return null;
  }

  const record = customer as Record<string, unknown>;
  const user = getNestedRecord(record, "user");
  const profile = getNestedRecord(record, "profile");
  const source = user ?? record;
  const id = getString(source, ["id", "user_id", "userId", "customer_id", "customerId"]);

  if (!id) {
    return null;
  }

  const profileRecord = profile ?? record;
  const name =
    getString(source, ["full_name", "fullName", "name"]) ||
    getString(profileRecord, ["full_name", "fullName", "name"]) ||
    "N/A";
  const email = getString(source, ["email"], getString(record, ["email"]));
  const phone =
    getString(source, ["contact_number", "contactNumber", "phone"]) ||
    getString(profileRecord, ["contact_number", "contactNumber", "phone"]);
  const location =
    getString(profileRecord, ["location", "address", "city", "barangay", "province"]) ||
    getString(record, ["location", "address", "city"], "-");
  const createdAt = getString(source, ["created_at", "createdAt"], getString(record, ["created_at", "createdAt"]));

  return {
    id,
    name,
    email,
    phone,
    location,
    memberSince: createdAt || new Date().toISOString(),
    totalBookings: getNumber(record, ["booking_count", "bookingCount", "totalBookings", "total_bookings"]),
    totalSpent: getNumber(record, ["total_spent", "totalSpent", "amount_spent", "amountSpent"]),
    status: normalizeCustomerStatus(source.status ?? record.status),
  };
}

function normalizeCustomersResponse(response: unknown): Customer[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const customers = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.customers)
      ? maybeRecord.customers
      : Array.isArray(maybeRecord.data)
        ? maybeRecord.data
        : Array.isArray(maybeRecord.results)
          ? maybeRecord.results
          : [];

  return customers
    .map(normalizeCustomer)
    .filter((customer): customer is Customer => customer !== null);
}

function normalizeProviderStatus(status: unknown): ServiceProvider["status"] {
  const normalized = String(status ?? "active").toLowerCase();
  if (normalized === "suspended") {
    return "Suspended";
  }
  if (normalized === "inactive") {
    return "Inactive";
  }
  return "Active";
}

function statusToApiStatus(status: ServiceProvider["status"]): string {
  return status.toLowerCase();
}

function normalizeServiceProvider(provider: unknown): ServiceProvider | null {
  if (!provider || typeof provider !== "object") {
    return null;
  }

  const record = provider as Record<string, unknown>;
  const category = getNestedRecord(record, "category");
  const user = getNestedRecord(record, "user") ?? getNestedRecord(record, "profile") ?? {};
  const id = getString(record, ["id", "providerId", "provider_id", "user_id"]);
  const businessName = getString(record, ["businessName", "business_name", "companyName", "company_name", "name"], id);
  const categoryId = getString(record, ["categoryId", "category_id", "serviceCategoryId", "service_category_id"], category ? getString(category, ["id", "categoryId", "category_id"]) : "");
  const categoryName = getString(record, ["categoryName", "category_name"], category ? getString(category, ["name", "categoryName", "category_name"]) : "");
  const completedBookings = getNumber(record, ["completedBookings", "completed_bookings", "completedBookingCount", "completed_booking_count"]);
  const totalBookings = getNumber(record, ["totalBookings", "total_bookings", "bookingCount", "booking_count", "bookings_count"]);
  const cancelledBookings = getNumber(record, ["cancelledBookings", "cancelled_bookings", "canceledBookings", "canceled_bookings"]);

  if (!id) {
    return null;
  }

  return {
    id,
    businessName,
    categoryId: categoryId || categoryName,
    categoryName: categoryName || undefined,
    contactPerson: getString(record, ["contactPerson", "contact_person", "ownerName", "owner_name", "fullName", "full_name"], getString(user, ["name", "fullName", "full_name"], businessName)),
    email: getString(record, ["email"], getString(user, ["email"])),
    phone: getString(record, ["phone", "phoneNumber", "phone_number", "mobile"], getString(user, ["phone", "phoneNumber", "phone_number", "mobile"])),
    status: normalizeProviderStatus(record.status ?? record.provider_status),
    rating: getNumber(record, ["rating", "averageRating", "average_rating"]),
    totalBookings,
    completedBookings,
    cancelledBookings,
    completionRate: getNumber(record, ["completionRate", "completion_rate"], totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0),
    joinedDate: getString(record, ["joinedDate", "joined_date", "createdAt", "created_at"], new Date().toISOString()),
    location: getString(record, ["location", "address", "city"], "N/A"),
    totalRevenue: getNumber(record, ["totalRevenue", "total_revenue", "revenue"]),
    totalEarnings: getNumber(record, ["totalEarnings", "total_earnings", "earnings"]),
  };
}

function normalizeServiceProvidersResponse(response: unknown): ServiceProvider[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const providers = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.data)
      ? maybeRecord.data
      : Array.isArray(maybeRecord.providers)
        ? maybeRecord.providers
        : Array.isArray(maybeRecord.serviceProviders)
          ? maybeRecord.serviceProviders
          : Array.isArray(maybeRecord.service_providers)
            ? maybeRecord.service_providers
            : [];

  return providers
    .map(normalizeServiceProvider)
    .filter((provider): provider is ServiceProvider => provider !== null);
}

function normalizeBookingStatus(status: unknown): Booking["status"] {
  const normalized = String(status ?? "pending").toLowerCase();
  if (normalized === "confirmed") {
    return "Confirmed";
  }
  if (normalized === "in_progress" || normalized === "in progress" || normalized === "ongoing") {
    return "In Progress";
  }
  if (normalized === "completed" || normalized === "complete") {
    return "Completed";
  }
  if (normalized === "cancelled" || normalized === "canceled") {
    return "Cancelled";
  }
  return "Pending";
}

function bookingStatusToApiStatus(status: Booking["status"]): string {
  if (status === "In Progress") {
    return "in_progress";
  }
  return status.toLowerCase();
}

function normalizePaymentStatus(status: unknown): Booking["paymentStatus"] {
  const normalized = String(status ?? "pending").toLowerCase();
  if (normalized === "paid" || normalized === "succeeded" || normalized === "success") {
    return "Paid";
  }
  if (normalized === "refunded") {
    return "Refunded";
  }
  if (normalized === "failed") {
    return "Failed";
  }
  return "Pending";
}

function normalizePaymentMethod(method: unknown): Booking["paymentMethod"] {
  const normalized = String(method ?? "credit card").toLowerCase();
  return normalized.includes("debit") ? "Debit Card" : "Credit Card";
}

function normalizeTransaction(transaction: unknown): Transaction | null {
  if (!transaction || typeof transaction !== "object") {
    return null;
  }

  const record = transaction as Record<string, unknown>;
  const booking = getNestedRecord(record, "booking");
  const customer = getNestedRecord(record, "customer");
  const provider = getNestedRecord(record, "provider");
  const id = getString(record, ["id", "transactionId", "transaction_id", "paymentId", "payment_id"]);

  if (!id) {
    return null;
  }

  const amount = getNumber(record, ["amount", "totalAmount", "total_amount", "grossAmount", "gross_amount"]);
  const commissionAmount = getNumber(record, ["commissionAmount", "commission_amount", "platformCommission", "platform_commission", "fee"]);

  return {
    id,
    bookingId: getString(record, ["bookingId", "booking_id"], booking ? getString(booking, ["id", "bookingId", "booking_id"]) : ""),
    customerId: getString(record, ["customerId", "customer_id"], customer ? getString(customer, ["id", "customerId", "customer_id"]) : ""),
    providerId: getString(record, ["providerId", "provider_id"], provider ? getString(provider, ["id", "providerId", "provider_id"]) : ""),
    amount,
    commissionAmount,
    providerEarnings: getNumber(record, ["providerEarnings", "provider_earnings", "netAmount", "net_amount"], amount - commissionAmount),
    paymentMethod: normalizePaymentMethod(record.paymentMethod ?? record.payment_method ?? record.method),
    paymentStatus: normalizePaymentStatus(record.paymentStatus ?? record.payment_status ?? record.status),
    timestamp: getString(record, ["timestamp", "paidAt", "paid_at", "createdAt", "created_at"], new Date().toISOString()),
  };
}

function normalizeTransactionsResponse(response: unknown): Transaction[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const transactions = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.data)
      ? maybeRecord.data
      : Array.isArray(maybeRecord.transactions)
        ? maybeRecord.transactions
        : Array.isArray(maybeRecord.results)
          ? maybeRecord.results
          : [];

  return transactions
    .map(normalizeTransaction)
    .filter((transaction): transaction is Transaction => transaction !== null);
}

function normalizeFailedPaymentsResponse(response: unknown): Transaction[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const payments = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.payments)
      ? maybeRecord.payments
      : Array.isArray(maybeRecord.data)
        ? maybeRecord.data
        : Array.isArray(maybeRecord.transactions)
          ? maybeRecord.transactions
          : Array.isArray(maybeRecord.results)
            ? maybeRecord.results
            : [];

  return payments
    .map(normalizeTransaction)
    .filter((payment): payment is Transaction => payment !== null)
    .map((payment) => ({ ...payment, paymentStatus: "Failed" }));
}

function normalizePayoutStatus(status: unknown): PayoutRequest["status"] {
  const normalized = String(status ?? "pending").trim().toLowerCase();
  if (normalized === "pending") {
    return "Pending";
  }
  if (normalized === "processing" || normalized === "approved") {
    return "Approved";
  }
  if (normalized === "failed" || normalized === "rejected" || normalized === "declined") {
    return "Rejected";
  }
  if (normalized === "completed" || normalized === "complete" || normalized === "released" || normalized === "paid") {
    return "Released";
  }
  return "Pending";
}

function payoutStatusToApiStatus(status: PayoutRequest["status"]): string {
  const statusByUiValue: Record<PayoutRequest["status"], string> = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
    Released: "released",
  };
  return statusByUiValue[status];
}

function normalizePayoutRequest(payout: unknown): PayoutRequest | null {
  if (!payout || typeof payout !== "object") {
    return null;
  }

  const record = payout as Record<string, unknown>;
  const provider = getNestedRecord(record, "provider");
  const bankDetails = getNestedRecord(record, "bankDetails")
    ?? getNestedRecord(record, "bank_details")
    ?? getNestedRecord(record, "bankAccount")
    ?? getNestedRecord(record, "bank_account")
    ?? getNestedRecord(record, "payoutDetails")
    ?? getNestedRecord(record, "payout_details")
    ?? {};
  const id = getString(record, ["id", "payoutId", "payout_id", "requestId", "request_id"]);

  if (!id) {
    return null;
  }

  return {
    id,
    providerId: getString(
      record,
      ["providerId", "provider_id", "providerUserId", "provider_user_id", "userId", "user_id"],
      provider ? getString(provider, ["id", "providerId", "provider_id", "userId", "user_id"]) : ""
    ),
    providerName: getString(
      record,
      ["providerName", "provider_name", "businessName", "business_name"],
      provider ? getString(provider, ["businessName", "business_name", "fullName", "full_name", "name"]) : ""
    ) || undefined,
    providerEmail: getString(record, ["providerEmail", "provider_email"], provider ? getString(provider, ["email"]) : "") || undefined,
    amount: getNumber(record, [
      "netAmount",
      "net_amount",
      "totalEarning",
      "total_earning",
      "amount",
      "requestedAmount",
      "requested_amount",
      "amountRequested",
      "amount_requested",
      "payoutAmount",
      "payout_amount",
      "providerEarnings",
      "provider_earnings",
      "totalAmount",
      "total_amount",
      "availableAmount",
      "available_amount",
      "payableAmount",
      "payable_amount",
      "withdrawalAmount",
      "withdrawal_amount",
    ]),
    status: normalizePayoutStatus(record.db_status ?? record.status),
    requestedDate: getString(record, ["requestedDate", "requested_date", "createdAt", "created_at"], new Date().toISOString()),
    processedDate: getString(record, ["processedDate", "processed_date", "processedAt", "processed_at", "updatedAt", "updated_at"]) || undefined,
    bankDetails: {
      accountName: getString(
        record,
        ["accountName", "account_name", "accountHolderName", "account_holder_name", "bankAccountName", "bank_account_name"],
        getString(bankDetails, ["accountName", "account_name", "accountHolderName", "account_holder_name", "name"])
      ),
      accountNumber: getString(
        record,
        ["accountNumber", "account_number", "bankAccountNumber", "bank_account_number", "accountLast4", "account_last4"],
        getString(bankDetails, ["accountNumber", "account_number", "number", "last4", "accountLast4", "account_last4"])
      ),
      bankName: getString(
        record,
        ["bankName", "bank_name", "bankCode", "bank_code", "payoutMethod", "payout_method"],
        getString(bankDetails, ["bankName", "bank_name", "bankCode", "bank_code", "method", "type", "name"])
      ),
    },
  };
}

function normalizePayoutRequestsResponse(response: unknown): PayoutRequest[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const payouts = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.data)
      ? maybeRecord.data
      : Array.isArray(maybeRecord.payouts)
        ? maybeRecord.payouts
        : Array.isArray(maybeRecord.payoutRequests)
          ? maybeRecord.payoutRequests
          : Array.isArray(maybeRecord.payout_requests)
            ? maybeRecord.payout_requests
            : Array.isArray(maybeRecord.results)
              ? maybeRecord.results
              : [];

  const normalized = payouts
    .map(normalizePayoutRequest)
    .filter((payout): payout is PayoutRequest => payout !== null);

  console.log("[finance payouts] raw payout statuses", payouts.map((payout) => {
    const record = payout && typeof payout === "object" ? payout as Record<string, unknown> : {};
    return {
      id: record.payout_id ?? record.id,
      status: record.status,
      db_status: record.db_status,
    };
  }));
  console.log("[finance payouts] normalized payout statuses", normalized.map((payout) => ({
    id: payout.id,
    status: payout.status,
  })));

  return normalized;
}

function normalizeUpdatedPayoutResponse(response: unknown): PayoutRequest | null {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  return normalizePayoutRequest(maybeRecord.payout)
    ?? normalizePayoutRequest(maybeRecord.data)
    ?? normalizePayoutRequest(response);
}

function normalizeProviderEarningsResponse(response: unknown): ProviderEarning[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const payments = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.payments)
      ? maybeRecord.payments
      : Array.isArray(maybeRecord.data)
        ? maybeRecord.data
        : Array.isArray(maybeRecord.earnings)
          ? maybeRecord.earnings
          : Array.isArray(maybeRecord.results)
            ? maybeRecord.results
            : [];

  const earningsByProvider = new Map<string, ProviderEarning>();

  payments.forEach((payment) => {
    if (!payment || typeof payment !== "object") {
      return;
    }

    const record = payment as Record<string, unknown>;
    const provider = getNestedRecord(record, "provider");
    const providerId = getString(
      record,
      ["providerId", "provider_id"],
      provider ? getString(provider, ["id", "providerId", "provider_id"]) : ""
    );

    if (!providerId) {
      return;
    }

    const providerEarnings = getNumber(record, ["providerEarnings", "provider_earnings", "netAmount", "net_amount"]);
    const commissionAmount = getNumber(record, ["commissionAmount", "commission_amount"]);
    const paidAt = getString(record, ["paidAt", "paid_at"]);
    const paymentStatus = String(record.paymentStatus ?? record.payment_status ?? record.status ?? "").trim().toLowerCase();
    const existing = earningsByProvider.get(providerId);
    const current: ProviderEarning = existing ?? {
      providerId,
      providerName: getString(
        record,
        ["providerName", "provider_name"],
        provider ? getString(provider, ["businessName", "business_name", "fullName", "full_name", "name"]) : ""
      ) || providerId,
      providerEmail: getString(record, ["providerEmail", "provider_email"], provider ? getString(provider, ["email"]) : "") || undefined,
      categoryId: getString(record, ["categoryId", "category_id"]),
      categoryName: getString(record, ["categoryName", "category_name"]) || undefined,
      totalEarnings: 0,
      totalCommission: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      totalBookings: 0,
      completedBookings: 0,
    };

    current.totalEarnings += providerEarnings;
    current.totalCommission = (current.totalCommission ?? 0) + commissionAmount;
    current.totalBookings += 1;
    current.completedBookings += 1;

    if (paidAt || (!("paid_at" in record) && !("paidAt" in record) && ["paid", "completed", "success", "succeeded"].includes(paymentStatus))) {
      current.paidEarnings += providerEarnings;
    } else {
      current.pendingEarnings += providerEarnings;
    }

    earningsByProvider.set(providerId, current);
  });

  return Array.from(earningsByProvider.values());
}

function mockProviderEarnings(): ProviderEarning[] {
  return dataStore.serviceProviders.map((provider) => ({
    ...dataStore.calculateProviderEarnings(provider.id),
    providerName: provider.businessName,
    providerEmail: provider.email,
    categoryId: provider.categoryId,
    categoryName: provider.categoryName,
  }));
}

function normalizeRefundStatus(status: unknown): Refund["status"] {
  const normalized = String(status ?? "pending").trim().toLowerCase();
  if (normalized === "processed" || normalized === "refunded") {
    return "Processed";
  }
  if (normalized === "failed" || normalized === "rejected") {
    return "Rejected";
  }
  return "Pending";
}

function normalizeRefund(refund: unknown): Refund | null {
  if (!refund || typeof refund !== "object") {
    return null;
  }

  const record = refund as Record<string, unknown>;
  const customer = getNestedRecord(record, "customer");
  const booking = getNestedRecord(record, "booking");
  const id = getString(record, ["id", "refundId", "refund_id", "paymentId", "payment_id"]);

  if (!id) {
    return null;
  }

  return {
    id,
    bookingId: getString(
      record,
      ["bookingPublicId", "booking_public_id", "bookingId", "booking_id"],
      booking ? getString(booking, ["id", "bookingId", "booking_id", "booking_reference"]) : ""
    ),
    customerId: getString(
      record,
      ["customerId", "customer_id"],
      customer ? getString(customer, ["id", "customerId", "customer_id"]) : ""
    ),
    customerName: getString(record, ["customerName", "customer_name"], customer ? getString(customer, ["name", "fullName", "full_name"]) : "") || undefined,
    customerEmail: getString(record, ["customerEmail", "customer_email"], customer ? getString(customer, ["email"]) : "") || undefined,
    amount: getNumber(record, ["amount", "refundAmount", "refund_amount"]),
    reason: getString(record, ["reason", "refundReason", "refund_reason"], "Refund requested"),
    status: normalizeRefundStatus(record.refund_status ?? record.status),
    requestedDate: getString(record, ["requestedDate", "requested_date", "createdAt", "created_at"], new Date().toISOString()),
    processedDate: getString(record, ["processedDate", "processed_date", "processedAt", "processed_at", "updatedAt", "updated_at"]) || undefined,
  };
}

function normalizeRefundsResponse(response: unknown): Refund[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const refunds = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.payments)
      ? maybeRecord.payments
      : Array.isArray(maybeRecord.refunds)
        ? maybeRecord.refunds
        : Array.isArray(maybeRecord.data)
          ? maybeRecord.data
          : Array.isArray(maybeRecord.results)
            ? maybeRecord.results
            : [];

  return refunds
    .map(normalizeRefund)
    .filter((refund): refund is Refund => refund !== null);
}

function normalizeBooking(booking: unknown): Booking | null {
  if (!booking || typeof booking !== "object") {
    return null;
  }

  const record = booking as Record<string, unknown>;
  const customer = getNestedRecord(record, "customer");
  const provider = getNestedRecord(record, "provider");
  const category = getNestedRecord(record, "category")
    ?? getNestedRecord(record, "serviceCategory")
    ?? getNestedRecord(record, "service_category")
    ?? getNestedRecord(record, "marketplaceCategory")
    ?? getNestedRecord(record, "marketplace_category");
  const service = getNestedRecord(record, "service");
  const address = getNestedRecord(record, "address");
  const location = getNestedRecord(record, "location");
  const id = getString(record, ["id", "bookingId", "booking_id"]);

  if (!id) {
    return null;
  }

  const amount = getNumber(record, ["amount", "totalAmount", "total_amount", "price"]);
  const commissionAmount = getNumber(record, ["commissionAmount", "commission_amount"]);

  return {
    id,
    customerId: getString(record, ["customerId", "customer_id"], customer ? getString(customer, ["id", "customerId", "customer_id"]) : ""),
    customerName: customer ? getString(customer, ["name", "fullName", "full_name"]) : getString(record, ["customerName", "customer_name"]),
    customerEmail: customer ? getString(customer, ["email"]) : getString(record, ["customerEmail", "customer_email"]),
    providerId: getString(record, ["providerId", "provider_id"], provider ? getString(provider, ["id", "providerId", "provider_id"]) : ""),
    providerName: provider ? getString(provider, ["businessName", "business_name", "name"]) : getString(record, ["providerName", "provider_name"]),
    categoryId: getString(record, ["categoryId", "category_id", "serviceCategoryId", "service_category_id", "marketplaceCategoryId", "marketplace_category_id"], category ? getString(category, ["id", "categoryId", "category_id"]) : ""),
    categoryName: category
      ? getString(category, ["name", "categoryName", "category_name", "title"])
      : getString(record, ["categoryName", "category_name", "serviceCategoryName", "service_category_name", "marketplaceCategoryName", "marketplace_category_name"]),
    serviceDescription: getString(record, ["serviceDescription", "service_description", "description", "serviceName", "service_name", "title"], service ? getString(service, ["name", "title"]) : "Service booking"),
    scheduledDate: getString(record, ["scheduledDate", "scheduled_date", "scheduledAt", "scheduled_at", "startTime", "start_time"], new Date().toISOString()),
    completedDate: getString(record, ["completedDate", "completed_date", "completedAt", "completed_at"]) || undefined,
    amount,
    commissionAmount,
    providerEarnings: getNumber(record, ["providerEarnings", "provider_earnings"], amount - commissionAmount),
    status: normalizeBookingStatus(record.status),
    paymentStatus: normalizePaymentStatus(record.paymentStatus ?? record.payment_status),
    paymentMethod: normalizePaymentMethod(record.paymentMethod ?? record.payment_method),
    location: getString(
      record,
      ["location", "address", "city", "serviceLocation", "service_location"],
      getString(address, ["label", "fullAddress", "full_address", "address", "city"], getString(location, ["label", "fullAddress", "full_address", "address", "city"], "N/A"))
    ),
    createdAt: getString(record, ["createdAt", "created_at"], new Date().toISOString()),
  };
}

function normalizeBookingsResponse(response: unknown): Booking[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const bookings = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.data)
      ? maybeRecord.data
      : Array.isArray(maybeRecord.bookings)
        ? maybeRecord.bookings
        : Array.isArray(maybeRecord.results)
          ? maybeRecord.results
          : [];

  return bookings
    .map(normalizeBooking)
    .filter((booking): booking is Booking => booking !== null);
}

function normalizeDisputeStatus(status: unknown): Dispute["status"] {
  const normalized = String(status ?? "open").toLowerCase();
  if (normalized === "under_review" || normalized === "under review" || normalized === "investigating") {
    return "Investigating";
  }
  if (normalized === "resolved") {
    return "Resolved";
  }
  if (normalized === "escalated") {
    return "Escalated";
  }
  if (normalized === "closed") {
    return "Closed";
  }
  return "Open";
}

function disputeStatusToApiStatus(status: Dispute["status"]): string {
  if (status === "Under Review" || status === "Investigating") {
    return "under_review";
  }
  return status.toLowerCase();
}

function normalizeDisputePriority(priority: unknown): string {
  const normalized = String(priority ?? "medium").toLowerCase();
  if (normalized === "high") {
    return "High";
  }
  if (normalized === "low") {
    return "Low";
  }
  return "Medium";
}

function normalizeDispute(dispute: unknown): Dispute | null {
  if (!dispute || typeof dispute !== "object") {
    return null;
  }

  const record = dispute as Record<string, unknown>;
  const customer = getNestedRecord(record, "customer");
  const provider = getNestedRecord(record, "provider");
  const booking = getNestedRecord(record, "booking");
  const id = getString(record, ["id", "disputeId", "dispute_id"]);

  if (!id) {
    return null;
  }

  return {
    id,
    bookingId: getString(record, ["bookingId", "booking_id"], booking ? getString(booking, ["id", "bookingId", "booking_id"]) : ""),
    customerId: getString(record, ["customerId", "customer_id"], customer ? getString(customer, ["id", "customerId", "customer_id"]) : ""),
    customerName: customer ? getString(customer, ["name", "fullName", "full_name"]) : getString(record, ["customerName", "customer_name"]),
    providerId: getString(record, ["providerId", "provider_id"], provider ? getString(provider, ["id", "providerId", "provider_id"]) : ""),
    providerName: provider ? getString(provider, ["businessName", "business_name", "name"]) : getString(record, ["providerName", "provider_name"]),
    reason: getString(record, ["reason", "title", "category"], "Dispute"),
    description: getString(record, ["description", "details", "message"], ""),
    amount: getNumber(record, ["amount", "disputedAmount", "disputed_amount", "refundAmount", "refund_amount"]),
    status: normalizeDisputeStatus(record.status),
    priority: normalizeDisputePriority(record.priority),
    createdAt: getString(record, ["createdAt", "created_at", "filedAt", "filed_at"], new Date().toISOString()),
    resolvedAt: getString(record, ["resolvedAt", "resolved_at"]) || undefined,
    resolution: getString(record, ["resolution", "resolutionNotes", "resolution_notes"]) || undefined,
    refundAmount: getNumber(record, ["refundAmount", "refund_amount"]) || undefined,
  };
}

function normalizeDisputesResponse(response: unknown): Dispute[] {
  const maybeRecord = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const disputes = Array.isArray(response)
    ? response
    : Array.isArray(maybeRecord.data)
      ? maybeRecord.data
      : Array.isArray(maybeRecord.disputes)
        ? maybeRecord.disputes
        : Array.isArray(maybeRecord.results)
          ? maybeRecord.results
          : [];

  return disputes
    .map(normalizeDispute)
    .filter((dispute): dispute is Dispute => dispute !== null);
}

function categoryPayload(category: CategoryFormData) {
  return {
    name: category.name,
    icon: category.icon,
    description: category.description,
    status: category.status,
    sortOrder: category.sortOrder ? Number(category.sortOrder) : undefined,
  };
}

function findCategoryId(categoryNameOrId: string, categories: ServiceCategory[]): string {
  return categories.find((category) => category.id === categoryNameOrId || category.name === categoryNameOrId)?.id
    ?? categoryNameOrId;
}

function servicePayload(service: ServiceFormData, categories: ServiceCategory[]) {
  const price = Number(service.price) || 0;
  const categoryId = findCategoryId(service.category, categories);
  const pricingType = service.pricingType.toLowerCase();
  const supportsHourly = pricingType === "hourly";
  const supportsFlat = pricingType !== "hourly";

  return {
    title: service.name,
    description: service.description,
    category_id: categoryId,
    price,
    supports_hourly: supportsHourly,
    hourly_rate: supportsHourly ? price : null,
    supports_flat: supportsFlat,
    flat_rate: supportsFlat ? price : null,
    default_pricing_mode: supportsHourly ? "hourly" : "flat",
  };
}

function createServicePayload(service: ServiceFormData, categories: ServiceCategory[]) {
  return {
    provider_id: service.providerId,
    category_id: findCategoryId(service.category, categories),
    title: service.name.trim(),
    description: service.description,
    price: Number(service.price),
    is_active: service.status === "Active",
  };
}

function applyCategoryFormData(category: ServiceCategory, formData: CategoryFormData): ServiceCategory {
  return {
    ...category,
    name: formData.name,
    icon: formData.icon,
    description: formData.description,
    status: formData.status,
    sortOrder: formData.sortOrder ? Number(formData.sortOrder) : undefined,
  };
}

async function getApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  const record = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const nested = record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : {};
  const message = record.message ?? record.error ?? nested.message ?? nested.error;
  return typeof message === "string" && message ? message : fallback;
}

function failedCategoryResult(error: unknown, fallback: string): CategoryMutationResult {
  return {
    success: false,
    status: error instanceof Error && "status" in error
      ? Number((error as Error & { status: unknown }).status)
      : undefined,
    error: error instanceof Error && error.message ? error.message : fallback,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [isLoadingServiceProviders, setIsLoadingServiceProviders] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [failedPayments, setFailedPayments] = useState<Transaction[]>([]);
  const [isLoadingFailedPayments, setIsLoadingFailedPayments] = useState(true);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoadingPayoutRequests, setIsLoadingPayoutRequests] = useState(true);
  const [providerEarnings, setProviderEarnings] = useState<ProviderEarning[]>([]);
  const [isLoadingProviderEarnings, setIsLoadingProviderEarnings] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(true);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoadingRefunds, setIsLoadingRefunds] = useState(true);
  const [adminUsers] = useState<AdminUser[]>(dataStore.adminUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(dataStore.auditLogs);

  const fetchServiceCategories = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const categoriesUrl = `${apiBaseUrl}/api/admin/v1/marketplace/categories`;

    try {
      const response = await fetch(categoriesUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      setServiceCategories(normalizeServiceCategoriesResponse(await response.json()));
    } catch (error) {
      console.warn("Categories could not be loaded.", error);
      alert("Categories could not be loaded. Please try again.");
      setServiceCategories([]);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const servicesUrl = `${apiBaseUrl}/api/admin/v1/marketplace/services?page=1&limit=1000`;

    setIsLoadingServices(true);
    try {
      const response = await fetch(servicesUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      }

      setServices(normalizeMarketplaceServicesResponse(await response.json(), serviceCategories));
    } catch (error) {
      console.warn("Services could not be loaded.", error);
      alert("Services could not be loaded. Please try again.");
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  const fetchDisputes = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const disputesUrl = `${apiBaseUrl}/api/admin/v1/operations/disputes`;

    setIsLoadingDisputes(true);
    try {
      const response = await fetch(disputesUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch disputes: ${response.status} ${response.statusText}`);
      }

      setDisputes(normalizeDisputesResponse(await response.json()));
    } catch (error) {
      console.warn("Disputes could not be loaded.", error);
      alert("Disputes could not be loaded. Please try again.");
      setDisputes([]);
    } finally {
      setIsLoadingDisputes(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const bookingsUrl = `${apiBaseUrl}/api/admin/v1/operations/bookings`;

    setIsLoadingBookings(true);
    try {
      const response = await fetch(bookingsUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }

      setBookings(normalizeBookingsResponse(await response.json()));
    } catch (error) {
      console.warn("Bookings could not be loaded.", error);
      alert("Bookings could not be loaded. Please try again.");
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  const fetchServiceProviders = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const providersUrl = `${apiBaseUrl}/api/admin/v1/users/providers`;

    setIsLoadingServiceProviders(true);
    try {
      const response = await fetch(providersUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service providers: ${response.status} ${response.statusText}`);
      }

      setServiceProviders(normalizeServiceProvidersResponse(await response.json()));
    } catch (error) {
      console.warn("Service providers could not be loaded.", error);
      alert("Service providers could not be loaded. Please try again.");
      setServiceProviders([]);
    } finally {
      setIsLoadingServiceProviders(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const customersUrl = `${apiBaseUrl}/api/admin/v1/users/customers?page=1&limit=1000`;

    setIsLoadingCustomers(true);
    try {
      const response = await fetch(customersUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
      }

      setCustomers(normalizeCustomersResponse(await response.json()));
    } catch (error) {
      console.warn("Customers could not be loaded.", error);
      alert("Customers could not be loaded. Please try again.");
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  const fetchCustomerDetails = useCallback(async (customerId: string): Promise<Customer | null> => {
    const apiBaseUrl = getApiBaseUrl();
    const customerUrl = `${apiBaseUrl}/api/admin/v1/users/customers/${encodeURIComponent(customerId)}`;

    try {
      const response = await fetch(customerUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customer details: ${response.status} ${response.statusText}`);
      }

      return normalizeCustomer(await response.json());
    } catch (error) {
      console.warn("Customer details could not be loaded. Using row data instead.", error);
      alert("Customer details could not be loaded. Showing available row data instead.");
      return customers.find((customer) => customer.id === customerId) ?? null;
    }
  }, [customers]);

  const fetchTransactions = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const transactionsUrl = `${apiBaseUrl}/api/admin/v1/finance/transactions`;

    setIsLoadingTransactions(true);
    try {
      const response = await fetch(transactionsUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }

      setTransactions(normalizeTransactionsResponse(await response.json()));
    } catch (error) {
      console.warn("Transactions could not be loaded.", error);
      alert("Transactions could not be loaded. Please try again.");
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  const fetchFailedPayments = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const failedPaymentsUrl = `${apiBaseUrl}/api/admin/v1/finance/failed?page=1&limit=1000`;

    setIsLoadingFailedPayments(true);
    try {
      const response = await fetch(failedPaymentsUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch failed payments: ${response.status} ${response.statusText}`);
      }

      setFailedPayments(normalizeFailedPaymentsResponse(await response.json()));
    } catch (error) {
      console.warn("Failed payments could not be loaded. Keeping failed payments empty.", error);
      alert("Failed payments could not be loaded. Please try again.");
      setFailedPayments([]);
    } finally {
      setIsLoadingFailedPayments(false);
    }
  }, []);

  const fetchPayoutRequests = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const payoutsUrl = `${apiBaseUrl}/api/admin/v1/finance/payouts?page=1&limit=1000`;

    setIsLoadingPayoutRequests(true);
    try {
      const response = await fetch(payoutsUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payouts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[finance payouts] raw response", data);
      setPayoutRequests(normalizePayoutRequestsResponse(data));
    } catch (error) {
      console.warn("Payout requests could not be loaded.", error);
      alert("Payout requests could not be loaded. Please try again.");
      setPayoutRequests([]);
    } finally {
      setIsLoadingPayoutRequests(false);
    }
  }, []);

  const fetchProviderEarnings = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const earningsUrl = `${apiBaseUrl}/api/admin/v1/finance/earnings?page=1&limit=1000`;

    setIsLoadingProviderEarnings(true);
    try {
      const response = await fetch(earningsUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch provider earnings: ${response.status} ${response.statusText}`);
      }

      setProviderEarnings(normalizeProviderEarningsResponse(await response.json()));
    } catch (error) {
      console.warn("Provider earnings could not be loaded.", error);
      alert("Provider earnings could not be loaded. Please try again.");
      setProviderEarnings([]);
    } finally {
      setIsLoadingProviderEarnings(false);
    }
  }, []);

  const fetchRefunds = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    const refundsUrl = `${apiBaseUrl}/api/admin/v1/finance/refunds?page=1&limit=1000`;

    setIsLoadingRefunds(true);
    try {
      const response = await fetch(refundsUrl, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch refunds: ${response.status} ${response.statusText}`);
      }

      setRefunds(normalizeRefundsResponse(await response.json()));
    } catch (error) {
      console.warn("Refunds could not be loaded.", error);
      alert("Refunds could not be loaded. Please try again.");
      setRefunds([]);
    } finally {
      setIsLoadingRefunds(false);
    }
  }, []);

  const createServiceCategory = useCallback(async (category: CategoryFormData): Promise<CategoryMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const categoriesUrl = `${apiBaseUrl}/api/admin/v1/marketplace/categories`;

    try {
      const response = await fetch(categoriesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(categoryPayload(category)),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Category could not be created."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      const data = await response.json();
      const createdCategory = normalizeCreatedServiceCategoryResponse(data);

      if (!createdCategory) {
        throw new Error("Create category response did not include a usable category.");
      }

      setServiceCategories((prev) => [...prev, createdCategory]);
      return { success: true, category: createdCategory };
    } catch (error) {
      console.warn("Category create failed. Keeping current categories unchanged.", error);
      return failedCategoryResult(error, "Category could not be created.");
    }
  }, []);

  const updateServiceCategory = useCallback(async (
    categoryId: string,
    category: CategoryFormData
  ): Promise<CategoryMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const categoryUrl = `${apiBaseUrl}/api/admin/v1/marketplace/categories/${encodeURIComponent(categoryId)}`;

    try {
      const response = await fetch(categoryUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(categoryPayload(category)),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Category could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      const data = await response.json();
      const updatedCategory = normalizeCreatedServiceCategoryResponse(data);

      setServiceCategories((prev) =>
        prev.map((item) =>
          item.id === categoryId
            ? updatedCategory ?? applyCategoryFormData(item, category)
            : item
        )
      );
      return { success: true, category: updatedCategory };
    } catch (error) {
      console.warn("Category update failed. Keeping current categories unchanged.", error);
      return failedCategoryResult(error, "Category could not be updated.");
    }
  }, []);

  const deleteServiceCategory = useCallback(async (categoryId: string): Promise<CategoryMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const categoryUrl = `${apiBaseUrl}/api/admin/v1/marketplace/categories/${encodeURIComponent(categoryId)}`;

    try {
      const response = await fetch(categoryUrl, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Category could not be deleted."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setServiceCategories((prev) => prev.filter((item) => item.id !== categoryId));
      return { success: true };
    } catch (error) {
      console.warn("Category delete failed. Keeping current categories unchanged.", error);
      return failedCategoryResult(error, "Category could not be deleted.");
    }
  }, []);

  const toggleServiceCategoryStatus = useCallback(async (
    categoryId: string,
    status: string
  ): Promise<CategoryMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const categoryUrl = `${apiBaseUrl}/api/admin/v1/marketplace/categories/${encodeURIComponent(categoryId)}`;

    try {
      const response = await fetch(categoryUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Category status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      const data = await response.json();
      const updatedCategory = normalizeCreatedServiceCategoryResponse(data);

      setServiceCategories((prev) =>
        prev.map((item) =>
          item.id === categoryId
            ? updatedCategory ?? { ...item, status }
            : item
        )
      );
      return { success: true, category: updatedCategory };
    } catch (error) {
      console.warn("Category status update failed. Keeping current categories unchanged.", error);
      return failedCategoryResult(error, "Category status could not be updated.");
    }
  }, []);

  const createMarketplaceService = useCallback(async (
    service: ServiceFormData
  ): Promise<ServiceMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const servicesUrl = `${apiBaseUrl}/api/admin/v1/marketplace/services`;

    try {
      const response = await fetch(servicesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(createServicePayload(service, serviceCategories)),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Service could not be created."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      await fetchServices();
      return { success: true };
    } catch (error) {
      console.warn("Service create failed. Keeping current services unchanged.", error);
      alert("Service could not be created. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Service could not be created.",
      };
    }
  }, [fetchServices, serviceCategories]);

  const updateMarketplaceService = useCallback(async (
    serviceId: string,
    service: ServiceFormData
  ): Promise<ServiceMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const serviceUrl = `${apiBaseUrl}/api/admin/v1/marketplace/services/${encodeURIComponent(serviceId)}`;

    try {
      const response = await fetch(serviceUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...servicePayload(service, serviceCategories),
          is_active: service.status === "Active",
        }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Service could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      const categoryId = findCategoryId(service.category, serviceCategories);
      const categoryName = serviceCategories.find((category) => category.id === categoryId)?.name ?? service.category;
      setServices((prev) =>
        prev.map((item) =>
          item.id === serviceId
            ? {
                ...item,
                name: service.name,
                description: service.description,
                categoryId,
                category: categoryName,
                pricingType: service.pricingType,
                basePrice: Number(service.price) || 0,
                hourlyRate: service.pricingType === "Hourly" ? Number(service.price) || 0 : undefined,
                flatRate: service.pricingType !== "Hourly" ? Number(service.price) || 0 : undefined,
                isActive: service.status === "Active",
                status: service.status,
              }
            : item
        )
      );
      return { success: true };
    } catch (error) {
      console.warn("Service update failed. Keeping current services unchanged.", error);
      alert("Service could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Service could not be updated.",
      };
    }
  }, [serviceCategories]);

  const deleteMarketplaceService = useCallback(async (serviceId: string): Promise<ServiceMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const serviceUrl = `${apiBaseUrl}/api/admin/v1/marketplace/services/${encodeURIComponent(serviceId)}`;

    try {
      const response = await fetch(serviceUrl, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Service could not be deleted."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setServices((prev) => prev.filter((item) => item.id !== serviceId));
      return { success: true };
    } catch (error) {
      console.warn("Service delete failed. Keeping current services unchanged.", error);
      alert("Service could not be deleted. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Service could not be deleted.",
      };
    }
  }, []);

  const toggleMarketplaceServiceStatus = useCallback(async (
    serviceId: string,
    isActive: boolean
  ): Promise<ServiceMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const serviceUrl = `${apiBaseUrl}/api/admin/v1/marketplace/services/${encodeURIComponent(serviceId)}`;

    try {
      const response = await fetch(serviceUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Service status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setServices((prev) =>
        prev.map((item) =>
          item.id === serviceId
            ? { ...item, isActive, status: isActive ? "Active" : "Inactive" }
            : item
        )
      );
      return { success: true };
    } catch (error) {
      console.warn("Service status update failed. Keeping current services unchanged.", error);
      alert("Service status could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Service status could not be updated.",
      };
    }
  }, []);

  // Calculate Dashboard Stats
  const dashboardStats: DashboardStats = {
    totalRevenue: dataStore.calculateTotalRevenue(),
    totalBookings: bookings.length,
    activeProviders: serviceProviders.filter((p) => p.status === "Active").length,
    activeCustomers: customers.filter((c) => c.status === "Active").length,
    completionRate: dataStore.calculateCompletionRate(),
    avgBookingValue:
      bookings.length > 0
        ? bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length
        : 0,
  };

  // Update Booking Status
  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: Booking["status"]
  ): Promise<BookingMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const bookingStatusUrl = `${apiBaseUrl}/api/admin/v1/operations/bookings/${encodeURIComponent(bookingId)}/status`;

    try {
      const response = await fetch(bookingStatusUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: bookingStatusToApiStatus(status) }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Booking status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
                completedDate: status === "Completed" ? new Date().toISOString() : booking.completedDate,
              }
            : booking
        )
      );
      return { success: true };
    } catch (error) {
      console.warn("Booking status update failed. Keeping current bookings unchanged.", error);
      alert("Booking status could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Booking status could not be updated.",
      };
    }
  }, []);

  // Approve Refund
  const approveRefund = useCallback(async (refundId: string): Promise<RefundMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const refundUrl = `${apiBaseUrl}/api/admin/v1/finance/refunds/${encodeURIComponent(refundId)}`;

    try {
      const response = await fetch(refundUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: "refunded" }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Refund could not be processed."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      await fetchRefunds();
      return { success: true };
    } catch (error) {
      console.warn("Refund process failed. Keeping current refunds unchanged.", error);
      alert("Refund could not be processed. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Refund could not be processed.",
      };
    }
  }, [fetchRefunds]);

  // Reject Refund
  const rejectRefund = useCallback(async (
    refundId: string,
    reason: string
  ): Promise<RefundMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const refundUrl = `${apiBaseUrl}/api/admin/v1/finance/refunds/${encodeURIComponent(refundId)}`;

    try {
      const response = await fetch(refundUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: "rejected", reject_reason: reason }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Refund could not be rejected."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      await fetchRefunds();
      return { success: true };
    } catch (error) {
      console.warn("Refund reject failed. Keeping current refunds unchanged.", error);
      alert("Refund could not be rejected. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Refund could not be rejected.",
      };
    }
  }, [fetchRefunds]);

  // Update Provider Status
  const updateProviderStatus = useCallback(async (
    providerId: string,
    status: ServiceProvider["status"]
  ): Promise<ProviderMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const providerStatusUrl = `${apiBaseUrl}/api/admin/v1/users/providers/${encodeURIComponent(providerId)}/status`;

    try {
      const response = await fetch(providerStatusUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: statusToApiStatus(status) }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Provider status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setServiceProviders((prev) =>
        prev.map((provider) =>
          provider.id === providerId ? { ...provider, status } : provider
        )
      );
      return { success: true };
    } catch (error) {
      console.warn("Provider status update failed. Keeping current providers unchanged.", error);
      alert("Provider status could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Provider status could not be updated.",
      };
    }
  }, []);

  const updateCustomerStatus = useCallback(async (
    customerId: string,
    status: Customer["status"]
  ): Promise<CustomerMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const customerStatusUrl = `${apiBaseUrl}/api/admin/v1/users/customers/${encodeURIComponent(customerId)}/status`;

    try {
      const response = await fetch(customerStatusUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: customerStatusToApiStatus(status) }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Customer status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerId ? { ...customer, status } : customer
        )
      );
      return { success: true };
    } catch (error) {
      console.warn("Customer status update failed. Keeping current customers unchanged.", error);
      alert("Customer status could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Customer status could not be updated.",
      };
    }
  }, []);

  const updateDisputeStatus = useCallback(async (
    disputeId: string,
    status: Dispute["status"]
  ): Promise<DisputeMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const disputeUrl = `${apiBaseUrl}/api/admin/v1/operations/disputes/${encodeURIComponent(disputeId)}`;

    try {
      const response = await fetch(disputeUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: disputeStatusToApiStatus(status) }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Dispute status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      setDisputes((prev) =>
        prev.map((dispute) =>
          dispute.id === disputeId
            ? {
                ...dispute,
                status,
                resolvedAt: status === "Resolved" ? new Date().toISOString() : dispute.resolvedAt,
              }
            : dispute
        )
      );
      return { success: true };
    } catch (error) {
      console.warn("Dispute status update failed. Keeping current disputes unchanged.", error);
      alert("Dispute status could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Dispute status could not be updated.",
      };
    }
  }, []);

  const updatePayoutRequestStatus = useCallback(async (
    payoutId: string,
    status: PayoutRequest["status"]
  ): Promise<PayoutMutationResult> => {
    const apiBaseUrl = getApiBaseUrl();
    const payoutUrl = `${apiBaseUrl}/api/admin/v1/finance/payouts/${encodeURIComponent(payoutId)}`;

    try {
      const response = await fetch(payoutUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: payoutStatusToApiStatus(status) }),
      });

      if (!response.ok) {
        const error = new Error(await getApiError(response, "Payout status could not be updated."));
        return Promise.reject(Object.assign(error, { status: response.status }));
      }

      const updatedPayout = normalizeUpdatedPayoutResponse(await response.json().catch(() => null));

      setPayoutRequests((prev) =>
        prev.map((payout) => {
          if (payout.id !== payoutId) {
            return payout;
          }

          return updatedPayout
            ? { ...payout, ...updatedPayout }
            : {
                ...payout,
                status,
                processedDate: status === "Pending" ? payout.processedDate : new Date().toISOString(),
              };
        })
      );
      return { success: true };
    } catch (error) {
      console.warn("Payout status update failed. Keeping current payouts unchanged.", error);
      alert("Payout status could not be updated. Please try again.");
      return {
        success: false,
        status: error instanceof Error && "status" in error
          ? Number((error as Error & { status: unknown }).status)
          : undefined,
        error: error instanceof Error && error.message ? error.message : "Payout status could not be updated.",
      };
    }
  }, []);

  const approvePayoutRequest = useCallback((payoutId: string) => {
    return updatePayoutRequestStatus(payoutId, "Approved");
  }, [updatePayoutRequestStatus]);

  // Update Commission Rate
  const updateCommissionRate = useCallback((categoryId: string, newRate: number) => {
    setServiceCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, commissionRate: newRate } : category
      )
    );
  }, []);

  // Add Audit Log
  const addAuditLog = useCallback((action: string, userId: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      action,
      userId,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: "192.168.1.1", // In production, get from request
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  const getProviderById = useCallback(
    (id: string) => serviceProviders.find((provider) => provider.id === id),
    [serviceProviders]
  );

  const getCategoryById = useCallback(
    (id: string) => serviceCategories.find((category) => category.id === id),
    [serviceCategories]
  );

  const getBookingById = useCallback(
    (id: string) => bookings.find((booking) => booking.id === id),
    [bookings]
  );

  const getBookingsByCustomer = useCallback(
    (customerId: string) => bookings.filter((booking) => booking.customerId === customerId),
    [bookings]
  );

  const getBookingsByProvider = useCallback(
    (providerId: string) => bookings.filter((booking) => booking.providerId === providerId),
    [bookings]
  );

  const getTransactionsByProvider = useCallback(
    (providerId: string) => transactions.filter((transaction) => transaction.providerId === providerId),
    [transactions]
  );

  const calculateProviderEarnings = useCallback((providerId: string): ProviderEarning => {
    const providerBookings = bookings.filter((booking) => booking.providerId === providerId);
    const completedBookings = providerBookings.filter((booking) => booking.status === "Completed");
    const paidBookings = completedBookings.filter((booking) => booking.paymentStatus === "Paid");
    const totalEarnings = paidBookings.reduce((sum, booking) => sum + booking.providerEarnings, 0);
    const pendingEarnings = completedBookings
      .filter((booking) => booking.paymentStatus === "Pending")
      .reduce((sum, booking) => sum + booking.providerEarnings, 0);

    return {
      providerId,
      totalEarnings,
      pendingEarnings,
      paidEarnings: totalEarnings - pendingEarnings,
      totalBookings: providerBookings.length,
      completedBookings: completedBookings.length,
    };
  }, [bookings]);

  const value: DataContextType = {
    serviceCategories,
    services,
    isLoadingServices,
    serviceProviders,
    isLoadingServiceProviders,
    customers,
    isLoadingCustomers,
    bookings,
    isLoadingBookings,
    transactions,
    isLoadingTransactions,
    failedPayments,
    isLoadingFailedPayments,
    payoutRequests,
    isLoadingPayoutRequests,
    providerEarnings,
    isLoadingProviderEarnings,
    disputes,
    isLoadingDisputes,
    refunds,
    isLoadingRefunds,
    adminUsers,
    auditLogs,
    dashboardStats,
    getCustomerById: (id: string) => customers.find((customer) => customer.id === id),
    getProviderById,
    getCategoryById,
    getBookingById,
    getBookingsByCustomer,
    getBookingsByProvider,
    getTransactionsByProvider,
    calculateProviderEarnings,
    fetchServiceCategories,
    fetchServices,
    fetchServiceProviders,
    fetchCustomers,
    fetchCustomerDetails,
    fetchBookings,
    fetchDisputes,
    fetchTransactions,
    fetchFailedPayments,
    fetchPayoutRequests,
    fetchProviderEarnings,
    fetchRefunds,
    updateBookingStatus,
    approveRefund,
    rejectRefund,
    updateProviderStatus,
    updateCustomerStatus,
    updateDisputeStatus,
    updatePayoutRequestStatus,
    approvePayoutRequest,
    updateCommissionRate,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    toggleServiceCategoryStatus,
    createMarketplaceService,
    updateMarketplaceService,
    deleteMarketplaceService,
    toggleMarketplaceServiceStatus,
    addAuditLog,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

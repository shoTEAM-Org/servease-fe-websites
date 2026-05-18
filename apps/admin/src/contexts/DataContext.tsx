import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  ServiceCategory,
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
import { apiFetch } from "../services/api";

// ── Response normalisers ────────────────────────────────────────────────────

function cap(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function unwrap<T>(res: unknown, keys: string[], map: (r: unknown) => T): T[] {
  for (const key of keys) {
    const val = (res as Record<string, unknown>)?.[key];
    if (Array.isArray(val)) return val.map(map);
  }
  if (Array.isArray(res)) return (res as unknown[]).map(map);
  return [];
}

function toProvider(r: unknown): ServiceProvider {
  const p = r as Record<string, unknown>;
  return {
    id: String(p.id ?? ''),
    businessName: String(p.business_name ?? p.full_name ?? ''),
    categoryId: String(p.category_id ?? p.categoryId ?? ''),
    contactPerson: String(p.full_name ?? p.contactPerson ?? ''),
    email: String(p.email ?? ''),
    phone: String(p.contact_number ?? p.phone ?? ''),
    status: cap(String(p.status ?? 'active')) as ServiceProvider['status'],
    rating: Number(p.rating ?? p.trust_score ?? 0),
    totalBookings: Number(p.total_bookings ?? p.booking_count ?? 0),
    completedBookings: Number(p.completed_bookings ?? 0),
    cancelledBookings: Number(p.cancelled_bookings ?? 0),
    completionRate: Number(p.completion_rate ?? 0),
    joinedDate: String(p.created_at ?? p.joinedDate ?? ''),
    location: String(p.address ?? p.city ?? p.location ?? ''),
    totalRevenue: Number(p.total_revenue ?? 0),
    totalEarnings: Number(p.total_earnings ?? 0),
  };
}

function toCustomer(r: unknown): Customer {
  const c = r as Record<string, unknown>;
  return {
    id: String(c.id ?? ''),
    name: String(c.full_name ?? c.name ?? ''),
    email: String(c.email ?? ''),
    phone: String(c.contact_number ?? c.phone ?? ''),
    location: String(c.address ?? c.city ?? c.location ?? ''),
    memberSince: String(c.created_at ?? c.memberSince ?? ''),
    totalBookings: Number(c.total_bookings ?? c.booking_count ?? 0),
    totalSpent: Number(c.total_spent ?? 0),
    status: cap(String(c.status ?? 'active')) as Customer['status'],
  };
}

function toBooking(r: unknown): Booking {
  const b = r as Record<string, unknown>;
  return {
    id: String(b.id ?? ''),
    customerId: String(b.customer_id ?? b.customerId ?? ''),
    providerId: String(b.provider_id ?? b.providerId ?? ''),
    categoryId: String(b.category_id ?? b.categoryId ?? ''),
    serviceDescription: String(b.service_title ?? b.service_name ?? b.serviceDescription ?? ''),
    scheduledDate: String(b.scheduled_at ?? b.scheduledDate ?? ''),
    completedDate: b.completed_at != null ? String(b.completed_at) : b.completedDate != null ? String(b.completedDate) : undefined,
    amount: Number(b.total_amount ?? b.amount ?? 0),
    commissionAmount: Number(b.commission_amount ?? b.commissionAmount ?? 0),
    providerEarnings: Number(b.provider_earnings ?? b.providerEarnings ?? 0),
    status: cap(String(b.status ?? 'pending')) as Booking['status'],
    paymentStatus: cap(String(b.payment_status ?? b.paymentStatus ?? 'pending')) as Booking['paymentStatus'],
    paymentMethod: (String(b.payment_method ?? b.paymentMethod ?? 'Credit Card')) as Booking['paymentMethod'],
    location: String(b.address ?? b.location ?? ''),
    createdAt: String(b.created_at ?? b.createdAt ?? ''),
  };
}

function toTransaction(r: unknown): Transaction {
  const t = r as Record<string, unknown>;
  return {
    id: String(t.id ?? ''),
    bookingId: String(t.booking_id ?? t.bookingId ?? ''),
    customerId: String(t.customer_id ?? t.customerId ?? ''),
    providerId: String(t.provider_id ?? t.providerId ?? ''),
    amount: Number(t.amount ?? 0),
    commissionAmount: Number(t.commission_amount ?? t.commissionAmount ?? 0),
    providerEarnings: Number(t.provider_earnings ?? t.providerEarnings ?? 0),
    paymentMethod: (String(t.payment_method ?? t.paymentMethod ?? 'Credit Card')) as Transaction['paymentMethod'],
    paymentStatus: cap(String(t.status ?? t.payment_status ?? 'pending')) as Transaction['paymentStatus'],
    timestamp: String(t.created_at ?? t.timestamp ?? ''),
  };
}

function toPayout(r: unknown): PayoutRequest {
  const p = r as Record<string, unknown>;
  const bd = (p.bank_details ?? p.bankDetails ?? {}) as Record<string, unknown>;
  return {
    id: String(p.id ?? ''),
    providerId: String(p.provider_id ?? p.providerId ?? ''),
    amount: Number(p.amount ?? p.requested_amount ?? 0),
    status: cap(String(p.status ?? 'pending')) as PayoutRequest['status'],
    requestedDate: String(p.requested_at ?? p.created_at ?? p.requestedDate ?? ''),
    processedDate: p.processed_at != null ? String(p.processed_at) : p.processedDate != null ? String(p.processedDate) : undefined,
    bankDetails: {
      accountName: String(bd.account_name ?? bd.accountName ?? p.account_name ?? ''),
      accountNumber: String(bd.account_number ?? bd.accountNumber ?? p.account_number ?? ''),
      bankName: String(bd.bank_name ?? bd.bankName ?? p.bank_name ?? ''),
    },
  };
}

function toDispute(r: unknown): Dispute {
  const d = r as Record<string, unknown>;
  return {
    id: String(d.id ?? ''),
    bookingId: String(d.booking_id ?? d.bookingId ?? ''),
    customerId: String(d.customer_id ?? d.customerId ?? ''),
    providerId: String(d.provider_id ?? d.providerId ?? ''),
    reason: String(d.reason ?? ''),
    description: String(d.description ?? d.reason ?? ''),
    amount: Number(d.amount ?? 0),
    status: cap(String(d.status ?? 'open')) as Dispute['status'],
    createdAt: String(d.created_at ?? d.createdAt ?? ''),
    resolvedAt: d.resolved_at != null ? String(d.resolved_at) : d.resolvedAt != null ? String(d.resolvedAt) : undefined,
    resolution: d.resolution != null ? String(d.resolution) : undefined,
    refundAmount: d.refund_amount != null ? Number(d.refund_amount) : undefined,
  };
}

function toRefund(r: unknown): Refund {
  const rf = r as Record<string, unknown>;
  return {
    id: String(rf.id ?? ''),
    bookingId: String(rf.booking_id ?? rf.bookingId ?? ''),
    customerId: String(rf.customer_id ?? rf.customerId ?? ''),
    amount: Number(rf.amount ?? 0),
    reason: String(rf.reason ?? ''),
    status: cap(String(rf.status ?? 'pending')) as Refund['status'],
    requestedDate: String(rf.requested_at ?? rf.created_at ?? rf.requestedDate ?? ''),
    processedDate: rf.processed_at != null ? String(rf.processed_at) : rf.processedDate != null ? String(rf.processedDate) : undefined,
  };
}

// ── Context ─────────────────────────────────────────────────────────────────

interface DataContextType {
  serviceCategories: ServiceCategory[];
  serviceProviders: ServiceProvider[];
  customers: Customer[];
  bookings: Booking[];
  transactions: Transaction[];
  payoutRequests: PayoutRequest[];
  disputes: Dispute[];
  refunds: Refund[];
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];
  dashboardStats: DashboardStats;
  getCustomerById: (id: string) => Customer | undefined;
  getProviderById: (id: string) => ServiceProvider | undefined;
  getCategoryById: (id: string) => ServiceCategory | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsByCustomer: (customerId: string) => Booking[];
  getBookingsByProvider: (providerId: string) => Booking[];
  getTransactionsByProvider: (providerId: string) => Transaction[];
  calculateProviderEarnings: (providerId: string) => ProviderEarning;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  approveRefund: (refundId: string) => void;
  rejectRefund: (refundId: string, reason: string) => void;
  updateProviderStatus: (providerId: string, status: ServiceProvider["status"]) => void;
  approvePayoutRequest: (payoutId: string) => void;
  updateCommissionRate: (categoryId: string, newRate: number) => void;
  addAuditLog: (action: string, userId: string, details: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [adminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) return;

    Promise.allSettled([
      apiFetch('/api/admin/v1/marketplace/categories?limit=100')
        .then(r => setServiceCategories(
          unwrap(r, ['categories', 'data'], (c) => {
            const cat = c as Record<string, unknown>;
            return { id: String(cat.id ?? ''), name: String(cat.name ?? ''), commissionRate: Number(cat.commission_rate ?? 0) };
          })
        )),
      apiFetch('/api/admin/v1/users/providers?limit=100')
        .then(r => setServiceProviders(unwrap(r, ['providers', 'data'], toProvider))),
      apiFetch('/api/admin/v1/users/customers?limit=100')
        .then(r => setCustomers(unwrap(r, ['customers', 'data'], toCustomer))),
      apiFetch('/api/admin/v1/operations/bookings?limit=100')
        .then(r => setBookings(unwrap(r, ['bookings', 'data'], toBooking))),
      apiFetch('/api/admin/v1/finance/transactions?limit=100')
        .then(r => setTransactions(unwrap(r, ['transactions', 'payments', 'data'], toTransaction))),
      apiFetch('/api/admin/v1/finance/payouts?limit=100')
        .then(r => setPayoutRequests(unwrap(r, ['payouts', 'data'], toPayout))),
      apiFetch('/api/admin/v1/operations/disputes?limit=100')
        .then(r => setDisputes(unwrap(r, ['disputes', 'data'], toDispute))),
      apiFetch('/api/admin/v1/finance/refunds?limit=100')
        .then(r => setRefunds(unwrap(r, ['refunds', 'data'], toRefund))),
    ]);
  }, []);

  const dashboardStats: DashboardStats = {
    totalRevenue: transactions.reduce((s, t) => s + t.amount, 0),
    totalBookings: bookings.length,
    activeProviders: serviceProviders.filter((p) => p.status === "Active").length,
    activeCustomers: customers.filter((c) => c.status === "Active").length,
    completionRate: bookings.length > 0
      ? (bookings.filter(b => b.status === "Completed").length / bookings.length) * 100
      : 0,
    avgBookingValue: bookings.length > 0
      ? bookings.reduce((s, b) => s + b.amount, 0) / bookings.length
      : 0,
  };

  const updateBookingStatus = useCallback((bookingId: string, status: Booking["status"]) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  }, []);

  const approveRefund = useCallback((refundId: string) => {
    setRefunds(prev => prev.map(r => r.id === refundId
      ? { ...r, status: "Approved" as Refund["status"], processedDate: new Date().toISOString() }
      : r));
  }, []);

  const rejectRefund = useCallback((refundId: string, _reason: string) => {
    setRefunds(prev => prev.map(r => r.id === refundId
      ? { ...r, status: "Rejected" as Refund["status"], processedDate: new Date().toISOString() }
      : r));
  }, []);

  const updateProviderStatus = useCallback((providerId: string, status: ServiceProvider["status"]) => {
    setServiceProviders(prev => prev.map(p => p.id === providerId ? { ...p, status } : p));
  }, []);

  const approvePayoutRequest = useCallback((payoutId: string) => {
    setPayoutRequests(prev => prev.map(p => p.id === payoutId
      ? { ...p, status: "Approved" as PayoutRequest["status"], processedDate: new Date().toISOString() }
      : p));
  }, []);

  const updateCommissionRate = useCallback((categoryId: string, newRate: number) => {
    setServiceCategories(prev => prev.map(c => c.id === categoryId ? { ...c, commissionRate: newRate } : c));
  }, []);

  const addAuditLog = useCallback((action: string, userId: string, details: string) => {
    setAuditLogs(prev => [{
      id: `LOG-${Date.now()}`,
      action,
      userId,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: '',
    }, ...prev]);
  }, []);

  const getCustomerById = useCallback((id: string) => customers.find(c => c.id === id), [customers]);
  const getProviderById = useCallback((id: string) => serviceProviders.find(p => p.id === id), [serviceProviders]);
  const getCategoryById = useCallback((id: string) => serviceCategories.find(c => c.id === id), [serviceCategories]);
  const getBookingById = useCallback((id: string) => bookings.find(b => b.id === id), [bookings]);
  const getBookingsByCustomer = useCallback((customerId: string) => bookings.filter(b => b.customerId === customerId), [bookings]);
  const getBookingsByProvider = useCallback((providerId: string) => bookings.filter(b => b.providerId === providerId), [bookings]);
  const getTransactionsByProvider = useCallback((providerId: string) => transactions.filter(t => t.providerId === providerId), [transactions]);
  const calculateProviderEarnings = useCallback((providerId: string): ProviderEarning => {
    const pts = transactions.filter(t => t.providerId === providerId);
    return {
      providerId,
      totalEarnings: pts.reduce((s, t) => s + t.providerEarnings, 0),
      pendingEarnings: 0,
      paidEarnings: pts.reduce((s, t) => s + t.providerEarnings, 0),
      totalBookings: pts.length,
      completedBookings: pts.length,
    };
  }, [transactions]);

  const value: DataContextType = {
    serviceCategories, serviceProviders, customers, bookings,
    transactions, payoutRequests, disputes, refunds, adminUsers, auditLogs,
    dashboardStats,
    getCustomerById, getProviderById, getCategoryById, getBookingById,
    getBookingsByCustomer, getBookingsByProvider, getTransactionsByProvider,
    calculateProviderEarnings,
    updateBookingStatus, approveRefund, rejectRefund, updateProviderStatus,
    approvePayoutRequest, updateCommissionRate, addAuditLog,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}

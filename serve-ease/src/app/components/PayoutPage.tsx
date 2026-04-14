import { useState } from "react";
import Link from "next/link";
import { Wallet, Calendar, ChevronRight, ExternalLink, Clock, X, Search, TrendingUp, CheckCircle, AlertCircle, Plus, Building2, Smartphone } from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "32px",
    marginBottom: "24px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  primaryButton: {
    backgroundColor: "#00BF63",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 191, 99, 0.25)",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
  },
};

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  method: string;
  reference: string;
}

interface PayoutMethod {
  id: string;
  type: "GCash" | "PayMaya" | "Bank Transfer";
  accountName: string;
  accountNumber: string;
  isPrimary: boolean;
}

export function PayoutPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([
    { id: "pm-1", type: "GCash", accountName: "Juan dela Cruz", accountNumber: "•••• •••• 1234", isPrimary: true },
    { id: "pm-2", type: "Bank Transfer", accountName: "BDO Savings", accountNumber: "BDO •••• 9012", isPrimary: false },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"GCash" | "PayMaya" | "Bank Transfer">("GCash");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newSetPrimary, setNewSetPrimary] = useState(false);
  const [formError, setFormError] = useState("");
  const [showManageModal, setShowManageModal] = useState(false);

  const handleSetPrimary = (id: string) => {
    setPayoutMethods((prev) => prev.map((m) => ({ ...m, isPrimary: m.id === id })));
  };

  const handleDeleteMethod = (id: string) => {
    setPayoutMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMethod = () => {
    if (!newAccountName.trim()) { setFormError("Account name is required."); return; }
    if (!newAccountNumber.trim()) { setFormError("Account number is required."); return; }
    setFormError("");
    const newMethod: PayoutMethod = {
      id: `pm-${Date.now()}`,
      type: newMethodType,
      accountName: newAccountName.trim(),
      accountNumber: newAccountNumber.trim(),
      isPrimary: newSetPrimary,
    };
    setPayoutMethods((prev) => {
      const updated = newSetPrimary ? prev.map(m => ({ ...m, isPrimary: false })) : prev;
      return [...updated, newMethod];
    });
    setNewAccountName("");
    setNewAccountNumber("");
    setNewSetPrimary(false);
    setShowAddModal(false);
  };

  const currentBalance = 15420.50;
  const pendingBalance = 3200.00;
  const totalEarnings = 48640.50;
  const nextPayoutDate = "April 5, 2026";
  const nextPayoutAmount = 8500.00;
  const thisMonthEarnings = 12300.00;

  const transactions: Transaction[] = [
    { id: "1", date: "2024-03-15", amount: 4500.00, status: "completed", method: "GCash", reference: "TXN-2024-001234" },
    { id: "2", date: "2024-03-10", amount: 3200.00, status: "processing", method: "Bank Transfer", reference: "TXN-2024-001233" },
    { id: "3", date: "2024-03-05", amount: 2800.00, status: "completed", method: "PayMaya", reference: "TXN-2024-001232" },
    { id: "4", date: "2024-02-28", amount: 5100.00, status: "completed", method: "GCash", reference: "TXN-2024-001231" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return { bg: "#DCFCE7", text: "#16A34A" };
      case "processing": return { bg: "#FEF3C7", text: "#D97706" };
      case "pending": return { bg: "#FEE2E2", text: "#DC2626" };
      default: return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedFilter === "all") return true;
    return transaction.status === selectedFilter;
  });

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>

        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Payout</h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Manage your earnings and payout methods
          </p>
        </div>

        {/* Balance Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
          {/* Available Balance */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #F3F4F6", padding: "24px", height: "140px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Wallet style={{ width: "24px", height: "24px", color: "#00BF63" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px", lineHeight: "1.4" }}>Available Balance</p>
                  <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                    ₱{currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#00BF63", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
              <CheckCircle size={14} /> Ready for withdrawal
            </p>
          </div>

          {/* Pending Balance */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #F3F4F6", padding: "24px", height: "140px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock style={{ width: "24px", height: "24px", color: "#D97706" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px", lineHeight: "1.4" }}>Pending</p>
                  <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                    ₱{pendingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#D97706", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
              <Clock size={14} /> Processing in progress
            </p>
          </div>

          {/* Total Earnings */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #F3F4F6", padding: "24px", height: "140px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#E0E7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar style={{ width: "24px", height: "24px", color: "#4F46E5" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px", lineHeight: "1.4" }}>Total Earnings</p>
                  <p style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                    ₱{totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#4F46E5", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
              <TrendingUp size={14} /> All-time total
            </p>
          </div>
        </div>

        {/* Request Early Payout Banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F0FDF8", border: "1px solid #A7F3D0", borderRadius: "14px", padding: "16px 24px", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#065F46", marginBottom: "2px" }}>Need funds sooner?</p>
            <p style={{ fontSize: "12px", color: "#6B7280" }}>Instant payout with small fee</p>
          </div>
          <Link
            href="/provider/request-payout"
            style={{ ...styles.button, ...styles.primaryButton, textDecoration: "none" } as React.CSSProperties}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#059669"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00BF63"; }}
          >
            Request Early Payout
            <ChevronRight style={{ width: "18px", height: "18px" }} />
          </Link>
        </div>

        {/* Next Payout & Insights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "32px" }}>
          {/* Next Payout */}
          <div style={{ backgroundColor: "#F0FDF8", borderRadius: "16px", border: "2px solid #A7F3D0", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Calendar size={18} color="#00BF63" />
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#065F46" }}>Next Scheduled Payout</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#059669", marginBottom: "2px" }}>Date</p>
                <p style={{ fontSize: "16px", fontWeight: "bold", color: "#047857" }}>{nextPayoutDate}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "12px", color: "#059669", marginBottom: "2px" }}>Estimated Amount</p>
                <p style={{ fontSize: "16px", fontWeight: "bold", color: "#047857" }}>
                  ₱{nextPayoutAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Earnings Insight */}
          <div style={{ backgroundColor: "#FEF3C7", borderRadius: "16px", border: "2px solid #FCD34D", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <TrendingUp size={18} color="#D97706" />
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#92400E" }}>This Month's Earnings</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#B45309", marginBottom: "2px" }}>March 2026</p>
                <p style={{ fontSize: "20px", fontWeight: "bold", color: "#D97706" }}>
                  ₱{thisMonthEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })} earned
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Method */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>Payout Method</h2>
            <button
              onClick={() => setShowManageModal(true)}
              style={{ ...styles.button, ...styles.secondaryButton }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              Manage Payout Methods
              <ExternalLink style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {payoutMethods.map((method) => (
              <div
                key={method.id}
                style={{ padding: "20px", borderRadius: "12px", backgroundColor: method.isPrimary ? "#F0FDF8" : "#F9FAFB", border: method.isPrimary ? "2px solid #00BF63" : "1px solid #E5E7EB", minHeight: "88px", transition: "all 0.3s ease", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 191, 99, 0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: method.isPrimary ? "#00BF63" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {method.type === "Bank Transfer"
                        ? <Building2 style={{ width: "20px", height: "20px", color: method.isPrimary ? "white" : "#6B7280" }} />
                        : <Smartphone style={{ width: "20px", height: "20px", color: method.isPrimary ? "white" : "#6B7280" }} />
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "2px", lineHeight: "1.3" }}>{method.type}</p>
                      <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.3" }}>{method.accountName} · {method.accountNumber}</p>
                    </div>
                  </div>
                  {method.isPrimary && (
                    <span style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", backgroundColor: "#00BF63", color: "white" }}>
                      Primary
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: method.isPrimary ? "#059669" : "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  {method.type === "Bank Transfer" ? "Processing time: 1–3 business days" : "Processing time: Instant – 1 hour"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>Transaction History</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "completed", "processing", "pending"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", backgroundColor: selectedFilter === filter ? "#00BF63" : "#F3F4F6", color: selectedFilter === filter ? "white" : "#6B7280", transition: "all 0.3s ease" }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Date Filter */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, position: "relative" as const }}>
              <Search style={{ position: "absolute" as const, left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder="Search by reference, method, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 44px", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "14px", color: "#374151", outline: "none", transition: "border-color 0.3s ease" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00BF63"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: "12px 40px 12px 16px", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "14px", fontWeight: "600", color: "#374151", outline: "none", cursor: "pointer", backgroundColor: "white", minWidth: "160px", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#00BF63"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredTransactions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6B7280", padding: "32px", fontSize: "14px" }}>
                No transactions found for this filter.
              </p>
            ) : (
              filteredTransactions.map((transaction) => {
                const statusColors = getStatusColor(transaction.status);
                const isExpanded = expandedTransaction === transaction.id;
                const serviceFee = transaction.amount * 0.05;
                const platformFee = transaction.amount * 0.02;
                const netAmount = transaction.amount - serviceFee - platformFee;

                return (
                  <div
                    key={transaction.id}
                    style={{ borderRadius: "12px", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", transition: "all 0.3s ease", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "4px", letterSpacing: "-0.02em" }}>
                          ₱{transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p style={{ fontSize: "13px", color: "#6B7280" }}>
                          {new Date(transaction.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{transaction.method}</p>
                        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{transaction.reference}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: statusColors.bg, color: statusColors.text, display: "flex", alignItems: "center", gap: "6px" }}>
                          {transaction.status === "completed" && <CheckCircle size={14} />}
                          {transaction.status === "processing" && <Clock size={14} />}
                          {transaction.status === "pending" && <AlertCircle size={14} />}
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedTransaction(isExpanded ? null : transaction.id); }}
                          style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "white", color: "#00BF63", border: "1px solid #E5E7EB", cursor: "pointer", transition: "all 0.3s ease" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F0FDF8"; e.currentTarget.style.borderColor = "#00BF63"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                        >
                          {isExpanded ? "Hide" : "View"} Details
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "20px", borderTop: "1px solid #E5E7EB", backgroundColor: "white", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>Payment Breakdown</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>Gross Amount</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>₱{transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>Service Fee (5%)</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#DC2626" }}>- ₱{serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid #E5E7EB" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>Platform Fee (2%)</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#DC2626" }}>- ₱{platformFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Net Payout</span>
                            <span style={{ fontSize: "16px", fontWeight: "700", color: "#00BF63" }}>₱{netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Manage Payout Methods Modal */}
      {showManageModal && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowManageModal(false); }}
        >
          <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "520px", boxShadow: "0 25px 50px rgba(0, 0, 0, 0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>Manage Payout Methods</h2>
                <p style={{ fontSize: "13px", color: "#6B7280" }}>Set your primary method or remove existing ones</p>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
              >
                <X style={{ width: "18px", height: "18px", color: "#6B7280" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {payoutMethods.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "14px", padding: "32px 0" }}>No payout methods saved yet.</p>
              ) : (
                payoutMethods.map((method) => (
                  <div key={method.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "12px", backgroundColor: method.isPrimary ? "#F0FDF8" : "#F9FAFB", border: method.isPrimary ? "2px solid #00BF63" : "1px solid #E5E7EB", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0, backgroundColor: method.isPrimary ? "#00BF63" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {method.type === "Bank Transfer"
                          ? <Building2 style={{ width: "18px", height: "18px", color: method.isPrimary ? "white" : "#6B7280" }} />
                          : <Smartphone style={{ width: "18px", height: "18px", color: method.isPrimary ? "white" : "#6B7280" }} />
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{method.type}</p>
                          {method.isPrimary && (
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "#00BF63", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Primary</span>
                          )}
                        </div>
                        <p style={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{method.accountName} · {method.accountNumber}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      {!method.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(method.id)}
                          style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1.5px solid #00BF63", backgroundColor: "white", color: "#00BF63", transition: "all 0.2s ease" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F0FDF8"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1.5px solid #FCA5A5", backgroundColor: "white", color: "#DC2626", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setShowManageModal(false); setShowAddModal(true); }}
                style={{ ...styles.button, ...styles.primaryButton, flex: 1, whiteSpace: "nowrap" } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#00BF63"; }}
              >
                <Plus style={{ width: "16px", height: "16px" }} />
                Add New Payout Method
              </button>
              <button
                onClick={() => setShowManageModal(false)}
                style={{ ...styles.button, ...styles.secondaryButton, flex: 1 } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Payout Method Modal */}
      {showAddModal && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 25px 50px rgba(0, 0, 0, 0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>Add Payout Method</h2>
                <p style={{ fontSize: "13px", color: "#6B7280" }}>Enter your payment details below</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setFormError(""); }}
                style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
              >
                <X style={{ width: "18px", height: "18px", color: "#6B7280" }} />
              </button>
            </div>

            {/* Method Type */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "10px" }}>Payment Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {(["GCash", "PayMaya", "Bank Transfer"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewMethodType(type)}
                    style={{ padding: "12px 8px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "2px solid", borderColor: newMethodType === type ? "#00BF63" : "#E5E7EB", backgroundColor: newMethodType === type ? "#F0FDF8" : "white", color: newMethodType === type ? "#00BF63" : "#6B7280", transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
                  >
                    {type === "Bank Transfer" ? <Building2 style={{ width: "18px", height: "18px" }} /> : <Smartphone style={{ width: "18px", height: "18px" }} />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Name */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Account Name</label>
              <input
                type="text"
                placeholder="e.g. Juan dela Cruz"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "14px", color: "#111827", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00BF63"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            {/* Account Number */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                {newMethodType === "Bank Transfer" ? "Account Number" : "Mobile Number / Account"}
              </label>
              <input
                type="text"
                placeholder={newMethodType === "Bank Transfer" ? "e.g. 0123456789" : "e.g. 09XX XXX XXXX"}
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "14px", color: "#111827", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" as const }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#00BF63"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            {/* Set as Primary */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <input
                type="checkbox"
                id="setPrimary"
                checked={newSetPrimary}
                onChange={(e) => setNewSetPrimary(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#00BF63", cursor: "pointer" }}
              />
              <label htmlFor="setPrimary" style={{ fontSize: "14px", color: "#374151", cursor: "pointer" }}>
                Set as primary payout method
              </label>
            </div>

            {/* Error */}
            {formError && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                <AlertCircle style={{ width: "14px", height: "14px", color: "#DC2626", flexShrink: 0 }} />
                <p style={{ fontSize: "13px", color: "#DC2626" }}>{formError}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setShowAddModal(false); setFormError(""); }}
                style={{ ...styles.button, ...styles.secondaryButton, flex: 1 } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMethod}
                style={{ ...styles.button, ...styles.primaryButton, flex: 2 } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#00BF63"; }}
              >
                <Plus style={{ width: "16px", height: "16px" }} />
                Save Payout Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
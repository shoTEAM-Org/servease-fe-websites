import { useState } from "react";
import { Link } from "react-router";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  ChevronLeft,

  Filter,
  Eye,
  ChevronDown,
  X,
} from "lucide-react";

// Styles object for reusability
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))",
    padding: "32px",
  },
  maxWidthContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    marginBottom: "24px",
    transition: "color 0.3s ease",
  },
  pageHeader: {
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.025em",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    transition: "box-shadow 0.3s ease",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "20px",
    transition: "all 0.3s ease",
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#111827",
  },
  filterSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #F3F4F6",
    padding: "24px",
    marginBottom: "32px",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "12px 36px 12px 16px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    transition: "border-color 0.3s ease",
    outline: "none",
    cursor: "pointer",
    backgroundColor: "white",
    appearance: "none" as const,
  },
  button: {
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
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
    color: "#374151",
    border: "2px solid #E5E7EB",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  tableHeader: {
    backgroundColor: "#F9FAFB",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  tableHeaderCell: {
    padding: "16px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    textAlign: "left" as const,
    borderBottom: "2px solid #E5E7EB",
  },
  tableCell: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #F3F4F6",
  },
  tableRow: {
    transition: "background-color 0.2s ease",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  viewLink: {
    color: "#00BF63",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.3s ease",
  },
};

interface Transaction {
  id: string;
  date: string;
  bookingRef: string;
  customerName: string;
  serviceType: string;
  amountCharged: number;
  platformFee: number;
  tips: number;
  netEarnings: number;
  status: "completed" | "pending" | "processing";
}

export function ProviderEarningsDetails() {
  const [dateFrom, setDateFrom] = useState("2026-03-01");
  const [dateTo, setDateTo] = useState("2026-03-19");
  const [serviceCategory, setServiceCategory] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatCurrencyForPDF = (value: number): string => {
    // Format as plain number with thousand separators and 2 decimals
    // Avoids ₱ symbol rendering issues in PDF
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const transactions: Transaction[] = [
    {
      id: "1",
      date: "Mar 18, 2026",
      bookingRef: "BK-2026-0318-001",
      customerName: "Maria Santos",
      serviceType: "House Cleaning",
      amountCharged: 2500,
      platformFee: 375,
      tips: 200,
      netEarnings: 2325,
      status: "completed",
    },
    {
      id: "2",
      date: "Mar 17, 2026",
      bookingRef: "BK-2026-0317-002",
      customerName: "Juan Dela Cruz",
      serviceType: "Plumbing",
      amountCharged: 3500,
      platformFee: 525,
      tips: 150,
      netEarnings: 3125,
      status: "completed",
    },
    {
      id: "3",
      date: "Mar 16, 2026",
      bookingRef: "BK-2026-0316-003",
      customerName: "Ana Reyes",
      serviceType: "Electrical",
      amountCharged: 1800,
      platformFee: 270,
      tips: 0,
      netEarnings: 1530,
      status: "pending",
    },
    {
      id: "4",
      date: "Mar 15, 2026",
      bookingRef: "BK-2026-0315-004",
      customerName: "Carlos Mendoza",
      serviceType: "Aircon Services",
      amountCharged: 2200,
      platformFee: 330,
      tips: 100,
      netEarnings: 1970,
      status: "processing",
    },
    {
      id: "5",
      date: "Mar 14, 2026",
      bookingRef: "BK-2026-0314-005",
      customerName: "Lisa Tan",
      serviceType: "House Cleaning",
      amountCharged: 2800,
      platformFee: 420,
      tips: 300,
      netEarnings: 2680,
      status: "completed",
    },
    {
      id: "6",
      date: "Mar 13, 2026",
      bookingRef: "BK-2026-0313-006",
      customerName: "Roberto Garcia",
      serviceType: "Plumbing",
      amountCharged: 4200,
      platformFee: 630,
      tips: 250,
      netEarnings: 3820,
      status: "completed",
    },
    {
      id: "7",
      date: "Mar 12, 2026",
      bookingRef: "BK-2026-0312-007",
      customerName: "Elena Cruz",
      serviceType: "House Cleaning",
      amountCharged: 2100,
      platformFee: 315,
      tips: 150,
      netEarnings: 1935,
      status: "completed",
    },
    {
      id: "8",
      date: "Mar 11, 2026",
      bookingRef: "BK-2026-0311-008",
      customerName: "Miguel Santos",
      serviceType: "Electrical",
      amountCharged: 3100,
      platformFee: 465,
      tips: 0,
      netEarnings: 2635,
      status: "completed",
    },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const inDateRange = txDate >= start && txDate <= end;

    let categoryMatch = true;
    if (serviceCategory !== "all") {
      const mapping: Record<string, string> = {
        "house-cleaning": "House Cleaning",
        plumbing: "Plumbing",
        electrical: "Electrical",
        aircon: "Aircon Services",
      };
      categoryMatch = tx.serviceType === mapping[serviceCategory];
    }

    const statusMatch = paymentStatus === "all" || tx.status === paymentStatus;

    return inDateRange && categoryMatch && statusMatch;
  });

  const totalEarnings = filteredTransactions.reduce((sum, tx) => sum + tx.netEarnings, 0);
  const pendingEarnings = filteredTransactions.filter(tx => tx.status === 'pending').reduce((sum, tx) => sum + tx.netEarnings, 0);
  const inProcessing = filteredTransactions.filter(tx => tx.status === 'processing').reduce((sum, tx) => sum + tx.netEarnings, 0);
  const paidOut = filteredTransactions.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.netEarnings, 0);

  const handleExportCSV = () => {
    const headers = ["Date", "Booking Ref", "Customer Name", "Service Type", "Amount Charged", "Platform Fee", "Tips", "Net Earnings", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(tx => [
        `"${tx.date}"`,
        `"${tx.bookingRef}"`,
        `"${tx.customerName}"`,
        `"${tx.serviceType}"`,
        tx.amountCharged,
        tx.platformFee,
        tx.tips,
        tx.netEarnings,
        `"${tx.status}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `earnings_${dateFrom}_to_${dateTo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const now = new Date();
    const generatedAt = now.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const serviceCategoryLabel =
      serviceCategory === "all"
        ? "All Services"
        : {
            "house-cleaning": "House Cleaning",
            plumbing: "Plumbing",
            electrical: "Electrical",
            aircon: "Aircon Services",
          }[serviceCategory] ?? serviceCategory;

    const paymentStatusLabel =
      paymentStatus === "all"
        ? "All Statuses"
        : {
            completed: "Paid Out",
            processing: "Processing",
            pending: "Pending",
          }[paymentStatus] ?? paymentStatus;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Earnings Details Report", 40, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 40, 60);
    doc.text(`Date Range: ${dateFrom} to ${dateTo}`, 40, 74);
    doc.text(`Service Category: ${serviceCategoryLabel}`, 40, 88);
    doc.text(`Payment Status: ${paymentStatusLabel}`, 40, 102);

    doc.setFont("helvetica", "bold");
    doc.text(
      `Summary - Total: ₱${formatCurrencyForPDF(totalEarnings)} | Pending: ₱${formatCurrencyForPDF(pendingEarnings)} | Processing: ₱${formatCurrencyForPDF(inProcessing)} | Paid Out: ₱${formatCurrencyForPDF(paidOut)}`,
      40,
      120
    );

    autoTable(doc, {
      startY: 136,
      head: [["Date", "Booking Ref", "Customer", "Service", "Amount (₱)", "Fee (₱)", "Tips (₱)", "Net (₱)", "Status"]],
      body: filteredTransactions.map((tx) => [
        tx.date,
        tx.bookingRef,
        tx.customerName,
        tx.serviceType,
        formatCurrencyForPDF(tx.amountCharged),
        formatCurrencyForPDF(tx.platformFee),
        tx.tips > 0 ? formatCurrencyForPDF(tx.tips) : "-",
        formatCurrencyForPDF(tx.netEarnings),
        getStatusLabel(tx.status),
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 7,
        halign: "right" as const,
      },
      columnStyles: {
        0: { halign: "left" as const },
        1: { halign: "center" as const },
        2: { halign: "left" as const },
        3: { halign: "left" as const },
        8: { halign: "center" as const },
      },
      headStyles: {
        fillColor: [0, 191, 99],
        textColor: [255, 255, 255],
        halign: "center" as const,
        fontStyle: "bold",
      },
      theme: "grid",
      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();

        doc.setFontSize(9);
        doc.setTextColor(110, 110, 110);
        doc.text(
          `Transactions Exported: ${filteredTransactions.length}`,
          40,
          pageHeight - 18
        );
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth - 80,
          pageHeight - 18
        );
      },
    });

    const safeTimestamp = now.toISOString().replace(/[:.]/g, "-");
    doc.save(`earnings_${dateFrom}_to_${dateTo}_${safeTimestamp}.pdf`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#D1FAE5",
          color: "#059669",
        };
      case "pending":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        };
      case "processing":
        return {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
        };
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Paid Out";
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      default:
        return status;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Back Link */}
        <Link
          to="/provider/earningsdashboard"
          style={styles.backLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00BF63";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <ChevronLeft style={{ width: "16px", height: "16px" }} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Earnings Details</h1>
          <p style={styles.pageSubtitle}>
            View detailed breakdown of all your transactions and earnings
          </p>
        </div>

        {/* Top Section: Earnings Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Total Earnings */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#D1FAE5" }}
            >
              <DollarSign
                style={{ width: "24px", height: "24px", color: "#00BF63" }}
              />
            </div>
            <p style={styles.label}>Total Earnings</p>
            <p style={styles.value}>₱{totalEarnings.toLocaleString()}</p>
          </div>

          {/* Pending */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#FEF3C7" }}
            >
              <Clock
                style={{ width: "24px", height: "24px", color: "#F59E0B" }}
              />
            </div>
            <p style={styles.label}>Pending</p>
            <p style={styles.value}>₱{pendingEarnings.toLocaleString()}</p>
          </div>

          {/* Processing */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#DBEAFE" }}
            >
              <CreditCard
                style={{ width: "24px", height: "24px", color: "#3B82F6" }}
              />
            </div>
            <p style={styles.label}>Processing</p>
            <p style={styles.value}>₱{inProcessing.toLocaleString()}</p>
          </div>

          {/* Paid Out */}
          <div style={styles.summaryCard}>
            <div
              style={{ ...styles.iconContainer, backgroundColor: "#D1FAE5" }}
            >
              <CheckCircle
                style={{ width: "24px", height: "24px", color: "#00BF63" }}
              />
            </div>
            <p style={styles.label}>Paid Out</p>
            <p style={styles.value}>₱{paidOut.toLocaleString()}</p>
          </div>
        </div>

        {/* Middle Section: Filters */}
        <div style={styles.filterSection}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <Filter style={{ width: "20px", height: "20px", color: "#00BF63" }} />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#111827",
                margin: 0,
              }}
            >
              Filter Transactions
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            {/* Date From */}
            <div>
              <label style={styles.filterLabel}>Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label style={styles.filterLabel}>Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#00BF63";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              />
            </div>

            {/* Service Category */}
            <div>
              <label style={styles.filterLabel}>Service Category</label>
              <div style={{ position: "relative" }}>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <option value="all">All Services</option>
                  <option value="house-cleaning">House Cleaning</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="aircon">Aircon Services</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#6B7280", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label style={styles.filterLabel}>Payment Status</label>
              <div style={{ position: "relative" }}>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00BF63";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Paid Out</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#6B7280", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Export Button */}
            <div style={{ position: "relative" }}>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00BF63";
                }}
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              >
                <Download style={{ width: "18px", height: "18px" }} />
                <span>Export</span>
                <ChevronDown
                  style={{
                    width: "16px",
                    height: "16px",
                    marginLeft: "4px",
                    transition: "transform 0.3s ease",
                    transform: isExportDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {isExportDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "calc(100% + 8px)",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #E5E7EB",
                    zIndex: 1000,
                    minWidth: "200px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "white",
                      color: "#374151",
                      textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onClick={() => {
                      handleExportCSV();
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <FileText style={{ width: "16px", height: "16px", color: "#00BF63" }} />
                    <span>Export as CSV</span>
                  </button>
                  <button
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "white",
                      color: "#374151",
                      textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onClick={() => {
                      handleExportPDF();
                      setIsExportDropdownOpen(false);
                    }}
                  >
                    <FileText style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                    <span>Export as PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Transaction List */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <FileText style={{ width: "20px", height: "20px", color: "#00BF63" }} />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#111827",
                margin: 0,
              }}
            >
              Transaction History
            </h2>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "14px",
                color: "#6B7280",
                fontWeight: "600",
              }}
            >
              {filteredTransactions.length} transactions
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Date</th>
                  <th style={styles.tableHeaderCell}>Booking Ref</th>
                  <th style={styles.tableHeaderCell}>Customer</th>
                  <th style={styles.tableHeaderCell}>Service Type</th>
                  <th style={styles.tableHeaderCell}>Amount Charged</th>
                  <th style={styles.tableHeaderCell}>Platform Fee</th>
                  <th style={styles.tableHeaderCell}>Tips</th>
                  <th
                    style={{
                      ...styles.tableHeaderCell,
                      color: "#00BF63",
                      fontWeight: "800",
                    }}
                  >
                    Net Earnings
                  </th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    style={{
                      ...styles.tableRow,
                      backgroundColor: index % 2 === 0 ? "white" : "#FAFAFA",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "white" : "#FAFAFA";
                    }}
                  >
                    <td style={styles.tableCell}>
                      <span style={{ fontWeight: "600" }}>{transaction.date}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ fontFamily: "monospace", fontSize: "13px" }}>
                        {transaction.bookingRef}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ fontWeight: "600" }}>{transaction.customerName}</span>
                    </td>
                    <td style={styles.tableCell}>{transaction.serviceType}</td>
                    <td style={styles.tableCell}>
                      ₱{transaction.amountCharged.toLocaleString()}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ color: "#9CA3AF" }}>
                        -₱{transaction.platformFee.toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {transaction.tips > 0 ? (
                        <span style={{ color: "#00BF63", fontWeight: "600" }}>
                          +₱{transaction.tips.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: "#9CA3AF" }}>-</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          color: "#00BF63",
                          fontWeight: "700",
                          fontSize: "15px",
                        }}
                      >
                        ₱{transaction.netEarnings.toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(transaction.status),
                        }}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        style={{ ...styles.viewLink, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#059669";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#00BF63";
                        }}
                      >
                        <Eye style={{ width: "14px", height: "14px" }} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "16px", padding: "32px",
            width: "100%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            position: "relative"
          }}>
            <button
              onClick={() => setSelectedTransaction(null)}
              style={{
                position: "absolute", top: "24px", right: "24px",
                background: "none", border: "none", cursor: "pointer",
                padding: "4px", borderRadius: "8px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <X style={{ width: "20px", height: "20px", color: "#6B7280" }} />
            </button>
            
            <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #F3F4F6" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>Transaction Detail</h2>
              <p style={{ fontSize: "14px", color: "#6B7280", fontFamily: "monospace" }}>{selectedTransaction.bookingRef}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "600" }}>Date</span>
                <span style={{ color: "#111827", fontSize: "14px", fontWeight: "600" }}>{selectedTransaction.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "600" }}>Customer</span>
                <span style={{ color: "#111827", fontSize: "14px", fontWeight: "600" }}>{selectedTransaction.customerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "600" }}>Service Type</span>
                <span style={{ color: "#111827", fontSize: "14px", fontWeight: "600" }}>{selectedTransaction.serviceType}</span>
              </div>
              <div style={{ borderTop: "1px dashed #E5E7EB", margin: "8px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "600" }}>Amount Charged</span>
                <span style={{ color: "#111827", fontSize: "14px", fontWeight: "600" }}>₱{selectedTransaction.amountCharged.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "600" }}>Platform Fee</span>
                <span style={{ color: "#EF4444", fontSize: "14px", fontWeight: "600" }}>-₱{selectedTransaction.platformFee.toLocaleString()}</span>
              </div>
              {selectedTransaction.tips > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "600" }}>Tips</span>
                  <span style={{ color: "#00BF63", fontSize: "14px", fontWeight: "600" }}>+₱{selectedTransaction.tips.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #E5E7EB" }}>
                <span style={{ color: "#111827", fontSize: "16px", fontWeight: "bold" }}>Net Earnings</span>
                <span style={{ color: "#00BF63", fontSize: "18px", fontWeight: "800" }}>₱{selectedTransaction.netEarnings.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              style={{ padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", border: "none", width: "100%", backgroundColor: "#F3F4F6", color: "#374151" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#E5E7EB"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
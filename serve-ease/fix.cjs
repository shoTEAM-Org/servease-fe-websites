const fs = require('fs');

const errors = [
  {"file": "src/app/components/BookingDetailsPage.tsx", "line": 9, "var": "Clock"},
  {"file": "src/app/components/BookingDetailsPage.tsx", "line": 17, "var": "DollarSign"},
  {"file": "src/app/components/BookingRequestDetailsPage.tsx", "line": 1, "var": "useState"},
  {"file": "src/app/components/CalendarPage.tsx", "line": 2, "var": "Users"},
  {"file": "src/app/components/CalendarPage.tsx", "line": 132, "var": "hasBooking"},
  {"file": "src/app/components/CalendarPage.tsx", "line": 139, "var": "hasBookingDate"},
  {"file": "src/app/components/CalendarPage.tsx", "line": 988, "var": "idx"},
  {"file": "src/app/components/CounterOfferModalPage.tsx", "line": 8, "var": "FileText"},
  {"file": "src/app/components/CounterOfferModalPage.tsx", "line": 11, "var": "X"},
  {"file": "src/app/components/CounterOfferModalPage.tsx", "line": 248, "var": "id"},
  {"file": "src/app/components/CounterOfferPage.tsx", "line": 2, "var": "FileText"},
  {"file": "src/app/components/EditServicesPricingPage.tsx", "line": 1, "var": "useEffect"},
  {"file": "src/app/components/EditServicesPricingPage.tsx", "line": 2, "var": "X"},
  {"file": "src/app/components/EditServicesPricingPage.tsx", "line": 2, "var": "ChevronDown"},
  {"file": "src/app/components/EditServicesPricingPage.tsx", "line": 2, "var": "CheckCircle2"},
  {"file": "src/app/components/EditServicesPricingPage.tsx", "line": 2, "var": "DollarSign"},
  {"file": "src/app/components/EditServicesPricingPage.tsx", "line": 198, "var": "handleSaveAll"},
  {"file": "src/app/components/Layout.tsx", "line": 2, "var": "DollarSign"},
  {"file": "src/app/components/MyBookingsPage.tsx", "line": 2, "var": "Phone"},
  {"file": "src/app/components/MyBookingsPage.tsx", "line": 2, "var": "MessageCircle"},
  {"file": "src/app/components/MyBookingsPage.tsx", "line": 2, "var": "Navigation"},
  {"file": "src/app/components/MyBookingsPage.tsx", "line": 2, "var": "CheckCircle"},
  {"file": "src/app/components/NotificationsPage.tsx", "line": 2, "var": "Clock"},
  {"file": "src/app/components/NotificationsPage.tsx", "line": 2, "var": "Filter"},
  {"file": "src/app/components/PortfolioManagementPage.tsx", "line": 2, "var": "X"},
  {"file": "src/app/components/PortfolioManagementPage.tsx", "line": 2, "var": "Upload"},
  {"file": "src/app/components/ProviderAnalyticsPage.tsx", "line": 12, "var": "RefreshCw"},
  {"file": "src/app/components/ProviderAnalyticsPage.tsx", "line": 17, "var": "TrendingDown"},
  {"file": "src/app/components/ProviderEarningsDetails.tsx", "line": 11, "var": "Calendar"},
  {"file": "src/app/components/ProviderHelpCenterPage.tsx", "line": 6, "var": "Banknote"},
  {"file": "src/app/components/ProviderPerformanceInsightsPage.tsx", "line": 110, "var": "cardHoverStyle"},
  {"file": "src/app/components/ProviderPerformanceInsightsPage.tsx", "line": 125, "var": "accentBarStyle"},
  {"file": "src/app/components/ProviderReviewsPage.tsx", "line": 10, "var": "Upload"},
  {"file": "src/app/components/ProviderReviewsPage.tsx", "line": 12, "var": "AlertCircle"},
  {"file": "src/app/components/ProviderSettingsPage.tsx", "line": 2, "var": "Smartphone"},
  {"file": "src/app/components/SetAvailabilityPage.tsx", "line": 106, "var": "recurringDaysOff"},
  {"file": "src/app/components/SetAvailabilityPage.tsx", "line": 106, "var": "setRecurringDaysOff"}
];

errors.forEach(({file, line, var: v}) => {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let row = lines[line - 1];
  
  if (['hasBooking', 'hasBookingDate', 'recurringDaysOff', 'setRecurringDaysOff', 'cardHoverStyle', 'accentBarStyle', 'handleSaveAll'].includes(v)) {
      row = '// ' + row;
  } else if (v === 'id' && file.includes('CounterOfferModalPage')) {
      row = '// ' + row;
  } else if (v === 'idx') {
      row = row.replace(/\(\s*item\s*,\s*idx\s*\)/, '(item)');
      row = row.replace(/\(\s*day\s*,\s*idx\s*\)/, '(day)');
      row = row.replace(/\(\s*(.*?)\s*,\s*idx\s*\)/, '($1)');
  } else {
      row = row.replace(new RegExp(`,{0,1}\\s*\\b${v}\\b\\s*,{0,1}`), (match) => {
          if (match.startsWith(',') && match.endsWith(',')) return ',';
          return '';
      });
      row = row.replace(/{\s*}/, '');
  }

  lines[line - 1] = row;
  fs.writeFileSync(file, lines.join('\n'));
});

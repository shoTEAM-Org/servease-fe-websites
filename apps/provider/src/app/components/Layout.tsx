import { Outlet, Link, useLocation } from 'react-router';
import { Home, Calendar, DollarSign, MessageSquare, Settings, BarChart3, Bell, User, Menu, Star, Search, HelpCircle, TrendingUp, Briefcase } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/d5c1631be6e8531539bd8040a765725f4a4ddc2c.png';
import { useProviderData } from '../context/ProviderDataContext';

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { providerData } = useProviderData();
  const unreadCount = 3;

  const providerName = providerData?.profile?.businessName || 'Service Provider';

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/provider/dashboard', icon: Home, label: 'Dashboard' },
      ]
    },
    {
      title: 'BOOKINGS',
      items: [
        { path: '/provider/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/provider/bookings', icon: Briefcase, label: 'My Bookings' },
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { path: '/provider/earningsdashboard', icon: BarChart3, label: 'Earnings' },
        { path: '/provider/reviews', icon: Star, label: 'Reviews' },
        { path: '/provider/performanceinsights', icon: TrendingUp, label: 'Performance Insights' },
        { path: '/provider/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { path: '/provider/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/provider/profile', icon: User, label: 'Profile' },
        { path: '/provider/settings', icon: Settings, label: 'Settings' },
        { path: '/provider/help-center', icon: HelpCircle, label: 'Help & Support' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <img src={logo} alt="ServEase" className="h-8" />
            <div className="hidden md:block ml-4">
              <p className="text-lg font-semibold text-gray-900">Welcome back, {providerName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>

            <div className="relative">
              <button 
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <p className="text-xs text-gray-400">{unreadCount} unread</p>
                      </div>
                      <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {/* Static Notifications */}
                      <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors bg-green-50/50">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-green-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">New Booking Request</p>
                            <p className="text-xs text-gray-500 mt-0.5">You have a new booking from Maria D.</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center ring-2 ring-green-100">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900">{providerName}</p>
                <p className="text-xs text-gray-500">Service Provider</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-30
          w-64 transition-transform duration-300 lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="p-4 pt-20 lg:pt-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold text-gray-400 mb-2 px-4">{section.title}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                          ${active 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
import { Outlet, Link, useLocation } from 'react-router';
import { Home, Calendar, MessageSquare, Settings, BarChart3, Bell, User, Menu, Star, Search, HelpCircle, TrendingUp, Briefcase, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/d5c1631be6e8531539bd8040a765725f4a4ddc2c.png';
import { useProviderData } from '../context/ProviderDataContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { profile } = useProviderData();
  const displayName = profile.businessName || 'Service Provider';

  const mockSearchData = [
    { title: 'Dashboard', type: 'Page', path: '/provider/dashboard' },
    { title: 'Calendar', type: 'Page', path: '/provider/calendar' },
    { title: 'My Bookings', type: 'Page', path: '/provider/bookings' },
    { title: 'Earnings Details', type: 'Page', path: '/provider/earningsdetails' },
    { title: 'Earnings Dashboard', type: 'Page', path: '/provider/earningsdashboard' },
    { title: 'Reviews', type: 'Page', path: '/provider/reviews' },
    { title: 'Settings', type: 'Page', path: '/provider/settings' },
    
    // Services
    { title: 'House Cleaning', type: 'Service', path: '/provider/edit-services' },
    { title: 'Plumbing', type: 'Service', path: '/provider/edit-services' },
    { title: 'Electrical', type: 'Service', path: '/provider/edit-services' },
    
    // Bookings
    { title: 'Emily Davis - Lawn Care', type: 'Booking', path: '/provider/bookings' },
    { title: 'John Miller - Deep Cleaning', type: 'Booking', path: '/provider/bookings' },
    { title: 'Sarah Johnson - Pet Grooming', type: 'Booking', path: '/provider/bookings' },
  ];

  const filteredResults = mockSearchData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <img src={logo.src} alt="ServEase" className="h-8" />
            <div className="hidden md:block ml-4">
              <p className="text-lg font-semibold text-gray-900">Welcome back, {displayName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Desktop Search Bar */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-80 relative group">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings, services, pages..."
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {searchQuery && (
                 <button onClick={() => setSearchQuery("")} className="absolute right-3 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                 </button>
              )}
              
              {/* Dropdown Results Overlay */}
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[400px] overflow-y-auto z-50 py-2">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result, idx) => (
                      <Link 
                        key={idx} 
                        to={result.path}
                        className="flex flex-col px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-900">{result.title}</span>
                        <span className="text-xs text-green-600 font-medium">{result.type}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              {isMobileSearchOpen ? <X className="w-6 h-6 text-gray-600" /> : <Search className="w-6 h-6 text-gray-600" />}
            </button>

            <Link 
              to="/provider/notifications"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full"></span>
            </Link>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-green-100 flex-shrink-0">
                {profile.profilePhotoUrl ? (
                  <ImageWithFallback
                    src={profile.profilePhotoUrl}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">Service Provider</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 sticky top-[73px] z-30 shadow-md">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3 relative">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
             {searchQuery && (
                 <button onClick={() => setSearchQuery("")} className="absolute right-3 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                 </button>
              )}
          </div>
          
          {searchQuery && (
            <div className="mt-2 bg-white max-h-[60vh] overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="space-y-1 py-2">
                  {filteredResults.map((result, idx) => (
                    <Link 
                      key={idx} 
                      to={result.path}
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm font-semibold text-gray-900">{result.title}</span>
                      <span className="text-xs text-green-600 font-medium">{result.type}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

import { useState } from 'react';
import { Bell, Calendar, DollarSign, MessageSquare, Info, Settings, Search, CheckCircle, Trash2, MoreVertical, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'system' | 'alert';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  priority?: 'high' | 'normal';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    description: 'Emily Davis has requested a "Deep Cleaning" session for tomorrow at 10:00 AM.',
    time: '2 mins ago',
    isRead: false,
    priority: 'high',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: 'You have received a payment of $85.00 from John Miller for "Lawn Maintenance".',
    time: '45 mins ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'Sarah Johnson sent you a message regarding the upcoming "Pet Grooming" appointment.',
    time: '2 hours ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Profile Verified',
    description: 'Congratulations! Your profile has been successfully verified by our team.',
    time: '5 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'alert',
    title: 'Upcoming Appointment',
    description: 'Reminder: Your appointment with Robert Smith starts in 1 hour.',
    time: '1 hour ago',
    isRead: false,
    priority: 'high',
  },
  {
    id: '6',
    type: 'booking',
    title: 'Booking Cancelled',
    description: 'The booking for "Tech Support" with David Lee has been cancelled by the customer.',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: '7',
    type: 'payment',
    title: 'Payout Processed',
    description: 'Your weekly payout of $1,240.50 has been processed and sent to your bank.',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: '8',
    type: 'system',
    title: 'New Platform Feature',
    description: 'Check out our new performance dashboard to track your business growth!',
    time: '2 days ago',
    isRead: true,
  }
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'bookings' | 'payments'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'bookings') return n.type === 'booking';
    if (activeFilter === 'payments') return n.type === 'payment';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'system': return <Info className="w-5 h-5 text-gray-600" />;
      case 'alert': return <Bell className="w-5 h-5 text-orange-600" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return 'bg-blue-50';
      case 'payment': return 'bg-green-50';
      case 'message': return 'bg-purple-50';
      case 'system': return 'bg-gray-50';
      case 'alert': return 'bg-orange-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-gray-500 mt-1">Stay updated with your latest business activity</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
            <Link 
              to="/provider/notification-preferences"
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm group"
              title="Notification Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl w-full sm:w-auto">
            {(['all', 'unread', 'bookings', 'payments'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${activeFilter === filter 
                    ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search notifications..."
              className="w-full bg-gray-50 border-none px-10 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`
                    p-6 flex gap-4 transition-all relative group
                    ${notification.isRead ? 'bg-white' : 'bg-green-50/30'}
                    hover:bg-gray-50/80
                  `}
                >
                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-gray-900 ${notification.isRead ? '' : 'text-green-950'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]"></span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700">High</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.description}
                    </p>
                    
                    {/* Conditional Action Buttons */}
                    {!notification.isRead && (
                      <div className="pt-2 flex items-center gap-3">
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-bold text-green-600 hover:text-green-700"
                        >
                          Mark as Read
                        </button>
                        {notification.type === 'booking' && (
                          <Link 
                            to="/provider/bookings"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            Review Request <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-550 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">No notifications found</h3>
                <p className="text-gray-500 text-sm">We'll notify you when something important happens.</p>
              </div>
              <button 
                onClick={() => setActiveFilter('all')}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-10">
          <Info className="w-3.5 h-3.5" />
          <span>Showing your activity for the last 30 days</span>
        </div>
      </div>

      {/* Styles for glassmorphism/shadows if needed */}
      <style>{`
        .text-red-550 { color: #f87171; }
      `}</style>
    </div>
  );
}

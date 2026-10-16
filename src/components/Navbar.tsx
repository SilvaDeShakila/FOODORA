import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useCart } from '../contexts/CartContext.js';
import { FoodoraLogo } from './FoodoraLogo.js';
import { api } from '../services/api.js';
import type { Notification } from '../types/index.js';
import {
  MapPin,
  ShoppingBag,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Tag,
  Store,
  Bike,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount, subtotalLkr, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Colombo 03');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const cities = [
    'Colombo 03 (Kollupitiya)',
    'Colombo 07 (Cinnamon Gardens)',
    'Dehiwala',
    'Nugegoda',
    'Kandy City',
    'Galle Fort',
    'Negombo Beach',
    'Kurunegala',
    'Matara',
  ];

  useEffect(() => {
    if (user) {
      api.notifications
        .getAll()
        .then((res) => {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F14]/95 backdrop-blur-md border-b border-[#293241]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex-shrink-0">
              <FoodoraLogo size="md" />
            </Link>

            {/* City Selector Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B23] hover:bg-[#1C2530] border border-[#293241] text-xs font-semibold text-[#94A3B8] transition cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
              <select
                aria-label="Delivery City Location"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-[#F8FAFC] font-semibold focus:outline-hidden cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-[#151B23] text-[#F8FAFC]">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#94A3B8]">
            <Link
              to="/restaurants"
              className={`transition hover:text-[#D4AF37] ${
                location.pathname === '/restaurants' ? 'text-[#D4AF37] font-bold' : ''
              }`}
            >
              Explore Restaurants
            </Link>
            <Link
              to="/promotions"
              className={`flex items-center gap-1.5 transition hover:text-[#D4AF37] ${
                location.pathname === '/promotions' ? 'text-[#D4AF37] font-bold' : ''
              }`}
            >
              <Tag className="w-4 h-4 text-[#D4AF37]" />
              <span>Deals & Offers</span>
            </Link>

            {/* Role Dashboards Shortcuts */}
            {user?.role === 'restaurant_owner' && (
              <Link
                to="/owner/dashboard"
                className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#E8C66A] bg-[#1C2530] px-3 py-1 rounded-xl border border-[#D4AF37]/30 transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Restaurant Portal</span>
              </Link>
            )}

            {user?.role === 'rider' && (
              <Link
                to="/rider/dashboard"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-[#1C2530] px-3 py-1 rounded-xl border border-emerald-500/30 transition"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Portal</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 bg-[#1C2530] px-3 py-1 rounded-xl border border-purple-500/30 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Actions: Notifications, Cart, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#151B23] border border-transparent hover:border-[#293241] transition relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B0F14] text-[10px] font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#151B23] rounded-2xl shadow-2xl border border-[#293241] p-3.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#293241]">
                      <span className="font-bold text-xs text-[#F8FAFC]">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#94A3B8] py-3 text-center">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs transition border ${
                              n.read
                                ? 'bg-[#111720]/50 text-[#94A3B8] border-transparent'
                                : 'bg-[#1C2530] text-[#F8FAFC] font-medium border-[#D4AF37]/30'
                            }`}
                          >
                            <p className="font-bold text-[#F8FAFC]">{n.title}</p>
                            <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#151B23] hover:bg-[#1C2530] text-[#F8FAFC] text-xs sm:text-sm font-bold border border-[#293241] hover:border-[#D4AF37]/50 transition cursor-pointer shadow-sm"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-[#0B0F14] text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {itemCount > 0 ? `Rs. ${subtotalLkr.toLocaleString()}` : 'Cart'}
              </span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#151B23] hover:bg-[#1C2530] border border-[#293241] transition text-xs sm:text-sm font-semibold text-[#F8FAFC] cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]"
                  />
                  <span className="hidden md:inline max-w-[110px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#151B23] rounded-2xl shadow-2xl border border-[#293241] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-[#293241]">
                      <p className="font-bold text-sm text-[#F8FAFC] truncate">{user.name}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30 capitalize">
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="py-1 text-xs font-semibold text-[#94A3B8] space-y-0.5">
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1C2530] hover:text-[#F8FAFC] transition"
                      >
                        <User className="w-4 h-4 text-[#D4AF37]" />
                        My Account & Orders
                      </Link>

                      {user.role === 'restaurant_owner' && (
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1C2530] text-[#D4AF37] transition"
                        >
                          <Store className="w-4 h-4 text-[#D4AF37]" />
                          Owner Portal
                        </Link>
                      )}

                      {user.role === 'rider' && (
                        <Link
                          to="/rider/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1C2530] text-emerald-400 transition"
                        >
                          <Bike className="w-4 h-4 text-emerald-400" />
                          Rider Portal
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1C2530] text-purple-400 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          Super Admin Portal
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-950/40 text-red-400 transition text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#B89628] hover:opacity-95 text-[#0B0F14] text-xs sm:text-sm font-black shadow-md shadow-[#D4AF37]/20 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#151B23] transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111720] border-b border-[#293241] px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#151B23] border border-[#293241] text-xs font-semibold text-[#F8FAFC]">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <select
              aria-label="Delivery City Mobile"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-[#F8FAFC] font-semibold focus:outline-hidden w-full cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-[#151B23] text-[#F8FAFC]">
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-semibold text-[#94A3B8]">
            <Link
              to="/restaurants"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#151B23] hover:text-[#F8FAFC]"
            >
              Browse Restaurants
            </Link>
            <Link
              to="/promotions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#151B23] hover:text-[#D4AF37] flex items-center gap-2"
            >
              <Tag className="w-4 h-4 text-[#D4AF37]" />
              Sri Lankan Deals & Promo Codes
            </Link>
            {user && (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#151B23] hover:text-[#F8FAFC]"
              >
                My Account & Orders
              </Link>
            )}
            {user?.role === 'restaurant_owner' && (
              <Link
                to="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-[#1C2530] text-[#D4AF37]"
              >
                Owner Portal
              </Link>
            )}
            {user?.role === 'rider' && (
              <Link
                to="/rider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-[#1C2530] text-emerald-400"
              >
                Rider Portal
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-[#1C2530] text-purple-400"
              >
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

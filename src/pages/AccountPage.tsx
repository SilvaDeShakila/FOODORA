import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import type { Order, Address } from '../types/index.js';
import { OrderStatusBadge } from '../components/OrderStatusBadge.js';
import {
  User,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Shield,
  ShoppingBag,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address Modal/Form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('Colombo 03');
  const [newDistrict, setNewDistrict] = useState('Colombo');
  const [newLandmark, setNewLandmark] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, addrRes] = await Promise.all([
          api.orders.getMyOrders(),
          api.users.getAddresses(),
        ]);
        setOrders(ordersRes.orders);
        setAddresses(addrRes.addresses);
      } catch (err) {
        console.error('Account load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.users.updateProfile({ name, phone });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine || !newCity) return;

    try {
      const res = await api.users.addAddress({
        label: newLabel,
        addressLine: newAddressLine.trim(),
        city: newCity.trim(),
        district: newDistrict,
        landmark: newLandmark.trim() || undefined,
        isDefault: addresses.length === 0,
      });
      setAddresses(res.addresses);
      setShowAddAddress(false);
      setNewAddressLine('');
      setNewLandmark('');
    } catch (err: any) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await api.users.deleteAddress(addressId);
      setAddresses(res.addresses);
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      {/* Account Header Banner */}
      <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#E8C66A] text-[#0B0F14] flex items-center justify-center font-black text-2xl shadow-lg shadow-[#D4AF37]/20">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">{user?.name}</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40 capitalize">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#111720] rounded-2xl border border-[#293241] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#D4AF37] text-[#0B0F14] shadow-md font-black' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'addresses' ? 'bg-[#D4AF37] text-[#0B0F14] shadow-md font-black' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#D4AF37] text-[#0B0F14] shadow-md font-black' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#F8FAFC]">Your Order History</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-[#151B23] border border-[#293241] animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#151B23] border border-[#293241] space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#D4AF37] mx-auto" />
              <h3 className="font-bold text-base text-[#F8FAFC]">No Orders Yet</h3>
              <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
                Discover your favorite local dishes across Sri Lanka and place your first order.
              </p>
              <Link
                to="/restaurants"
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black rounded-xl inline-block transition"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#151B23] rounded-2xl p-5 border border-[#293241] hover:border-[#D4AF37]/50 shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#F8FAFC]">{ord.orderNumber}</span>
                      <OrderStatusBadge status={ord.status} size="sm" />
                      <span className="text-[11px] text-[#94A3B8]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#F8FAFC] truncate">
                      {ord.restaurantName}
                    </h4>

                    <p className="text-xs text-[#94A3B8] truncate max-w-md">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#293241]">
                    <div className="text-left md:text-right">
                      <span className="text-[#D4AF37] font-black text-base block">
                        Rs. {ord.totalLkr.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] uppercase">
                        {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${ord.id}`}
                      className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black transition flex items-center gap-1 shadow-md shadow-[#D4AF37]/10"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Delivery Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#F8FAFC]">Saved Delivery Addresses</h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-6 bg-[#151B23] rounded-3xl border border-[#D4AF37]/50 shadow-2xl space-y-4">
              <h3 className="font-bold text-sm text-[#F8FAFC]">New Sri Lankan Delivery Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Label</label>
                  <select
                    aria-label="Address Label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    placeholder="e.g. 18 Peradeniya Road"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Kandy, Colombo 03, Galle"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">District</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  placeholder="e.g. Near Queens Hotel"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black rounded-xl cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-[#151B23] rounded-2xl p-5 border border-[#293241] hover:border-[#D4AF37]/40 shadow-xl space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#F8FAFC]">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{addr.label}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#F8FAFC] font-medium">{addr.addressLine}</p>
                <p className="text-[11px] text-[#94A3B8]">{addr.city}, {addr.district}</p>
                {addr.landmark && (
                  <p className="text-[11px] text-[#D4AF37] italic">Landmark: {addr.landmark}</p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-[#94A3B8] hover:text-red-400 p-1 text-xs transition cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl space-y-6">
          <h2 className="text-xl font-black text-[#F8FAFC]">Profile Details</h2>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#1C2530] text-[#94A3B8] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#94A3B8] mt-1 block">Email address cannot be changed</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 transition cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
